export type Product = {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  ancienPrix?: number;
  note: number;
  avis: number;
  stock: number;
  promotion?: number;
  image: string;
  vendeur: string;
  vendeurNote: number;
  description: string;
  livraisonGratuite?: boolean;
  nouveau?: boolean;
  marque: string;
};

export const formatFCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const categories = [
  { slug: "vetements", nom: "Vetements", icon: "Shirt", count: 128 },
  { slug: "chaussures", nom: "Chaussures", icon: "Footprints", count: 88 },
  { slug: "accessoires", nom: "Accessoires", icon: "Watch", count: 56 },
  { slug: "beaute", nom: "Beaute", icon: "Sparkles", count: 77 },
  { slug: "informatique", nom: "Informatique", icon: "Laptop", count: 44 },
  { slug: "maison", nom: "Maison", icon: "Home", count: 102 },
  { slug: "electronique", nom: "Electronique", icon: "Smartphone", count: 71 },
  { slug: "sport", nom: "Sport", icon: "Dumbbell", count: 42 },
];

const img = (seed: string) => `https://images.unsplash.com/photo-${seed}?w=600&h=600&fit=crop`;

export const products: Product[] = [
  { id: "p1", nom: "Boubou traditionnel brode homme", categorie: "vetements", prix: 35000, ancienPrix: 45000, note: 4.7, avis: 128, stock: 24, promotion: 22, image: img("1602810316693-3667c854239a"), vendeur: "Atelier Dakar", vendeurNote: 4.8, description: "Boubou brode main en bazin riche avec coupe traditionnelle elegante.", livraisonGratuite: true, marque: "Atelier Dakar" },
  { id: "p2", nom: "Sneakers urbaines blanches", categorie: "chaussures", prix: 28500, note: 4.5, avis: 86, stock: 12, image: img("1542291026-7eec264c27ff"), vendeur: "SneakSn", vendeurNote: 4.6, description: "Baskets confortables pour la ville avec semelle amortissante.", nouveau: true, marque: "UrbanStep" },
  { id: "p3", nom: "Montre classique cuir marron", categorie: "accessoires", prix: 18900, ancienPrix: 24000, note: 4.3, avis: 54, stock: 30, promotion: 21, image: img("1524805444758-089113d48a6d"), vendeur: "TimeShop SN", vendeurNote: 4.5, description: "Montre a quartz avec bracelet cuir veritable.", marque: "Classico" },
  { id: "p4", nom: "Serum eclat karite bio", categorie: "beaute", prix: 9500, note: 4.8, avis: 212, stock: 60, image: img("1556228720-195a672e8a03"), vendeur: "Karite Lab", vendeurNote: 4.9, description: "Serum naturel a base de karite du Senegal.", livraisonGratuite: true, nouveau: true, marque: "Karite Lab" },
  { id: "p5", nom: "Ordinateur portable 15 pouces 8Go", categorie: "informatique", prix: 425000, ancienPrix: 480000, note: 4.6, avis: 47, stock: 6, promotion: 11, image: img("1496181133206-80ce9b88a853"), vendeur: "TechDakar", vendeurNote: 4.7, description: "Processeur i5 SSD 512 Go et ecran Full HD.", marque: "ProBook" },
  { id: "p6", nom: "Lampe de chevet rotin", categorie: "maison", prix: 14500, note: 4.4, avis: 38, stock: 18, image: img("1513506003901-1e6a229e2d15"), vendeur: "Maison Teranga", vendeurNote: 4.6, description: "Lampe artisanale en rotin tresse main.", marque: "Teranga Home" },
  { id: "p7", nom: "Smartphone 128Go double SIM", categorie: "electronique", prix: 135000, ancienPrix: 165000, note: 4.5, avis: 156, stock: 22, promotion: 18, image: img("1511707171634-5f897ff02aa9"), vendeur: "MobileSN", vendeurNote: 4.4, description: "Ecran 6.5 pouces batterie 5000mAh et triple camera.", livraisonGratuite: true, marque: "NovaPhone" },
  { id: "p8", nom: "Halteres reglables 20 kg", categorie: "sport", prix: 32000, note: 4.6, avis: 64, stock: 14, image: img("1583454110551-21f2fa2afe61"), vendeur: "FitSenegal", vendeurNote: 4.7, description: "Paire d halteres reglables pour musculation maison.", marque: "FitPro" },
  { id: "p9", nom: "Robe wax elegante femme", categorie: "vetements", prix: 22500, ancienPrix: 28000, note: 4.7, avis: 91, stock: 16, promotion: 20, image: img("1539109136881-3be0616acf4b"), vendeur: "Wax Style", vendeurNote: 4.8, description: "Robe wax authentique avec coupe ajustee.", nouveau: true, marque: "Wax Style" },
  { id: "p10", nom: "Casque audio sans fil", categorie: "electronique", prix: 24900, note: 4.5, avis: 72, stock: 28, image: img("1505740420928-5e560c06d30e"), vendeur: "SoundSN", vendeurNote: 4.5, description: "Bluetooth 5.0 autonomie 30h et reduction de bruit.", livraisonGratuite: true, marque: "AudioMax" },
  { id: "p11", nom: "Sandales cuir homme", categorie: "chaussures", prix: 15500, note: 4.4, avis: 43, stock: 20, image: img("1603487742131-4160ec999306"), vendeur: "Cuir Saint-Louis", vendeurNote: 4.7, description: "Sandales artisanales en cuir veritable.", marque: "Saint-Louis Cuir" },
  { id: "p12", nom: "Sac a main cuir tresse", categorie: "accessoires", prix: 27500, ancienPrix: 35000, note: 4.6, avis: 58, stock: 10, promotion: 21, image: img("1584917865442-de89df76afd3"), vendeur: "Cuir Saint-Louis", vendeurNote: 4.7, description: "Sac a main artisanal en cuir tresse.", livraisonGratuite: true, marque: "Saint-Louis Cuir" },
  { id: "p13", nom: "T-shirt coton bio homme", categorie: "vetements", prix: 8500, note: 4.4, avis: 67, stock: 45, image: img("1521572163474-6864f9cf17ab"), vendeur: "SenCoton", vendeurNote: 4.5, description: "T-shirt 100 pour cent coton biologique.", marque: "SenCoton" },
  { id: "p14", nom: "Rouge a levres mat longue tenue", categorie: "beaute", prix: 6500, ancienPrix: 8500, note: 4.6, avis: 143, stock: 80, promotion: 24, image: img("1586495777744-4413f21062fa"), vendeur: "Beaute SN", vendeurNote: 4.6, description: "Rouge a levres mat tenue 12h.", nouveau: true, marque: "GlamSN" },
  { id: "p15", nom: "Tablette 10 pouces 64Go", categorie: "informatique", prix: 89000, note: 4.3, avis: 34, stock: 15, image: img("1544244015-0df4b3ffc6b0"), vendeur: "TechDakar", vendeurNote: 4.7, description: "Tablette Android ecran HD batterie 8000mAh.", marque: "NovaTab" },
  { id: "p16", nom: "Chaise design scandinave", categorie: "maison", prix: 45000, ancienPrix: 55000, note: 4.5, avis: 29, stock: 8, promotion: 18, image: img("1519710164239-da123dc03ef4"), vendeur: "Maison Teranga", vendeurNote: 4.6, description: "Chaise design en bois massif et tissu.", marque: "Teranga Home" },
  { id: "p17", nom: "Ecouteurs sans fil TWS", categorie: "electronique", prix: 14500, note: 4.4, avis: 98, stock: 40, image: img("1590658268037-6bf12165a8df"), vendeur: "SoundSN", vendeurNote: 4.5, description: "Ecouteurs bluetooth avec boitier de charge.", livraisonGratuite: true, marque: "AudioMax" },
  { id: "p18", nom: "Tapis de yoga premium", categorie: "sport", prix: 12500, note: 4.7, avis: 51, stock: 25, image: img("1544367567-0f2fcb009e0b"), vendeur: "FitSenegal", vendeurNote: 4.7, description: "Tapis antiderapant 6mm en materiau ecologique.", nouveau: true, marque: "FitPro" },
  { id: "p19", nom: "Kaftan brode femme", categorie: "vetements", prix: 42000, ancienPrix: 55000, note: 4.8, avis: 76, stock: 12, promotion: 24, image: img("1594633312681-425c7b97ccd1"), vendeur: "Wax Style", vendeurNote: 4.8, description: "Kaftan luxe brode main pour ceremonies.", livraisonGratuite: true, marque: "Wax Style" },
  { id: "p20", nom: "Baskets running homme", categorie: "chaussures", prix: 34500, note: 4.6, avis: 62, stock: 18, image: img("1595950653106-6c9ebd614d3a"), vendeur: "SneakSn", vendeurNote: 4.6, description: "Chaussures running legeres avec semelle amortie.", marque: "UrbanStep" },
  { id: "p21", nom: "Ceinture cuir noir", categorie: "accessoires", prix: 8900, note: 4.3, avis: 41, stock: 35, image: img("1594223274512-ad4803739b7c"), vendeur: "Cuir Saint-Louis", vendeurNote: 4.7, description: "Ceinture en cuir veritable avec boucle metallique.", marque: "Saint-Louis Cuir" },
  { id: "p22", nom: "Huile essentielle argan", categorie: "beaute", prix: 11500, note: 4.9, avis: 187, stock: 55, image: img("1608248543803-ba4f8c70ae0b"), vendeur: "Karite Lab", vendeurNote: 4.9, description: "Huile d argan pure pressee a froid.", livraisonGratuite: true, marque: "Karite Lab" },
  { id: "p23", nom: "Souris gaming RGB", categorie: "informatique", prix: 18500, ancienPrix: 24000, note: 4.5, avis: 55, stock: 22, promotion: 22, image: img("1527864550417-7fd91fc51a46"), vendeur: "TechDakar", vendeurNote: 4.7, description: "Souris gaming filaire 6400 DPI RGB.", marque: "GameZone" },
  { id: "p24", nom: "Theiere decorative ceramique", categorie: "maison", prix: 16500, note: 4.6, avis: 28, stock: 14, image: img("1544787219-7f47ccb76574"), vendeur: "Maison Teranga", vendeurNote: 4.6, description: "Theiere artisanale peinte main.", nouveau: true, marque: "Teranga Home" },
  { id: "p25", nom: "Enceinte bluetooth portable", categorie: "electronique", prix: 22500, ancienPrix: 28000, note: 4.5, avis: 89, stock: 30, promotion: 20, image: img("1608043152269-423dbba4e7e1"), vendeur: "SoundSN", vendeurNote: 4.5, description: "Enceinte etanche IPX7 avec 20h autonomie.", livraisonGratuite: true, marque: "AudioMax" },
  { id: "p26", nom: "Ballon de football pro", categorie: "sport", prix: 12000, note: 4.4, avis: 47, stock: 40, image: img("1614632537197-38a17061c2bd"), vendeur: "FitSenegal", vendeurNote: 4.7, description: "Ballon officiel taille 5 tout terrain.", marque: "FitPro" },
  { id: "p27", nom: "Veste en jean delave", categorie: "vetements", prix: 24500, note: 4.3, avis: 58, stock: 20, image: img("1543076447-215ad9ba6923"), vendeur: "SenCoton", vendeurNote: 4.5, description: "Veste jean coupe droite couleur bleu delave.", marque: "SenCoton" },
  { id: "p28", nom: "Escarpins cuir femme", categorie: "chaussures", prix: 32500, ancienPrix: 42000, note: 4.5, avis: 39, stock: 12, promotion: 23, image: img("1543163521-1bf539c55dd2"), vendeur: "Cuir Saint-Louis", vendeurNote: 4.7, description: "Escarpins cuir avec talon 7cm.", nouveau: true, marque: "Saint-Louis Cuir" },
  { id: "p29", nom: "Palette maquillage 12 teintes", categorie: "beaute", prix: 15900, note: 4.6, avis: 124, stock: 45, image: img("1583241800698-e8ab01830a07"), vendeur: "Beaute SN", vendeurNote: 4.6, description: "Palette fards a paupieres haute pigmentation.", livraisonGratuite: true, marque: "GlamSN" },
  { id: "p30", nom: "Montre connectee sport", categorie: "electronique", prix: 39500, ancienPrix: 49000, note: 4.4, avis: 82, stock: 18, promotion: 19, image: img("1523275335684-37898b6baf30"), vendeur: "MobileSN", vendeurNote: 4.4, description: "Suivi cardiaque GPS et etanche 50m.", marque: "NovaPhone" },
  { id: "p31", nom: "Pack draps coton 2 places", categorie: "maison", prix: 19500, ancienPrix: 26000, note: 4.5, avis: 44, stock: 32, promotion: 25, image: img("1584100936595-c0654b55a2e2"), vendeur: "Market Dakar", vendeurNote: 4.5, description: "Draps doux en coton pour lit deux places.", livraisonGratuite: true, nouveau: true, marque: "HomeSoft" },
  { id: "p32", nom: "Sac ordinateur 15 pouces", categorie: "informatique", prix: 17500, note: 4.4, avis: 36, stock: 27, image: img("1553062407-98eeb64c6a62"), vendeur: "TechDakar", vendeurNote: 4.7, description: "Sac renforce avec compartiment ordinateur.", nouveau: true, marque: "ProBag" },
  { id: "p33", nom: "Parfum mixte frais", categorie: "beaute", prix: 22500, ancienPrix: 30000, note: 4.7, avis: 102, stock: 21, promotion: 25, image: img("1592945403244-b3fbafd7f539"), vendeur: "Beaute SN", vendeurNote: 4.6, description: "Parfum frais longue tenue pour tous les jours.", livraisonGratuite: true, marque: "GlamSN" },
  { id: "p34", nom: "Short sport respirant", categorie: "sport", prix: 10500, note: 4.3, avis: 33, stock: 50, image: img("1515886657613-9f3515b0c78f"), vendeur: "FitSenegal", vendeurNote: 4.7, description: "Short leger pour entrainement et running.", nouveau: true, marque: "FitPro" },
  { id: "p35", nom: "Lunettes soleil polarisees", categorie: "accessoires", prix: 13500, ancienPrix: 18000, note: 4.5, avis: 61, stock: 24, promotion: 25, image: img("1511499767150-a48a237f0083"), vendeur: "TimeShop SN", vendeurNote: 4.5, description: "Lunettes UV400 avec verres polarises.", marque: "Classico" },
  { id: "p36", nom: "Chemise lin homme", categorie: "vetements", prix: 18500, note: 4.6, avis: 73, stock: 34, image: img("1602810319428-019690571b5b"), vendeur: "SenCoton", vendeurNote: 4.5, description: "Chemise en lin legere pour climat chaud.", livraisonGratuite: true, nouveau: true, marque: "SenCoton" },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const featured = products.slice(0, 8);
export const promos = products.filter((p) => p.promotion).slice(0, 8);
export const nouveautes = products.filter((p) => p.nouveau).slice(0, 8);

export const salesData = [
  { mois: "Jan", ventes: 420, commandes: 82, clients: 45 },
  { mois: "Fev", ventes: 510, commandes: 96, clients: 58 },
  { mois: "Mar", ventes: 480, commandes: 91, clients: 52 },
  { mois: "Avr", ventes: 620, commandes: 115, clients: 71 },
  { mois: "Mai", ventes: 720, commandes: 138, clients: 89 },
  { mois: "Juin", ventes: 890, commandes: 172, clients: 108 },
];

export const categoryShare = [
  { name: "Vetements", value: 32 },
  { name: "Electronique", value: 24 },
  { name: "Beaute", value: 16 },
  { name: "Maison", value: 12 },
  { name: "Chaussures", value: 10 },
  { name: "Autres", value: 6 },
];

export const paymentShare = [
  { name: "Wave", value: 42 },
  { name: "Orange Money", value: 28 },
  { name: "Free Money", value: 14 },
  { name: "Wizall", value: 8 },
  { name: "Cash", value: 8 },
];

