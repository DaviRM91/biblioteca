package br.com.bibliotecabetim.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UsuarioRepository usuarioRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, UsuarioRepository usuarioRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.usuarioRepository = usuarioRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos - catálogo
                        .requestMatchers(GET, "/api/livros", "/api/livros/*").permitAll()
                        // Endpoints públicos - auth, docs, health
                        .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                        // Rotas de reserva (exigem login)
                        .requestMatchers(GET, "/api/livros/*/reservas/fila").authenticated()
                        .requestMatchers(POST, "/api/livros/*/reservas").authenticated()
                        .requestMatchers(DELETE, "/api/livros/*/reservas/*").authenticated()
                        // Rotas do usuário logado
                        .requestMatchers("/api/me/**").authenticated()
                        // Endpoints de administrador (BIBLIOTECARIO)
                        .requestMatchers(POST, "/api/livros").hasRole("BIBLIOTECARIO")
                        .requestMatchers(PUT, "/api/livros/**").hasRole("BIBLIOTECARIO")
                        .requestMatchers(DELETE, "/api/livros/**").hasRole("BIBLIOTECARIO")
                        .requestMatchers(POST, "/api/livros/*/exemplares").hasRole("BIBLIOTECARIO")
                        .requestMatchers(PUT, "/api/livros/*/exemplares/**").hasRole("BIBLIOTECARIO")
                        .requestMatchers(DELETE, "/api/livros/*/exemplares/**").hasRole("BIBLIOTECARIO")
                        .requestMatchers(POST, "/api/emprestimos").hasRole("BIBLIOTECARIO")
                        .requestMatchers(POST, "/api/emprestimos/*/devolucao").hasRole("BIBLIOTECARIO")
                        .requestMatchers(POST, "/api/emprestimos/*/renovacao").hasRole("BIBLIOTECARIO")
                        // Demais endpoints autenticados
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
            return UsuarioPrincipal.build(usuario);
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authProvider);
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Em dev: só o Vite. Em prod: adicionar o domínio real do front
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // cache do preflight por 1h

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
