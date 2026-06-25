package br.com.joaomu.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String nome;

    private Integer pontos = 0;

    private boolean especialista = false;

    private boolean administrador = false;

    // Construtor Padrão (NoArgsConstructor)
    public User() {
    }

    // Construtor Completo (AllArgsConstructor)
    public User(Long id, String username, String password, String nome, Integer pontos, boolean especialista,
            boolean administrador) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.nome = nome;
        this.pontos = pontos;
        this.especialista = especialista;
        this.administrador = administrador;
    }

    // Getters e Setters Manuais
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }

    public boolean isEspecialista() {
        return especialista;
    }

    public void setEspecialista(boolean especialista) {
        this.especialista = especialista;
    }

    public boolean isAdministrador() {
        return administrador;
    }

    public void setAdministrador(boolean administrador) {
        this.administrador = administrador;
    }

    // Métodos exigidos pelo UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
