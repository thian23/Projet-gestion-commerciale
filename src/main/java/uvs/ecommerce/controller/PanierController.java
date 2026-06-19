package uvs.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.PanierRequest;
import uvs.ecommerce.dto.response.PanierResponse;
import uvs.ecommerce.service.interfaces.PanierService;
import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class PanierController extends AbstractCrudController<PanierRequest, PanierResponse> {
    private final PanierService carts;

    public PanierController(PanierService service) {
        super(service);
        this.carts = service;
    }

    @GetMapping("/user/{userId}")
    public List<PanierResponse> byUser(@PathVariable Long userId) {
        return carts.byUser(userId);
    }

    @DeleteMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@PathVariable Long userId) {
        carts.clear(userId);
    }
}
