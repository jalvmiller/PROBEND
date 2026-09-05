package br.com.joaomu.controller;

import br.com.joaomu.dto.comentario.ComentarioResponse;
import br.com.joaomu.dto.comentario.ComentarioRequest;
import br.com.joaomu.entity.Comentario;
import br.com.joaomu.service.ComentarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RestController especializado na gestão de comentários em resoluções
// Mantém as rotas originais compatíveis com o frontend React
@RestController
@RequestMapping("/questoes")
public class ComentarioRestController {

    private final ComentarioService comentarioService;

    public ComentarioRestController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
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
                                             @Valid @RequestBody ComentarioRequest dto) {
        try {
            Comentario salvo = comentarioService.salvarComentario(resolucaoId, dto.toEntity());
            return ResponseEntity.status(HttpStatus.CREATED).body(ComentarioResponse.fromEntity(salvo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }
}
