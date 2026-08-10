package br.com.joaomu.service;

import br.com.joaomu.entity.Comentario;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.ComentarioRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import br.com.joaomu.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ResolucaoRepository resolucaoRepository;
    private final UsuarioRepository usuarioRepository;

    public ComentarioService(ComentarioRepository comentarioRepository,
                             ResolucaoRepository resolucaoRepository,
                             UsuarioRepository usuarioRepository) {
        this.comentarioRepository = comentarioRepository;
        this.resolucaoRepository = resolucaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Leitura pública — não requer autenticação
    public List<Comentario> listarPorResolucao(Long resolucaoId) {
        return comentarioRepository.findByResolucao_IdOrderByDataCriacaoAsc(resolucaoId);
    }

    // Criação requer autenticação (Spring Security garante via SecurityConfig)
    @Transactional
    public Comentario salvarComentario(Long resolucaoId, Comentario comentario) {
        Resolucao resolucao = resolucaoRepository.findById(resolucaoId)
                .orElseThrow(() -> new IllegalArgumentException("Resolução não encontrada: " + resolucaoId));

        // Pega o usuário autenticado pelo contexto de segurança
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("Usuário não autenticado");
        }

        Usuario autor = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Usuário autenticado não encontrado no banco"));

        if (comentario.getConteudo() == null || comentario.getConteudo().isBlank()) {
            throw new IllegalArgumentException("Conteúdo do comentário não pode estar vazio");
        }

        comentario.setResolucao(resolucao);
        comentario.setAutor(autor);

        return comentarioRepository.save(comentario);
    }
}
