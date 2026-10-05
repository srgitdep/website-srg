/* ============================
   main.js - SRG Website
   JavaScript Completo Unificado
   Versão: 1.0.0
   ============================ */

// Configuração global
const SRG_CONFIG = {
    debug: false, // Alterar para true para debug
    carouselAutoplayDelay: 5000,
    animationDuration: 300,
    touchThreshold: 50
};

// Logger controlado
function log(message, type = 'info') {
    if (!SRG_CONFIG.debug) return;
    
    const styles = {
        info: 'color: #2196F3; font-weight: bold;',
        success: 'color: #4CAF50; font-weight: bold;',
        warning: 'color: #FF9800; font-weight: bold;',
        error: 'color: #F44336; font-weight: bold;',
        debug: 'color: #9C27B0; font-weight: bold;'
    };
    
    console.log(`%cSRG ${type.toUpperCase()}:`, styles[type], message);
}

// ============================
// 1. MENU MOBILE
// ============================
class MobileMenu {
    constructor() {
        this.toggle = document.getElementById('menuToggle');
        this.menu = document.getElementById('menu');
        this.init();
    }
    
    init() {
        if (!this.toggle || !this.menu) {
            log('Menu mobile não encontrado', 'warning');
            return;
        }
        
        this.toggle.addEventListener('click', () => this.toggleMenu());
        this.bindMenuLinks();
        log('Menu mobile inicializado', 'success');
    }
    
    toggleMenu() {
        const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
        this.toggle.setAttribute('aria-expanded', !expanded);
        this.menu.classList.toggle('show');
        this.toggle.innerHTML = this.menu.classList.contains('show') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    }
    
    bindMenuLinks() {
        document.querySelectorAll('#menu a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }
    
    closeMenu() {
        this.menu.classList.remove('show');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

// ============================
// 2. HERO SLIDER
// ============================
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide-bg');
        this.dots = document.querySelectorAll('.dot-bg');
        this.prevBtn = document.querySelector('.prev-bg');
        this.nextBtn = document.querySelector('.next-bg');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.showSlide(0);
        this.bindEvents();
        this.startAutoPlay();
        log('Hero Slider inicializado', 'success');
    }
    
    showSlide(n) {
        this.slides.forEach((s, i) => s.classList.toggle('active', i === n));
        this.dots.forEach((d, i) => d.classList.toggle('active', i === n));
        this.currentSlide = n;
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(this.currentSlide);
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
                this.showSlide(this.currentSlide);
                this.resetAutoPlay();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoPlay();
            });
        }
        
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.currentSlide = i;
                this.showSlide(i);
                this.resetAutoPlay();
            });
        });
        
        const heroSlider = document.querySelector('.hero-full-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => this.stopAutoPlay());
            heroSlider.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, SRG_CONFIG.carouselAutoplayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// ============================
// 3. BASE CAROUSEL (Classe pai para todos os carrosséis)
// ============================
class BaseCarousel {
    constructor(config) {
        this.carousel = config.carousel;
        this.track = config.track;
        this.slides = config.slides;
        this.prevBtn = config.prevBtn;
        this.nextBtn = config.nextBtn;
        this.dotsContainer = config.dotsContainer;
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.isAnimating = false;
        
        if (this.validateElements()) {
            this.init();
        }
    }
    
    validateElements() {
        return this.carousel && this.track && this.slides.length > 0;
    }
    
    init() {
        this.setupTrack();
        this.setupSlides();
        this.initDots();
        this.bindEvents();
        this.startAutoPlay();
        this.updateCarousel();
        log(`${this.constructor.name} inicializado com ${this.totalSlides} slides`, 'success');
    }
    
    setupTrack() {
        this.track.style.width = `${this.totalSlides * 100}%`;
        this.track.style.display = 'flex';
    }
    
    setupSlides() {
        this.slides.forEach(slide => {
            slide.style.width = `${100 / this.totalSlides}%`;
            slide.style.flexShrink = '0';
        });
    }
    
    initDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            dot.dataset.slide = i;
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                if (!this.isAnimating) {
                    this.goToSlide(i);
                }
            });
            
            this.dotsContainer.appendChild(dot);
        }
        
        this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    }
    
    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                if (!this.isAnimating) this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                if (!this.isAnimating) this.nextSlide();
            });
        }
        
        if (this.carousel) {
            this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        this.initTouchEvents();
        
        // Teclado (setas esquerda/direita)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
    }
    
    initTouchEvents() {
        if (!this.track) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoPlay();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            const offset = this.currentSlide * 100 + (diff / this.track.offsetWidth) * 100;
            this.track.style.transform = `translateX(-${offset}%)`;
            this.track.style.transition = 'none';
        }, { passive: true });
        
        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const diff = startX - currentX;
            if (Math.abs(diff) > SRG_CONFIG.touchThreshold) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            } else {
                this.updateCarousel();
            }
            
            setTimeout(() => this.startAutoPlay(), 3000);
        });
    }
    
    updateCarousel() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const offset = this.currentSlide * 100;
        
        this.track.style.transform = `translateX(-${offset}%)`;
        this.track.style.transition = `transform ${SRG_CONFIG.animationDuration}ms ease`;
        
        this.updateDots();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, SRG_CONFIG.animationDuration);
    }
    
    updateDots() {
        if (!this.dots) return;
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
            dot.setAttribute('aria-current', index === this.currentSlide ? 'true' : 'false');
        });
    }
    
    goToSlide(slideIndex) {
        slideIndex = (slideIndex + this.totalSlides) % this.totalSlides;
        this.currentSlide = slideIndex;
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, SRG_CONFIG.carouselAutoplayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    destroy() {
        this.stopAutoPlay();
    }
}

