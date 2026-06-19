package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Paiement;
import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByCommandeId(Long commandeId);

    boolean existsByCommandeId(Long commandeId);

    boolean existsByCommandeIdAndIdNot(Long commandeId, Long id);
}
