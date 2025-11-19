# AquaMonitor - Sistema de Monitoreo de Calidad de Agua

Plataforma de e-commerce para sistema de monitoreo de calidad de agua en invernaderos del Valle de Mezquital, Hidalgo.

## Características

- ✅ Registro de usuarios con sistema de membresías
- ✅ Ficha técnica del producto con galería interactiva
- ✅ Simulador de compra con IVA y servicios adicionales
- ✅ Sistema de reseñas (requiere compra verificada)
- ✅ Integración con Google Maps API (ubicación y rutas)
- ✅ Formulario de contacto con backend
- 🔄 Integración con Firebase (en desarrollo)

## Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5.3
- Google Maps API
- Firebase (Authentication & Firestore)

## Configuración

### 1. Google Maps API

Reemplaza `YOUR_API_KEY` en `index.html` con tu API key de Google Maps:

\`\`\`html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap&libraries=places"></script>
\`\`\`

### 2. Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Copia tu configuración de Firebase
3. Reemplaza los valores en `js/firebase-config.js`:

\`\`\`javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};
\`\`\`

4. Habilita Authentication (Email/Password) en Firebase Console
5. Crea una base de datos Firestore

## Estructura del Proyecto

\`\`\`
agua-invernaderos/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos personalizados
├── js/
│   ├── main.js           # Funcionalidad principal
│   ├── firebase-config.js # Configuración de Firebase
│   └── maps.js           # Integración de Google Maps
└── README.md             # Este archivo
\`\`\`

## Funcionalidades Implementadas

### ✅ Registro de Usuarios
- Formulario en 2 pasos (patrón 4-6 de diseño)
- Validación de campos
- Sistema de membresías (Básica, Profesional, Empresarial)

### ✅ Ficha Técnica del Producto
- Galería interactiva con miniaturas
- Contador de stock en tiempo real
- Especificaciones técnicas detalladas
- Simulador de compra con:
  - Cálculo de IVA (16%)
  - Asistencia personal cada 3 meses
  - App móvil premium
  - Garantía extendida

### ✅ Sistema de Reseñas
- Solo usuarios que compraron pueden reseñar
- Calificación por estrellas
- Verificación de compra
- Almacenamiento en Firebase

### ✅ Mapa con Google Maps API
- Ubicación del negocio
- Trazado de rutas desde ubicación del usuario
- Lugares de referencia cercanos
- Información de contacto

### ✅ Formulario de Contacto
- Dropdowns para asunto
- Campos de información adicional
- Validación de datos
- Almacenamiento en Firebase/backend

## Próximos Pasos

1. Completar integración con Firebase
2. Implementar carrito de compras
3. Agregar pasarela de pagos
4. Sistema de notificaciones por email
5. Panel de administración
6. Historial de compras

## Instalación

1. Descarga todos los archivos
2. Configura tu API key de Google Maps
3. Configura Firebase
4. Abre `index.html` en tu navegador

## Soporte

Para soporte técnico, contacta a: contacto@aquamonitor.mx

## Licencia

© 2025 AquaMonitor. Todos los derechos reservados.
