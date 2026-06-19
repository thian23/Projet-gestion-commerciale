package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.PaiementRequest;
import uvs.ecommerce.dto.response.PaiementResponse;
import uvs.ecommerce.service.interfaces.PaiementService;

@RestController
@RequestMapping("/api/payments")
public class PaiementController extends AbstractCrudController<PaiementRequest, PaiementResponse> {
    private final PaiementService payments;

    public PaiementController(PaiementService service) {
        super(service);
        this.payments = service;
    }

    @GetMapping("/order/{orderId}")
    public PaiementResponse byOrder(@PathVariable Long orderId) {
        return payments.byOrder(orderId);
    }
}
