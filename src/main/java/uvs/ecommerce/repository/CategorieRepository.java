package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Categorie;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
