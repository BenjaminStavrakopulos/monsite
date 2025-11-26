// Menu Hamburguesa Mejorado
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');

function toggleMenu() {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    
    // Prevenir scroll cuando el menú está abierto
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
}

function closeMenu() {
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (menuToggle && mobileNav && mobileOverlay && mobileClose) {
    menuToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', closeMenu);
    mobileClose.addEventListener('click', closeMenu);

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.mobile-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cerrar menú con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });
    
    console.log('✅ Menú hamburguesa mejorado configurado');
} else {
    console.log('❌ Elementos del menú hamburguesa no encontrados');
}