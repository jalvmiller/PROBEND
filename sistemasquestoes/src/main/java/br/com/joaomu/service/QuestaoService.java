package br.com.joaomu.service;

import br.com.joaomu.model.Questao;
import br.com.joaomu.repo.QuestaoRepository;

import java.util.List;
import java.util.stream.Collectors;


public class QuestaoService {

    private QuestaoRepository repository;

    public QuestaoService(QuestaoRepository repository){
        this.repository = repository;
    }

    // Validar a entrada de dificuldade

    /* 
    private void validarDificuldade(Integer dificuldade) {
        if (dificuldade == null) {
            throw new IllegalArgumentException("Dificuldade é obrigatória!");
        }

        if (dificuldade < 0 || dificuldade > 2) {
            dificuldade = 0;
            
            System.out.println("Dificuldade inválida, a dificuldade será fácil por padrão.");
            return;
        }
    }
    */

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
        return repository.salvar(questao);
    }


    
    public Questao atualizarQuestao(Questao questao){
        Questao existe = repository.buscarPorId(questao.getId());
        if (existe == null){
            throw new IllegalArgumentException("Questão não encontrada com ID: " + questao.getId());
        }

        return validarQuestao(questao);
    }
    
    public List<Questao> listarTodas(){
        return repository.listarTodas();
    }



    public Questao buscarPorId(Long id){
        if (id == null || id <= 0){
            throw new IllegalArgumentException("ID inválido");
        }

        Questao questao = repository.buscarPorId(id);
        if (questao == null){
            throw new IllegalArgumentException("Questão não encontrada");
        }

        return questao;
    }



    public boolean remover(Long id){
        if (id == null || id <= 0){
            throw new IllegalArgumentException("ID inválido");
        }

        boolean removido = repository.remover(id);
        if (!removido) {
            throw new IllegalArgumentException("Questao não encontrada");
        }

        return true;
    }



    public List<Questao> buscarPorMateria(String materia){
        if (materia == null || materia.isBlank()){
            throw new IllegalArgumentException("Matéria inválida");
        }

        return repository.listarTodas().stream()
            .filter(q -> q.getMateria().equalsIgnoreCase(materia))
            .collect(Collectors.toList());
    }



    public List<Questao> buscarPorDificuldade(Integer dificuldade){
        if (dificuldade == null || dificuldade < 0 || dificuldade > 2){
            throw new IllegalArgumentException("A dificuldade deve estar entre: 0 (fácil) - 1 (média) - 2 (difícil");
        }

        return repository.listarTodas().stream()
            .filter(q -> q.getDificuldade().equals(dificuldade))
            .collect(Collectors.toList());
    }

    public List<Questao> buscarPorAssunto(String assunto){
        if (assunto == null || assunto.isBlank()){
            throw new IllegalArgumentException("Assunto inválido");
        }

        /*
        
        
        ANÁLISE LOWERCASE
        
        */

        return repository.listarTodas().stream()
            .filter(q -> q.getAssunto() != null && 
                q.getAssunto()
                .toLowerCase()
                .contains(assunto.toLowerCase()))
                .collect(Collectors.toList());
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