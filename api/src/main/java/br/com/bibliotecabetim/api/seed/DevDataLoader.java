package br.com.bibliotecabetim.api.seed;

import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.Papel;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DevDataLoader {

    @Bean
    @Profile("dev")
    public ApplicationRunner seed(UsuarioRepository usuarioRepository, LivroRepository livroRepository,
                                  ExemplarRepository exemplarRepository,
                                  PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.count() > 0) {
                return; // já populado
            }

            // Bibliotecário
            Usuario bibliotecario = new Usuario();
            bibliotecario.setNome("Bibliotecário Betim");
            bibliotecario.setEmail("biblio@bibliotecabetim.br");
            bibliotecario.setCpf("111.111.111-11");
            bibliotecario.setTelefone("(31) 3000-0000");
            bibliotecario.setSenhaHash(passwordEncoder.encode("biblio123"));
            bibliotecario.setPapel(Papel.BIBLIOTECARIO);
            bibliotecario.setAtivo(true);
            usuarioRepository.save(bibliotecario);

            // Morador
            Usuario morador = new Usuario();
            morador.setNome("Maria Moradora");
            morador.setEmail("maria@email.com.br");
            morador.setCpf("222.222.222-22");
            morador.setTelefone("(31) 9000-0000");
            morador.setSenhaHash(passwordEncoder.encode("morador123"));
            morador.setPapel(Papel.MORADOR);
            morador.setAtivo(true);
            morador = usuarioRepository.save(morador);

            // Livros
            Livro livro1 = new Livro();
            livro1.setTitulo("Dom Casmurro");
            livro1.setAutor("Machado de Assis");
            livro1.setIsbn("978-85-0000000-1");
            livro1.setCategoria("Romance");
            livro1.setAnoPublicacao(1899);
            livro1.setResumo("Dom Casmurro é um dos mais famosos romances de Machado de Assis, narrado por Bentinho, que aborda ciúmes e incerteza sobre a traição de Capitu.");
            livro1.setCapaUrl("https://capa.exemplo/dom-casmurro.jpg");
            livro1 = livroRepository.save(livro1);

            Livro livro2 = new Livro();
            livro2.setTitulo("O Cortiço");
            livro2.setAutor("Aluísio Azevedo");
            livro2.setIsbn("978-85-0000000-2");
            livro2.setCategoria("Romance");
            livro2.setAnoPublicacao(1890);
            livro2.setResumo("O Cortiço retrata a vida em um cortiço do Rio de Janeiro do século XIX, abordando relações sociais e ambientais.");
            livro2.setCapaUrl("https://capa.exemplo/o-cortico.jpg");
            livro2 = livroRepository.save(livro2);

            Livro livro3 = new Livro();
            livro3.setTitulo("Limpeza de Código");
            livro3.setAutor("Robert C. Martin");
            livro3.setIsbn("978-85-0000000-3");
            livro3.setCategoria("Tecnologia");
            livro3.setAnoPublicacao(2009);
            livro3.setResumo("Livro sobre boas práticas de programação e desenvolvimento de software limpo e sustentável.");
            livro3.setCapaUrl("https://capa.exemplo/clean-code.jpg");
            livro3 = livroRepository.save(livro3);

            livroRepository.save(livro1);
            livroRepository.save(livro2);
            livroRepository.save(livro3);

            // Exemplares
            br.com.bibliotecabetim.api.model.Exemplar ex1 = new br.com.bibliotecabetim.api.model.Exemplar();
            ex1.setLivro(livro1);
            ex1.setCodigoTombamento("TOM-001");
            ex1.setStatus(StatusExemplar.DISPONIVEL);

            br.com.bibliotecabetim.api.model.Exemplar ex2 = new br.com.bibliotecabetim.api.model.Exemplar();
            ex2.setLivro(livro1);
            ex2.setCodigoTombamento("TOM-002");
            ex2.setStatus(StatusExemplar.DISPONIVEL);

            br.com.bibliotecabetim.api.model.Exemplar ex3 = new br.com.bibliotecabetim.api.model.Exemplar();
            ex3.setLivro(livro2);
            ex3.setCodigoTombamento("TOM-003");
            ex3.setStatus(StatusExemplar.DISPONIVEL);

            br.com.bibliotecabetim.api.model.Exemplar ex4 = new br.com.bibliotecabetim.api.model.Exemplar();
            ex4.setLivro(livro3);
            ex4.setCodigoTombamento("TOM-004");
            ex4.setStatus(StatusExemplar.DISPONIVEL);

            exemplarRepository.save(ex1);
            exemplarRepository.save(ex2);
            exemplarRepository.save(ex3);
            exemplarRepository.save(ex4);
        };
    }
}
