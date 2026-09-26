package br.com.joaomu.repository;

import br.com.joaomu.entity.Comentario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Busca todos os comentários de uma resolução com o autor pré-carregado (evita N+1 SQL)
    @EntityGraph(attributePaths = {"autor"})
    List<Comentario> findByResolucao_IdOrderByDataCriacaoAsc(Long resolucaoId);

    // Validação defensiva: busca comentário pai garantindo que pertença à mesma resolução
    Optional<Comentario> findByIdAndResolucao_Id(Long id, Long resolucaoId);
}
