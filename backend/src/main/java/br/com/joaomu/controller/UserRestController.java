package br.com.joaomu.controller;

import org.springframework.web.bind.annotation.*;
import br.com.joaomu.entity.User;
import br.com.joaomu.service.UserService;
import br.com.joaomu.service.UploadService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/usuarios")
public class UserRestController extends BaseRestController<User, Long> {

    private final UploadService uploadService;
    private final UserService userService;

    public UserRestController(UserService userService, UploadService uploadService) {
        super(userService);
        this.userService = userService;
        this.uploadService = uploadService;
    }

    // O POST de imagem de perfil fica aqui e não no MidiaController,
    // já que existe a mutação da entidade de negócio, e a entidade
    // Midia não tem um atributo público que recebe a referência
    // para o User.

    @PostMapping("/me/avatar")
    public ResponseEntity<User> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        String caminhoAvatar = uploadService.uploadImage(file);

        User user = userService.buscarPorUsername(username);
        user.setAvatar(caminhoAvatar);
        User userAtualizado = service.salvar(user);

        return ResponseEntity.ok(userAtualizado);
    }
}
