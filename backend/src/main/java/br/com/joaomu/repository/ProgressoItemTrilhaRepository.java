package br.com.joaomu.repository;

import br.com.joaomu.entity.ProgressoItemTrilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoItemTrilhaRepository extends JpaRepository<ProgressoItemTrilha, Long> {

    Optional<ProgressoItemTrilha> findByUsuarioIdAndItemTrilhaId(Long usuarioId, Long itemTrilhaId);

    List<ProgressoItemTrilha> findByUsuarioIdAndItemTrilhaTrilhaId(Long usuarioId, Long trilhaId);
}
