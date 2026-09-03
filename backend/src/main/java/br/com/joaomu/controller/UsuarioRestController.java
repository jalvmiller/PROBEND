package br.com.joaomu.controller;

import org.springframework.web.bind.annotation.*;
import br.com.joaomu.dto.UsuarioResponse;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.service.UsuarioService;
import br.com.joaomu.service.integration.UploadService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/usuarios")
public class UsuarioRestController {

    private final UploadService uploadService;
    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService, UploadService uploadService) {
        this.usuarioService = usuarioService;
        this.uploadService = uploadService;
    }

    // O POST de imagem de perfil fica aqui e não no MidiaController,
    // já que existe a mutação da entidade de negócio, e a entidade
    // Midia não tem um atributo público que recebe a referência
    // para o User.
    @PostMapping("/me/avatar")
    public ResponseEntity<UsuarioResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        String caminhoAvatar = uploadService.uploadImage(file);

        Usuario usuario = usuarioService.buscarPorUsername(username);
        usuario.setAvatar(caminhoAvatar);
        Usuario usuarioAtualizado = usuarioService.salvar(usuario);

        UsuarioResponse response = new UsuarioResponse(
                usuarioAtualizado.getId(),
                usuarioAtualizado.getUsername(),
                usuarioAtualizado.getNome(),
                usuarioAtualizado.getEmail(),
                usuarioAtualizado.getAvatar(),
                usuarioAtualizado.getPontos(),
                usuarioAtualizado.isEspecialista(),
                usuarioAtualizado.isAdministrador());

        return ResponseEntity.ok(response);
    }
}
