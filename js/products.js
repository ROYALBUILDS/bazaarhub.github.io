// BazaarHub Product Management
// Loads products from data/products.json
// Compatible with cart.js and the existing homepage

let products = [];

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');

        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status}`);
        }

        const data = await response.json();

        products = Array.isArray(data.products) ? data.products : [];

        // Make products available globally
        window.products = products;

        displayAllProductSections();
        populateCategoryFilter();

        console.log(`BazaarHub: ${products.length} products loaded.`);
    } catch (error) {
        console.error('Error loading products:', error);

        products = [];
        window.products = [];

        showProductLoadError();
    }
}

// Get product image
function getProductImage(product) {
    // New format: images array
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }

    // New format: thumbnail
    if (product.thumbnail) {
        return product.thumbnail;
    }

    // Old format: image
    if (product.image) {
        return product.image;
    }

    // Fallback
    return '';
}

// Check whether image is an actual image URL/path
function isImageSource(value) {
    if (!value || typeof value !== 'string') {
        return false;
    }

    return (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('/') ||
        value.startsWith('./') ||
        value.startsWith('../') ||
        /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(value)
    );
}

// Create product image HTML
function createProductImage(product) {
    const image = getProductImage(product);

    if (isImageSource(image)) {
        return `
            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.title || 'Product image')}"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="product-image-fallback" style="display:none;">
                🛍️
            </div>
        `;
    }

    // Temporary fallback for current emoji products
    return `
        <div class="product-image-fallback">
            ${escapeHTML(image || '🛍️')}
        </div>
    `;
}

// Escape HTML to prevent unsafe product data from becoming HTML
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

    if (!price || !mrp || mrp <= price) {
        return 0;
    }

    return Math.round(((mrp - price) / mrp) * 100);
}

// Create one product card
function createProductCard(product) {
    const price = Number(product.price) || 0;
    const mrp = Number(product.mrp || product.originalPrice) || 0;
    const discount = getDiscountPercentage(product);
    const stock = Number(product.stock);

    const outOfStock = Number.isFinite(stock) && stock <= 0;

    const ratingHTML =
        product.rating !== undefined && product.rating !== null
            ? `
                <div class="product-rating">
                    ⭐ ${escapeHTML(product.rating)}
                    ${
                        product.reviews
                            ? `<span>(${escapeHTML(product.reviews)} reviews)</span>`
                            : ''
                    }
                </div>
            `
            : '';

    return `
        <article class="product-card" data-product-id="${escapeHTML(product.id)}">

            <div class="product-image">
                ${createProductImage(product)}

                ${
                    discount > 0
                        ? `<span class="discount-badge">${discount}% OFF</span>`
                        : ''
                }

                ${
                    outOfStock
                        ? `<span class="stock-badge out-of-stock">Out of Stock</span>`
                        : ''
                }
            </div>

            <div class="product-info">

                <div class="product-category">
                    ${escapeHTML(product.category || 'Product')}
                </div>

                <h3 class="product-name">
                    ${escapeHTML(product.title || product.name || 'Unnamed Product')}
                </h3>

                <p class="product-description">
                    ${escapeHTML(product.description || '')}
                </p>

                ${ratingHTML}

                <div class="product-price">

                    <div class="price-container">
                        <span class="price">
                            ₹${price.toLocaleString('en-IN')}
                        </span>

                        ${
                            mrp > price
                                ? `
                                    <span class="original-price">
                                        ₹${mrp.toLocaleString('en-IN')}
                                    </span>
                                `
                                : ''
                        }
                    </div>

                    ${
                        discount > 0
                            ? `<span class="discount">${discount}% OFF</span>`
                            : ''
                    }

                </div>

                ${
                    Number.isFinite(stock)
                        ? `
                            <div class="stock-info">
                                ${
                                    stock > 0
                                        ? `${stock} left in stock`
                                        : 'Currently unavailable'
                                }
                            </div>
                        `
                        : ''
                }

                <div class="product-actions">

                    <button
                        class="add-to-cart-btn"
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

            </div>

        </article>
    `;
}

// Display products in a specific grid
function displayProducts(productsToDisplay, gridId) {
    const grid = document.getElementById(gridId);

    if (!grid) {
        return;
    }

    if (!productsToDisplay || productsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <div>🛍️</div>
                <p>No products available</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = productsToDisplay
        .map(createProductCard)
        .join('');
}

// Display all homepage sections
function displayAllProductSections() {
    const trendingProducts = products.filter(
        product => product.trending === true
    );

    const featuredProducts = products.filter(
        product => product.featured === true
    );

    const newArrivalProducts = products.filter(
        product => product.newArrival === true
    );

    displayProducts(trendingProducts, 'trendingGrid');
    displayProducts(featuredProducts, 'featuredGrid');
    displayProducts(newArrivalProducts, 'newArrivalsGrid');
    displayProducts(products, 'allProductsGrid');
}

// Add product to cart safely
function handleAddToCart(productId) {
    const product = products.find(
        product => Number(product.id) === Number(productId)
    );

    if (!product) {
        showNotification('❌ Product not found');
        return;
    }

    const stock = Number(product.stock);

    if (Number.isFinite(stock) && stock <= 0) {
        showNotification('❌ This product is out of stock');
        return;
    }

    if (typeof addToCart === 'function') {
        addToCart(productId);
    } else {
        console.error('addToCart() is not available.');
        showNotification('❌ Cart is currently unavailable');
    }
}

// Search products
function performSearch() {
    const searchInput = document.getElementById('searchInput');

    if (!searchInput) {
        return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        displayAllProductSections();
        return;
    }

    const filteredProducts = products.filter(product => {
        const title = String(product.title || product.name || '').toLowerCase();
        const description = String(product.description || '').toLowerCase();
        const category = String(product.category || '').toLowerCase();
        const sku = String(product.sku || '').toLowerCase();

        const specifications = Array.isArray(product.specifications)
            ? product.specifications.join(' ').toLowerCase()
            : '';

        return (
            title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            category.includes(searchTerm) ||
            sku.includes(searchTerm) ||
            specifications.includes(searchTerm)
        );
    });

    displayProducts(filteredProducts, 'allProductsGrid');

    // Hide empty category sections while searching
    const sectionIds = [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid'
    ];

    sectionIds.forEach(id => {
        const grid = document.getElementById(id);

        if (grid) {
            grid.innerHTML = '';
        }
    });
}

// Category filtering
function filterByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');

    if (!categoryFilter) {
        return;
    }

    const category = categoryFilter.value;

    if (!category) {
        displayAllProductSections();
        return;
    }

    const filteredProducts = products.filter(
        product =>
            String(product.category || '').toLowerCase() ===
            category.toLowerCase()
    );

    displayProducts(filteredProducts, 'allProductsGrid');

    // Hide other sections during filtering
    [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid'
    ].forEach(id => {
        const grid = document.getElementById(id);

        if (grid) {
            grid.innerHTML = '';
        }
    });
}

// Populate category dropdown
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');

    if (!categoryFilter) {
        return;
    }

    const categories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML = `
        <option value="">All Categories</option>
        ${categories
            .map(
                category =>
                    `<option value="${escapeHTML(category)}">
                        ${escapeHTML(
                            category.charAt(0).toUpperCase() +
                            category.slice(1)
                        )}
                    </option>`
            )
            .join('')}
    `;
}

// Show load error
function showProductLoadError() {
    const grids = [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid',
        'allProductsGrid'
    ];

    grids.forEach(id => {
        const grid = document.getElementById(id);

        if (grid) {
            grid.innerHTML = `
                <div class="no-products">
                    <div>⚠️</div>
                    <p>Products could not be loaded.</p>
                    <button onclick="loadProducts()">
                        Try Again
                    </button>
                </div>
            `;
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();

    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);

        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
});
