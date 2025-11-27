// admin-products.js - Sistema de administración de productos
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminProducts();
});

// Variables globales
window.productsData = [];
window.categories = [];
let currentImageData = '';

function initializeAdminProducts() {
    checkAdminAuth();
    
    // CARGAR DATOS DE FORMA SEGURA
    loadGlobalData();
    
    loadProductsTable();
    loadCategoriesDropdown();
    updateStats();
    setupEventListeners();
    setupDiscountCalculations();
}

// FUNCIÓN MEJORADA: Cargar datos globales
function loadGlobalData() {
    const storedProducts = localStorage.getItem('hairia_products');
    const storedCategories = localStorage.getItem('hairia_categories');
    
    window.productsData = storedProducts ? JSON.parse(storedProducts) : [];
    window.categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    console.log('📦 Datos cargados:', {
        productos: window.productsData.length,
        categorias: window.categories.length
    });
    
    // Si no hay datos, inicializar con valores por defecto
    if (window.productsData.length === 0) {
        console.log('⚠️ No hay productos, inicializando con datos de ejemplo');
        initializeSampleProducts();
    }
    
    if (window.categories.length === 0) {
        console.log('⚠️ No hay categorías, inicializando con datos de ejemplo');
        initializeSampleCategories();
    }
}

function initializeSampleProducts() {
    window.productsData = [
        {
            id: 1,
            name: "Shampoo Reparador Intenso",
            price: 19990,
            category: "shampoo",
            featured: true,
            description: "Shampoo con keratina para cabello dañado y quebradizo",
            image: "",
            stock: 50,
            sku: "SHR-001",
            active: true,
            discountType: "none",
            discountPercent: null,
            discountAmount: null,
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
            sku: "ACH-001",
            active: true,
            discountType: "none",
            discountPercent: null,
            discountAmount: null,
            createdAt: new Date().toISOString()
        }
    ];
    saveProducts();
}

function initializeSampleCategories() {
    window.categories = [
        { id: "shampoo", name: "Shampoo", color: "#1a1a1a" },
        { id: "acondicionador", name: "Acondicionador", color: "#2d2d2d" },
        { id: "tratamiento", name: "Tratamientos Capilares", color: "#404040" },
        { id: "aceite", name: "Aceites", color: "#555555" }
    ];
    saveCategories();
}

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    
    if (!user || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
}

