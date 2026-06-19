package uvs.ecommerce.dto.response;

import java.math.BigDecimal;

public record DetailCommandeResponse(Long id, Long commandeId, Long produitId,
                String produitNom, Integer quantite, BigDecimal prixUnitaire, BigDecimal sousTotal) {
}
