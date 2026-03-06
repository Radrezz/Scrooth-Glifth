const lenis = new Lenis({
    lerp: 0.08, // Slightly faster for responsiveness
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    smoothWheel: true,
    smoothTouch: false, // Disable smooth touch to prevent jumping/rubber-banding on mobile browsers
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// --------------------------------------------------------------------------
// 1. Preloader Animation
// --------------------------------------------------------------------------
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const tl = gsap.timeline();

    tl.to('.preloader-bar', {
        x: '0%',
        duration: 1.6, // Shortened
        ease: "power2.inOut"
    })
        .to('.preloader-content', {
            opacity: 0,
            y: -60,
            duration: 1.2, // Synchronized with slide up
            ease: "power2.in"
        })
        .to(preloader, {
            yPercent: -100, // Smooth Slide Up
            duration: 1.2,
            ease: "expo.inOut",
            onStart: () => {
                initLoadAnimations();
            },
            onComplete: () => {
                preloader.style.display = 'none';
            }
        }, "-=1.0"); // Overlap slightly for seamless transition
}


// 2. GSAP Plug-ins Registration
gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------------------------
// 2.2 Global Reveal Animations (Viewport Entrance)
// --------------------------------------------------------------------------
function initRevealAnimations() {
    // Standard Slide Up (Bio / About / FAQ)
    document.querySelectorAll('.reveal-up').forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 1.4,
            delay: el.dataset.d || 0,
            ease: "power3.out"
        });
    });

    // Fade Blur (Slow & Smooth - for Premium looks)
    document.querySelectorAll('.reveal-fade-blur').forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.8,
            delay: el.dataset.d || 0,
            ease: "expo.out"
        });
    });

    // Side Sections (Slide Side - for Transaction/Payment)
    document.querySelectorAll('.reveal-side-left').forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            opacity: 1,
            x: 0,
            duration: 1.5,
            delay: el.dataset.d || 0,
            ease: "power4.out"
        });
    });

    document.querySelectorAll('.reveal-side-right').forEach((el) => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            opacity: 1,
            x: 0,
            duration: 1.5,
            delay: el.dataset.d || 0,
            ease: "power4.out"
        });
    });
}

