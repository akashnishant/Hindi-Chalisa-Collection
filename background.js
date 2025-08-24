// Advanced Universe Animation System
class UniverseAnimator {
  constructor() {
    this.init();
  }

  init() {
    this.createStars();
    this.createParticles();
    this.createShootingStars();
    this.startAnimationLoop();
  }

  createStars() {
    const starsContainer = document.getElementById("starsLayer");
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = `star ${this.getStarSize()}`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 3}s`;
      starsContainer.appendChild(star);
    }
  }

  getStarSize() {
    const rand = Math.random();
    if (rand < 0.7) return "small";
    if (rand < 0.9) return "medium";
    return "large";
  }

  createParticles() {
    const particlesContainer = document.getElementById("particlesLayer");
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${10 + Math.random() * 10}s`;
      particlesContainer.appendChild(particle);
    }
  }

  createShootingStars() {
    const shootingStarsContainer =
      document.getElementById("shootingStarsLayer");

    setInterval(() => {
      if (Math.random() < 0.3) {
        const shootingStar = document.createElement("div");
        shootingStar.className = "shooting-star";
        shootingStar.style.top = `${Math.random() * 50}%`;
        shootingStar.style.left = `${Math.random() * 50}%`;
        shootingStarsContainer.appendChild(shootingStar);

        setTimeout(() => {
          shootingStar.remove();
        }, 3000);
      }
    }, 2000);
  }

  startAnimationLoop() {
    // Advanced animation loop for dynamic effects
    setInterval(() => {
      this.updateCosmicEffects();
    }, 100);
  }

  updateCosmicEffects() {
    // Dynamic color shifting for nebulas
    const nebulas = document.querySelectorAll(".nebula");
    nebulas.forEach((nebula, index) => {
      const hue = (Date.now() / 50 + index * 120) % 360;
      const saturation = 50 + Math.sin(Date.now() / 1000) * 20;
      const lightness = 30 + Math.sin(Date.now() / 800 + index) * 10;

      nebula.style.filter = `blur(50px) hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${lightness}%)`;
    });
  }
}

// Initialize Universe Animation
const universeAnimator = new UniverseAnimator();
