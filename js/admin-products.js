// admin-products.js - Sistema de administración de productos
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminProducts();
});

function initializeAdminProducts() {
    checkAdminAuth();
    loadProductsTable();
    loadCategoriesDropdown();
    updateStats();
    setupEventListeners();
}

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    
    if (!user || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
}

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
                <strong>$${product.price.toFixed(2)}</strong>
                ${product.discountPrice ? `<br><small class="discount-text">$${product.discountPrice.toFixed(2)}</small>` : ''}
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

function handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

function showProductForm(productId = null) {
    const modal = document.getElementById('productFormModal');
    const formTitle = document.getElementById('productFormTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        // Modo edición
        formTitle.textContent = 'Editar Producto';
        loadProductData(productId);
    } else {
        // Modo nuevo
        formTitle.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('imagePreview').innerHTML = '<span>📷 Haz clic para subir imagen</span>';
        document.getElementById('imagePreview').classList.remove('has-image');
        document.getElementById('productId').value = '';
        document.getElementById('productActive').checked = true;
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
    document.getElementById('productDiscountPrice').value = product.discountPrice || '';
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
    
    // Imagen
    const preview = document.getElementById('imagePreview');
    if (product.image) {
        preview.innerHTML = `<img src="${product.image}" alt="Preview">`;
        preview.classList.add('has-image');
    }
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value,
        price: parseFloat(document.getElementById('productPrice').value),
        discountPrice: document.getElementById('productDiscountPrice').value ? 
                      parseFloat(document.getElementById('productDiscountPrice').value) : null,
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
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
        image: document.querySelector('#imagePreview img')?.src || '',
        updatedAt: new Date().toISOString()
    };
    
    if (productId) {
        // Actualizar producto existente
        updateProduct(parseInt(productId), productData);
    } else {
        // Crear nuevo producto
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
                        <strong>$${product.price.toFixed(2)}</strong>
                        ${product.discountPrice ? `<br><small class="discount-text">$${product.discountPrice.toFixed(2)}</small>` : ''}
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
    document.getElementById('discountProducts').textContent = products.filter(p => p.discountPrice).length;
}

function saveProducts() {
    localStorage.setItem('hairia_products', JSON.stringify(window.productsData));
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

// Hacer funciones globales
window.showProductForm = showProductForm;
window.hideProductForm = hideProductForm;
window.editProduct = editProduct;
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;
window.logoutUser = function() {
    localStorage.removeItem('hairia_current_user');
    sessionStorage.removeItem('hairia_current_user');
    window.location.href = '../index.html';
};