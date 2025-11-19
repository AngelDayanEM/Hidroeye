import { 
    db, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    updateDoc,
    query,
    where,
    auth
} from './firebase-config';

console.log('reviews-firebase.js cargado');

class ReviewsManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupReviewForm();
        this.loadReviews();
        this.setupRatingStars();
        
        // Escuchar cambios de autenticación
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateReviewFormAccess();
        });
    }

    setupReviewForm() {
        const form = document.getElementById('reviewForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleReviewSubmit(e));
            console.log('Formulario de reseñas configurado');
        }
    }

    updateReviewFormAccess() {
        const reviewFormContainer = document.getElementById('reviewFormContainer');
        if (reviewFormContainer) {
            if (this.currentUser) {
                reviewFormContainer.style.display = 'block';
            } else {
                reviewFormContainer.style.display = 'none';
                // Opcional: mostrar mensaje para iniciar sesión
            }
        }
    }

    setupRatingStars() {
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = star.getAttribute('data-rating');
                this.setRating(rating);
            });
        });
    }

    setRating(rating) {
        document.getElementById('ratingValue').value = rating;
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            if (starRating <= rating) {
                star.classList.remove('bi-star');
                star.classList.add('bi-star-fill', 'text-warning');
            } else {
                star.classList.remove('bi-star-fill', 'text-warning');
                star.classList.add('bi-star');
            }
        });
    }

    async handleReviewSubmit(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            alert('Debes iniciar sesión para publicar una reseña');
            return;
        }

        const title = document.getElementById('reviewTitle').value;
        const text = document.getElementById('reviewText').value;
        const rating = document.getElementById('ratingValue').value;

        if (!title || !text || rating === '0') {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            const reviewData = {
                userId: this.currentUser.uid,
                userName: this.currentUser.displayName || 'Usuario',
                title: title,
                text: text,
                rating: parseInt(rating),
                timestamp: new Date(),
                verified: true,
                userEmail: this.currentUser.email
            };

            await addDoc(collection(db, 'reviews'), reviewData);
            alert('¡Reseña publicada!');
            
            // Limpiar formulario
            document.getElementById('reviewForm').reset();
            this.setRating(0);
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al publicar reseña: ' + error.message);
        }
    }

    loadReviews() {
        try {
            onSnapshot(collection(db, 'reviews'), (snapshot) => {
                this.displayReviews(snapshot);
            });
        } catch (error) {
            console.error('Error cargando reseñas:', error);
        }
    }

    displayReviews(snapshot) {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        // Limpiar solo reseñas dinámicas
        const dynamicReviews = reviewsList.querySelectorAll('[data-dynamic="true"]');
        dynamicReviews.forEach(review => review.remove());

        snapshot.forEach((doc) => {
            const review = doc.data();
            const reviewElement = this.createReviewElement(doc.id, review);
            reviewsList.appendChild(reviewElement);
        });

        // Mensaje si no hay reseñas
        if (snapshot.empty) {
            reviewsList.innerHTML += `
                <div class="card border-0 shadow-sm mb-3" data-dynamic="true">
                    <div class="card-body text-center">
                        <p class="text-muted">No hay reseñas aún. ¡Sé el primero en comentar!</p>
                    </div>
                </div>
            `;
        }
    }

    createReviewElement(id, review) {
        const div = document.createElement('div');
        div.className = 'card border-0 shadow-sm mb-3';
        div.setAttribute('data-dynamic', 'true');
        
        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="fw-bold mb-1">${this.escapeHtml(review.userName)}</h6>
                        <div class="text-warning mb-2">
                            ${this.generateStars(review.rating)}
                        </div>
                    </div>
                    <small class="text-muted">${this.formatDate(review.timestamp)}</small>
                </div>
                <h6 class="fw-bold">${this.escapeHtml(review.title)}</h6>
                <p class="text-muted mb-0">${this.escapeHtml(review.text)}</p>
                <div class="mt-2">
                    ${review.verified ? '<span class="badge bg-success me-2">Compra Verificada</span>' : ''}
                    ${this.currentUser && this.currentUser.uid === review.userId ? `
                        <button class="btn btn-sm btn-outline-danger delete-review" data-id="${id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Agregar event listener para eliminar
        const deleteBtn = div.querySelector('.delete-review');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteReview(id));
        }

        return div;
    }

    async deleteReview(id) {
        if (confirm('¿Eliminar esta reseña?')) {
            try {
                await deleteDoc(doc(db, 'reviews', id));
            } catch (error) {
                alert('Error eliminando reseña: ' + error.message);
            }
        }
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
        }
        return stars;
    }

    formatDate(timestamp) {
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) return 'Hoy';
            if (days === 1) return 'Ayer';
            return `Hace ${days} días`;
        } catch (e) {
            return 'Reciente';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsManager();
});