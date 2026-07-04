package br.com.joaomu.model;

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

    private boolean verificadoPorEspecialista = false; // Apenas User com "especialista=true" pode alterar isso

    // Relações com as outras tabelas
    @ManyToOne
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    @ManyToOne
    @JoinColumn(name = "autor_id", nullable = false)
    private User autor;

    public Resolucao() {

    }

    public Resolucao(String conteudo, String trechoCodigo, String linguagemCodigo, Integer upvotes,
            boolean verificadoPorEspecialista, Questao questao, User autor) {
        this.conteudo = conteudo;
        this.trechoCodigo = trechoCodigo;
        this.linguagemCodigo = linguagemCodigo;
        this.upvotes = upvotes;
        this.verificadoPorEspecialista = verificadoPorEspecialista;
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
        this.upvotes = upvotes;
    }

    public boolean isVerificadoPorEspecialista() {
        return verificadoPorEspecialista;
    }

    public void setVerificadoPorEspecialista(boolean verificadoPorEspecialista) {
        this.verificadoPorEspecialista = verificadoPorEspecialista;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }

    public User getAutor() {
        return autor;
    }

    public void setAutor(User autor) {
        this.autor = autor;
    }

}