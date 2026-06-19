package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import uvs.ecommerce.enums.StatutCommande;

@Getter
@Setter
@Entity
@Table(name = "commandes")
public class Commande extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    @Column(name = "date_commande", nullable = false, updatable = false)
    private LocalDateTime dateCommande;
    @Column(name = "montant_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantTotal;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutCommande statut = StatutCommande.EN_ATTENTE;
    @Column(name = "mode_paiement", nullable = false, length = 50)
    private String modePaiement;
    @Column(name = "adresse_livraison", nullable = false, length = 500)
    private String adresseLivraison;
    @Column(nullable = false, length = 30)
    private String telephone;

    @PrePersist
    void initialiserDate() {
        if (dateCommande == null)
            dateCommande = LocalDateTime.now();
    }
}
