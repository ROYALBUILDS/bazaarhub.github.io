// BazaarHub - Premium Product System

let products = [];

// Load products
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');

        if (!response.ok) {
            throw new Error('Products file could not be loaded');
        }

        const data = await response.json();

        products = Array.isArray(data.products) ? data.products : [];

        window.products = products;

        displayAllProductSections();
        populateCategoryFilter();

        console.log(`BazaarHub: ${products.length} products loaded`);
    } catch (error) {
        console.error(error);
        showProductLoadError();
    }
}

// Get first available image
function getProductImage(product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }

    if (product.thumbnail) {
        return product.thumbnail;
    }

    if (product.image) {
        return product.image;
    }

    return '';
}

// Check if value is an actual image
function isImageSource(value) {
    if (!value || typeof value !== 'string') return false;

    return (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('/') ||
        value.startsWith('./') ||
        value.startsWith('../') ||
        /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(value)
    );
}

// Escape HTML
function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Calculate discount
function getDiscountPercentage(product) {
    const price = Number(product.price);
    const mrp = Number(product.mrp || product.originalPrice);

    if (!price || !mrp || mrp <= price) return 0;

    return Math.round(((mrp - price) / mrp) * 100);
}

// Product image
function createProductImage(product) {
    const image = getProductImage(product);

    if (isImageSource(image)) {
        return `
            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.title || 'Product')}"
                loading="lazy"
                onerror="this.style.display='none'; this.parentElement.classList.add('image-error');"
            >
        `;
    }

    // Temporary emoji fallback
    return `
        <div class="bh-image-placeholder">
            ${escapeHTML(image || '🛍️')}
        </div>
    `;
}

// Create premium product card
function createProductCard(product) {
    const price = Number(product.price) || 0;
    const mrp = Number(product.mrp || product.originalPrice) || 0;
    const discount = getDiscountPercentage(product);

    const stock = Number(product.stock);
    const outOfStock = Number.isFinite(stock) && stock <= 0;

    const title = product.title || product.name || 'Unnamed Product';

    return `
        <article class="bh-product-card">

            <div class="bh-product-image">

                ${createProductImage(product)}

                ${
                    discount > 0
                        ? `<span class="bh-discount-badge">${discount}% OFF</span>`
                        : ''
                }

                ${
                    product.trending
                        ? `<span class="bh-trending-badge">🔥 Trending</span>`
                        : ''
                }

                ${
                    outOfStock
                        ? `<div class="bh-out-stock">Out of Stock</div>`
                        : ''
                }

            </div>

            <div class="bh-product-info">

                <div class="bh-category">
                    ${escapeHTML(product.category || 'General')}
                </div>

                <h3 class="bh-product-title">
                    ${escapeHTML(title)}
                </h3>

                <p class="bh-description">
                    ${escapeHTML(product.description || '')}
                </p>

                <div class="bh-rating">
                    ⭐ ${escapeHTML(product.rating || '4.5')}
                    ${
                        product.reviews
                            ? `<span>(${escapeHTML(product.reviews)})</span>`
                            : ''
                    }
                </div>

                <div class="bh-price-row">

                    <div>
                        <span class="bh-price">
                            ₹${price.toLocaleString('en-IN')}
                        </span>

                        ${
                            mrp > price
                                ? `
                                    <span class="bh-mrp">
                                        ₹${mrp.toLocaleString('en-IN')}
                                    </span>
                                `
                                : ''
                        }
                    </div>

                    ${
                        discount > 0
                            ? `<span class="bh-save">Save ${discount}%</span>`
                            : ''
                    }

                </div>

                ${
                    Number.isFinite(stock) && stock > 0
                        ? `
                            <div class="bh-stock">
                                📦 ${stock} items available
                            </div>
                        `
                        : ''
                }

                <button
                    class="bh-cart-button"
                    onclick="handleAddToCart(${Number(product.id)})"
                    ${outOfStock ? 'disabled' : ''}
                >
                    ${
                        outOfStock
                            ? 'Out of Stock'
                            : '🛒 Add to Cart'
                    }
                </button>

            </div>

        </article>
    `;
}

