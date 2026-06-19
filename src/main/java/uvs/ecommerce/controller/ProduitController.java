package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.ProduitRequest;
import uvs.ecommerce.dto.response.ProduitResponse;
import uvs.ecommerce.service.interfaces.ProduitService;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProduitController extends AbstractCrudController<ProduitRequest, ProduitResponse> {
    private final ProduitService products;

    public ProduitController(ProduitService service) {
        super(service);
        this.products = service;
    }

    @GetMapping("/category/{categoryId}")
    public List<ProduitResponse> byCategory(@PathVariable Long categoryId) {
        return products.byCategory(categoryId);
    }

    @GetMapping("/seller/{sellerId}")
    public List<ProduitResponse> bySeller(@PathVariable Long sellerId) {
        return products.bySeller(sellerId);
    }

    @GetMapping("/search")
    public List<ProduitResponse> search(@RequestParam String name) {
        return products.search(name);
    }
}
