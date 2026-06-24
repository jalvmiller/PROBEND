package br.com.joaomu.repo;

import br.com.joaomu.model.Questao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/*
    JpaRepository é
    uma interface mãe que engloba os métodos do CrudRepository
    e PagingAndSortingRepository.
    Métodos como .save(), .findById(), .findAll() e .delete()
    são gerados dinamicamente em tempo de execução pelo
    Spring Data JPA através de proxies do Hibernate
*/

@Repository
public interface QuestaoRepository extends JpaRepository<Questao, Long> {

    // O Spring Data analisa a assinatura desses métodos 
    // e gera a consulta SQL automaticamente baseado no nome do método.
    List<Questao> findByMateriaIgnoreCase(String materia);

    List<Questao> findByDificuldade(Integer dificuldade);

    List<Questao> findByAssuntoIgnoreCase(String assunto);
}