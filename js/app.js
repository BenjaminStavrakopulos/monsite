// app.js - VERSIÓN FINAL COMPLETA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 HairIA App Iniciada');
    initializeApplication();
});

// ==================== VARIABLES GLOBALES ====================
window.currentCart = [];
window.currentUser = null;

window.productsData = JSON.parse(localStorage.getItem('hairia_products')) || [
    {
        id: 1,
        name: "Shampoo Reparador Intenso",
        price: 29.99,
        category: "shampoo",
        featured: true,
        description: "Shampoo con keratina para cabello dañado y quebradizo",
        image: "",
        stock: 50,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: "Acondicionador Hidratante",
        price: 24.99,
        category: "acondicionador", 
        featured: false,
        description: "Acondicionador profundo con aceite de argán",
        image: "",
        stock: 45,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: "Mascarilla Reconstructora",
        price: 39.99,
        category: "tratamiento",
        featured: true,
        description: "Tratamiento intensivo nocturno para reparación capilar",
        image: "",
        stock: 30,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        name: "Aceite Capilar Sellador",
        price: 34.99,
        category: "aceite",
        featured: false,
        description: "Aceite nutritivo para puntas abiertas y frizz",
        image: "",
        stock: 25,
        createdAt: new Date().toISOString()
    }
];

window.categories = JSON.parse(localStorage.getItem('hairia_categories')) || [
    { id: "shampoo", name: "Shampoo", color: "#1a1a1a" },
    { id: "acondicionador", name: "Acondicionador", color: "#2d2d2d" },
    { id: "tratamiento", name: "Tratamientos Capilares", color: "#404040" },
    { id: "aceite", name: "Aceites", color: "#555555" }
];

function initializeApplication() {
    // 1. Verificar usuario
    window.currentUser = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    console.log('👤 Usuario:', window.currentUser?.name || 'No logueado');
    
    // 2. Configurar interfaz
    setupUserInterface();
    
    // 3. Inicializar sistemas
    initializeSystems();
}

function setupUserInterface() {
    // Buscar el botón por cualquier ID posible
    let loginBtn = document.getElementById('loginBtn') || document.getElementById('loginButton');
    
    if (!loginBtn) {
        console.log('❌ Botón login no encontrado con ningún ID');
        return;
    }
    
    console.log('✅ Botón login encontrado:', loginBtn.id);
    
    if (window.currentUser && window.currentUser.name) {
        // Usuario logueado
        loginBtn.innerHTML = `
            <div class="user-menu">
                <span>👤 ${window.currentUser.name}</span>
                <div class="user-dropdown">
                    <a href="#" onclick="logoutUser()">Cerrar Sesión</a>
                </div>
            </div>
        `;
        loginBtn.classList.add('user-logged-in');
        loginBtn.onclick = null;
    } else {
        // Usuario no logueado
        loginBtn.innerHTML = 'Iniciar Sesión';
        loginBtn.classList.remove('user-logged-in');
        loginBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
            return false;
        };
    }
}

function initializeSystems() {
    loadUserCart();
    loadFeaturedProducts(); 
    loadCategories(); 
    loadProducts();
    setupCartEvents();
    setupUserMenuInteractions();
    setupSearch(); 
}

