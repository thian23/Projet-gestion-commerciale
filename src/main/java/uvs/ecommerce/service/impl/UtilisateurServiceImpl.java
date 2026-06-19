package uvs.ecommerce.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uvs.ecommerce.dto.request.UtilisateurRequest;
import uvs.ecommerce.dto.response.UtilisateurResponse;
import uvs.ecommerce.exception.BusinessException;
import uvs.ecommerce.entity.Utilisateur;
import uvs.ecommerce.repository.UtilisateurRepository;
import uvs.ecommerce.service.interfaces.UtilisateurService;

@Service
public class UtilisateurServiceImpl extends AbstractCrudService<Utilisateur, UtilisateurRequest, UtilisateurResponse> implements UtilisateurService {
    private final UtilisateurRepository users;
    private final PasswordEncoder encoder;
    public UtilisateurServiceImpl(UtilisateurRepository users, PasswordEncoder encoder) {
        super(users, "Utilisateur"); this.users = users; this.encoder = encoder;
    }
    @Override protected Utilisateur toEntity(UtilisateurRequest r) {
        if (users.existsByEmailIgnoreCase(r.email())) throw new BusinessException("Cet email est déjà utilisé");
        var e = new Utilisateur(); apply(e, r); return e;
    }
    @Override protected void updateEntity(Utilisateur e, UtilisateurRequest r) {
        if (users.existsByEmailIgnoreCaseAndIdNot(r.email(), e.getId())) throw new BusinessException("Cet email est déjà utilisé");
        apply(e, r);
    }
    private void apply(Utilisateur e, UtilisateurRequest r) {
        e.setNom(r.nom()); e.setEmail(r.email().trim().toLowerCase());
        e.setMotDePasse(encoder.encode(r.motDePasse())); e.setRole(r.role());
        e.setTelephone(r.telephone()); e.setAdresse(r.adresse());
    }
    @Override protected UtilisateurResponse toResponse(Utilisateur e) {
        return new UtilisateurResponse(e.getId(), e.getNom(), e.getEmail(), e.getRole(), e.getTelephone(), e.getAdresse(), e.getDateInscription());
    }
}
