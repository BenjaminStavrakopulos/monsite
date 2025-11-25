// Sistema de autenticación completo para HairIA
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {

    initializeDefaultUsers();
    

    setupAuthEventListeners();
    

    checkExistingSession();
}

function initializeDefaultUsers() {
 
    const defaultUsers = [
        {
            id: 1,
            name: "Usuario Demo",
            email: "usuario@hairia.com",
            password: "password123",
            role: "client",
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: "Administrador",
            email: "admin@hairia.com",
            password: "admin123",
            role: "admin",
            permissions: ["products", "users", "orders", "discounts"],
            createdAt: new Date().toISOString()
        }
    ];

    // Solo crear usuarios por defecto si no existen
    if (!localStorage.getItem('hairia_users')) {
        localStorage.setItem('hairia_users', JSON.stringify(defaultUsers));
        console.log('👥 Usuarios por defecto creados');
    }
}

function setupAuthEventListeners() {
    // Tabs de login/registro
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Formularios
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const adminForm = document.getElementById('adminForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (adminForm) adminForm.addEventListener('submit', handleAdminLogin);

    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            togglePasswordVisibility(this.dataset.target);
        });
    });

    // Switch entre modos cliente/admin - CORREGIDO
    const switchToAdmin = document.getElementById('switchToAdminMode');
    const switchToAdminRegister = document.getElementById('switchToAdminModeRegister');
    const switchToClient = document.getElementById('switchToClientMode');

    if (switchToAdmin) {
        switchToAdmin.addEventListener('click', function(e) {
            e.preventDefault();
            switchToAuthMode('admin');
        });
    }

    if (switchToAdminRegister) {
        switchToAdminRegister.addEventListener('click', function(e) {
            e.preventDefault();
            switchToAuthMode('admin');
        });
    }

    if (switchToClient) {
        switchToClient.addEventListener('click', function(e) {
            e.preventDefault();
            switchToAuthMode('client');
        });
    }
}

function switchTab(tabName) {
    // Actualizar tabs activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Mostrar formulario activo
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.dataset.form === tabName);
    });
}

// NUEVA: Función para cambiar entre modos cliente/admin
function switchToAuthMode(mode) {
    if (mode === 'admin') {
        // Ocultar todo y mostrar solo admin
        document.querySelector('.auth-tabs').style.display = 'none';
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('adminForm').classList.add('active');
        
    } else {
        // Volver al modo normal con tabs
        document.querySelector('.auth-tabs').style.display = 'flex';
        switchTab('login');
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = document.querySelector(`[data-target="${inputId}"]`);
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '👁️‍🗨️';
    } else {
        input.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validaciones básicas
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    const btn = e.target.querySelector('.auth-btn');
    setButtonLoading(btn, true);

    try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = authenticateUser(email, password);
        
        if (user) {
            // Guardar sesión
            saveUserSession(user, rememberMe);
            showNotification(`¡Bienvenido ${user.name}!`, 'success');
            
            // REDIRECCIÓN CORREGIDA - Verificar que los archivos existen
            setTimeout(() => {
                if (user.role === 'admin') {
                    // Verificar que admin.html existe en la ruta correcta
                    window.location.href = 'admin/admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            showNotification('Email o contraseña incorrectos', 'error');
        }
    } catch (error) {
        showNotification('Error al iniciar sesión', 'error');
        console.error('Login error:', error);
    } finally {
        setButtonLoading(btn, false);
    }
}
// En js/auth.js - después de saveUserSession
function transferGuestCartToUser(userId) {
    const guestCart = JSON.parse(localStorage.getItem('hairia_guest_cart')) || [];
    
    if (guestCart.length > 0) {
        console.log('🔄 Transfiriendo carrito de invitado a usuario:', userId);
        const userCartKey = `hairia_cart_${userId}`;
        localStorage.setItem(userCartKey, JSON.stringify(guestCart));
        localStorage.removeItem('hairia_guest_cart');
    }
}

// Y modifica saveUserSession para incluir la transferencia:
function saveUserSession(user, rememberMe = false) {
    const sessionData = {
        ...user,
        password: undefined,
        loggedInAt: new Date().toISOString()
    };
    
    // TRANSFERIR CARRITO de invitado a usuario
    transferGuestCartToUser(user.id);
    
    if (rememberMe) {
        localStorage.setItem('hairia_current_user', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('hairia_current_user', JSON.stringify(sessionData));
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (!acceptTerms) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return;
    }

    const btn = e.target.querySelector('.auth-btn');
    setButtonLoading(btn, true);

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = registerUser(name, email, password);
        
        if (success) {
            showNotification('¡Cuenta creada exitosamente! Ya puedes iniciar sesión', 'success');
            
            // Limpiar formulario y cambiar a login
            e.target.reset();
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
            }, 1500);
        } else {
            showNotification('Este email ya está registrado', 'error');
        }
    } catch (error) {
        showNotification('Error al crear la cuenta', 'error');
        console.error('Register error:', error);
    } finally {
        setButtonLoading(btn, false);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    const btn = e.target.querySelector('.auth-btn');
    setButtonLoading(btn, true);

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = authenticateUser(email, password);
        
        if (user && user.role === 'admin') {
            saveUserSession(user, true);
            showNotification(`¡Bienvenido Administrador ${user.name}!`, 'success');
            
            // 🔍 AGREGAR DEBUG AQUÍ:
            console.log('🔀 Redirigiendo a admin...');
            console.log('📍 URL actual:', window.location.href);
            console.log('🎯 Ruta destino:', '/admin/admin.html');
            console.log('👤 Usuario:', user);
            
            setTimeout(() => {
                window.location.href = 'admin/admin.html';
            }, 1000);
        } else {
            showNotification('Credenciales de administrador incorrectas', 'error');
        }
    } catch (error) {
        showNotification('Error al acceder al panel', 'error');
        console.error('Admin login error:', error);
    } finally {
        setButtonLoading(btn, false);
    }
}

// Funciones de utilidad de autenticación
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('hairia_users')) || [];
    return users.find(user => user.email === email && user.password === password);
}

function registerUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('hairia_users')) || [];
    
    // Verificar si el usuario ya existe
    if (users.find(user => user.email === email)) {
        return false;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'client',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('hairia_users', JSON.stringify(users));
    return true;
}

function saveUserSession(user, rememberMe = false) {
    const sessionData = {
        ...user,
        // No guardar la contraseña en la sesión
        password: undefined,
        loggedInAt: new Date().toISOString()
    };
    
    if (rememberMe) {
        localStorage.setItem('hairia_current_user', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('hairia_current_user', JSON.stringify(sessionData));
    }
}

function checkExistingSession() {
    const user = JSON.parse(localStorage.getItem('hairia_current_user') || sessionStorage.getItem('hairia_current_user'));
    
    if (user) {
        // Si hay sesión activa, redirigir según el rol
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin/admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 500);
    }
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}