function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (!featuredGrid) return;

    const featuredProducts = window.productsData.filter(product => product.featured);
    
    if (featuredProducts.length > 0) {
        const emojis = {'shampoo': '🧴', 'acondicionador': '💧', 'tratamiento': '🎭', 'aceite': '💧'};
        
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <div class="image-placeholder">
                        <span class="product-emoji">${emojis[product.category] || '🛍️'}</span>
                        <span class="product-text">${product.name.split(' ')[0]}</span>
                    </div>
                    <span class="featured-badge">⭐ Destacado</span>
                </div>
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-desc">${product.description}</p>
                <button class="add-to-cart" onclick="addToCartFromButton(${product.id})">
                    Agregar al Carrito
                </button>
            </div>
        `).join('');
    } else {
        featuredGrid.innerHTML = '<p class="no-featured">No hay productos destacados en este momento.</p>';
    }
}

function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = window.categories.map(category => `
        <div class="category-card" data-category="${category.id}">
            <div class="category-icon" style="background-color: ${category.color}">
                ${getCategoryEmoji(category.id)}
            </div>
            <h3>${category.name}</h3>
            <p>${window.productsData.filter(p => p.category === category.id).length} productos</p>
            <a href="products.html?category=${category.id}" class="category-link">Ver productos</a>
        </div>
    `).join('');
}

function getCategoryEmoji(categoryId) {
    const emojis = {
        'shampoo': '🧴',
        'acondicionador': '💧',
        'tratamiento': '🎭', 
        'aceite': '💧'
    };
    return emojis[categoryId] || '🛍️';
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput || !searchButton) return;

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            // Redirigir a products.html con el término de búsqueda
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// ACTUALIZAR esta función para usar la nueva estructura
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    // Mostrar solo algunos productos en el index (opcional)
    const productsToShow = window.productsData.slice(0, 6); // Mostrar primeros 6
    
    const emojis = {
        'shampoo': '🧴', 
        'acondicionador': '💧', 
        'tratamiento': '🎭', 
        'aceite': '💧'
    };
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                <div class="image-placeholder">
                    <span class="product-emoji">${emojis[product.category] || '🛍️'}</span>
                    <span class="product-text">${product.name.split(' ')[0]}</span>
                </div>
                ${product.featured ? '<span class="featured-badge">⭐ Destacado</span>' : ''}
            </div>
            <h3>${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-desc">${product.description}</p>
            <div class="product-category">${window.categories.find(cat => cat.id === product.category)?.name || product.category}</div>
            <button class="add-to-cart" onclick="addToCartFromButton(${product.id})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
}

function setupUserMenuInteractions() {
    const loginBtn = document.getElementById('loginBtn') || document.getElementById('loginButton');
    if (!loginBtn || !loginBtn.classList.contains('user-logged-in')) return;
    
    let hideTimeout;
    const dropdown = loginBtn.querySelector('.user-dropdown');
    
    if (!dropdown) return;
    
    dropdown.style.display = 'none';
    
    loginBtn.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
        dropdown.style.display = 'block';
    });
    
    loginBtn.addEventListener('mouseleave', function() {
        hideTimeout = setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    });
    
    dropdown.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
    });
    
    dropdown.addEventListener('mouseleave', function() {
        dropdown.style.display = 'none';
    });
}

function loadUserCart() {
    if (window.currentUser?.id) {
        const userCartKey = `hairia_cart_${window.currentUser.id}`;
        window.currentCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
        console.log('🛒 Carrito cargado para usuario:', window.currentUser.id, window.currentCart);
    } else {
        window.currentCart = JSON.parse(localStorage.getItem('hairia_guest_cart')) || [];
        console.log('🛒 Carrito de invitado cargado:', window.currentCart);
    }
    updateCartUI();
}

function setupCartEvents() {
    const cartIcon = document.getElementById('cartIcon');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
}

// ==================== FUNCIONES DEL CARRITO ====================
function updateCartUI() {
    console.log('🔄 Actualizando UI del carrito:', window.currentCart);
    
    // Actualizar contador del carrito
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = window.currentCart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        console.log('🔢 Contador actualizado:', totalItems);
    }
    
    // Actualizar items del carrito en el sidebar
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItems) {
        if (window.currentCart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            console.log('📦 Carrito vacío');
        } else {
            cartItems.innerHTML = window.currentCart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <span class="item-price">$${item.price.toFixed(2)} c/u</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
            console.log('📋 Items renderizados en el carrito:', window.currentCart.length);
        }
    }
    
    if (cartTotal) {
        const total = window.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
        console.log('💰 Total actualizado:', total);
    }
}

function addToCart(product) {
    const existingItem = window.currentCart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.currentCart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${product.name} agregado al carrito`);
}

function removeFromCart(productId) {
    window.currentCart = window.currentCart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Producto eliminado del carrito');
}

function updateQuantity(productId, change) {
    const item = window.currentCart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    if (window.currentUser?.id) {
        const userCartKey = `hairia_cart_${window.currentUser.id}`;
        localStorage.setItem(userCartKey, JSON.stringify(window.currentCart));
        console.log('💾 Carrito guardado para usuario:', window.currentUser.id);
    } else {
        localStorage.setItem('hairia_guest_cart', JSON.stringify(window.currentCart));
        console.log('💾 Carrito de invitado guardado');
    }
}

// ==================== FUNCIONES GLOBALES ====================
window.addToCartFromButton = function(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (product) addToCart(product);
};

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;

window.logoutUser = function() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('hairia_current_user');
    sessionStorage.removeItem('hairia_current_user');
    window.location.href = 'index.html';
};

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        console.log('🛒 Carrito toggled:', cartSidebar.classList.contains('active'));
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-black);
        color: var(--primary-white);
        padding: 1rem 1.5rem;
        border-radius: 6px;
        z-index: 3000;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}