// --------------------------------------------------------------------------
// 2.3 Initial Load Animation (First Entrance - Slow & Smooth Blur)
// --------------------------------------------------------------------------
function initLoadAnimations() {
    const tl = gsap.timeline();

    tl.to('.hero-pretitle', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' })
        .to('.hero-main-title span', {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            stagger: 0.3,
            duration: 2,
            ease: 'expo.out'
        }, '-=1.2')
        .to('.hero-subtitle', { opacity: 1, filter: 'blur(0px)', duration: 1.5 }, '-=1.2')
        .to('.hero-btns .btn', { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.2, duration: 1.2 }, '-=1');
}

// --------------------------------------------------------------------------
// 2.4 Persistent Cart Logic
// --------------------------------------------------------------------------
let currentCart = JSON.parse(localStorage.getItem('scrooth_cart')) || null;

function updateCartUI() {
    const checkoutModal = document.getElementById('checkout-modal');
    const cartItemName = document.getElementById('cart-item-name');
    const finalCheckoutBtn = document.getElementById('final-checkout-btn');

    if (!currentCart) {
        if (checkoutModal) checkoutModal.classList.remove('active');
        if (cartItemName) cartItemName.innerText = "Tidak ada pesanan";
    } else {
        if (checkoutModal) checkoutModal.classList.add('active');
        if (cartItemName) cartItemName.innerText = currentCart.name;

        // Build WA Message
        const waMsg = encodeURIComponent(`Halo Scrooth Glifth, saya ingin memesan model berikut:
Model: ${currentCart.name} (${currentCart.type})
Link: https://scroothglifth.vercel.app/detail.html?id=${currentCart.id || 0}&type=${currentCart.type}`);

        if (finalCheckoutBtn) {
            finalCheckoutBtn.setAttribute('href', `https://wa.me/62895337858815?text=${waMsg}`);
        }
    }
    localStorage.setItem('scrooth_cart', JSON.stringify(currentCart));
}

function showPremiumToast(message) {
    const toast = document.createElement('div');
    toast.className = 'premium-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i data-lucide="check-circle" style="color: #6D4C41; width: 20px;"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    gsap.fromTo(toast, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" });

    setTimeout(() => {
        gsap.to(toast, { y: -20, opacity: 0, duration: 0.6, ease: "power2.in", onComplete: () => toast.remove() });
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initPreloader(); // Now triggers initLoadAnimations inside it
    initRevealAnimations();
    initScrollSpy();
    updateCartUI(); // Initial UI sync

    // Check if on legal pages
    if (document.body.classList.contains('legal-page')) {
        initMovieCreditsScroll();
    }

    // Force closed on mobile load
    if (window.innerWidth <= 1024) {
        toggleSidebar(true);
    }
});

// --------------------------------------------------------------------------
// 2.4 Scroll Spy (Automatic Nav Active State)
// --------------------------------------------------------------------------
function initScrollSpy() {
    const sections = ['home', 'bio', 'catalog', 'payment', 'contact'];
    const navLinks = document.querySelectorAll('.nav-item');

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;

        ScrollTrigger.create({
            trigger: section,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => updateNav(id),
            onEnterBack: () => updateNav(id),
        });
    });

    function updateNav(id) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

function initMovieCreditsScroll() {
    // Special slow scroll for Terms/Privacy with Looping
    const speed = 0.7; // Visible slow speed
    let isInteracting = false;
    let resumeTimer = null;

    function autoScroll() {
        if (isInteracting || !lenis) return;

        const currentScroll = lenis.scroll;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (maxScroll <= 0) {
            requestAnimationFrame(autoScroll);
            return;
        }

        // Looping logic: if at bottom, reset to top
        if (currentScroll >= maxScroll - 1) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            lenis.scrollTo(currentScroll + speed, { immediate: true });
        }
        requestAnimationFrame(autoScroll);
    }

    // Toggle on interaction: pause when user interacts, resume after 3s of inactivity
    const handleInteraction = () => {
        isInteracting = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
            isInteracting = false;
            autoScroll(); // Correctly restart the loop
        }, 3000);
    };

    window.addEventListener('wheel', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('mousedown', handleInteraction, { passive: true });

    // Initial delay before starting
    setTimeout(autoScroll, 2000);
}

// 3. Side Navbar - Pure CSS Class Toggle (no GSAP conflict)
const sidebar = document.getElementById('sidebar');
const navOpenBtn = document.getElementById('nav-open-trigger');
const navCloseBtn = document.getElementById('nav-close-trigger');

function toggleSidebar(isCollapsed) {
    // Both class changes happen at the same time for perfect sync
    sidebar.classList.toggle('collapsed', isCollapsed);
    document.body.classList.toggle('nav-collapsed', isCollapsed);

    // Additional mobile class for full-screen menu
    if (window.innerWidth <= 1024) {
        if (isCollapsed) sidebar.classList.remove('active');
        else sidebar.classList.add('active');
    }

    navOpenBtn.classList.toggle('visible', isCollapsed);
    setTimeout(() => ScrollTrigger.refresh(), 850);
}

if (navCloseBtn) navCloseBtn.addEventListener('click', () => toggleSidebar(true));
if (navOpenBtn) navOpenBtn.addEventListener('click', () => toggleSidebar(false));

