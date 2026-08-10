package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.joaomu.entity.Questao;

import java.util.List;
import java.util.Optional;

/*
    JpaRepository é
    uma interface mãe que engloba os métodos do CrudRepository
    e PagingAndSortingRepository.
    Métodos como .save(), .findById(), .findAll() e .delete()
    são gerados dinamicamente em tempo de execução pelo
    Spring Data JPA através de proxies do Hibernate
*/

public interface QuestaoRepository extends JpaRepository<Questao, Long> {

    @Override
    @EntityGraph(attributePaths = {"autor"})
    Optional<Questao> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"autor"})
    List<Questao> findAll();

    // O Spring Data analisa a assinatura desses métodos
    // e gera a consulta SQL automaticamente baseado no nome do método.
    @EntityGraph(attributePaths = {"autor"})
    List<Questao> findByMateriaIgnoreCase(String materia);

    @EntityGraph(attributePaths = {"autor"})
    List<Questao> findByDificuldade(Integer dificuldade);

    @EntityGraph(attributePaths = {"autor"})
    List<Questao> findByAssuntoIgnoreCase(String assunto);

    @EntityGraph(attributePaths = {"autor"})
    List<Questao> findTop200ByEnunciadoContainingIgnoreCaseOrMateriaContainingIgnoreCaseOrAssuntoContainingIgnoreCaseOrFonteContainingIgnoreCase(
            String enunciado,
            String materia,
            String assunto,
            String fonte);
}