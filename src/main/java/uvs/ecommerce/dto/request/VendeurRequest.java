package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import uvs.ecommerce.enums.StatutVendeur;
public record VendeurRequest(@NotNull Long utilisateurId,
        @NotBlank @Size(max = 150) String nomBoutique,
        @Size(max = 2000) String description, String logo,
        @NotNull StatutVendeur statut) {}
