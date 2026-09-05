package br.com.joaomu.controller;

import br.com.joaomu.dto.entity.ResolucaoResponse;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.service.QuestaoService;
import br.com.joaomu.service.UpvoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RestController especializado no ciclo de vida e interações de Resoluções
// Mantém os mesmos caminhos de rota para total compatibilidade com o frontend
@RestController
@RequestMapping("/questoes")
public class ResolucaoRestController {

    private final QuestaoService questaoService;
    private final UpvoteService upvoteService;

    public ResolucaoRestController(QuestaoService questaoService, UpvoteService upvoteService) {
        this.questaoService = questaoService;
        this.upvoteService = upvoteService;
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
}
