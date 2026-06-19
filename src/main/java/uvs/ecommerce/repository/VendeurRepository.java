package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Vendeur;
import java.util.Optional;

public interface VendeurRepository extends JpaRepository<Vendeur, Long> {
    Optional<Vendeur> findByUtilisateurId(Long utilisateurId);

    boolean existsByUtilisateurId(Long utilisateurId);

    boolean existsByUtilisateurIdAndIdNot(Long utilisateurId, Long id);
}
