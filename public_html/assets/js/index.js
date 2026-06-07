// ================= CONSTANTS =================
const SHIPPING_COST = 2000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const PRIMARY_COLOR = "#EFB7C1";
const SECONDARY_COLOR = "#D97C8A";

// ================= UTILS =================
function normalizeImage(img) {
    if (!img) return "/assets/img/hero/heroimg2.png";
    if (img.startsWith("http") || img.startsWith("/uploads")) return img;
    return "/uploads/products/" + img;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeProduct(p) {
    return {
        id: String(p.id),
        titre: p.titre || "",
        prix: Number(p.prix) || 0,
        qty: Number(p.qty) || 1,
        image: p.image || "",
        lots: Array.isArray(p.lots) ? p.lots : [],
        selectedLot: p.selectedLot ? String(p.selectedLot) : null
    };
}

// O(1) — pas de normalizeProduct() inutile ici
function getProductPrice(product) {
    if (!product.lots || !product.lots.length || !product.selectedLot) {
        return Number(product.prix) || 0;
    }
    const lot = product.lots.find(l => String(l.id) === String(product.selectedLot));
    return lot ? Number(lot.prix) : Number(product.prix);
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    Object.assign(toast.style, {
        position: "fixed", top: "20px", left: "50%",
        transform: "translateX(-50%) translateY(-10px)",
        background: "#28a745", color: "#fff",
        padding: "12px 18px", borderRadius: "8px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        zIndex: "9999", fontSize: "14px",
        opacity: "0", transition: "all 0.3s ease"
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-10px)";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ================= STORAGE =================
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(window.cart));
}

function syncStorage() {
    localStorage.setItem("cart", JSON.stringify(window.cart));
    localStorage.setItem("wishlist", JSON.stringify(window.wishlist));
}

function syncCartServerOrLocal(productId) {
    const isLoggedIn = window.USER_LOGGED_IN === true || window.USER_LOGGED_IN === "true";
    if (isLoggedIn) {
        fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, qty: 1 })
        });
    } else {
        syncStorage();
    }
}

// ================= EXPIRATION =================
function checkExpiration() {
    const now = Date.now();
    const cartDate = parseInt(localStorage.getItem("cart_date"), 10) || null;
    const wishlistDate = parseInt(localStorage.getItem("wishlist_date"), 10) || null;

    if (!cartDate) {
        localStorage.setItem("cart_date", now);
    } else if (now - cartDate > ONE_DAY) {
        localStorage.removeItem("cart");
        localStorage.removeItem("cart_date");
        localStorage.setItem("cart_date", now);
    }

    if (!wishlistDate) {
        localStorage.setItem("wishlist_date", now);
    } else if (now - wishlistDate > ONE_DAY) {
        localStorage.removeItem("wishlist");
        localStorage.removeItem("wishlist_date");
        localStorage.setItem("wishlist_date", now);
    }
}

// ================= COUNTERS =================
function updateCartCounter() {
    // O(n) une seule passe
    const total = window.cart.reduce((s, i) => s + (i.qty || 0), 0);
    document.querySelectorAll(".cart-count").forEach(el => (el.innerText = total));
}

function updateWishlistCounter() {
    const count = window.wishlist.length;
    document.querySelectorAll(".wishlist-count").forEach(el => (el.innerText = count));
}

// ================= TOTALS =================
function updateCartTotal() {
    // O(n) une seule passe
    const subtotal = window.cart.reduce((sum, item) => sum + item.qty * getProductPrice(item), 0);
    const el_sub = document.getElementById("cart-subtotal");
    const el_tot = document.getElementById("cart-total");
    if (el_sub) el_sub.innerText = subtotal + " FCFA";
    if (el_tot) el_tot.innerText = subtotal + " FCFA";
}

function updateTotal() {
    // O(n) une seule passe, sans re-normaliser chaque produit
    let subtotal = 0;
    for (const product of window.cart) {
        subtotal += Number(product.qty || 0) * getProductPrice(product);
    }
    const shipping = window.cart.length > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;

    const el_sub = document.getElementById("sub-total");
    const el_ship = document.getElementById("shipping");
    const el_tot = document.getElementById("total");
    if (el_sub) el_sub.innerText = subtotal + " FCFA";
    if (el_ship) el_ship.innerText = shipping + " FCFA";
    if (el_tot) el_tot.innerText = total + " FCFA";
}