// FUNCIÓN MEJORADA: Cargar tabla de productos
function loadProductsTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    const products = window.productsData || [];
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-products">
                    <p>No hay productos registrados</p>
                    <button class="btn-primary" onclick="showProductForm()">Crear Primer Producto</button>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-image-small">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}">` : 
                        '<div class="no-image">📷</div>'
                    }
                </div>
            </td>
            <td>
                <strong>${product.name}</strong>
                ${product.featured ? '<span class="featured-indicator">⭐</span>' : ''}
                <br>
                <small>${product.description.substring(0, 50)}...</small>
            </td>
            <td>${product.sku || 'N/A'}</td>
            <td>
                ${product.discountType !== 'none' ? 
                    `<div class="price-with-discount">
                        <span class="original-price">${formatCLP(product.price)}</span>
                        <span class="discount-badge">${getDiscountText(product)}</span>
                        <strong class="discounted-price">${formatCLP(getDiscountedPrice(product))}</strong>
                    </div>` :
                    `<strong>${formatCLP(product.price)}</strong>`
                }
            </td>
            <td>
                <span class="category-tag">${getCategoryName(product.category)}</span>
            </td>
            <td>
                <div class="stock-info">
                    <span>${product.stock}</span>
                    <span class="status-badge ${getStockStatus(product.stock, product.minStock)}">
                        ${getStockText(product.stock, product.minStock)}
                    </span>
                </div>
            </td>
            <td>
                <span class="status-badge ${product.active !== false ? 'status-active' : 'status-inactive'}">
                    ${product.active !== false ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-actions-btn" onclick="editProduct(${product.id})" title="Editar">✏️</button>
                    <button class="table-actions-btn" onclick="toggleProductStatus(${product.id})" title="${product.active !== false ? 'Desactivar' : 'Activar'}">
                        ${product.active !== false ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button class="table-actions-btn delete-btn" onclick="deleteProduct(${product.id})" title="Eliminar">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// FUNCIONES AUXILIARES PARA PRECIOS
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

function getCategoryName(categoryId) {
    const category = window.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
}

function getStockStatus(stock, minStock = 5) {
    if (stock === 0) return 'status-out-of-stock';
    if (stock <= minStock) return 'status-low-stock';
    return 'status-active';
}

function getStockText(stock, minStock = 5) {
    if (stock === 0) return 'Sin Stock';
    if (stock <= minStock) return 'Stock Bajo';
    return 'En Stock';
}

function loadCategoriesDropdown() {
    const categorySelect = document.getElementById('productCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (categorySelect) {
        categorySelect.innerHTML = `
            <option value="">Seleccionar categoría</option>
            ${window.categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
        console.log('✅ Dropdown de categorías cargado:', window.categories.length, 'categorías');
    }
    
    if (categoryFilter) {
        categoryFilter.innerHTML = `
            <option value="">Todas las categorías</option>
            ${window.categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
        
        categoryFilter.addEventListener('change', filterProductsTable);
    }
}

function setupEventListeners() {
    // Form submit
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Image upload
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput && imagePreview) {
        imagePreview.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    // Search
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProductsTable);
    }
}

// NUEVA FUNCIÓN: Configurar cálculos de descuento
function setupDiscountCalculations() {
    const inputs = [
        'productPrice', 
        'productDiscountPercent', 
        'productDiscountAmount'
    ];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calculateFinalPrice);
        }
    });
    
    const discountType = document.getElementById('discountType');
    if (discountType) {
        discountType.addEventListener('change', function() {
            toggleDiscountFields();
            calculateFinalPrice();
        });
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            preview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

function showProductForm(productId = null) {
    const modal = document.getElementById('productFormModal');
    const formTitle = document.getElementById('productFormTitle');
    const form = document.getElementById('productForm');
    
    // Resetear variables
    currentImageData = '';
    
    if (productId) {
        formTitle.textContent = 'Editar Producto';
        loadProductData(productId);
    } else {
        formTitle.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('imagePreview').innerHTML = '<span>📷 Haz clic para subir imagen</span>';
        document.getElementById('imagePreview').classList.remove('has-image');
        document.getElementById('productId').value = '';
        document.getElementById('productActive').checked = true;
        document.getElementById('discountType').value = 'none';
        toggleDiscountFields();
        calculateFinalPrice();
    }
    
    modal.classList.add('active');
}

function hideProductForm() {
    const modal = document.getElementById('productFormModal');
    modal.classList.remove('active');
}

function loadProductData(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSKU').value = product.sku || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productMinStock').value = product.minStock || 5;
    document.getElementById('productQuantity').value = product.quantity || '';
    document.getElementById('productUnit').value = product.unit || 'ml';
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productIngredients').value = product.ingredients || '';
    document.getElementById('productUsage').value = product.usage || '';
    document.getElementById('productFeatured').checked = product.featured || false;
    document.getElementById('productActive').checked = product.active !== false;
    document.getElementById('productTrackStock').checked = product.trackStock !== false;
    
    // Cargar datos de descuento
    document.getElementById('discountType').value = product.discountType || 'none';
    if (product.discountPercent) {
        document.getElementById('productDiscountPercent').value = product.discountPercent;
    }
    if (product.discountAmount) {
        document.getElementById('productDiscountAmount').value = product.discountAmount;
    }
    
    // Imagen
    const preview = document.getElementById('imagePreview');
    if (product.image) {
        preview.innerHTML = `<img src="${product.image}" alt="Preview">`;
        preview.classList.add('has-image');
        currentImageData = product.image;
    }
    
    toggleDiscountFields();
    calculateFinalPrice();
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const discountType = document.getElementById('discountType').value;
    
    // Calcular precios correctamente
    const basePrice = parseInt(document.getElementById('productPrice').value) || 0;
    let discountPercent = null;
    let discountAmount = null;

    if (discountType === 'percentage') {
        discountPercent = parseInt(document.getElementById('productDiscountPercent').value) || 0;
    } else if (discountType === 'amount') {
        discountAmount = parseInt(document.getElementById('productDiscountAmount').value) || 0;
    }

    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value,
        price: basePrice,
        discountType: discountType,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        minStock: parseInt(document.getElementById('productMinStock').value) || 5,
        quantity: document.getElementById('productQuantity').value ? 
                  parseFloat(document.getElementById('productQuantity').value) : null,
        unit: document.getElementById('productUnit').value,
        description: document.getElementById('productDescription').value,
        ingredients: document.getElementById('productIngredients').value,
        usage: document.getElementById('productUsage').value,
        featured: document.getElementById('productFeatured').checked,
        active: document.getElementById('productActive').checked,
        trackStock: document.getElementById('productTrackStock').checked,
        image: currentImageData || '',
        updatedAt: new Date().toISOString()
    };
    
    if (productId) {
        updateProduct(parseInt(productId), productData);
    } else {
        createProduct(productData);
    }
}

function createProduct(productData) {
    const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
    };
    
    window.productsData.push(newProduct);
    saveProducts();
    loadProductsTable();
    updateStats();
    hideProductForm();
    showNotification('✅ Producto creado exitosamente');
}

function updateProduct(productId, productData) {
    const index = window.productsData.findIndex(p => p.id === productId);
    if (index !== -1) {
        window.productsData[index] = {
            ...window.productsData[index],
            ...productData
        };
        saveProducts();
        loadProductsTable();
        updateStats();
        hideProductForm();
        showNotification('✅ Producto actualizado exitosamente');
    }
}

function editProduct(productId) {
    showProductForm(productId);
}

function toggleProductStatus(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (product) {
        product.active = !product.active;
        saveProducts();
        loadProductsTable();
        updateStats();
        showNotification(`✅ Producto ${product.active ? 'activado' : 'desactivado'}`);
    }
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
        window.productsData = window.productsData.filter(p => p.id !== productId);
        saveProducts();
        loadProductsTable();
        updateStats();
        showNotification('✅ Producto eliminado exitosamente');
    }
}

function filterProductsTable() {
    const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    const filteredProducts = window.productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.sku?.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    const tableBody = document.getElementById('productsTableBody');
    if (tableBody) {
        if (filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-results">
                        No se encontraron productos que coincidan con los filtros
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredProducts.map(product => `
                <tr>
                    <td>
                        <div class="product-image-small">
                            ${product.image ? 
                                `<img src="${product.image}" alt="${product.name}">` : 
                                '<div class="no-image">📷</div>'
                            }
                        </div>
                    </td>
                    <td>
                        <strong>${product.name}</strong>
                        ${product.featured ? '<span class="featured-indicator">⭐</span>' : ''}
                        <br>
                        <small>${product.description.substring(0, 50)}...</small>
                    </td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>
                        ${product.discountType !== 'none' ? 
                            `<div class="price-with-discount">
                                <span class="original-price">${formatCLP(product.price)}</span>
                                <span class="discount-badge">${getDiscountText(product)}</span>
                                <strong class="discounted-price">${formatCLP(getDiscountedPrice(product))}</strong>
                            </div>` :
                            `<strong>${formatCLP(product.price)}</strong>`
                        }
                    </td>
                    <td>
                        <span class="category-tag">${getCategoryName(product.category)}</span>
                    </td>
                    <td>
                        <div class="stock-info">
                            <span>${product.stock}</span>
                            <span class="status-badge ${getStockStatus(product.stock, product.minStock)}">
                                ${getStockText(product.stock, product.minStock)}
                            </span>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${product.active !== false ? 'status-active' : 'status-inactive'}">
                            ${product.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="table-actions-btn" onclick="editProduct(${product.id})" title="Editar">✏️</button>
                            <button class="table-actions-btn" onclick="toggleProductStatus(${product.id})" title="${product.active !== false ? 'Desactivar' : 'Activar'}">
                                ${product.active !== false ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button class="table-actions-btn delete-btn" onclick="deleteProduct(${product.id})" title="Eliminar">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function updateStats() {
    const products = window.productsData || [];
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('featuredProducts').textContent = products.filter(p => p.featured).length;
    document.getElementById('lowStockProducts').textContent = products.filter(p => p.stock <= (p.minStock || 5)).length;
    document.getElementById('discountProducts').textContent = products.filter(p => p.discountType !== 'none').length;
}

function saveProducts() {
    localStorage.setItem('hairia_products', JSON.stringify(window.productsData));
    console.log('💾 Productos guardados:', window.productsData.length);
}

function saveCategories() {
    localStorage.setItem('hairia_categories', JSON.stringify(window.categories));
    console.log('💾 Categorías guardadas:', window.categories.length);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-black);
        color: var(--primary-white);
        padding: 1rem 1.5rem;
        border-radius: 6px;
        z-index: 3000;
        box-shadow: var(--shadow);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// FUNCIONES DE DESCUENTO
function toggleDiscountFields() {
    const discountType = document.getElementById('discountType').value;
    const discountFields = document.getElementById('discountFields');
    const percentageField = document.getElementById('percentageField');
    const amountField = document.getElementById('amountField');
    
    if (discountType === 'none') {
        discountFields.style.display = 'none';
        // Limpiar campos de descuento
        document.getElementById('productDiscountPercent').value = '';
        document.getElementById('productDiscountAmount').value = '';
    } else {
        discountFields.style.display = 'flex';
        if (discountType === 'percentage') {
            percentageField.style.display = 'block';
            amountField.style.display = 'none';
            document.getElementById('productDiscountAmount').value = '';
        } else {
            percentageField.style.display = 'none'; 
            amountField.style.display = 'block';
            document.getElementById('productDiscountPercent').value = '';
        }
    }
    calculateFinalPrice();
}

function calculateFinalPrice() {
    const priceInput = document.getElementById('productPrice');
    const discountType = document.getElementById('discountType').value;
    const discountPercentInput = document.getElementById('productDiscountPercent');
    const discountAmountInput = document.getElementById('productDiscountAmount');
    const finalPriceInput = document.getElementById('finalPrice');
    
    if (!priceInput || !finalPriceInput) return;
    
    const price = parseInt(priceInput.value) || 0;
    const discountPercent = parseInt(discountPercentInput?.value) || 0;
    const discountAmount = parseInt(discountAmountInput?.value) || 0;
    
    let finalPrice = price;
    
    if (discountType === 'percentage' && discountPercent > 0) {
        finalPrice = Math.max(0, price - (price * discountPercent / 100));
    } else if (discountType === 'amount' && discountAmount > 0) {
        finalPrice = Math.max(0, price - discountAmount);
    }
    
    finalPriceInput.value = formatCLP(finalPrice);
}

function formatCLP(amount) {
    if (!amount && amount !== 0) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Hacer funciones globales
window.showProductForm = showProductForm;
window.hideProductForm = hideProductForm;
window.editProduct = editProduct;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.toggleDiscountFields = toggleDiscountFields;
window.logoutUser = function() {
    localStorage.removeItem('hairia_current_user');
    sessionStorage.removeItem('hairia_current_user');
    window.location.href = '../index.html';
};
// ========== MEJORAS DE MODAL ==========

function setupModalClose() {
    const modal = document.getElementById('productFormModal');
    const modalContent = document.querySelector('.modal-content');
    
    if (modal && modalContent) {
        // Cerrar al hacer click fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideProductForm();
            }
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                hideProductForm();
            }
        });
        
        console.log('✅ Modal close events configured');
    }
}

