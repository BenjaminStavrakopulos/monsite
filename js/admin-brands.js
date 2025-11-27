// admin-brands.js - Gestión de marcas
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminBrands();
});

// Variables globales
window.brandsData = [];
let currentLogoData = '';

function initializeAdminBrands() {
    checkAdminAuth();
    loadGlobalBrandsData();
    loadBrandsList();
    updateBrandsStats();
    setupBrandsEventListeners();
    setupModalClose();
}

function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user') || 'null');
    
    if (!user || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
}

function loadGlobalBrandsData() {
    const storedBrands = localStorage.getItem('hairia_brands');
    window.brandsData = storedBrands ? JSON.parse(storedBrands) : [];
    
    console.log('🏷️ Marcas cargadas:', window.brandsData.length);
    
    // Si no hay marcas, inicializar con algunas por defecto
    if (window.brandsData.length === 0) {
        initializeSampleBrands();
    }
}

function initializeSampleBrands() {
    window.brandsData = [
        {
            id: 'olaplex',
            name: 'Olaplex',
            description: 'Tratamientos profesionales para reparación capilar',
            logo: '',
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'kerastase', 
            name: 'Kérastase',
            description: 'Línea de lujo para el cuidado del cabello',
            logo: '',
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'tigi',
            name: 'Tigi',
            description: 'Productos profesionales para peluquería',
            logo: '',
            active: true,
            createdAt: new Date().toISOString()
        }
    ];
    saveBrands();
}

