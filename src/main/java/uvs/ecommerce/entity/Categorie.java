package uvs.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(columnNames = "nom"))
public class Categorie extends BaseEntity {
    @Column(nullable = false, length = 120)
    private String nom;
    @Column(length = 1000)
    private String description;
    private String image;
}
