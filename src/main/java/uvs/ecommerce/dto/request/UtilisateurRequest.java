package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import uvs.ecommerce.enums.Role;
public record UtilisateurRequest(
        @NotBlank @Size(max = 100) String nom,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 6, max = 100) String motDePasse,
        @NotNull Role role,
        @Size(max = 30) String telephone,
        @Size(max = 500) String adresse) {}
