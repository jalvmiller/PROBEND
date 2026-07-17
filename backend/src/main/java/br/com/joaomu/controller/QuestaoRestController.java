package br.com.joaomu.controller;

import br.com.joaomu.service.UploadService;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import br.com.joaomu.model.Questao;
import br.com.joaomu.model.Resolucao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RestController = Controller + ResponseBody
// Diz pro Spring que a classe lidará com requisições web e que o retorno
// dos métodos tem que ser escrito no corpo da resposta HTTP em formato JSON
// ao invés de renderizar um arquivo HTML
@RestController
// Define a rota base do Controller
@RequestMapping("/questoes")
@CrossOrigin("*")
public class QuestaoRestController {

    // Injeção de dependências
    private final QuestaoService service;
    private final GeminiService geminiService;
    private final UploadService uploadService;
    private final S3Client s3Client;

    // Construtor
    // Responsabilidade do service é atuar como cérebro, controller só serve como
    // I/O
    public QuestaoRestController(
            QuestaoService service,
            GeminiService geminiService,
            UploadService uploadService,
            S3Client s3Client) {

        this.service = service;
        this.geminiService = geminiService;
        this.uploadService = uploadService;
        this.s3Client = s3Client;
    }

    // Listar nodas trabalha com a busca
    @GetMapping
    public ResponseEntity<List<Questao>> listarTodas(@RequestParam(required = false) String busca) {
        if (busca != null && !busca.isBlank()) {
            return ResponseEntity.ok(service.buscarPorTermo(busca));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Questao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
    // @PathVariable captura variáveis da URL, o Spring injeta ${id} na variável id

    @PostMapping
    public ResponseEntity<Questao> criar(@RequestBody Questao questao) {
        Questao salva = service.validarQuestao(questao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
    // @RequestBody converte o body da requisição (vem em JSON) para um objeto Java

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Questao questao) {
        try {
            questao.setId(id);
            Questao atualizada = service.atualizarQuestao(questao);
            return ResponseEntity.ok(atualizada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            service.remover(id);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/materia/{materia}")
    public ResponseEntity<List<Questao>> buscarPorMateria(@PathVariable String materia) {
        List<Questao> questoes = service.buscarPorMateria(materia);
        return ResponseEntity.ok(questoes);
    }

    @GetMapping("/dificuldade/{dificuldade}")
    public ResponseEntity<List<Questao>> buscarPorDificuldade(@PathVariable Integer dificuldade) {
        List<Questao> questoes = service.buscarPorDificuldade(dificuldade);
        return ResponseEntity.ok(questoes);
    }

    // o status é passado via request param, o ? é obrigatório
    // o status true ou false vem pelo ?status=
    // esse metodo é chamado quando o usuário logado clica no botão de marcar como
    // solucionada e só funciona se o usuario logado for o autor da questão
    @PutMapping("/{id}/solucionada")
    public ResponseEntity<Questao> marcarSolucionada(@PathVariable Long id, @RequestParam boolean status) {
        try {
            Questao atualizada = service.marcarComoSolucionada(id, status);
            return ResponseEntity.ok(atualizada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}/resolucoes")
    public ResponseEntity<List<Resolucao>> listarResolucoes(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarResolucoes(id));
    }

    @PostMapping("/{id}/resolucoes")
    public ResponseEntity<Resolucao> criarResolucao(@PathVariable Long id, @RequestBody Resolucao resolucao) {
        Resolucao salva = service.salvarResolucao(id, resolucao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    // Retorna a sugestão/rascunho de questão gerado pela IA em JSON
    // (não-persistente)
    @PostMapping("/ia-sugerir")
    public ResponseEntity<String> iaSugerir(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String rascunhoEnunciado = body.get("rascunhoEnunciado");
        String jsonResposta = geminiService.gerarSugestaoQuestao(prompt, rascunhoEnunciado);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(jsonResposta);
    }

    // Gera e salva uma nova questão no banco a partir da ideia fornecida pela IA
    // (persistente)
    @PostMapping("/ia-criar-total")
    public ResponseEntity<?> iaCriarTotal(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String jsonResposta = geminiService.gerarSugestaoQuestao(prompt, "");
        try {
            // Mapper é usado pra converter JSON em objeto Java,
            // ele cria uma instância de classe Questao
            // preenche seus atributos com os valores do JSON.
            // No GeminiService há o processo inverso,
            // ele pega o mapa Java (requestBody) e converte em texto JSON
            // antes de enviar pro Gemini
            ObjectMapper mapper = new ObjectMapper();
            Questao questao = mapper.readValue(jsonResposta, Questao.class);
            Questao salva = service.validarQuestao(questao);
            return ResponseEntity.status(HttpStatus.CREATED).body(salva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao processar e salvar a questão gerada pela IA: " + e.getMessage()));
        }
    }

    // ============================================================
    // Métodos que gerenciam o upload e download de imagens
    // ============================================================

    // Injeção do nome do bucket do MinIO configurado no application.properties;
    // necessário para o método obterImagem saber de qual bucket deve baixar
    // os bytes
    @Value("${minio.bucket-name}")
    private String bucketName;

    // Mapeamento de rota para o upload
    // Map<String, String> = <chave, valor>, usado pra retornar um JSON
    // @RequestParam = captura parâmetros do request
    // @MultipartFile = arquivo enviado no request
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImagem(@RequestParam("file") MultipartFile file) {
        try {
            // UploadImage(file): Envio do arquivo ao MinIO e retorno do caminho relativo
            String url = uploadService.uploadImage(file);

            // Retorna um JSON com a chave "imageUrl" e o valor do caminho relativo
            // com o prefixo "/api" porque as rotas do backend começam com /api/**
            // na configuração do CORS/ProxyFilter
            return ResponseEntity.ok(Map.of("imageUrl", "/api" + url));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao fazer upload da imagem: " + e.getMessage()));
        }
    }

    // Endpoint proxy para recuperar a imagem do MinIO de forma segura
    // Configura uma rota http dinâmica com {filename}, que representa o nome do
    // arquivo
    // salvo via UUID (do uploadImage)
    // @PathVariable retira o valor da URL {filename}
    // ResponseEntity<byte[]> = retorna os bytes da imagem
    // MediaType.parseMediaType = define o tipo de conteúdo (imagem)
    // objectBytes.response().contentType() = obtém o tipo de conteúdo do arquivo

    // GetObjectRequest.builder() = cria um construtor de GetObjectRequest
    // que cria a requisição de busca do arquivo no MinIO usando o bucket
    // ligado a key que é o arquivo gerado via UUID (do uploadImage)
    // .bucket(bucketName) = define o bucket (pasta)
    // .key(fileName) = define a chave (nome do arquivo)
    // .build() = constrói o objeto

    // s3Client.getObjectAsBytes(getObjectRequest) = obtém os bytes do arquivo
    // No final, há a leitura tipo de arquivo com o método "contentType"
    // (image/png, image/jpeg, etc) e a inserção no cabeçalho HTTP Content-Type
    // pelo mesmo.. isso faz com que o navegador saiba que deve renderizar a imagem
    // e não baixar um arquivo binário genérico
    // ResponseBytes<GetObjectResponse> = wrapper que contém os bytes e a response
    @GetMapping("/imagens/{fileName}")
    public ResponseEntity<byte[]> obterImagem(@PathVariable String fileName) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(objectBytes.response().contentType()))
                    .body(objectBytes.asByteArray());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}