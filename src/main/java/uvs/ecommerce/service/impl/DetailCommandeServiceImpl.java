package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.DetailCommandeRequest;
import uvs.ecommerce.dto.response.DetailCommandeResponse;
import uvs.ecommerce.exception.*;
import uvs.ecommerce.entity.DetailCommande;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.DetailCommandeService;
import java.util.List;

@Service
public class DetailCommandeServiceImpl extends AbstractCrudService<DetailCommande, DetailCommandeRequest, DetailCommandeResponse> implements DetailCommandeService {
    private final DetailCommandeRepository details; private final CommandeRepository orders; private final ProduitRepository products;
    public DetailCommandeServiceImpl(DetailCommandeRepository details, CommandeRepository orders, ProduitRepository products) {
        super(details, "Détail de commande"); this.details = details; this.orders = orders; this.products = products;
    }
    @Override protected DetailCommande toEntity(DetailCommandeRequest r) {
        if (details.existsByCommandeIdAndProduitId(r.commandeId(), r.produitId())) throw new BusinessException("Ce produit est déjà présent dans la commande");
        var e = new DetailCommande(); apply(e, r); return e;
    }
    @Override protected void updateEntity(DetailCommande e, DetailCommandeRequest r) {
        if (details.existsByCommandeIdAndProduitIdAndIdNot(r.commandeId(), r.produitId(), e.getId())) throw new BusinessException("Ce produit est déjà présent dans la commande");
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
    @Transactional(readOnly = true) public List<DetailCommandeResponse> byOrder(Long id) { return details.findByCommandeId(id).stream().map(this::toResponse).toList(); }
}
