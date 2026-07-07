package uvs.ecommerce.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.UtilisateurRequest;
import uvs.ecommerce.dto.response.UtilisateurResponse;
import uvs.ecommerce.security.SecurityUtils;
import uvs.ecommerce.service.interfaces.UtilisateurService;

@RestController
@RequestMapping("/api/users")
public class UtilisateurController extends AbstractCrudController<UtilisateurRequest, UtilisateurResponse> {
    private final UtilisateurService users;

    public UtilisateurController(UtilisateurService service) {
        super(service);
        this.users = service;
    }

    @GetMapping("/me")
    public UtilisateurResponse me() {
        return users.findById(SecurityUtils.requireCurrentUser().id());
    }

    @PatchMapping("/{id}/bloque")
    public UtilisateurResponse toggleBlocked(@PathVariable Long id, @Valid @RequestBody BlockRequest request) {
        return users.toggleBlocked(id, request.bloque());
    }

    public record BlockRequest(@NotNull Boolean bloque) {}
}
