import { auth } from './firebase-config.js';
// Product Configuration
const PRODUCT_BASE_PRICE = 9000
const MAINTENANCE_PRICE = 5000
const APP_PRICE =  1000
const WARRANTY_PRICE = 3000
const IVA_RATE = 0.19
const currentStock = 10

// Bootstrap declaration
const bootstrap = window.bootstrap

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  calculateTotal()
  updateCartCounter()
  loadSavedRating() // Cargar rating guardado al iniciar
})

function initializeApp() {
  console.log("AquaMonitor initialized")
  
  // Inicializar EmailJS después de que se cargue el SDK
  if (typeof emailjs !== 'undefined') {
    emailjs.init("klruJ7X4iFVWopL-l")
    console.log("EmailJS inicializado")
  } else {
    console.error("EmailJS no está disponible")
  }
}

function setupEventListeners() {
  // Contact Form
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit)
  }

  // LOS FORMULARIOS DE LOGIN/REGISTER LOS MANEJA auth-firebase.js
  // NO agregar event listeners aquí para login/register

  // Review Form (manejado por reviews-firebase.js)
  // NO agregar event listener aquí para reviews

  // Rating stars - MANTENER ESTA PARTE QUE FUNCIONABA
  const ratingStars = document.querySelectorAll(".rating-star")
  ratingStars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = this.getAttribute("data-rating")
      setRating(rating)
    })
  })
}

// NUEVA FUNCIÓN: Cargar rating guardado
function loadSavedRating() {
  const savedRating = localStorage.getItem('productRating')
  if (savedRating) {
    setRating(savedRating)
    console.log(`Rating cargado desde storage: ${savedRating} estrellas`)
  }
}

// FUNCIÓN MEJORADA: Establecer rating y mantener selección
function setRating(rating) {
  const ratingValue = document.getElementById("ratingValue")
  if (ratingValue) {
    ratingValue.value = rating
  }

  console.log(`Rating establecido: ${rating} estrellas`)
  
  // Actualizar visualmente las estrellas
  const stars = document.querySelectorAll(".rating-star")
  stars.forEach((star, index) => {
    const starRating = parseInt(star.getAttribute("data-rating"))
    
    // Limpiar clases
    star.classList.remove("bi-star", "bi-star-fill", "active", "text-warning", "text-muted")
    
    // Agregar clases según corresponda
    if (starRating <= rating) {
      star.classList.add("bi-star-fill", "text-warning")
    } else {
      star.classList.add("bi-star", "text-muted")
    }
  })
  
  // Guardar en localStorage
  localStorage.setItem('productRating', rating)
  
  // Mostrar confirmación
  showNotification(`Calificación: ${rating} estrellas`, "success")
}

// Product Gallery Functions
function changeMainImage(src) {
  const mainImage = document.getElementById("mainProductImage")
  mainImage.src = src

  // Update active thumbnail
  document.querySelectorAll(".thumbnail-img").forEach((img) => {
    img.classList.remove("active")
  })
  event.target.classList.add("active")
}

// Price Calculator Functions
function updateQuantity(change) {
  const quantityInput = document.getElementById("quantity")
  const currentValue = Number.parseInt(quantityInput.value)
  const newValue = currentValue + change

  if (newValue >= 1 && newValue <= currentStock) {
    quantityInput.value = newValue
    calculateTotal() // ✅ esto ya recalcula todo y actualiza los spans
  }
}

// NUEVA FUNCIÓN YA CORREGIDA - Ahora usa auth importado correctamente
window.addToCart = async function() {
    try {
        // Verificar autenticación usando Firebase Auth
        const user = auth.currentUser
        
        if (!user) {
            alert('Debes iniciar sesión para agregar productos al carrito')
            // Mostrar modal de login
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'))
            loginModal.show()
            return
        }

        // Obtener la cantidad actual del input
        const quantity = parseInt(document.getElementById('quantity').value) || 1
        
        // Obtener los extras seleccionados
        const maintenance = document.getElementById('maintenanceService').checked
        const mobileApp = document.getElementById('mobileApp').checked
        const warranty = document.getElementById('extendedWarranty').checked
        
        // Obtener el rating seleccionado
        const rating = document.getElementById("ratingValue").value || 0
        
        // Calcular precio base
        let precioBase = 4299 // Precio base del producto
        
        // Agregar extras al precio
        if (maintenance) precioBase += 2500
        if (mobileApp) precioBase += 1000
        if (warranty) precioBase += 3000
        
        const product = {
            id: 1,
            nombre: "Sistema HidroEye - Monitoreo Inteligente",
            precio: precioBase,
            cantidad: quantity,
            userId: user.uid,
            rating: rating, // Incluir rating en el producto
            extras: {
                maintenance: maintenance,
                mobileApp: mobileApp,
                warranty: warranty
            }
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || []
        
        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.findIndex(item => 
            item.id === product.id && 
            JSON.stringify(item.extras) === JSON.stringify(product.extras)
        )
        
        if (existingProductIndex !== -1) {
            // Si existe con los mismos extras, actualizar la cantidad
            cart[existingProductIndex].cantidad += quantity
        } else {
            // Si no existe, agregar nuevo producto
            cart.push(product)
        }

        localStorage.setItem('cart', JSON.stringify(cart))
        
        // Mostrar confirmación
        alert(` ${product.nombre} se agregó al carrito. Cantidad: ${quantity}`)
        
        // Actualizar contador del carrito
        updateCartCounter()
        
    } catch (error) {
        console.error('Error al agregar al carrito:', error)
        alert('Error al agregar el producto al carrito')
    }
}

// Función para actualizar el contador del carrito
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    const cartCounter = document.querySelector('.cart-counter')
    
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0)
        cartCounter.textContent = totalItems
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none'
        console.log(' Contador actualizado:', totalItems, 'productos')
    }
}

// Inicializa EmailJS con tu Public Key
emailjs.init("klruJ7X4iFVWopL-l")

// Función principal para enviar el formulario
function sendContactEmail() {
  const name = document.getElementById("contactName").value
  const email = document.getElementById("contactEmail").value
  const phone = document.getElementById("contactPhone").value
  const subject = document.getElementById("contactSubject").value
  const company = document.getElementById("contactCompany").value
  const message = document.getElementById("contactMessage").value
  const preference = document.getElementById("contactPreference").value

  if (!name || !email || !phone || !subject || !message) {
    alert("Por favor completa todos los campos obligatorios marcados con *")
    return
  }

  const templateParams = {
    name: name,
    email: email,
    phone: phone,
    subject: subject,
    company: company || "No especificado",
    message: message,
    preference: preference || "No especificado",
    time: new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" }),
  }

  emailjs.send("service_44wbor9", "template_qe9ggqm", templateParams)
    .then(() => {
      document.getElementById("contactSuccess").style.display = "block"
      document.getElementById("contactForm").reset()
      setTimeout(() => {
        document.getElementById("contactSuccess").style.display = "none"
      }, 5000)
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error)
      alert("❌ Hubo un error al enviar el mensaje. Inténtalo más tarde.")
    })
}

// Listener del formulario
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault()
  sendContactEmail()
})

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount)
}

function showNotification(message, type = "info") {
  // Create and show notification
  const notification = document.createElement("div")
  notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`
  notification.style.zIndex = "9999"
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}