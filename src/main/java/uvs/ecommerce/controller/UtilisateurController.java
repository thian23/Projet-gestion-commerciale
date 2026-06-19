package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.UtilisateurRequest;
import uvs.ecommerce.dto.response.UtilisateurResponse;
import uvs.ecommerce.service.interfaces.UtilisateurService;

@RestController
@RequestMapping("/api/users")
public class UtilisateurController extends AbstractCrudController<UtilisateurRequest, UtilisateurResponse> {
    public UtilisateurController(UtilisateurService service) {
        super(service);
    }
}
