package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "produits")
public class Produit extends BaseEntity {
    @Column(nullable = false, length = 180)
    private String nom;
    @Column(length = 3000)
    private String description;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prix;
    @Column(nullable = false)
    private Integer stock;
    private String image;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendeur_id", nullable = false)
    private Vendeur vendeur;
    @Column(precision = 5, scale = 2)
    private BigDecimal promotion = BigDecimal.ZERO;
    @Column(name = "note_moyenne", precision = 3, scale = 2)
    private BigDecimal noteMoyenne = BigDecimal.ZERO;
}
