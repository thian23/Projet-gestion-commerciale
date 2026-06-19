package uvs.ecommerce.dto.request;
import jakarta.validation.constraints.*;
import uvs.ecommerce.enums.StatutPaiement;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record PaiementRequest(@NotNull Long commandeId,
        @NotNull @DecimalMin("0.0") BigDecimal montant,
        @NotBlank @Size(max = 50) String moyenPaiement,
        @NotNull StatutPaiement statut, LocalDateTime datePaiement,
        String identifiantTransaction) {}
