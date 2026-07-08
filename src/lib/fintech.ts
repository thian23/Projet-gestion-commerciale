export type Fintech = {
  id: "wave" | "orange" | "free" | "wizall" | "cod";
  nom: string;
  bg: string;
  fg: string;
  logo: string;
  desc: string;
};

export const fintechs: Fintech[] = [
  { id: "wave", nom: "Wave", bg: "#1DC8FF", fg: "#0B0B0B", logo: "Wave", desc: "Paiement mobile instantane" },
  { id: "orange", nom: "Orange Money", bg: "#FF7900", fg: "#FFFFFF", logo: "orange", desc: "Reseau Orange Senegal" },
  { id: "free", nom: "Free Money", bg: "#CD1719", fg: "#FFFFFF", logo: "Free", desc: "Reseau Free Senegal" },
  { id: "wizall", nom: "Wizall Money", bg: "#00A651", fg: "#FFFFFF", logo: "wizall", desc: "Portefeuille digital" },
  { id: "cod", nom: "Paiement a la livraison", bg: "#0F172A", fg: "#FFFFFF", logo: "Cash", desc: "En especes a reception" },
];
