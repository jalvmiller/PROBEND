package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.joaomu.entity.Resolucao;

import java.util.List;

public interface ResolucaoRepository extends JpaRepository<Resolucao, Long> {

    @EntityGraph(attributePaths = {"autor"})
    List<Resolucao> findByQuestao_Id(Long questaoId);

    // Query filtrada por isolamento: retorna resoluções de uma questão que sejam
    // seeder content OU criadas pelo próprio usuário autenticado.
    @org.springframework.data.jpa.repository.Query(
        "SELECT r FROM Resolucao r LEFT JOIN FETCH r.autor a " +
        "WHERE r.questao.id = :questaoId " +
        "AND (r.seederContent = true OR (a IS NOT NULL AND a.id = :userId))")
    List<Resolucao> findByQuestaoVisibleToUser(
        @org.springframework.data.repository.query.Param("questaoId") Long questaoId,
        @org.springframework.data.repository.query.Param("userId") Long userId);

    // Deleta todas as resoluções de um visitante (usado pelo cleanup do seeder)
    void deleteAllByAutor_Id(Long autorId);
}

