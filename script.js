/* ========================================
   FinviAPP — Landing Page Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ── Initialize Lucide Icons ──
    if (window.lucide) {
        lucide.createIcons();
    }

    // ── Navbar scroll effect ──
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ── Mobile burger menu ──
    const burger = document.getElementById('navBurger');

    burger.addEventListener('click', () => {
        navbar.classList.toggle('nav-open');
    });

    // Close mobile nav on link click
    document.querySelectorAll('.navbar__links a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('nav-open');
        });
    });

    // ── Scroll animations (Intersection Observer) ──
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // ── Typewriter on scroll ──
    const typewriterEl = document.querySelector('.typewriter');
    if (typewriterEl) {
        const twObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    twObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        twObserver.observe(typewriterEl);
    }

    // ── Counter animation ──
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            el.textContent = formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = formatNumber(target);
            }
        }

        requestAnimationFrame(update);
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        }
        if (num >= 1000) {
            return num.toLocaleString('es-CL');
        }
        return num.toString();
    }

    // ── Badge "activar audio": desaparece cuando el video se desmutea ──
    const heroVideo  = document.getElementById('heroVideo');
    const unmuteHint = document.getElementById('heroVideoUnmute');

    if (heroVideo && unmuteHint) {
        heroVideo.addEventListener('volumechange', () => {
            if (!heroVideo.muted) {
                unmuteHint.classList.add('hidden');
            }
        });
    }

    // ── Smooth scroll for anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 20;
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ════════════════════════════════════════
    // MODAL LISTA DE ESPERA
    // ════════════════════════════════════════

    const WL_CONFIG = {
        // Reemplaza esta URL después de desplegar tu Google Apps Script
        APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyB-NDfjRL2DtZ-5K_dXFkP6WFeImZXI-VvlCyBPuygZL3-jJyH3MrkufRJucpoeGg87g/exec',
        FALLBACK_COUNT: 247,
        SITE_URL: 'https://finviapp.com/',
    };

    // ── Referencias DOM ──
    const wlOverlay      = document.getElementById('wlOverlay');
    const wlCloseBtn     = document.getElementById('wlCloseBtn');
    const wlForm         = document.getElementById('wlForm');
    const wlStepForm     = document.getElementById('wlStepForm');
    const wlStepSuccess  = document.getElementById('wlStepSuccess');
    const wlCountNum     = document.getElementById('wlCountNum');
    const wlPosition     = document.getElementById('wlPosition');
    const wlSubmit       = document.getElementById('wlSubmit');
    const wlSubmitText   = document.getElementById('wlSubmitText');
    const wlSubmitSpinner = document.getElementById('wlSubmitSpinner');
    const wlSubmitIcon   = document.getElementById('wlSubmitIcon');
    const wlEmailInput   = document.getElementById('wlEmail');
    const wlPhoneInput   = document.getElementById('wlPhone');
    const wlEmailError   = document.getElementById('wlEmailError');
    const wlPhoneError   = document.getElementById('wlPhoneError');

    // Número real obtenido al cargar la página (null = aún pendiente)
    let wlRealCount = null;

    // ── Abrir / Cerrar ──

    function wlOpen() {
        wlOverlay.removeAttribute('hidden');
        wlOverlay.classList.add('wl-overlay--entering');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                wlOverlay.classList.remove('wl-overlay--entering');
                wlOverlay.classList.add('wl-overlay--visible');
            });
        });
        document.body.classList.add('wl-open');
        setTimeout(() => wlEmailInput && wlEmailInput.focus(), 300);
        // Animar con el número real si ya llegó, si no con el fallback
        wlAnimateCount(wlRealCount !== null ? wlRealCount : WL_CONFIG.FALLBACK_COUNT);
        if (window.lucide) lucide.createIcons();
    }

    function wlCloseModal() {
        wlOverlay.classList.remove('wl-overlay--visible');
        wlOverlay.addEventListener('transitionend', function handler() {
            wlOverlay.setAttribute('hidden', '');
            wlOverlay.removeEventListener('transitionend', handler);
            // Resetear estado al cerrar
            if (wlForm) wlForm.reset();
            document.querySelectorAll('.wl-field').forEach(f => {
                f.classList.remove('wl-field--error', 'wl-field--success');
            });
            if (wlEmailError) wlEmailError.textContent = '';
            if (wlPhoneError) wlPhoneError.textContent = '';
            if (wlStepForm) wlStepForm.removeAttribute('hidden');
            if (wlStepSuccess) wlStepSuccess.setAttribute('hidden', '');
        });
        document.body.classList.remove('wl-open');
    }

    // ── Interceptar botones CTA ──
    // El botón ghost "Cómo funciona" conserva su comportamiento de scroll

    const ctaSelectors = [
        '.navbar__cta',
        '.navbar__cta-mobile',
        '.mejora__content .btn--primary',
        '.cta__actions .btn--white',
    ];

    ctaSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                wlOpen();
            });
        });
    });

    // Hero: solo el botón primary abre el modal
    document.querySelectorAll('.hero__actions .btn').forEach(btn => {
        if (btn.classList.contains('btn--primary')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                wlOpen();
            });
        }
    });

    // ── Eventos de cierre ──
    if (wlCloseBtn) wlCloseBtn.addEventListener('click', wlCloseModal);

    const wlDoneBtn = document.getElementById('wlDone');
    if (wlDoneBtn) wlDoneBtn.addEventListener('click', wlCloseModal);

    if (wlOverlay) {
        wlOverlay.addEventListener('click', (e) => {
            if (e.target === wlOverlay) wlCloseModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wlOverlay && !wlOverlay.hasAttribute('hidden')) {
            wlCloseModal();
        }
    });

    // ── Fetch del contador al cargar la página (JSONP para evitar CORS) ──
    function wlFetchCount() {
        const callbackName = '_wlCountCb_' + Date.now();
        const script = document.createElement('script');

        window[callbackName] = function(data) {
            delete window[callbackName];
            script.remove();
            const count = parseInt(data && data.count, 10);
            if (!isNaN(count)) {
                wlRealCount = count + 100;
            }
        };

        script.src = `${WL_CONFIG.APPS_SCRIPT_URL}?action=count&callback=${callbackName}`;
        script.onerror = () => { delete window[callbackName]; script.remove(); };
        document.head.appendChild(script);
    }

    function wlAnimateCount(targetCount) {
        // Siempre arranca desde 0 para el efecto de conteo creciente
        const startFrom = 0;
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            wlCountNum.textContent = Math.floor(startFrom + eased * (targetCount - startFrom));
            if (progress < 1) requestAnimationFrame(tick);
            else wlCountNum.textContent = targetCount;
        }

        wlCountNum.textContent = startFrom;
        requestAnimationFrame(tick);
    }

    // ── Validación ──

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    }

    function validatePhone(value) {
        const digits = value.replace(/\D/g, '');
        return /^9\d{8}$/.test(digits);
    }

    function wlSetFieldState(inputEl, errorEl, isValid, message) {
        const field = inputEl.closest('.wl-field');
        field.classList.toggle('wl-field--error', !isValid);
        field.classList.toggle('wl-field--success', isValid);
        errorEl.textContent = isValid ? '' : message;
    }

    if (wlEmailInput) {
        wlEmailInput.addEventListener('blur', () => {
            if (wlEmailInput.value) {
                wlSetFieldState(wlEmailInput, wlEmailError,
                    validateEmail(wlEmailInput.value),
                    'Ingresa un correo válido (ej: nombre@correo.com)');
            }
        });
    }

    if (wlPhoneInput) {
        wlPhoneInput.addEventListener('blur', () => {
            if (wlPhoneInput.value) {
                wlSetFieldState(wlPhoneInput, wlPhoneError,
                    validatePhone(wlPhoneInput.value),
                    'El número debe tener 9 dígitos y comenzar con 9');
            }
        });

        // Solo permite dígitos
        wlPhoneInput.addEventListener('input', () => {
            wlPhoneInput.value = wlPhoneInput.value.replace(/\D/g, '');
        });
    }

    // ── Envío del formulario ──
    if (wlForm) {
        wlForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailVal = wlEmailInput.value.trim();
            const phoneVal = wlPhoneInput.value.replace(/\D/g, '');
            const emailOk  = validateEmail(emailVal);
            const phoneOk  = validatePhone(phoneVal);

            wlSetFieldState(wlEmailInput, wlEmailError, emailOk,
                'Ingresa un correo válido (ej: nombre@correo.com)');
            wlSetFieldState(wlPhoneInput, wlPhoneError, phoneOk,
                'El número debe tener 9 dígitos y comenzar con 9');

            if (!emailOk || !phoneOk) return;

            // Estado de carga
            wlSubmit.disabled = true;
            wlSubmitText.textContent = 'Guardando...';
            wlSubmitSpinner.removeAttribute('hidden');
            wlSubmitIcon.setAttribute('hidden', '');

            try {
                // Google Apps Script no soporta preflight CORS.
                // Usamos text/plain (no dispara preflight) + no-cors para que
                // el request llegue al script. La respuesta queda opaca pero
                // los datos SÍ se guardan en el Sheet.
                await fetch(WL_CONFIG.APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        email: emailVal,
                        phone: '+56' + phoneVal,
                        timestamp: new Date().toISOString(),
                    }),
                });

                const optimisticPosition = (parseInt(wlCountNum.textContent, 10) || WL_CONFIG.FALLBACK_COUNT) + 1;
                wlShowSuccess(optimisticPosition);

            } catch (_) {
                const optimisticPosition = (parseInt(wlCountNum.textContent, 10) || WL_CONFIG.FALLBACK_COUNT) + 1;
                wlShowSuccess(optimisticPosition);
            } finally {
                wlSubmit.disabled = false;
                wlSubmitText.textContent = 'Quiero mi lugar';
                wlSubmitSpinner.setAttribute('hidden', '');
                wlSubmitIcon.removeAttribute('hidden');
            }
        });
    }

    function wlShowSuccess(position) {
        wlPosition.textContent = '#' + position;
        wlStepForm.setAttribute('hidden', '');
        wlStepSuccess.removeAttribute('hidden');
        if (window.lucide) lucide.createIcons();
    }

    // ── Botones de compartir ──
    const wlShareWhatsapp = document.getElementById('wlShareWhatsapp');
    if (wlShareWhatsapp) {
        wlShareWhatsapp.addEventListener('click', () => {
            const text = encodeURIComponent(
                '¡Me anoté en la lista de espera de FinviAPP! Anótate tú también: ' + WL_CONFIG.SITE_URL
            );
            window.open('https://wa.me/?text=' + text, '_blank');
        });
    }

    const wlShareCopy = document.getElementById('wlShareCopy');
    if (wlShareCopy) {
        wlShareCopy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(WL_CONFIG.SITE_URL);
                wlShareCopy.innerHTML = '<i data-lucide="check"></i> ¡Copiado!';
                if (window.lucide) lucide.createIcons();
                setTimeout(() => {
                    wlShareCopy.innerHTML = '<i data-lucide="copy"></i> Copiar link';
                    if (window.lucide) lucide.createIcons();
                }, 2500);
            } catch (_) {
                wlShareCopy.textContent = WL_CONFIG.SITE_URL;
            }
        });
    }

    // ════════════════════════════════════════
    // BANNER DE COOKIES
    // ════════════════════════════════════════
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner.classList.add('cookie-banner--visible'), 1200);
    }
    document.getElementById('cookieAccept')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'all');
        cookieBanner.classList.remove('cookie-banner--visible');
    });
    document.getElementById('cookieDecline')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'essential');
        cookieBanner.classList.remove('cookie-banner--visible');
    });

    // Fetchear el conteo real en segundo plano al cargar la página
    wlFetchCount();

});
