package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
public record CategorieRequest(@NotBlank @Size(max = 120) String nom,
        @Size(max = 1000) String description, String image) {}
