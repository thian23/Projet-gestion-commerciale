package uvs.ecommerce.dto.response;
import uvs.ecommerce.enums.Role;
import java.time.LocalDateTime;
public record UtilisateurResponse(Long id, String nom, String email, Role role,
        String telephone, String adresse, LocalDateTime dateInscription) {}
