/* ============================================
   Sanindu Imasha Chathuranga — Portfolio JS
   ============================================ */

(() => {
    'use strict';

    /* ---------- DOM ELEMENT REFERENCES ---------- */
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const themeToggle = document.getElementById('themeToggle');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const skillBars = document.querySelectorAll('.skill-progress');
    const cvBtn = document.getElementById('cvBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const heroShapesContainer = document.getElementById('heroShapes');
    const heroRoleElement = document.getElementById('heroRole');

    // Certificate carousel
    const certificateCarousel = document.querySelector('.certificate-carousel');
    const certificateTrack = document.querySelector('.certificate-track');
    const certificateCards = Array.from(document.querySelectorAll('.certificate-card'));
    const certificatePrev = document.querySelector('[data-cert-prev]');
    const certificateNext = document.querySelector('[data-cert-next]');
    const certificateDotsContainer = document.querySelector('.certificate-dots');

    // Certificate modal
    const certificateModal = document.getElementById('certificateModal');
    const certificateModalImage = document.getElementById('certificateModalImage');
    const certificateModalTitle = document.getElementById('certificateModalTitle');
    const certificateModalIssuer = document.getElementById('certificateModalIssuer');
    const certificateModalClose = certificateModal?.querySelector('.modal-close');

    // Metrics
    const metricsSection = document.getElementById('metrics');
    const metricCards = metricsSection ? metricsSection.querySelectorAll('.metric-card') : [];
    const metricValues = metricsSection ? metricsSection.querySelectorAll('.metric-value') : [];
    let metricsAnimated = false;

    // Certificate helpers
    let allCertificateCardElements = certificateCards.slice();
    let stopCertificatesAutoPlay = null;
    let startCertificatesAutoPlay = null;
    let lastFocusedElement = null;

    certificateCards.forEach(card => {
        card.setAttribute('tabindex', '0');
    });

    /* ==============================================
       GOOGLE DRIVE IMAGE NORMALISER
    =============================================== */
    const DRIVE_THUMB_BASE = 'https://drive.google.com/thumbnail?id=';
    const DRIVE_VIEW_BASE = 'https://drive.google.com/uc?export=view&id=';
    const DRIVE_DOWNLOAD_BASE = 'https://drive.google.com/uc?export=download&id=';

    const extractDriveId = (url) => {
        if (!url) return '';
        const idParamMatch = url.match(/[?&]id=([^&]+)/);
        if (idParamMatch) return idParamMatch[1];
        const pathMatch = url.match(/\/d\/([^/]+)/);
        if (pathMatch) return pathMatch[1];
        return '';
    };

    const normalizeDriveImageSource = (image) => {
        if (!image) return;

        const fileId = image.dataset.driveId || extractDriveId(image.getAttribute('src'));
        if (!fileId) {
            if (!image.dataset.modalSrc) image.dataset.modalSrc = image.src;
            return;
        }

        const requestedSize = image.dataset.driveSize || 'w1600';
        const primarySrc = `${DRIVE_THUMB_BASE}${fileId}&sz=${requestedSize}`;
        const fullSizeSrc = `${DRIVE_THUMB_BASE}${fileId}&sz=w2048`;
        const fallbackSrc = `${DRIVE_VIEW_BASE}${fileId}`;
        const downloadSrc = `${DRIVE_DOWNLOAD_BASE}${fileId}`;

        if (!image.getAttribute('referrerpolicy')) {
            image.setAttribute('referrerpolicy', 'no-referrer');
        }
        if (!image.dataset.modalSrc) image.dataset.modalSrc = fullSizeSrc;
        if (!image.dataset.modalFallback) image.dataset.modalFallback = fallbackSrc;
        if (!image.dataset.modalDownload) image.dataset.modalDownload = downloadSrc;

        image.onerror = () => {
            image.onerror = null;
            image.src = fallbackSrc;
            image.dataset.modalSrc = fallbackSrc;
        };

        if (image.src !== primarySrc) image.src = primarySrc;
    };

    // Normalize all certificate images on load
    const certificateImages = certificateCards.map(c => c.querySelector('img')).filter(Boolean);
    certificateImages.forEach(normalizeDriveImageSource);
    certificateImages.forEach(img => {
        if (!img.dataset.modalSrc) img.dataset.modalSrc = img.src;
    });

    /* ==============================================
       THEME TOGGLE
    =============================================== */
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.add('theme-transition');
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            setTimeout(() => document.body.classList.remove('theme-transition'), 500);
        });
    }

    /* ==============================================
       MOBILE MENU
    =============================================== */
    const closeMenu = () => {
        navLinks?.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    menuToggle?.addEventListener('click', () => {
        const isActive = navLinks?.classList.toggle('active');
        navOverlay?.classList.toggle('active', isActive);
        document.body.classList.toggle('menu-open', isActive);
    });

    navOverlay?.addEventListener('click', closeMenu);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    /* ==============================================
       STICKY HEADER — Add scrolled class
    =============================================== */
    const handleScroll = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 60);
    };

    /* ==============================================
       ACTIVE NAV LINK ON SCROLL
    =============================================== */
    const navLinkElements = document.querySelectorAll('.nav-link[href^="#"]');
    const sectionIds = [...navLinkElements].map(l => l.getAttribute('href').slice(1));

    const updateActiveNav = () => {
        let current = '';
        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom > 150) current = id;
            }
        });
        navLinkElements.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    /* ==============================================
       SCROLL-TO-TOP BUTTON
    =============================================== */
    const updateScrollTop = () => {
        if (!scrollTopBtn) return;
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    };

    scrollTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ==============================================
       TAB FUNCTIONALITY (About Section)
    =============================================== */
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    /* ==============================================
       SKILL BAR ANIMATION
    =============================================== */
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent');
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                bar.style.width = percent + '%';
            }
        });
    };

    /* ==============================================
       SCROLL REVEAL ANIMATION
    =============================================== */
    const revealSelectors = [
        '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale',
        '.skill-card', '.tech-item', '.project-card', '.certificate-card', '.metric-card'
    ];

    const revealOnScroll = () => {
        revealSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('visible');
                }
            });
        });
        animateSkillBars();
        maybeAnimateMetrics();
    };

    /* ==============================================
       HERO FLOATING SHAPES
    =============================================== */
    function createHeroShapes() {
        if (!heroShapesContainer) return;
        const shapeConfigs = [
            { size: 120, x: '10%', y: '15%', duration: 18, delay: 0 },
            { size: 80, x: '75%', y: '10%', duration: 22, delay: 3 },
            { size: 150, x: '85%', y: '60%', duration: 20, delay: 1 },
            { size: 60, x: '20%', y: '70%', duration: 16, delay: 5 },
            { size: 100, x: '55%', y: '80%', duration: 24, delay: 2 },
            { size: 70, x: '40%', y: '25%', duration: 19, delay: 4 },
        ];
        shapeConfigs.forEach(config => {
            const shape = document.createElement('div');
            shape.classList.add('hero-shape');
            shape.style.width = `${config.size}px`;
            shape.style.height = `${config.size}px`;
            shape.style.left = config.x;
            shape.style.top = config.y;
            shape.style.setProperty('--float-duration', `${config.duration}s`);
            shape.style.setProperty('--float-delay', `${config.delay}s`);
            heroShapesContainer.appendChild(shape);
        });
    }
    createHeroShapes();

    /* ==============================================
       3D PARTICLE TEXT MORPH (Three.js)
    =============================================== */
    function initParticleTextMorph() {
        const container = document.querySelector('.about-3d-animation');
        // Clear previous content including old CSS rings or previous Three.js canvases
        if (container) container.innerHTML = '';
        if (!container || !window.THREE) return;

        const isMobile = window.innerWidth < 768;

        // --- Configuration ---
        const config = {
            textSequence: [
                "Talk is cheap.\nShow me the code.\n- Linus Torvalds",
                "Innovation distinguishes\nbetween a leader\nand a follower.\n- Steve Jobs",
                "Software is a great\ncombination between\nartistry & engineering.\n- Bill Gates",
                "Always deliver\nmore than expected.\n- Larry Page",
                "The biggest risk\nis not taking\nany risk.\n- Mark Zuckerberg",
                "Code is like humor.\nWhen you have to explain it,\nit’s bad.\n- Cory House",
                "First, solve the problem.\nThen, write the code.\n- John Johnson",
                "Simplicity is the soul\nof efficiency.\n- Austin Freeman",
                "Make it work,\nmake it right,\nmake it fast.\n- Kent Beck",
                "Fix the cause,\nnot the symptom.\n- Steve Maguire"
            ],
            fontSize: isMobile ? 35 : 45,             // Smaller font for mobile
            fontFamily: 'Verdana, sans-serif',
            particleSize: isMobile ? 0.1 : 0.035,     // Much larger particles for mobile visibility
            particleColorLight: 0x0f172a,
            particleColorDark: 0x6366f1,
            morphSpeed: 0.015,
            interactionRadius: 2.5,
            interactionForce: 0.8
        };

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = isMobile ? 40 : 28; // Closer camera for smaller mobile font

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // --- Particle System State ---
        let particlesMesh;
        let currentPositions;
        let targetPositions;
        let particleCount = 0;
        const maxParticles = 60000; // Increased buffer to prevent clipping
        let currentIndex = 0;
        let animationId;

        // Mouse State
        const mouse = new THREE.Vector2(-999, -999);
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // --- Helper: Generate Particle Positions from Text (Multi-line) ---
        function getParticlesFromText(text) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1024;
            canvas.height = 1024;

            ctx.font = `bold ${config.fontSize}px ${config.fontFamily}`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Handle Multi-line - Use more vertical space
            const lines = text.split('\n');
            const lineHeight = config.fontSize * 1.6;
            const totalHeight = lines.length * lineHeight;
            const startY = (canvas.height - totalHeight) / 2 + (lineHeight / 2);

            lines.forEach((line, index) => {
                ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
            });

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const positions = [];

            // Scan pixels - Maximum Density (Step 1)
            const step = 1;
            for (let y = 0; y < canvas.height; y += step) {
                for (let x = 0; x < canvas.width; x += step) {
                    const index = (y * canvas.width + x) * 4;
                    if (data[index + 3] > 128) {
                        const posX = (x - canvas.width / 2) * 0.05;
                        const posY = -(y - canvas.height / 2) * 0.05;
                        positions.push(posX, posY, 0);
                    }
                }
            }
            return positions;
        }

        // --- Initialize Particle System ---
        function initSystem() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(maxParticles * 3);

            for (let i = 0; i < maxParticles * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 100;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const color = isDark ? config.particleColorDark : config.particleColorLight;

            const material = new THREE.PointsMaterial({
                size: config.particleSize,
                color: color,
                transparent: true,
                opacity: 0.9, // Slightly more opaque
                sizeAttenuation: true
            });

            particlesMesh = new THREE.Points(geometry, material);
            scene.add(particlesMesh);

            currentPositions = Float32Array.from(positions);
            targetPositions = Float32Array.from(positions);

            morphToText(config.textSequence[0]);

            // Cycle quotes - Slower reading time
            setInterval(() => {
                const nextIndex = (currentIndex + 1) % config.textSequence.length;
                morphToText(config.textSequence[nextIndex]);
                currentIndex = nextIndex;
            }, 8000); // 8 Seconds for reading
        }

        // --- Morph Logic ---
        function morphToText(text) {
            const newCoords = getParticlesFromText(text);
            particleCount = Math.min(newCoords.length / 3, maxParticles);

            for (let i = 0; i < maxParticles; i++) {
                const i3 = i * 3;
                if (i < particleCount) {
                    targetPositions[i3] = newCoords[i3];
                    targetPositions[i3 + 1] = newCoords[i3 + 1];
                    targetPositions[i3 + 2] = 0;
                } else {
                    // Randomly scatter unused particles
                    targetPositions[i3] = (Math.random() - 0.5) * 200;
                    targetPositions[i3 + 1] = (Math.random() - 0.5) * 200;
                    targetPositions[i3 + 2] = (Math.random() - 0.5) * 200;
                }
            }
        }

        // --- Animation Loop ---
        function animate() {
            animationId = requestAnimationFrame(animate);

            // Mouse Interaction Calculation
            raycaster.setFromCamera(mouse, camera);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, intersectPoint);

            // Update per particle
            for (let i = 0; i < maxParticles; i++) {
                const i3 = i * 3;

                // 1. Morphing (Lerp towards target)
                // We physically update the current simulation position
                const dx_morph = targetPositions[i3] - currentPositions[i3];
                const dy_morph = targetPositions[i3 + 1] - currentPositions[i3 + 1];
                const dz_morph = targetPositions[i3 + 2] - currentPositions[i3 + 2];

                currentPositions[i3] += dx_morph * config.morphSpeed;
                currentPositions[i3 + 1] += dy_morph * config.morphSpeed;
                currentPositions[i3 + 2] += dz_morph * config.morphSpeed;

                // 2. Mouse Repulsion & Floating
                let px = currentPositions[i3];
                let py = currentPositions[i3 + 1];
                let pz = currentPositions[i3 + 2];

                if (intersectPoint && intersectPoint.x !== 0) { // Check if mouse is active
                    const dx = px - intersectPoint.x;
                    const dy = py - intersectPoint.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.interactionRadius) {
                        const force = (config.interactionRadius - dist) / config.interactionRadius;
                        const angle = Math.atan2(dy, dx);

                        // Push away
                        px += Math.cos(angle) * force * config.interactionForce;
                        py += Math.sin(angle) * force * config.interactionForce;
                    }
                }

                // 3. Add subtle breathing if part of the text
                if (i < particleCount) {
                    const time = Date.now() * 0.001;
                    // Wave effect
                    pz += Math.sin(time * 2 + px * 0.5) * 0.2;
                }

                // Apply to geometry
                particlesMesh.geometry.attributes.position.setXYZ(i, px, py, pz);
            }

            particlesMesh.geometry.attributes.position.needsUpdate = true;

            // Subtle global rotation
            particlesMesh.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;

            renderer.render(scene, camera);
        }

        // --- Event Listeners ---
        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            // Adjust Z on resize
            camera.position.z = window.innerWidth < 768 ? 50 : 28;
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Track relative mouse position [-1, 1]
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            // Normalized Coordinates
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });

        const handleTouch = (e) => {
            if (e.pointerType === 'mouse') return; // Handled by mousemove
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        };

        container.addEventListener('touchstart', handleTouch, { passive: false });
        container.addEventListener('touchmove', handleTouch, { passive: false });

        container.addEventListener('mouseleave', () => {
            mouse.x = -999;
            mouse.y = -999;
        });
        container.addEventListener('touchend', () => {
            mouse.x = -999;
            mouse.y = -999;
        });

        // Theme Change Observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    particlesMesh.material.color.setHex(isDark ? config.particleColorDark : config.particleColorLight);
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });

        // Go!
        initSystem();
        animate();
    }

    // Call init after a short delay to ensure DOM is ready and layout is stable
    setTimeout(initParticleTextMorph, 1000);

    /* ==============================================
       HERO TYPEWRITER EFFECT
    =============================================== */
    function initTypewriter() {
        if (!heroRoleElement) return;
        const roles = [
            'Full-Stack Developer',
            'IT Engineer',
            'Cloud Enthusiast',
            'Problem Solver',
            'Tech Innovator'
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 80;
        const deleteSpeed = 40;
        const pauseAfterType = 2000;
        const pauseAfterDelete = 500;

        function typeStep() {
            const currentRole = roles[roleIndex];
            if (!isDeleting) {
                heroRoleElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === currentRole.length) {
                    isDeleting = true;
                    setTimeout(typeStep, pauseAfterType);
                    return;
                }
                setTimeout(typeStep, typeSpeed);
            } else {
                heroRoleElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(typeStep, pauseAfterDelete);
                    return;
                }
                setTimeout(typeStep, deleteSpeed);
            }
        }
        // Start after hero animations finish
        setTimeout(typeStep, 1200);
    }
    initTypewriter();

    /* ==============================================
       METRIC COUNTER ANIMATION
    =============================================== */
    const formatMetricValue = (value, format) => {
        if (format === 'compact') {
            return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
        }
        return value.toLocaleString();
    };

    const animateMetricValue = (element) => {
        const target = Number(element.dataset.target || '0');
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const duration = Number(element.dataset.duration || '3200');
        const format = element.dataset.format || 'standard';
        const startValue = Number(element.dataset.start || '0');
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (target - startValue) * eased);
            element.textContent = `${prefix}${formatMetricValue(current, format)}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = `${prefix}${formatMetricValue(target, format)}${suffix}`;
            }
        };
        requestAnimationFrame(step);
    };

    const runMetricAnimations = () => {
        if (metricsAnimated) return;
        metricCards.forEach(card => card.classList.add('visible'));
        metricValues.forEach(el => {
            if (!el.dataset.animated) {
                animateMetricValue(el);
                el.dataset.animated = 'true';
            }
        });
        metricsAnimated = true;
    };

    const maybeAnimateMetrics = () => {
        if (!metricsSection || metricsAnimated) return;
        const rect = metricsSection.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh * 0.8 && rect.bottom > vh * 0.2) {
            runMetricAnimations();
        }
    };

    // IntersectionObserver for metrics (more efficient)
    if (metricsSection && 'IntersectionObserver' in window) {
        const metricsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runMetricAnimations();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.4 });
        metricsObserver.observe(metricsSection);
    }

    /* ==============================================
       CERTIFICATE CAROUSEL
       (manual controls + seamless infinite autoplay)
    =============================================== */
    if (certificateCarousel && certificateTrack && certificateCards.length > 0) {
        const dots = [];
        const totalCards = certificateCards.length;
        let certificateIndex = 0;
        let autoPlayTimer;
        let currentIndex;
        let scrollTimer;
        let isJumping = false;

        // Store original indices
        certificateCards.forEach((card, i) => {
            card.dataset.originalIndex = String(i);
        });

        // Compute card widths & visible count
        const trackStyles = window.getComputedStyle(certificateTrack);
        const gapValue = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
        const firstCardWidth = certificateCards[0]?.offsetWidth || certificateTrack.clientWidth;
        const effectiveCardWidth = firstCardWidth + gapValue;
        const estimatedVisible = effectiveCardWidth
            ? Math.round((certificateTrack.clientWidth + gapValue) / effectiveCardWidth) : 1;
        const visibleCount = Math.max(1, Math.min(totalCards, estimatedVisible || 1));

        // Clone helper
        const prependClones = [];
        const appendClones = [];

        const cloneCard = (sourceCard, insertBeforeNode = null) => {
            const clone = sourceCard.cloneNode(true);
            clone.dataset.originalIndex = sourceCard.dataset.originalIndex;
            clone.dataset.clone = 'true';
            clone.classList.add('visible');
            if (!clone.hasAttribute('tabindex')) clone.setAttribute('tabindex', '0');

            if (insertBeforeNode) {
                certificateTrack.insertBefore(clone, insertBeforeNode);
            } else {
                certificateTrack.appendChild(clone);
            }

            const clonedImage = clone.querySelector('img');
            if (clonedImage) {
                normalizeDriveImageSource(clonedImage);
                if (!clonedImage.dataset.modalSrc) clonedImage.dataset.modalSrc = clonedImage.src;
            }
            return clone;
        };

        const effectiveVisible = Math.min(visibleCount, totalCards);
        const firstOriginal = certificateTrack.firstElementChild;

        // Prepend clones (from tail) so we can scroll backwards smoothly
        for (let i = 0; i < effectiveVisible; i++) {
            const srcIdx = (totalCards - effectiveVisible + i) % totalCards;
            prependClones.push(cloneCard(certificateCards[srcIdx], firstOriginal));
        }

        // Append clones (from head) so we can scroll forwards smoothly
        for (let i = 0; i < effectiveVisible; i++) {
            const srcIdx = i % totalCards;
            appendClones.push(cloneCard(certificateCards[srcIdx]));
        }

        let allCards = Array.from(certificateTrack.querySelectorAll('.certificate-card'));
        allCertificateCardElements = allCards;

        allCards.forEach(card => {
            if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        });

        const prependCount = prependClones.length;
        const appendCount = appendClones.length;
        currentIndex = prependCount; // Start at first real card

        /* -- Scroll to a specific card index -- */
        const scrollToIndex = (index, behavior = 'smooth') => {
            const target = allCards[index];
            if (!target) return;

            const trackWidth = certificateTrack.clientWidth;
            const cardWidth = target.clientWidth;
            const maxScroll = certificateTrack.scrollWidth - trackWidth;
            let offset = target.offsetLeft - (trackWidth - cardWidth) / 2;
            offset = Math.max(0, Math.min(offset, maxScroll));

            if (typeof certificateTrack.scrollTo === 'function') {
                certificateTrack.scrollTo({ left: offset, behavior: behavior === 'smooth' ? 'smooth' : 'auto' });
            } else {
                certificateTrack.scrollLeft = offset;
            }
        };

        const setActiveCard = (index) => {
            const targetIndex = String(index);
            allCards.forEach(card =>
                card.classList.toggle('active', card.dataset.originalIndex === targetIndex)
            );
        };

        const updateDots = () => {
            if (!dots.length) return;
            dots.forEach((dot, idx) => dot.classList.toggle('active', idx === certificateIndex));
        };

        const stopAutoPlay = () => {
            if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
        };

        const AUTO_PLAY_INTERVAL = 5000;

        const moveToIndex = (index, isAuto = false, behavior = 'smooth') => {
            currentIndex = index;
            const targetCard = allCards[currentIndex];
            if (!targetCard) return;

            const originalIndex = Number(targetCard.dataset.originalIndex || 0);
            certificateIndex = ((originalIndex % totalCards) + totalCards) % totalCards;
            setActiveCard(certificateIndex);
            updateDots();
            scrollToIndex(currentIndex, behavior);

            if (!isAuto) startAutoPlay();
        };

        const startAutoPlay = () => {
            stopAutoPlay();
            autoPlayTimer = setInterval(() => moveToIndex(currentIndex + 1, true), AUTO_PLAY_INTERVAL);
        };

        const jumpToIndex = (index) => {
            isJumping = true;
            scrollToIndex(index, 'auto');
            requestAnimationFrame(() => { isJumping = false; });
        };

        const ensureInfiniteScroll = () => {
            if (currentIndex >= allCards.length - appendCount) {
                currentIndex = currentIndex - totalCards;
                jumpToIndex(currentIndex);
            } else if (currentIndex < prependCount) {
                currentIndex = currentIndex + totalCards;
                jumpToIndex(currentIndex);
            }
        };

        const handlePrev = () => moveToIndex(currentIndex - 1);
        const handleNext = () => moveToIndex(currentIndex + 1);

        certificatePrev?.addEventListener('click', handlePrev);
        certificateNext?.addEventListener('click', handleNext);

        certificateCarousel.addEventListener('mouseenter', stopAutoPlay);
        certificateCarousel.addEventListener('mouseleave', startAutoPlay);
        certificateCarousel.addEventListener('touchstart', stopAutoPlay, { passive: true });
        certificateCarousel.addEventListener('touchend', startAutoPlay, { passive: true });
        certificateCarousel.addEventListener('focusin', stopAutoPlay);
        certificateCarousel.addEventListener('focusout', startAutoPlay);

        // Snap to nearest card after free scroll
        certificateTrack.addEventListener('scroll', () => {
            if (isJumping) return;
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const trackRect = certificateTrack.getBoundingClientRect();
                const trackCenter = trackRect.left + trackRect.width / 2;
                let closestIndex = currentIndex;
                let smallestDist = Number.POSITIVE_INFINITY;

                allCards.forEach((card, idx) => {
                    const rect = card.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;
                    const dist = Math.abs(trackCenter - (rect.left + rect.width / 2));
                    if (dist < smallestDist) { smallestDist = dist; closestIndex = idx; }
                });

                currentIndex = closestIndex;
                const closest = allCards[closestIndex];
                if (closest) {
                    const origIdx = Number(closest.dataset.originalIndex || 0);
                    certificateIndex = ((origIdx % totalCards) + totalCards) % totalCards;
                    setActiveCard(certificateIndex);
                    updateDots();
                }
                ensureInfiniteScroll();
            }, 120);
        });

        window.addEventListener('resize', () => scrollToIndex(currentIndex, 'auto'));

        // Create dot indicators
        if (certificateDotsContainer) {
            certificateDotsContainer.innerHTML = '';
            for (let i = 0; i < totalCards; i++) {
                const dot = document.createElement('div');
                dot.className = 'certificate-dot';
                dot.dataset.index = String(i);
                dot.addEventListener('click', () => moveToIndex(prependCount + i));
                certificateDotsContainer.appendChild(dot);
                dots.push(dot);
            }
        }

        // Init
        scrollToIndex(currentIndex, 'auto');
        const initialOriginalIndex = Number(allCards[currentIndex].dataset.originalIndex || 0);
        certificateIndex = initialOriginalIndex;
        setActiveCard(certificateIndex);
        updateDots();
        startAutoPlay();

        stopCertificatesAutoPlay = stopAutoPlay;
        startCertificatesAutoPlay = startAutoPlay;
    }

    /* ==============================================
       CERTIFICATE MODAL
    =============================================== */
    const openCertificateModal = (card) => {
        if (!certificateModal || !certificateModalImage || !certificateModalTitle || !certificateModalIssuer) return;

        const image = card.querySelector('img');
        const caption = card.querySelector('figcaption');
        const issuerElement = caption?.querySelector('span');
        const issuerText = issuerElement ? issuerElement.textContent.trim() : '';
        let titleText = '';

        if (caption) {
            const combined = caption.textContent.trim();
            titleText = issuerText ? combined.replace(issuerText, '').trim() : combined;
        }

        if (image) {
            const modalSource = image.dataset.modalSrc || image.src;
            const fallbackSource = image.dataset.modalFallback || image.dataset.modalDownload || image.src;
            const downloadSource = image.dataset.modalDownload || fallbackSource;

            certificateModalImage.onerror = null;
            certificateModalImage.setAttribute('referrerpolicy', 'no-referrer');
            certificateModalImage.src = modalSource;
            certificateModalImage.alt = image.alt || titleText;

            certificateModalImage.onerror = () => {
                certificateModalImage.onerror = null;
                if (fallbackSource && fallbackSource !== modalSource) {
                    certificateModalImage.src = fallbackSource;
                } else if (downloadSource && downloadSource !== modalSource) {
                    certificateModalImage.src = downloadSource;
                }
            };
        }

        certificateModalTitle.textContent = titleText;
        certificateModalIssuer.textContent = issuerText;
        certificateModalIssuer.style.display = issuerText ? 'block' : 'none';

        certificateModal.classList.add('open');
        certificateModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        stopCertificatesAutoPlay?.();
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        certificateModalClose?.focus();
    };

    const closeCertificateModal = () => {
        if (!certificateModal?.classList.contains('open')) return;

        certificateModal.classList.remove('open');
        certificateModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        certificateModalImage.src = '';
        certificateModalImage.alt = '';
        certificateModalImage.removeAttribute('referrerpolicy');
        certificateModalImage.onerror = null;
        certificateModalTitle.textContent = '';
        certificateModalIssuer.textContent = '';
        certificateModalIssuer.style.display = '';
        startCertificatesAutoPlay?.();

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    };

    certificateModalClose?.addEventListener('click', closeCertificateModal);
    certificateModal?.addEventListener('click', (e) => {
        if (e.target === certificateModal) closeCertificateModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCertificateModal();
    });

    // Register click & keyboard interactions on certificate cards
    const registerCertificateInteractions = (cards) => {
        cards.forEach(card => {
            const image = card.querySelector('img');
            if (image && !image.dataset.modalListenerAttached) {
                image.addEventListener('click', () => openCertificateModal(card));
                image.dataset.modalListenerAttached = 'true';
            }
            if (!card.dataset.keypressListenerAttached) {
                card.addEventListener('keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
                        e.preventDefault();
                        openCertificateModal(card);
                    }
                });
                card.dataset.keypressListenerAttached = 'true';
            }
        });
    };

    registerCertificateInteractions(allCertificateCardElements.length ? allCertificateCardElements : certificateCards);

    /* ==============================================
       CV DOWNLOAD (Google Drive)
    =============================================== */
    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            const googleDriveFileId = '1e5JBMR3gFGCmbumSb3iYcdfyJ7HRSLsd';
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

            // Show loading spinner
            cvBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'Sanindu_Imasha_Chathuranga_CV.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                cvBtn.innerHTML = '<i class="fas fa-file-download"></i><span class="tooltip">Download CV</span>';
            }, 2000);
        });
    }

    /* ==============================================
       CONTACT FORM — EmailJS Integration
    =============================================== */
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
            submitBtn.disabled = true;

            const mailtoLink = `mailto:s.i.chathuranga2001@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

            function resetButton() {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }

            function showMessage(text, isSuccess) {
                formMessage.textContent = text;
                formMessage.className = `form-message ${isSuccess ? 'success' : 'error'}`;
                setTimeout(() => { formMessage.className = 'form-message'; }, 5000);
            }

            if (typeof emailjs === 'undefined') {
                showMessage('Email service not ready. Please try again later.', false);
                resetButton();
                return;
            }

            const serviceID = 'service_4z89daz';
            const templateID = 'template_e2z5law';

            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_email: 's.i.chathuranga2001@gmail.com'
            };

            emailjs.send(serviceID, templateID, templateParams)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    showMessage("Your message has been sent successfully! I'll get back to you soon.", true);
                    contactForm.reset();
                    resetButton();
                })
                .catch((error) => {
                    console.error('FAILED...', error);
                    showMessage('Failed to send message. Please try again or use your email client.', false);
                    formMessage.innerHTML += '<br><button id="mailto-btn" style="margin-top:10px;padding:5px 10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">Open Email Client</button>';
                    document.getElementById('mailto-btn')?.addEventListener('click', () => {
                        window.location.href = mailtoLink;
                    });
                    resetButton();
                });
        });
    }

    // Load EmailJS script dynamically
    const emailScript = document.createElement('script');
    emailScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    emailScript.onload = function () {
        emailjs.init('2rgx5MdwsOYwCla8P');
    };
    document.head.appendChild(emailScript);

    /* ==============================================
       COMBINED SCROLL HANDLER
    =============================================== */
    const onScroll = () => {
        handleScroll();
        updateActiveNav();
        updateScrollTop();
        revealOnScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => {
        // Force scroll to top on refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        revealOnScroll();
        handleScroll();
        updateActiveNav();
        updateScrollTop();
    });

    /* ==============================================
       SMOOTH SCROLL FOR NAV LINKS
    =============================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const offset = header ? header.offsetHeight : 0;
                const y = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    /* ==============================================
       VERCEL SPEED INSIGHTS (if deployed on Vercel)
    =============================================== */
    window.va = window.va || function () {
        (window.vaq = window.vaq || []).push(arguments);
    };

})();
