// theme-toggle.js - Sistema de toggle dark/light mode CORREGIDO
class ThemeToggle {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('admin-theme') || 'light';
        this.init();
    }

    init() {
        console.log('🎨 Inicializando toggle de tema...');
        
        // Aplicar tema guardado
        this.applyTheme(this.currentTheme);
        
        // Configurar evento del botón
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('✅ Toggle de tema configurado');
        } else {
            console.error('❌ No se encontró el botón themeToggle');
        }
    }

    applyTheme(theme) {
        console.log('🎨 Aplicando tema:', theme);
        
        // Aplicar el atributo data-theme al documento
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Guardar en localStorage
        localStorage.setItem('admin-theme', theme);
        
        // Actualizar el botón
        this.updateButton();
        
        console.log('✅ Tema aplicado correctamente');
    }

    toggleTheme() {
        console.log('🔄 Cambiando tema...');
        
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('Nuevo tema:', newTheme);
        
        this.applyTheme(newTheme);
        
        // Efecto visual de feedback
        this.showThemeChangeEffect(newTheme);
    }

    updateButton() {
        if (!this.themeToggle) return;
        
        const themeText = this.themeToggle.querySelector('.theme-text');
        
        // El CSS ya maneja el cambio de texto con ::before
        // Aquí solo nos aseguramos de que esté sincronizado
        if (themeText) {
            themeText.setAttribute('data-theme', this.currentTheme);
        }
        
        console.log('✅ Botón actualizado para tema:', this.currentTheme);
    }

    showThemeChangeEffect(theme) {
        // Efecto visual en el botón
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 150);

        // Mostrar notificación
        this.showNotification(theme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
    }

    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--admin-accent);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: var(--admin-shadow-lg);
            animation: themeNotificationSlideUp 0.3s ease;
        `;

        // Agregar estilos de animación
        if (!document.getElementById('theme-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'theme-notification-styles';
            style.textContent = `
                @keyframes themeNotificationSlideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                @keyframes themeNotificationSlideDown {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remover después de 2 segundos
        setTimeout(() => {
            notification.style.animation = 'themeNotificationSlideDown 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
}

// DEBUG: Verificar que el script se carga
console.log('📁 theme-toggle.js cargado');

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM listo, inicializando ThemeToggle...');
    new ThemeToggle();
});

// Hacer disponible globalmente para debugging
window.ThemeToggle = ThemeToggle;