// 4. Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        // Auto-close sidebar on mobile after clicking a link
        if (window.innerWidth <= 1024) {
            toggleSidebar(true);
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            lenis.scrollTo(targetElement, {
                offset: 0,
                duration: 2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});

// 5. Custom Spotlight & Hero Parallax
const spotlight = document.querySelector('.spotlight');
const heroImg = document.querySelector('.hero-img');
const heroContent = document.querySelector('.hero-text-wrapper');
const deco1 = document.querySelector('.deco-1');
const deco2 = document.querySelector('.deco-2');

if (window.innerWidth > 1024) {
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 2;
        const yPos = (clientY / window.innerHeight - 0.5) * 2;

        // Spotlight follow
        if (spotlight) {
            gsap.to(spotlight, {
                x: clientX, y: clientY,
                xPercent: -50, yPercent: -50,
                duration: 1.2, ease: "power2.out"
            });
        }

        // Hero Parallax (Cursor) - Applied to BACKGROUND and DECO, not text content
        if (heroImg) {
            gsap.to(heroImg, {
                x: xPos * 20,
                y: yPos * 20,
                duration: 1,
                ease: "power2.out"
            });
        }
        if (deco1) {
            gsap.to(deco1, {
                x: -xPos * 40,
                y: -yPos * 40,
                duration: 1.5,
                ease: "power2.out"
            });
        }
        if (deco2) {
            gsap.to(deco2, {
                x: xPos * 60,
                y: yPos * 60,
                duration: 1.8,
                ease: "power2.out"
            });
        }
    });
}

// 5. Catalog Data
const catalogData = {
    undangan: [
        { id: 0, name: "Model 01", desc: "Romeo & Juliet concept - Elegant, formal, dan classical.", img: "assets/images/undangan/template1.png", oldPrice: "50.000", newPrice: "30.000", note: "berlaku hingga 12 april 2026", color: "#B17457" }, // Bronze
        { id: 1, name: "Model 02", desc: "Javanese Version - Template bersih dengan sentuhan tradisional.", img: "assets/images/undangan/template2.png", oldPrice: "50.000", newPrice: "30.000", note: "berlaku hingga 12 april 2026", color: "#6A7F6E" }, // Sage Green
        { id: 2, name: "Model 03", desc: "Aesthetic Simple - Pendekatan minimal untuk keterbacaan sempurna.", img: "assets/images/undangan/template3.png", oldPrice: "50.000", newPrice: "30.000", note: "berlaku hingga 12 april 2026", color: "#5F6D7E" }, // Slate Blue
        { id: 3, name: "Model 04", desc: "Floral Garden - Desain dengan aksen bunga yang romantis.", img: "assets/images/undangan/template4.png", oldPrice: "50.000", newPrice: "30.000", note: "berlaku hingga 12 april 2026", color: "#8E443D" }, // Deep Red
        { id: 4, name: "Model 05", desc: "Modern Minimalist - Fokus pada tipografi dan ruang kosong.", img: "assets/images/undangan/template5.png", oldPrice: "50.000", newPrice: "30.000", note: "berlaku hingga 12 april 2026", color: "#A68966" }  // Gold
    ],
    gift: [
        { id: 0, name: "ProfileBirthday-Template", desc: "Template untuk ucapan ulang tahun interaktif.", img: "assets/images/fun-gift/gift1.png", prefix: "Mulai dari ", oldPrice: "60.000", newPrice: "40.000", color: "#7B6A96" } // Purple
    ]
};

// 6. Circular Catalog Logic
let activeCategory = 'undangan';
let activeIndex = 0;
const itemsCircle = document.getElementById('carousel-items-circle');
const centralTitle = document.getElementById('active-category-title');
const centralDesc = document.getElementById('active-product-desc');
const centralLink = document.getElementById('view-detail-link');

let currentGroupRotation = 0;
let mobileCategorySelected = false;

function getLayout() {
    const vw = window.innerWidth;
    const isMobile = vw <= 1024;
    const availableTotal = isMobile ? vw : (vw - 85);
    return {
        rx: isMobile ? 140 : 320,
        ry: isMobile ? 155 : 360,
        activeAngleOffset: isMobile ? 90 : 0, // 90 deg Bottom, 0 deg Right
        isMobile
    };
}

