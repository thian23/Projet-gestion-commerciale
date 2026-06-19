package uvs.ecommerce.service.interfaces;
import uvs.ecommerce.dto.request.DetailCommandeRequest;
import uvs.ecommerce.dto.response.DetailCommandeResponse;
import java.util.List;
public interface DetailCommandeService extends CrudService<DetailCommandeRequest, DetailCommandeResponse> {
    List<DetailCommandeResponse> byOrder(Long orderId);
}
