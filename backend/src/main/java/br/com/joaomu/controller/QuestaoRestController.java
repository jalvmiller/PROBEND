package br.com.joaomu.controller;

import br.com.joaomu.dto.entity.ComentarioResponse;
import br.com.joaomu.dto.entity.QuestaoResponse;
import br.com.joaomu.dto.entity.ResolucaoResponse;
import br.com.joaomu.entity.Comentario;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.service.ComentarioService;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.UpvoteService;
import br.com.joaomu.service.integration.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// RestController = Controller + ResponseBody
// Diz pro Spring que a classe lidará com requisições web e que o retorno
// dos métodos tem que ser escrito no corpo da resposta HTTP em formato JSON
// ao invés de renderizar um arquivo HTML
@RestController
// Define a rota base do Controller
@RequestMapping("/questoes")
public class QuestaoRestController {

    // Injeção de dependências
    private final QuestaoService questaoService;
    private final GeminiService geminiService;
    private final UpvoteService upvoteService;
    private final ComentarioService comentarioService;

    // Construtor
    // Responsabilidade do service é atuar como cérebro, controller só serve como
    // I/O
    public QuestaoRestController(QuestaoService questaoService,
            GeminiService geminiService,
            UpvoteService upvoteService,
            ComentarioService comentarioService) {
        this.questaoService = questaoService;
        this.geminiService = geminiService;
        this.upvoteService = upvoteService;
        this.comentarioService = comentarioService;
    }

    // Listagem trabalha com a busca por termo opcional (?busca=...)
    // @PathVariable captura variáveis da URL, o Spring injeta ${id} na variável id
    // @RequestBody converte o body da requisição (vem em JSON) para um objeto Java
    @GetMapping
    public ResponseEntity<List<QuestaoResponse>> listarTodas(@RequestParam(required = false) String busca) {
        List<Questao> questoes;
        if (busca != null && !busca.isBlank()) {
            questoes = questaoService.buscarPorTermo(busca);
        } else {
            questoes = questaoService.listarTodos();
        }
        List<QuestaoResponse> response = questoes.stream()
                .map(QuestaoResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestaoResponse> buscarPorId(@PathVariable Long id) {
        Questao questao = questaoService.buscarPorId(id);
        return ResponseEntity.ok(QuestaoResponse.fromEntity(questao));
    }

    @PostMapping
    public ResponseEntity<QuestaoResponse> criar(@RequestBody Questao entity) {
        Questao salva = questaoService.salvar(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(QuestaoResponse.fromEntity(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Questao entity) {
        try {
            Questao atualizada = questaoService.atualizar(id, entity);
            return ResponseEntity.ok(QuestaoResponse.fromEntity(atualizada));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable Long id) {
        try {
            questaoService.remover(id);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // o status é passado via request param, o ? é obrigatório
    // o status true ou false vem pelo ?status=
    // esse metodo é chamado quando o usuário logado clica no botão de marcar como
    // solucionada e só funciona se o usuario logado for o autor da questão
    @PutMapping("/{id}/solucionada")
    public ResponseEntity<QuestaoResponse> marcarSolucionada(@PathVariable Long id, @RequestParam boolean status) {
        try {
            Questao atualizada = questaoService.marcarComoSolucionada(id, status);
            return ResponseEntity.ok(QuestaoResponse.fromEntity(atualizada));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}/resolucoes")
    public ResponseEntity<List<ResolucaoResponse>> listarResolucoes(@PathVariable Long id) {
        List<ResolucaoResponse> resolucoes = questaoService.listarResolucoes(id).stream()
                .map(ResolucaoResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(resolucoes);
    }

    @PostMapping("/{id}/resolucoes")
    public ResponseEntity<ResolucaoResponse> criarResolucao(@PathVariable Long id, @RequestBody Resolucao resolucao) {
        Resolucao salva = questaoService.salvarResolucao(id, resolucao);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResolucaoResponse.fromEntity(salva));
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
            return ResponseEntity.status(HttpStatus.CREATED).body(QuestaoResponse.fromEntity(salva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erro", "Erro ao processar e salvar a questão gerada pela IA: " + e.getMessage()));
        }
    }

    // ======================================
    // ========= Métodos de Upvote ==========
    // ======================================

    // =============================================
    // ======== Upvote de Questão ==================
    // =============================================

    @PostMapping("/{id}/upvote")
    public ResponseEntity<?> upvoteQuestao(@PathVariable Long id) {
        try {
            Map<String, Object> resultado = upvoteService.toggleUpvoteQuestao(id);
            return ResponseEntity.ok(resultado);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/meus-upvotes")
    public ResponseEntity<?> meusUpvotes() {
        try {
            return ResponseEntity.ok(upvoteService.getQuestaoUpvotedIdsDoUsuario());
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.List.of());
        }
    }

    // ======================================================
    // ======== Upvote de Resolução =========================
    // ======================================================

    @PostMapping("/resolucoes/{id}/upvote")
    public ResponseEntity<?> upvoteResolucao(@PathVariable Long id) {
        try {
            Map<String, Object> resultado = upvoteService.toggleUpvoteResolucao(id);
            return ResponseEntity.ok(resultado);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/resolucoes/meus-upvotes")
    public ResponseEntity<?> meusUpvotesResolucoes() {
        try {
            return ResponseEntity.ok(upvoteService.getResolucaoUpvotedIdsDoUsuario());
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.List.of());
        }
    }

    // ======================================================
    // ======== Comentários em Resoluções ===================
    // ======================================================

    // GET público — qualquer pessoa pode ler os comentários
    @GetMapping("/resolucoes/{resolucaoId}/comentarios")
    public ResponseEntity<List<ComentarioResponse>> listarComentarios(@PathVariable Long resolucaoId) {
        List<ComentarioResponse> comentarios = comentarioService.listarPorResolucao(resolucaoId).stream()
                .map(ComentarioResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(comentarios);
    }

    // POST autenticado — apenas usuários logados podem comentar
    @PostMapping("/resolucoes/{resolucaoId}/comentarios")
    public ResponseEntity<?> criarComentario(@PathVariable Long resolucaoId,
                                             @RequestBody Comentario comentario) {
        try {
            Comentario salvo = comentarioService.salvarComentario(resolucaoId, comentario);
            return ResponseEntity.status(HttpStatus.CREATED).body(ComentarioResponse.fromEntity(salvo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }

}