function applyCardStyles() {
    const cards = document.querySelectorAll('.circle-card');
    const { rx, ry, activeAngleOffset, isMobile } = getLayout();
    const angleStep = 360 / cards.length;

    cards.forEach((card, i) => {
        const itemAngle = i * angleStep; // Fixed angle for this card
        const actualAngle = (itemAngle + currentGroupRotation); // Effective position in orbit
        const actualAngleRad = actualAngle * (Math.PI / 180);

        const isTarget = i === activeIndex;

        let depth;
        if (isMobile) {
            depth = (Math.sin(actualAngleRad) + 1) / 2; // Bottom = 1, Top = 0
        } else {
            depth = (Math.cos(actualAngleRad) + 1) / 2; // Right = 1, Left = 0
        }

        const cos = Math.cos(actualAngleRad);
        const sin = Math.sin(actualAngleRad);

        let finalX = cos * rx;
        let finalY = sin * ry;

        // FORCE ANCHOR: Active card stays at right (desktop) or bottom (mobile)
        if (isTarget) {
            if (!isMobile) {
                finalX = rx;
                finalY = 0;
            } else {
                finalX = 0;
                finalY = ry;
            }
        }

        const scale = isTarget ? (isMobile ? 1.55 : 1.6) : (0.5 + depth * 0.3);
        const blurAmt = isTarget ? 0 : (1 - depth) * 6;
        const opacity = isTarget ? 1 : (0.3 + depth * 0.4);
        const zIdx = isTarget ? 15000 : Math.round(depth * 500) + 1;

        gsap.to(card, {
            x: finalX,
            y: finalY,
            scale: scale,
            filter: `blur(${blurAmt}px)`,
            opacity: opacity,
            zIndex: zIdx,
            rotation: 0, // Ensure cards stay upright (Lurus)
            duration: 0.8,
            ease: "power2.out",
            overwrite: true
        });
    });
}

