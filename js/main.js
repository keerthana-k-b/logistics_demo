document.addEventListener('DOMContentLoaded', () => {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const video = document.getElementById('hero-video');
  if (prefersReducedMotion && video) {
    video.pause();
    video.removeAttribute('autoplay');
  }

  // Navbar Scroll Effect (Hide on Scroll Down, Show on Scroll Up)
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Add translucent background class
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Hide/Show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scrolling down
        navbar.classList.add('navbar-hidden');
      } else {
        // Scrolling up
        navbar.classList.remove('navbar-hidden');
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Active Navigation State (Intersection Observer)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]');
  
  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when section hits middle of screen
      threshold: 0
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);
    
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Mobile Menu Logic
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  
  if (mobileBtn && mobileMenu) {
    function toggleMobileMenu() {
      mobileMenu.classList.toggle('active');
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    
    mobileBtn.addEventListener('click', toggleMobileMenu);
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
          toggleMobileMenu();
        }
      });
    });
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
    // Calculate translation offset: each slide is 420px wide + 1rem (16px) gap
    const slideWidth = 420;
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
  
  // --- About Section Progressive Word Highlight ---
  const aboutSection = document.getElementById('about');
  const highlightWords = document.querySelectorAll('.highlight-word');
  
  if (aboutSection && highlightWords.length > 0 && !prefersReducedMotion) {
    let highlightTicking = false;
    window.addEventListener('scroll', () => {
      if (!highlightTicking) {
        window.requestAnimationFrame(() => {
          const rect = aboutSection.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate how far the section is into the viewport
          // Start highlighting when top is at 80% of window height
          // Finish highlighting when top is at 20% of window height
          const start = windowHeight * 0.8;
          const end = windowHeight * 0.2;
          
          let progress = (start - rect.top) / (start - end);
          progress = Math.max(0, Math.min(1, progress));
          
          // Dual Phase Animation:
          // Phase 1 (0.0 - 0.4): Left-to-right text reveal and translateY
          // Phase 2 (0.4 - 1.0): Sequential word highlighting
          
          let revealProgress = Math.min(1, progress / 0.4);
          let highlightProgress = Math.max(0, (progress - 0.4) / 0.6);
          
          const aboutHeadline = aboutSection.querySelector('.about-headline');
          if (aboutHeadline) {
            // Subtle 10px upward movement during Phase 1
            const yOffset = 10 * (1 - revealProgress);
            aboutHeadline.style.transform = `translateY(${yOffset}px)`;
            
            // Soft left-to-right wipe mask
            const percent = revealProgress * 100;
            const maskGradient = `linear-gradient(to right, rgba(0,0,0,1) ${percent}%, rgba(0,0,0,0) ${Math.min(100, percent + 10)}%)`;
            aboutHeadline.style.webkitMaskImage = maskGradient;
            aboutHeadline.style.maskImage = maskGradient;
          }
          
          highlightWords.forEach((word, index) => {
            // Distribute the words evenly across the highlightProgress range
            const threshold = (index + 1) / highlightWords.length;
            if (highlightProgress >= threshold) {
              word.classList.add('active');
            } else {
              word.classList.remove('active');
            }
          });
          
          // (Removed old parallax logic since it is now unified in Phase 1 above)
          
          // Subtle Parallax for the right content area
          const aboutRight = aboutSection.querySelector('.about-right');
          if (aboutRight) {
            // Move up to -20px as you scroll through
            aboutRight.style.transform = `translateY(${progress * -20}px)`;
          }
          highlightTicking = false;
        });
        highlightTicking = true;
      }
    }, { passive: true });
  }

  // --- Services Sticky In-Place Swap ---
  const track = document.getElementById('services-track');
  const panels = document.querySelectorAll('.service-panel');
  
  if (track && panels.length > 0 && !prefersReducedMotion) {
    let serviceTicking = false;
    window.addEventListener('scroll', () => {
      if (!serviceTicking) {
        window.requestAnimationFrame(() => {
          const trackRect = track.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate progress from 0 to 1
          const scrollDistance = trackRect.height - windowHeight;
          let progress = -trackRect.top / scrollDistance;
          progress = Math.max(0, Math.min(1, progress));
          
          // Determine which panel should be active (0 to panels.length - 1)
          if (window.innerWidth >= 768) {
            let activeIndex = Math.floor(progress * panels.length);
            if (activeIndex >= panels.length) {
              activeIndex = panels.length - 1;
            }
            
            panels.forEach((p, i) => {
              if(i === activeIndex) {
                p.classList.add('active');
              } else {
                p.classList.remove('active');
              }
            });
          }
          
          serviceTicking = false;
        });
        serviceTicking = true;
      }
    }, { passive: true });
  }
});
