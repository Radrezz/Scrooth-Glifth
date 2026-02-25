// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    wheelMultiplier: 1.1,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. GSAP Plug-ins Registration
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

// 3. Side Navbar - Pure CSS Class Toggle (no GSAP conflict)
const sidebar = document.getElementById('sidebar');
const navOpenBtn = document.getElementById('nav-open-trigger');
const navCloseBtn = document.getElementById('nav-close-trigger');

function toggleSidebar(isCollapsed) {
    sidebar.classList.toggle('collapsed', isCollapsed);
    // On mobile, we use 'active' class for the full-screen menu
    if (window.innerWidth <= 1024) {
        if (isCollapsed) sidebar.classList.remove('active');
        else sidebar.classList.add('active');
    }
    document.body.classList.toggle('nav-collapsed', isCollapsed);
    navOpenBtn.classList.toggle('visible', isCollapsed);
    setTimeout(() => ScrollTrigger.refresh(), 850);
}

if (navCloseBtn) navCloseBtn.addEventListener('click', () => toggleSidebar(true));
if (navOpenBtn) navOpenBtn.addEventListener('click', () => toggleSidebar(false));

// 4. Custom Spotlight & Hero Parallax
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
                x: xPos * 10, // Reduced intensity (was 30)
                y: yPos * 10,
                duration: 3, // Slower (was 2)
                ease: "power2.out"
            });
        }

        if (deco1) {
            gsap.to(deco1, {
                x: xPos * -20, // Reduced intensity (was -70)
                y: yPos * -20,
                duration: 4, // Slower (was 2.5)
                ease: "power2.out"
            });
        }

        if (deco2) {
            gsap.to(deco2, {
                x: xPos * 15, // Reduced intensity (was 50)
                y: yPos * 15,
                duration: 5, // Slower (was 3)
                ease: "power2.out"
            });
        }
    });
}

