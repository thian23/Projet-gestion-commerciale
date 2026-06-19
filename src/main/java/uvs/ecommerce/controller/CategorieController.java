package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.CategorieRequest;
import uvs.ecommerce.dto.response.CategorieResponse;
import uvs.ecommerce.service.interfaces.CategorieService;

@RestController
@RequestMapping("/api/categories")
public class CategorieController extends AbstractCrudController<CategorieRequest, CategorieResponse> {
    public CategorieController(CategorieService service) {
        super(service);
    }
}
