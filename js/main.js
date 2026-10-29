/**
 * Bloque Funcional - Main JavaScript
 * Scroll suave nativo + Menú hamburguesa mobile + WhatsApp de ejemplo
 * Sin dependencias externas
 */

(function() {
    'use strict';

    // ========================================
    // Utilidades
    // ========================================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    // ========================================
    // Scroll suave para enlaces internos
    // ========================================
    function initSmoothScroll() {
        // Los navegadores modernos soportan scroll-behavior: smooth en CSS
        // Este polyfill es para navegadores antiguos y para control preciso
        
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Ignorar enlaces que son solo "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                // Calcular offset del header fijo
                const header = $('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú mobile si está abierto
                closeMobileMenu();
                
                // Actualizar URL sin recargar
                history.pushState(null, '', href);
                
                // Focus para accesibilidad
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    // ========================================
    // Menú Hamburguesa Mobile
    // ========================================
    let mobileMenuOpen = false;
    let lastFocusedElement = null;

    function initMobileMenu() {
        const toggle = $('.nav__toggle');
        const menu = $('.nav__menu');
        const overlay = $('.nav__overlay');
        const links = $$('.nav__link', menu);
        const cta = $('.nav__cta', menu);

        if (!toggle || !menu) return;

        // Crear overlay si no existe
        let overlayEl = overlay;
        if (!overlayEl) {
            overlayEl = document.createElement('div');
            overlayEl.className = 'nav__overlay';
            document.body.appendChild(overlayEl);
        }

        function openMenu() {
            mobileMenuOpen = true;
            toggle.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
            overlayEl.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            
            // Guardar elemento enfocado anteriormente
            lastFocusedElement = document.activeElement;
            
            // Focus trap: enfocar primer enlace
            setTimeout(() => {
                const firstFocusable = menu.querySelector('a, button');
                if (firstFocusable) firstFocusable.focus();
            }, 100);
            
            // Prevenir scroll en body
            document.addEventListener('keydown', handleKeyDown);
        }

        function closeMenu() {
            mobileMenuOpen = false;
            toggle.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
            overlayEl.classList.remove('is-visible');
            document.body.style.overflow = '';
            
            // Restaurar foco al botón toggle
            toggle.focus();
            
            document.removeEventListener('keydown', handleKeyDown);
        }

        function toggleMenu() {
            if (mobileMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        function handleKeyDown(e) {
            // Escape para cerrar
            if (e.key === 'Escape') {
                closeMenu();
                return;
            }

            // Focus trap: Tab cycling dentro del menú
            if (e.key === 'Tab') {
                const focusableElements = menu.querySelectorAll(
                    'a[href], button, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        // Event listeners
        toggle.addEventListener('click', toggleMenu);
        overlayEl.addEventListener('click', closeMenu);

        // Botón de cerrar (X) dentro del menú
        const closeBtn = $('.nav__close', menu);
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        // Cerrar al hacer click en enlaces del menú
        [...links, cta].forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar al redimensionar a desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 767 && mobileMenuOpen) {
                    closeMenu();
                }
            }, 100);
        });

    }

    // ========================================
    // Header scroll effect (opcional)
    // ========================================
    function initHeaderScroll() {
        const header = $('.header');
        if (!header) return;

        let lastScroll = 0;
        const threshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > threshold) {
                header.style.backgroundColor = 'rgba(11, 20, 38, 0.98)';
                header.style.borderBottomColor = 'var(--color-border-light)';
            } else {
                header.style.backgroundColor = 'rgba(11, 20, 38, 0.95)';
                header.style.borderBottomColor = 'var(--color-border)';
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ========================================
    // Intersection Observer para animaciones sutiles
    // ========================================
    function initScrollAnimations() {
        // Respetar prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elementos a animar
        $$('.section__header, .class-card, .benefit-card, .testimonial-card, .about__content, .about__image, .location__info, .location__map').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Clase para activar animación
        const style = document.createElement('style');
        style.textContent = `
            .is-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // WhatsApp de ejemplo (demo): muestra el mensaje en vez de abrir wa.me
    // ========================================
    function initWhatsAppDemo() {
        const dialog = $('#wa-demo');
        if (!dialog) return;
        const msg = $('#wa-demo-msg', dialog);
        const copy = $('#wa-demo-copy', dialog);

        $$('[data-wa]').forEach(btn => {
            btn.addEventListener('click', () => {
                msg.textContent = btn.dataset.wa;
                copy.textContent = 'Copiar mensaje';
                dialog.showModal();
            });
        });

        copy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(msg.textContent);
                copy.textContent = 'Copiado';
            } catch {
                copy.textContent = 'No se pudo copiar';
            }
        });
        $('#wa-demo-close', dialog).addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    }

    // ========================================
    // Inicialización
    // ========================================
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        initSmoothScroll();
        initMobileMenu();
        initHeaderScroll();
        initScrollAnimations();
        initWhatsAppDemo();

    }

    // Auto-inicializar
    init();

})();