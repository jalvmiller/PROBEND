package br.com.joaomu.service;

import br.com.joaomu.model.Questao;
import br.com.joaomu.model.User;
import br.com.joaomu.repo.QuestaoRepository;
import br.com.joaomu.repo.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestaoService {

    // QuestaoService recebe dados brutos do Controller
    // Realiza validações de negócio
    // Interage com o banco de dados via repository
    // Retorna os dados para o Controller
    private final QuestaoRepository repository;
    private final UserRepository userRepository;

    public QuestaoService(QuestaoRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public void validarDificuldade(Questao questao) {
        if (questao.getDificuldade() == null || questao.getDificuldade() < 0 || questao.getDificuldade() > 2) {
            System.out.println("\nDificuldade inválida, a dificuldade será fácil por padrão.\n");

            questao.setDificuldade(0);
        }
    }

    // Cadastrar nova questão com as regras de negócio, exceções
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
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                User loggedInUser = userRepository.findByUsername(auth.getName()).orElse(null);
                questao.setAutor(loggedInUser);
            }
        }

        // Se passou todas as validações, salva
        return repository.save(questao);
    }

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

}