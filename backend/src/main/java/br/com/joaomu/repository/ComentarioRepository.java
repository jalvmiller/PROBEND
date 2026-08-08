package br.com.joaomu.repository;

import br.com.joaomu.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Busca todos os comentários de uma resolução, ordenados do mais antigo para o mais novo
    List<Comentario> findByResolucao_IdOrderByDataCriacaoAsc(Long resolucaoId);
}
