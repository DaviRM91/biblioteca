package br.com.bibliotecabetim.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "livro")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id")
    private Long id;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "autor", nullable = false)
    private String autor;

    @Column(name = "isbn", unique = true)
    private String isbn;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "ano_publicacao")
    private Integer anoPublicacao;

    @Column(name = "resumo", length = 4000)
    private String resumo;

    @Column(name = "capa_url")
    private String capaUrl;

    @OneToMany(mappedBy = "livro")
    private List<Exemplar> exemplares = new ArrayList<>();
}
