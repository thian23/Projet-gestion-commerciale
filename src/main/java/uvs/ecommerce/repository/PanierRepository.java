package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Panier;
import java.util.List;

public interface PanierRepository extends JpaRepository<Panier, Long> {
    List<Panier> findByUtilisateurId(Long utilisateurId);

    boolean existsByUtilisateurIdAndProduitId(Long utilisateurId, Long produitId);

    boolean existsByUtilisateurIdAndProduitIdAndIdNot(Long utilisateurId, Long produitId, Long id);

    void deleteByUtilisateurId(Long utilisateurId);
}
