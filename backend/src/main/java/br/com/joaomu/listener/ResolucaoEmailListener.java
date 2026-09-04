package br.com.joaomu.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import br.com.joaomu.config.RabbitMQConfig;
import br.com.joaomu.dto.ResolucaoEmailEvent;
import br.com.joaomu.service.integration.NotificacaoService;

@Component
public class ResolucaoEmailListener {

    // API padrão definida pelo SLF4J, SIMPLE LOGGING FACADE FOR JAVA
    // é estruturada com base em níveis INFO DEBUG WARN ERROR
    //
    private static final Logger log = LoggerFactory.getLogger(ResolucaoEmailListener.class);

    private final NotificacaoService notificacaoService;

    public ResolucaoEmailListener(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }
    // Serviço que cuida de email
    // AWS SES; Spring Mail

    // Consumidor da fila principal de email.
    // Se o envio falhar, o Spring AMQP faz retry conforme configuração.
    // Após esgotar as tentativas, a mensagem é rejeitada e o RabbitMQ
    // a redireciona para a Dead Letter Queue (DLQ) automaticamente.
    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL)
    public void ouvirResolucaoEmail(ResolucaoEmailEvent event) {
        // OBS: a notação de chaves é notação do SL4FJ para placeholder
        // é trocado pelo argumento na momento da formatação
        log.info("Processando email: destinatário={}, questão={}, autor={}",
                event.nomeDestinatario(), event.tituloQuestao(), event.autorResolucao());

        String assunto = "Nova resolução disponível - " + event.tituloQuestao();
        String mensagem = String.format(
                "Olá %s!\n\nA sua questão sobre %s recebeu uma nova resolução criada por %s.\n\nAtenciosamente,\nEquipe Probend",
                event.nomeDestinatario(),
                event.tituloQuestao(),
                event.autorResolucao());

        notificacaoService.enviarEmailResolucao(
                event.emailDestinatario(),
                assunto,
                mensagem);

        // SAÍDA
        // o output no terminal sai assim:
        // 2026-09-03 14:30:12.345
        // INFO 12345 --- [ntainer#0-1]
        // b.c.j.listener.ResolucaoEmailListener : Email enviado para {email}
        log.info("Email enviado com sucesso para {}", event.emailDestinatario());
    }
}
