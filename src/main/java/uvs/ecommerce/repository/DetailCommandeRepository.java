package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.DetailCommande;
import java.util.List;

public interface DetailCommandeRepository extends JpaRepository<DetailCommande, Long> {
    List<DetailCommande> findByCommandeId(Long commandeId);

    boolean existsByCommandeIdAndProduitId(Long commandeId, Long produitId);

    boolean existsByCommandeIdAndProduitIdAndIdNot(Long commandeId, Long produitId, Long id);
}
