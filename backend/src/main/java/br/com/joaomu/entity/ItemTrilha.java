package br.com.joaomu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itens_trilha", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trilha_id", "questao_id"})
})
public class ItemTrilha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trilha_id", nullable = false)
    private Trilha trilha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    @Column(nullable = false)
    private Integer ordem;

    public ItemTrilha() {
    }

    public ItemTrilha(Trilha trilha, Questao questao, Integer ordem) {
        this.trilha = trilha;
        this.questao = questao;
        this.ordem = ordem;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trilha getTrilha() {
        return trilha;
    }

    public void setTrilha(Trilha trilha) {
        this.trilha = trilha;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
}
