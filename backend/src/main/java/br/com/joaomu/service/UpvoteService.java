package br.com.joaomu.service;

import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Upvote;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.UpvoteRepository;
import br.com.joaomu.repository.QuestaoRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import br.com.joaomu.repository.UsuarioRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UpvoteService {

    private final UpvoteRepository upvoteRepository;
    private final QuestaoRepository questaoRepository;
    private final ResolucaoRepository resolucaoRepository;
    private final UsuarioRepository usuarioRepository;

    public UpvoteService(UpvoteRepository upvoteRepository, QuestaoRepository questaoRepository,
            ResolucaoRepository resolucaoRepository, UsuarioRepository usuarioRepository) {
        this.upvoteRepository = upvoteRepository;
        this.questaoRepository = questaoRepository;
        this.resolucaoRepository = resolucaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalStateException("Usuário não autenticado");
        }
        return usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new IllegalStateException("Usuário não autenticado"));
    }
    // Uso de Authentication e SecurityContextHolder
    // .getContext() pega o contexto de segurança atual
    // .getAuthentication() pega a autenticação atual
    // .isAuthenticated() verifica se está autenticado
    // .getName() pega o nome de usuário

    // =====================================
    // =====================================
    // ========= Lógica de Questão =========
    // =====================================

    @Transactional
    public Map<String, Object> toggleUpvoteQuestao(Long questaoId) {
        Usuario usuario = getUsuarioLogado();

        Questao questao = questaoRepository.findById(questaoId)
                .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada"));

        Optional<Upvote> upvoteExistente = upvoteRepository.findByUsuarioAndQuestao(usuario, questao);

        boolean upvoted;
        if (upvoteExistente.isPresent()) {
            // Remove upvote e decrementa
            upvoteRepository.delete(upvoteExistente.get());

            // ? -> é um operador ternário, lembrar
            // true (verdadeiro) executa o que está antes dos dois pontos
            // false (falso) executa o que está depois dos dois pontos
            // Math.max() é uma função que retorna o maior valor entre dois números,
            // no caso, se upvotes não for nulo.. usa o valor real, caso seja nulo,
            // começa em 1.
            int atual = Math.max(0, (questao.getUpvotes() != null ? questao.getUpvotes() : 1) - 1);

            questao.setUpvotes(atual);
            upvoted = false;
        } else {
            // Adiciona upvote e incrementa
            Upvote novoUpvote = new Upvote();
            novoUpvote.setUsuario(usuario);
            novoUpvote.setQuestao(questao);
            upvoteRepository.save(novoUpvote);

            // Se upvotes for nulo, começa em 0 e soma 1, senão, soma 1 ao valor atual
            int atual = (questao.getUpvotes() != null ? questao.getUpvotes() : 0) + 1;

            questao.setUpvotes(atual);
            upvoted = true;
        }

        questaoRepository.save(questao);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("upvoted", upvoted);
        resposta.put("upvotes", questao.getUpvotes());

        return resposta;
    }

    // ======================================
    // ======================================
    // ========= Lógica de Resolução ========
    // ======================================

    @Transactional
    public Map<String, Object> toggleUpvoteResolucao(Long resolucaoId) {
        Usuario usuario = getUsuarioLogado();

        Resolucao resolucao = resolucaoRepository.findById(resolucaoId)
                .orElseThrow(() -> new IllegalArgumentException("Resolução não encontrada"));

        Optional<Upvote> upvoteExistente = upvoteRepository.findByUsuarioAndResolucao(usuario, resolucao);

        boolean upvoted;
        if (upvoteExistente.isPresent()) {
            upvoteRepository.delete(upvoteExistente.get());

            int atual = Math.max(0, (resolucao.getUpvotes() != null ? resolucao.getUpvotes() : 1) - 1);

            resolucao.setUpvotes(atual);
            upvoted = false;
        } else {
            // Mesma lógica anterior
            Upvote novoUpvote = new Upvote();
            novoUpvote.setUsuario(usuario);
            novoUpvote.setResolucao(resolucao);
            upvoteRepository.save(novoUpvote);

            // Se upvotes for nulo, começa em 0 e soma 1, senão, soma 1 ao valor atual
            int atual = (resolucao.getUpvotes() != null ? resolucao.getUpvotes() : 0) + 1;

            resolucao.setUpvotes(atual);
            upvoted = true;
        }
        resolucaoRepository.save(resolucao);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("upvotes", resolucao.getUpvotes());
        resposta.put("upvoted", upvoted);

        return resposta;
    }

    // ======================================
    // ======================================
    // ========= Busca de upvotes ===========
    // ======================================

    @Transactional(readOnly = true)
    public List<Long> getQuestaoUpvotedIdsDoUsuario() {
        Usuario usuario = getUsuarioLogado();

        // Usado para carregar a lista de upvotes
        // do usuário e converter para uma lista
        // de ids de questões

        // Esse método é utilitário, a implementação
        // em produção vai ser diferente com toda certeza
        // Query dedicada: busca apenas upvotes de questões do usuário,
        // evitando carregar upvotes de resoluções e filtrar em memória
        return upvoteRepository.findByUsuarioAndQuestaoIsNotNull(usuario).stream()
                .map(u -> u.getQuestao().getId())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Long> getResolucaoUpvotedIdsDoUsuario() {
        Usuario usuario = getUsuarioLogado();
        // Query dedicada: busca apenas upvotes de resoluções do usuário,
        // evitando carregar upvotes de questões e filtrar em memória
        return upvoteRepository.findByUsuarioAndResolucaoIsNotNull(usuario).stream()
                .map(u -> u.getResolucao().getId())
                .collect(Collectors.toList());
    }
}