function loadBrandsList() {
    const brandsList = document.getElementById('brandsList');
    if (!brandsList) return;

    const brands = window.brandsData || [];
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    
    if (brands.length === 0) {
        brandsList.innerHTML = `
            <div class="empty-state">
                <p>No hay marcas creadas</p>
                <button class="btn-primary" onclick="showBrandForm()">Crear Primera Marca</button>
            </div>
        `;
        return;
    }

    brandsList.innerHTML = brands.map(brand => {
        const brandProducts = products.filter(p => p.brand === brand.id);
        
        return `
            <div class="category-card-admin">
                <div class="category-header">
                    <div class="category-color" style="background-color: #6366f1"></div>
                    <h3>${brand.name}</h3>
                    <span class="product-count">${brandProducts.length} productos</span>
                </div>
                <div class="category-body">
                    <p>${brand.description || 'Sin descripción'}</p>
                    <div class="brand-logo-preview">
                        ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-logo-small">` : ''}
                    </div>
                    <div class="category-actions">
                        <button class="btn-secondary" onclick="editBrand('${brand.id}')">Editar</button>
                        <button class="btn-danger" onclick="deleteBrand('${brand.id}')" ${brandProducts.length > 0 ? 'disabled' : ''}>Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupBrandsEventListeners() {
    const brandForm = document.getElementById('brandForm');
    if (brandForm) {
        brandForm.addEventListener('submit', handleBrandSubmit);
    }
    
    const logoInput = document.getElementById('brandLogo');
    const logoPreview = document.getElementById('logoPreview');
    
    if (logoInput && logoPreview) {
        logoPreview.addEventListener('click', () => logoInput.click());
        logoInput.addEventListener('change', handleLogoUpload);
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentLogoData = e.target.result;
            preview.innerHTML = `<img src="${currentLogoData}" alt="Preview">`;
            preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

function showBrandForm(brandId = null) {
    const modal = document.getElementById('brandFormModal');
    const formTitle = document.getElementById('brandFormTitle');
    const form = document.getElementById('brandForm');
    
    currentLogoData = '';
    
    if (brandId) {
        formTitle.textContent = 'Editar Marca';
        loadBrandData(brandId);
    } else {
        formTitle.textContent = 'Nueva Marca';
        form.reset();
        document.getElementById('logoPreview').innerHTML = '<span>🖼️ Haz clic para subir logo</span>';
        document.getElementById('logoPreview').classList.remove('has-image');
        document.getElementById('brandId').value = '';
        document.getElementById('brandActive').checked = true;
    }
    
    modal.classList.add('active');
}

function hideBrandForm() {
    const modal = document.getElementById('brandFormModal');
    modal.classList.remove('active');
}

function loadBrandData(brandId) {
    const brand = window.brandsData.find(b => b.id === brandId);
    if (!brand) return;
    
    document.getElementById('brandId').value = brand.id;
    document.getElementById('brandName').value = brand.name;
    document.getElementById('brandIdInput').value = brand.id;
    document.getElementById('brandDescription').value = brand.description || '';
    document.getElementById('brandActive').checked = brand.active !== false;
    
    const preview = document.getElementById('logoPreview');
    if (brand.logo) {
        preview.innerHTML = `<img src="${brand.logo}" alt="Preview">`;
        preview.classList.add('has-image');
        currentLogoData = brand.logo;
    }
}

function handleBrandSubmit(event) {
    event.preventDefault();
    
    const brandId = document.getElementById('brandId').value;
    const brandData = {
        id: document.getElementById('brandIdInput').value.toLowerCase().replace(/\s+/g, '-'),
        name: document.getElementById('brandName').value,
        description: document.getElementById('brandDescription').value,
        logo: currentLogoData || '',
        active: document.getElementById('brandActive').checked,
        updatedAt: new Date().toISOString()
    };
    
    if (brandId) {
        updateBrand(brandId, brandData);
    } else {
        createBrand(brandData);
    }
}

function createBrand(brandData) {
    const brands = window.brandsData || [];
    
    // Verificar si ya existe una marca con ese ID
    if (brands.find(b => b.id === brandData.id)) {
        alert('Ya existe una marca con ese ID. Por favor usa un ID único.');
        return;
    }
    
    const newBrand = {
        ...brandData,
        createdAt: new Date().toISOString()
    };
    
    brands.push(newBrand);
    window.brandsData = brands;
    saveBrands();
    loadBrandsList();
    updateBrandsStats();
    hideBrandForm();
    showNotification('✅ Marca creada exitosamente');
}

function updateBrand(oldId, brandData) {
    const brands = window.brandsData || [];
    const index = brands.findIndex(b => b.id === oldId);
    
    if (index !== -1) {
        // Si cambió el ID, actualizar también los productos
        if (oldId !== brandData.id) {
            updateProductsBrand(oldId, brandData.id);
        }
        
        brands[index] = {
            ...brands[index],
            ...brandData
        };
        
        window.brandsData = brands;
        saveBrands();
        loadBrandsList();
        updateBrandsStats();
        hideBrandForm();
        showNotification('✅ Marca actualizada exitosamente');
    }
}

function updateProductsBrand(oldBrandId, newBrandId) {
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    
    products.forEach(product => {
        if (product.brand === oldBrandId) {
            product.brand = newBrandId;
        }
    });
    
    localStorage.setItem('hairia_products', JSON.stringify(products));
}

function editBrand(brandId) {
    showBrandForm(brandId);
}

function deleteBrand(brandId) {
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    const productsWithBrand = products.filter(p => p.brand === brandId);
    
    if (productsWithBrand.length > 0) {
        alert(`No puedes eliminar esta marca porque tiene ${productsWithBrand.length} productos asociados. Primero actualiza esos productos.`);
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
        window.brandsData = window.brandsData.filter(b => b.id !== brandId);
        saveBrands();
        loadBrandsList();
        updateBrandsStats();
        showNotification('✅ Marca eliminada exitosamente');
    }
}

function updateBrandsStats() {
    const brands = window.brandsData || [];
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    
    document.getElementById('totalBrands').textContent = brands.length;
    document.getElementById('brandsWithProducts').textContent = 
        brands.filter(brand => products.some(p => p.brand === brand.id)).length;
}

function saveBrands() {
    localStorage.setItem('hairia_brands', JSON.stringify(window.brandsData));
    console.log('💾 Marcas guardadas:', window.brandsData.length);
}

function setupModalClose() {
    const modal = document.getElementById('brandFormModal');
    const modalContent = document.querySelector('.modal-content');
    
    if (modal && modalContent) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideBrandForm();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                hideBrandForm();
            }
        });
        
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--admin-success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 3000;
        box-shadow: var(--admin-shadow-lg);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hacer funciones globales
window.showBrandForm = showBrandForm;
window.hideBrandForm = hideBrandForm;
window.editBrand = editBrand;
window.deleteBrand = deleteBrand;
window.logoutUser = function() {
    localStorage.removeItem('hairia_current_user');
    sessionStorage.removeItem('hairia_current_user');
    window.location.href = '../index.html';
};
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    
    // Aplicar tema guardado al cargar
    applyTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = current === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
        
        console.log('✅ Theme toggle configurado en marcas');
    } else {
        console.error('❌ No se encontró el botón themeToggle en marcas');
    }
}

function applyTheme(theme) {
    // Aplicar atributo data-theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Guardar preferencia
    localStorage.setItem('admin-theme', theme);
    
    // Actualizar texto del botón
    updateThemeButton(theme);
    
    console.log('🎨 Tema aplicado en marcas:', theme);
}

function updateThemeButton(theme) {
    const themeText = document.querySelector('.theme-text');
    if (themeText) {
        themeText.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
}

// Actualizar la función initializeAdminBrands para incluir el theme toggle
function initializeAdminBrands() {
    checkAdminAuth();
    loadGlobalBrandsData();
    loadBrandsList();
    updateBrandsStats();
    setupBrandsEventListeners();
    setupModalClose();
    initThemeToggle(); // ← Agregar esta línea
}