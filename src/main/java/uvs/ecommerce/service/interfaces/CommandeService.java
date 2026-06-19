package uvs.ecommerce.service.interfaces;
import uvs.ecommerce.dto.request.CommandeRequest;
import uvs.ecommerce.dto.response.CommandeResponse;
import java.util.List;
public interface CommandeService extends CrudService<CommandeRequest, CommandeResponse> {
    List<CommandeResponse> byUser(Long userId);
}
