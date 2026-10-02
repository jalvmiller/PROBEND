package br.com.joaomu.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscricoes_trilha", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "trilha_id"})
})
public class InscricaoTrilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trilha_id", nullable = false)
    private Trilha trilha;

    @Column(name = "is_ativa", nullable = false)
    private boolean ativa = false;

    @Column(name = "inscrito_em", nullable = false)
    private LocalDateTime inscritoEm;

    public InscricaoTrilha() {
    }

    public InscricaoTrilha(Usuario usuario, Trilha trilha, boolean ativa) {
        this.usuario = usuario;
        this.trilha = trilha;
        this.ativa = ativa;
        this.inscritoEm = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Trilha getTrilha() {
        return trilha;
    }

    public void setTrilha(Trilha trilha) {
        this.trilha = trilha;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public LocalDateTime getInscritoEm() {
        return inscritoEm;
    }

    public void setInscritoEm(LocalDateTime inscritoEm) {
        this.inscritoEm = inscritoEm;
    }
}
