package br.com.joaomu.repository;

import br.com.joaomu.entity.Trilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrilhaRepository extends JpaRepository<Trilha, Long> {

    List<Trilha> findByPublicaTrueOrderByCriadoEmDesc();

    List<Trilha> findByAutorIdOrderByCriadoEmDesc(Long autorId);

    @Query("SELECT t FROM Trilha t WHERE t.publica = true OR t.autor.id = :usuarioId ORDER BY t.criadoEm DESC")
    List<Trilha> listarVisiveisParaUsuario(@Param("usuarioId") Long usuarioId);
}
