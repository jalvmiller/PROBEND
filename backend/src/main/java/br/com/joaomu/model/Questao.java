package br.com.joaomu.model;

import jakarta.persistence.*;

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

}
