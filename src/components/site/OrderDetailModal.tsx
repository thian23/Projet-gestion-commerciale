import { useState } from "react";
import { X, Truck, Package, User, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatFCFA } from "@/lib/mock-data";
import { orderStatusColor, orderStatusFlow, orderStatusLabel, updateOrderStatus, type Order, type OrderDetail, type OrderStatus } from "@/lib/api";

export function OrderDetailModal({
  order,
  items,
  onClose,
  canEdit,
  onUpdated,
}: {
  order: Order;
  items: OrderDetail[];
  onClose: () => void;
  canEdit?: boolean;
  onUpdated?: (order: Order) => void;
}) {
  const [statut, setStatut] = useState<OrderStatus>(order.statut);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateOrderStatus(order, statut);
      toast.success(`Commande #${order.id} mise a jour : ${orderStatusLabel[statut]}`);
      onUpdated?.(updated);
      onClose();
    } catch {
      toast.error("Impossible de mettre a jour cette commande");
    } finally {
      setSaving(false);
    }
  };

  const stepIdx = orderStatusFlow.indexOf(statut);
  const total = items.reduce((s, it) => s + it.sousTotal, 0) || order.montantTotal;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold">Commande #{order.id}</h2>
            <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status tracker */}
          {statut !== "ANNULEE" && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs">
                {orderStatusFlow.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                    <span className={i <= stepIdx ? "font-medium" : "text-muted-foreground"}>{orderStatusLabel[s]}</span>
                  </div>
                ))}
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(stepIdx / (orderStatusFlow.length - 1)) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><User className="h-3.5 w-3.5" /> Client</div>
              <div className="font-medium text-sm">{order.clientNom}</div>
              <div className="text-xs text-muted-foreground">{order.telephone}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Livraison</div>
              <div className="text-sm">{order.adresseLivraison}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><CreditCard className="h-3.5 w-3.5" /> Paiement</div>
              <div className="font-medium text-sm">{order.modePaiement}</div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Truck className="h-3.5 w-3.5" /> Statut actuel</div>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColor(order.statut)}`}>{orderStatusLabel[order.statut]}</span>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Package className="h-3.5 w-3.5" /> Articles ({items.length})</div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{it.nom}</div>
                    <div className="text-xs text-muted-foreground">Qte : {it.quantite} a {formatFCFA(it.prixUnitaire)}</div>
                  </div>
                  <div className="font-semibold text-sm">{formatFCFA(it.sousTotal)}</div>
                </div>
              ))}
              {items.length === 0 && <p className="text-xs text-muted-foreground">Chargement des articles...</p>}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg font-bold text-primary">{formatFCFA(total)}</span>
            </div>
          </div>

          {/* Status change */}
          {canEdit && (
            <div className="rounded-xl bg-muted/40 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Changer le statut</label>
              <div className="flex flex-wrap gap-2">
                {(["EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE", "ANNULEE"] as OrderStatus[]).map((s) => (
                  <button key={s} onClick={() => setStatut(s)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${statut === s ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary"}`}>
                    {orderStatusLabel[s]}
                  </button>
                ))}
              </div>
              <button onClick={save} disabled={statut === order.statut || saving} className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
                {saving ? "Enregistrement..." : "Enregistrer le changement"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
