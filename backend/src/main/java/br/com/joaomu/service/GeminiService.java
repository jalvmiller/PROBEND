package br.com.joaomu.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

	// Pega a API Key do arquivo application.properties via anotação
	@Value("${gemini.api.key:}")
	private String apiKey;

	// Pega o modelo do Gemini do arquivo application.properties via anotação
	@Value("${gemini.api.model:gemini-3.5-flash}")
	private String apiModel;


	// Inicializa o cliente HTTP com um timeout de 15 segundos, esse cliente é
	// padrão e vem da biblioteca java.net.http
	private final HttpClient httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(15))
			.build();

	// Usa o object Mapper da biblioteca Jackson para serializar o corpo da req e
	// para analisar a resposta da API do Gemini
	private final ObjectMapper objectMapper = new ObjectMapper();

	/**
	 * Gera uma sugestão estruturada de questão com base em uma ideia geral do
	 * usuário e, opcionalmente, em um rascunho existente
	 */
	public String gerarSugestaoQuestao(String promptUsuario, String rascunhoEnunciado) {
		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalStateException(
					"API Key do Gemini não configurada. Por favor, defina a variável de ambiente GEMINI_API_KEY");
		}

		String instrucoesPrompt = """
				Você é um professor e elaborador de questões acadêmicas para o PROBEND, um sistema de questões de exatas e programação.
				Sua tarefa é elaborar ou aprimorar uma questão com base nas instruções do usuário.
				A resposta DEVE ser exclusivamente um objeto JSON válido correspondente ao esquema abaixo.
				IMPORTANTE: Não retorne blocos de código markdown como ```json ... ``` ou qualquer texto explicativo antes ou depois. Retorne apenas o JSON puro para que possa ser parseado.

				Esquema JSON:
				{
				  "enunciado": "Texto do enunciado da questão em português. Use markdown para formatação. Para equações matemáticas e símbolos, utilize fórmulas em LaTeX delimitadas por $ para inline (ex: $x^2 = 4$) ou $$ para blocos destacados (ex: $$\\int x dx$$).",
				  "materia": "Nome da matéria principal (ex: Matemática, Física, Java, Banco de Dados, Algoritmos, etc.)",
				  "assunto": "Nome do assunto específico da matéria (ex: Derivadas, Leis de Newton, Orientação a Objetos, Joins, Loops, etc.)",
				  "dificuldade": 0 (para Fácil), 1 (para Médio) ou 2 (para Difícil). Regra: se dificuldade for 2, a fonte DEVE ser preenchida obrigatoriamente.,
				  "fonte": "Fonte da questão. Use 'Gerado por Gemini' se for criação do zero, ou indique uma fonte se sugerida pelo usuário.",
				  "trechoCodigo": "Código-fonte da questão se envolver programação ou algoritmos. Deixe em branco se for apenas teórica ou de exatas tradicionais.",
				  "linguagemCodigo": "Nome da linguagem em letras minúsculas (ex: java, python, javascript, sql, cpp, etc.) se trechoCodigo for preenchido, caso contrário deixe em branco."
				}
				""";

		// une o promptUsuario com o rascunhoEnunciado
		String entradaUsuario = "\n\nIdeia/Prompt do Usuário: " + promptUsuario;
		if (rascunhoEnunciado != null && !rascunhoEnunciado.isBlank()) {
			entradaUsuario += "\nRascunho do Enunciado Atual para Aprimoramento: " + rascunhoEnunciado;
		}

		// União do prompt base com as entradas do usuário
		String promptCompleto = instrucoesPrompt + entradaUsuario;

		try {
			String url = "https://generativelanguage.googleapis.com/v1beta/models/" + apiModel + ":generateContent?key="
					+ apiKey;
			// Monta a URL que será enviada para a API do Gemini
			// utiliza o endpoint oficial da Google API Studio para o modelo 1.5 do gemini,
			// passando a key via variável apiKey

			// Monta o corpo da requisição que será enviada para a API do Gemini
			// promptCompleto é a união do prompt base com a entrada do usuário
			// requestBody é um Map que representa o corpo da requisição que
			// será enviada para a API do Gemini
			// jsonPayload é uma string que representa o corpo da requisição que
			// será enviada para a API do Gemini
			// request é um HttpRequest que representa a requisição que será
			// enviada para a API do Gemini
			// a constante response é uma HttpResponse que representa a resposta que será
			// enviada pela API do Gemini
			Map<String, Object> requestBody = Map.of(
					"contents", List.of(
							Map.of("parts", List.of(
									Map.of("text", promptCompleto)))),
					"generationConfig", Map.of(
							"responseMimeType", "application/json"));
			// Estrutura:
			// Map(
			// "contents", List.of(
			// Map.of("parts", List.of(
			// Map.of("text", promptCompleto))))),
			// "generationConfig", Map.of(
			// "responseMimeType", "application/json"));
			// Sendo que o responseMimeType é "application/json" no campo generationConfig,
			// então o corpo da resposta será um JSON

			String jsonPayload = objectMapper.writeValueAsString(requestBody);

			// O método HttpRequest.newBuilder() cria um construtor de requisições HTTP
			// padrão Builder do java.net.http.HttpRequest
			// O método uri(URI.create(url)) define a URL da requisição
			// O método header("Content-Type", "application/json") define o cabeçalho
			// da requisição, indicando envio de JSON
			// O método POST(HttpRequest.BodyPublishers.ofString(jsonPayload)) define o
			// corpo da requisição e insere o JSON convertido em String
			// O método timeout(Duration.ofSeconds(30)) define o timeout da requisição
			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(url))
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
					.timeout(Duration.ofSeconds(30))
					.build();

			// envio de forma síncrona a requisição criada e aguarda a resposta
			// do servidor do Gemini, salvando em uma String
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

			// STATUS 200 -> obtém o corpo da resposta (response.body())
			// invoca o método auxiliar extrairTextoDaResposta()
			// invoca o método auxiliar limparMarkdownJson() para limpar o markdown do JSON
			// para que o JSON possa ser parseado pelo objectMapper.readTree()
			// e enviado de volta para o frontend
			if (response.statusCode() == 200) {
				String responseBody = response.body();
				String rawText = extrairTextoDaResposta(responseBody);
				return limparMarkdownJson(rawText);
			} else {
				throw new RuntimeException("Falha na chamada da API do Gemini. Status HTTP: " + response.statusCode()
						+ " - Resposta: " + response.body());
			}

		} catch (Exception e) {
			throw new RuntimeException("Erro ao conectar ou ler dados da API do Gemini: " + e.getMessage(), e);
		}
	}

	// método para extrair o texto da resposta da API do Gemini
	// candidates -> [0] -> content -> parts -> [0] -> text, essa é a árvore JSON
	// retornada pela API do Gemini.
	// Essa árvore representa o conteúdo gerado pelo modelo Gemini
	private String extrairTextoDaResposta(String responseBody) throws Exception {
		// O objectMapper.readTree(responseBody) converte o JSON retornado pela API do
		// Gemini em uma árvore JSON
		var rootNode = objectMapper.readTree(responseBody);
		// O path("candidates") seleciona o nó "candidates" da árvore JSON
		return rootNode.path("candidates")
				// O get(0) seleciona o primeiro elemento da lista "candidates"
				.get(0)
				// O path("content") seleciona o nó "content" do primeiro elemento da lista
				// "candidates"
				.path("content")
				.path("parts")
				.get(0)
				.path("text")
				// O asText() converte o nó "text" em uma string
				.asText();
	}

	// método para limpar o markdown do json
	private String limparMarkdownJson(String text) {
		if (text == null)
			return "{}";
		text = text.trim();
		if (text.startsWith("```json")) {
			text = text.substring(7);
		} else if (text.startsWith("```")) {
			text = text.substring(3);
		}
		if (text.endsWith("```")) {
			text = text.substring(0, text.length() - 3);
		}
		return text.trim();
	}
}