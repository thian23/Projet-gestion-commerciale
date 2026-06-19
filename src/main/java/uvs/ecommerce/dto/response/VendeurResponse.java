package uvs.ecommerce.dto.response;
import uvs.ecommerce.enums.StatutVendeur;
public record VendeurResponse(Long id, Long utilisateurId, String nomUtilisateur,
        String nomBoutique, String description, String logo, StatutVendeur statut) {}
