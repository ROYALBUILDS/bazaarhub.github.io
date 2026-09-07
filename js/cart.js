// ============================================================
// BAZAARHUB - CART MANAGEMENT SYSTEM
// ============================================================

const BAZAARHUB_CART_KEY = 'bazaarhubCart';


// ============================================================
// GET CART
// ============================================================

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(
                BAZAARHUB_CART_KEY
            );

        if (!savedCart) {
            return [];
        }

        const cart = JSON.parse(savedCart);

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            'BazaarHub cart error:',
            error
        );

        return [];
    }
}


// ============================================================
// SAVE CART
// ============================================================

function saveCart(cart) {

    try {

        localStorage.setItem(
            BAZAARHUB_CART_KEY,
            JSON.stringify(cart)
        );

        updateCartCount();

        return true;

    } catch (error) {

        console.error(
            'Unable to save cart:',
            error
        );

        return false;
    }
}


// ============================================================
// FIND PRODUCT
// ============================================================

function findBazaarProduct(productId) {

    const id = Number(productId);

    if (
        Array.isArray(window.products)
    ) {

        return window.products.find(
            product =>
                Number(product.id) === id
        );
    }

    if (
        typeof products !== 'undefined' &&
        Array.isArray(products)
    ) {

        return products.find(
            product =>
                Number(product.id) === id
        );
    }

    return null;
}


// ============================================================
// ADD TO CART
// ============================================================

function addToCart(productId, quantity = 1) {

    const product =
        findBazaarProduct(productId);

    if (!product) {

        showNotification(
            '❌ Product not found'
        );

        return false;
    }


    const stock =
        Number(product.stock);


    if (
        Number.isFinite(stock) &&
        stock <= 0
    ) {

        showNotification(
            '❌ Product is out of stock'
        );

        return false;
    }


    let requestedQuantity =
        Number(quantity);


    if (
        !Number.isFinite(requestedQuantity) ||
        requestedQuantity < 1
    ) {

        requestedQuantity = 1;
    }


    requestedQuantity =
        Math.floor(requestedQuantity);


    const cart =
        getCart();


    const existingItem =
        cart.find(
            item =>
                Number(item.id) ===
                Number(product.id)
        );


    if (existingItem) {

        let newQuantity =
            Number(existingItem.quantity) +
            requestedQuantity;


        if (
            Number.isFinite(stock) &&
            newQuantity > stock
        ) {

            newQuantity = stock;

            showNotification(
                `⚠️ Only ${stock} item(s) available`
            );

        }


        existingItem.quantity =
            newQuantity;

    } else {

        if (
            Number.isFinite(stock) &&
            requestedQuantity > stock
        ) {

            requestedQuantity = stock;
        }


        cart.push({

            ...product,

            quantity:
                requestedQuantity

        });
    }


    saveCart(cart);

    showNotification(
        '🛒 Added to cart!'
    );

    return true;
}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(productId) {

    const id =
        Number(productId);

    let cart =
        getCart();


    const originalLength =
        cart.length;


    cart =
        cart.filter(
            item =>
                Number(item.id) !== id
        );


    if (
        cart.length ===
        originalLength
    ) {

        return false;
    }


    saveCart(cart);

    showNotification(
        '🗑️ Product removed from cart'
    );

    refreshCartPage();

    return true;
}


// ============================================================
// UPDATE QUANTITY
// ============================================================

function updateQuantity(
    productId,
    newQuantity
) {

    const id =
        Number(productId);

    let quantity =
        Number(newQuantity);


    if (
        !Number.isFinite(quantity)
    ) {
        return false;
    }


    quantity =
        Math.floor(quantity);


    const cart =
        getCart();


    const item =
        cart.find(
            product =>
                Number(product.id) === id
        );


    if (!item) {
        return false;
    }


    // Quantity zero means remove

    if (quantity <= 0) {

        return removeFromCart(id);
    }


    const stock =
        Number(item.stock);


    if (
        Number.isFinite(stock) &&
        stock > 0 &&
        quantity > stock
    ) {

        quantity = stock;

        showNotification(
            `⚠️ Only ${stock} item(s) available`
        );
    }


    item.quantity =
        quantity;


    saveCart(cart);

    refreshCartPage();

    return true;
}


// ============================================================
// INCREASE QUANTITY
// ============================================================

function increaseQuantity(productId) {

    const cart =
        getCart();


    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!item) {
        return false;
    }


    return updateQuantity(
        productId,
        Number(item.quantity) + 1
    );
}


// ============================================================
// DECREASE QUANTITY
// ============================================================

function decreaseQuantity(productId) {

    const cart =
        getCart();


    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!item) {
        return false;
    }


    return updateQuantity(
        productId,
        Number(item.quantity) - 1
    );
}


// ============================================================
// CLEAR CART
// ============================================================

function clearCart() {

    localStorage.removeItem(
        BAZAARHUB_CART_KEY
    );

    updateCartCount();

    refreshCartPage();

    showNotification(
        '🛒 Cart cleared'
    );
}


// ============================================================
// GET CART ITEM COUNT
// ============================================================

function getCartItemCount() {

    const cart =
        getCart();


    return cart.reduce(
        (total, item) =>
            total +
            (
                Number(item.quantity) || 0
            ),
        0
    );
}


