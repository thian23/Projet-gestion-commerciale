package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.VendeurRequest;
import uvs.ecommerce.dto.response.VendeurResponse;
import uvs.ecommerce.service.interfaces.VendeurService;

@RestController
@RequestMapping("/api/sellers")
public class VendeurController extends AbstractCrudController<VendeurRequest, VendeurResponse> {
    public VendeurController(VendeurService service) {
        super(service);
    }
}
