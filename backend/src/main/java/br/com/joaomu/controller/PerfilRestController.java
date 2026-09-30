package br.com.joaomu.controller;

import br.com.joaomu.dto.auth.UsuarioResponse;
import br.com.joaomu.dto.perfil.AlterarSenhaRequest;
import br.com.joaomu.dto.perfil.AtualizarPerfilRequest;
import br.com.joaomu.dto.perfil.MeuComentarioResponse;
import br.com.joaomu.dto.perfil.MinhaResolucaoResponse;
import br.com.joaomu.dto.questao.QuestaoResponse;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.service.PerfilService;
import br.com.joaomu.service.UsuarioService;
import br.com.joaomu.service.integration.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.Map;

import java.util.List;

/**
 * Controller Especialista para a Gestão de Perfil e Atividades do Usuário Autenticado.
 * Centraliza o autoatendimento sob o recurso '/usuarios/me', mantendo compatibilidade
 * total com os endpoints consumidos pelo Frontend (Sidebar e Perfil).
 */
@RestController
@RequestMapping("/usuarios/me")
public class PerfilRestController {

    private final PerfilService perfilService;
    private final UploadService uploadService;
    private final UsuarioService usuarioService;

    public PerfilRestController(
            PerfilService perfilService,
            UploadService uploadService,
            UsuarioService usuarioService) {
        this.perfilService = perfilService;
        this.uploadService = uploadService;
        this.usuarioService = usuarioService;
    }

    // O POST de imagem de perfil fica aqui e não no MidiaController,
    // já que existe a mutação da entidade de negócio, e a entidade
    // Midia não tem um atributo público que recebe a referência
    // para o User.
    @PostMapping("/avatar")
    public ResponseEntity<UsuarioResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        String caminhoAvatar = uploadService.uploadImage(file);

        Usuario usuario = usuarioService.buscarPorUsername(username);
        usuario.setAvatar(caminhoAvatar);
        Usuario usuarioAtualizado = usuarioService.salvar(usuario);

        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuarioAtualizado));
    }

    @PutMapping
    public ResponseEntity<UsuarioResponse> atualizarPerfil(
            @Valid @RequestBody AtualizarPerfilRequest request,
            Authentication authentication) {
        Long usuarioId = resolverUsuarioId(authentication);
        Usuario usuarioAtualizado = usuarioService.atualizarPerfil(usuarioId, request);
        return ResponseEntity.ok(UsuarioResponse.fromEntity(usuarioAtualizado));
    }

    @PutMapping("/senha")
    public ResponseEntity<Map<String, String>> alterarSenha(
            @Valid @RequestBody AlterarSenhaRequest request,
            Authentication authentication) {
        Long usuarioId = resolverUsuarioId(authentication);
        usuarioService.alterarSenha(usuarioId, request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso!"));
    }

    /**
     * Retorna a lista de questões criadas pelo usuário autenticado.
     */
    @GetMapping("/questoes")
    public ResponseEntity<List<QuestaoResponse>> obterMinhasQuestoes(Authentication authentication) {
        Long usuarioId = resolverUsuarioId(authentication);
        return ResponseEntity.ok(perfilService.listarMinhasQuestoes(usuarioId));
    }

    /**
     * Retorna a lista de resoluções postadas pelo usuário autenticado.
     */
    @GetMapping("/resolucoes")
    public ResponseEntity<List<MinhaResolucaoResponse>> obterMinhasResolucoes(Authentication authentication) {
        Long usuarioId = resolverUsuarioId(authentication);
        return ResponseEntity.ok(perfilService.listarMinhasResolucoes(usuarioId));
    }

    /**
     * Retorna a lista de comentários realizados pelo usuário autenticado.
     */
    @GetMapping("/comentarios")
    public ResponseEntity<List<MeuComentarioResponse>> obterMeusComentarios(Authentication authentication) {
        Long usuarioId = resolverUsuarioId(authentication);
        return ResponseEntity.ok(perfilService.listarMeusComentarios(usuarioId));
    }

    /**
     * Resolve o ID do usuário de forma otimizada:
     * Lê diretamente da instância em memória do Spring Security quando disponível.
     */
    private Long resolverUsuarioId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Usuario usuario) {
            return usuario.getId();
        }
        return usuarioService.buscarPorUsername(authentication.getName()).getId();
    }
}
