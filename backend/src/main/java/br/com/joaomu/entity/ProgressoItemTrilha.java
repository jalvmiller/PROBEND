package br.com.joaomu.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progresso_itens_trilha", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "item_trilha_id"})
})
public class ProgressoItemTrilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_trilha_id", nullable = false)
    private ItemTrilha itemTrilha;

    @Column(nullable = false)
    private boolean concluido = false;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    public ProgressoItemTrilha() {
    }

    public ProgressoItemTrilha(Usuario usuario, ItemTrilha itemTrilha, boolean concluido) {
        this.usuario = usuario;
        this.itemTrilha = itemTrilha;
        this.concluido = concluido;
        this.concluidoEm = concluido ? LocalDateTime.now() : null;
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

    public ItemTrilha getItemTrilha() {
        return itemTrilha;
    }

    public void setItemTrilha(ItemTrilha itemTrilha) {
        this.itemTrilha = itemTrilha;
    }

    public boolean isConcluido() {
        return concluido;
    }

    public void setConcluido(boolean concluido) {
        this.concluido = concluido;
        this.concluidoEm = concluido ? LocalDateTime.now() : null;
    }

    public LocalDateTime getConcluidoEm() {
        return concluidoEm;
    }

    public void setConcluidoEm(LocalDateTime concluidoEm) {
        this.concluidoEm = concluidoEm;
    }
}
