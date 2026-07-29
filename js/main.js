document.addEventListener('DOMContentLoaded', () => {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const video = document.getElementById('hero-video');
  if (prefersReducedMotion && video) {
    video.pause();
    video.removeAttribute('autoplay');
  }

  // Carousel Logic
  const slides = document.querySelectorAll('.slide-card');
  const currentNumEl = document.getElementById('current-slide');
  const progressFill = document.getElementById('progress-fill');
  
  if (!slides.length || !progressFill) return;

  const totalSlides = slides.length;
  let currentIndex = 0;
  
  // Carousel config
  const slideDuration = 3500; // ms (approx ~3.5 seconds)
  const tickRate = 30; // ms ticks
  const totalTicks = slideDuration / tickRate;
  
  let currentTick = 0;
  let timerId = null;
  let hasAutoScrolled = false;
  let cycleCount = 0;
  
  const slidesContainer = document.getElementById('carousel-slides');

  function updateCarousel() {
    // Calculate translation offset: each slide is 380px wide + 1rem (16px) gap
    const slideWidth = 380;
    const gap = 16;
    const offset = -(slideWidth + gap) * currentIndex;
    
    if (slidesContainer) {
      slidesContainer.style.transform = `translateX(${offset}px)`;
    }

    // Update active class for opacity dimming
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    
    // Update number indicator (e.g., '01')
    currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  function advanceSlide() {
    const previousIndex = currentIndex;
    currentIndex = (currentIndex + 1) % totalSlides;
    
    // Check if we just completed a full cycle (went from last slide to first slide)
    if (previousIndex === totalSlides - 1 && currentIndex === 0) {
      cycleCount++;
      if (cycleCount === 1 && !hasAutoScrolled) {
        hasAutoScrolled = true;
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      }
    }
    
    updateCarousel();
    currentTick = 0; // reset progress
  }

  function tick() {
    currentTick++;
    const progressPercent = (currentTick / totalTicks) * 100;
    
    if (progressPercent >= 100) {
      progressFill.style.width = '100%';
      advanceSlide();
    } else {
      progressFill.style.width = progressPercent + '%';
    }
  }

  // Only start auto-advance if no reduced motion preference
  if (!prefersReducedMotion) {
    timerId = setInterval(tick, tickRate);
  } else {
    // If reduced motion, just fill the bar or hide it, and keep it static
    progressFill.style.width = '100%';
  }

  // --- Parallax Background for About Section ---
  const bgGraphic = document.getElementById('about-bg-graphic');
  if (bgGraphic && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          // Subtly move the graphic downwards at 15% of scroll speed
          bgGraphic.style.transform = `translateY(${scrolled * 0.15}px)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Scroll Reveal Features ---
  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length > 0 && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px"
    });
    
    revealItems.forEach(item => observer.observe(item));
  } else if (prefersReducedMotion) {
    // If reduced motion, immediately show items without animation
    revealItems.forEach(item => {
      item.classList.add('in-view');
      item.style.opacity = '1';
      item.style.transform = 'none';
      item.style.transition = 'none';
    });
  }
});
