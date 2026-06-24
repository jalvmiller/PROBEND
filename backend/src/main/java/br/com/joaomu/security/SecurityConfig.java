package br.com.joaomu.security;

import br.com.joaomu.Application;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration diz pro Spring que a classe é uma fonte de Beans
// @EnableWebSecurity ativa o Spring Security
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @SuppressWarnings("unused")

    private final JwtAuthenticationFilter jwtFilter;

    // Injeção do JwtAuthenticationFilter, é um filtro que foi customizado na classe JwtAuthenticationFilter
    public SecurityConfig(JwtAuthenticationFilter jwtFilter, Application application) {
        this.jwtFilter = jwtFilter;
    }

    // Lembrar desse Bean que lida diretamente com permissão de requisições, -SecurityFilterChain-
    // É como se fosse uma sequência de pedágios que a requisição tem que passar, essa é a essência do
    // Spring Security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // csrf = cross-site request forgery
                                              // É um tipo de fraude q permite ataques contra sessões em cookies
                                              // Já que é uma API stateless (sem estado), com token JWT enviado
                                              // no cabeçalho Authorization, o cookie não é usado e o csrf perde o
                                              // sentido
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                              // Desabilitar sessões HTTP, o Spring Security não cria sessão, ou seja,
                                              // cada requisição é independente e tem que trazer o token
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/questoes/**").permitAll() // authenticated desligado
                        .requestMatchers("/api/usuarios/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()   // swagger
                        .requestMatchers("/swagger-ui.html").permitAll() // swagger
                        .requestMatchers("/v3/api-docs/**").permitAll()  // swagger
                        .anyRequest().permitAll())                       // só para testes
                                                                         // ativar o .anyRequest().authenticated() = proteger todas as rotas
                        // O quê poderia ser adicionado: RBAC(Role Based Access Control)
                        // Criar roles, ou seja, determinar quem acessa qual rota.
                        // poderia ter uma rota restrita a especialistas
                        // .requestMatchers(HttpMethod.POST, "/api/special/**").hasRole("ESPECIALISTA")
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
                                                                         // Coloca esse fitro encadeado antes da autenticação de usuário senha 
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // A senha nunca é salva em texto puro, é sempre criptografada.
                                            // O BCrypt é um algoritmo de hashing que é unidirecional, não dá pra descriptografar depois.
                                            // Passa por aqui antes de ir para o repository.save()
                                            // Ele usa um valor aleatório "salt" que é misturado com a senha antes de aplicar o hash.
                                            // Isso garante que mesmo que dois tenham a mesma senha, o hash é diferente
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
        // objeto que verifica usuário/senha durante o login, usado com o
        // UserDetailsSerivce.java
        // É interface principal do Spring Security para autenticar.
        // Quando o usuário envia login e senha pra rota /api/auth/login,
        // o controller delega esse serviço pro authenticationManager 
        // O authenticationManager vai chamar o userDetailsService para carregar o usuário
        // E depois vai validar usando o password encoder.
        // Se tudo der certo, ele gera o JWT
    }



    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173") // URL padrão do Vite, mudar quando for dar deploy já que
                                                                 // o Vercel vai usar outro.
                        .allowedMethods("GET", "POST", "PUT", "DELETE"); // CORS = Cross-Origin-Sharing
                                                                         // Uma política de segurança usada por navegadores que
                                                                         // vai impedir um site carregado de um domínio de fazer
                                                                         // requisições de outro domínio.. a menos que o backend
                                                                         // permita. Nesse trecho, ele permite que o React que usa
                                                                         // a porta 5173 faça requisições para o Spring Boot 
                                                                         // que usa porta 8080.
            }
        };
    }
}