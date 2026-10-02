package br.com.joaomu.repository;

import br.com.joaomu.entity.ItemTrilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemTrilhaRepository extends JpaRepository<ItemTrilha, Long> {

    List<ItemTrilha> findByTrilhaIdOrderByOrdemAsc(Long trilhaId);

    Optional<ItemTrilha> findByTrilhaIdAndQuestaoId(Long trilhaId, Long questaoId);
}
