package br.com.joaomu.controller;

import br.com.joaomu.dto.AuthResponse;
import br.com.joaomu.dto.LoginRequest;
import br.com.joaomu.dto.RegisterRequest;
import br.com.joaomu.dto.UsuarioResponse;
import br.com.joaomu.entity.Usuario;
import br.com.joaomu.repository.UsuarioRepository;
import br.com.joaomu.security.JwtUtil;
import br.com.joaomu.security.TokenBlacklistService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Value("${app.security.cookie-secure:false}")
    private boolean cookieSecure;

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService blacklistService;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder, JwtUtil jwtUtil, TokenBlacklistService blacklistService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.blacklistService = blacklistService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Validação de campos obrigatórios
        if (request.username() == null || request.username().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "O campo 'username' é obrigatório."));
        }
        if (request.password() == null || request.password().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "A senha deve ter pelo menos 6 caracteres."));
        }
        if (request.email() == null || request.email().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", "O campo 'email' é obrigatório."));
        }

        // Verifica duplicidade de username e email
        if (usuarioRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "Username já está em uso."));
        }
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erro", "E-mail já está em uso."));
        }

        Usuario user = new Usuario();
        user.setUsername(request.username().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setNome(request.nome());
        user.setEmail(request.email().trim().toLowerCase());

        usuarioRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        // Geração de Cookie - ResponseCookie
        // Geração de Cookie - ResponseCookie
        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(3600)
                .sameSite("Lax")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(token));

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        // Geração de Cookie - ResponseCookie
        // Geração de Cookie - ResponseCookie
        String token = jwtUtil.generateToken(request.username());
        // Monta o Cookie HttpOnly com SameSite configurado
        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(3600) // Expira em 1 hora (3600 segundos)
                .sameSite("Lax") // Anti-CSRF Define explicitamente SameSite=Lax ou Strict
                .build();
        // Retorna a resposta HTTP com o cabeçalho Set-Cookie
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(token));

        // No login, o usuário é autenticado e recebe um token de autenticação
        // o token é devolvido pelo corpo da resposta AuthResponse
        // Retorna HTTP 200 OK caso o login seja realizado normalmente
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        // Retirar o token do header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Descobre quanto tempo ainda falta para o token expirar
            long remainingTime = jwtUtil.getRemainingExpirationTime(token);

            if (remainingTime > 0) {
                blacklistService.blacklistToken(token, remainingTime);
            }
        }

        // Cria um cookie zerado (maxAge 0) para o navegador apagar a sessão
        // imediatamente
        ResponseCookie deleteCookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0) // 0 segundos obriga o navegador a deletar o cookie
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(Map.of("mensagem", "Logout realizado com sucesso."));
    }

    // Retorna os dados do usuário logado
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        UsuarioResponse response = new UsuarioResponse(
                user.getId(),
                user.getUsername(),
                user.getNome(),
                user.getEmail(),
                user.getAvatar(),
                user.getPontos(),
                user.isEspecialista(),
                user.isAdministrador());

        // Retorna HTTP 200 OK sem o campo password
        return ResponseEntity.ok(response);
    }

    // Endpoint leve para disparar o filtro CSRF do Spring e gravar o cookie XSRF-TOKEN no navegador
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf() {
        return ResponseEntity.ok().build();
    }
}