package br.com.joaomu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "comentarios")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    // Comentário pertence a uma resolução (N comentários : 1 resolução)
    @ManyToOne
    @JoinColumn(name = "resolucao_id", nullable = false)
    @JsonIgnore
    private Resolucao resolucao;

    // Comentário foi escrito por um usuário
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario autor;

    @Column(name = "data_criacao")
    private java.time.LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate() {
        if (this.dataCriacao == null) {
            this.dataCriacao = java.time.LocalDateTime.now();
        }
    }

    public Comentario() {}

    public Comentario(String conteudo, Resolucao resolucao, Usuario autor) {
        this.conteudo = conteudo;
        this.resolucao = resolucao;
        this.autor = autor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    @JsonIgnore
    public Resolucao getResolucao() { return resolucao; }
    public void setResolucao(Resolucao resolucao) { this.resolucao = resolucao; }

    @JsonProperty("resolucaoId")
    public Long getResolucaoId() { return resolucao != null ? resolucao.getId() : null; }

    public Usuario getAutor() { return autor; }
    public void setAutor(Usuario autor) { this.autor = autor; }

    public java.time.LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(java.time.LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
