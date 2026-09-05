package br.com.joaomu.controller;

import br.com.joaomu.dto.questao.QuestaoResponse;
import br.com.joaomu.dto.questao.QuestaoRequest;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.UpvoteService;
import jakarta.validation.Valid;

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
    private final UpvoteService upvoteService;

    // Construtor
    // Responsabilidade do service é atuar como cérebro, controller só serve como
    // I/O
    public QuestaoRestController(QuestaoService questaoService,
            UpvoteService upvoteService) {
        this.questaoService = questaoService;
        this.upvoteService = upvoteService;
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
    public ResponseEntity<QuestaoResponse> criar(@Valid @RequestBody QuestaoRequest dto) {
        Questao salva = questaoService.salvar(dto.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(QuestaoResponse.fromEntity(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody QuestaoRequest dto) {
        try {
            Questao atualizada = questaoService.atualizar(id, dto.toEntity());
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
}