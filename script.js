// =========================
// GLOBAL VARIABLES
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let listings = JSON.parse(localStorage.getItem("listings")) || [];

// =========================
// UNIVERSAL BACK BUTTON
// =========================
function goBack(targetPage) {
    if(!targetPage) targetPage = "index.html";
    window.location.href = targetPage;
}

// =========================
// DISPLAY SHOP
// =========================
function displayShop() {
    const shop = document.getElementById("shop");
    if(!shop) return;

    shop.innerHTML = "";

    listings.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:150px;height:210px;">
            <h3>${item.name}</h3>
            <p>$${item.price}</p>
            <button class="addCartBtn">Add to Cart</button>
        `;
        shop.appendChild(div);

        div.querySelector(".addCartBtn").addEventListener("click", () => {
            addToCart(index);
        });
    });
}

// =========================
// ADD TO CART
// =========================
function addToCart(index) {
    const item = listings[index];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Remove from shop
    listings.splice(index, 1);
    localStorage.setItem("listings", JSON.stringify(listings));

    displayShop();
    displayCart();
}

// =========================
// DISPLAY CART
// =========================
function displayCart() {
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
// LIST A NEW CARD (AUTOMATIC IMAGE)
// =========================
async function listCard(nameInputId, priceInputId) {
    const name = document.getElementById(nameInputId).value.trim();
    const price = Number(document.getElementById(priceInputId).value);

    if(!name || !price){
        alert("Please fill in both name and price!");
        return;
    }

    // Default placeholder if API fails
    let imageURL = "https://via.placeholder.com/150x210?text=Pokémon";

    try {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`);
        const data = await response.json();
        if(data.data && data.data.length > 0) {
            imageURL = data.data[0].images.small || imageURL;
        }
    } catch(err){
        console.error("Failed to fetch Pokémon image:", err);
    }

    listings.push({name, price, image: imageURL});
    localStorage.setItem("listings", JSON.stringify(listings));

    // Clear inputs
    document.getElementById(nameInputId).value = "";
    document.getElementById(priceInputId).value = "";

    displayShop();
}

// =========================
// INITIALIZE SHOP & CART
// =========================
displayShop();
displayCart();
