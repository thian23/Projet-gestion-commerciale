package uvs.ecommerce.service.impl;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import uvs.ecommerce.exception.ResourceNotFoundException;
import uvs.ecommerce.entity.BaseEntity;
import uvs.ecommerce.service.interfaces.CrudService;
import java.util.List;

@Transactional
public abstract class AbstractCrudService<E extends BaseEntity, Q, S> implements CrudService<Q, S> {
    protected final JpaRepository<E, Long> repository;
    private final String resourceName;

    protected AbstractCrudService(JpaRepository<E, Long> repository, String resourceName) {
        this.repository = repository;
        this.resourceName = resourceName;
    }

    @Override
    @Transactional(readOnly = true)
    public List<S> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public S findById(Long id) {
        return toResponse(getEntity(id));
    }

    @Override
    public S create(Q request) {
        return toResponse(repository.save(toEntity(request)));
    }

    @Override
    public S update(Long id, Q request) {
        E entity = getEntity(id);
        updateEntity(entity, request);
        return toResponse(repository.save(entity));
    }

    @Override
    public void delete(Long id) {
        repository.delete(getEntity(id));
    }

    protected E getEntity(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException(resourceName + " introuvable avec l'identifiant " + id));
    }

    protected abstract E toEntity(Q request);

    protected abstract void updateEntity(E entity, Q request);

    protected abstract S toResponse(E entity);
}
