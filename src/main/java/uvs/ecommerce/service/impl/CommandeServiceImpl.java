package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.CommandeRequest;
import uvs.ecommerce.dto.response.CommandeResponse;
import uvs.ecommerce.exception.ResourceNotFoundException;
import uvs.ecommerce.entity.Commande;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.CommandeService;
import java.util.List;

@Service
public class CommandeServiceImpl extends AbstractCrudService<Commande, CommandeRequest, CommandeResponse> implements CommandeService {
    private final CommandeRepository orders;
    private final UtilisateurRepository users;

    public CommandeServiceImpl(CommandeRepository orders, UtilisateurRepository users) {
        super(orders, "Commande");
        this.orders = orders;
        this.users = users;
    }

    @Override
    protected Commande toEntity(CommandeRequest r) {
        var e = new Commande();
        apply(e, r);
        return e;
    }

    @Override
    protected void updateEntity(Commande e, CommandeRequest r) {
        apply(e, r);
    }

    private void apply(Commande e, CommandeRequest r) {
        e.setUtilisateur(users.findById(r.utilisateurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable")));
        e.setMontantTotal(r.montantTotal());
        e.setStatut(r.statut());
        e.setModePaiement(r.modePaiement());
        e.setAdresseLivraison(r.adresseLivraison());
        e.setTelephone(r.telephone());
    }

    @Override
    protected CommandeResponse toResponse(Commande e) {
        return new CommandeResponse(e.getId(), e.getUtilisateur().getId(), e.getUtilisateur().getNom(), e.getDateCommande(),
                e.getMontantTotal(),
                e.getStatut(), e.getModePaiement(), e.getAdresseLivraison(), e.getTelephone());
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> byUser(Long id) {
        return orders.findByUtilisateurIdOrderByDateCommandeDesc(id).stream().map(this::toResponse).toList();
    }
}