// Scroll Parallax for Hero
if (heroImg) {
    gsap.to(heroImg, {
        yPercent: 30,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}

// 5. Cinematic Entrance
const entranceTl = gsap.timeline({ defaults: { ease: "expo.out" } });
gsap.set('.hero-img', { scale: 1.4, opacity: 0 });
gsap.set('.hero-main-title span', { y: 100, opacity: 0 });
gsap.set('.frame-edge', { scale: 0, opacity: 0 });
gsap.set('.hero-pretitle, .hero-subtitle, .hero-btns', { y: 30, opacity: 0 });
if (window.innerWidth > 1024) {
    gsap.set('.side-nav', { x: -100 });
}
gsap.set('.hero-deco', { scale: 0, opacity: 0 });

entranceTl
    .to('.hero-img', { opacity: 0.6, scale: 1, duration: 4, ease: "power2.inOut" }, 0);

if (window.innerWidth > 1024) {
    entranceTl.to('.side-nav', { x: 0, duration: 1.5, ease: "expo.out" }, 0.5);
}

entranceTl
    .to('.hero-main-title span', { y: 0, opacity: 1, stagger: 0.2, duration: 2 }, 1)
    .to('.frame-edge', { scale: 1, opacity: 1, stagger: 0.2, duration: 1.5, ease: "back.out(1.7)" }, 1.5)
    .to('.hero-deco', { scale: 1, opacity: 1, stagger: 0.3, duration: 2.5, ease: "power2.out" }, 1.8)
    .to(['.hero-pretitle', '.hero-subtitle', '.hero-btns'], { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power3.out" }, 2)
    .call(() => {
        if (window.innerWidth > 1024) {
            gsap.set('.side-nav', { clearProps: 'x,transform' });
        }
    });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-blur').forEach((el) => {
    let fromState = { opacity: 0 };
    if (el.classList.contains('reveal-up')) fromState.y = 80;
    if (el.classList.contains('reveal-left')) fromState.x = -80;
    if (el.classList.contains('reveal-right')) fromState.x = 80;
    if (el.classList.contains('reveal-blur')) fromState.filter = 'blur(15px)';
    gsap.fromTo(el, fromState, {
        opacity: 1, y: 0, x: 0, filter: 'blur(0px)', duration: 1.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play none none none" }
    });
});

// 6. Circular Carousel System
// Active card is placed at 0 degrees (RIGHT side of ellipse).
// Orbit radius is 420px horizontally to fit within viewport without clipping.
const itemsCircle = document.getElementById('carousel-items-circle');
const centralTitle = document.getElementById('active-category-title');
const centralDesc = document.getElementById('active-product-desc');
const centralLink = document.getElementById('view-detail-link');

const catalogData = {
    undangan: [
        { name: "Model 01", desc: "Romeo & Juliet concept - Elegant, formal, dan classical.", img: "assets/images/undangan/template1.png", id: 0 },
        { name: "Model 02", desc: "Javanese Version - Template bersih dengan sentuhan tradisional.", img: "assets/images/undangan/template2.png", id: 1 },
        { name: "Model 03", desc: "Aesthetic Simple - Pendekatan minimal untuk keterbacaan sempurna.", img: "assets/images/undangan/template3.png", id: 2 },
        { name: "Model 04", desc: "Clean Color Mix - Palet warna modern dengan interaksi halus.", img: "assets/images/undangan/template4.png", id: 3 },
        { name: "Model 05", desc: "Modern Simple Elegant - Layout premium untuk kemewahan digital.", img: "assets/images/undangan/template5.png", id: 4 }
    ],
    gift: [
        { name: "Birthday Template", desc: "Pengalaman buku interaktif untuk kejutan digital yang sempurna.", img: "assets/images/fun-gift/gift1.png", id: 0 }
    ]
};

let activeCategory = 'undangan';
let activeIndex = 0;
let currentGroupRotation = 0;
let mobileCategorySelected = false; // Track if user has picked a category on mobile

function getLayout() {
    const vw = window.innerWidth;
    const isMobile = vw <= 1024;
    const availableRight = isMobile ? (vw / 2 - 20) : ((vw - 85) / 2 - 60);
    return {
        rx: isMobile ? 0 : Math.min(420, availableRight - 130), // On mobile, rx=0 for centered stack
        ry: isMobile ? 0 : 340,
        isMobile
    };
}

function renderCarousel() {
    if (!itemsCircle) return;

    // 1. Desktop Circular Logic (Always runs but hidden on mobile via CSS)
    itemsCircle.innerHTML = '';
    catalogData[activeCategory].forEach((item, i) => {
        const card = document.createElement('div');
        card.className = `circle-card ${i === activeIndex ? 'active' : ''}`;
        card.innerHTML = `<img src="${item.img}" alt="${item.name}"><div class="card-label">${item.name}</div>`;
        card.addEventListener('click', () => { if (i !== activeIndex) rotateToItem(i); });
        itemsCircle.appendChild(card);
    });

    // 2. Mobile Grid Logic
    const mobileGrid = document.getElementById('mobile-catalog-grid');
    if (mobileGrid && window.innerWidth <= 1024) {
        mobileGrid.innerHTML = '';

        if (!mobileCategorySelected) {
            // Show Category Selection
            mobileGrid.innerHTML = `
                <div class="mobile-category-selection">
                    <div class="category-card reveal-up" onclick="selectMobileCategory('undangan')">
                        <div class="cat-icon"><i data-lucide="mail"></i></div>
                        <h3>Undangan Digital</h3>
                        <p>Koleksi desain undangan premium untuk pernikahan & acara.</p>
                        <button class="btn btn-outline btn-sm">Buka Katalog</button>
                    </div>
                    <div class="category-card reveal-up" onclick="selectMobileCategory('gift')" style="--d: 0.1s">
                        <div class="cat-icon"><i data-lucide="gift"></i></div>
                        <h3>Surprise Gift</h3>
                        <p>Template unik untuk kado digital dan ucapan ulang tahun.</p>
                        <button class="btn btn-outline btn-sm">Buka Katalog</button>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        } else {
            // Show Templates for selected category
            const backBtn = document.createElement('div');
            backBtn.className = 'mobile-back-row';
            backBtn.innerHTML = `<button onclick="resetMobileCatalog()" class="back-link"><i data-lucide="chevron-left"></i> Kembali ke Kategori</button>`;
            mobileGrid.appendChild(backBtn);

            const gridContainer = document.createElement('div');
            gridContainer.className = 'templates-inner-grid';

            catalogData[activeCategory].forEach((item, i) => {
                const card = document.createElement('div');
                card.className = 'mobile-card reveal-up';
                card.innerHTML = `
                    <div class="mobile-card-img-wrap">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="mobile-card-info">
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                        <a href="detail.html?id=${item.id}&type=${activeCategory}" class="btn btn-primary btn-sm">Lihat Detail</a>
                    </div>
                `;
                gridContainer.appendChild(card);
            });
            mobileGrid.appendChild(gridContainer);
            if (window.lucide) lucide.createIcons();
        }
    }

    gsap.set(itemsCircle, { rotation: currentGroupRotation });
    placeCards();
}

function selectMobileCategory(type) {
    activeCategory = type;
    mobileCategorySelected = true;
    renderCarousel();
    // Scroll slightly to top of catalog
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function resetMobileCatalog() {
    mobileCategorySelected = false;
    renderCarousel();
}


function placeCards() {
    const cards = document.querySelectorAll('.circle-card');
    const { rx, ry } = getLayout();
    const count = cards.length;
    const angleStep = 360 / count;
    cards.forEach((card, i) => {
        const angleRad = (i * angleStep) * (Math.PI / 180);
        gsap.set(card, {
            left: '50%', top: '50%',
            xPercent: -50, yPercent: -50,
            x: Math.cos(angleRad) * rx,
            y: Math.sin(angleRad) * ry,
            rotation: -currentGroupRotation  // Keep cards upright
        });
    });
    applyCardStyles();
}

function applyCardStyles() {
    const cards = document.querySelectorAll('.circle-card');
    const { rx, ry, isMobile } = getLayout();
    const count = cards.length;
    const angleStep = 360 / count;

    cards.forEach((card, i) => {
        const actualAngleDeg = (i * angleStep + currentGroupRotation + 360) % 360;
        const reflectsActive = Math.abs((actualAngleDeg + 360) % 360) < 10;
        const isTarget = i === activeIndex;

        if (isMobile) {
            // Mobile Stack Model: Center all cards, active is visible, others hidden/scaled down
            gsap.to(card, {
                x: 0, y: 0,
                scale: isTarget ? 1 : 0.8,
                opacity: isTarget ? 1 : 0,
                zIndex: isTarget ? 100 : 1,
                filter: isTarget ? "blur(0px)" : "blur(10px)",
                duration: 0.8, ease: "expo.out"
            });
        } else {
            // Desktop Circular Model
            const actualAngleRad = actualAngleDeg * (Math.PI / 180);
            const orbitalX = Math.cos(actualAngleRad) * rx;
            const depth = (orbitalX + rx) / (2 * rx);
            const scale = isTarget ? 1.6 : (0.6 + depth * 0.25);
            const blurAmt = isTarget ? 0 : (1 - depth) * 6;
            const opacity = isTarget ? 1 : (0.25 + depth * 0.35);
            const zIdx = isTarget ? 15000 : Math.round(depth * 500) + 1;

            gsap.to(card, {
                x: Math.cos(actualAngleRad) * rx,
                y: Math.sin(actualAngleRad) * ry,
                scale, filter: `blur(${blurAmt}px)`, opacity, zIndex: zIdx,
                rotation: -currentGroupRotation,
                duration: 1.2, ease: "expo.out", overwrite: true
            });
        }
    });
}

function updateCenterInfo() {
    const item = catalogData[activeCategory][activeIndex];
    gsap.to('.circular-center > *', {
        y: -10, opacity: 0, duration: 0.25, stagger: 0.04, onComplete: () => {
            if (centralTitle) centralTitle.innerText = item.name;
            if (centralDesc) centralDesc.innerText = item.desc;
            if (centralLink) centralLink.setAttribute('href', `detail.html?id=${item.id}&type=${activeCategory}`);
            gsap.fromTo('.circular-center > *', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power2.out" });
        }
    });
    document.querySelectorAll('.circle-card').forEach((c, i) => c.classList.toggle('active', i === activeIndex));
    applyCardStyles();
}

// Auto-close menu on link click & Professional Smooth Scroll via Lenis
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('href');

        // 1. If it's an anchor link, handle smooth scroll
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                // If on mobile, close sidebar first then scroll
                if (window.innerWidth <= 1024) {
                    toggleSidebar(true);
                    // Slight delay to allow menu animation to start closing before scrolling
                    setTimeout(() => {
                        lenis.scrollTo(targetEl, { offset: 0, duration: 1.5 });
                    }, 100);
                } else {
                    lenis.scrollTo(targetEl, { offset: 0, duration: 1.5 });
                }
            }
        }
    });
});

function rotateToItem(targetIndex) {
    const count = catalogData[activeCategory].length;
    const angleStep = 360 / count;
    // Target rotation: card targetIndex at 0 degrees => group rotation = -targetIndex * angleStep
    const targetRaw = -(targetIndex * angleStep);
    // Normalize delta to shortest path
    let delta = targetRaw - currentGroupRotation;
    delta = ((delta + 180) % 360) - 180;
    currentGroupRotation += delta;
    activeIndex = targetIndex;

    gsap.to(itemsCircle, {
        rotation: currentGroupRotation,
        duration: 2, ease: "expo.inOut",
        onUpdate: () => {
            const liveRot = gsap.getProperty(itemsCircle, "rotation");
            document.querySelectorAll('.circle-card').forEach(card => gsap.set(card, { rotation: -liveRot }));
            applyCardStyles();
        }
    });
    updateCenterInfo();
}

document.getElementById('next-circle')?.addEventListener('click', () => {
    rotateToItem((activeIndex + 1) % catalogData[activeCategory].length);
});
document.getElementById('prev-circle')?.addEventListener('click', () => {
    const count = catalogData[activeCategory].length;
    rotateToItem((activeIndex - 1 + count) % count);
});

// Cart
const addToCartBtn = document.getElementById('add-to-cart-btn');
const checkoutModal = document.getElementById('checkout-modal');
const cartItemNameIndicator = document.getElementById('cart-item-name');
const finalCheckoutLink = document.getElementById('final-checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');

function syncCart() {
    if (window.currentBooking) {
        cartItemNameIndicator.innerText = `Booking: ${window.currentBooking.name}`;
        checkoutModal.classList.add('visible');
        const msg = encodeURIComponent(`Halo Scrooth Glifth, saya tertarik dengan ${window.currentBooking.name}.`);
        finalCheckoutLink.setAttribute('href', `https://wa.me/62895337858815?text=${msg}`);
    } else checkoutModal.classList.remove('visible');
}

if (addToCartBtn) addToCartBtn.addEventListener('click', () => {
    const item = catalogData[activeCategory][activeIndex];
    window.currentBooking = { name: item.name, type: activeCategory };
    syncCart();
});
if (clearCartBtn) clearCartBtn.addEventListener('click', () => { window.currentBooking = null; syncCart(); });

document.querySelectorAll('.category-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (type !== activeCategory) {
            activeCategory = type; activeIndex = 0; currentGroupRotation = 0;
            gsap.set(itemsCircle, { rotation: 0 });
            document.querySelectorAll('.category-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCarousel(); updateCenterInfo();
        }
    });
});

window.addEventListener('load', () => {
    renderCarousel(); updateCenterInfo();
    if (window.lucide) window.lucide.createIcons();

    // Ensure mobile sidebar is closed but toggle is visible
    if (window.innerWidth <= 1024) {
        toggleSidebar(true);
    }
});

window.addEventListener('resize', () => { placeCards(); applyCardStyles(); });

function copyText(val) {
    navigator.clipboard.writeText(val);
    const toast = document.createElement('div');
    toast.innerText = "Nomor Disalin";
    toast.style = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;padding:12px 24px;border-radius:50px;z-index:9999;font-weight:700;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
