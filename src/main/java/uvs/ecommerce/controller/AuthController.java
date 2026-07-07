package uvs.ecommerce.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uvs.ecommerce.entity.Utilisateur;
import uvs.ecommerce.entity.Vendeur;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.enums.StatutVendeur;
import uvs.ecommerce.exception.BusinessException;
import uvs.ecommerce.repository.UtilisateurRepository;
import uvs.ecommerce.repository.VendeurRepository;
import uvs.ecommerce.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UtilisateurRepository users;
    private final VendeurRepository sellers;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthController(UtilisateurRepository users, VendeurRepository sellers, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users;
        this.sellers = sellers;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Utilisateur user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BusinessException("Identifiants invalides"));
        if (!encoder.matches(request.motDePasse(), user.getMotDePasse())) {
            throw new BusinessException("Identifiants invalides");
        }
        if (Boolean.TRUE.equals(user.getBloque())) {
            throw new BusinessException("Ce compte a ete bloque");
        }
        return toResponse(user);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException("Cet email est deja utilise");
        }
        Role role = request.role() == null ? Role.ACHETEUR : request.role();
        if (role == Role.ADMIN) {
            throw new BusinessException("Inscription en tant qu'administrateur non autorisee");
        }

        Utilisateur user = new Utilisateur();
        user.setNom(request.nom());
        user.setEmail(request.email().trim().toLowerCase());
        user.setMotDePasse(encoder.encode(request.motDePasse()));
        user.setRole(role);
        user.setTelephone(request.telephone());
        user.setAdresse(request.adresse());
        user = users.save(user);

        if (role == Role.VENDEUR) {
            Vendeur seller = new Vendeur();
            seller.setUtilisateur(user);
            seller.setNomBoutique(request.nomBoutique() != null && !request.nomBoutique().isBlank() ? request.nomBoutique() : request.nom());
            seller.setDescription("Nouvelle boutique SenBazar");
            seller.setLogo(request.nom().substring(0, 1).toUpperCase());
            seller.setStatut(StatutVendeur.EN_ATTENTE);
            sellers.save(seller);
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(Utilisateur user) {
        String token = jwtService.generateToken(user);
        Long vendeurId = sellers.findByUtilisateurId(user.getId()).map(Vendeur::getId).orElse(null);
        return new AuthResponse(user.getId(), user.getNom(), user.getEmail(), user.getRole(), user.getTelephone(), user.getAdresse(), token, vendeurId);
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String motDePasse) {}
    public record RegisterRequest(@NotBlank @Size(max = 100) String nom, @NotBlank @Email String email,
                                  @NotBlank @Size(min = 4, max = 100) String motDePasse, Role role,
                                  String telephone, String adresse, String nomBoutique) {}
    public record AuthResponse(Long id, String nom, String email, Role role, String telephone, String adresse, String token, Long vendeurId) {}
}
