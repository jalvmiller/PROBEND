package br.com.joaomu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resolucoes")
public class Resolucao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo; // A explicação textual em si (pode conter LaTeX)

    @Column(columnDefinition = "TEXT")
    private String trechoCodigo; // Caso a resolução tenha um código (ex: solução de algoritmo)

    @Column(length = 50)
    private String linguagemCodigo;

    private Integer upvotes = 0;

    private Boolean verificadoPorEspecialista = false; // Apenas User com "especialista=true" pode alterar isso

    // Relações com as outras tabelas
    @ManyToOne
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario autor;

    public Resolucao() {

    }

    public Resolucao(String conteudo, String trechoCodigo, String linguagemCodigo, Integer upvotes,
            Boolean verificadoPorEspecialista, Questao questao, Usuario autor) {
        this.conteudo = conteudo;
        this.trechoCodigo = trechoCodigo;
        this.linguagemCodigo = linguagemCodigo;
        this.upvotes = upvotes != null ? upvotes : 0;
        this.verificadoPorEspecialista = verificadoPorEspecialista != null ? verificadoPorEspecialista : false;
        this.questao = questao;
        this.autor = autor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public String getTrechoCodigo() {
        return trechoCodigo;
    }

    public void setTrechoCodigo(String trechoCodigo) {
        this.trechoCodigo = trechoCodigo;
    }

    public String getLinguagemCodigo() {
        return linguagemCodigo;
    }

    public void setLinguagemCodigo(String linguagemCodigo) {
        this.linguagemCodigo = linguagemCodigo;
    }

    public Integer getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes != null ? upvotes : 0;
    }

    public Boolean isVerificadoPorEspecialista() {
        return verificadoPorEspecialista != null && verificadoPorEspecialista;
    }

    public void setVerificadoPorEspecialista(Boolean verificadoPorEspecialista) {
        this.verificadoPorEspecialista = verificadoPorEspecialista != null ? verificadoPorEspecialista : false;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

}