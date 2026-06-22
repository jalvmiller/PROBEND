package br.com.joaomu.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "upvotes", uniqueConstraints = {
    // Garante que um usuário só pode dar UM upvote por questão
    @UniqueConstraint(columnNames = {"usuario_id", "questao_id"}),
    // Garante que um usuário só pode dar UM upvote por resolução
    @UniqueConstraint(columnNames = {"usuario_id", "resolucao_id"})
})

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Upvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    // Se for um upvote em uma Questão, este campo será preenchido e o resolucao será null
    @ManyToOne
    @JoinColumn(name = "questao_id")
    private Questao questao;

    // Se for um upvote em uma Resolução, este campo será preenchido e o questao será null
    @ManyToOne
    @JoinColumn(name = "resolucao_id")
    private Resolucao resolucao;

    // Validação de segurança antes de salvar no banco
    @PrePersist
    @PreUpdate
    private void validarAlvo() {
        if ((questao == null && resolucao == null) || (questao != null && resolucao != null)) {
            throw new IllegalStateException("O upvote deve estar vinculado exclusivamente a uma Questão OU a uma Resolução.");
        }
    }
}