// ================= RENDER : WISHLIST =================
function renderWishlist() {
    const container = document.getElementById("wishlist-container");
    if (!container) return;

    if (!window.wishlist || window.wishlist.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fal fa-heart-broken" style="font-size:50px;color:#ccc;"></i>
                <h5 class="mt-3 text-muted">Votre liste d'envies est vide</h5>
                <p class="text-muted small">Ajoutez des produits ❤️</p>
            </div>`;
        return;
    }

    // O(n) — construction en une seule passe avec join
    container.innerHTML = window.wishlist.map(product => `
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm position-relative">
                <button class="remove-wishlist btn btn-sm btn-light text-danger position-absolute"
                        data-id="${product.id}" style="top:10px;right:10px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <div class="p-3 text-center bg-light">
                    <img src="${normalizeImage(product.image)}" class="img-fluid rounded" alt="${product.titre}">
                </div>
                <div class="card-body">
                    <h6>${escapeHtml(product.titre)}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <strong style="color:${SECONDARY_COLOR}">${product.prix} FCFA</strong>
                        <button class="add-to-cart-from-wishlist btn text-white" style="background:${SECONDARY_COLOR}"
                                data-id="${escapeHtml(product.id)}"
                                data-title="${escapeHtml(product.titre)}"
                                data-price="${escapeHtml(product.prix)}"
                                data-image="${escapeHtml(product.image)}">
                            Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        </div>`).join("");
}

// ================= RENDER : CART =================
function renderCart() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    if (!window.cart || window.cart.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-shopping-cart mb-3" style="font-size:60px;color:#e2e8f0;"></i>
                <h5 class="fw-bold text-muted">Votre panier est vide</h5>
                <p class="text-muted small">Parcourez notre boutique pour y ajouter des articles !</p>
            </div>`;
        updateCartTotal();
        return;
    }

    container.innerHTML = window.cart.map(product => {
        const lots = Array.isArray(product.lots) ? product.lots : [];
        const price = getProductPrice(product);
        const total = price * (Number(product.qty) || 0);
        const isLotSelected = !!product.selectedLot;
        const qtyDisabled = isLotSelected ? "pointer-events:none; opacity:0.4;" : "";

        const lotsHtml = lots.length ? `
            <div class="mt-3">
                <div class="small fw-bold text-dark mb-2"><i class="fa-solid fa-layer-group me-1 text-muted"></i> Choisir un lot :</div>
                <div class="d-flex flex-wrap gap-2">
                    ${lots.map(lot => `
                        <div class="lot-card ${String(product.selectedLot) === String(lot.id) ? "active" : ""}"
                            data-product="${product.id}" data-lot="${lot.id}">
                            <div class="fw-bold small text-nowrap">${escapeHtml(lot.nom ?? "")}</div>
                            <div class="text-muted" style="font-size: 11px;">${lot.quantite ?? 0} u</div>
                            <strong style="font-size: 13px; color: var(--theme-color);">${lot.prix ?? 0} F</strong>
                        </div>`).join("")}
                </div>
            </div>` : "";

        return `
            <div class="list-group-item cart-item-row p-3 border-0 mb-3 rounded-3 shadow-sm bg-white">
                <div class="row align-items-center g-3">
                    
                    <!-- Image & Infos -->
                    <div class="col-12 col-md-5 d-flex align-items-center gap-3">
                        <div class="flex-shrink-0" style="width: 80px; height: 80px;">
                            <img src="${normalizeImage(product.image)}" class="w-100 h-100 rounded-3" style="object-fit:cover;">
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="fw-bold text-dark mb-1">${escapeHtml(product.titre)}</h6>
                            <div class="text-muted small fw-medium">${price} FCFA</div>
                            ${lotsHtml}
                        </div>
                    </div>
                    
                    <!-- Quantité -->
                    <div class="col-5 col-md-3 text-md-center" style="${qtyDisabled}">
                        <div class="qty-btn-group btn-group rounded-pill border overflow-hidden bg-light p-1 align-items-center">
                            <button class="decrease btn btn-sm border-0 shadow-none fw-bold" data-id="${product.id}">-</button>
                            <span class="qty-count text-center fw-bold text-dark small px-2">${product.qty}</span>
                            <button class="increase btn btn-sm border-0 shadow-none fw-bold" data-id="${product.id}">+</button>
                        </div>
                    </div>
                    
                    <!-- Prix Total Écrit -->
                    <div class="col-5 col-md-3 text-md-center fw-bold text-end text-md-start" style="color: var(--theme-color); font-size: 1.05rem;">
                        ${total} FCFA
                    </div>
                    
                    <!-- Bouton Supprimer -->
                    <div class="col-2 col-md-1 text-end">
                        <button class="remove-item btn btn-sm btn-link text-danger p-2 shadow-none" data-id="${product.id}">
                            <i class="fas fa-trash-alt fs-6"></i>
                        </button>
                    </div>
                    
                </div>
            </div>`;
    }).join("");

    saveCart();
    updateCartTotal();
}

