package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record DetailCommandeRequest(@NotNull Long commandeId, @NotNull Long produitId,
        @NotNull @Min(1) Integer quantite,
        @NotNull @DecimalMin("0.0") BigDecimal prixUnitaire) {}
