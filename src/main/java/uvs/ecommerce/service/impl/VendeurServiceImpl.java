package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import uvs.ecommerce.dto.request.VendeurRequest;
import uvs.ecommerce.dto.response.VendeurResponse;
import uvs.ecommerce.exception.*;
import uvs.ecommerce.entity.Vendeur;
import uvs.ecommerce.repository.*;
import uvs.ecommerce.service.interfaces.VendeurService;

@Service
public class VendeurServiceImpl extends AbstractCrudService<Vendeur, VendeurRequest, VendeurResponse> implements VendeurService {
    private final VendeurRepository sellers;
    private final UtilisateurRepository users;
    public VendeurServiceImpl(VendeurRepository sellers, UtilisateurRepository users) {
        super(sellers, "Vendeur"); this.sellers = sellers; this.users = users;
    }
    @Override protected Vendeur toEntity(VendeurRequest r) {
        if (sellers.existsByUtilisateurId(r.utilisateurId())) throw new BusinessException("Cet utilisateur possède déjà une boutique");
        var e = new Vendeur(); apply(e, r); return e;
    }
    @Override protected void updateEntity(Vendeur e, VendeurRequest r) {
        if (sellers.existsByUtilisateurIdAndIdNot(r.utilisateurId(), e.getId())) throw new BusinessException("Cet utilisateur possède déjà une boutique");
        apply(e, r);
    }
    private void apply(Vendeur e, VendeurRequest r) {
        e.setUtilisateur(users.findById(r.utilisateurId()).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable")));
        e.setNomBoutique(r.nomBoutique()); e.setDescription(r.description()); e.setLogo(r.logo()); e.setStatut(r.statut());
    }
    @Override protected VendeurResponse toResponse(Vendeur e) {
        return new VendeurResponse(e.getId(), e.getUtilisateur().getId(), e.getUtilisateur().getNom(), e.getNomBoutique(), e.getDescription(), e.getLogo(), e.getStatut());
    }
}