function renderCarousel() {
    if (!itemsCircle) return;
    const items = catalogData[activeCategory];
    itemsCircle.innerHTML = '';

    items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'circle-card';
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <span class="card-label">${item.name}</span>
        `;
        card.addEventListener('click', () => rotateToItem(i));

        // Premium Hover Effect - Only for devices with a mouse
        if (window.matchMedia("(hover: hover)").matches) {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: "-=20",
                    scale: card.classList.contains('active') ? 1.65 : 1.1,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            card.addEventListener('mouseleave', () => {
                applyCardStyles();
            });
        }

        itemsCircle.appendChild(card);
    });

    // Handle Mobile View
    if (window.innerWidth <= 1024) {
        const desktopLayout = document.querySelector('.circular-layout');
        const mobileCatalogGrid = document.querySelector('.mobile-catalog-grid');

        if (mobileCategorySelected) {
            if (desktopLayout) desktopLayout.style.display = 'flex';
            if (mobileCatalogGrid) mobileCatalogGrid.style.display = 'none';
        } else {
            if (desktopLayout) desktopLayout.style.display = 'none';
            if (mobileCatalogGrid) mobileCatalogGrid.style.display = 'block';
        }
    }

    activeIndex = 0;
    const { activeAngleOffset } = getLayout();
    currentGroupRotation = activeAngleOffset - (activeIndex * (360 / items.length));

    updateCenterInfo();
    applyCardStyles();
}

function rotateToItem(targetIndex) {
    const count = catalogData[activeCategory].length;
    const angleStep = 360 / count;
    const { activeAngleOffset } = getLayout();

    activeIndex = targetIndex;

    // Target group rotation to bring active item to front
    const targetGroupRotation = activeAngleOffset - (targetIndex * angleStep);

    // Normalize for shortest path
    let delta = targetGroupRotation - currentGroupRotation;
    delta = ((delta + 180) % 360) - 180;
    const finalRotation = currentGroupRotation + delta;

    // Animate currentGroupRotation smoothly with a snappier, more responsive duration
    gsap.to({ val: currentGroupRotation }, {
        val: finalRotation,
        duration: 0.6, // Reduced from 1.2s for much faster feedback
        ease: "power3.out", // Snappier ease
        onUpdate: function () {
            currentGroupRotation = this.targets()[0].val;
            applyCardStyles();
        },
        onComplete: () => {
            currentGroupRotation = finalRotation % 360;
        }
    });

    updateCenterInfo();
}

function updateCenterInfo() {
    const item = catalogData[activeCategory][activeIndex];

    const existingBack = document.querySelector('.mobile-back-row');
    if (existingBack) existingBack.remove();

    gsap.to('.circular-center > *', {
        y: -10, opacity: 0, duration: 0.25, stagger: 0.04, onComplete: () => {
            if (centralTitle) {
                centralTitle.innerText = item.name;
                // Auto-adjust title size based on length to prevent overflow
                if (item.name.length > 20) {
                    centralTitle.style.fontSize = '1.3rem';
                } else if (item.name.length > 15) {
                    centralTitle.style.fontSize = '1.5rem';
                } else {
                    centralTitle.style.fontSize = '2.2rem';
                }
            }
            if (centralDesc) centralDesc.innerText = item.desc;
            if (centralLink) centralLink.setAttribute('href', `detail.html?id=${item.id}&type=${activeCategory}`);

            const priceContainer = document.getElementById('active-product-price');
            if (priceContainer) {
                const prefixEl = priceContainer.querySelector('.price-prefix');
                const oldEl = priceContainer.querySelector('.price-old');
                const newEl = priceContainer.querySelector('.price-new');
                const noteEl = priceContainer.querySelector('.price-note');

                if (prefixEl) prefixEl.innerText = item.prefix || '';
                if (oldEl) oldEl.innerText = item.oldPrice ? `Rp${item.oldPrice}` : '';
                if (newEl) newEl.innerText = item.newPrice ? `Rp${item.newPrice}` : '';
                if (noteEl) noteEl.innerText = item.note || '';
            }

            if (window.innerWidth <= 1024 && mobileCategorySelected) {
                // Removed Ganti Kategori button as per user request
                if (window.lucide) lucide.createIcons();
            }

            // DYNAMIC COLOR INJECTION
            const accentColor = item.color || '#B17457';
            const layoutEl = document.querySelector('.circular-layout');

            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `${r}, ${g}, ${b}`;
            };

            if (layoutEl) {
                layoutEl.style.setProperty('--accent', accentColor);
                layoutEl.style.setProperty('--accent-rgb', hexToRgb(accentColor));
            }

            gsap.fromTo('.circular-center > *:not(.mobile-back-row)', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power2.out" });
        }
    });
    document.querySelectorAll('.circle-card').forEach((c, i) => c.classList.toggle('active', i === activeIndex));
}

function setActiveCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.category-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === cat);
    });
    mobileCategorySelected = true;
    renderCarousel();
}

function resetMobileCatalog() {
    mobileCategorySelected = false;
    renderCarousel();
}

// 7. Initialize
window.addEventListener('load', () => {
    renderCarousel();
    if (window.lucide) lucide.createIcons();

    // Catalog Buttons
    const prevBtn = document.getElementById('prev-circle');
    const nextBtn = document.getElementById('next-circle');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        const count = catalogData[activeCategory].length;
        rotateToItem((activeIndex - 1 + count) % count);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        const count = catalogData[activeCategory].length;
        rotateToItem((activeIndex + 1) % count);
    });

    // Category Buttons
    document.querySelectorAll('.category-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveCategory(btn.dataset.type);
        });
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('active');
        });
    });

    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            currentCart = null;
            updateCartUI();
        });
    }
});

window.addEventListener('resize', () => {
    applyCardStyles();
});
