package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
public record PanierRequest(@NotNull Long utilisateurId, @NotNull Long produitId,
        @NotNull @Min(1) Integer quantite) {}
