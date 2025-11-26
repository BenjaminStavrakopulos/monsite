document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 HairIA App Iniciada');
    initializeApplication();
});

window.currentCart = [];
window.currentUser = null;

window.productsData = JSON.parse(localStorage.getItem('hairia_products')) || [
    {
        id: 1,
        name: "Shampoo Reparador Intenso",
        price: 19990,
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
        price: 14990,
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
        price: 24990,
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
        price: 17990,
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
    window.currentUser = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    console.log('👤 Usuario:', window.currentUser?.name || 'No logueado');

    setupUserInterface();
    initializeSystems();
}

function setupUserInterface() {
    let loginBtn = document.getElementById('loginBtn') || document.getElementById('loginButton');

    if (!loginBtn) {
        console.log('❌ Botón login no encontrado con ningún ID');
        return;
    }

    console.log('✅ Botón login encontrado:', loginBtn.id);

    if (window.currentUser && window.currentUser.name) {
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
        loginBtn.innerHTML = 'Iniciar Sesión';
        loginBtn.classList.remove('user-logged-in');
        loginBtn.onclick = function (e) {
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

function getDiscountedPrice(product) {
    if (product.discountType === 'percentage' && product.discountPercent) {
        return product.price - (product.price * product.discountPercent / 100);
    } else if (product.discountType === 'amount' && product.discountAmount) {
        return product.price - product.discountAmount;
    }
    return product.price;
}

function getDiscountText(product) {
    if (product.discountType === 'percentage' && product.discountPercent) {
        return `-${product.discountPercent}%`;
    } else if (product.discountType === 'amount' && product.discountAmount) {
        return `-${formatCLP(product.discountAmount)}`;
    }
    return '';
}

function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (!featuredGrid) return;

    const featuredProducts = window.productsData.filter(product => product.featured);

    if (featuredProducts.length > 0) {
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card" onclick="openProductModal(${product.id})" style="cursor: pointer;">
                <div class="product-image">
                    ${product.image ?
                `<img src="${product.image}" alt="${product.name}" class="product-real-image">` :
                `<div class="image-placeholder">
                            <span class="product-emoji">${getCategoryEmoji(product.category)}</span>
                            <span class="product-text">${product.name.split(' ')[0]}</span>
                        </div>`
            }
                    ${product.featured ? '<span class="featured-badge">⭐ Destacado</span>' : ''}
                </div>
                <div class="product-info">
               <h3>${product.name}</h3>
${product.discountType !== 'none' ?
                `<div class="price-with-discount">
        <span class="original-price">${formatCLP(product.price)}</span>
        <span class="discount-badge">${getDiscountText(product)}</span>
        <p class="product-price discounted">${formatCLP(getDiscountedPrice(product))}</p>
    </div>` :
                `<p class="product-price">${formatCLP(product.price)}</p>`
            }
<p class="product-desc">${product.description}</p>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCartFromButton(${product.id})">
                        Agregar al Carrito
                    </button>
                </div>
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
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const productsToShow = window.productsData.slice(0, 6);

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})" style="cursor: pointer;">
            <div class="product-image">
                ${product.image ?
            `<img src="${product.image}" alt="${product.name}" class="product-real-image">` :
            `<div class="image-placeholder">
                        <span class="product-emoji">${getCategoryEmoji(product.category)}</span>
                        <span class="product-text">${product.name.split(' ')[0]}</span>
                    </div>`
        }
                ${product.featured ? '<span class="featured-badge">⭐ Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${product.discountType && product.discountType !== 'none' ?
            `<div class="price-with-discount">
                        <span class="original-price">${formatCLP(product.price)}</span>
                        <span class="discount-badge">${getDiscountText(product)}</span>
                        <p class="product-price discounted">${formatCLP(getDiscountedPrice(product))}</p>
                    </div>` :
            `<p class="product-price">${formatCLP(product.price)}</p>`
        }
                <p class="product-desc">${product.description}</p>
                <div class="product-category">${window.categories.find(cat => cat.id === product.category)?.name || product.category}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCartFromButton(${product.id})">
                    Agregar al Carrito
                </button>
            </div>
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

    loginBtn.addEventListener('mouseenter', function () {
        clearTimeout(hideTimeout);
        dropdown.style.display = 'block';
    });

    loginBtn.addEventListener('mouseleave', function () {
        hideTimeout = setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    });

    dropdown.addEventListener('mouseenter', function () {
        clearTimeout(hideTimeout);
    });

    dropdown.addEventListener('mouseleave', function () {
        dropdown.style.display = 'none';
    });
}

function loadUserCart() {
    if (window.currentUser?.id) {
        const userCartKey = `hairia_cart_${window.currentUser.id}`;
        window.currentCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    } else {
        window.currentCart = JSON.parse(localStorage.getItem('hairia_guest_cart')) || [];
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

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = window.currentCart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cartItems) {
        if (window.currentCart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        } else {
            cartItems.innerHTML = window.currentCart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <span class="item-price">${formatCLP(item.price)} c/u</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn">🗑️</button>
                    </div>
                    <div class="cart-item-total">${formatCLP(item.price * item.quantity)}</div>
                </div>
            `).join('');
        }
    }

    if (cartTotal) {
        const total = window.currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatCLP(total).replace('CLP', '').trim();
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
    } else {
        localStorage.setItem('hairia_guest_cart', JSON.stringify(window.currentCart));
    }
}

window.addToCartFromButton = function (productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (product) addToCart(product);
};

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;

window.logoutUser = function () {
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

function openProductModal(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalProductName').textContent = product.name;

    const modalHeader = document.querySelector('.modal-header');
    modalHeader.innerHTML = `
    <h2 id="modalProductName">${product.name}</h2>
    <div class="modal-price-section">
        ${product.discountType !== 'none' ?
            `<div class="modal-price-with-discount">
                <span class="modal-original-price">${formatCLP(product.price)}</span>
                <span class="modal-discount-badge">${getDiscountText(product)}</span>
                <div class="modal-final-price">${formatCLP(getDiscountedPrice(product))}</div>
            </div>` :
            `<div class="modal-price">${formatCLP(product.price)}</div>`
        }
    </div>
`;

    document.getElementById('modalProductCategory').textContent = getCategoryName(product.category);
    document.getElementById('modalProductDescription').textContent = product.description;
    document.getElementById('modalProductSKU').textContent = product.sku || 'N/A';
    document.getElementById('modalProductStock').textContent = product.stock;
    document.getElementById('modalProductQuantity').textContent = product.quantity && product.unit ?
        `${product.quantity} ${product.unit}` : 'N/A';

    const productImage = document.getElementById('modalProductImage');
    const imagePlaceholder = document.getElementById('modalImagePlaceholder');

    if (product.image) {
        productImage.src = product.image;
        productImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
    } else {
        productImage.style.display = 'none';
        imagePlaceholder.style.display = 'flex';
    }

    const ingredientsSection = document.getElementById('modalIngredientsSection');
    const ingredientsText = document.getElementById('modalProductIngredients');
    if (product.ingredients) {
        ingredientsText.textContent = product.ingredients;
        ingredientsSection.style.display = 'block';
    } else {
        ingredientsSection.style.display = 'none';
    }

    const usageSection = document.getElementById('modalUsageSection');
    const usageText = document.getElementById('modalProductUsage');
    if (product.usage) {
        usageText.textContent = product.usage;
        usageSection.style.display = 'block';
    } else {
        usageSection.style.display = 'none';
    }

    const addToCartBtn = document.getElementById('modalAddToCart');
    addToCartBtn.onclick = function (event) {
        event.stopPropagation();
        addToCart(product);
        closeProductModal();
        showNotification(`${product.name} agregado al carrito`);
    };

    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', function () {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    if (modalOverlay) modalOverlay.addEventListener('click', closeProductModal);
    if (modalClose) modalClose.addEventListener('click', closeProductModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
});

function getCategoryName(categoryId) {
    const category = window.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
}

function formatCLP(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.formatCLP = formatCLP;
window.getCategoryName = getCategoryName;