// ================= RENDER : CHECKOUT =================
function renderCheckout() {
    const container = document.getElementById("checkout-cart");
    if (!container) return;

    if (!window.cart || window.cart.length === 0) {
        container.innerHTML = `
            <li class="list-group-item text-center py-5 border-0">
                <i class="fas fa-shopping-cart" style="font-size:50px;color:#ccc;"></i>
                <h5 class="mt-3 text-muted">Votre panier est vide</h5>
                <a href="/" class="btn mt-3 text-white" style="background:${SECONDARY_COLOR};">Continuer vos achats</a>
            </li>`;
        updateTotal();
        return;
    }

    // O(n) — une seule passe pour totalItems + subtotal + HTML
    let totalItems = 0;
    let subtotal = 0;
    const itemsHtml = window.cart.map(product => {
        const price = getProductPrice(product);
        const qty = Number(product.qty || 0);
        const total = price * qty;
        totalItems += qty;
        subtotal += total;

        const lots = Array.isArray(product.lots) ? product.lots : [];
        const selectedLot = lots.find(lot => String(lot.id) === String(product.selectedLot));

        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0 fw-bold">${escapeHtml(product.titre)}</h6>
                    <small class="text-muted">${qty} x ${price} FCFA</small>
                    ${selectedLot ? `<br><small class="text-success">${escapeHtml(selectedLot.nom)}</small>` : ""}
                </div>
                <div class="text-end">
                    <strong>${total} FCFA</strong><br>
                    <button class="btn btn-sm text-danger remove-checkout" data-id="${product.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>`;
    }).join("");

    container.innerHTML = `
        <li class="list-group-item d-flex justify-content-between align-items-center fw-bold bg-light">
            <div>${totalItems} article${totalItems > 1 ? "s" : ""}</div>
            <div class="text-success">${subtotal} FCFA</div>
        </li>
        ${itemsHtml}`;

    updateTotal();
}

// ================= FULL REFRESH (une seule fonction centrale) =================
function refreshUI() {
    renderCart();
    renderWishlist();
    renderCheckout();
    updateCartCounter();
    updateWishlistCounter();
}

// ================= CART ACTIONS =================
window.addToCart = function (product) {
    product = normalizeProduct(product);

    const existing = window.cart.find(p =>
        p.id === product.id && String(p.selectedLot) === String(product.selectedLot)
    );

    if (existing) {
        existing.qty += 1;
    } else {
        window.cart.push(product);
    }

    saveCart();
    syncCartServerOrLocal(product.id);
    renderCart();
    renderCheckout();
    updateCartCounter();
};

window.addToWishlist = function (product) {
    const exists = window.wishlist.find(p => String(p.id) === String(product.id));
    if (!exists) window.wishlist.push(product);
    syncStorage();
    updateWishlistCounter();
    renderWishlist();
};

