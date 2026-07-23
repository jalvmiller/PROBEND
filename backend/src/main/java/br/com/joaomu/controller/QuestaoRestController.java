package br.com.joaomu.controller;

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
public class QuestaoRestController extends BaseRestController<Questao, Long> {

    // Injeção de dependências
    private final QuestaoService questaoService;
    private final GeminiService geminiService;

    // Construtor
    // Responsabilidade do service é atuar como cérebro, controller só serve como
    // I/O
    public QuestaoRestController(QuestaoService questaoService, GeminiService geminiService) {
        super(questaoService);
        this.questaoService = questaoService;
        this.geminiService = geminiService;
    }

    // Listagem trabalha com a busca (herdado do BaseRestController)
    // @PathVariable captura variáveis da URL, o Spring injeta ${id} na variável id
    // @RequestBody converte o body da requisição (vem em JSON) para um objeto Java

    // o status é passado via request param, o ? é obrigatório
    // o status true ou false vem pelo ?status=
    // esse metodo é chamado quando o usuário logado clica no botão de marcar como
    // solucionada e só funciona se o usuario logado for o autor da questão
    @PutMapping("/{id}/solucionada")
    public ResponseEntity<Questao> marcarSolucionada(@PathVariable Long id, @RequestParam boolean status) {
        try {
            Questao atualizada = questaoService.marcarComoSolucionada(id, status);
            return ResponseEntity.ok(atualizada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}/resolucoes")
    public ResponseEntity<List<Resolucao>> listarResolucoes(@PathVariable Long id) {
        return ResponseEntity.ok(questaoService.listarResolucoes(id));
    }

    @PostMapping("/{id}/resolucoes")
    public ResponseEntity<Resolucao> criarResolucao(@PathVariable Long id, @RequestBody Resolucao resolucao) {
        Resolucao salva = questaoService.salvarResolucao(id, resolucao);
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
            Questao salva = questaoService.validarQuestao(questao);
            return ResponseEntity.status(HttpStatus.CREATED).body(salva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao processar e salvar a questão gerada pela IA: " + e.getMessage()));
        }
    }
}