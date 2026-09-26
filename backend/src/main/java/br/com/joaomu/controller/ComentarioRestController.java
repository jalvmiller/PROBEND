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

    // GET público — retorna a árvore hierárquica de comentários da resolução
    @GetMapping("/resolucoes/{resolucaoId}/comentarios")
    public ResponseEntity<List<ComentarioResponse>> listarComentarios(@PathVariable Long resolucaoId) {
        List<ComentarioResponse> arvore = comentarioService.listarArvorePorResolucao(resolucaoId);
        return ResponseEntity.ok(arvore);
    }

    // POST autenticado — apenas usuários logados podem comentar ou responder
    @PostMapping("/resolucoes/{resolucaoId}/comentarios")
    public ResponseEntity<?> criarComentario(@PathVariable Long resolucaoId,
            @Valid @RequestBody ComentarioRequest dto) {
        try {
            Comentario salvo = comentarioService.salvarComentario(resolucaoId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ComentarioResponse.fromEntity(salvo));
        } catch (IllegalArgumentException e) {
            HttpStatus status = e.getMessage() != null && e.getMessage().contains("não encontrada")
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(Map.of("erro", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }
}
