package uvs.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.dto.request.CommandeRequest;
import uvs.ecommerce.dto.response.CommandeResponse;
import uvs.ecommerce.service.interfaces.CommandeService;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class CommandeController extends AbstractCrudController<CommandeRequest, CommandeResponse> {
    private final CommandeService orders;

    public CommandeController(CommandeService service) {
        super(service);
        this.orders = service;
    }

    @GetMapping("/user/{userId}")
    public List<CommandeResponse> byUser(@PathVariable Long userId) {
        return orders.byUser(userId);
    }
}
