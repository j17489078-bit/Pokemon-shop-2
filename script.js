// =========================
// VARIABLES
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let listings = JSON.parse(localStorage.getItem("listings")) || [];

// =========================
// UNIVERSAL BACK BUTTON
// =========================
// targetPage = "index.html", "cart.html", etc.
function goBack(targetPage) {
    if(!targetPage) targetPage = "index.html"; // default to shop
    window.location.href = targetPage;
}

// Optional: auto back using referrer
function goBackReferrer(defaultPage) {
    const ref = document.referrer;
    if(ref) window.location.href = ref;
    else window.location.href = defaultPage || "index.html";
}

// =========================
// DISPLAY SHOP
// =========================
function displayShop() {
    const shop = document.getElementById("shop");
    if(!shop) return;

    shop.innerHTML = "";

    listings.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price}</p>
            <button class="addCartBtn">Add to Cart</button>
        `;
        shop.appendChild(div);

        div.querySelector(".addCartBtn").addEventListener("click", () => {
            addToCart(item.name, item.price, item.image);
        });
    });
}

// =========================
// ADD TO CART
// =========================
function addToCart(name, price, image) {
    cart.push({name, price, image});
    localStorage.setItem("cart", JSON.stringify(cart));

    // Remove from shop
    listings = listings.filter(item => !(item.name === name && item.price === price && item.image === image));
    localStorage.setItem("listings", JSON.stringify(listings));

    displayShop();
    alert("Added to cart and removed from shop!");
}

// =========================
// SELL A CARD (AUTO IMAGE)
// =========================
async function listCard(nameInputId, priceInputId) {
    const name = document.getElementById(nameInputId).value.trim();
    const price = Number(document.getElementById(priceInputId).value);

    if(!name || !price){
        alert("Please fill in all fields!");
        return;
    }

    let imageURL = "https://via.placeholder.com/150"; // default placeholder
    try {
        // Fetch first Pokémon TCG image (use your API key if needed)
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`, {
            headers: { "X-Api-Key": "YOUR_API_KEY" } // optional if you have one
        });
        const data = await response.json();
        if(data.data && data.data.length > 0) imageURL = data.data[0].images.small;
    } catch(err){ console.error(err); }

    listings.push({name, price, image: imageURL});
    localStorage.setItem("listings", JSON.stringify(listings));

    // Clear inputs
    document.getElementById(nameInputId).value = "";
    document.getElementById(priceInputId).value = "";

    displayShop();
}

// =========================
// DISPLAY CART
// =========================
function displayCart(){
    const container = document.getElementById("cartItems");
    if(!container) return;

    let total = 0;
    container.innerHTML = "";

    cart.forEach(item => {
        container.innerHTML += `<p>${item.name} - $${item.price}</p>`;
        total += item.price;
    });

    const totalEl = document.getElementById("total");
    if(totalEl) totalEl.innerText = "Total: $" + total;
}

// =========================
// CHECKOUT: SAVE SHIPPING INFO
// =========================
function saveCheckoutInfo() {
    const name = document.getElementById("name").value.trim();
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const zip = document.getElementById("zip").value.trim();
    const country = document.getElementById("country").value.trim();
    const payment = document.getElementById("payment").value;

    if(!name || !street || !city || !zip || !country || !payment){
        alert("Please fill in all fields and select a payment method!");
        return false;
    }

    localStorage.setItem("shippingInfo", JSON.stringify({name, street, city, zip, country, payment}));
    return true;
}

// =========================
// PAYMENT: SEND TO GOOGLE FORM
// =========================
function submitPayment(googleFormBaseURL){
    const cardName = document.getElementById("cardName").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if(!cardName || !cardNumber || !expiry || !cvv){
        alert("Please fill in all credit card fields!");
        return;
    }

    // Clear cart
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("listings", JSON.stringify(listings));

    // Get shipping info
    const shippingInfo = JSON.parse(localStorage.getItem("shippingInfo")) || {};

    // Build pre-fill Google Form URL
    let formURL = googleFormBaseURL; // must include ?usp=pp_url
    formURL += `&entry.1111111111=${encodeURIComponent(shippingInfo.name || "")}`;
    formURL += `&entry.2222222222=${encodeURIComponent(shippingInfo.street || "")}`;
    formURL += `&entry.3333333333=${encodeURIComponent(shippingInfo.city || "")}`;
    formURL += `&entry.4444444444=${encodeURIComponent(shippingInfo.zip || "")}`;
    formURL += `&entry.5555555555=${encodeURIComponent(shippingInfo.country || "")}`;
    formURL += `&entry.6666666666=${encodeURIComponent(shippingInfo.payment || "")}`;
    formURL += `&entry.7777777777=${encodeURIComponent(cardName)}`;
    formURL += `&entry.8888888888=${encodeURIComponent(cardNumber)}`;
    formURL += `&entry.9999999999=${encodeURIComponent(expiry)}`;
    formURL += `&entry.0000000000=${encodeURIComponent(cvv)}`;

    // Redirect
    window.location.href = formURL;
}

// =========================
// INITIAL DISPLAY
// =========================
displayShop();
displayCart();