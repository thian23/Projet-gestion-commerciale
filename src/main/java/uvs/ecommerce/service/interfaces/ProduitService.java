package uvs.ecommerce.service.interfaces;
import uvs.ecommerce.dto.request.ProduitRequest;
import uvs.ecommerce.dto.response.ProduitResponse;
import java.util.List;
public interface ProduitService extends CrudService<ProduitRequest, ProduitResponse> {
    List<ProduitResponse> byCategory(Long categoryId);
    List<ProduitResponse> bySeller(Long sellerId);
    List<ProduitResponse> search(String name);
}
