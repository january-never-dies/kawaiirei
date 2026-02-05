const IMAGES = [
    "assets/kawaii_0.jpg", "assets/kawaii_1.jpg", "assets/kawaii_2.jpg", "assets/kawaii_3.jpg",
    "assets/kawaii_4.jpg", "assets/kawaii_5.jpg", "assets/kawaii_22.jpg", "assets/kawaii_24.jpg",
    "assets/kawaii_26.jpg", "assets/kawaii_6.jpg", "assets/kawaii_7.jpg", "assets/kawaii_8.jpg",
    "assets/kawaii_9.jpg", "assets/kawaii_10.jpg", "assets/kawaii_11.jpg", "assets/kawaii_12.jpg",
    "assets/kawaii_13.jpg", "assets/kawaii_14.jpg", "assets/kawaii_15.jpg", "assets/kawaii_16.jpg",
    "assets/kawaii_17.jpg", "assets/kawaii_18.jpg", "assets/kawaii_19.jpg", "assets/kawaii_20.jpg",
    "assets/kawaii_21.jpg", "assets/kawaii_23.jpg", "assets/kawaii_25.jpg", "assets/kawaii_28.jpg",
    "assets/kawaii_29.jpg", "assets/kawaii_30.jpg", "assets/kawaii_31.jpg"
];

// Preload images
IMAGES.forEach(src => {
    const img = new Image();
    img.src = src;
});

const container = document.getElementById('image-container');
const onboarding = document.querySelector('.main-content');
const dropZone = document.getElementById('drop-zone');
const modal = document.getElementById('preview-modal');
const previewImg = document.getElementById('preview-img');
const downloadBtn = document.getElementById('download-btn');
const closeBtn = document.querySelector('.close-btn');

let hasInteracted = false;
const activePhotos = [];

// Physics Constants
const GRAVITY = 0.5;
const FRICTION = 0.98;
const BOUNCE = 0.7;
const MAX_PHOTOS = 40; // Increased for stacking fun

class Photo {
    constructor(x, y, url) {
        this.url = url;
        this.element = document.createElement('img');
        this.element.src = url;
        this.element.className = 'kawaii-img';

        const size = window.innerWidth <= 600 ? 150 : 200; // Smaller for better stacking
        this.width = size;
        this.height = size;

        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() - 2.0) * 10;
        this.rotation = Math.random() * 60 - 30;
        this.isDragging = false;
        this.isSettled = false;

        this.element.style.setProperty('--rotation', this.rotation + 'deg');
        this.updatePosition();

        container.appendChild(this.element);

        requestAnimationFrame(() => {
            this.element.classList.add('visible');
        });

        this.initEvents();
    }

    initEvents() {
        this.element.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.isDragging = true;
            this.isSettled = false;
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
            this.vx = 0;
            this.vy = 0;
            this.element.setPointerCapture(e.pointerId);
            this.element.style.zIndex = 1000;
        });

        this.element.addEventListener('pointermove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastPointerX;
                const dy = e.clientY - this.lastPointerY;

                this.x += dx;
                this.y += dy;

                this.vx = dx * 0.5;
                this.vy = dy * 0.5;

                this.lastPointerX = e.clientX;
                this.lastPointerY = e.clientY;

                // Visual feedback for drop zone (using photo center for harmony)
                const dzRect = dropZone.getBoundingClientRect();
                const centerX = this.x + this.width / 2;
                const centerY = this.y + this.height / 2;

                const margin = 50; // More forgiving margin
                const isOver = centerX > dzRect.left - margin && centerX < dzRect.right + margin &&
                    centerY > dzRect.top - margin && centerY < dzRect.bottom + margin;

                if (isOver) {
                    dropZone.classList.add('drag-over');
                    // Optional: Magnetic snap effect
                    this.element.style.transform = `scale(1.05) rotate(${this.rotation}deg)`;
                } else {
                    dropZone.classList.remove('drag-over');
                    this.element.style.transform = `scale(1) rotate(${this.rotation}deg)`;
                }

                this.updatePosition();
            }
        });

        const stopDrag = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.element.releasePointerCapture(e.pointerId);
                this.element.style.zIndex = '';
                this.element.style.transform = ''; // Clear magnetic scale

                const dzRect = dropZone.getBoundingClientRect();
                const centerX = this.x + this.width / 2;
                const centerY = this.y + this.height / 2;

                const margin = 50; // Matches drag-over feedback
                if (centerX > dzRect.left - margin && centerX < dzRect.right + margin &&
                    centerY > dzRect.top - margin && centerY < dzRect.bottom + margin) {
                    showPreview(this.url);
                    dropZone.classList.remove('drag-over');
                    this.remove();
                    const index = activePhotos.indexOf(this);
                    if (index > -1) activePhotos.splice(index, 1);
                }
            }
        };

        this.element.addEventListener('pointerup', stopDrag);
        this.element.addEventListener('pointercancel', stopDrag);
    }

    update() {
        if (this.isDragging || this.isSettled) return;

        // Apply physics
        this.vy += GRAVITY;
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        this.x += this.vx;
        this.y += this.vy;

        const rightEdge = window.innerWidth - this.width;
        const bottomEdge = window.innerHeight - this.height;

        // Bouncing on walls
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -BOUNCE;
        } else if (this.x > rightEdge) {
            this.x = rightEdge;
            this.vx *= -BOUNCE;
        }

        if (this.y < 0) {
            this.y = 0;
            this.vy *= -BOUNCE;
        }

        // Stacking logic
        let groundLevel = bottomEdge;

        for (const other of activePhotos) {
            if (other === this || !other.isSettled) continue;

            const dx = Math.abs((this.x + this.width / 2) - (other.x + other.width / 2));
            if (dx < this.width * 0.7) {
                const otherTop = other.y - this.height * 0.85;
                if (this.y > otherTop - 20 && this.y < otherTop + 50 && this.vy > 0) {
                    groundLevel = Math.min(groundLevel, otherTop);
                }
            }
        }

        if (this.y >= groundLevel) {
            this.y = groundLevel;
            if (Math.abs(this.vy) < 2) {
                this.vy = 0;
                this.vx = 0;
                this.isSettled = true;
            } else {
                this.vy *= -0.3;
                this.vx *= 0.5;
            }
        }

        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    remove() {
        this.element.classList.add('fade-out');
        setTimeout(() => {
            this.element.remove();
        }, 400);
    }
}

function showPreview(url) {
    previewImg.src = url;
    downloadBtn.href = url;
    modal.classList.remove('hidden');
    modal.offsetHeight; // force reflow
    modal.classList.add('visible');
}

closeBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
});

function spawnImage(x, y) {
    if (!hasInteracted) {
        onboarding.classList.add('hidden');
        hasInteracted = true;
    }

    const imgUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const photo = new Photo(x, y, imgUrl);
    activePhotos.push(photo);

    if (activePhotos.length > MAX_PHOTOS) {
        const oldest = activePhotos.shift();
        oldest.remove();
    }
}

function animate() {
    activePhotos.forEach(photo => photo.update());
    requestAnimationFrame(animate);
}

window.addEventListener('pointerdown', (e) => {
    if (e.target.id === 'app' || e.target.id === 'image-container' || e.target.tagName === 'BODY' || e.target.classList.contains('side-text')) {
        spawnImage(e.clientX, e.clientY);
    }
}, { passive: true });

animate();

