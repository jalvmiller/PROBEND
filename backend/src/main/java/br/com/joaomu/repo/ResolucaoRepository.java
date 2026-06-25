package br.com.joaomu.repo;

import br.com.joaomu.model.Resolucao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResolucaoRepository extends JpaRepository<Resolucao, Long> {

    List<Resolucao> findByQuestaoId(Long questaoId);

}
