package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import uvs.ecommerce.enums.StatutVendeur;

@Getter
@Setter
@Entity
@Table(name = "vendeurs")
public class Vendeur extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;
    @Column(name = "nom_boutique", nullable = false, length = 150)
    private String nomBoutique;
    @Column(length = 2000)
    private String description;
    private String logo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutVendeur statut = StatutVendeur.EN_ATTENTE;
}
