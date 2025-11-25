// Gestión de productos desde el admin
function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    displayAdminProducts(products);
}

function addProduct(productData) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    displayAdminProducts(products);
}

function updateProduct(productId, updates) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.map(p => p.id === productId ? { ...p, ...updates } : p);
    localStorage.setItem('products', JSON.stringify(products));
    displayAdminProducts(products);
}
// admin.js - Script para el dashboard del admin
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    checkAdminAuth();
    loadDashboardStats();
    setupDashboard();
}

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    
    if (!user || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
    
    // Mostrar nombre del admin
    const welcomeElement = document.querySelector('.admin-welcome h1');
    if (welcomeElement) {
        welcomeElement.textContent = `Panel de Administración - ${user.name}`;
    }
}

function loadDashboardStats() {
    // Cargar datos desde localStorage
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    
    // Actualizar estadísticas
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('featuredProducts').textContent = products.filter(p => p.featured).length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('lowStockProducts').textContent = products.filter(p => p.stock <= (p.minStock || 5)).length;
    
    console.log('📊 Dashboard stats loaded:', {
        products: products.length,
        featured: products.filter(p => p.featured).length,
        categories: categories.length,
        lowStock: products.filter(p => p.stock <= (p.minStock || 5)).length
    });
}

function setupDashboard() {
    // Aquí puedes agregar más funcionalidades del dashboard
    console.log('🎯 Dashboard initialized');
}

// Función global para logout
window.logoutUser = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('hairia_current_user');
        sessionStorage.removeItem('hairia_current_user');
        window.location.href = '../index.html';
    }
};
