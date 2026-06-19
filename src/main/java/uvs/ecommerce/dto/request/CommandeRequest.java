package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import uvs.ecommerce.enums.StatutCommande;
import java.math.BigDecimal;
public record CommandeRequest(@NotNull Long utilisateurId,
        @NotNull @DecimalMin("0.0") BigDecimal montantTotal,
        @NotNull StatutCommande statut,
        @NotBlank @Size(max = 50) String modePaiement,
        @NotBlank @Size(max = 500) String adresseLivraison,
        @NotBlank @Size(max = 30) String telephone) {}
