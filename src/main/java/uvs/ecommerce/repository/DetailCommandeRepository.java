package uvs.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uvs.ecommerce.entity.DetailCommande;
import java.util.List;

public interface DetailCommandeRepository extends JpaRepository<DetailCommande, Long> {
    List<DetailCommande> findByCommandeId(Long commandeId);

    boolean existsByCommandeIdAndProduitId(Long commandeId, Long produitId);

    boolean existsByCommandeIdAndProduitIdAndIdNot(Long commandeId, Long produitId, Long id);

    @Query("select case when count(d) > 0 then true else false end from DetailCommande d " +
            "where d.commande.id = :commandeId and d.produit.vendeur.utilisateur.id = :utilisateurId")
    boolean existsForSeller(@Param("commandeId") Long commandeId, @Param("utilisateurId") Long utilisateurId);

    @Query("select distinct d.commande.id from DetailCommande d where d.produit.vendeur.id = :vendeurId")
    List<Long> findCommandeIdsByVendeurId(@Param("vendeurId") Long vendeurId);
}

