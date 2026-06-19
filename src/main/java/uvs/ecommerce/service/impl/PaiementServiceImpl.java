package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.PaiementRequest;
import uvs.ecommerce.dto.response.PaiementResponse;
import uvs.ecommerce.exception.*;
import uvs.ecommerce.entity.Paiement;
import uvs.ecommerce.enums.StatutPaiement;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.PaiementService;
import java.time.LocalDateTime;

@Service
public class PaiementServiceImpl extends AbstractCrudService<Paiement, PaiementRequest, PaiementResponse> implements PaiementService {
    private final PaiementRepository payments; private final CommandeRepository orders;
    public PaiementServiceImpl(PaiementRepository payments, CommandeRepository orders) {
        super(payments, "Paiement"); this.payments = payments; this.orders = orders;
    }
    @Override protected Paiement toEntity(PaiementRequest r) {
        if (payments.existsByCommandeId(r.commandeId())) throw new BusinessException("Cette commande possède déjà un paiement");
        var e = new Paiement(); apply(e, r); return e;
    }
    @Override protected void updateEntity(Paiement e, PaiementRequest r) {
        if (payments.existsByCommandeIdAndIdNot(r.commandeId(), e.getId())) throw new BusinessException("Cette commande possède déjà un paiement");
        apply(e, r);
    }
    private void apply(Paiement e, PaiementRequest r) {
        e.setCommande(orders.findById(r.commandeId()).orElseThrow(() -> new ResourceNotFoundException("Commande introuvable")));
        e.setMontant(r.montant()); e.setMoyenPaiement(r.moyenPaiement()); e.setStatut(r.statut());
        e.setDatePaiement(r.datePaiement() != null ? r.datePaiement() : r.statut() == StatutPaiement.PAYE ? LocalDateTime.now() : null);
        e.setIdentifiantTransaction(r.identifiantTransaction());
    }
    @Override protected PaiementResponse toResponse(Paiement e) {
        return new PaiementResponse(e.getId(), e.getCommande().getId(), e.getMontant(), e.getMoyenPaiement(), e.getStatut(), e.getDatePaiement(), e.getIdentifiantTransaction());
    }
    @Transactional(readOnly = true) public PaiementResponse byOrder(Long id) {
        return payments.findByCommandeId(id).map(this::toResponse).orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable pour cette commande"));
    }
}
