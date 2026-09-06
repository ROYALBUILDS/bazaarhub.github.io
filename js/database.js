// BazaarHub Database Management Module
// Handles data persistence for GitHub Pages static hosting
// For production, replace with backend API

class BazaarHubDatabase {
    constructor() {
        this.products = [];
        this.categories = [];
        this.orders = [];
        this.loadData();
    }

    async loadData() {
        try {
            const productsResponse = await fetch('data/products.json');
            const productsData = await productsResponse.json();
            this.products = productsData.products || [];

            const categoriesResponse = await fetch('data/categories.json');
            const categoriesData = await categoriesResponse.json();
            this.categories = categoriesData.categories || [];

            const ordersData = localStorage.getItem('bazaarhubOrders');
            this.orders = ordersData ? JSON.parse(ordersData) : [];
        } catch (error) {
            console.error('Error loading database:', error);
        }
    }

    // Product Management
    getProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    getFeaturedProducts() {
        return this.products.filter(p => p.featured === true);
    }

    getTrendingProducts() {
        return this.products.filter(p => p.trending === true);
    }

    getNewArrivals() {
        return this.products.filter(p => p.newArrival === true);
    }

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            (p.specifications && p.specifications.some(s => s.toLowerCase().includes(lowerQuery)))
        );
    }

    filterProducts(filters) {
        let results = [...this.products];

        if (filters.category) {
            results = results.filter(p => p.category === filters.category);
        }

        if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
            results = results.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
        }

        if (filters.inStock !== undefined) {
            results = results.filter(p => (p.stock > 0) === filters.inStock);
        }

        if (filters.minRating !== undefined) {
            results = results.filter(p => p.rating >= filters.minRating);
        }

        return results;
    }

    // Category Management
    getCategories() {
        return this.categories;
    }

    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }

    // Order Management
    createOrder(orderData) {
        const order = {
            id: this.generateOrderId(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.orders.push(order);
        this.saveOrders();
        return order;
    }

    getOrders() {
        return this.orders;
    }

    getOrderById(id) {
        return this.orders.find(o => o.id === id);
    }

    getOrdersByCustomerPhone(phone) {
        return this.orders.filter(o => o.customer && o.customer.phone === phone);
    }

    updateOrderStatus(orderId, status) {
        const order = this.getOrderById(orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
            return order;
        }
        return null;
    }

    generateOrderId() {
        return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    saveOrders() {
        localStorage.setItem('bazaarhubOrders', JSON.stringify(this.orders));
    }

    // Admin: Product Management
    addProduct(productData) {
        const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
        const product = {
            id: newId,
            ...productData,
            createdAt: new Date().toISOString().split('T')[0]
        };
        this.products.push(product);
        return product;
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
            return this.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            return true;
        }
        return false;
    }
}

// Initialize global database instance
const db = new BazaarHubDatabase();