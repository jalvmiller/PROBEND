package br.com.joaomu.repository;

import br.com.joaomu.entity.InscricaoTrilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscricaoTrilhaRepository extends JpaRepository<InscricaoTrilha, Long> {

    Optional<InscricaoTrilha> findByUsuarioIdAndAtivaTrue(Long usuarioId);

    Optional<InscricaoTrilha> findByUsuarioIdAndTrilhaId(Long usuarioId, Long trilhaId);

    List<InscricaoTrilha> findByUsuarioId(Long usuarioId);
}