// ============================
// 4. CARROSSEL DE LOGÍSTICA
// ============================
class LogisticsCarousel extends BaseCarousel {
    constructor() {
        super({
            carousel: document.querySelector('.logistics-carousel-modern'),
            track: document.getElementById('carouselTrack'),
            slides: document.querySelectorAll('.carousel-slide'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            dotsContainer: document.querySelector('.logistics-dots') || this.createDotsContainer()
        });
        
        this.progressBar = document.querySelector('.progress-bar');
        this.currentSlideSpan = document.querySelector('.current-slide');
        this.totalSlidesSpan = document.querySelector('.total-slides');
        
        this.initProgressBar();
        this.updateCounter();
    }
    
    createDotsContainer() {
        const dots = document.createElement('div');
        dots.className = 'logistics-dots';
        dots.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 10;
        `;
        this.carousel.appendChild(dots);
        return dots;
    }
    
    initProgressBar() {
        if (this.progressBar) {
            this.progressBar.style.animation = 'progressFill 5s linear infinite';
        }
    }
    
    updateCounter() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide + 1;
        }
        
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
    }
    
    updateCarousel() {
        super.updateCarousel();
        this.updateCounter();
    }
}

// ============================
// 5. CARROSSEL DE MARKETING
// ============================
class MarketingCarousel extends BaseCarousel {
    constructor() {
        super({
            carousel: document.getElementById('marketingCarousel'),
            track: document.getElementById('marketingTrack'),
            slides: document.querySelectorAll('.marketing-slide'),
            prevBtn: document.getElementById('marketingPrevBtn'),
            nextBtn: document.getElementById('marketingNextBtn'),
            dotsContainer: document.getElementById('marketingDots')
        });
    }
}

// ============================
// 6. CARROSSEL DE SEGURANÇA
// ============================
class SecurityCarousel extends BaseCarousel {
    constructor() {
        super({
            carousel: document.getElementById('securityMaintenanceCarousel'),
            track: document.getElementById('securityMaintenanceTrack'),
            slides: document.querySelectorAll('.security-maintenance-slide'),
            prevBtn: document.querySelector('.security-maintenance-prev'),
            nextBtn: document.querySelector('.security-maintenance-next'),
            dotsContainer: document.querySelector('.security-maintenance-dots')
        });
    }
}

// ============================
// 7. SERVICE CARDS 3D
// ============================
class ServiceCards3D {
    constructor() {
        this.cards = document.querySelectorAll('.service-card-3d');
        
        if (this.cards.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.cards.forEach(card => {
            this.addHoverEffects(card);
            this.addGlowEffects(card);
        });
        
        log(`Service Cards 3D inicializados: ${this.cards.length} cards`, 'success');
    }
    
    addHoverEffects(card) {
        card.addEventListener('mousemove', (e) => {
            if (!card.matches(':hover')) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 10;
            const rotateX = ((centerY - y) / centerY) * 10;
            
            card.querySelector('.card-3d-wrapper').style.transform = 
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('.card-3d-wrapper').style.transform = 
                'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }
    
    addGlowEffects(card) {
        const borderGlow = card.querySelector('.card-3d-border-glow');
        if (borderGlow) {
            setInterval(() => {
                if (card.matches(':hover')) {
                    borderGlow.style.animationDuration = `${2 + Math.random()}s`;
                }
            }, 2000);
        }
    }
}

// ============================
// 8. DATA PROTECTION ANIMATIONS
// ============================
class DataProtectionAnimations {
    constructor() {
        this.protectionSection = document.querySelector('.complete-protection-section');
        
        if (this.protectionSection) {
            this.init();
        }
    }
    
    init() {
        this.animateTitleWords();
        this.animateStatistics();
        this.addNodeInteractions();
        this.animateFloatingElements();
        this.animateConnectionLines();
        log('Animações de proteção de dados inicializadas', 'success');
    }
    
    animateTitleWords() {
        const titleWords = document.querySelectorAll('.title-word');
        
        titleWords.forEach((word, index) => {
            const originalText = word.textContent;
            word.textContent = '';
            
            setTimeout(() => {
                let charIndex = 0;
                const typeWriter = setInterval(() => {
                    if (charIndex < originalText.length) {
                        word.textContent += originalText.charAt(charIndex);
                        charIndex++;
                    } else {
                        clearInterval(typeWriter);
                        this.addContinuousGlow(word);
                    }
                }, 100);
            }, index * 500);
        });
    }
    
    addContinuousGlow(element) {
        setInterval(() => {
            const currentOpacity = parseFloat(getComputedStyle(element).opacity);
            element.style.opacity = currentOpacity === 1 ? '0.8' : '1';
            element.style.transition = 'opacity 2s ease';
        }, 2000);
    }
    
    animateStatistics() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(this.protectionSection);
    }
    
    startCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-count'));
            const suffix = stat.textContent.replace(/[0-9.]/g, '') || '';
            let current = 0;
            const increment = target / 30;
            const duration = 1500;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                let displayNumber;
                if (stat.textContent.includes('/')) {
                    displayNumber = `${Math.floor(current)}${suffix}`;
                } else if (suffix === '%') {
                    displayNumber = `${current.toFixed(1)}${suffix}`;
                } else {
                    displayNumber = `${Math.floor(current)}${suffix}`;
                }
                
                stat.textContent = displayNumber;
            }, duration / 30);
        });
    }
    
    addNodeInteractions() {
        const dataNodes = document.querySelectorAll('.data-node');
        
        dataNodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                node.style.transform = 'scale(1.3) rotate(15deg)';
                node.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                node.style.zIndex = '10';
                
                const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                node.style.backgroundColor = randomColor;
                node.style.color = 'white';
            });
            
            node.addEventListener('mouseleave', () => {
                node.style.transform = '';
                node.style.boxShadow = '';
                node.style.zIndex = '';
                node.style.backgroundColor = '';
                node.style.color = '';
            });
            
            node.addEventListener('click', (e) => {
                node.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    node.style.transform = '';
                }, 150);
                
                this.createParticles(e.target);
            });
        });
    }
    
    createParticles(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.backgroundColor = getComputedStyle(element).backgroundColor || '#2196F3';
            particle.style.borderRadius = '50%';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            document.body.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            const duration = 800 + Math.random() * 400;
            
            const animation = particle.animate([
                {
                    transform: `translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)'
            });
            
            animation.onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }
    
    animateFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            const duration = 6 + Math.random() * 4;
            const delay = Math.random() * 2;
            
            element.style.animationDuration = `${duration}s`;
            element.style.animationDelay = `${delay}s`;
            element.style.animationTimingFunction = 'ease-in-out';
            
            setInterval(() => {
                const opacity = 0.5 + Math.random() * 0.5;
                element.style.opacity = opacity.toString();
            }, 2000 + Math.random() * 3000);
        });
    }
    
    animateConnectionLines() {
        const connectionLines = document.querySelectorAll('.connection-lines .line');
        connectionLines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.2}s`;
            line.style.animationDuration = `${3 + Math.random() * 2}s`;
        });
    }
}

// ============================
// 9. PROCUREMENT ANIMATIONS
// ============================
class ProcurementAnimations {
    constructor() {
        this.container = document.querySelector('.procurement-section');
        if (!this.container) return;
        
        this.particleCount = 100;
        this.iconCount = 30;
        this.lineCount = 20;
        this.isAnimating = false;
        this.animationFrame = null;
        
        this.icons = [
            '📦', '🚢', '✈️', '🚚', '📊', '💰', '📝', '📈', 
            '🌐', '🔗', '📁', '📋', '📫', '📍', '🔍', '🤝',
            '⚖️', '📅', '🎯', '📌', '🔐', '📱', '💼', '🏭'
        ];
        
        this.colors = [
            'rgba(255, 212, 0, 0.3)',
            'rgba(33, 150, 243, 0.3)',
            'rgba(76, 175, 80, 0.3)',
            'rgba(156, 39, 176, 0.3)',
            'rgba(255, 152, 0, 0.3)'
        ];
        
        this.init();
    }
    
    init() {
        this.createAnimatedBackground();
        this.createParticles();
        this.createLogisticsIcons();
        this.createSupplyChainLines();
        this.createInteractiveRoutes();
        this.createContainers();
        this.createCurrencyFlow();
        this.createNetwork();
        this.bindEvents();
        
        this.startAnimations();
        log('Animações de Procurement inicializadas', 'success');
    }
    
    createAnimatedBackground() {
        const gradient = document.createElement('div');
        gradient.className = 'animated-gradient';
        this.container.appendChild(gradient);
        
        const grid = document.createElement('div');
        grid.className = 'animated-grid';
        this.container.appendChild(grid);
    }
    
    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'procurement-particles';
        this.container.appendChild(particlesContainer);
        
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'procurement-particle';
            
            const size = Math.random() * 10 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            
            const delay = Math.random() * 15;
            const duration = 15 + Math.random() * 10;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    createLogisticsIcons() {
        const iconsContainer = document.createElement('div');
        iconsContainer.className = 'logistics-icons-container';
        this.container.appendChild(iconsContainer);
        
        for (let i = 0; i < this.iconCount; i++) {
            const icon = document.createElement('div');
            icon.className = 'logistics-icon';
            icon.textContent = this.icons[Math.floor(Math.random() * this.icons.length)];
            
            icon.style.left = `${Math.random() * 100}%`;
            icon.style.top = `${Math.random() * 100}%`;
            
            const size = 16 + Math.random() * 32;
            icon.style.fontSize = `${size}px`;
            
            const delay = Math.random() * 20;
            const duration = 20 + Math.random() * 15;
            icon.style.animationDelay = `${delay}s`;
            icon.style.animationDuration = `${duration}s`;
            
            const glow = document.createElement('div');
            glow.className = 'icon-glow';
            icon.appendChild(glow);
            
            iconsContainer.appendChild(icon);
        }
    }
    
    createSupplyChainLines() {
        const linesContainer = document.createElement('div');
        linesContainer.className = 'supply-chain-lines';
        this.container.appendChild(linesContainer);
        
        for (let i = 0; i < this.lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'supply-chain-line';
            
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const width = 200 + Math.random() * 300;
            const angle = Math.random() * 360;
            
            line.style.width = `${width}px`;
            line.style.left = `${left}%`;
            line.style.top = `${top}%`;
            line.style.transform = `rotate(${angle}deg)`;
            
            const delay = Math.random() * 8;
            const duration = 6 + Math.random() * 4;
            line.style.animationDelay = `${delay}s`;
            line.style.animationDuration = `${duration}s`;
            
            linesContainer.appendChild(line);
        }
    }
    
    createInteractiveRoutes() {
        const routesContainer = document.createElement('div');
        routesContainer.className = 'interactive-routes';
        this.container.appendChild(routesContainer);
        
        for (let i = 0; i < 8; i++) {
            const route = document.createElement('div');
            route.className = 'interactive-route';
            
            const size = 50 + Math.random() * 150;
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            route.style.width = `${size}px`;
            route.style.height = `${size}px`;
            route.style.top = `${top}%`;
            route.style.left = `${left}%`;
            route.style.animationDelay = `${Math.random() * 4}s`;
            route.style.animationDuration = `${3 + Math.random() * 3}s`;
            
            routesContainer.appendChild(route);
        }
    }
    
    createContainers() {
        const containers = document.createElement('div');
        containers.className = 'procurement-containers';
        this.container.appendChild(containers);
        
        for (let i = 0; i < 15; i++) {
            const container = document.createElement('div');
            container.className = 'container-element';
            
            const top = Math.random() * 100;
            container.style.top = `${top}%`;
            container.style.animationDelay = `${Math.random() * 30}s`;
            container.style.animationDuration = `${20 + Math.random() * 20}s`;
            
            const icon = document.createElement('div');
            icon.textContent = '📦';
            icon.style.position = 'absolute';
            icon.style.top = '50%';
            icon.style.left = '50%';
            icon.style.transform = 'translate(-50%, -50%)';
            icon.style.fontSize = '16px';
            
            container.appendChild(icon);
            containers.appendChild(container);
        }
        
        for (let i = 0; i < 5; i++) {
            const ship = document.createElement('div');
            ship.className = 'cargo-ship';
            ship.textContent = '🚢';
            ship.style.top = `${20 + Math.random() * 60}%`;
            ship.style.animationDelay = `${Math.random() * 40}s`;
            ship.style.animationDuration = `${30 + Math.random() * 20}s`;
            this.container.appendChild(ship);
        }
        
        for (let i = 0; i < 3; i++) {
            const plane = document.createElement('div');
            plane.className = 'cargo-plane';
            plane.textContent = '✈️';
            plane.style.top = `${Math.random() * 50}%`;
            plane.style.animationDelay = `${Math.random() * 25}s`;
            plane.style.animationDuration = `${20 + Math.random() * 10}s`;
            this.container.appendChild(plane);
        }
    }
    
    createCurrencyFlow() {
        const currencyContainer = document.createElement('div');
        currencyContainer.className = 'currency-flow-container';
        this.container.appendChild(currencyContainer);
        
        for (let i = 0; i < 25; i++) {
            const currency = document.createElement('div');
            currency.className = 'currency-flow';
            currency.textContent = Math.random() > 0.5 ? '💰' : '💵';
            currency.style.left = `${Math.random() * 100}%`;
            currency.style.top = `${Math.random() * 100}%`;
            currency.style.animationDelay = `${Math.random() * 12}s`;
            currency.style.animationDuration = `${8 + Math.random() * 8}s`;
            
            const size = 16 + Math.random() * 24;
            currency.style.fontSize = `${size}px`;
            
            currencyContainer.appendChild(currency);
        }
        
        for (let i = 0; i < 10; i++) {
            const doc = document.createElement('div');
            doc.className = 'floating-document';
            doc.textContent = Math.random() > 0.5 ? '📄' : '📋';
            doc.style.left = `${Math.random() * 100}%`;
            doc.style.top = `${Math.random() * 100}%`;
            doc.style.animationDelay = `${Math.random() * 18}s`;
            doc.style.animationDuration = `${12 + Math.random() * 12}s`;
            this.container.appendChild(doc);
        }
    }
    
    createNetwork() {
        const networkContainer = document.createElement('div');
        networkContainer.className = 'procurement-network';
        this.container.appendChild(networkContainer);
        
        const nodes = [];
        for (let i = 0; i < 50; i++) {
            const node = document.createElement('div');
            node.className = 'network-node';
            
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            node.style.left = `${left}%`;
            node.style.top = `${top}%`;
            node.style.animationDelay = `${Math.random() * 2}s`;
            
            nodes.push({ element: node, x: left, y: top });
            networkContainer.appendChild(node);
        }
        
        setTimeout(() => {
            this.createNetworkConnections(nodes);
        }, 1000);
    }
    
    createNetworkConnections(nodes) {
        const connectionsContainer = document.createElement('div');
        connectionsContainer.className = 'network-connections';
        this.container.appendChild(connectionsContainer);
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    const line = document.createElement('div');
                    line.className = 'connection-line';
                    
                    const length = distance * 0.8;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    line.style.width = `${length}%`;
                    line.style.left = `${Math.min(nodeA.x, nodeB.x) + distance * 0.1}%`;
                    line.style.top = `${Math.min(nodeA.y, nodeB.y) + Math.abs(dy) / 2}%`;
                    line.style.transform = `rotate(${angle}deg)`;
                    line.style.opacity = `${0.1 + Math.random() * 0.2}`;
                    line.style.animationDelay = `${Math.random() * 4}s`;
                    line.style.animationDuration = `${3 + Math.random() * 3}s`;
                    
                    connectionsContainer.appendChild(line);
                }
            }
        }
    }
    
    bindEvents() {
        this.container.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleMouseMove(e) {
        if (!this.isAnimating) return;
        
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const particles = this.container.querySelectorAll('.procurement-particle');
        particles.forEach(particle => {
            const particleRect = particle.getBoundingClientRect();
            const px = particleRect.left - rect.left + particleRect.width / 2;
            const py = particleRect.top - rect.top + particleRect.height / 2;
            
            const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
            
            if (distance < 100) {
                const force = 100 - distance;
                const angle = Math.atan2(py - y, px - x);
                
                const dx = Math.cos(angle) * force * 0.1;
                const dy = Math.sin(angle) * force * 0.1;
                
                particle.style.transform = `translate(${dx}px, ${dy}px)`;
                particle.style.boxShadow = `0 0 ${force * 0.2}px rgba(255, 212, 0, 0.5)`;
            }
        });
    }
    
    handleResize() {
        const lines = this.container.querySelectorAll('.supply-chain-line');
        lines.forEach(line => {
            line.style.animation = 'none';
            void line.offsetWidth;
            line.style.animation = '';
        });
    }
    
    startAnimations() {
        this.isAnimating = true;
        
        const elements = this.container.querySelectorAll('.procurement-particle, .logistics-icon, .supply-chain-line');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.transition = 'opacity 1s ease';
                el.style.opacity = '';
            }, index * 10);
        });
    }
    
    pauseAnimations() {
        const elements = this.container.querySelectorAll('*[style*="animation"]');
        elements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
        
        this.isAnimating = false;
    }
    
    resumeAnimations() {
        const elements = this.container.querySelectorAll('*[style*="animation"]');
        elements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
        
        this.isAnimating = true;
    }
    
    enhanceCards() {
        const cards = this.container.querySelectorAll('.procurement-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createCardParticles(card);
                card.style.boxShadow = '0 0 30px rgba(255, 212, 0, 0.3)';
                card.style.transition = 'box-shadow 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
            });
        });
    }
    
    createCardParticles(card) {
        const rect = card.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'procurement-particle';
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = 'rgba(255, 212, 0, 0.6)';
            particle.style.borderRadius = '50%';
            
            const offsetX = (Math.random() - 0.5) * rect.width;
            const offsetY = (Math.random() - 0.5) * rect.height;
            
            particle.style.left = `${rect.left - containerRect.left + offsetX}px`;
            particle.style.top = `${rect.top - containerRect.top + offsetY}px`;
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
            
            this.container.appendChild(particle);
        }
    }
    
    destroy() {
        this.pauseAnimations();
        const animatedElements = this.container.querySelectorAll('.animated-gradient, .animated-grid, .procurement-particles, .logistics-icons-container, .supply-chain-lines, .interactive-routes, .procurement-containers, .currency-flow-container, .procurement-network, .network-connections');
        animatedElements.forEach(el => el.remove());
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// ============================
// 10. SMOOTH SCROLL
// ============================
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                this.scrollToTarget(href);
            });
        });
        
        log('Scroll suave inicializado', 'success');
    }
    
    scrollToTarget(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const headerHeight = document.querySelector('.fixed-header')?.offsetHeight || 80;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            this.closeMobileMenu();
        }
    }
    
    closeMobileMenu() {
        const menu = document.getElementById('menu');
        const toggle = document.getElementById('menuToggle');
        
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
}

// ============================
// 11. FAQ TOGGLE
// ============================
class FAQToggle {
    constructor() {
        this.init();
    }
    
    init() {
        const faqItems = document.querySelectorAll('.faq-item h3');
        
        if (faqItems.length > 0) {
            faqItems.forEach(item => {
                item.addEventListener('click', () => {
                    const parent = item.parentElement;
                    parent.classList.toggle('faq-active');
                    
                    // Fechar outros FAQs abertos
                    document.querySelectorAll('.faq-item').forEach(otherItem => {
                        if (otherItem !== parent && otherItem.classList.contains('faq-active')) {
                            otherItem.classList.remove('faq-active');
                        }
                    });
                });
            });
            
            log('FAQ Toggle inicializado', 'success');
        }
    }
}

// ============================
// 12. PERFORMANCE OPTIMIZATIONS
// ============================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.pauseAnimationsWhenHidden();
        this.lazyLoadImages();
        this.optimizeAnimations();
        log('Otimizações de performance inicializadas', 'success');
    }
    
    pauseAnimationsWhenHidden() {
        const sections = document.querySelectorAll('[data-animate-section]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const animations = entry.target.querySelectorAll('*[style*="animation"]');
                animations.forEach(el => {
                    el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => observer.observe(section));
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    optimizeAnimations() {
        // Reduzir animações em dispositivos móveis
        if (window.innerWidth < 768) {
            document.documentElement.style.setProperty('--animation-duration', '0.5s');
        }
    }
}

// ============================
// 13. UTILITY FUNCTIONS
// ============================
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

window.throttle = function(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================
// 14. MAIN SRG WEBSITE CLASS
// ============================
class SRGWebsite {
    constructor() {
        this.components = {};
        this.init();
    }
    
    init() {
        log('🚀 Inicializando SRG Website...', 'info');
        
        // Inicializar AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100,
                disable: window.innerWidth < 768
            });
            log('AOS inicializado', 'success');
        }
        
        // Inicializar componentes básicos
        this.components.mobileMenu = new MobileMenu();
        this.components.heroSlider = new HeroSlider();
        this.components.serviceCards = new ServiceCards3D();
        this.components.smoothScroll = new SmoothScroll();
        this.components.faqToggle = new FAQToggle();
        this.components.performance = new PerformanceOptimizer();
        
        // Inicializar componentes condicionais
        this.initConditionalComponents();
        
        // Configurações finais
        this.setCurrentYear();
        this.setupErrorHandling();
        
        log('✅ SRG Website inicializado com sucesso!', 'success');
        
        // Adicionar ao objeto window para acesso global
        window.SRG = this;
    }
    
    initConditionalComponents() {
        // Data Protection Animations
        try {
            this.components.dataProtection = new DataProtectionAnimations();
        } catch (error) {
            log('Data Protection não inicializado: ' + error.message, 'warning');
        }
        
        // Procurement Animations
        try {
            this.components.procurementAnimations = new ProcurementAnimations();
            setTimeout(() => {
                if (this.components.procurementAnimations.container) {
                    this.components.procurementAnimations.enhanceCards();
                }
            }, 2000);
        } catch (error) {
            log('Procurement Animations não inicializado: ' + error.message, 'warning');
        }
        
        // Carrosséis
        try {
            this.components.logisticsCarousel = new LogisticsCarousel();
        } catch (error) {
            log('Carrossel de logística não inicializado: ' + error.message, 'warning');
        }
        
        try {
            this.components.marketingCarousel = new MarketingCarousel();
        } catch (error) {
            log('Carrossel de marketing não inicializado: ' + error.message, 'warning');
        }
        
        try {
            this.components.securityCarousel = new SecurityCarousel();
        } catch (error) {
            log('Carrossel de segurança não inicializado: ' + error.message, 'warning');
        }
    }
    
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            log(e.error?.message || e.message, 'error');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            log(e.reason?.message || 'Promise rejeitada', 'error');
        });
    }
    
    debug() {
        console.log('=== SRG Website Debug ===');
        console.log('Componentes carregados:', Object.keys(this.components));
        
        Object.entries(this.components).forEach(([name, component]) => {
            console.log(`${name}:`, component?.constructor?.name || typeof component);
        });
    }
    
    // Método para recarregar componentes específicos
    reloadComponent(componentName) {
        const componentMap = {
            'logisticsCarousel': LogisticsCarousel,
            'marketingCarousel': MarketingCarousel,
            'securityCarousel': SecurityCarousel,
            'procurementAnimations': ProcurementAnimations
        };
        
        if (componentMap[componentName]) {
            try {
                if (this.components[componentName]?.destroy) {
                    this.components[componentName].destroy();
                }
                this.components[componentName] = new componentMap[componentName]();
                log(`Componente ${componentName} recarregado`, 'success');
            } catch (error) {
                log(`Erro ao recarregar ${componentName}: ${error.message}`, 'error');
            }
        }
    }
}

// ============================
// 15. INICIALIZAÇÃO
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar dependências
    if (!window.AOS) {
        console.warn('AOS não carregado. Carregue a biblioteca AOS para animações de scroll.');
    }
    
    // Inicializar website
    const srgWebsite = new SRGWebsite();
    
    // Adicionar shortcuts para debug
    if (SRG_CONFIG.debug) {
        console.log('SRG disponível globalmente como window.SRG');
        console.log('Comandos disponíveis:');
        console.log('- SRG.debug() - Ver informações dos componentes');
        console.log('- SRG.reloadComponent("nome") - Recarregar componente');
    }
});

// ============================
// 16. CSS DINÂMICO (para correções)
// ============================
function addDynamicCSS() {
    if (!document.getElementById('srg-dynamic-css')) {
        const style = document.createElement('style');
        style.id = 'srg-dynamic-css';
        style.textContent = `
            /* Progress bar animation */
            @keyframes progressFill {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            
            /* Smooth transitions */
            .service-card-3d,
            .procurement-card,
            .package-card-modern {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                .security-maintenance-slide {
                    height: 300px !important;
                }
                
                .carousel-button {
                    width: 40px !important;
                    height: 40px !important;
                    font-size: 18px !important;
                }
                
                .procurement-particles,
                .logistics-icons-container {
                    display: none !important;
                }
            }
            
            /* Print styles */
            @media print {
                .hero-full-slider,
                .whatsapp-float,
                .menu-toggle {
                    display: none !important;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .service-card-3d {
                    border: 2px solid #000 !important;
                }
                
                .carousel-dot.active {
                    border: 2px solid #000 !important;
                }
            }
        `;
        document.head.appendChild(style);
        log('CSS dinâmico adicionado', 'success');
    }
}

// Adicionar CSS dinâmico após o DOM carregar
document.addEventListener('DOMContentLoaded', addDynamicCSS);

// ============================
// 17. POLYFILLS PARA COMPATIBILIDADE
// ============================
// Polyfill para Element.matches
if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            const matches = (this.document || this.ownerDocument).querySelectorAll(s);
            let i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// Polyfill para NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

// Polyfill para requestAnimationFrame
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
}

log('Polyfills carregados', 'info');


// ============================
// 15. VIDEO PLAYER CONTROLS
// ============================
class MarketingVideoPlayer {
    constructor() {
        this.video = document.getElementById('marketingVideo');
        this.playPauseBtn = document.querySelector('.play-pause');
        this.muteBtn = document.querySelector('.mute-unmute');
        this.fullscreenBtn = document.querySelector('.fullscreen');
        this.progressBar = document.querySelector('.video-progress .progress-bar');
        this.progressContainer = document.querySelector('.video-progress');
        this.videoWrapper = document.querySelector('.video-wrapper');
        
        if (this.video) {
            this.init();
        }
    }
    
    init() {
        this.bindEvents();
        this.setupProgressUpdate();
        this.setupVideoFallback();
        log('Player de vídeo inicializado', 'success');
    }
    
    bindEvents() {
        // Play/Pause
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // Mute/Unmute
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // Fullscreen
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Progress bar click
        if (this.progressContainer) {
            this.progressContainer.addEventListener('click', (e) => this.seek(e));
        }
        
        // Video events
        this.video.addEventListener('play', () => this.updatePlayPauseIcon());
        this.video.addEventListener('pause', () => this.updatePlayPauseIcon());
        this.video.addEventListener('volumechange', () => this.updateMuteIcon());
        this.video.addEventListener('loadedmetadata', () => this.setupProgressUpdate());
        
        // Remove overlay on first play
        this.video.addEventListener('play', () => {
            if (this.videoWrapper) {
                this.videoWrapper.classList.add('playing');
            }
        }, { once: true });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target === this.video || e.target === document.body) {
                switch(e.key.toLowerCase()) {
                    case ' ':
                    case 'k':
                        e.preventDefault();
                        this.togglePlay();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleMute();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                    case 'arrowleft':
                        e.preventDefault();
                        this.skip(-5);
                        break;
                    case 'arrowright':
                        e.preventDefault();
                        this.skip(5);
                        break;
                }
            }
        });
    }
    
    togglePlay() {
        if (this.video.paused || this.video.ended) {
            this.video.play().catch(error => {
                console.error('Erro ao reproduzir vídeo:', error);
                this.showError();
            });
        } else {
            this.video.pause();
        }
    }
    
    toggleMute() {
        this.video.muted = !this.video.muted;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.videoWrapper.requestFullscreen) {
                this.videoWrapper.requestFullscreen();
            } else if (this.videoWrapper.webkitRequestFullscreen) {
                this.videoWrapper.webkitRequestFullscreen();
            } else if (this.videoWrapper.msRequestFullscreen) {
                this.videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    updatePlayPauseIcon() {
        if (!this.playPauseBtn) return;
        
        const icon = this.playPauseBtn.querySelector('i');
        if (this.video.paused || this.video.ended) {
            icon.className = 'fas fa-play';
            this.playPauseBtn.setAttribute('aria-label', 'Play');
        } else {
            icon.className = 'fas fa-pause';
            this.playPauseBtn.setAttribute('aria-label', 'Pause');
        }
    }
    
    updateMuteIcon() {
        if (!this.muteBtn) return;
        
        const icon = this.muteBtn.querySelector('i');
        if (this.video.muted || this.video.volume === 0) {
            icon.className = 'fas fa-volume-mute';
            this.muteBtn.setAttribute('aria-label', 'Desmutar');
        } else {
            icon.className = 'fas fa-volume-up';
            this.muteBtn.setAttribute('aria-label', 'Mutar');
        }
    }
    
    setupProgressUpdate() {
        if (!this.progressBar) return;
        
        const updateProgress = () => {
            const percentage = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.style.width = `${percentage}%`;
        };
        
        this.video.addEventListener('timeupdate', updateProgress);
    }
    
    seek(e) {
        if (!this.progressContainer || !this.progressBar) return;
        
        const rect = this.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        
        this.video.currentTime = pos * this.video.duration;
        this.progressBar.style.width = `${pos * 100}%`;
    }
    
    skip(seconds) {
        this.video.currentTime += seconds;
    }
    
    setupVideoFallback() {
        // Adiciona indicador de carregamento
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'video-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Carregando vídeo...</p>
        `;
        this.video.parentNode.insertBefore(loadingDiv, this.video);
        
        // Remove indicador quando o vídeo carrega
        this.video.addEventListener('canplay', () => {
            loadingDiv.style.opacity = '0';
            setTimeout(() => loadingDiv.remove(), 300);
        });
        
        // Verifica erros no vídeo
        this.video.addEventListener('error', () => {
            this.showError();
        });
    }
    
    showError() {
        // Remove loading indicator if exists
        const loading = document.querySelector('.video-loading');
        if (loading) loading.remove();
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'video-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro ao carregar vídeo</h3>
            <p>O vídeo não pôde ser carregado. Por favor, tente recarregar a página.</p>
        `;
        this.video.parentNode.insertBefore(errorDiv, this.video);
    }
    
    destroy() {
        // Cleanup event listeners
        this.video.pause();
        this.video.src = '';
        this.video.load();
    }
}

// Canvas do efeito de rede no footer
const canvas = document.getElementById('networkCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 40;

    function init() {
        width = window.innerWidth;
        height = document.querySelector('.dynamic-footer').offsetHeight;
        canvas.width = width;
        canvas.height = height;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 4 + 3
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        // Desenhar conexões
        ctx.strokeStyle = '#FFD400';
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.25;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Desenhar partículas
        particles.forEach(p => {
            ctx.shadowColor = '#FFD400';
            ctx.shadowBlur = 15;
            
            ctx.fillStyle = '#FFD400';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Centro mais brilhante
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Resetar sombra
        ctx.shadowBlur = 0;

        // Mover partículas
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });

        requestAnimationFrame(draw);
    }

    init();
    draw();

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = document.querySelector('.dynamic-footer').offsetHeight;
        canvas.width = width;
        canvas.height = height;
    });
}