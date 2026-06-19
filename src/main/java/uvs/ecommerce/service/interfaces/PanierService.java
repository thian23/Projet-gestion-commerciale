package uvs.ecommerce.service.interfaces;
import uvs.ecommerce.dto.request.PanierRequest;
import uvs.ecommerce.dto.response.PanierResponse;
import java.util.List;
public interface PanierService extends CrudService<PanierRequest, PanierResponse> {
    List<PanierResponse> byUser(Long userId);
    void clear(Long userId);
}
