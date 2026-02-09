package br.com.joaomu.repo;

import br.com.joaomu.model.Questao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Classe Repository foi convertida para uma interface devido a aplicação do Jpa.

@Repository
public interface QuestaoRepository extends JpaRepository<Questao, Long> {


    List<Questao> findByMateriaIgnoreCase(String materia);

    List<Questao> findByDificuldade(Integer dificuldade);

    List<Questao> findByAssuntoIgnoreCase(String assunto);
}