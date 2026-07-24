package br.com.joaomu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import br.com.joaomu.config.RabbitMQConfig;
import br.com.joaomu.dto.ResolucaoEmailEvent;
import br.com.joaomu.entity.Questao;
import br.com.joaomu.entity.Resolucao;

@Service
public class ResolucaoService {

    // O backend não bloqueia a requisição do usuário esperando o email
    // ser enviado. Outro microserviço cuida da fila no próprio tempo
    @Autowired
    private RabbitTemplate rabbitTemplate;
    // Classe utilitária do Spring AMQP usada para enviar
    // mensagens em filas, exchanges do RabbitMQ

    public void salvarResolucaoNotificar(Resolucao resolucao, Questao questao) {
        // Salvar no MySQL (síncrono)

        // DTO/Record contendo dados brutos para o envio de e-mail de resolução.
        // O DTO é serializado para JSON automaticamente pelo Spring AMQP
        ResolucaoEmailEvent event = new ResolucaoEmailEvent(
                questao.getAutor().getEmail(), // emailDestinatario real
                questao.getAutor().getNome() != null ? questao.getAutor().getNome() : questao.getAutor().getUsername(), // nomeDestinatario
                questao.getMateria() + (questao.getAssunto() != null ? " - " + questao.getAssunto() : ""), // tituloQuestao
                resolucao.getAutor().getNome() != null ? resolucao.getAutor().getNome()
                        : resolucao.getAutor().getUsername() // autorResolucao
        );

        // Mensagem event enviada para a exchange sob a Routing Key
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_PROBEND,
                RabbitMQConfig.ROUTING_KEY_EMAIL,
                event);
    }
}