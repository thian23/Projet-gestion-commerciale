package uvs.ecommerce.service.impl;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uvs.ecommerce.dto.request.UtilisateurRequest;
import uvs.ecommerce.dto.response.UtilisateurResponse;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.exception.BusinessException;
import uvs.ecommerce.entity.Utilisateur;
import uvs.ecommerce.repository.UtilisateurRepository;
import uvs.ecommerce.security.SecurityUtils;
import uvs.ecommerce.service.interfaces.UtilisateurService;

import java.util.List;

@Service
public class UtilisateurServiceImpl extends AbstractCrudService<Utilisateur, UtilisateurRequest, UtilisateurResponse> implements UtilisateurService {
    private final UtilisateurRepository users;
    private final PasswordEncoder encoder;
    public UtilisateurServiceImpl(UtilisateurRepository users, PasswordEncoder encoder) {
        super(users, "Utilisateur"); this.users = users; this.encoder = encoder;
    }
    @Override protected Utilisateur toEntity(UtilisateurRequest r) {
        if (users.existsByEmailIgnoreCase(r.email())) throw new BusinessException("Cet email est dAjA utilisA");
        var e = new Utilisateur(); apply(e, r); return e;
    }
    @Override protected void updateEntity(Utilisateur e, UtilisateurRequest r) {
        if (users.existsByEmailIgnoreCaseAndIdNot(r.email(), e.getId())) throw new BusinessException("Cet email est dAjA utilisA");
        apply(e, r);
    }
    private void apply(Utilisateur e, UtilisateurRequest r) {
        e.setNom(r.nom()); e.setEmail(r.email().trim().toLowerCase());
        e.setMotDePasse(encoder.encode(r.motDePasse())); e.setRole(r.role());
        e.setTelephone(r.telephone()); e.setAdresse(r.adresse());
    }
    @Override protected UtilisateurResponse toResponse(Utilisateur e) {
        return new UtilisateurResponse(e.getId(), e.getNom(), e.getEmail(), e.getRole(), e.getTelephone(), e.getAdresse(), e.getDateInscription(), e.getBloque());
    }

    @Override
    public List<UtilisateurResponse> findAll() {
        SecurityUtils.requireAdmin();
        return super.findAll();
    }

    @Override
    public UtilisateurResponse findById(Long id) {
        var user = SecurityUtils.requireCurrentUser();
        if (user.role() != Role.ADMIN && !id.equals(user.id())) throw new AccessDeniedException("Acces refuse");
        return super.findById(id);
    }

    @Override
    public UtilisateurResponse update(Long id, UtilisateurRequest request) {
        Utilisateur existing = getEntity(id);
        var user = SecurityUtils.requireCurrentUser();
        boolean admin = user.role() == Role.ADMIN;
        if (!admin && !id.equals(user.id())) throw new AccessDeniedException("Acces refuse");
        // a non-admin cannot change their own role
        Role role = admin ? request.role() : existing.getRole();
        UtilisateurRequest corrected = new UtilisateurRequest(request.nom(), request.email(), request.motDePasse(), role, request.telephone(), request.adresse());
        return super.update(id, corrected);
    }

    @Override
    public void delete(Long id) {
        SecurityUtils.requireAdmin();
        super.delete(id);
    }

    @Override
    public UtilisateurResponse toggleBlocked(Long id, boolean bloque) {
        SecurityUtils.requireAdmin();
        Utilisateur user = getEntity(id);
        user.setBloque(bloque);
        return toResponse(users.save(user));
    }
}
