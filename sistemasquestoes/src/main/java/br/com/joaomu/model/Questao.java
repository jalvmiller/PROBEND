package br.com.joaomu.model;

public class Questao {
    
    private Long id;
    private String enunciado;
    private String alternativaCorreta;
    private String alternativaIncorreta1;
    private String alternativaIncorreta2;
    private String alternativaIncorreta3;
    private String materia;
    private String assunto;
    private Integer dificuldade;
    private String fonte;
    
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

    public String getAlternativaCorreta() {
        return alternativaCorreta;
    }

    public void setAlternativaCorreta(String alternativaCorreta) {
        this.alternativaCorreta = alternativaCorreta;
    }

    public String getAlternativaIncorreta1() {
        return alternativaIncorreta1;
    }

    public void setAlternativaIncorreta1(String alternativaIncorreta1) {
        this.alternativaIncorreta1 = alternativaIncorreta1;
    }

    public String getAlternativaIncorreta2() {
        return alternativaIncorreta2;
    }

    public void setAlternativaIncorreta2(String alternativaIncorreta2) {
        this.alternativaIncorreta2 = alternativaIncorreta2;
    }

    public String getAlternativaIncorreta3() {
        return alternativaIncorreta3;
    }

    public void setAlternativaIncorreta3(String alternativaIncorreta3) {
        this.alternativaIncorreta3 = alternativaIncorreta3;
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

}
