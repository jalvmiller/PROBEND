package br.com.joaomu.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;
import br.com.joaomu.entity.Upvote;
import br.com.joaomu.entity.Usuario;

import java.util.Optional;
import java.util.List;

public interface UpvoteRepository extends JpaRepository<Upvote, Long> {
    // Buscar se existe um upvote do Usuário para uma questão X
    Optional<Upvote> findByUsuarioAndQuestao(Usuario usuario, Questao questao);

    // Buscar se existe upvote do usuário para resolução Y
    Optional<Upvote> findByUsuarioAndResolucao(Usuario usuario, Resolucao resolucao);

    // Buscar todos os upvotes de um usuário
    List<Upvote> findByUsuario(Usuario usuario);
}