function hydrateCart(data) {
    window.cart = (data || []).map(p => ({
        id: String(p.id),
        titre: p.titre,
        prix: Number(p.prix ?? 0),
        qty: parseInt(p.qty || 1),
        image: normalizeImage(p.image),
        lots: Array.isArray(p.lots) ? p.lots : [],
        selectedLot: p.selectedLot ? String(p.selectedLot) : null
    }));
    renderCart();
    renderCheckout();
    updateCartCounter();
}

async function loadProductLots(productId) {
    try {
        const res = await fetch(`/produits/${productId}/lots`);
        return await res.json();
    } catch (e) {
        console.error("Erreur chargement lots", e);
        return [];
    }
}

function renderLots(lots, product) {
    const box = document.getElementById("lot-box");
    if (!box) return;

    if (!lots.length) {
        box.innerHTML = "<p>Aucun lot disponible</p>";
        box.style.display = "block";
        return;
    }

    box.innerHTML = lots.map(lot => `
        <div class="lot-select-card border p-2 mb-2"
             style="cursor:pointer"
             data-lot-id="${lot.id}"
             data-lot-name="${lot.nom}"
             data-lot-price="${lot.prix}">
            <strong>${escapeHtml(lot.nom)}</strong><br>
            ${lot.quantite} unités - ${lot.prix} FCFA
        </div>`).join("");

    box.style.display = "block";

    // Un seul listener sur le conteneur (délégation)
    box.addEventListener("click", function handler(e) {
        const card = e.target.closest(".lot-select-card");
        if (!card) return;
        addToCart({
            id: product.id,
            titre: product.titre,
            prix: Number(card.dataset.lotPrice),
            image: product.image,
            qty: 1,
            selectedLot: String(card.dataset.lotId),
            lots: lots
        });
        showToast("🛒 Lot ajouté !");
        box.style.display = "none";
        box.removeEventListener("click", handler); // cleanup
    });
}

function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) modal.style.display = "flex";
}

function goHome() {
    window.location.href = "/";
}

// ================= INIT LOT SELECTION =================
function initLotSelection() {
    document.addEventListener("click", function (e) {
        const card = e.target.closest(".lot-select-card");
        if (!card) return;

        const hidden = document.getElementById("selectedLotData");
        if (!hidden) return;

        const alreadySelected = card.classList.contains("border-success");

        document.querySelectorAll(".lot-select-card").forEach(el =>
            el.classList.remove("border-success", "bg-light")
        );

        if (alreadySelected) {
            hidden.value = "";
            return;
        }

        card.classList.add("border-success", "bg-light");
        hidden.value = JSON.stringify({
            id: card.dataset.lotId,
            nom: card.dataset.lotName,
            prix: Number(card.dataset.lotPrice)
        });
    });
}

