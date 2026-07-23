package br.com.joaomu.service;

import br.com.joaomu.entity.User;
import br.com.joaomu.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class UserService implements CrudService<User, Long> {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> listarTodos() {
        return userRepository.findAll();
    }

    @Override
    public User buscarPorId(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));
    }

    @Override
    public User salvar(User entity) {
        return userRepository.save(entity);
    }

    @Override
    public User atualizar(Long id, User entity) {
        User existente = buscarPorId(id);
        if (entity.getNome() != null) {
            existente.setNome(entity.getNome());
        }
        if (entity.getEmail() != null) {
            existente.setEmail(entity.getEmail());
        }
        if (entity.getUsername() != null) {
            existente.setUsername(entity.getUsername());
        }
        return userRepository.save(existente);
    }

    @Override
    public void remover(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado para remoção: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<User> buscarPorTermo(String busca) {
        if (busca != null && !busca.isBlank()) {
            //
            return userRepository.findByUsername(busca).map(List::of).orElseGet(List::of);
        }
        return userRepository.findAll();
    }

    public User buscarPorUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }
}
