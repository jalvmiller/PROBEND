package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.joaomu.entity.Resolucao;

import java.util.List;

public interface ResolucaoRepository extends JpaRepository<Resolucao, Long> {

    List<Resolucao> findByQuestao_Id(Long questaoId);

}
