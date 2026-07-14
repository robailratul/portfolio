document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Reveal Observer for triggering entry animations
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Active reveal wrapper children
                const wrappers = entry.target.querySelectorAll('.reveal-wrapper');
                wrappers.forEach(wrap => wrap.classList.add('active'));
                
                // Once animated, we can keep it or let it re-animate. Keeping is cleaner.
                // observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    const sections = document.querySelectorAll('.parallax-section');
    sections.forEach(section => {
        revealObserver.observe(section);
    });

    // Parallax scroll effect
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    const handleParallax = () => {
        const viewportHeight = window.innerHeight;
        
        parallaxLayers.forEach(layer => {
            const rect = layer.getBoundingClientRect();
            const elementTop = rect.top;
            const elementHeight = rect.height;
            
            // Check if element is within viewport range
            if (elementTop < viewportHeight && elementTop + elementHeight > 0) {
                // Calculate scroll progress (0 when just entering bottom, 1 when leaving top)
                const scrollRange = viewportHeight + elementHeight;
                const scrollProgress = (viewportHeight - elementTop) / scrollRange;
                
                // Speed modifier
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
                
                // Calculate translation offset
                const yOffset = (scrollProgress - 0.5) * speed * 150;
                
                layer.style.transform = `translateY(${yOffset}px)`;
            }
        });
    };

    window.addEventListener('scroll', handleParallax);
    // Initial call
    handleParallax();

    // Background Pixel Animation
    const canvas = document.getElementById('pixel-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const pixels = [];
        const maxPixels = 75;
        const colors = [
            'rgba(245, 158, 11, ', // gold/amber
            'rgba(255, 255, 255, ', // white/light
            'rgba(217, 119, 6, '  // dark gold
        ];

        class Pixel {
            constructor() {
                this.reset();
            }

            reset() {
                this.size = Math.floor(Math.random() * 4) + 3; // 3px to 6px
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.alpha = 0;
                this.targetAlpha = Math.random() * 0.45 + 0.15; // Max opacity 0.15 to 0.6
                this.fadeInSpeed = Math.random() * 0.008 + 0.003;
                this.fadeOutSpeed = Math.random() * 0.008 + 0.003;
                this.state = 'fade-in';
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.visibleTicks = Math.random() * 300 + 100;
                this.speedY = -(Math.random() * 0.15 + 0.05); // Slow drift upwards
            }

            update() {
                this.y += this.speedY;

                if (this.state === 'fade-in') {
                    this.alpha += this.fadeInSpeed;
                    if (this.alpha >= this.targetAlpha) {
                        this.alpha = this.targetAlpha;
                        this.state = 'visible';
                    }
                } else if (this.state === 'visible') {
                    this.visibleTicks--;
                    if (this.visibleTicks <= 0) {
                        this.state = 'fade-out';
                    }
                } else if (this.state === 'fade-out') {
                    this.alpha -= this.fadeOutSpeed;
                    if (this.alpha <= 0) {
                        this.reset();
                    }
                }

                // If pixel moves off-screen, reset it
                if (this.y < -10) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = this.color + this.alpha + ')';
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        // Initialize pixels
        for (let i = 0; i < maxPixels; i++) {
            const p = new Pixel();
            p.alpha = Math.random() * p.targetAlpha;
            p.state = Math.random() > 0.5 ? 'visible' : 'fade-in';
            pixels.push(p);
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw subtle background grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 1;
            const gridSize = 80;
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            pixels.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    // Football Carousel Navigation Logic
    const carousel = document.getElementById('football-carousel');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    if (carousel && prevBtn && nextBtn) {
        const carouselImages = carousel.querySelectorAll('img');

        const updateCarouselState = (activeIndex) => {
            dots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.remove('bg-zinc-700');
                    dot.classList.add('bg-gold');
                    if (carouselImages[idx]) {
                        carouselImages[idx].classList.add('active-zoom');
                    }
                } else {
                    dot.classList.remove('bg-gold');
                    dot.classList.add('bg-zinc-700');
                    if (carouselImages[idx]) {
                        carouselImages[idx].classList.remove('active-zoom');
                    }
                }
            });
        };

        const getActiveIndex = () => {
            const width = carousel.clientWidth;
            return Math.round(carousel.scrollLeft / width);
        };

        // Autoplay logic (2.5s interval)
        let autoChangeInterval;
        let scrollTimeout;

        const startAutoPlay = () => {
            stopAutoPlay();
            autoChangeInterval = setInterval(() => {
                const activeIndex = getActiveIndex();
                const nextIndex = (activeIndex + 1) % carouselImages.length;
                const slideWidth = carousel.clientWidth;
                
                carousel.scrollTo({ left: nextIndex * slideWidth, behavior: 'smooth' });
                updateCarouselState(nextIndex);
            }, 2500);
        };

        const stopAutoPlay = () => {
            if (autoChangeInterval) {
                clearInterval(autoChangeInterval);
            }
        };

        // Scroll listener to update active indicators dynamically
        carousel.addEventListener('scroll', () => {
            updateCarouselState(getActiveIndex());
            
            // If user swiped/scrolled manually, temporarily stop autoplay and schedule restart
            stopAutoPlay();
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(startAutoPlay, 3500);
        });

        // Smooth navigation triggers using standard ScrollToOptions API
        prevBtn.addEventListener('click', () => {
            const slideWidth = carousel.clientWidth;
            carousel.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            startAutoPlay(); // Reset timer
        });

        nextBtn.addEventListener('click', () => {
            const slideWidth = carousel.clientWidth;
            carousel.scrollBy({ left: slideWidth, behavior: 'smooth' });
            startAutoPlay(); // Reset timer
        });

        // Indicator dot click triggers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const slideWidth = carousel.clientWidth;
                carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
                updateCarouselState(index);
                startAutoPlay(); // Reset timer
            });
        });

        // Initialize state for the first slide on load and start autoplay
        updateCarouselState(0);
        startAutoPlay();
    }
});
