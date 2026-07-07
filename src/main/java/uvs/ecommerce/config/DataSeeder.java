package uvs.ecommerce.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import uvs.ecommerce.entity.Categorie;
import uvs.ecommerce.entity.Produit;
import uvs.ecommerce.entity.Utilisateur;
import uvs.ecommerce.entity.Vendeur;
import uvs.ecommerce.enums.Role;
import uvs.ecommerce.enums.StatutVendeur;
import uvs.ecommerce.repository.CategorieRepository;
import uvs.ecommerce.repository.ProduitRepository;
import uvs.ecommerce.repository.UtilisateurRepository;
import uvs.ecommerce.repository.VendeurRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedDatabase(CategorieRepository categories, UtilisateurRepository users, VendeurRepository sellers,
                                   ProduitRepository products, PasswordEncoder encoder) {
        return args -> {
            Map<String, Categorie> categoryMap = new HashMap<>();
            seedCategories(categories, categoryMap);

            Map<String, String> demoSellerEmails = Map.of("Atelier Dakar", "vendeur@senbazar.sn");

            Map<String, Vendeur> sellerMap = new HashMap<>();
            for (String name : new String[]{"Atelier Dakar", "SneakSn", "TimeShop SN", "Karite Lab", "TechDakar", "Maison Teranga", "MobileSN", "FitSenegal", "Wax Style", "SoundSN", "Cuir Saint-Louis", "SenCoton", "Beaute SN", "Market Dakar"}) {
                String email = demoSellerEmails.getOrDefault(name, name.toLowerCase().replace(" ", "").replace("-", "") + "@senbazar.sn");
                sellerMap.put(name, findOrCreateSeller(users, sellers, encoder, name, email));
            }

            findOrCreateUser(users, encoder, "Aissatou Diop", "client@senbazar.sn", Role.ACHETEUR, "+221 77 123 45 67", "Mermoz, Dakar");
            findOrCreateUser(users, encoder, "Admin SenBazar", "admin@senbazar.sn", Role.ADMIN, "+221 33 800 00 00", "Dakar");

            if (products.count() == 0) {
                for (ProductSeed p : productSeeds()) {
                    Produit product = new Produit();
                    product.setNom(p.nom());
                    product.setDescription(p.description());
                    product.setPrix(money(p.prix()));
                    product.setAncienPrix(p.ancienPrix() == null ? null : money(p.ancienPrix()));
                    product.setStock(p.stock());
                    product.setImage(image(p.imageSeed()));
                    product.setCategorie(categoryMap.get(p.categorie()));
                    product.setVendeur(sellerMap.get(p.vendeur()));
                    product.setPromotion(BigDecimal.valueOf(p.promotion()));
                    product.setNoteMoyenne(BigDecimal.valueOf(p.note()));
                    product.setAvis(p.avis());
                    product.setLivraisonGratuite(p.livraisonGratuite());
                    product.setNouveau(p.nouveau());
                    product.setMarque(p.marque());
                    products.save(product);
                }
            }
        };
    }

    private void seedCategories(CategorieRepository categories, Map<String, Categorie> map) {
        for (CategorySeed c : new CategorySeed[]{
                new CategorySeed("vetements", "Vetements", "Mode homme femme et enfant"),
                new CategorySeed("chaussures", "Chaussures", "Sneakers sandales et chaussures de ville"),
                new CategorySeed("accessoires", "Accessoires", "Montres sacs bijoux et accessoires"),
                new CategorySeed("beaute", "Beaute", "Soins parfums et maquillage"),
                new CategorySeed("informatique", "Informatique", "Ordinateurs tablettes et accessoires"),
                new CategorySeed("maison", "Maison", "Decoration mobilier et cuisine"),
                new CategorySeed("electronique", "Electronique", "Telephones audio et objets connectes"),
                new CategorySeed("sport", "Sport", "Fitness football et outdoor")}) {
            Categorie category = categories.findAll().stream()
                    .filter(x -> x.getNom().equalsIgnoreCase(c.nom()))
                    .findFirst()
                    .orElseGet(() -> {
                        Categorie created = new Categorie();
                        created.setNom(c.nom());
                        created.setDescription(c.description());
                        created.setImage(c.slug());
                        return categories.save(created);
                    });
            map.put(c.slug(), category);
        }
    }

    private Vendeur findOrCreateSeller(UtilisateurRepository users, VendeurRepository sellers, PasswordEncoder encoder, String shopName, String email) {
        Utilisateur user = findOrCreateUser(users, encoder, shopName, email, Role.VENDEUR, "+221 77 000 00 00", "Dakar");
        return sellers.findByUtilisateurId(user.getId()).orElseGet(() -> {
            Vendeur seller = new Vendeur();
            seller.setUtilisateur(user);
            seller.setNomBoutique(shopName);
            seller.setDescription("Boutique ecommerce SenBazar");
            seller.setLogo(shopName.substring(0, 1));
            seller.setStatut(StatutVendeur.VALIDE);
            return sellers.save(seller);
        });
    }

    private Utilisateur findOrCreateUser(UtilisateurRepository users, PasswordEncoder encoder, String name, String email, Role role, String phone, String address) {
        return users.findByEmailIgnoreCase(email).orElseGet(() -> {
            Utilisateur user = new Utilisateur();
            user.setNom(name);
            user.setEmail(email.toLowerCase());
            user.setMotDePasse(encoder.encode("password"));
            user.setRole(role);
            user.setTelephone(phone);
            user.setAdresse(address);
            return users.save(user);
        });
    }

    private BigDecimal money(Integer value) { return BigDecimal.valueOf(value); }
    private String image(String seed) { return "https://images.unsplash.com/photo-" + seed + "?w=600&h=600&fit=crop"; }

    private ProductSeed[] productSeeds() {
        return new ProductSeed[]{
                new ProductSeed("Boubou traditionnel brode homme", "vetements", 35000, 45000, 4.7, 128, 24, 22, "1602810316693-3667c854239a", "Atelier Dakar", "Boubou brode main en bazin riche avec coupe traditionnelle elegante.", true, false, "Atelier Dakar"),
                new ProductSeed("Sneakers urbaines blanches", "chaussures", 28500, null, 4.5, 86, 12, 0, "1542291026-7eec264c27ff", "SneakSn", "Baskets confortables pour la ville avec semelle amortissante.", false, true, "UrbanStep"),
                new ProductSeed("Montre classique cuir marron", "accessoires", 18900, 24000, 4.3, 54, 30, 21, "1524805444758-089113d48a6d", "TimeShop SN", "Montre a quartz avec bracelet cuir veritable.", false, false, "Classico"),
                new ProductSeed("Serum eclat karite bio", "beaute", 9500, null, 4.8, 212, 60, 0, "1556228720-195a672e8a03", "Karite Lab", "Serum naturel a base de karite du Senegal.", true, true, "Karite Lab"),
                new ProductSeed("Ordinateur portable 15 pouces 8Go", "informatique", 425000, 480000, 4.6, 47, 6, 11, "1496181133206-80ce9b88a853", "TechDakar", "Processeur i5 SSD 512 Go et ecran Full HD.", false, false, "ProBook"),
                new ProductSeed("Lampe de chevet rotin", "maison", 14500, null, 4.4, 38, 18, 0, "1513506003901-1e6a229e2d15", "Maison Teranga", "Lampe artisanale en rotin tresse main.", false, false, "Teranga Home"),
                new ProductSeed("Smartphone 128Go double SIM", "electronique", 135000, 165000, 4.5, 156, 22, 18, "1511707171634-5f897ff02aa9", "MobileSN", "Ecran 6.5 pouces batterie 5000mAh et triple camera.", true, false, "NovaPhone"),
                new ProductSeed("Halteres reglables 20 kg", "sport", 32000, null, 4.6, 64, 14, 0, "1583454110551-21f2fa2afe61", "FitSenegal", "Paire d halteres reglables pour musculation maison.", false, false, "FitPro"),
                new ProductSeed("Robe wax elegante femme", "vetements", 22500, 28000, 4.7, 91, 16, 20, "1539109136881-3be0616acf4b", "Wax Style", "Robe wax authentique avec coupe ajustee.", false, true, "Wax Style"),
                new ProductSeed("Casque audio sans fil", "electronique", 24900, null, 4.5, 72, 28, 0, "1505740420928-5e560c06d30e", "SoundSN", "Bluetooth 5.0 autonomie 30h et reduction de bruit.", true, false, "AudioMax"),
                new ProductSeed("Sandales cuir homme", "chaussures", 15500, null, 4.4, 43, 20, 0, "1603487742131-4160ec999306", "Cuir Saint-Louis", "Sandales artisanales en cuir veritable.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Sac a main cuir tresse", "accessoires", 27500, 35000, 4.6, 58, 10, 21, "1584917865442-de89df76afd3", "Cuir Saint-Louis", "Sac a main artisanal en cuir tresse.", true, false, "Saint-Louis Cuir"),
                new ProductSeed("T-shirt coton bio homme", "vetements", 8500, null, 4.4, 67, 45, 0, "1521572163474-6864f9cf17ab", "SenCoton", "T-shirt 100 pour cent coton biologique.", false, false, "SenCoton"),
                new ProductSeed("Rouge a levres mat longue tenue", "beaute", 6500, 8500, 4.6, 143, 80, 24, "1586495777744-4413f21062fa", "Beaute SN", "Rouge a levres mat tenue 12h.", false, true, "GlamSN"),
                new ProductSeed("Tablette 10 pouces 64Go", "informatique", 89000, null, 4.3, 34, 15, 0, "1544244015-0df4b3ffc6b0", "TechDakar", "Tablette Android ecran HD batterie 8000mAh.", false, false, "NovaTab"),
                new ProductSeed("Chaise design scandinave", "maison", 45000, 55000, 4.5, 29, 8, 18, "1519710164239-da123dc03ef4", "Maison Teranga", "Chaise design en bois massif et tissu.", false, false, "Teranga Home"),
                new ProductSeed("Ecouteurs sans fil TWS", "electronique", 14500, null, 4.4, 98, 40, 0, "1590658268037-6bf12165a8df", "SoundSN", "Ecouteurs bluetooth avec boitier de charge.", true, false, "AudioMax"),
                new ProductSeed("Tapis de yoga premium", "sport", 12500, null, 4.7, 51, 25, 0, "1544367567-0f2fcb009e0b", "FitSenegal", "Tapis antiderapant 6mm en materiau ecologique.", false, true, "FitPro"),
                new ProductSeed("Kaftan brode femme", "vetements", 42000, 55000, 4.8, 76, 12, 24, "1594633312681-425c7b97ccd1", "Wax Style", "Kaftan luxe brode main pour ceremonies.", true, false, "Wax Style"),
                new ProductSeed("Baskets running homme", "chaussures", 34500, null, 4.6, 62, 18, 0, "1595950653106-6c9ebd614d3a", "SneakSn", "Chaussures running legeres avec semelle amortie.", false, false, "UrbanStep"),
                new ProductSeed("Ceinture cuir noir", "accessoires", 8900, null, 4.3, 41, 35, 0, "1594223274512-ad4803739b7c", "Cuir Saint-Louis", "Ceinture en cuir veritable avec boucle metallique.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Huile essentielle argan", "beaute", 11500, null, 4.9, 187, 55, 0, "1608248543803-ba4f8c70ae0b", "Karite Lab", "Huile d argan pure pressee a froid.", true, false, "Karite Lab"),
                new ProductSeed("Souris gaming RGB", "informatique", 18500, 24000, 4.5, 55, 22, 22, "1527864550417-7fd91fc51a46", "TechDakar", "Souris gaming filaire 6400 DPI RGB.", false, false, "GameZone"),
                new ProductSeed("Theiere decorative ceramique", "maison", 16500, null, 4.6, 28, 14, 0, "1544787219-7f47ccb76574", "Maison Teranga", "Theiere artisanale peinte main.", false, true, "Teranga Home"),
                new ProductSeed("Enceinte bluetooth portable", "electronique", 22500, 28000, 4.5, 89, 30, 20, "1608043152269-423dbba4e7e1", "SoundSN", "Enceinte etanche IPX7 avec 20h autonomie.", true, false, "AudioMax"),
                new ProductSeed("Ballon de football pro", "sport", 12000, null, 4.4, 47, 40, 0, "1614632537197-38a17061c2bd", "FitSenegal", "Ballon officiel taille 5 tout terrain.", false, false, "FitPro"),
                new ProductSeed("Veste en jean delave", "vetements", 24500, null, 4.3, 58, 20, 0, "1543076447-215ad9ba6923", "SenCoton", "Veste jean coupe droite couleur bleu delave.", false, false, "SenCoton"),
                new ProductSeed("Escarpins cuir femme", "chaussures", 32500, 42000, 4.5, 39, 12, 23, "1543163521-1bf539c55dd2", "Cuir Saint-Louis", "Escarpins cuir avec talon 7cm.", false, true, "Saint-Louis Cuir"),
                new ProductSeed("Palette maquillage 12 teintes", "beaute", 15900, null, 4.6, 124, 45, 0, "1583241800698-e8ab01830a07", "Beaute SN", "Palette fards a paupieres haute pigmentation.", true, false, "GlamSN"),
                new ProductSeed("Montre connectee sport", "electronique", 39500, 49000, 4.4, 82, 18, 19, "1523275335684-37898b6baf30", "MobileSN", "Suivi cardiaque GPS et etanche 50m.", false, false, "NovaPhone"),
                new ProductSeed("Pack draps coton 2 places", "maison", 19500, 26000, 4.5, 44, 32, 25, "1584100936595-c0654b55a2e2", "Market Dakar", "Draps doux en coton pour lit deux places.", true, true, "HomeSoft"),
                new ProductSeed("Sac ordinateur 15 pouces", "informatique", 17500, null, 4.4, 36, 27, 0, "1553062407-98eeb64c6a62", "TechDakar", "Sac renforce avec compartiment ordinateur.", false, true, "ProBag"),
                new ProductSeed("Parfum mixte frais", "beaute", 22500, 30000, 4.7, 102, 21, 25, "1592945403244-b3fbafd7f539", "Beaute SN", "Parfum frais longue tenue pour tous les jours.", true, false, "GlamSN"),
                new ProductSeed("Short sport respirant", "sport", 10500, null, 4.3, 33, 50, 0, "1515886657613-9f3515b0c78f", "FitSenegal", "Short leger pour entrainement et running.", false, true, "FitPro"),
                new ProductSeed("Lunettes soleil polarisees", "accessoires", 13500, 18000, 4.5, 61, 24, 25, "1511499767150-a48a237f0083", "TimeShop SN", "Lunettes UV400 avec verres polarises.", false, false, "Classico"),
                new ProductSeed("Chemise lin homme", "vetements", 18500, null, 4.6, 73, 34, 0, "1602810319428-019690571b5b", "SenCoton", "Chemise en lin legere pour climat chaud.", true, true, "SenCoton"),

                // vetements (+6)
                new ProductSeed("Ensemble bazin brode ceremonie", "vetements", 52000, 65000, 4.8, 64, 10, 20, "1602810316693-3667c854239a", "Atelier Dakar", "Ensemble bazin riche brode main pour grandes occasions.", true, false, "Atelier Dakar"),
                new ProductSeed("Grand boubou senegalais leger", "vetements", 39000, null, 4.6, 52, 15, 0, "1602810319428-019690571b5b", "Atelier Dakar", "Boubou leger en coton doux ideal pour la chaleur.", false, true, "Atelier Dakar"),
                new ProductSeed("Jupe wax taille haute", "vetements", 17500, 22000, 4.5, 47, 22, 20, "1539109136881-3be0616acf4b", "Wax Style", "Jupe imprimee wax coupe evasee taille haute.", false, false, "Wax Style"),
                new ProductSeed("Ensemble deux pieces wax femme", "vetements", 31500, null, 4.7, 39, 14, 0, "1594633312681-425c7b97ccd1", "Wax Style", "Ensemble top et pantalon en tissu wax authentique.", false, true, "Wax Style"),
                new ProductSeed("Robe droite coton uni", "vetements", 16500, null, 4.4, 36, 28, 0, "1521572163474-6864f9cf17ab", "SenCoton", "Robe simple et elegante en coton respirant.", false, false, "SenCoton"),
                new ProductSeed("Polo pique homme", "vetements", 11500, 14500, 4.3, 44, 40, 21, "1543076447-215ad9ba6923", "SenCoton", "Polo classique en pique coton pour le quotidien.", true, false, "SenCoton"),

                // chaussures (+8)
                new ProductSeed("Sneakers basses colorees", "chaussures", 26500, null, 4.4, 58, 26, 0, "1542291026-7eec264c27ff", "SneakSn", "Sneakers legeres au design colore pour tous les jours.", false, false, "UrbanStep"),
                new ProductSeed("Baskets montantes homme", "chaussures", 31000, 38000, 4.5, 41, 18, 18, "1595950653106-6c9ebd614d3a", "SneakSn", "Baskets montantes robustes semelle antiderapante.", false, false, "UrbanStep"),
                new ProductSeed("Sneakers femme pastel", "chaussures", 27500, null, 4.6, 63, 20, 0, "1542291026-7eec264c27ff", "SneakSn", "Sneakers tendance coloris pastel tres confortables.", false, true, "UrbanStep"),
                new ProductSeed("Chaussures de marche legeres", "chaussures", 29500, null, 4.3, 34, 24, 0, "1595950653106-6c9ebd614d3a", "SneakSn", "Chaussures de marche respirantes pour la ville.", false, false, "UrbanStep"),
                new ProductSeed("Mocassins cuir homme", "chaussures", 24500, 30000, 4.6, 45, 16, 18, "1603487742131-4160ec999306", "Cuir Saint-Louis", "Mocassins en cuir veritable finition artisanale.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Bottines cuir femme", "chaussures", 33500, null, 4.7, 38, 12, 0, "1543163521-1bf539c55dd2", "Cuir Saint-Louis", "Bottines en cuir souple doublees pour l hivernage.", false, true, "Saint-Louis Cuir"),
                new ProductSeed("Sandales plates cuir femme", "chaussures", 17500, null, 4.4, 29, 22, 0, "1603487742131-4160ec999306", "Cuir Saint-Louis", "Sandales plates en cuir tresse artisanal.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Derbies cuir homme", "chaussures", 28500, 34500, 4.5, 33, 14, 17, "1543163521-1bf539c55dd2", "Cuir Saint-Louis", "Derbies elegantes en cuir pour le bureau.", true, false, "Saint-Louis Cuir"),

                // accessoires (+8)
                new ProductSeed("Montre chronographe acier", "accessoires", 32500, 41000, 4.6, 48, 16, 21, "1524805444758-089113d48a6d", "TimeShop SN", "Chronographe en acier inoxydable etanche 30m.", false, false, "Classico"),
                new ProductSeed("Bracelet perles artisanal", "accessoires", 6500, null, 4.3, 27, 45, 0, "1594223274512-ad4803739b7c", "TimeShop SN", "Bracelet en perles faites main motifs africains.", false, true, "Classico"),
                new ProductSeed("Montre digitale sport", "accessoires", 15900, null, 4.4, 52, 30, 0, "1524805444758-089113d48a6d", "TimeShop SN", "Montre digitale resistante pour le sport.", false, false, "Classico"),
                new ProductSeed("Casquette brodee logo", "accessoires", 7500, 9500, 4.2, 22, 50, 21, "1511499767150-a48a237f0083", "TimeShop SN", "Casquette ajustable brodee coton.", false, false, "Classico"),
                new ProductSeed("Portefeuille cuir homme", "accessoires", 12500, null, 4.6, 41, 30, 0, "1584917865442-de89df76afd3", "Cuir Saint-Louis", "Portefeuille compact en cuir veritable multi-cartes.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Sac banane cuir", "accessoires", 15500, 19500, 4.5, 26, 20, 21, "1594223274512-ad4803739b7c", "Cuir Saint-Louis", "Sac banane pratique en cuir souple.", false, true, "Saint-Louis Cuir"),
                new ProductSeed("Pochette cuir femme", "accessoires", 19500, null, 4.7, 31, 18, 0, "1584917865442-de89df76afd3", "Cuir Saint-Louis", "Pochette de soiree en cuir tresse main.", false, false, "Saint-Louis Cuir"),
                new ProductSeed("Bracelet cuir tresse homme", "accessoires", 5500, null, 4.3, 19, 55, 0, "1594223274512-ad4803739b7c", "Cuir Saint-Louis", "Bracelet en cuir tresse ajustable.", false, false, "Saint-Louis Cuir"),

                // beaute (+7)
                new ProductSeed("Beurre de karite pur 250g", "beaute", 5500, null, 4.9, 231, 90, 0, "1556228720-195a672e8a03", "Karite Lab", "Beurre de karite brut du Senegal 100 pour cent naturel.", true, false, "Karite Lab"),
                new ProductSeed("Savon noir africain gommant", "beaute", 4500, null, 4.7, 98, 70, 0, "1608248543803-ba4f8c70ae0b", "Karite Lab", "Savon noir traditionnel pour un gommage naturel.", false, false, "Karite Lab"),
                new ProductSeed("Huile de baobab nourrissante", "beaute", 9800, 12500, 4.8, 64, 40, 22, "1556228720-195a672e8a03", "Karite Lab", "Huile de baobab pressee a froid pour peau et cheveux.", false, true, "Karite Lab"),
                new ProductSeed("Masque visage argile verte", "beaute", 6900, null, 4.6, 57, 35, 0, "1608248543803-ba4f8c70ae0b", "Karite Lab", "Masque purifiant a l argile verte du Senegal.", false, false, "Karite Lab"),
                new ProductSeed("Fond de teint longue tenue", "beaute", 12500, 16000, 4.5, 88, 40, 22, "1586495777744-4413f21062fa", "Beaute SN", "Fond de teint fini mat couvrance modulable.", false, false, "GlamSN"),
                new ProductSeed("Vernis a ongles collection", "beaute", 3500, null, 4.4, 71, 60, 0, "1583241800698-e8ab01830a07", "Beaute SN", "Vernis a ongles longue tenue coloris tendance.", false, true, "GlamSN"),
                new ProductSeed("Eau de toilette femme florale", "beaute", 18500, 24000, 4.6, 66, 25, 23, "1592945403244-b3fbafd7f539", "Beaute SN", "Eau de toilette florale fraiche et elegante.", true, false, "GlamSN"),

                // informatique (+8)
                new ProductSeed("Ordinateur portable 14 pouces 4Go", "informatique", 285000, 320000, 4.4, 38, 10, 11, "1496181133206-80ce9b88a853", "TechDakar", "Ordinateur leger pour bureautique et etudes.", false, false, "ProBook"),
                new ProductSeed("Cle USB 64Go", "informatique", 6500, null, 4.5, 112, 100, 0, "1553062407-98eeb64c6a62", "TechDakar", "Cle USB rapide 64Go pour vos transferts.", false, false, "ProBag"),
                new ProductSeed("Disque dur externe 1To", "informatique", 45500, 52000, 4.6, 74, 25, 12, "1544244015-0df4b3ffc6b0", "TechDakar", "Disque dur externe USB 3.0 1 To.", true, false, "NovaTab"),
                new ProductSeed("Clavier sans fil compact", "informatique", 14500, null, 4.3, 29, 35, 0, "1527864550417-7fd91fc51a46", "TechDakar", "Clavier sans fil compact avec pave numerique.", false, false, "GameZone"),
                new ProductSeed("Webcam HD 1080p", "informatique", 19500, 25000, 4.4, 46, 20, 22, "1496181133206-80ce9b88a853", "TechDakar", "Webcam full HD avec micro integre.", false, true, "ProBook"),
                new ProductSeed("Onduleur 650VA", "informatique", 32500, null, 4.5, 21, 15, 0, "1553062407-98eeb64c6a62", "TechDakar", "Onduleur pour proteger votre materiel informatique.", false, false, "ProBag"),
                new ProductSeed("Imprimante multifonction", "informatique", 89500, 105000, 4.3, 33, 8, 15, "1544244015-0df4b3ffc6b0", "TechDakar", "Imprimante scanner copieur ideale pour le bureau.", false, false, "NovaTab"),
                new ProductSeed("Casque micro gamer filaire", "informatique", 22500, null, 4.6, 54, 18, 0, "1527864550417-7fd91fc51a46", "TechDakar", "Casque gamer avec microphone antibruit.", false, true, "GameZone"),

                // maison (+8)
                new ProductSeed("Panier de rangement osier", "maison", 11500, null, 4.5, 24, 30, 0, "1513506003901-1e6a229e2d15", "Maison Teranga", "Panier tresse main pour le rangement decoratif.", false, false, "Teranga Home"),
                new ProductSeed("Miroir mural rond bois", "maison", 22500, 28000, 4.6, 19, 12, 20, "1519710164239-da123dc03ef4", "Maison Teranga", "Miroir mural cadre en bois naturel.", false, true, "Teranga Home"),
                new ProductSeed("Coussin decoratif motif wax", "maison", 8500, null, 4.4, 33, 40, 0, "1544787219-7f47ccb76574", "Maison Teranga", "Coussin decoratif imprime wax pour salon.", false, false, "Teranga Home"),
                new ProductSeed("Tapis salon tisse main", "maison", 35500, 44000, 4.7, 27, 10, 19, "1519710164239-da123dc03ef4", "Maison Teranga", "Tapis tisse main aux motifs traditionnels.", true, false, "Teranga Home"),
                new ProductSeed("Set de casseroles inox", "maison", 42500, 52000, 4.5, 41, 15, 18, "1584100936595-c0654b55a2e2", "Market Dakar", "Set de casseroles en inox pour la cuisine.", false, false, "HomeSoft"),
                new ProductSeed("Rideaux occultants pair", "maison", 15500, null, 4.3, 22, 25, 0, "1513506003901-1e6a229e2d15", "Market Dakar", "Paire de rideaux occultants isolants.", false, false, "HomeSoft"),
                new ProductSeed("Organiseur de placard modulable", "maison", 12500, 16000, 4.4, 18, 28, 22, "1544787219-7f47ccb76574", "Market Dakar", "Organiseur modulable pour placards et armoires.", false, true, "HomeSoft"),
                new ProductSeed("Service a the ceramique 6 pieces", "maison", 24500, null, 4.6, 30, 16, 0, "1584100936595-c0654b55a2e2", "Market Dakar", "Service a the en ceramique peinte pour 6 personnes.", false, false, "HomeSoft"),

                // electronique (+7)
                new ProductSeed("Smartphone 64Go entree de gamme", "electronique", 79500, 95000, 4.3, 88, 30, 16, "1511707171634-5f897ff02aa9", "MobileSN", "Smartphone fiable et abordable pour un usage quotidien.", false, false, "NovaPhone"),
                new ProductSeed("Chargeur rapide double USB-C", "electronique", 8500, null, 4.5, 61, 60, 0, "1523275335684-37898b6baf30", "MobileSN", "Chargeur rapide compatible double USB-C.", false, false, "NovaPhone"),
                new ProductSeed("Power bank 20000mAh", "electronique", 17500, 22000, 4.6, 94, 45, 20, "1511707171634-5f897ff02aa9", "MobileSN", "Batterie externe grande capacite charge rapide.", true, false, "NovaPhone"),
                new ProductSeed("Barre de son compacte", "electronique", 34500, 42000, 4.5, 37, 14, 18, "1608043152269-423dbba4e7e1", "SoundSN", "Barre de son compacte pour un meilleur son TV.", false, false, "AudioMax"),
                new ProductSeed("Micro sans fil karaoke", "electronique", 16500, null, 4.4, 28, 22, 0, "1590658268037-6bf12165a8df", "SoundSN", "Micro sans fil ideal pour karaoke et soirees.", false, true, "AudioMax"),
                new ProductSeed("Support telephone bureau", "electronique", 5500, null, 4.3, 24, 50, 0, "1505740420928-5e560c06d30e", "TechDakar", "Support ajustable pour telephone de bureau.", false, false, "ProBag"),
                new ProductSeed("Multiprise parafoudre 6 prises", "electronique", 9500, 12000, 4.5, 31, 35, 21, "1608043152269-423dbba4e7e1", "TechDakar", "Multiprise avec protection parafoudre.", false, false, "ProBag"),

                // sport (+8)
                new ProductSeed("Corde a sauter vitesse", "sport", 4500, null, 4.4, 41, 65, 0, "1583454110551-21f2fa2afe61", "FitSenegal", "Corde a sauter reglable pour cardio intense.", false, false, "FitPro"),
                new ProductSeed("Bandes de resistance set", "sport", 8500, 11000, 4.5, 53, 50, 23, "1544367567-0f2fcb009e0b", "FitSenegal", "Set de bandes elastiques pour musculation.", false, false, "FitPro"),
                new ProductSeed("Sac de sport avec compartiment", "sport", 14500, null, 4.3, 27, 30, 0, "1614632537197-38a17061c2bd", "FitSenegal", "Sac de sport spacieux avec poche chaussures.", false, false, "FitPro"),
                new ProductSeed("Gourde sport 1L isotherme", "sport", 6500, 8500, 4.6, 66, 55, 24, "1515886657613-9f3515b0c78f", "FitSenegal", "Gourde isotherme garde la fraicheur 12h.", false, true, "FitPro"),
                new ProductSeed("Maillot football personnalisable", "sport", 12500, null, 4.4, 38, 40, 0, "1583454110551-21f2fa2afe61", "FitSenegal", "Maillot de football respirant personnalisable.", false, false, "FitPro"),
                new ProductSeed("Genouilleres de sport paire", "sport", 7500, 9500, 4.3, 22, 35, 21, "1544367567-0f2fcb009e0b", "FitSenegal", "Genouilleres de maintien pour le sport.", false, false, "FitPro"),
                new ProductSeed("Velo d appartement pliable", "sport", 125000, 145000, 4.5, 19, 8, 14, "1614632537197-38a17061c2bd", "FitSenegal", "Velo d appartement pliable pour le cardio a la maison.", true, false, "FitPro"),
                new ProductSeed("Montre sport GPS running", "sport", 45500, null, 4.6, 44, 12, 0, "1515886657613-9f3515b0c78f", "FitSenegal", "Montre GPS dediee au running et au suivi de performance.", false, true, "FitPro")
        };
    }

    private record CategorySeed(String slug, String nom, String description) {}
    private record ProductSeed(String nom, String categorie, Integer prix, Integer ancienPrix, double note, Integer avis,
                               Integer stock, Integer promotion, String imageSeed, String vendeur, String description,
                               Boolean livraisonGratuite, Boolean nouveau, String marque) {}
}

