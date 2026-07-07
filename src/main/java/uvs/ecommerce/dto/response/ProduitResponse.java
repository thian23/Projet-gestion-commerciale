package uvs.ecommerce.dto.response;
import java.math.BigDecimal;
public record ProduitResponse(Long id, String nom, String description, BigDecimal prix,
        BigDecimal ancienPrix, Integer stock, String image, Long categorieId, String categorieNom,
        Long vendeurId, String nomBoutique, BigDecimal promotion, BigDecimal noteMoyenne,
        Integer avis, Boolean livraisonGratuite, Boolean nouveau, String marque) {}

