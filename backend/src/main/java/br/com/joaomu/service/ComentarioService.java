package br.com.joaomu.service;

import br.com.joaomu.dto.comentario.ComentarioRequest;
import br.com.joaomu.dto.comentario.ComentarioResponse;
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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    // Leitura pública em lista plana — não requer autenticação
    public List<Comentario> listarPorResolucao(Long resolucaoId) {
        return comentarioRepository.findByResolucao_IdOrderByDataCriacaoAsc(resolucaoId);
    }

    // Leitura pública, monta a hierarquia em memória O(N)
    public List<ComentarioResponse> listarArvorePorResolucao(Long resolucaoId) {
        List<Comentario> comentarios = listarPorResolucao(resolucaoId);
        return montarArvore(comentarios);
    }

    /**
     * Algoritmo de montagem da árvore hierárquica em tempo linear O(N).
     * Mapeia os nós raiz e aninha as respostas em seus respectivos nós pais,
     * preservando a ordenação cronológica sem disparar consultas extras ao banco.
     */
    public List<ComentarioResponse> montarArvore(List<Comentario> comentarios) {
        if (comentarios == null || comentarios.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, ComentarioResponse> mapa = new LinkedHashMap<>();
        List<ComentarioResponse> raizes = new ArrayList<>();

        // 1. Mapeia cada comentário para seu DTO com lista de respostas inicializada
        for (Comentario c : comentarios) {
            mapa.put(c.getId(), ComentarioResponse.fromEntity(c));
        }

        // 2. Constrói a árvore associando cada filho ao respectivo pai
        for (Comentario c : comentarios) {
            ComentarioResponse dto = mapa.get(c.getId());
            if (c.getPai() == null || c.getPai().getId() == null) {
                raizes.add(dto);
            } else {
                ComentarioResponse paiDto = mapa.get(c.getPai().getId());
                if (paiDto != null) {
                    paiDto.respostas().add(dto);
                } else {
                    // Fallback defensivo caso o pai pertença a outro contexto
                    raizes.add(dto);
                }
            }
        }

        return raizes;
    }

    private static final int LIMITE_MAXIMO_NIVEIS = 6;

    // Criação autenticada via DTO (suporta comentários raiz e respostas aninhadas)
    @Transactional
    public Comentario salvarComentario(Long resolucaoId, ComentarioRequest dto) {
        if (dto == null || dto.conteudo() == null || dto.conteudo().isBlank()) {
            throw new IllegalArgumentException("Conteúdo do comentário não pode estar vazio");
        }

        Resolucao resolucao = resolucaoRepository.findById(resolucaoId)
                .orElseThrow(() -> new IllegalArgumentException("Resolução não encontrada: " + resolucaoId));

        // Pega o usuário autenticado pelo contexto de segurança
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalStateException("Usuário não autenticado");
        }

        Usuario autor = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Usuário autenticado não encontrado no banco"));

        Comentario comentario = new Comentario();
        comentario.setConteudo(dto.conteudo().trim());
        comentario.setResolucao(resolucao);
        comentario.setAutor(autor);

        // Se for resposta aninhada, valida a existência do pai, integridade com a mesma resolução
        // e restrição de profundidade máxima de até 6 níveis
        if (dto.paiId() != null) {
            Comentario pai = comentarioRepository.findByIdAndResolucao_Id(dto.paiId(), resolucaoId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Comentário pai não encontrado nesta resolução: " + dto.paiId()));

            int profundidade = calcularProfundidade(pai);
            if (profundidade >= LIMITE_MAXIMO_NIVEIS) {
                throw new IllegalArgumentException(
                        "O limite máximo de " + LIMITE_MAXIMO_NIVEIS + " níveis de aninhamento foi atingido.");
            }

            comentario.setPai(pai);
        }

        return comentarioRepository.save(comentario);
    }

    private int calcularProfundidade(Comentario pai) {
        int nivel = 1;
        Comentario cursor = pai;
        while (cursor.getPai() != null) {
            nivel++;
            cursor = cursor.getPai();
        }
        return nivel;
    }

    // Sobrecarga de compatibilidade com entidade
    @Transactional
    public Comentario salvarComentario(Long resolucaoId, Comentario comentario) {
        if (comentario == null) {
            throw new IllegalArgumentException("Comentário não pode ser nulo");
        }
        return salvarComentario(resolucaoId, new ComentarioRequest(comentario.getConteudo(), comentario.getPaiId()));
    }
}