// Display products
function displayProducts(productList, gridId) {
    const grid = document.getElementById(gridId);

    if (!grid) return;

    if (!productList || productList.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <div>🛍️</div>
                <p>No products found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = productList
        .map(createProductCard)
        .join('');
}

// Homepage sections
function displayAllProductSections() {

    displayProducts(
        products.filter(p => p.trending === true),
        'trendingGrid'
    );

    displayProducts(
        products.filter(p => p.featured === true),
        'featuredGrid'
    );

    displayProducts(
        products.filter(p => p.newArrival === true),
        'newArrivalsGrid'
    );

    displayProducts(
        products,
        'allProductsGrid'
    );
}

// Add to cart
function handleAddToCart(productId) {

    const product = products.find(
        p => Number(p.id) === Number(productId)
    );

    if (!product) {
        showNotification('❌ Product not found');
        return;
    }

    if (Number(product.stock) <= 0) {
        showNotification('❌ Product is out of stock');
        return;
    }

    if (typeof addToCart === 'function') {
        addToCart(productId);
    } else {
        showNotification('❌ Cart unavailable');
    }
}

// Search
function performSearch() {

    const input = document.getElementById('searchInput');

    if (!input) return;

    const query = input.value.trim().toLowerCase();

    if (!query) {
        displayAllProductSections();
        return;
    }

    const results = products.filter(product => {

        const title =
            String(product.title || product.name || '').toLowerCase();

        const description =
            String(product.description || '').toLowerCase();

        const category =
            String(product.category || '').toLowerCase();

        const sku =
            String(product.sku || '').toLowerCase();

        return (
            title.includes(query) ||
            description.includes(query) ||
            category.includes(query) ||
            sku.includes(query)
        );
    });

    displayProducts(results, 'allProductsGrid');

    ['trendingGrid', 'featuredGrid', 'newArrivalsGrid']
        .forEach(id => {
            const grid = document.getElementById(id);
            if (grid) grid.innerHTML = '';
        });
}

// Category filter
function filterByCategory() {

    const filter = document.getElementById('categoryFilter');

    if (!filter) return;

    const category = filter.value;

    if (!category) {
        displayAllProductSections();
        return;
    }

    const results = products.filter(
        product =>
            String(product.category || '').toLowerCase() ===
            category.toLowerCase()
    );

    displayProducts(results, 'allProductsGrid');

    ['trendingGrid', 'featuredGrid', 'newArrivalsGrid']
        .forEach(id => {
            const grid = document.getElementById(id);
            if (grid) grid.innerHTML = '';
        });
}

// Category dropdown
function populateCategoryFilter() {

    const filter = document.getElementById('categoryFilter');

    if (!filter) return;

    const categories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(Boolean)
        )
    ].sort();

    filter.innerHTML = `
        <option value="">All Categories</option>

        ${categories.map(category => `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(
                    category.charAt(0).toUpperCase() +
                    category.slice(1)
                )}
            </option>
        `).join('')}
    `;
}

// Error
function showProductLoadError() {

    [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid',
        'allProductsGrid'
    ].forEach(id => {

        const grid = document.getElementById(id);

        if (grid) {
            grid.innerHTML = `
                <div class="no-products">
                    ⚠️ Products could not be loaded.
                    <br><br>
                    <button onclick="loadProducts()">
                        Try Again
                    </button>
                </div>
            `;
        }
    });
}

// Search input
document.addEventListener('DOMContentLoaded', function () {

    loadProducts();

    const searchInput =
        document.getElementById('searchInput');

    if (searchInput) {

        searchInput.addEventListener(
            'input',
            performSearch
        );

        searchInput.addEventListener(
            'keydown',
            function (event) {
                if (event.key === 'Enter') {
                    performSearch();
                }
            }
        );
    }
});
