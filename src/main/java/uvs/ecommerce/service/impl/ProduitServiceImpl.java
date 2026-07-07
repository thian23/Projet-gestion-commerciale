package uvs.ecommerce.service.impl;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.dto.request.ProduitRequest;
import uvs.ecommerce.dto.response.ProduitResponse;
import uvs.ecommerce.entity.Vendeur;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.exception.BusinessException;
import uvs.ecommerce.exception.ResourceNotFoundException;
import uvs.ecommerce.entity.Produit;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.security.SecurityUtils;
import uvs.ecommerce.service.interfaces.ProduitService;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProduitServiceImpl extends AbstractCrudService<Produit, ProduitRequest, ProduitResponse> implements ProduitService {
    private final ProduitRepository products; private final CategorieRepository categories; private final VendeurRepository sellers;
    public ProduitServiceImpl(ProduitRepository products, CategorieRepository categories, VendeurRepository sellers) {
        super(products, "Produit"); this.products = products; this.categories = categories; this.sellers = sellers;
    }

    @Override
    public ProduitResponse create(ProduitRequest request) {
        var user = SecurityUtils.requireCurrentUser();
        Long vendeurId = request.vendeurId();
        if (user.role() != Role.ADMIN) {
            Vendeur own = sellers.findByUtilisateurId(user.id())
                    .orElseThrow(() -> new BusinessException("Vous devez avoir une boutique pour ajouter un produit"));
            if (own.getStatut() != uvs.ecommerce.enums.StatutVendeur.VALIDE) {
                throw new BusinessException("Votre boutique doit etre validee par un administrateur avant de publier des produits");
            }
            vendeurId = own.getId();
        }
        return super.create(withVendeur(request, vendeurId));
    }

    @Override
    public ProduitResponse update(Long id, ProduitRequest request) {
        Produit existing = getEntity(id);
        var user = SecurityUtils.requireCurrentUser();
        boolean admin = user.role() == Role.ADMIN;
        if (!admin && !existing.getVendeur().getUtilisateur().getId().equals(user.id())) {
            throw new AccessDeniedException("Vous ne pouvez modifier que vos propres produits");
        }
        Long vendeurId = admin ? request.vendeurId() : existing.getVendeur().getId();
        return super.update(id, withVendeur(request, vendeurId));
    }

    @Override
    public void delete(Long id) {
        Produit existing = getEntity(id);
        var user = SecurityUtils.requireCurrentUser();
        if (user.role() != Role.ADMIN && !existing.getVendeur().getUtilisateur().getId().equals(user.id())) {
            throw new AccessDeniedException("Vous ne pouvez supprimer que vos propres produits");
        }
        super.delete(id);
    }

    private ProduitRequest withVendeur(ProduitRequest r, Long vendeurId) {
        return new ProduitRequest(r.nom(), r.description(), r.prix(), r.ancienPrix(), r.stock(), r.image(),
                r.categorieId(), vendeurId, r.promotion(), r.noteMoyenne(), r.avis(), r.livraisonGratuite(), r.nouveau(), r.marque());
    }
    @Override protected Produit toEntity(ProduitRequest r) { var e = new Produit(); apply(e, r); return e; }
    @Override protected void updateEntity(Produit e, ProduitRequest r) { apply(e, r); }
    private void apply(Produit e, ProduitRequest r) {
        e.setNom(r.nom()); e.setDescription(r.description()); e.setPrix(r.prix()); e.setAncienPrix(r.ancienPrix()); e.setStock(r.stock()); e.setImage(r.image());
        e.setCategorie(categories.findById(r.categorieId()).orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable")));
        e.setVendeur(sellers.findById(r.vendeurId()).orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable")));
        e.setPromotion(r.promotion() == null ? BigDecimal.ZERO : r.promotion());
        e.setNoteMoyenne(r.noteMoyenne() == null ? BigDecimal.ZERO : r.noteMoyenne());
        e.setAvis(r.avis() == null ? 0 : r.avis());
        e.setLivraisonGratuite(Boolean.TRUE.equals(r.livraisonGratuite()));
        e.setNouveau(Boolean.TRUE.equals(r.nouveau()));
        e.setMarque(r.marque());
    }
    @Override protected ProduitResponse toResponse(Produit e) {
        return new ProduitResponse(e.getId(), e.getNom(), e.getDescription(), e.getPrix(), e.getAncienPrix(), e.getStock(), e.getImage(),
                e.getCategorie().getId(), e.getCategorie().getNom(), e.getVendeur().getId(), e.getVendeur().getNomBoutique(), e.getPromotion(), e.getNoteMoyenne(),
                e.getAvis(), e.getLivraisonGratuite(), e.getNouveau(), e.getMarque());
    }
    @Transactional(readOnly = true) public List<ProduitResponse> byCategory(Long id) { return products.findByCategorieId(id).stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true) public List<ProduitResponse> bySeller(Long id) { return products.findByVendeurId(id).stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true) public List<ProduitResponse> search(String name) { return products.findByNomContainingIgnoreCase(name).stream().map(this::toResponse).toList(); }
}

