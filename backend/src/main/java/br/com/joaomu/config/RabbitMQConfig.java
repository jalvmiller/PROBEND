package br.com.joaomu.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_EMAIL = "probend.resolucao.email.queue";
    public static final String QUEUE_EMAIL_DLQ = "probend.resolucao.email.dlq";
    public static final String EXCHANGE_PROBEND = "probend.exchange";
    public static final String ROUTING_KEY_EMAIL = "probend.resolucao.email.routingkey";

    // 1. Fila principal com redirecionamento para DLQ em caso de falha
    // x-dead-letter-exchange="" usa o default exchange do RabbitMQ
    // x-dead-letter-routing-key aponta para a fila DLQ pelo nome
    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(QUEUE_EMAIL) // durable = não é perdida em restart
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", QUEUE_EMAIL_DLQ)
                .build();
    }

    // Dead Letter Queue: armazena mensagens que falharam após todas as tentativas
    // de retry. Permite análise posterior sem perder a mensagem original
    @Bean
    public Queue emailDeadLetterQueue() {
        return QueueBuilder.durable(QUEUE_EMAIL_DLQ).build();
    }

    // 2. Declara o tópico (exchange), entrada onde o produtor publica mensagens
    // TopicExchange permite roteamento baseado em padrão, pode usar regras
    // como: * (um caractere), # (zero ou mais caracteres) para decidir
    // quais filas envia
    @Bean
    public TopicExchange probendExchange() {
        return new TopicExchange(EXCHANGE_PROBEND);
    }

    // 3. Declara o binding, vincula a fila ao tópico com uma chave de roteamento
    // A chave "probend.resolucao.email.routingkey" garante que apenas mensagens
    // com essa chave sejam entregues na fila
    @Bean
    public Binding bindingEmail(Queue emailQueue, TopicExchange probendExchange) {
        return BindingBuilder.bind(emailQueue)
                .to(probendExchange)
                .with(ROUTING_KEY_EMAIL);
    }

    // 4. Bean de conversão (transforma POJOs em JSON e vice-versa)
    // Por padrão, o Spring AMQP usa a serialização padrão do Java,
    // e isso quebra interoperabilidade caso Nodejs ou Python fosse usado,
    // além de ser propenso a erro de versão de classe como Serializable
    // Esse Bean altera o comportamento global do Spring AMQP
    // para converter qualquer objeto Java em JSON na hora de enviar
    // e converter JSON em objeto Java na hora de receber,
    // se isso não fosse feito:

    // Spring AMQP usaria a serialização nativa do Java (Java serialization)
    // que não é JSON, é binário e pode gerar problemas de compatibilidade
    // entre diferentes versões da JVM, além de ser ilegível para
    // o RabbitMQ Management
    // Antes (serialização Java):
    // bytes binários incompreensíveis
    // Depois (Jackson):
    // {"emailDestinatario":"joao@email.com","nomeDestinatario":"João",...}

    // É o mesmo Jackson que o Spring usa nos controllers para
    // converter @RequestBody só que aplicado à fila
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
