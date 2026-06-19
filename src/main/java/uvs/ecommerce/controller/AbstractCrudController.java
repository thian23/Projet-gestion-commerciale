package uvs.ecommerce.controller;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import uvs.ecommerce.service.interfaces.CrudService;
import java.util.List;

public abstract class AbstractCrudController<Q, S> {
    protected final CrudService<Q, S> service;

    protected AbstractCrudController(CrudService<Q, S> service) {
        this.service = service;
    }

    @GetMapping
    public List<S> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public S findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<S> create(@Valid @RequestBody Q request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public S update(@PathVariable Long id, @Valid @RequestBody Q request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
