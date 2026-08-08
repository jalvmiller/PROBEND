package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.joaomu.entity.Resolucao;

import java.util.List;

public interface ResolucaoRepository extends JpaRepository<Resolucao, Long> {

    @EntityGraph(attributePaths = {"autor"})
    List<Resolucao> findByQuestao_Id(Long questaoId);

}
