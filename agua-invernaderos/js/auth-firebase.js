import { 
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    setDoc,
    doc,
    getDoc
} from './firebase-config.js';

console.log('auth-firebase.js cargado');

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupLogoutHandler();
        this.setupAuthStateListener();

        // Debug inicial
        setTimeout(() => {
            this.debugAuthState();
        }, 1000);
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
            console.log(' Formulario de login configurado');
        }
    }

    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
            console.log(' Formulario de registro configurado');
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            console.log(' Intentando login...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.currentUser = userCredential.user;
            
            // Cargar datos adicionales del usuario desde Firestore
            await this.loadUserData(this.currentUser.uid);
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (modal) modal.hide();
            
            this.showAlert('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
            
        } catch (error) {
            console.error('Error en login:', error);
            this.handleAuthError(error);
        }
    }

    async handleRegister() {
        // Validar contraseñas
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showAlert('Las contraseñas no coinciden', 'danger');
            return;
        }

        if (password.length < 6) {
            this.showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }

        // Obtener datos del formulario
        const email = document.getElementById('regEmail').value;
        const name = document.getElementById('regName').value;
        const phone = document.getElementById('regPhone').value;

        try {
            console.log(' Creando usuario en Firebase Auth...');
            
            // Crear usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Actualizar perfil con nombre
            await updateProfile(user, {
                displayName: name
            });

            // Guardar información adicional en Firestore
            await this.saveUserToFirestore(user.uid, {
                personalInfo: {
                    name: name,
                    email: email,
                    phone: phone,
                },
                businessInfo: {
                    company: document.getElementById('regCompany').value,
                    address: document.getElementById('regAddress').value,
                    city: document.getElementById('regCity').value,
                    state: document.getElementById('regState').value,
                },
                membership: document.getElementById('selectedMembership').value,
                createdAt: new Date(),
                lastLogin: new Date(),
                status: 'active'
            });

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (modal) modal.hide();

            this.showAlert('¡Cuenta creada exitosamente! Bienvenido a HidroEye.', 'success');
            
        } catch (error) {
            console.error('Error en registro:', error);
            this.handleAuthError(error);
        }
    }

    async saveUserToFirestore(userId, userData) {
        try {
            await setDoc(doc(db, 'users', userId), userData);
            console.log(' Usuario guardado en Firestore:', userId);
        } catch (error) {
            console.error('Error guardando en Firestore:', error);
            throw error;
        }
    }

    async loadUserData(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log(' Datos de usuario cargados:', userData);
                return userData;
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
        return null;
    }

    setupAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            console.log(' Estado de autenticación cambiado:', user ? 'Usuario logueado' : 'Usuario NO logueado');
            if (user) {
                this.currentUser = user;
                const userData = await this.loadUserData(user.uid);
                this.updateUIForLoggedInUser(user, userData);
            } else {
                this.currentUser = null;
                this.updateUIForLoggedOutUser();
            }
        });
    }
