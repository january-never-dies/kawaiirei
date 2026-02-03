const IMAGES = [
    "assets/kawaii_0.jpg",
    "assets/kawaii_1.jpg",
    "assets/kawaii_2.jpg",
    "assets/kawaii_3.jpg",
    "assets/kawaii_4.jpg",
    "assets/kawaii_5.jpg",
    "assets/kawaii_6.jpg",
    "assets/kawaii_7.jpg",
    "assets/kawaii_8.jpg",
    "assets/kawaii_9.jpg",
    "assets/kawaii_10.jpg",
    "assets/kawaii_11.jpg",
    "assets/kawaii_12.jpg",
    "assets/kawaii_13.jpg",
    "assets/kawaii_14.jpg",
    "assets/kawaii_15.jpg",
    "assets/kawaii_16.jpg",
    "assets/kawaii_17.jpg",
    "assets/kawaii_18.jpg",
    "assets/kawaii_19.jpg",
    "assets/kawaii_20.jpg",
    "assets/kawaii_21.jpg",
    "assets/kawaii_22.jpg",
    "assets/kawaii_23.jpg",
    "assets/kawaii_24.jpg",
    "assets/kawaii_25.jpg",
    "assets/kawaii_26.jpg",
    "assets/kawaii_27.jpg",
    "assets/kawaii_28.jpg",
    "assets/kawaii_29.jpg",
    "assets/kawaii_30.jpg",
    "assets/kawaii_31.jpg"

];

const container = document.getElementById('image-container');
const onboarding = document.querySelector('.main-content');
let hasInteracted = false;

function spawnImage(x, y) {
    if (!hasInteracted) {
        onboarding.classList.add('hidden');
        hasInteracted = true;
    }

    const imgUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const imgElement = document.createElement('img');

    imgElement.src = imgUrl;
    imgElement.className = 'kawaii-img';

    // Randomize rotation
    const rotation = (Math.random() * 60 - 30) + 'deg';
    imgElement.style.setProperty('--rotation', rotation);

    // Set position centered on click
    const width = window.innerWidth <= 600 ? 200 : 250;
    const height = width;

    let left = x - width / 2;
    let top = y - height / 2;

    // Clamp to viewport
    left = Math.max(10, Math.min(left, window.innerWidth - width - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - height - 10));

    imgElement.style.left = left + 'px';
    imgElement.style.top = top + 'px';

    container.appendChild(imgElement);

    // Trigger animation
    requestAnimationFrame(() => {
        imgElement.classList.add('visible');
    });

    // Remove after 2 seconds
    setTimeout(() => {
        imgElement.classList.add('fade-out');
        setTimeout(() => {
            imgElement.remove();
        }, 400);
    }, 2000);
}

// unified input handler (mouse + touch)
window.addEventListener('pointerdown', (e) => {
    spawnImage(e.clientX, e.clientY);
}, { passive: true });
