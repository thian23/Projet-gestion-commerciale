package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.PanierRequest;
import uvs.ecommerce.dto.response.PanierResponse;
import uvs.ecommerce.exception.*;
import uvs.ecommerce.entity.Panier;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.PanierService;
import java.util.List;

@Service
public class PanierServiceImpl extends AbstractCrudService<Panier, PanierRequest, PanierResponse> implements PanierService {
    private final PanierRepository carts; private final UtilisateurRepository users; private final ProduitRepository products;
    public PanierServiceImpl(PanierRepository carts, UtilisateurRepository users, ProduitRepository products) {
        super(carts, "Ligne de panier"); this.carts = carts; this.users = users; this.products = products;
    }
    @Override protected Panier toEntity(PanierRequest r) {
        if (carts.existsByUtilisateurIdAndProduitId(r.utilisateurId(), r.produitId())) throw new BusinessException("Ce produit est déjà dans le panier");
        var e = new Panier(); apply(e, r); return e;
    }
    @Override protected void updateEntity(Panier e, PanierRequest r) {
        if (carts.existsByUtilisateurIdAndProduitIdAndIdNot(r.utilisateurId(), r.produitId(), e.getId())) throw new BusinessException("Ce produit est déjà dans le panier");
        apply(e, r);
    }
    private void apply(Panier e, PanierRequest r) {
        var product = products.findById(r.produitId()).orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        if (r.quantite() > product.getStock()) throw new BusinessException("Stock insuffisant");
        e.setUtilisateur(users.findById(r.utilisateurId()).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable")));
        e.setProduit(product); e.setQuantite(r.quantite());
    }
    @Override protected PanierResponse toResponse(Panier e) {
        var total = e.getProduit().getPrix().multiply(java.math.BigDecimal.valueOf(e.getQuantite()));
        return new PanierResponse(e.getId(), e.getUtilisateur().getId(), e.getProduit().getId(), e.getProduit().getNom(),
                e.getProduit().getPrix(), e.getQuantite(), total, e.getDateAjout());
    }
    @Transactional(readOnly = true) public List<PanierResponse> byUser(Long id) { return carts.findByUtilisateurId(id).stream().map(this::toResponse).toList(); }
    public void clear(Long userId) { carts.deleteByUtilisateurId(userId); }
}
