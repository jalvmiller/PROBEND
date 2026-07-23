package br.com.joaomu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.joaomu.entity.Resolucao;

import java.util.List;

@Repository
public interface ResolucaoRepository extends JpaRepository<Resolucao, Long> {

    List<Resolucao> findByQuestaoId(Long questaoId);

}
