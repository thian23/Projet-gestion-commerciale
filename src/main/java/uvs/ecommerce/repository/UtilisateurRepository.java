package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uvs.ecommerce.entity.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
