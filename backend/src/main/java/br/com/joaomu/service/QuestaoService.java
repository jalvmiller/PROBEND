package br.com.joaomu.service;

import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.User;
import br.com.joaomu.repository.QuestaoRepository;
import br.com.joaomu.repository.ResolucaoRepository;
import br.com.joaomu.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class QuestaoService implements CrudService<Questao, Long> {

    // QuestaoService recebe dados brutos do Controller
    // Realiza validações de negócio
    // Interage com o banco de dados via repository
    // Retorna os dados para o Controller
    private final QuestaoRepository repository;
    private final UserRepository userRepository;
    private final ResolucaoRepository resolucaoRepository;

    private final ResolucaoService resolucaoService;

    public QuestaoService(QuestaoRepository repository, UserRepository userRepository,
            ResolucaoRepository resolucaoRepository, ResolucaoService resolucaoService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.resolucaoRepository = resolucaoRepository;
        this.resolucaoService = resolucaoService;
    }

    public void validarDificuldade(Questao questao) {
        if (questao.getDificuldade() == null || questao.getDificuldade() < 0 || questao.getDificuldade() > 2) {
            System.out.println("\nDificuldade inválida, a dificuldade será fácil por padrão.\n");

            questao.setDificuldade(0);
        }
    }

    // Cadastrar nova questão com as regras de negócio, exceções
    @Transactional
    public Questao validarQuestao(Questao questao) {
        if (questao.getEnunciado() == null || questao.getEnunciado().isBlank()) {
            throw new IllegalArgumentException("Uso de enunciado é obrigatório");
        }

        // VALIDAÇÃO 4: Matéria obrigatória
        if (questao.getMateria() == null || questao.getMateria().isBlank()) {
            throw new IllegalArgumentException("Matéria é obrigatória!");
        }

        // VALIDAÇÃO 5: Questões difíceis precisam ter fonte
        if (questao.getDificuldade() != null && questao.getDificuldade() == 2) {
            if (questao.getFonte() == null || questao.getFonte().isBlank()) {
                throw new IllegalArgumentException("Questões de dificuldade alta precisam ter fonte!");
            }
        }

        // Atribuir autor logado se não estiver explicitado
        if (questao.getAutor() == null) {
            // Uso getAuthentication() para pegar o usuário logado
            // o "anonymousUser" é um usuário padrão do Spring Security que representa um
            // usuário não logado Se o usuário for diferente disso, ele está logado e
            // pega-se o autor por username
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                User loggedInUser = userRepository.findByUsername(auth.getName()).orElse(null);
                questao.setAutor(loggedInUser);
            }
        }

        // Se passou todas as validações, salva
        return repository.save(questao);
    }

    @Transactional
    public Questao marcarComoSolucionada(Long id, boolean status) {
        Questao questao = buscarPorId(id);

        // Pegar contexto do usuário autenticado (JWT)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }

        // auth.getName() = nome que vem pelo JWT, é igual ao que está no banco
        if (questao.getAutor() == null || !questao.getAutor().getUsername().equals(auth.getName())) {
            throw new IllegalArgumentException("Usuário não autorizado!");
        }

        questao.setSolucionada(status);
        return repository.save(questao);
    }

    @Transactional
    public Questao atualizarQuestao(Questao questao) {
        Questao existente = repository.findById(questao.getId())
                .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + questao.getId()));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new SecurityException("Usuário não autenticado");
        }

        if (existente.getAutor() == null || !existente.getAutor().getUsername().equals(auth.getName())) {
            throw new SecurityException("Você não tem permissão para alterar esta questão");
        }

        existente.setEnunciado(questao.getEnunciado());
        existente.setImagemUrl(questao.getImagemUrl());
        existente.setMateria(questao.getMateria());
        existente.setAssunto(questao.getAssunto());
        existente.setDificuldade(questao.getDificuldade());
        existente.setFonte(questao.getFonte());
        existente.setTrechoCodigo(questao.getTrechoCodigo());
        existente.setLinguagemCodigo(questao.getLinguagemCodigo());

        return repository.save(existente);
    }

    @Override
    @Transactional
    public Questao salvar(Questao entity) {
        return validarQuestao(entity);
    }

    @Override
    @Transactional
    public Questao atualizar(Long id, Questao entity) {
        entity.setId(id);
        return atualizarQuestao(entity);
    }

    // findAll
    @Override
    public List<Questao> listarTodos() {
        return repository.findAll();
    }

    // método ficou bem mais compacto
    @Override
    public Questao buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + id));
    }

    @Override
    @Transactional
    public void remover(Long id) {
        Questao questao = buscarPorId(id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new SecurityException("Usuário não autenticado");
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && (questao.getAutor() == null || !questao.getAutor().getUsername().equals(auth.getName()))) {
            throw new SecurityException("Você não tem permissão para remover esta questão");
        }

        repository.delete(questao);
    }

    public List<Questao> buscarPorMateria(String materia) {
        if (materia == null || materia.isBlank()) {
            throw new IllegalArgumentException("Matéria inválida");
        }

        return repository.findByMateriaIgnoreCase(materia);
    }

    public List<Questao> buscarPorDificuldade(Integer dificuldade) {
        if (dificuldade == null || dificuldade < 0 || dificuldade > 2) {
            throw new IllegalArgumentException("A dificuldade deve estar entre: 0 (fácil) - 1 (média) - 2 (difícil");
        }

        return repository.findByDificuldade(dificuldade);
    }

    public List<Questao> buscarPorAssunto(String assunto) {
        if (assunto == null || assunto.isBlank()) {
            throw new IllegalArgumentException("Assunto inválido");
        }

        return repository.findByAssuntoIgnoreCase(assunto);
    }

    @Override
    public List<Questao> buscarPorTermo(String termo) {
        if (termo == null || termo.isBlank()) {
            return repository.findAll();
        }
        return repository.search(termo);
    }

    public List<Resolucao> listarResolucoes(Long questaoId) {
        return resolucaoRepository.findByQuestaoId(questaoId);
    }

    @Transactional
    public Resolucao salvarResolucao(Long questaoId, Resolucao resolucao) {
        Questao questao = buscarPorId(questaoId);
        resolucao.setQuestao(questao);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            User loggedInUser = userRepository.findByUsername(auth.getName()).orElse(null);

            resolucao.setAutor(loggedInUser);
        }

        Resolucao resolucaoSalva = resolucaoRepository.save(resolucao);

        resolucaoService.salvarResolucaoNotificar(resolucaoSalva, questao);

        return resolucaoSalva;
    }
}