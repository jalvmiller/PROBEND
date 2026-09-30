package br.com.joaomu.service;

import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.UsuarioRepository;

import br.com.joaomu.dto.perfil.AlterarSenhaRequest;
import br.com.joaomu.dto.perfil.AtualizarPerfilRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService implements CrudService<Usuario, Long> {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));
    }

    @Override
    public Usuario salvar(Usuario entity) {
        return usuarioRepository.save(entity);
    }

    @Override
    public Usuario atualizar(Long id, Usuario entity) {
        // Verifica se o usuário autenticado é o dono do recurso
        String usernameAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario existente = buscarPorId(id);

        if (!existente.getUsername().equals(usernameAutenticado)) {
            throw new SecurityException("Você não tem permissão para editar este usuário.");
        }

        if (entity.getNome() != null) {
            existente.setNome(entity.getNome());
        }
        if (entity.getEmail() != null) {
            existente.setEmail(entity.getEmail());
        }
        if (entity.getUsername() != null) {
            existente.setUsername(entity.getUsername());
        }
        return usuarioRepository.save(existente);
    }

    @Override
    public void remover(Long id) {
        // Verifica se o usuário autenticado é o dono do recurso
        String usernameAutenticado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario existente = buscarPorId(id);

        if (!existente.getUsername().equals(usernameAutenticado)) {
            throw new SecurityException("Você não tem permissão para remover este usuário.");
        }

        usuarioRepository.deleteById(id);
    }

    @Override
    public List<Usuario> buscarPorTermo(String busca) {
        if (busca != null && !busca.isBlank()) {
            //
            return usuarioRepository.findByUsername(busca).map(List::of).orElseGet(List::of);
        }
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }

    public Usuario atualizarPerfil(Long id, AtualizarPerfilRequest request) {
        Usuario existente = buscarPorId(id);
        existente.setNome(request.nome());
        existente.setEmail(request.email());
        return usuarioRepository.save(existente);
    }

    public void alterarSenha(Long id, AlterarSenhaRequest request) {
        Usuario existente = buscarPorId(id);

        if (!passwordEncoder.matches(request.senhaAtual(), existente.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }

        if (!request.novaSenha().equals(request.confirmacaoSenha())) {
            throw new IllegalArgumentException("A confirmação da nova senha não confere.");
        }

        existente.setPassword(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(existente);
    }
}