// ============================================================
// GET CART SUBTOTAL
// ============================================================

function getCartTotal() {

    const cart =
        getCart();


    return cart.reduce(
        (total, item) => {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;


            return total +
                (price * quantity);

        },
        0
    );
}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatPrice(amount) {

    return Number(amount || 0)
        .toLocaleString(
            'en-IN',
            {
                maximumFractionDigits: 0
            }
        );
}


// ============================================================
// UPDATE CART COUNT
// ============================================================

function updateCartCount() {

    const count =
        getCartItemCount();


    const cartCountElements =
        document.querySelectorAll(
            '#cart-count'
        );


    cartCountElements.forEach(
        element => {

            element.textContent =
                count;

        }
    );
}


// ============================================================
// SHOW NOTIFICATION
// ============================================================

function showNotification(message) {

    const oldNotification =
        document.querySelector(
            '.bh-notification'
        );


    if (oldNotification) {
        oldNotification.remove();
    }


    const notification =
        document.createElement(
            'div'
        );


    notification.className =
        'bh-notification';


    notification.textContent =
        message;


    notification.innerHTML = `
        <span class="bh-notification-text">
            ${escapeCartHTML(message)}
        </span>

        <button
            class="bh-notification-close"
            onclick="this.parentElement.remove()"
            aria-label="Close"
        >
            ×
        </button>
    `;


    notification.style.cssText = `

        position: fixed;

        top: 22px;

        right: 22px;

        z-index: 99999;

        min-width: 260px;

        max-width: 380px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 15px;

        padding: 15px 17px;

        border-radius: 14px;

        background:
            rgba(20, 20, 20, 0.96);

        color: #ffffff;

        font-family:
            Arial,
            sans-serif;

        font-size: 14px;

        font-weight: 600;

        box-shadow:
            0 15px 40px
            rgba(0,0,0,0.22);

        border:
            1px solid
            rgba(255,255,255,0.12);

        animation:
            bhNotificationIn
            0.3s ease forwards;
    `;


    document.body.appendChild(
        notification
    );


    const closeButton =
        notification.querySelector(
            '.bh-notification-close'
        );


    if (closeButton) {

        closeButton.style.cssText = `

            border: none;

            background: transparent;

            color: #ffffff;

            font-size: 22px;

            line-height: 1;

            cursor: pointer;

            padding: 0;

            opacity: 0.8;
        `;
    }


    setTimeout(
        () => {

            if (
                notification &&
                notification.parentElement
            ) {

                notification.style.animation =
                    'bhNotificationOut 0.25s ease forwards';


                setTimeout(
                    () => {

                        if (
                            notification &&
                            notification.parentElement
                        ) {
                            notification.remove();
                        }

                    },
                    250
                );
            }

        },
        3000
    );
}


// ============================================================
// ESCAPE HTML FOR NOTIFICATIONS
// ============================================================

function escapeCartHTML(value) {

    return String(value ?? '')
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );
}


// ============================================================
// REFRESH CART PAGE
// ============================================================

function refreshCartPage() {

    if (
        typeof window.renderCart ===
        'function'
    ) {

        window.renderCart();

    }

    if (
        typeof window.displayCart ===
        'function'
    ) {

        window.displayCart();

    }

    updateCartCount();
}


// ============================================================
// CART PAGE NAVIGATION
// ============================================================

function goToCart() {

    window.location.href =
        'pages/cart.html';
}


// ============================================================
// BUY NOW
// ============================================================

function buyNow(productId, quantity = 1) {

    const product =
        findBazaarProduct(productId);


    if (!product) {

        showNotification(
            '❌ Product not found'
        );

        return false;
    }


    if (
        Number(product.stock) <= 0
    ) {

        showNotification(
            '❌ Product is out of stock'
        );

        return false;
    }


    let qty =
        Number(quantity);


    if (
        !Number.isFinite(qty) ||
        qty < 1
    ) {
        qty = 1;
    }


    qty =
        Math.floor(qty);


    if (
        Number.isFinite(
            Number(product.stock)
        ) &&
        qty > Number(product.stock)
    ) {

        qty =
            Number(product.stock);
    }


    // Store temporary Buy Now item

    const buyNowItem = {

        ...product,

        quantity: qty

    };


    sessionStorage.setItem(
        'bazaarhubBuyNow',
        JSON.stringify(
            buyNowItem
        )
    );


    // Open checkout

    window.location.href =
        'checkout.html';


    return true;
}


// ============================================================
// ADD CART CSS / ANIMATIONS
// ============================================================

(function addCartStyles() {

    if (
        document.getElementById(
            'bazaarhub-cart-styles'
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            'style'
        );


    style.id =
        'bazaarhub-cart-styles';


    style.textContent = `

        @keyframes bhNotificationIn {

            from {
                opacity: 0;
                transform:
                    translateX(30px)
                    translateY(-8px);
            }

            to {
                opacity: 1;
                transform:
                    translateX(0)
                    translateY(0);
            }
        }


        @keyframes bhNotificationOut {

            from {
                opacity: 1;
                transform:
                    translateX(0);
            }

            to {
                opacity: 0;
                transform:
                    translateX(30px);
            }
        }

    `;


    document.head.appendChild(
        style
    );

})();


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        updateCartCount();

    }
);
