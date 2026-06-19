package uvs.ecommerce.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record PanierResponse(Long id, Long utilisateurId, Long produitId, String produitNom,
        BigDecimal prixUnitaire, Integer quantite, BigDecimal sousTotal,
        LocalDateTime dateAjout) {}