// ================= SINGLE CLICK HANDLER (délégation unifiée) =================
document.addEventListener("click", function (e) {

    // --- JS-COMMANDE (achat direct) ---
    const shopbtn = e.target.closest(".js-commande");
    if (shopbtn) {
        e.preventDefault();
        let selectedLot = null;
        const hidden = document.getElementById("selectedLotData");
        if (hidden && hidden.value) selectedLot = JSON.parse(hidden.value);

        localStorage.setItem("cart", JSON.stringify([{
            id: shopbtn.dataset.id,
            titre: shopbtn.dataset.title,
            prix: selectedLot ? selectedLot.prix : parseInt(shopbtn.dataset.price),
            image: shopbtn.dataset.image || "/assets/img/hero/heroimg2.png",
            qty: 1,
            selectedLot: selectedLot ? String(selectedLot.id) : null,
            lotName: selectedLot ? selectedLot.nom : null,
            lots: selectedLot ? [selectedLot] : []
        }]));
        window.location.href = "/commande/checkout";
        return;
    }

    // --- AJOUTER AU PANIER (carte produit) ---
    const cartBtn = e.target.closest(".js-cart");
    if (cartBtn) {
        e.preventDefault();
        let lots = [];
        try {
            const raw = cartBtn.dataset.lots;
            if (raw && raw !== "undefined" && raw !== "null") {
                lots = JSON.parse(raw);
                if (!Array.isArray(lots)) lots = [];
            }
        } catch (err) { lots = []; }

        addToCart({
            id: cartBtn.dataset.id,
            titre: cartBtn.dataset.title,
            prix: parseFloat(cartBtn.dataset.price),
            image: cartBtn.dataset.image,
            lots,
            selectedLot: null
        });
        showToast("🛒 Produit ajouté au panier !");
        return;
    }

    // --- WISHLIST (carte produit) ---
    const wishBtn = e.target.closest(".js-wishlist");
    if (wishBtn) {
        e.preventDefault();
        addToWishlist({
            id: wishBtn.dataset.id,
            titre: wishBtn.dataset.title,
            prix: parseInt(wishBtn.dataset.price),
            image: wishBtn.dataset.image || "/assets/img/hero/heroimg2.png"
        });
        showToast("❤️ Ajouté aux favoris !");
        return;
    }

    // --- SUPPRIMER DE LA WISHLIST ---
    const rmWish = e.target.closest(".remove-wishlist");
    if (rmWish) {
        window.wishlist = window.wishlist.filter(p => String(p.id) !== String(rmWish.dataset.id));
        localStorage.setItem("wishlist", JSON.stringify(window.wishlist));
        updateWishlistCounter();
        renderWishlist();
        showToast("🗑️ Supprimé de la wishlist");
        return;
    }

    // --- AJOUTER AU PANIER DEPUIS WISHLIST ---
    const addFromWish = e.target.closest(".add-to-cart-from-wishlist");
    if (addFromWish) {
        let lots = [];
        try {
            lots = JSON.parse(addFromWish.dataset.lots || "[]");
            if (!Array.isArray(lots)) lots = [];
        } catch (e) { lots = []; }

        addToCart({
            id: addFromWish.dataset.id,
            titre: addFromWish.dataset.title,
            prix: Number(addFromWish.dataset.price),
            image: addFromWish.dataset.image,
            lots,
            selectedLot: null
        });

        window.wishlist = window.wishlist.filter(p => String(p.id) !== String(addFromWish.dataset.id));
        localStorage.setItem("wishlist", JSON.stringify(window.wishlist));
        updateWishlistCounter();
        renderWishlist();
        showToast("🛒 Ajouté au panier !");
        return;
    }

    // --- SUPPRIMER DU PANIER (page panier) ---
    const del = e.target.closest(".remove-item");
    if (del) {
        window.cart = window.cart.filter(p => String(p.id) !== String(del.dataset.id));
        saveCart();
        syncStorage();
        renderCart();
        renderCheckout();
        updateCartCounter();
        return;
    }

    // --- SUPPRIMER DU CHECKOUT ---
    const rmCheckout = e.target.closest(".remove-checkout");
    if (rmCheckout) {
        window.cart = window.cart.filter(p => String(p.id) !== String(rmCheckout.dataset.id));
        localStorage.setItem("cart", JSON.stringify(window.cart));
        renderCheckout();
        return;
    }

    // --- QTÉ +/- ---
    const inc = e.target.closest(".increase");
    const dec = e.target.closest(".decrease");
    if (inc || dec) {
        const id = (inc || dec).dataset.id;
        // O(1) avec find — pas de double boucle
        const product = window.cart.find(p => String(p.id) === String(id));
        if (!product) return;
        if (inc) product.qty++;
        if (dec && product.qty > 1) product.qty--;
        saveCart();
        fetch("/cart/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: id, quantity: product.qty, selectedLot: product.selectedLot || null })
        });
        renderCart();
        renderCheckout();
        updateCartCounter();
        return;
    }

    // --- LOT CARD (page panier) ---
    const lotCard = e.target.closest(".lot-card");
    if (lotCard) {
        const productId = String(lotCard.dataset.product);
        const lotId = String(lotCard.dataset.lot);

        const product = window.cart.find(
            p => String(p.id) === productId
        );

        if (!product) return;

        if (!Array.isArray(product.lots)) {
            product.lots = [];
        }

        // Désélection
        if (String(product.selectedLot) === lotId) {
            product.selectedLot = null;
            product.selectedLotData = null;
        } else {
            const selectedLot = product.lots.find(
                lot => String(lot.id) === lotId
            );

            product.selectedLot = lotId;
            product.selectedLotData = selectedLot || null;
        }

        saveCart();
        renderCart();
        renderCheckout();
        updateCartTotal();
        updateCartCounter();
        return;
    }

    // --- PAIEMENT OPTION ---
    const payOpt = e.target.closest(".payment-option");
    if (payOpt) {
        document.querySelectorAll(".payment-option").forEach(el => {
            el.classList.remove("border-danger");
            el.style.borderColor = "#dee2e6";
        });
        payOpt.classList.add("border-danger");
        payOpt.style.borderColor = SECONDARY_COLOR;
    }
});

