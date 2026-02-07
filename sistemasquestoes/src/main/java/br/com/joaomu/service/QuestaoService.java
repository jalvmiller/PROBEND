package br.com.joaomu.service;

import br.com.joaomu.model.Questao;
import br.com.joaomu.repo.QuestaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestaoService {

    private QuestaoRepository repository;

    public QuestaoService(QuestaoRepository repository){
        this.repository = repository;
    }

    public void validarDificuldade(Questao questao) {
        if (questao.getDificuldade() == null || questao.getDificuldade() < 0 || questao.getDificuldade() > 2) {
            System.out.println("\nDificuldade inválida, a dificuldade será fácil por padrão.\n");
            
            questao.setDificuldade(0);
        }
    }    

    // Cadastrar nova questão com as regras de negócio, exceções

    public Questao validarQuestao(Questao questao){
        if(questao.getEnunciado() == null || questao.getEnunciado().isBlank()){
            throw new IllegalArgumentException("Uso de enunciado é obrigatório");
        }
                
        // VALIDAÇÃO 2: Alternativa correta obrigatória
        if (questao.getAlternativaCorreta() == null || questao.getAlternativaCorreta().isBlank()) {
            throw new IllegalArgumentException("Alternativa correta é obrigatória!");
        }
        
        // VALIDAÇÃO 3: Pelo menos 2 alternativas incorretas
        int alternativasIncorretas = 0;
        if (questao.getAlternativaIncorreta1() != null && !questao.getAlternativaIncorreta1().isBlank()) {
            alternativasIncorretas++;
        }
        if (questao.getAlternativaIncorreta2() != null && !questao.getAlternativaIncorreta2().isBlank()) {
            alternativasIncorretas++;
        }
        if (questao.getAlternativaIncorreta3() != null && !questao.getAlternativaIncorreta3().isBlank()) {
            alternativasIncorretas++;
        }
        
        if (alternativasIncorretas < 2) {
            throw new IllegalArgumentException("É necessário pelo menos 2 alternativas incorretas!");
        }


        validarUnicidade(questao); // Caso o usuário tenha informado uma mesma alternativa como correta e incorreta -> exceção 
        

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
        
        // Se passou todas as validações, salva
        return repository.save(questao);
    }


    // PRIMEIRO MÉTODO COM ALTERAÇÃO VINDA DA IMPLEMENTAÇÃO DA PERSISTÊNCIA DO JPA
    // O método buscarPorId foi trocado por um método da biblioteca do jpa repository
    public Questao atualizarQuestao(Questao questao){
        repository.findById(questao.getId())
            .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + questao.getId()));
        /*if (existe == null){
            throw new IllegalArgumentException("Questão não encontrada com ID: " + questao.getId());
        }*/

        return repository.save(questao);
    }
    
    // findAll
    public List<Questao> listarTodas(){
        return repository.findAll();
    }


    // método ficou bem mais compacto
    public Questao buscarPorId(Long id){
        return repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Questão não encontrada com ID: " + id));
    }



    public boolean remover(Long id){
        Questao questao = buscarPorId(id);
        repository.delete(questao);
        return true;
    }



    public List<Questao> buscarPorMateria(String materia){
        if (materia == null || materia.isBlank()){
            throw new IllegalArgumentException("Matéria inválida");
        }

        return repository.findByMaterialIgnoreCase(materia);
        /* 
        return repository.listarTodas().stream()
            .filter(q -> q.getMateria().equalsIgnoreCase(materia))
            .collect(Collectors.toList());
        */
    }



    public List<Questao> buscarPorDificuldade(Integer dificuldade){
        if (dificuldade == null || dificuldade < 0 || dificuldade > 2){
            throw new IllegalArgumentException("A dificuldade deve estar entre: 0 (fácil) - 1 (média) - 2 (difícil");
        }

        return repository.findByDificuldade(dificuldade);
        /* 
        return repository.listarTodas().stream()
            .filter(q -> q.getDificuldade().equals(dificuldade))
            .collect(Collectors.toList());
        */
    }

    public List<Questao> buscarPorAssunto(String assunto){
        if (assunto == null || assunto.isBlank()){
            throw new IllegalArgumentException("Assunto inválido");
        }

        return repository.findByAssuntoIgnoreCase(assunto);
        /*
        ANÁLISE LOWERCASE 
        return repository.listarTodas().stream()
            .filter(q -> q.getAssunto() != null && 
                q.getAssunto()
                .toLowerCase()
                .contains(assunto.toLowerCase()))
                .collect(Collectors.toList());
        */
    }


    private void validarUnicidade(Questao questao) {
        String correta = questao.getAlternativaCorreta().toLowerCase().trim(); 
        //tolowercase-> uniformizar o padrão minúsculo para verif; o trim servirá para remover espaços

        if(correta.equals(questao.getAlternativaIncorreta1().toLowerCase().trim())) {
            throw new IllegalArgumentException("A alternativa correta não pode ser posta como incorreta");
        }

        if(correta.equals(questao.getAlternativaIncorreta2().toLowerCase().trim())) {
            throw new IllegalArgumentException("A alternativa correta não pode ser posta como incorreta");
        }

        if(correta.equals(questao.getAlternativaIncorreta3().toLowerCase().trim())) {
            throw new IllegalArgumentException("A alternativa correta não pode ser posta como incorreta");
        }
    }
    
}