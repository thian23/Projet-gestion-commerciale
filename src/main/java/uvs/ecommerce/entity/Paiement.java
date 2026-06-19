package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import uvs.ecommerce.enums.StatutPaiement;

@Getter
@Setter
@Entity
@Table(name = "paiements")
public class Paiement extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commande_id", nullable = false, unique = true)
    private Commande commande;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;
    @Column(name = "moyen_paiement", nullable = false, length = 50)
    private String moyenPaiement;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;
    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
    @Column(name = "transaction_id", unique = true)
    private String identifiantTransaction;
}
