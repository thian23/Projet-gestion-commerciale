package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.DetailCommandeRequest;
import uvs.ecommerce.dto.response.DetailCommandeResponse;
import uvs.ecommerce.service.interfaces.DetailCommandeService;
import java.util.List;

@RestController
@RequestMapping("/api/order-details")
public class DetailCommandeController extends AbstractCrudController<DetailCommandeRequest, DetailCommandeResponse> {
    private final DetailCommandeService details;

    public DetailCommandeController(DetailCommandeService service) {
        super(service);
        this.details = service;
    }

    @GetMapping("/order/{orderId}")
    public List<DetailCommandeResponse> byOrder(@PathVariable Long orderId) {
        return details.byOrder(orderId);
    }
}
