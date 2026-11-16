package br.com.bibliotecabetim.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        System.out.println("[JWT Filter] Token recebido: " + jwt);
        final String username = jwtService.extrairUsername(jwt);

        // Try to validate token and set authentication if valid
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Load UsuarioPrincipal directly from repository (avoids circular dependency)
                Usuario usuario = usuarioRepository.findByEmail(username)
                        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));
                UserDetails userDetails = UsuarioPrincipal.build(usuario);
                System.out.println("[JWT Filter] UserDetails carregado: " + userDetails.getClass().getName() + " - " + userDetails.getUsername());

                if (jwtService.isTokenValido(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[JWT Filter] Principal autenticado: " + authToken.getPrincipal());
                } else {
                    System.out.println("[JWT Filter] Token inválido para usuário: " + username);
                }
            } catch (Exception ex) {
                System.out.println("[JWT Filter] Erro ao processar token: " + ex.getMessage());
                ex.printStackTrace();
            }
        } else {
            System.out.println("[JWT Filter] Username null ou authentication já existe: username=" + username);
        }
        filterChain.doFilter(request, response);
    }
}
