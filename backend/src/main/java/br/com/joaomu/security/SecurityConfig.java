package br.com.joaomu.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

// @Configuration diz pro Spring que a classe é uma fonte de Beans
// @EnableWebSecurity ativa o Spring Security
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final List<String> allowedOrigins;

    // Injeção do JwtAuthenticationFilter, é um filtro que foi customizado na classe
    // JwtAuthenticationFilter
    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            @Value("${app.security.allowed-origins:http://localhost:5173}") String allowedOrigins) {
        this.jwtFilter = jwtFilter;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }

    // Lembrar desse Bean que lida diretamente com permissão de requisições,
    // -SecurityFilterChain-
    // É como se fosse uma sequência de pedágios que a requisição tem que passar,
    // essa é a essência do
    // Spring Security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler requestHandler = new org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Habilita o CORS usando a fonte do Spring Security
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers("/auth/login", "/auth/register"))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Desabilitar sessões HTTP, o Spring Security não cria sessão, ou seja,
                // cada requisição é independente e tem que trazer o token
                .authorizeHttpRequests(auth -> auth
                        // ── Autenticação ────────────────────────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/logout").permitAll()

                        // ── Swagger (portfólio: acesso público) ─────────────────
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()

                        // ── Mídia: GET público, POST exige autenticação ──────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/midia/imagens/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/midia/upload").authenticated()

                        // ── Questões: leitura pública (portfólio), escrita autenticada ──
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/questoes/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/questoes/ia-sugerir").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/questoes/ia-criar-total").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/questoes/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/questoes/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/questoes/**").authenticated()

                        // ── Usuários: tudo exige autenticação ────────────────────
                        .requestMatchers("/usuarios/**").authenticated()
                        .requestMatchers("/auth/me").authenticated()

                        // ── Qualquer outra rota: exige autenticação ───────────────
                        .anyRequest().authenticated())
                // O quê poderia ser adicionado: RBAC(Role Based Access Control)
                // Criar roles, ou seja, determinar quem acessa qual rota.
                // poderia ter uma rota restrita a especialistas
                // .requestMatchers(HttpMethod.POST, "/api/special/**").hasRole("ESPECIALISTA")
                .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        // Coloca esse fitro encadeado antes da autenticação de usuário senha
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // A senha nunca é salva em texto puro, é sempre criptografada.
                                            // O BCrypt é um algoritmo de hashing que é unidirecional, não dá pra
                                            // descriptografar depois.
                                            // Passa por aqui antes de ir para o repository.save()
                                            // Ele usa um valor aleatório "salt" que é misturado com a senha antes de
                                            // aplicar o hash.
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
        // O authenticationManager vai chamar o userDetailsService para carregar o
        // usuário
        // E depois vai validar usando o password encoder.
        // Se tudo der certo, ele gera o JWT
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}