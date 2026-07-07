package uvs.ecommerce.service.impl;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.DetailCommandeRequest;
import uvs.ecommerce.dto.response.DetailCommandeResponse;
import uvs.ecommerce.entity.Commande;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.exception.*;
import uvs.ecommerce.entity.DetailCommande;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.security.SecurityUtils;
import uvs.ecommerce.service.interfaces.DetailCommandeService;
import java.util.List;

@Service
public class DetailCommandeServiceImpl extends AbstractCrudService<DetailCommande, DetailCommandeRequest, DetailCommandeResponse> implements DetailCommandeService {
    private final DetailCommandeRepository details; private final CommandeRepository orders; private final ProduitRepository products;
    public DetailCommandeServiceImpl(DetailCommandeRepository details, CommandeRepository orders, ProduitRepository products) {
        super(details, "DAtail de commande"); this.details = details; this.orders = orders; this.products = products;
    }
    @Override protected DetailCommande toEntity(DetailCommandeRequest r) {
        if (details.existsByCommandeIdAndProduitId(r.commandeId(), r.produitId())) throw new BusinessException("Ce produit est dAjA prAsent dans la commande");
        var e = new DetailCommande(); apply(e, r); return e;
    }
    @Override protected void updateEntity(DetailCommande e, DetailCommandeRequest r) {
        if (details.existsByCommandeIdAndProduitIdAndIdNot(r.commandeId(), r.produitId(), e.getId())) throw new BusinessException("Ce produit est dAjA prAsent dans la commande");
        apply(e, r);
    }
    private void apply(DetailCommande e, DetailCommandeRequest r) {
        e.setCommande(orders.findById(r.commandeId()).orElseThrow(() -> new ResourceNotFoundException("Commande introuvable")));
        e.setProduit(products.findById(r.produitId()).orElseThrow(() -> new ResourceNotFoundException("Produit introuvable")));
        e.setQuantite(r.quantite()); e.setPrixUnitaire(r.prixUnitaire());
    }
    @Override protected DetailCommandeResponse toResponse(DetailCommande e) {
        return new DetailCommandeResponse(e.getId(), e.getCommande().getId(), e.getProduit().getId(), e.getProduit().getNom(), e.getQuantite(),
                e.getPrixUnitaire(), e.getPrixUnitaire().multiply(java.math.BigDecimal.valueOf(e.getQuantite())));
    }

    @Override
    public DetailCommandeResponse create(DetailCommandeRequest request) {
        ownershipCheckForCommande(request.commandeId());
        return super.create(request);
    }

    @Override
    public DetailCommandeResponse update(Long id, DetailCommandeRequest request) {
        DetailCommande existing = getEntity(id);
        ownershipCheckForCommande(existing.getCommande().getId());
        return super.update(id, request);
    }

    @Override
    public void delete(Long id) {
        DetailCommande existing = getEntity(id);
        ownershipCheckForCommande(existing.getCommande().getId());
        super.delete(id);
    }

    @Override
    public List<DetailCommandeResponse> findAll() {
        SecurityUtils.requireAdmin();
        return super.findAll();
    }

    @Transactional(readOnly = true)
    public List<DetailCommandeResponse> byOrder(Long id) {
        ownershipCheckForCommande(id);
        return details.findByCommandeId(id).stream().map(this::toResponse).toList();
    }

    private void ownershipCheckForCommande(Long commandeId) {
        var user = SecurityUtils.requireCurrentUser();
        if (user.role() == Role.ADMIN) return;
        Commande commande = orders.findById(commandeId).orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        boolean owner = commande.getUtilisateur().getId().equals(user.id());
        boolean sellerOnOrder = user.role() == Role.VENDEUR && details.existsForSeller(commandeId, user.id());
        if (!owner && !sellerOnOrder) throw new AccessDeniedException("Acces refuse");
    }
}
