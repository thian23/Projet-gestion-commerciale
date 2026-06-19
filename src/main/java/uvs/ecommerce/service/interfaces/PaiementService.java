package uvs.ecommerce.service.interfaces;
import uvs.ecommerce.dto.request.PaiementRequest;
import uvs.ecommerce.dto.response.PaiementResponse;
public interface PaiementService extends CrudService<PaiementRequest, PaiementResponse> {
    PaiementResponse byOrder(Long orderId);
}
