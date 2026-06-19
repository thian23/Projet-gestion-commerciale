package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.ProduitRequest;
import uvs.ecommerce.dto.response.ProduitResponse;
import uvs.ecommerce.exception.ResourceNotFoundException;
import uvs.ecommerce.entity.Produit;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.ProduitService;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProduitServiceImpl extends AbstractCrudService<Produit, ProduitRequest, ProduitResponse> implements ProduitService {
    private final ProduitRepository products; private final CategorieRepository categories; private final VendeurRepository sellers;
    public ProduitServiceImpl(ProduitRepository products, CategorieRepository categories, VendeurRepository sellers) {
        super(products, "Produit"); this.products = products; this.categories = categories; this.sellers = sellers;
    }
    @Override protected Produit toEntity(ProduitRequest r) { var e = new Produit(); apply(e, r); return e; }
    @Override protected void updateEntity(Produit e, ProduitRequest r) { apply(e, r); }
    private void apply(Produit e, ProduitRequest r) {
        e.setNom(r.nom()); e.setDescription(r.description()); e.setPrix(r.prix()); e.setStock(r.stock()); e.setImage(r.image());
        e.setCategorie(categories.findById(r.categorieId()).orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable")));
        e.setVendeur(sellers.findById(r.vendeurId()).orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable")));
        e.setPromotion(r.promotion() == null ? BigDecimal.ZERO : r.promotion());
        e.setNoteMoyenne(r.noteMoyenne() == null ? BigDecimal.ZERO : r.noteMoyenne());
    }
    @Override protected ProduitResponse toResponse(Produit e) {
        return new ProduitResponse(e.getId(), e.getNom(), e.getDescription(), e.getPrix(), e.getStock(), e.getImage(),
                e.getCategorie().getId(), e.getCategorie().getNom(), e.getVendeur().getId(), e.getVendeur().getNomBoutique(), e.getPromotion(), e.getNoteMoyenne());
    }
    @Transactional(readOnly = true) public List<ProduitResponse> byCategory(Long id) { return products.findByCategorieId(id).stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true) public List<ProduitResponse> bySeller(Long id) { return products.findByVendeurId(id).stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true) public List<ProduitResponse> search(String name) { return products.findByNomContainingIgnoreCase(name).stream().map(this::toResponse).toList(); }
}
