// js/maps.js

document.addEventListener("DOMContentLoaded", function () {
    // Verifica que el contenedor exista
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
        console.error("No se encontró el contenedor del mapa (#map)");
        return;
    }

    // Coordenadas de Mixquiahuala, Hidalgo
    const coordenadas = [20.2269, -99.2131];

    // Inicializar el mapa
    const map = L.map("map").setView(coordenadas, 14);

    // Capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Marcador de la ubicación
    const marker = L.marker(coordenadas)
        .addTo(map)
        .bindPopup("<b>HidroEye</b><br>Valle de Mezquital, Hidalgo")
        .openPopup();

    // Función para obtener ruta desde ubicación actual
    window.getDirections = function () {
        if (!navigator.geolocation) {
            alert("La geolocalización no es compatible con este navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                L.Routing.control({
                    waypoints: [
                        userLatLng,
                        L.latLng(coordenadas)
                    ],
                    routeWhileDragging: true,
                    language: 'es'
                }).addTo(map);
            },
            () => {
                alert("No se pudo obtener tu ubicación actual.");
            }
        );
    };
});