// Actualizar la función showProductForm para prevenir cierre al hacer click dentro
function showProductForm(productId = null) {
    const modal = document.getElementById('productFormModal');
    const formTitle = document.getElementById('productFormTitle');
    const form = document.getElementById('productForm');
    
    // Resetear variables
    currentImageData = '';
    
    if (productId) {
        formTitle.textContent = 'Editar Producto';
        loadProductData(productId);
    } else {
        formTitle.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('imagePreview').innerHTML = '<span>📷 Haz clic para subir imagen</span>';
        document.getElementById('imagePreview').classList.remove('has-image');
        document.getElementById('productId').value = '';
        document.getElementById('productActive').checked = true;
        document.getElementById('discountType').value = 'none';
        toggleDiscountFields();
        calculateFinalPrice();
    }
    
    modal.classList.add('active');
    
    // Prevenir que el click dentro del modal lo cierre
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Actualizar la función initializeAdminProducts para incluir el modal close
function initializeAdminProducts() {
    checkAdminAuth();
    loadGlobalData();
    loadProductsTable();
    loadCategoriesDropdown();
    updateStats();
    setupEventListeners();
    setupDiscountCalculations();
    setupModalClose(); // ← Agregar esta línea
}
// ========== SISTEMA DE MARCAS EN PRODUCTOS ==========

function loadBrandsDropdown() {
    const brandSelect = document.getElementById('productBrand');
    if (!brandSelect) return;
    
    const brands = JSON.parse(localStorage.getItem('hairia_brands')) || [];
    
    brandSelect.innerHTML = `
        <option value="">Sin marca</option>
        ${brands.filter(brand => brand.active !== false).map(brand => `
            <option value="${brand.id}">${brand.name}</option>
        `).join('')}
    `;
    
    console.log('🏷️ Dropdown de marcas cargado:', brands.length, 'marcas');
}

// Actualizar la función initializeAdminProducts
function initializeAdminProducts() {
    checkAdminAuth();
    loadGlobalData();
    loadProductsTable();
    loadCategoriesDropdown();
    loadBrandsDropdown(); // ← Agregar esta línea
    updateStats();
    setupEventListeners();
    setupDiscountCalculations();
    setupModalClose();
}

// Actualizar la función loadProductData para cargar la marca
function loadProductData(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;
    
    // ... código existente ...
    
    // Cargar marca
    document.getElementById('productBrand').value = product.brand || '';
    
    // ... resto del código ...
}

// Actualizar la función handleProductSubmit para incluir la marca
function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const discountType = document.getElementById('discountType').value;
    
    // ... código de precios existente ...
    
    const productData = {
        // ... campos existentes ...
        brand: document.getElementById('productBrand').value || null,
        // ... resto de campos ...
    };
    
    // ... resto del código ...
}