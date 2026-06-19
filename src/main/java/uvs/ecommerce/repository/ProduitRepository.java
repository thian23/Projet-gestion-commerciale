package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Produit;
import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByCategorieId(Long categorieId);

    List<Produit> findByVendeurId(Long vendeurId);

    List<Produit> findByNomContainingIgnoreCase(String nom);
}
