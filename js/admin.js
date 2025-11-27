document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    initThemeToggle();
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
    
    const welcomeElement = document.querySelector('.admin-welcome h1');
    if (welcomeElement) {
        welcomeElement.textContent = `Panel de Administración - ${user.name}`;
    }
}

function loadDashboardStats() {
    const products = JSON.parse(localStorage.getItem('hairia_products')) || [];
    const categories = JSON.parse(localStorage.getItem('hairia_categories')) || [];
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('featuredProducts').textContent = products.filter(p => p.featured).length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('lowStockProducts').textContent = products.filter(p => p.stock <= (p.minStock || 5)).length;
}

function setupDashboard() {
    // Configuraciones adicionales del dashboard
}

// ========== THEME TOGGLE SYSTEM ==========
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
    }
}

function applyTheme(theme) {
    // Aplicar atributo data-theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Guardar preferencia
    localStorage.setItem('admin-theme', theme);
    
    // Actualizar texto del botón
    updateThemeButton(theme);
}

function updateThemeButton(theme) {
    const themeText = document.querySelector('.theme-text');
    if (themeText) {
        themeText.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    }
}

// Función global para logout
window.logoutUser = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('hairia_current_user');
        sessionStorage.removeItem('hairia_current_user');
        window.location.href = '../index.html';
    }
};

// Funciones de exportación/importación (opcionales)
window.exportData = function() {
    const data = {
        products: JSON.parse(localStorage.getItem('hairia_products') || '[]'),
        categories: JSON.parse(localStorage.getItem('hairia_categories') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monsite-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.importData = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('¿Estás seguro de que quieres importar estos datos? Esto sobrescribirá los datos actuales.')) {
                    if (data.products) {
                        localStorage.setItem('hairia_products', JSON.stringify(data.products));
                    }
                    if (data.categories) {
                        localStorage.setItem('hairia_categories', JSON.stringify(data.categories));
                    }
                    
                    setTimeout(() => location.reload(), 1000);
                }
            } catch (error) {
                alert('Error al importar datos: Archivo inválido');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
};