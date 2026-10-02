package br.com.joaomu.service;

import br.com.joaomu.dto.trilha.*;
import br.com.joaomu.entity.*;
import br.com.joaomu.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrilhaService {

    private final TrilhaRepository trilhaRepository;
    private final ItemTrilhaRepository itemTrilhaRepository;
    private final InscricaoTrilhaRepository inscricaoTrilhaRepository;
    private final ProgressoItemTrilhaRepository progressoItemTrilhaRepository;
    private final QuestaoRepository questaoRepository;
    private final UsuarioRepository usuarioRepository;

    public TrilhaService(TrilhaRepository trilhaRepository,
                         ItemTrilhaRepository itemTrilhaRepository,
                         InscricaoTrilhaRepository inscricaoTrilhaRepository,
                         ProgressoItemTrilhaRepository progressoItemTrilhaRepository,
                         QuestaoRepository questaoRepository,
                         UsuarioRepository usuarioRepository) {
        this.trilhaRepository = trilhaRepository;
        this.itemTrilhaRepository = itemTrilhaRepository;
        this.inscricaoTrilhaRepository = inscricaoTrilhaRepository;
        this.progressoItemTrilhaRepository = progressoItemTrilhaRepository;
        this.questaoRepository = questaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario resolverUsuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return usuarioRepository.findByUsername(auth.getName()).orElse(null);
    }

    @Transactional
    public TrilhaAtivaResponse obterTrilhaAtiva(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        Optional<InscricaoTrilha> inscricaoOpt = inscricaoTrilhaRepository.findByUsuarioIdAndAtivaTrue(usuario.getId());
        if (inscricaoOpt.isEmpty() && usuario.isVisitor()) {
            List<InscricaoTrilha> existentes = inscricaoTrilhaRepository.findByUsuarioId(usuario.getId());
            if (existentes.isEmpty()) {
                List<Trilha> publicas = trilhaRepository.findByPublicaTrueOrderByCriadoEmDesc();
                if (!publicas.isEmpty()) {
                    Trilha padrao = publicas.get(0);
                    return ativarTrilha(padrao.getId(), usuario);
                }
            }
        }

        if (inscricaoOpt.isEmpty()) {
            return null;
        }

        Trilha trilha = inscricaoOpt.get().getTrilha();
        List<ItemTrilha> itens = itemTrilhaRepository.findByTrilhaIdOrderByOrdemAsc(trilha.getId());
        List<ProgressoItemTrilha> progressos = progressoItemTrilhaRepository
                .findByUsuarioIdAndItemTrilhaTrilhaId(usuario.getId(), trilha.getId());

        Set<Long> itensConcluidosIds = progressos.stream()
                .filter(ProgressoItemTrilha::isConcluido)
                .map(p -> p.getItemTrilha().getId())
                .collect(Collectors.toSet());

        List<ItemTrilhaSlotResponse> slots = itens.stream()
                .map(item -> new ItemTrilhaSlotResponse(
                        item.getId(),
                        item.getOrdem(),
                        item.getQuestao().getId(),
                        item.getQuestao().getEnunciado() != null && item.getQuestao().getEnunciado().length() > 60
                                ? item.getQuestao().getEnunciado().substring(0, 60) + "..."
                                : (item.getQuestao().getMateria() + " #" + item.getQuestao().getId()),
                        itensConcluidosIds.contains(item.getId())
                ))
                .toList();

        int total = slots.size();
        int concluidas = (int) slots.stream().filter(ItemTrilhaSlotResponse::concluida).count();

        return new TrilhaAtivaResponse(trilha.getId(), trilha.getTitulo(), total, concluidas, slots);
    }

    @Transactional
    public TrilhaAtivaResponse ativarTrilha(Long trilhaId, Usuario usuario) {
        if (usuario == null) {
            throw new IllegalStateException("Usuário precisa estar autenticado para ativar uma trilha");
        }

        Trilha trilha = trilhaRepository.findById(trilhaId)
                .orElseThrow(() -> new IllegalArgumentException("Trilha não encontrada com ID: " + trilhaId));

        if (!trilha.isPublica() && !trilha.getAutor().getId().equals(usuario.getId())) {
            throw new SecurityException("Você não tem acesso a esta trilha privada");
        }

        // Desativa qualquer trilha atualmente ativa do usuário
        inscricaoTrilhaRepository.findByUsuarioIdAndAtivaTrue(usuario.getId())
                .ifPresent(inscricao -> {
                    inscricao.setAtiva(false);
                    inscricaoTrilhaRepository.save(inscricao);
                });

        // Ativa ou cria a inscrição para a nova trilha
        InscricaoTrilha inscricao = inscricaoTrilhaRepository
                .findByUsuarioIdAndTrilhaId(usuario.getId(), trilha.getId())
                .orElseGet(() -> new InscricaoTrilha(usuario, trilha, true));

        inscricao.setAtiva(true);
        inscricaoTrilhaRepository.save(inscricao);

        return obterTrilhaAtiva(usuario);
    }

    @Transactional
    public void desativarTrilha(Long trilhaId, Usuario usuario) {
        if (usuario == null) {
            return;
        }

        inscricaoTrilhaRepository.findByUsuarioIdAndTrilhaId(usuario.getId(), trilhaId)
                .ifPresent(inscricao -> {
                    inscricao.setAtiva(false);
                    inscricaoTrilhaRepository.save(inscricao);
                });
    }

    @Transactional
    public TrilhaAtivaResponse alternarConclusaoItem(Long trilhaId, Long itemId, Usuario usuario) {
        if (usuario == null) {
            throw new IllegalStateException("Usuário precisa estar autenticado");
        }

        ItemTrilha item = itemTrilhaRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item da trilha não encontrado: " + itemId));

        if (!item.getTrilha().getId().equals(trilhaId)) {
            throw new IllegalArgumentException("O item não pertence à trilha especificada");
        }

        ProgressoItemTrilha progresso = progressoItemTrilhaRepository
                .findByUsuarioIdAndItemTrilhaId(usuario.getId(), item.getId())
                .orElseGet(() -> new ProgressoItemTrilha(usuario, item, false));

        progresso.setConcluido(!progresso.isConcluido());
        progressoItemTrilhaRepository.save(progresso);

        return obterTrilhaAtiva(usuario);
    }

    @Transactional
    public TrilhaAtivaResponse alternarConclusaoPorQuestao(Long questaoId, Usuario usuario) {
        if (usuario == null) {
            throw new IllegalStateException("Usuário precisa estar autenticado");
        }

        Optional<InscricaoTrilha> inscricaoOpt = inscricaoTrilhaRepository.findByUsuarioIdAndAtivaTrue(usuario.getId());
        if (inscricaoOpt.isEmpty()) {
            throw new IllegalStateException("Nenhuma trilha ativa encontrada para o usuário");
        }

        Trilha trilha = inscricaoOpt.get().getTrilha();
        ItemTrilha item = itemTrilhaRepository.findByTrilhaIdAndQuestaoId(trilha.getId(), questaoId)
                .orElseThrow(() -> new IllegalArgumentException("Esta questão não faz parte da sua trilha ativa"));

        return alternarConclusaoItem(trilha.getId(), item.getId(), usuario);
    }

    @Transactional
    public TrilhaResponse criarTrilha(TrilhaRequest request, Usuario usuario) {
        if (usuario == null) {
            throw new IllegalStateException("Usuário precisa estar autenticado para criar uma trilha");
        }

        Trilha trilha = new Trilha(
                request.titulo(),
                request.descricao(),
                usuario,
                request.publica() != null ? request.publica() : true
        );
        trilha = trilhaRepository.save(trilha);

        int ordem = 1;
        for (Long qId : request.questaoIds()) {
            Questao questao = questaoRepository.findById(qId)
                    .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + qId));
            itemTrilhaRepository.save(new ItemTrilha(trilha, questao, ordem++));
        }

        // Ativa a trilha automaticamente para o criador
        ativarTrilha(trilha.getId(), usuario);

        return buscarPorId(trilha.getId(), usuario);
    }

    @Transactional(readOnly = true)
    public List<TrilhaResponse> listarTrilhas(Usuario usuario) {
        List<Trilha> trilhas;
        if (usuario != null) {
            trilhas = trilhaRepository.listarVisiveisParaUsuario(usuario.getId());
        } else {
            trilhas = trilhaRepository.findByPublicaTrueOrderByCriadoEmDesc();
        }

        return trilhas.stream()
                .map(t -> TrilhaResponse.fromEntity(t, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public TrilhaResponse buscarPorId(Long id, Usuario usuario) {
        Trilha trilha = trilhaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trilha não encontrada com ID: " + id));

        if (!trilha.isPublica() && (usuario == null || !trilha.getAutor().getId().equals(usuario.getId()))) {
            throw new SecurityException("Você não tem permissão para visualizar esta trilha");
        }

        List<ItemTrilha> itens = itemTrilhaRepository.findByTrilhaIdOrderByOrdemAsc(trilha.getId());
        Set<Long> concluidosIds = Collections.emptySet();

        if (usuario != null) {
            concluidosIds = progressoItemTrilhaRepository
                    .findByUsuarioIdAndItemTrilhaTrilhaId(usuario.getId(), trilha.getId())
                    .stream()
                    .filter(ProgressoItemTrilha::isConcluido)
                    .map(p -> p.getItemTrilha().getId())
                    .collect(Collectors.toSet());
        }

        Set<Long> finalConcluidos = concluidosIds;
        List<ItemTrilhaResponse> itensResponse = itens.stream()
                .map(item -> new ItemTrilhaResponse(
                        item.getId(),
                        item.getOrdem(),
                        item.getQuestao().getId(),
                        item.getQuestao().getEnunciado(),
                        item.getQuestao().getMateria(),
                        item.getQuestao().getAssunto(),
                        item.getQuestao().getDificuldade(),
                        finalConcluidos.contains(item.getId())
                ))
                .toList();

        return TrilhaResponse.fromEntity(trilha, itensResponse);
    }

    @Transactional
    public void removerTrilha(Long id, Usuario usuario) {
        if (usuario == null) {
            throw new IllegalStateException("Usuário não autenticado");
        }

        Trilha trilha = trilhaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trilha não encontrada com ID: " + id));

        if (!trilha.getAutor().getId().equals(usuario.getId())) {
            throw new SecurityException("Apenas o autor pode excluir a trilha");
        }

        trilhaRepository.delete(trilha);
    }
}
