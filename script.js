document.addEventListener('DOMContentLoaded', () => {
    // Reveal elements on scroll
    const revealElements = document.querySelectorAll('.about-heading, .about-desc, .about-subtext, .btn-outline, .logo-item');
    
    // Set initial state for reveal
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        
        revealElements.forEach((el, index) => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100); // Staggered delay
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // --- Typewriter Effect for About Section Heading ---
    const aboutHeading = document.getElementById('about-heading');
    const aboutLead = document.getElementById('about-lead');

    if (aboutHeading && aboutLead) {
        // Store original HTML and clean up whitespace
        const headingHTML = aboutHeading.innerHTML.trim().replace(/\s+/g, ' ');
        const leadHTML = aboutLead.innerHTML.trim().replace(/\s+/g, ' ');
        
        // Prevent layout shift by enforcing minimum height before clearing
        aboutHeading.style.minHeight = aboutHeading.offsetHeight + 'px';
        aboutLead.style.minHeight = aboutLead.offsetHeight + 'px';
        
        aboutHeading.innerHTML = '';
        aboutLead.innerHTML = '';
        
        function typeWriter(element, htmlStr, speed = 40) {
            return new Promise(resolve => {
                const tokens = [];
                const regex = /(<[^>]+>|&[a-zA-Z0-9#]+;)/g;
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(htmlStr)) !== null) {
                    const text = htmlStr.substring(lastIndex, match.index);
                    for (const char of text) {
                        tokens.push(char);
                    }
                    tokens.push(match[0]);
                    lastIndex = regex.lastIndex;
                }
                const text = htmlStr.substring(lastIndex);
                for (const char of text) {
                    tokens.push(char);
                }

                let currentIndex = 0;
                let currentHTML = '';
                const cursor = '<span class="type-cursor">|</span>';
                
                function type() {
                    if (currentIndex < tokens.length) {
                        // Append full tags/entities instantaneously
                        while (currentIndex < tokens.length && (tokens[currentIndex].startsWith('<') || (tokens[currentIndex].startsWith('&') && tokens[currentIndex].length > 1))) {
                            currentHTML += tokens[currentIndex];
                            currentIndex++;
                        }
                        
                        // Append next character
                        if (currentIndex < tokens.length) {
                            currentHTML += tokens[currentIndex];
                            currentIndex++;
                        }
                        
                        element.innerHTML = currentHTML + cursor;
                        
                        // Natural typing variation
                        const variation = Math.random() * 20 - 10; 
                        setTimeout(type, speed + variation);
                    } else {
                        element.innerHTML = currentHTML; 
                        element.style.minHeight = ''; // Reset layout bounds
                        resolve();
                    }
                }
                type();
            });
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    // Type heading first, then lead paragraph consecutively
                    await typeWriter(aboutHeading, headingHTML, 40);
                    await typeWriter(aboutLead, leadHTML, 35); // slightly faster for the paragraph
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% of the section is visible

        const aboutRightCol = document.getElementById('about-right-col');
        if (aboutRightCol) {
            observer.observe(aboutRightCol);
        }
    }

    // Autoplaying Carousel Logic
    const slider = document.getElementById('slider');
    const cards = document.querySelectorAll('.service-card');
    const progressBar = document.querySelector('.progress');
    const slideNum = document.querySelector('.slide-num.active');
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Initialize first card
    if (cards.length > 0) {
        cards[0].classList.add('active-card');
    }

    const updateSlider = () => {
        // Calculate translation (Card width 320px + gap 24px)
        const translateX = -(currentIndex * 344);
        slider.style.transform = `translateX(${translateX}px)`;
        
        // Update classes for opacity
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active-card');
            } else {
                card.classList.remove('active-card');
            }
        });

        // Update progress UI
        progressBar.style.width = `${((currentIndex + 1) / totalCards) * 100}%`;
        slideNum.textContent = `0${currentIndex + 1}`;
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateSlider();
    };

    // Autoplay interval (every 3.5 seconds)
    if (slider) {
        setInterval(nextSlide, 3500);
    }

    // Footprint Map Interaction (Scroll & Auto-Rotate)
    const mapWrappers = document.querySelectorAll('.map-wrapper');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineFill = document.getElementById('timeline-fill');
    const footprintScrollSection = document.getElementById('footprint-scroll-section');

    let currentFootprintMap = 'world';
    let footprintInterval = null;

    const switchFootprintStep = (mapId) => {
        currentFootprintMap = mapId;

        // Update active dot styling
        timelineDots.forEach(dot => {
            if (dot.getAttribute('data-map') === mapId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update timeline fill indicator position
        if (timelineFill) {
            if (mapId === 'world') {
                timelineFill.style.top = '0';
                timelineFill.style.transform = 'translateY(0)';
            } else {
                timelineFill.style.top = '100%';
                timelineFill.style.transform = 'translateY(-100%)';
            }
        }

        // Crossfade vector maps
        mapWrappers.forEach(wrapper => {
            if (wrapper.id === `map-${mapId}-wrapper`) {
                wrapper.classList.add('active');
            } else {
                wrapper.classList.remove('active');
            }
        });
    };

    // Auto-rotate timer function
    const startFootprintAutoRotate = () => {
        if (footprintInterval) clearInterval(footprintInterval);
        footprintInterval = setInterval(() => {
            const nextMapId = currentFootprintMap === 'world' ? 'us' : 'world';
            switchFootprintStep(nextMapId);
        }, 4500); // Toggles automatically every 4.5 seconds
    };

    // Add manual click listeners to timeline dots (01 and 02)
    timelineDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const mapId = e.target.getAttribute('data-map');
            switchFootprintStep(mapId);
            startFootprintAutoRotate(); // Reset timer on manual click
        });
    });

    // Scroll-driven map and indicator transition
    const updateFootprintScroll = () => {
        if (!footprintScrollSection) return;

        const rect = footprintScrollSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalHeight = rect.height - windowHeight;

        if (rect.top <= windowHeight && rect.bottom >= 0 && totalHeight > 0) {
            const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));

            // Dynamically slide the white indicator line with scroll position
            if (timelineFill) {
                timelineFill.style.top = `${progress * 100}%`;
                timelineFill.style.transform = `translateY(-${progress * 100}%)`;
            }

            // Switch maps automatically at midpoint
            if (progress < 0.5 && currentFootprintMap !== 'world') {
                switchFootprintStep('world');
            } else if (progress >= 0.5 && currentFootprintMap !== 'us') {
                switchFootprintStep('us');
            }
        }
    };

    window.addEventListener('scroll', updateFootprintScroll, { passive: true });
    updateFootprintScroll();
    startFootprintAutoRotate();

    // Navigation Drawer Logic
    const menuBtn = document.querySelector('.menu-btn');
    const closeDrawerBtn = document.getElementById('closeDrawer');
    const navDrawer = document.getElementById('navDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    const openDrawer = () => {
        navDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeDrawer = () => {
        navDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };

    if (menuBtn && closeDrawerBtn && navDrawer && drawerOverlay) {
        menuBtn.addEventListener('click', openDrawer);
        closeDrawerBtn.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navDrawer.classList.contains('active')) {
                closeDrawer();
            }
        });

        // Smooth scroll to target section and close drawer
        drawerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('data-scroll');
                const targetEl = document.getElementById(targetId) || document.querySelector(`.${targetId}`);
                closeDrawer();
                if (targetEl) {
                    setTimeout(() => {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            });
        });
    }

    // Core Solutions Parallel Scroll Showcase Logic
    const solutionsSection = document.getElementById('core-solutions');
    const solutionTextItems = document.querySelectorAll('.solution-text-item');
    const notchedCardSlider = document.getElementById('notchedCardSlider');

    let currentSolutionIndex = -1;

    const updateSolutionsScroll = () => {
        if (!solutionsSection) return;

        const rect = solutionsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalHeight = rect.height - windowHeight;

        if (totalHeight <= 0) return;

        // Calculate progress from 0 to 1 with an exit hold buffer for the final item
        const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
        const totalItems = solutionTextItems.length;
        
        // Distribute items across 0..0.88 scroll progress so Item 5 has full viewing duration
        const activeIndex = Math.min(totalItems - 1, Math.floor(progress * (totalItems + 0.6)));

        if (activeIndex !== currentSolutionIndex) {
            currentSolutionIndex = activeIndex;

            // Update text items
            solutionTextItems.forEach((item, idx) => {
                if (idx === activeIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Slide vertical card reel to active solution
            if (notchedCardSlider) {
                notchedCardSlider.style.transform = `translateY(-${activeIndex * 350}px)`;
            }
        }
    };

    window.addEventListener('scroll', updateSolutionsScroll, { passive: true });
    updateSolutionsScroll();

    // Floating Navbar Logic
    const floatingNavbar = document.getElementById('floatingNavbar');
    const heroSection = document.querySelector('.hero-container');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.floating-link');
    
    let lastScrollY = window.scrollY;
    let isNavbarVisible = false;
    let isHoveringTop = false;
    
    const checkNavbarVisibility = () => {
        if (!floatingNavbar) return;
        const currentScrollY = window.scrollY;
        const heroBottom = heroSection ? (heroSection.getBoundingClientRect().bottom + window.scrollY) : 500;
        
        // Are we past the hero section?
        if (currentScrollY > heroBottom - 100) {
            if (currentScrollY < lastScrollY) {
                // Scrolling UP
                showNavbar();
            } else if (currentScrollY > lastScrollY && !isHoveringTop) {
                // Scrolling DOWN
                hideNavbar();
            }
        } else {
            // In hero section - always hide
            hideNavbar();
        }
        
        lastScrollY = currentScrollY;
    };
    
    const showNavbar = () => {
        if (!isNavbarVisible && floatingNavbar) {
            floatingNavbar.classList.add('visible');
            isNavbarVisible = true;
        }
    };
    
    const hideNavbar = () => {
        if (isNavbarVisible && !isHoveringTop && floatingNavbar) {
            floatingNavbar.classList.remove('visible');
            isNavbarVisible = false;
        }
    };
    
    window.addEventListener('scroll', checkNavbarVisibility, { passive: true });
    
    // Mouse movement to show navbar near top
    document.addEventListener('mousemove', (e) => {
        const currentScrollY = window.scrollY;
        const heroBottom = heroSection ? (heroSection.getBoundingClientRect().bottom + window.scrollY) : 500;
        
        if (currentScrollY > heroBottom - 100) {
            if (e.clientY < 120) {
                isHoveringTop = true;
                showNavbar();
            } else {
                isHoveringTop = false;
            }
        }
    });

    // Active link highlighting based on scroll position
    const updateActiveLink = () => {
        let current = '';
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        sections.forEach(section => {
            // Include scroll height logic for special parallel scroll sections
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop - windowHeight * 0.4 && scrollY < sectionTop + sectionHeight - windowHeight * 0.4) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    // CTA Section Interactive Grid Scan Effect
    const ctaSection = document.getElementById('quick-actions');
    const ctaGrid = document.querySelector('.cta-grid-bg');
    
    if (ctaSection && ctaGrid) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHoveringCta = false;
        
        ctaSection.addEventListener('mousemove', (e) => {
            const rect = ctaSection.getBoundingClientRect();
            // Get coordinates relative to the section
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isHoveringCta = true;
        });
        
        ctaSection.addEventListener('mouseleave', () => {
            isHoveringCta = false;
        });
        
        const animateGrid = () => {
            // Only update animation if hovered or if it needs to catch up (for trailing fade)
            if (isHoveringCta || Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
                // Lower lerp value for a longer, smoother trailing fade effect
                currentX += (mouseX - currentX) * 0.04;
                currentY += (mouseY - currentY) * 0.04;
                
                // Update CSS variables for mask position
                ctaGrid.style.setProperty('--mouse-x', `${currentX}px`);
                ctaGrid.style.setProperty('--mouse-y', `${currentY}px`);
                
                // Calculate Parallax shift (subtle reverse movement)
                const rect = ctaSection.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const shiftX = (currentX - centerX) * -0.02; 
                const shiftY = (currentY - centerY) * -0.02;
                
                ctaGrid.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            }
            requestAnimationFrame(animateGrid);
        };
        
        animateGrid();
    }

    // Case Studies 3D Carousel Logic
    const csContainer = document.getElementById('csCarouselContainer');
    const csTrack = document.getElementById('csCarouselTrack');
    let csCards = document.querySelectorAll('.cs-card');

    if (csContainer && csTrack && csCards.length > 0) {
        // Clone cards for infinite seamless scroll
        const originalCardsCount = csCards.length;
        csCards.forEach(card => {
            const clone = card.cloneNode(true);
            if (clone.id) clone.removeAttribute('id');
            csTrack.appendChild(clone);
        });
        
        // Re-query cards after cloning
        csCards = document.querySelectorAll('.cs-card');
        const totalCards = csCards.length;

        const currentEl = document.getElementById('csCurrent');
        const totalEl = document.getElementById('csTotal');
        const progressFill = document.getElementById('csProgressFill');
        const prevBtn = document.getElementById('csPrevBtn');
        const nextBtn = document.getElementById('csNextBtn');
        
        let activeIndex = -1;
        
        if (totalEl) totalEl.textContent = originalCardsCount.toString().padStart(2, '0');

        const updateCards3D = () => {
            const scrollLeft = csContainer.scrollLeft;
            const containerWidth = csContainer.offsetWidth;
            const scrollCenter = scrollLeft + containerWidth / 2;
            
            let closestDist = Infinity;
            let newActiveIndex = activeIndex;
            
            csCards.forEach((card, index) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distFromCenter = cardCenter - scrollCenter;
                
                if (Math.abs(distFromCenter) < closestDist) {
                    closestDist = Math.abs(distFromCenter);
                    newActiveIndex = index;
                }
            });
            
            // Update UI if active card changed
            if (newActiveIndex !== activeIndex) {
                activeIndex = newActiveIndex;
                const displayIndex = (activeIndex % originalCardsCount) + 1;
                if (currentEl) currentEl.textContent = displayIndex.toString().padStart(2, '0');
                if (progressFill) progressFill.style.width = `${(displayIndex / originalCardsCount) * 100}%`;
            }
        };

        // Smooth Continuous Auto-Scroll Logic
        const scrollAmount = csCards[0].offsetWidth + 32; // card width + gap
        let isPaused = false;
        let animationFrameId;
        const scrollSpeed = 0.8; // Adjust for continuous scroll speed

        const smoothAutoScroll = () => {
            if (!isPaused) {
                csContainer.scrollLeft += scrollSpeed;
                
                // If we've scrolled exactly one original set length, reset seamlessly
                const halfWidth = csTrack.scrollWidth / 2;
                if (csContainer.scrollLeft >= halfWidth) {
                    csContainer.scrollLeft -= halfWidth;
                }
            }
            animationFrameId = requestAnimationFrame(smoothAutoScroll);
        };

        const stopAutoplay = () => isPaused = true;
        const startAutoplay = () => isPaused = false;

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                csContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                csContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }

        // Pause autoplay when user hovers or touches the carousel
        csContainer.addEventListener('mouseenter', stopAutoplay);
        csContainer.addEventListener('mouseleave', startAutoplay);
        csContainer.addEventListener('touchstart', stopAutoplay, { passive: true });
        csContainer.addEventListener('touchend', startAutoplay, { passive: true });

        // Listen for scroll on the container
        csContainer.addEventListener('scroll', updateCards3D, { passive: true });
        
        // Initial setup
        updateCards3D();
        animationFrameId = requestAnimationFrame(smoothAutoScroll);
    }

    // Case Studies 3D Flip Initial Animation
    const flipCards = document.querySelectorAll('.flip-container');
    
    if (flipCards.length > 0) {
        let flipDelay = 0;

        const flipObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Ensure the entire card is clearly visible before starting animation
                if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
                    const card = entry.target;
                    
                    // Hold the white placeholder state for exactly 0.5s before flipping
                    setTimeout(() => {
                        card.classList.add('is-flipped');
                    }, 500 + flipDelay);
                    
                    // Stagger cards that enter viewport at the same time (0.2s stagger)
                    flipDelay += 200;
                    setTimeout(() => { flipDelay = 0; }, 300);
                    
                    // Stop observing once animated
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.8 }); // Card must be 80% visible
        
        flipCards.forEach(card => {
            flipObserver.observe(card);
        });
    }

    // Heading Word-by-Word Reveal Animation
    const animatedHeading = document.getElementById('animatedSolutionsHeading');
    if (animatedHeading) {
        const headingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger animation by adding class
                    animatedHeading.classList.add('is-visible');
                    // Stop observing once animated
                    observer.unobserve(animatedHeading);
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of heading is in view

        headingObserver.observe(animatedHeading);
    }

    // --- Enterprise Bottom Section & Quote Modal Handlers ---
    const quoteModal = document.getElementById('quoteModalBackdrop');
    const openQuoteBtn = document.getElementById('openBottomQuoteBtn');
    const openExpertBtn = document.getElementById('openBottomExpertBtn');
    const closeQuoteBtn = document.getElementById('closeQuoteModal');
    const quoteForm = document.getElementById('freightQuoteForm');
    const quoteFeedback = document.getElementById('quoteFeedback');
    const modePills = document.querySelectorAll('.mode-pill');

    const openModal = (defaultMode = 'ocean') => {
        if (quoteModal) {
            quoteModal.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // Lock scroll when modal is active

            // Reset feedback
            if (quoteFeedback) quoteFeedback.style.display = 'none';

            // Set active mode
            modePills.forEach(pill => {
                const radio = pill.querySelector('input[type="radio"]');
                if (radio && radio.value === defaultMode) {
                    radio.checked = true;
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });
        }
    };

    const closeModal = () => {
        if (quoteModal) {
            quoteModal.classList.remove('is-active');
            document.body.style.overflow = '';
        }
    };

    // Listen for all quote buttons across the page
    const allQuoteButtons = document.querySelectorAll('#openBottomQuoteBtn, .hero-cta .btn-primary, .drawer-btn.btn-primary');
    allQuoteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('ocean');
        });
    });

    if (openExpertBtn) {
        openExpertBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('customs');
        });
    }

    if (closeQuoteBtn) {
        closeQuoteBtn.addEventListener('click', closeModal);
    }

    if (quoteModal) {
        quoteModal.addEventListener('click', (e) => {
            if (e.target === quoteModal) {
                closeModal();
            }
        });
    }

    // Keyboard ESC to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('is-active')) {
            closeModal();
        }
    });

    // Handle Mode Pills Click
    modePills.forEach(pill => {
        pill.addEventListener('click', () => {
            modePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Handle Form Submit
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitQuoteBtn');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span>Routing to Dispatch Desk...</span>';
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    if (quoteFeedback) {
                        quoteFeedback.style.display = 'block';
                    }
                }, 900);
            }
        });
    }
});

