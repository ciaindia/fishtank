// Fish class to manage individual fish
class Fish {
    constructor(name, container, imageUrl = null) {
        this.name = name;
        this.container = container;
        this.imageUrl = imageUrl;
        this.isImageFish = !!imageUrl;
        this.element = this.createElement();

        if (this.isImageFish) {
            // Image fish drops from top
            this.x = Math.random() * (window.innerWidth - 200);
            this.y = -100;
            this.dropTarget = Math.random() * (window.innerHeight - 200) + 50;
            this.isDropping = true;
            this.dropSpeed = 3;
        } else {
            // Text fish starts from left
            this.x = -100;
            this.y = Math.random() * (window.innerHeight - 100);
            this.isDropping = false;
        }

        this.speed = 1 + Math.random() * 2;
        this.amplitude = 20 + Math.random() * 30;
        this.frequency = 0.02 + Math.random() * 0.03;
        this.offset = Math.random() * Math.PI * 2;
        this.baseY = this.y;
        this.colors = [
            ['#ff6b6b', '#ff8e53'],
            ['#4ecdc4', '#44a08d'],
            ['#a8e6cf', '#3d84a8'],
            ['#ffd93d', '#ff6b6b'],
            ['#6c5ce7', '#a29bfe'],
            ['#fd79a8', '#fdcb6e'],
            ['#00b894', '#00cec9'],
            ['#ff7675', '#fab1a0']
        ];
        this.colorIndex = Math.floor(Math.random() * this.colors.length);

        if (!this.isImageFish) {
            this.applyColor();
        }

        this.animate();
    }

    createElement() {
        const fish = document.createElement('div');
        fish.className = this.isImageFish ? 'fish image-fish' : 'fish';

        if (this.isImageFish) {
            fish.innerHTML = `<img src="${this.imageUrl}" alt="Fish">`;
            // Add drop animation
            fish.style.animation = 'drop 1.5s ease-out, swim 1s ease-in-out infinite 1.5s';
        } else {
            fish.innerHTML = `<span>${this.name}</span>`;
        }

        this.container.appendChild(fish);
        return fish;
    }

    applyColor() {
        const [color1, color2] = this.colors[this.colorIndex];
        this.element.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;

        // Update tail color to match
        const style = document.createElement('style');
        style.textContent = `
            .fish:nth-child(${Array.from(this.container.children).indexOf(this.element) + 1})::after {
                border-left-color: ${color1};
            }
        `;
        document.head.appendChild(style);
    }

    animate() {
        const move = () => {
            if (this.isImageFish && this.isDropping) {
                // Drop animation
                this.y += this.dropSpeed;

                if (this.y >= this.dropTarget) {
                    this.y = this.dropTarget;
                    this.baseY = this.y;
                    this.isDropping = false;
                    // Start swimming from current position
                    this.x = -100;
                }

                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            } else {
                // Swimming animation
                this.x += this.speed;

                // Calculate vertical position with sine wave
                const time = Date.now() * 0.001;
                this.y = this.baseY + Math.sin(time * this.frequency + this.offset) * this.amplitude;

                // Update position
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;

                // Reset position when fish goes off-screen
                if (this.x > window.innerWidth + 100) {
                    this.x = -100;
                    this.baseY = Math.random() * (window.innerHeight - 100);
                }
            }

            // Continue animation
            this.animationFrame = requestAnimationFrame(move);
        };

        move();
    }

    destroy() {
        cancelAnimationFrame(this.animationFrame);
        this.element.remove();
    }
}

// Fish Manager
class FishTank {
    constructor() {
        this.container = document.getElementById('fishTank');
        this.form = document.getElementById('fishForm');
        this.input = document.getElementById('fishName');
        this.imageInput = document.getElementById('fishImage');
        this.countDisplay = document.getElementById('fishCount');
        this.fishes = [];

        this.init();
    }

    init() {
        // Modal controls
        const modal = document.getElementById('fishModal');
        const addBtn = document.getElementById('addFishBtn');
        const closeBtn = document.getElementById('closeModal');

        addBtn.addEventListener('click', () => {
            modal.classList.add('active');
            this.input.focus();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFish();
            modal.classList.remove('active'); // Close modal after creating fish
        });

        // Handle image upload
        this.imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e);
            modal.classList.remove('active'); // Close modal after uploading
        });

        // Add some demo fish on load
        setTimeout(() => this.addFish('Welcome'), 500);
        setTimeout(() => this.addFish('Explore'), 1500);
        setTimeout(() => this.addFish('Create'), 2500);
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Create URL for the image
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImageFish(e.target.result);
        };
        reader.readAsDataURL(file);

        // Reset input
        event.target.value = '';
    }

    addFish(customName = null) {
        const name = customName || this.input.value.trim();

        if (!name) return;

        // Create new fish
        const fish = new Fish(name, this.container);
        this.fishes.push(fish);

        // Update count
        this.updateCount();

        // Clear input
        if (!customName) {
            this.input.value = '';
            this.input.focus();
        }

        // Add creation animation
        fish.element.style.animation = 'fadeIn 0.5s ease-out, swim 1s ease-in-out infinite';

        // Optional: Limit number of fish to prevent performance issues
        if (this.fishes.length > 20) {
            const oldFish = this.fishes.shift();
            oldFish.destroy();
        }
    }

    addImageFish(imageUrl) {
        // Create new image fish
        const fish = new Fish('Image Fish', this.container, imageUrl);
        this.fishes.push(fish);

        // Update count
        this.updateCount();

        // Optional: Limit number of fish
        if (this.fishes.length > 20) {
            const oldFish = this.fishes.shift();
            oldFish.destroy();
        }
    }

    updateCount() {
        this.countDisplay.textContent = this.fishes.length;

        // Add pulse animation to count
        this.countDisplay.style.animation = 'none';
        setTimeout(() => {
            this.countDisplay.style.animation = 'pulse 0.3s ease-out';
        }, 10);
    }
}

// Add pulse animation for count
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(style);

// Initialize the fish tank when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FishTank();
});
