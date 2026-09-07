// BazaarHub - Premium Product System
// Complete Product Management + Search + Category + Product Details

let products = [];

// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {
    try {
        const response = await fetch('data/products.json');

        if (!response.ok) {
            throw new Error('Products file could not be loaded');
        }

        const data = await response.json();

        products = Array.isArray(data.products)
            ? data.products
            : [];

        window.products = products;

        displayAllProductSections();
        populateCategoryFilter();

        console.log(
            `BazaarHub: ${products.length} products loaded`
        );

    } catch (error) {

        console.error(
            'BazaarHub product loading error:',
            error
        );

        showProductLoadError();
    }
}


// ======================================================
// GET PRODUCT IMAGE
// ======================================================

function getProductImage(product) {

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
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


// ======================================================
// CHECK IMAGE SOURCE
// ======================================================

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


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ======================================================
// CALCULATE DISCOUNT
// ======================================================

function getDiscountPercentage(product) {

    const price = Number(product.price);

    const mrp = Number(
        product.mrp ||
        product.originalPrice
    );

    if (
        !price ||
        !mrp ||
        mrp <= price
    ) {
        return 0;
    }

    return Math.round(
        ((mrp - price) / mrp) * 100
    );
}


// ======================================================
// CREATE PRODUCT IMAGE
// ======================================================

function createProductImage(product) {

    const image = getProductImage(product);

    if (isImageSource(image)) {

        return `
            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    product.title ||
                    product.name ||
                    'Product'
                )}"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.parentElement.classList.add('image-error');
                "
            >
        `;
    }

    // Emoji fallback for products
    // that do not have an actual image yet.

    return `
        <div class="bh-image-placeholder">
            ${escapeHTML(image || '🛍️')}
        </div>
    `;
}


// ======================================================
// OPEN PRODUCT DETAILS
// ======================================================

function viewProduct(productId) {

    const id = Number(productId);

    if (!id) {
        showNotification('❌ Product not found');
        return;
    }

    window.location.href =
        `pages/product.html?id=${encodeURIComponent(id)}`;
}


// ======================================================
// CREATE PRODUCT CARD
// ======================================================

function createProductCard(product) {

    const price =
        Number(product.price) || 0;

    const mrp =
        Number(
            product.mrp ||
            product.originalPrice
        ) || 0;

    const discount =
        getDiscountPercentage(product);

    const stock =
        Number(product.stock);

    const outOfStock =
        Number.isFinite(stock) &&
        stock <= 0;

    const title =
        product.title ||
        product.name ||
        'Unnamed Product';

    return `
        <article
            class="bh-product-card"
            data-product-id="${Number(product.id)}"
        >

            <!-- PRODUCT IMAGE -->

            <div
                class="bh-product-image"
                onclick="viewProduct(${Number(product.id)})"
                style="cursor:pointer;"
            >

                ${createProductImage(product)}

                ${
                    discount > 0
                        ? `
                            <span class="bh-discount-badge">
                                ${discount}% OFF
                            </span>
                        `
                        : ''
                }

                ${
                    product.trending
                        ? `
                            <span class="bh-trending-badge">
                                🔥 Trending
                            </span>
                        `
                        : ''
                }

                ${
                    outOfStock
                        ? `
                            <div class="bh-out-stock">
                                Out of Stock
                            </div>
                        `
                        : ''
                }

            </div>


            <!-- PRODUCT INFORMATION -->

            <div class="bh-product-info">

                <!-- CATEGORY -->

                <div class="bh-category">
                    ${escapeHTML(
                        product.category ||
                        'General'
                    )}
                </div>


                <!-- PRODUCT TITLE -->

                <h3
                    class="bh-product-title"
                    onclick="viewProduct(${Number(product.id)})"
                    style="cursor:pointer;"
                >
                    ${escapeHTML(title)}
                </h3>


                <!-- DESCRIPTION -->

                <p class="bh-description">
                    ${escapeHTML(
                        product.description || ''
                    )}
                </p>


                <!-- RATING -->

                <div class="bh-rating">

                    ⭐
                    ${escapeHTML(
                        product.rating || '4.5'
                    )}

                    ${
                        product.reviews
                            ? `
                                <span>
                                    (${escapeHTML(
                                        product.reviews
                                    )})
                                </span>
                            `
                            : ''
                    }

                </div>


                <!-- PRICE -->

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
                            ? `
                                <span class="bh-save">
                                    Save ${discount}%
                                </span>
                            `
                            : ''
                    }

                </div>


                <!-- STOCK -->

                ${
                    Number.isFinite(stock) &&
                    stock > 0
                        ? `
                            <div class="bh-stock">
                                📦 ${stock} items available
                            </div>
                        `
                        : ''
                }


                <!-- ACTION BUTTONS -->

                <div class="bh-product-actions">

                    <button
                        class="bh-view-button"
                        onclick="viewProduct(${Number(product.id)})"
                    >
                        👁️ View Product
                    </button>


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

            </div>

        </article>
    `;
}


// ======================================================
// DISPLAY PRODUCTS
// ======================================================

function displayProducts(
    productList,
    gridId
) {

    const grid =
        document.getElementById(gridId);

    if (!grid) {
        return;
    }

    if (
        !productList ||
        productList.length === 0
    ) {

        grid.innerHTML = `
            <div class="no-products">

                <div>🛍️</div>

                <p>
                    No products found
                </p>

            </div>
        `;

        return;
    }

    grid.innerHTML =
        productList
            .map(createProductCard)
            .join('');
}


// ======================================================
// DISPLAY ALL HOMEPAGE SECTIONS
// ======================================================

function displayAllProductSections() {

    // Trending

    displayProducts(
        products.filter(
            product =>
                product.trending === true
        ),
        'trendingGrid'
    );


    // Featured

    displayProducts(
        products.filter(
            product =>
                product.featured === true
        ),
        'featuredGrid'
    );


    // New Arrivals

    displayProducts(
        products.filter(
            product =>
                product.newArrival === true
        ),
        'newArrivalsGrid'
    );


    // All Products

    displayProducts(
        products,
        'allProductsGrid'
    );
}


// ======================================================
// ADD TO CART
// ======================================================

function handleAddToCart(productId) {

    const product =
        products.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );

    if (!product) {

        showNotification(
            '❌ Product not found'
        );

        return;
    }


    if (
        Number(product.stock) <= 0
    ) {

        showNotification(
            '❌ Product is out of stock'
        );

        return;
    }


    if (
        typeof addToCart ===
        'function'
    ) {

        addToCart(
            Number(productId)
        );

    } else {

        showNotification(
            '❌ Cart unavailable'
        );
    }
}


