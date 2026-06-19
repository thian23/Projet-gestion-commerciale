package uvs.ecommerce.service.interfaces;
import java.util.List;
public interface CrudService<Q, S> {
    List<S> findAll();
    S findById(Long id);
    S create(Q request);
    S update(Long id, Q request);
    void delete(Long id);
}
