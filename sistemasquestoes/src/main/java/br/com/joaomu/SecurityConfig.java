package br.com.joaomu;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> 
                auth
                    .requestMatchers("/api/questoes/**").authenticated() // acesso somente por usuários verificados
                    .anyRequest().permitAll()                            // livre acesso às demais páginas
                )
                .httpBasic(Customizer.withDefaults()); // login com usuário e senha
        
        return http.build();
    }
    
}
