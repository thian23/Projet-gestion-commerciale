package uvs.ecommerce.dto.response;
import uvs.ecommerce.enums.StatutPaiement;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record PaiementResponse(Long id, Long commandeId, BigDecimal montant,
        String moyenPaiement, StatutPaiement statut, LocalDateTime datePaiement,
        String identifiantTransaction) {}
