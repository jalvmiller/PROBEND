package br.com.joaomu.dto;

import java.io.Serializable;

// DTO que representa os dados necessários para o envio de e-mail de resolução
public record ResolucaoEmailEvent(
        String emailDestinatario,
        String nomeDestinatario,
        String tituloQuestao,
        String autorResolucao)
        implements Serializable {
}