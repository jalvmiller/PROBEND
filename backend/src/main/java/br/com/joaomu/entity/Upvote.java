package br.com.joaomu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "upvotes", uniqueConstraints = {
        // Garante que um usuário só pode dar UM upvote por questão
        @UniqueConstraint(columnNames = { "usuario_id", "questao_id" }),
        // Garante que um usuário só pode dar UM upvote por resolução
        @UniqueConstraint(columnNames = { "usuario_id", "resolucao_id" })
})
public class Upvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Se for um upvote em uma Questão, este campo será preenchido e o resolucao
    // será null
    @ManyToOne
    @JoinColumn(name = "questao_id")
    private Questao questao;

    // Se for um upvote em uma Resolução, este campo será preenchido e o questao
    // será null
    @ManyToOne
    @JoinColumn(name = "resolucao_id")
    private Resolucao resolucao;

    public Upvote() {
    }

    public Upvote(Long id, Usuario usuario, Questao questao, Resolucao resolucao) {
        this.id = id;
        this.usuario = usuario;
        this.questao = questao;
        this.resolucao = resolucao;
    }

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

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }

    public Resolucao getResolucao() {
        return resolucao;
    }

    public void setResolucao(Resolucao resolucao) {
        this.resolucao = resolucao;
    }

    // Validação de segurança antes de salvar no banco
    @PrePersist
    @PreUpdate
    private void validarAlvo() {
        if ((questao == null && resolucao == null) || (questao != null && resolucao != null)) {
            throw new IllegalStateException(
                    "O upvote deve estar vinculado exclusivamente a uma Questão OU a uma Resolução.");
        }
    }
}