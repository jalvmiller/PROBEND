package br.com.joaomu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class NotificacaoService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarEmailResolucao(String email, String assunto, String mensagem) {
        SimpleMailMessage emailMessage = new SimpleMailMessage();
        emailMessage.setTo(email);
        emailMessage.setSubject(assunto);
        emailMessage.setText(mensagem);

        mailSender.send(emailMessage);
    }
}
