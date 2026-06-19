package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "paniers", uniqueConstraints = @UniqueConstraint(columnNames = { "utilisateur_id", "produit_id" }))
public class Panier extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;
    @Column(nullable = false)
    private Integer quantite;
    @Column(name = "date_ajout", nullable = false, updatable = false)
    private LocalDateTime dateAjout;

    @PrePersist
    void initialiserDate() {
        if (dateAjout == null)
            dateAjout = LocalDateTime.now();
    }
}
