package uvs.ecommerce.dto.response;

import uvs.ecommerce.enums.StatutCommande;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommandeResponse(Long id, Long utilisateurId, String nomUtilisateur,
                LocalDateTime dateCommande, BigDecimal montantTotal, StatutCommande statut,
                String modePaiement, String adresseLivraison, String telephone) {
}
