package br.com.joaomu.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "questoes")
public class Questao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Column(nullable = false)
    private String materia;

    private String assunto;

    @Column(nullable = false)
    private Integer dificuldade;

    private String fonte;

    @ManyToOne
    @JoinColumn(name = "autor_id")
    private User autor;

    private Integer upvotes = 0;

    @Column(columnDefinition = "TEXT")
    private String trechoCodigo;

    @Column(length = 50)
    private String linguagemCodigo;

    private Boolean solucionada = false;

    @Column(name = "data_insercao")
    private java.time.LocalDateTime dataInsercao;

    @OneToMany(mappedBy = "questao", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Resolucao> resolucoes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.dataInsercao == null) {
            this.dataInsercao = java.time.LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public Integer getDificuldade() {
        return dificuldade;
    }

    public void setDificuldade(Integer dificuldade) {
        this.dificuldade = dificuldade;
    }

    public String getFonte() {
        return fonte;
    }

    public void setFonte(String fonte) {
        this.fonte = fonte;
    }

    public User getAutor() {
        return autor;
    }

    public void setAutor(User autor) {
        this.autor = autor;
    }

    public Integer getUpvotes() {
        return upvotes;
    }

    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes;
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

    public Boolean isSolucionada() {
        return solucionada != null && solucionada;
    }

    public void setSolucionada(Boolean solucionada) {
        this.solucionada = solucionada;
    }

    public List<Resolucao> getResolucoes() {
        return resolucoes;
    }

    public void setResolucoes(List<Resolucao> resolucoes) {
        this.resolucoes = resolucoes;
    }

    public java.time.LocalDateTime getDataInsercao() {
        return dataInsercao;
    }

    public void setDataInsercao(java.time.LocalDateTime dataInsercao) {
        this.dataInsercao = dataInsercao;
    }

    public int getNumeroResolucoes() {
        return this.resolucoes != null ? this.resolucoes.size() : 0;
    }
}