//CORRECCIONES 
updateUIForLoggedInUser(user, userData = null) {
    console.log('🎨 Actualizando UI para usuario logueado:', user.displayName);
    
    // DIAGNÓSTICO MEJORADO - Buscar elementos de manera más robusta
    const loginButton = document.getElementById('loginButtonItem');
    const registerButton = document.getElementById('registerButtonItem');
    const userMenu = document.getElementById('userMenu');
    const cartLink = document.getElementById('cartLink');
    const dashboardMenuItem = document.getElementById('dashboard-menu-item'); //  NUEVA LINEA

    
    console.log('🔍 Elementos encontrados:', {
        loginButton: !!loginButton,
        registerButton: !!registerButton,
        userMenu: !!userMenu,
        cartLink: !!cartLink,
         dashboardMenuItem: !!dashboardMenuItem
    });
    
    // Ocultar botones de login/register
    if (loginButton) {
        loginButton.style.display = 'none';
        console.log(' Login button ocultado');
    }
    if (registerButton) {
        registerButton.style.display = 'none';
        console.log(' Register button ocultado');
    }
    
    //  MOSTRAR USER MENU - Con verificación adicional
    if (userMenu) {
        userMenu.style.display = 'block';
        console.log('User Menu mostrado');
        
        const userName = userMenu.querySelector('.user-name');
        if (userName) {
            userName.textContent = user.displayName || user.email.split('@')[0];
            console.log(' Nombre de usuario actualizado:', userName.textContent);
        }
        
        // CONFIGURAR LOGOUT CORRECTAMENTE
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            // Remover event listeners anteriores para evitar duplicados
            logoutButton.replaceWith(logoutButton.cloneNode(true));
            const newLogoutButton = document.getElementById('logoutButton');
            
            newLogoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🚪 Cerrando sesión...');
                await this.handleLogout();
            });
            console.log('Listener de logout configurado');
        }
    } else {
        console.log(' User Menu NO encontrado. Buscando en toda la página...');
        // Buscar en todo el documento por si está en otra estructura
        const allUserMenus = document.querySelectorAll('[id*="userMenu"], [class*="user-menu"]');
        console.log('🔍 User menus alternativos encontrados:', allUserMenus.length);
    }
    
    if (cartLink) {
        cartLink.style.display = 'block';
        console.log(' Cart Link mostrado');
    }

        if (dashboardMenuItem) { // NUEVO BLOQUE
        dashboardMenuItem.style.display = 'block';
        console.log(' Dashboard menu item mostrado');
    }

    // HABILITAR TODAS LAS CARACTERÍSTICAS
    this.enableLoggedInFeatures();
    
    // Actualizar contador del carrito
    this.updateCartCounter();
}
//HASTA AQUI LAS CORRECCIONES

    //  FUNCIONES CORREGIDAS - YA NO ESTÁN VACÍAS
    enableLoggedInFeatures() {
        console.log(' Habilitando características para usuarios logueados...');
        
        // Mostrar botones de compra
        const purchaseButtons = document.getElementById('purchaseButtons');
        const loginToPurchase = document.getElementById('loginToPurchase');
        
        if (purchaseButtons) {
            purchaseButtons.style.display = 'block';
            console.log(' Botones de compra mostrados');
        }
        if (loginToPurchase) {
            loginToPurchase.style.display = 'none';
            console.log(' Mensaje de loginToPurchase ocultado');
        }
        
        // Mostrar botones individuales de compra
        const comprarButtons = document.querySelectorAll('.btn-comprar');
        comprarButtons.forEach(button => {
            button.style.display = 'block';
        });
        console.log(` ${comprarButtons.length} botones de compra mostrados`);
        
        // Mostrar formulario de reseñas (si existe)
        const reviewFormContainer = document.getElementById('reviewFormContainer');
        if (reviewFormContainer) {
            reviewFormContainer.style.display = 'block';
            console.log(' Formulario de reseñas mostrado');
        }
        
        // Ocultar mensajes de "inicia sesión"
        this.hideLoginRequiredMessages();
    }

    disableLoggedInFeatures() {
        console.log(' Deshabilitando características para usuarios logueados...');
        
        // Ocultar botones de compra
        const purchaseButtons = document.getElementById('purchaseButtons');
        const loginToPurchase = document.getElementById('loginToPurchase');
        
        if (purchaseButtons) {
            purchaseButtons.style.display = 'none';
            console.log(' Botones de compra ocultados');
        }
        if (loginToPurchase) {
            loginToPurchase.style.display = 'block';
            console.log(' Mensaje de loginToPurchase mostrado');
        }
        
        // Ocultar botones individuales de compra
        const comprarButtons = document.querySelectorAll('.btn-comprar');
        comprarButtons.forEach(button => {
            button.style.display = 'none';
        });
        console.log(`${comprarButtons.length} botones de compra ocultados`);
        
        // Ocultar formulario de reseñas (si existe)
        const reviewFormContainer = document.getElementById('reviewFormContainer');
        if (reviewFormContainer) {
            reviewFormContainer.style.display = 'none';
            console.log(' Formulario de reseñas ocultado');
        }
    }

    hideLoginRequiredMessages() {
        // Ocultar mensajes que piden iniciar sesión
        const loginMessages = document.querySelectorAll('.login-required-message');
        loginMessages.forEach(message => {
            message.style.display = 'none';
        });
        
        // Eliminar mensajes dinámicos si existen
        const dynamicMessages = document.querySelectorAll('[id*="LoginMessage"]');
        dynamicMessages.forEach(message => {
            message.style.display = 'none';
        });
    }

    setupLogoutHandler() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                await this.handleLogout();
            });
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            this.showAlert('Has cerrado sesión correctamente', 'info');
        } catch (error) {
            console.error('Error en logout:', error);
            this.showAlert('Error al cerrar sesión', 'danger');
        }
    }

    handleAuthError(error) {
        let errorMessage = 'Error de autenticación';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                errorMessage = 'El formato del email es incorrecto';
                break;
            case 'auth/weak-password':
                errorMessage = 'La contraseña es demasiado débil';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No existe una cuenta con este email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Contraseña incorrecta';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Error de conexión. Verifica tu internet';
                break;
        }
        
        this.showAlert(errorMessage, 'danger');
    }

    addLoginRequiredMessages() {
        // Agregar mensaje en la sección de compra si no existe
        const purchaseSection = document.querySelector('.card-body .d-flex.gap-3');
        if (purchaseSection && !document.getElementById('loginRequiredMessage')) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'loginRequiredMessage';
            messageDiv.className = 'alert alert-info mt-3 login-required-message';
            messageDiv.innerHTML = `
                <i class="bi bi-info-circle me-2"></i>
                <strong>Inicia sesión para comprar:</strong> 
                <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" class="alert-link">Haz clic aquí para iniciar sesión</a> 
                o 
                <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" class="alert-link">regístrate</a>.
            `;
            purchaseSection.appendChild(messageDiv);
        }
        
        // Agregar mensaje en reseñas si no existe
        const reviewsSection = document.getElementById('resenas');
        if (reviewsSection && !document.getElementById('reviewLoginMessage')) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'reviewLoginMessage';
            messageDiv.className = 'alert alert-info login-required-message';
            messageDiv.innerHTML = `
                <i class="bi bi-info-circle me-2"></i>
                <strong>Inicia sesión para escribir reseñas:</strong> 
                <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" class="alert-link">Haz clic aquí para iniciar sesión</a>
            `;
            // Insertar antes del formulario de reseñas
            const reviewForm = document.getElementById('reviewFormContainer');
            if (reviewForm) {
                reviewForm.parentNode.insertBefore(messageDiv, reviewForm);
            }
        }
    }

    updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    debugAuthState() {
        console.log('=== DEBUG AUTH STATE ===');
        console.log('Current User:', this.currentUser);
        console.log('Auth Object:', auth);
        console.log('Auth Current User:', auth.currentUser);
        
        // Verificar elementos del DOM
        console.log('Login Button Item:', document.getElementById('loginButtonItem'));
        console.log('Register Button Item:', document.getElementById('registerButtonItem'));
        console.log('User Menu:', document.getElementById('userMenu'));
        console.log('Cart Link:', document.getElementById('cartLink'));
        console.log('Purchase Buttons:', document.getElementById('purchaseButtons'));
        console.log('Login To Purchase:', document.getElementById('loginToPurchase'));
        
        // Verificar botones de compra
        const purchaseButtons = document.querySelectorAll('.btn-comprar');
        console.log('Purchase Buttons found:', purchaseButtons.length);
        purchaseButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, btn, 'Display:', btn.style.display);
        });
        
        console.log('Review Form Container:', document.getElementById('reviewFormContainer'));
        console.log('=== END DEBUG ===');
    }

    showAlert(message, type) {
        // Crear alerta Bootstrap
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    updateUIForLoggedOutUser() {
    console.log('🎨 Actualizando UI para usuario NO logueado');

    // Mostrar botones de login/register
    const loginButton = document.getElementById('loginButtonItem');
    const registerButton = document.getElementById('registerButtonItem');
    const userMenu = document.getElementById('userMenu');
    const cartLink = document.getElementById('cartLink');
    const dashboardMenuItem = document.getElementById('dashboard-menu-item'); //  NUEVA LINEA


    if (loginButton) loginButton.style.display = 'block';
    if (registerButton) registerButton.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
    if (cartLink) cartLink.style.display = 'none';
    if (dashboardMenuItem) dashboardMenuItem.style.display = 'none'; //  NUEVA LINEA


    // Deshabilitar funciones restringidas
    this.disableLoggedInFeatures();

    // Mostrar mensajes de inicio de sesión requerido
    this.addLoginRequiredMessages();
}
}//FIN DE KA CLASE AuthMager

// Funciones globales para los pasos del formulario
window.goToStep2 = function() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    document.getElementById('registerStep1').style.display = 'none';
    document.getElementById('registerStep2').style.display = 'block';
}

window.goToStep1 = function() {
    document.getElementById('registerStep2').style.display = 'none';
    document.getElementById('registerStep1').style.display = 'block';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Función global para debug y forzar actualización
window.debugAuth = function() {
    if (window.authManager) {
        console.log(' Forzando actualización de UI...');
        window.authManager.debugAuthState();
        
        const auth = getAuth();
        if (auth.currentUser) {
            window.authManager.updateUIForLoggedInUser(auth.currentUser);
        } else {
            window.authManager.updateUIForLoggedOutUser();
        }
    } else {
        console.log(' AuthManager no encontrado');
    }
}