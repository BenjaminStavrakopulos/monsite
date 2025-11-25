// products.js - Sistema de búsqueda y filtros para products.html
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    loadCategoriesFilters();
    loadAllProducts();
    setupSearch();
    checkUrlParams();
}

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    const category = urlParams.get('category');
    
    if (searchTerm) {
        document.getElementById('searchInput').value = searchTerm;
        performSearch(searchTerm);
    }
    
    if (category) {
        // Activar el filtro de categoría
        setTimeout(() => {
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                categoryBtn.click();
            }
        }, 100);
    }
}

function loadCategoriesFilters() {
    const filtersContainer = document.getElementById('categoryFilters');
    if (!filtersContainer) return;

    filtersContainer.innerHTML = `
        <button class="filter-btn active" data-category="all">Todos</button>
        ${window.categories.map(category => `
            <button class="filter-btn" data-category="${category.id}">${category.name}</button>
        `).join('')}
    `;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterProductsByCategory(category);
        });
    });
}

function filterProductsByCategory(category) {
    const productsGrid = document.getElementById('productsGrid');
    const productsTitle = document.getElementById('productsTitle');
    
    if (!productsGrid) return;

    let filteredProducts = window.productsData;
    
    if (category !== 'all') {
        filteredProducts = window.productsData.filter(product => product.category === category);
        const categoryName = window.categories.find(cat => cat.id === category)?.name || category;
        productsTitle.textContent = categoryName;
    } else {
        productsTitle.textContent = 'Todos los Productos';
    }

    renderProducts(filteredProducts, productsGrid);
}

function loadAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        renderProducts(window.productsData, productsGrid);
    }
}

function renderProducts(products, container) {
    const emojis = {
        'shampoo': '🧴',
        'acondicionador': '💧', 
        'tratamiento': '🎭',
        'aceite': '💧'
    };

    if (products.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
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

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput || !searchButton) return;

    function performSearch(searchTerm = null) {
        const term = searchTerm || searchInput.value.toLowerCase().trim();
        
        if (term === '') {
            loadAllProducts();
            return;
        }

        const filteredProducts = window.productsData.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            (window.categories.find(cat => cat.id === product.category)?.name.toLowerCase().includes(term))
        );

        const productsGrid = document.getElementById('productsGrid');
        const productsTitle = document.getElementById('productsTitle');
        
        if (productsGrid) {
            if (filteredProducts.length > 0) {
                productsTitle.textContent = `Resultados para: "${term}" (${filteredProducts.length})`;
                renderProducts(filteredProducts, productsGrid);
            } else {
                productsTitle.textContent = `No se encontraron resultados para: "${term}"`;
                productsGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>';
            }
        }
    }

    searchButton.addEventListener('click', () => performSearch());
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Hacer la función global para checkUrlParams
    window.performSearch = performSearch;
}