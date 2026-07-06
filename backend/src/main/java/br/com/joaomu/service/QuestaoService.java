package br.com.joaomu.service;

import br.com.joaomu.model.Questao;
import br.com.joaomu.model.User;
import br.com.joaomu.model.Resolucao;
import br.com.joaomu.repo.QuestaoRepository;
import br.com.joaomu.repo.UserRepository;
import br.com.joaomu.repo.ResolucaoRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class QuestaoService {

    // QuestaoService recebe dados brutos do Controller
    // Realiza validações de negócio
    // Interage com o banco de dados via repository
    // Retorna os dados para o Controller
    private final QuestaoRepository repository;
    private final UserRepository userRepository;
    private final ResolucaoRepository resolucaoRepository;

    public QuestaoService(QuestaoRepository repository, UserRepository userRepository,
            ResolucaoRepository resolucaoRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.resolucaoRepository = resolucaoRepository;
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
        repository.findById(questao.getId())
                .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + questao.getId()));
        return repository.save(questao);
        // O findById retorna um Optional<> que pode estar vazio ou conter um objeto
        // O orElseThrow lança uma exceção se o Optional estiver vazio, obrigatório
        // fazer isso.
    }

    // findAll
    public List<Questao> listarTodas() {
        return repository.findAll();
    }

    // método ficou bem mais compacto
    public Questao buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + id));
    }

    @Transactional
    public boolean remover(Long id) {
        Questao questao = buscarPorId(id);
        repository.delete(questao);
        return true;
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

        return resolucaoRepository.save(resolucao);
    }
}