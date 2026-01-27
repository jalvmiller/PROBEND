package br.com.joaomu.repo;

import br.com.joaomu.model.Questao;
import java.util.ArrayList;
import java.util.List;

public class QuestaoRepository {

    private final List<Questao> banco = new ArrayList<>(); // "Banco de dados", uma Lista de várias questões
    private Long proximoId = 1L;
    
    public Questao salvar(Questao question) {
        if(question.getId() == null) {
            question.setId(proximoId++);

            banco.add(question);
        } else {
            // faz update.. nesse trecho debaixo, caso haja o id no banco de dados
            for (int i = 0; i < banco.size(); i++){
                if(banco.get(i).getId().equals(question.getId())){
                    banco.set(i, question);

                    break;
                }
            }
        }

        return question;
    }

    public List<Questao> listarTodas(){
        return new ArrayList<>(banco);
    }

    public Questao buscarPorId(Long id){
        return banco.stream()
            .filter(question -> question.getId().equals(id))
            .findFirst()
            .orElse(null);
    }

    public boolean remover(Long id){
        return banco.removeIf(question -> question.getId().equals(id));
    }
}