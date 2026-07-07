package uvs.ecommerce.service.impl;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.CommandeRequest;
import uvs.ecommerce.dto.response.CommandeResponse;
import uvs.ecommerce.entity.Vendeur;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.exception.ResourceNotFoundException;
import uvs.ecommerce.entity.Commande;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.security.SecurityUtils;
import uvs.ecommerce.service.interfaces.CommandeService;

import java.util.Comparator;
import java.util.List;

@Service
public class CommandeServiceImpl extends AbstractCrudService<Commande, CommandeRequest, CommandeResponse> implements CommandeService {
    private final CommandeRepository orders;
    private final UtilisateurRepository users;
    private final DetailCommandeRepository details;
    private final VendeurRepository sellers;

    public CommandeServiceImpl(CommandeRepository orders, UtilisateurRepository users, DetailCommandeRepository details, VendeurRepository sellers) {
        super(orders, "Commande");
        this.orders = orders;
        this.users = users;
        this.details = details;
        this.sellers = sellers;
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

    @Override
    public CommandeResponse create(CommandeRequest request) {
        var user = SecurityUtils.requireCurrentUser();
        Long utilisateurId = user.role() == Role.ADMIN ? request.utilisateurId() : user.id();
        CommandeRequest corrected = new CommandeRequest(utilisateurId, request.montantTotal(), request.statut(),
                request.modePaiement(), request.adresseLivraison(), request.telephone());
        return super.create(corrected);
    }

    @Override
    public CommandeResponse update(Long id, CommandeRequest request) {
        Commande existing = getEntity(id);
        var user = SecurityUtils.requireCurrentUser();
        boolean admin = user.role() == Role.ADMIN;
        boolean owner = existing.getUtilisateur().getId().equals(user.id());
        boolean sellerOnOrder = user.role() == Role.VENDEUR && details.existsForSeller(id, user.id());
        if (!admin && !owner && !sellerOnOrder) {
            throw new AccessDeniedException("Acces refuse a cette commande");
        }
        return super.update(id, request);
    }

    @Override
    public List<CommandeResponse> findAll() {
        SecurityUtils.requireAdmin();
        return super.findAll();
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> byUser(Long userId) {
        var user = SecurityUtils.requireCurrentUser();
        if (user.role() != Role.ADMIN && !userId.equals(user.id())) {
            throw new AccessDeniedException("Acces refuse");
        }
        return orders.findByUtilisateurIdOrderByDateCommandeDesc(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CommandeResponse> bySeller(Long sellerId) {
        var user = SecurityUtils.requireCurrentUser();
        Vendeur seller = sellers.findById(sellerId).orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable"));
        if (user.role() != Role.ADMIN && !seller.getUtilisateur().getId().equals(user.id())) {
            throw new AccessDeniedException("Acces refuse");
        }
        List<Long> ids = details.findCommandeIdsByVendeurId(sellerId);
        return orders.findAllById(ids).stream()
                .sorted(Comparator.comparing(Commande::getDateCommande).reversed())
                .map(this::toResponse).toList();
    }
}
