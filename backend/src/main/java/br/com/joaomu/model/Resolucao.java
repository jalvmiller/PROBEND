package br.com.joaomu.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "resolucoes")
@Data // Usando Lombok para gerar Getters/Setters como você fez na classe User
@NoArgsConstructor
@AllArgsConstructor
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

}