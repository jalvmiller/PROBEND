package br.com.joaomu.controller;

import br.com.joaomu.dto.trilha.*;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.service.TrilhaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trilhas")
public class TrilhaRestController {

    private final TrilhaService trilhaService;

    public TrilhaRestController(TrilhaService trilhaService) {
        this.trilhaService = trilhaService;
    }

    @GetMapping
    public ResponseEntity<List<TrilhaResponse>> listar() {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        return ResponseEntity.ok(trilhaService.listarTrilhas(usuario));
    }

    @GetMapping("/ativa")
    public ResponseEntity<TrilhaAtivaResponse> obterAtiva() {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        if (usuario == null) {
            return ResponseEntity.noContent().build();
        }

        TrilhaAtivaResponse ativa = trilhaService.obterTrilhaAtiva(usuario);
        if (ativa == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(ativa);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrilhaResponse> buscarPorId(@PathVariable Long id) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        return ResponseEntity.ok(trilhaService.buscarPorId(id, usuario));
    }

    @PostMapping
    public ResponseEntity<TrilhaResponse> criar(@Valid @RequestBody TrilhaRequest request) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        TrilhaResponse criada = trilhaService.criarTrilha(request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PostMapping("/{id}/ativar")
    public ResponseEntity<TrilhaAtivaResponse> ativar(@PathVariable Long id) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        TrilhaAtivaResponse ativa = trilhaService.ativarTrilha(id, usuario);
        return ResponseEntity.ok(ativa);
    }

    @PostMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        trilhaService.desativarTrilha(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{trilhaId}/itens/{itemId}/conclusao", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<TrilhaAtivaResponse> alternarConclusaoItem(@PathVariable Long trilhaId,
                                                                    @PathVariable Long itemId) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        TrilhaAtivaResponse atualizada = trilhaService.alternarConclusaoItem(trilhaId, itemId, usuario);
        return ResponseEntity.ok(atualizada);
    }

    @RequestMapping(value = "/questoes/{questaoId}/conclusao", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<TrilhaAtivaResponse> alternarConclusaoPorQuestao(@PathVariable Long questaoId) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        TrilhaAtivaResponse atualizada = trilhaService.alternarConclusaoPorQuestao(questaoId, usuario);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        Usuario usuario = trilhaService.resolverUsuarioAtual();
        trilhaService.removerTrilha(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
