package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.joaomu.entity.Questao;

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

    // @Query é usado para escrever consultas personalizadas em JPQL
    // Em outro momento, usar Criteria para melhorar a eficiência e registrar
    // métrica
    @Query("SELECT q FROM Questao q WHERE " +
            "LOWER(q.enunciado) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.materia) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.assunto) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.fonte) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Questao> search(@Param("keyword") String keyword);
}