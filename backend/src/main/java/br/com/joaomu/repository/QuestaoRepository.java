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
    @EntityGraph(attributePaths = { "autor" })
    Optional<Questao> findById(Long id);

    @Override
    @EntityGraph(attributePaths = { "autor" })
    List<Questao> findAll();

    // O Spring Data analisa a assinatura desses métodos
    // e gera a consulta SQL automaticamente baseado no nome do método.
    @EntityGraph(attributePaths = { "autor" })
    List<Questao> findByMateriaIgnoreCase(String materia);

    @EntityGraph(attributePaths = { "autor" })
    List<Questao> findByDificuldade(Integer dificuldade);

    @EntityGraph(attributePaths = { "autor" })
    List<Questao> findByAssuntoIgnoreCase(String assunto);

    @EntityGraph(attributePaths = { "autor" })
    List<Questao> findTop200ByEnunciadoContainingIgnoreCaseOrMateriaContainingIgnoreCaseOrAssuntoContainingIgnoreCaseOrFonteContainingIgnoreCase(
            String enunciado,
            String materia,
            String assunto,
            String fonte);

    // ── Queries filtradas por isolamento de visitante ─────────────────────────
    // Regra: visível = is_seeder_content=true OU autor_id = userId (meu próprio)
    // Usa @Query JPQL com parâmetros tipados (PreparedStatement)

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Questao q LEFT JOIN FETCH q.autor a " +
            "WHERE q.seederContent = true OR (a IS NOT NULL AND a.id = :userId)")
    List<Questao> findVisibleToUser(
            @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Questao q LEFT JOIN FETCH q.autor a " +
            "WHERE (q.seederContent = true OR (a IS NOT NULL AND a.id = :userId)) " +
            "AND LOWER(q.materia) = LOWER(:materia)")
    List<Questao> findByMateriaVisibleToUser(
            @org.springframework.data.repository.query.Param("materia") String materia,
            @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Questao q LEFT JOIN FETCH q.autor a " +
            "WHERE (q.seederContent = true OR (a IS NOT NULL AND a.id = :userId)) " +
            "AND q.dificuldade = :dificuldade")
    List<Questao> findByDificuldadeVisibleToUser(
            @org.springframework.data.repository.query.Param("dificuldade") Integer dificuldade,
            @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Questao q LEFT JOIN FETCH q.autor a " +
            "WHERE (q.seederContent = true OR (a IS NOT NULL AND a.id = :userId)) " +
            "AND LOWER(q.assunto) = LOWER(:assunto)")
    List<Questao> findByAssuntoVisibleToUser(
            @org.springframework.data.repository.query.Param("assunto") String assunto,
            @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT q FROM Questao q LEFT JOIN FETCH q.autor a " +
            "WHERE (q.seederContent = true OR (a IS NOT NULL AND a.id = :userId)) " +
            "AND (LOWER(q.enunciado) LIKE LOWER(CONCAT('%', :termo, '%')) " +
            "  OR LOWER(q.materia)   LIKE LOWER(CONCAT('%', :termo, '%')) " +
            "  OR LOWER(q.assunto)   LIKE LOWER(CONCAT('%', :termo, '%')) " +
            "  OR LOWER(q.fonte)     LIKE LOWER(CONCAT('%', :termo, '%'))) " +
            "ORDER BY q.id DESC")
    List<Questao> findByTermoVisibleToUser(
            @org.springframework.data.repository.query.Param("termo") String termo,
            @org.springframework.data.repository.query.Param("userId") Long userId);

    // Deleta todas as questões de um visitante (usado pelo cleanup do seeder)
    void deleteAllByAutor_Id(Long autorId);
}