// ================= CONFIRM ORDER =================
document.addEventListener("click", function (e) {

    // bouton ciblé correctement
    const shopbtn = e.target.closest("#confirm-order");

    // si on ne clique pas sur le bouton → on sort
    if (!shopbtn) return;

    e.preventDefault();

    // sécurité cart
    if (!window.cart || window.cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    let name, phone, address;

    if (window.USER_CHECKOUT?.logged) {
    name = window.USER_CHECKOUT.name?.trim() || "";
    phone = window.USER_CHECKOUT.phone?.trim() || "";
    address = window.USER_CHECKOUT.address?.trim() || "";
    } else {
        name = document.querySelector("input[name='name']")?.value?.trim() || "";
        phone = document.querySelector("input[name='phone']")?.value?.trim() || "";
        address = document.querySelector("input[name='address']")?.value?.trim() || "";
    }
    if (!name || !phone || !address) {
        showToast("Remplissez tous les champs !");
        return;
    }

    if (!payment) {
        showToast("Choisissez un mode de paiement !");
        return;
    }

    const subtotal = window.cart.reduce(
        (s, p) => s + p.qty * getProductPrice(p),
        0
    );

    const order = {
        user: { name, phone, address },
        items: window.cart,
        subtotal,
        shipping: SHIPPING_COST,
        total: subtotal + SHIPPING_COST,
        payment
    };

    if (payment !== "cash_on_delivery") {
        showToast("Ce mode de paiement sera bientot disponible.");
        return;
    }

    shopbtn.disabled = true;
    shopbtn.dataset.originalText = shopbtn.innerHTML;
    shopbtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Traitement...';

    fetch("/commande/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": window.CHECKOUT_CSRF_TOKEN || ""
            },
            body: JSON.stringify(order)
        })
        .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Erreur commande");
            }
            return data;
        })
        .then(data => {

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
                return;
            }

            if (data.success) {
                showSuccessModal();

                window.cart = [];
                localStorage.removeItem("cart");
                renderCheckout();
            } else {
                showToast(data.message || "Erreur commande");
            }

        })
        .catch(err => {
            console.error(err);
            showToast(err.message || "Erreur commande");
        })
        .finally(() => {
            shopbtn.disabled = false;
            shopbtn.innerHTML = shopbtn.dataset.originalText || "CONFIRMER LA COMMANDE";
        });
});

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
    checkExpiration();
    setInterval(checkExpiration, 60 * 1000);

    window.cart = JSON.parse(localStorage.getItem("cart")) || [];
    window.wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const isLoggedIn = window.USER_LOGGED_IN === true || window.USER_LOGGED_IN === "true";
    console.log(isLoggedIn ? "🟢 Mode session Symfony" : "🟡 Mode localStorage");

    // Logique session identique pour les deux modes (localStorage comme source de vérité)
    // Décommente et adapte le bloc fetch ci-dessous si tu veux hydrater depuis l'API :
    // if (isLoggedIn) {
    //     try {
    //         const res = await fetch("/cart/api");
    //         const data = await res.json();
    //         hydrateCart(data);
    //     } catch (e) { console.error("Erreur panier session", e); }
    // }

    renderCart();
    renderWishlist();
    renderCheckout();
    updateCartCounter();
    updateWishlistCounter();

    initLotSelection();
});
