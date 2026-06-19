package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import uvs.ecommerce.enums.Role;

@Getter @Setter
@Entity
@Table(name = "utilisateurs", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class Utilisateur extends BaseEntity {
    @Column(nullable = false, length = 100) private String nom;
    @Column(nullable = false, length = 180) private String email;
    @Column(name = "mot_de_passe", nullable = false) private String motDePasse;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role;
    @Column(length = 30) private String telephone;
    @Column(length = 500) private String adresse;
    @Column(name = "date_inscription", nullable = false, updatable = false) private LocalDateTime dateInscription;

    @PrePersist
    void initialiserDate() {
        if (dateInscription == null) dateInscription = LocalDateTime.now();
        if (role == null) role = Role.ACHETEUR;
    }
}
