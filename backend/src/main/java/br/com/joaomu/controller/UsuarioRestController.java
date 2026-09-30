package br.com.joaomu.controller;

import org.springframework.web.bind.annotation.*;
import br.com.joaomu.dto.auth.UsuarioResponse;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.service.UsuarioService;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * Controller para operações e consultas gerais da entidade Usuário no sistema.
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuario));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos(@RequestParam(required = false) String busca) {
        List<Usuario> usuarios = (busca != null && !busca.isBlank())
                ? usuarioService.buscarPorTermo(busca)
                : usuarioService.listarTodos();

        List<UsuarioResponse> response = usuarios.stream()
                .map(UsuarioResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }
}