// ======================================================
// SEARCH PRODUCTS
// ======================================================

function performSearch() {

    const input =
        document.getElementById(
            'searchInput'
        );

    if (!input) {
        return;
    }

    const query =
        input.value
            .trim()
            .toLowerCase();


    // Empty search

    if (!query) {

        displayAllProductSections();

        return;
    }


    const results =
        products.filter(product => {

            const title =
                String(
                    product.title ||
                    product.name ||
                    ''
                ).toLowerCase();


            const description =
                String(
                    product.description ||
                    ''
                ).toLowerCase();


            const category =
                String(
                    product.category ||
                    ''
                ).toLowerCase();


            const sku =
                String(
                    product.sku ||
                    ''
                ).toLowerCase();


            const specifications =
                Array.isArray(
                    product.specifications
                )
                    ? product.specifications
                        .join(' ')
                        .toLowerCase()
                    : '';


            return (
                title.includes(query) ||
                description.includes(query) ||
                category.includes(query) ||
                sku.includes(query) ||
                specifications.includes(query)
            );
        });


    // Show search results

    displayProducts(
        results,
        'allProductsGrid'
    );


    // Hide other sections

    [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid'
    ].forEach(id => {

        const grid =
            document.getElementById(id);

        if (grid) {
            grid.innerHTML = '';
        }
    });
}


// ======================================================
// CATEGORY FILTER
// ======================================================

function filterByCategory() {

    const filter =
        document.getElementById(
            'categoryFilter'
        );

    if (!filter) {
        return;
    }

    const category =
        filter.value;


    // All categories

    if (!category) {

        displayAllProductSections();

        return;
    }


    const results =
        products.filter(
            product =>
                String(
                    product.category || ''
                ).toLowerCase() ===
                category.toLowerCase()
        );


    displayProducts(
        results,
        'allProductsGrid'
    );


    // Hide other sections

    [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid'
    ].forEach(id => {

        const grid =
            document.getElementById(id);

        if (grid) {
            grid.innerHTML = '';
        }
    });
}


// ======================================================
// CATEGORY DROPDOWN
// ======================================================

function populateCategoryFilter() {

    const filter =
        document.getElementById(
            'categoryFilter'
        );

    if (!filter) {
        return;
    }


    const categories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ].sort();


    filter.innerHTML = `

        <option value="">
            All Categories
        </option>

        ${categories
            .map(category => {

                const formatted =
                    String(category)
                        .charAt(0)
                        .toUpperCase() +
                    String(category)
                        .slice(1);

                return `
                    <option
                        value="${escapeHTML(category)}"
                    >
                        ${escapeHTML(formatted)}
                    </option>
                `;
            })
            .join('')}

    `;
}


// ======================================================
// PRODUCT LOADING ERROR
// ======================================================

function showProductLoadError() {

    [
        'trendingGrid',
        'featuredGrid',
        'newArrivalsGrid',
        'allProductsGrid'
    ].forEach(id => {

        const grid =
            document.getElementById(id);

        if (!grid) {
            return;
        }

        grid.innerHTML = `

            <div class="no-products">

                ⚠️ Products could not be loaded.

                <br><br>

                <button
                    onclick="loadProducts()"
                >
                    Try Again
                </button>

            </div>

        `;
    });
}


// ======================================================
// SEARCH + INITIALIZATION
// ======================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        // Load products

        loadProducts();


        // Search input

        const searchInput =
            document.getElementById(
                'searchInput'
            );


        if (searchInput) {

            searchInput.addEventListener(
                'input',
                performSearch
            );


            searchInput.addEventListener(
                'keydown',
                function (event) {

                    if (
                        event.key ===
                        'Enter'
                    ) {

                        performSearch();
                    }
                }
            );
        }

    }
);
