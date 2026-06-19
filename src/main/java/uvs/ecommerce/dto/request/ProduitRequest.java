package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record ProduitRequest(
        @NotBlank @Size(max = 180) String nom,
        @Size(max = 3000) String description,
        @NotNull @DecimalMin("0.0") BigDecimal prix,
        @NotNull @Min(0) Integer stock,
        String image, @NotNull Long categorieId, @NotNull Long vendeurId,
        @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal promotion,
        @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal noteMoyenne) {}
