package br.com.joaomu.repo;

import br.com.joaomu.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Optional = objeto ou null,
// List, usado no QuestaoRepository = lista vazia ou com conteúdo
/*
    JpaRepository é
    uma interface mãe que engloba os métodos do CrudRepository
    e PagingAndSortingRepository.
    Métodos como .save(), .findById(), .findAll() e .delete()
    são gerados dinamicamente em tempo de execução pelo
    Spring Data JPA através de proxies do Hibernate
*/

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
