package br.com.joaomu.dto.entity;

import br.com.joaomu.entity.Usuario;

// DTO público de autor: expõe exclusivamente o username e o avatar
// inviabilizar vazamento em Response JSON

// Esse Record não tem conhecimento dos métodos da entidade Usuario
// ele serve apenas como um objeto de transporte de dados..
// quem tem acesso ao DTO repassa os valores já conhecidos a ele
// ele faz o processo de busca dos dados

public record AutorResumoResponse(
        // uso de record: ele cria as variáveis, cria o construtor e as
        // funções hashcode, equals e tostring() lidam com os dados de
        // entrada, os valores contidos aqui são imutáveis
        String username,
        String avatar) {

    public static AutorResumoResponse fromEntity(Usuario usuario) {
        // o from Entity implementa o padrão Static Factory Method
        // se o usuário for nulo, retorna null e não quebra a
        // aplicação com NullPointerException, é uma boa prática
        // implementar isso em métodos para DTOs públicos

        // Ex: uso do DTO com fromEntity quando uma questão
        // precisa carregar o username e avatar do autor
        // usando o atributo foreign key (getAutor)
        // AutorResumoResponse.fromEntity(questao.getAutor());
        if (usuario == null) {
            return null;
        }

        return new AutorResumoResponse(
                usuario.getUsername(),
                usuario.getAvatar());
    }
}
