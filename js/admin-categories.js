// admin-categories.js - Gestión de categorías
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminCategories();
});

function initializeAdminCategories() {
    checkAdminAuth();
    loadCategoriesList();
    setupCategoryForm();
}

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    
    if (!user || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
}

function loadCategoriesList() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    
    if (categories.length === 0) {
        categoriesList.innerHTML = `
            <div class="empty-state">
                <p>No hay categorías creadas</p>
                <button class="btn-primary" onclick="showCategoryForm()">Crear Primera Categoría</button>
            </div>
        `;
        return;
    }

    categoriesList.innerHTML = categories.map(category => {
        const categoryProducts = products.filter(p => p.category === category.id);
        
        return `
            <div class="category-card-admin">
                <div class="category-header">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <h3>${category.name}</h3>
                    <span class="product-count">${categoryProducts.length} productos</span>
                </div>
                <div class="category-body">
                    <p>${category.description || 'Sin descripción'}</p>
                    <div class="category-actions">
                        <button class="btn-secondary" onclick="editCategory('${category.id}')">Editar</button>
                        <button class="btn-danger" onclick="deleteCategory('${category.id}')" ${categoryProducts.length > 0 ? 'disabled' : ''}>Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupCategoryForm() {
    const form = document.getElementById('categoryForm');
    if (form) {
        form.addEventListener('submit', handleCategorySubmit);
    }
}

function showCategoryForm(categoryId = null) {
    const modal = document.getElementById('categoryFormModal');
    const formTitle = document.getElementById('categoryFormTitle');
    const form = document.getElementById('categoryForm');
    
    if (categoryId) {
        formTitle.textContent = 'Editar Categoría';
        loadCategoryData(categoryId);
    } else {
        formTitle.textContent = 'Nueva Categoría';
        form.reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryColor').value = '#1a1a1a';
    }
    
    modal.classList.add('active');
}

function hideCategoryForm() {
    const modal = document.getElementById('categoryFormModal');
    modal.classList.remove('active');
}

function loadCategoryData(categoryId) {
    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) return;
    
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIdInput').value = category.id;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryDescription').value = category.description || '';
}

function handleCategorySubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        id: document.getElementById('categoryIdInput').value.toLowerCase().replace(/\s+/g, '-'),
        name: document.getElementById('categoryName').value,
        color: document.getElementById('categoryColor').value,
        description: document.getElementById('categoryDescription').value
    };
    
    if (categoryId) {
        updateCategory(categoryId, categoryData);
    } else {
        createCategory(categoryData);
    }
}

function createCategory(categoryData) {
    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    
    // Verificar si ya existe una categoría con ese ID
    if (categories.find(c => c.id === categoryData.id)) {
        alert('Ya existe una categoría con ese ID. Por favor usa un ID único.');
        return;
    }
    
    categories.push(categoryData);
    localStorage.setItem('hairia_categories', JSON.stringify(categories));
    loadCategoriesList();
    hideCategoryForm();
    showNotification('✅ Categoría creada exitosamente');
}

function updateCategory(oldId, categoryData) {
    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    const index = categories.findIndex(c => c.id === oldId);
    
    if (index !== -1) {
        // Si cambió el ID, actualizar también los productos
        if (oldId !== categoryData.id) {
            updateProductsCategory(oldId, categoryData.id);
        }
        
        categories[index] = categoryData;
        localStorage.setItem('hairia_categories', JSON.stringify(categories));
        loadCategoriesList();
        hideCategoryForm();
        showNotification('✅ Categoría actualizada exitosamente');
    }
}

function updateProductsCategory(oldCategoryId, newCategoryId) {
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    
    products.forEach(product => {
        if (product.category === oldCategoryId) {
            product.category = newCategoryId;
        }
    });
    
    localStorage.setItem('hairia_products', JSON.stringify(products));
}

function editCategory(categoryId) {
    showCategoryForm(categoryId);
}

function deleteCategory(categoryId) {
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    const productsInCategory = products.filter(p => p.category === categoryId);
    
    if (productsInCategory.length > 0) {
        alert(`No puedes eliminar esta categoría porque tiene ${productsInCategory.length} productos asociados. Primero mueve o elimina esos productos.`);
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
        const updatedCategories = categories.filter(c => c.id !== categoryId);
        
        localStorage.setItem('hairia_categories', JSON.stringify(updatedCategories));
        loadCategoriesList();
        showNotification('✅ Categoría eliminada exitosamente');
    }
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
window.showCategoryForm = showCategoryForm;
window.hideCategoryForm = hideCategoryForm;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.logoutUser = function() {
    localStorage.removeItem('hairia_current_user');
    sessionStorage.removeItem('hairia_current_user');
    window.location.href = '../index.html';
};