package uvs.ecommerce.service.impl;

import org.springframework.stereotype.Service;
import uvs.ecommerce.dto.request.CategorieRequest;
import uvs.ecommerce.dto.response.CategorieResponse;
import uvs.ecommerce.exception.BusinessException;
import uvs.ecommerce.entity.Categorie;
import uvs.ecommerce.repository.CategorieRepository;
import uvs.ecommerce.service.interfaces.CategorieService;

@Service
public class CategorieServiceImpl extends AbstractCrudService<Categorie, CategorieRequest, CategorieResponse> implements CategorieService {
    private final CategorieRepository categories;

    public CategorieServiceImpl(CategorieRepository categories) {
        super(categories, "Catégorie");
        this.categories = categories;
    }

    @Override
    protected Categorie toEntity(CategorieRequest r) {
        if (categories.existsByNomIgnoreCase(r.nom()))
            throw new BusinessException("Cette catégorie existe déjà");
        var e = new Categorie();
        apply(e, r);
        return e;
    }

    @Override
    protected void updateEntity(Categorie e, CategorieRequest r) {
        if (categories.existsByNomIgnoreCaseAndIdNot(r.nom(), e.getId()))
            throw new BusinessException("Cette catégorie existe déjà");
        apply(e, r);
    }

    private void apply(Categorie e, CategorieRequest r) {
        e.setNom(r.nom());
        e.setDescription(r.description());
        e.setImage(r.image());
    }

    @Override
    protected CategorieResponse toResponse(Categorie e) {
        return new CategorieResponse(e.getId(), e.getNom(), e.getDescription(), e.getImage());
    }
}
