import './styles/main.scss'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import barba from '@barba/core'

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase)

CustomEase.create('menuEase',  'M0,0,C0.1,0,0.2,1,1,1')
CustomEase.create('imageEase', 'M0,0,C0.31,0.13,0.11,1,1,1')

const GALLERY_IMAGES = [
  './src/assets/images/logo/logo-large.jpg',
  './src/assets/images/hero/hero_1.jpg',
  './src/assets/images/hero/hero_2.jpeg',
  './src/assets/images/hero/hero_3.jpeg',
  './src/assets/images/projects/multicare-dental/01.jpg',
  './src/assets/images/projects/multicare-dental/02.jpg',
  './src/assets/images/projects/aventra-pharmacy/01.jpg',
  './src/assets/images/projects/aventra-pharmacy/02.jpg',
  './src/assets/images/projects/aventra-pharmacy/03.jpg',
  './src/assets/images/projects/aventra-pharmacy/04.jpg',
  './src/assets/images/projects/kims-apparel/01.jpg',
  './src/assets/images/projects/chaneys-hair/01.jpg',
  './src/assets/images/projects/chaneys-hair/02.jpg',
  './src/assets/images/projects/luxehub/01.jpg',
  './src/assets/images/projects/luxehub/02.jpg',
  './src/assets/images/company/IMG_20260406_210056.jpg.jpeg',
  './src/assets/images/company/IMG_20260406_210114.jpg.jpeg',
  './src/assets/images/company/IMG_20260406_210148.jpg.jpeg',
  './src/assets/images/company/IMG_20260407_162139.jpg.jpeg',
  './src/assets/images/company/2026_04_21_034707346_edit_148332445091426.jpg.jpeg',
]

// Gallery start index per project (matches project list order in projects.html)
const PROJECT_GALLERY_STARTS = [3, 5, 9, 10, 12, 14]

let _openGallery = null

// ─── Touch swipe helper ──────────────────────────────────────────────────────
// Passive listeners - no scroll blocking, no performance cost.

function onSwipe(el, onLeft, onRight, threshold = 48) {
  let x0 = 0
  el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX }, { passive: true })
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - x0
    if (Math.abs(dx) < threshold) return
    dx < 0 ? onLeft() : onRight()
  }, { passive: true })
}

// ─── VH fix (mobile browser chrome) ─────────────────────────────────────────

function setVH() {
  document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px')
}
window.addEventListener('resize', setVH)
setVH()

// ─── 1. Custom cursor ─────────────────────────────────────────────────────────

function initCursor() {
  const dot = document.getElementById('cursorDot')
  if (!dot) return

  gsap.set(dot, { xPercent: -50, yPercent: -50 })

  window.addEventListener('mousemove', e => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out', overwrite: true })
  })

  document.addEventListener('mouseover', e => {
    const hit = e.target.closest('a, button, [data-cursor]')
    gsap.to(dot, { scale: hit ? 3 : 1, duration: 0.3, ease: 'power2.out' })
  })
}

// ─── 2. Hamburger + nav overlay ───────────────────────────────────────────────

let navIsOpen = false

function initHamburger() {
  const burger  = document.getElementById('burgerBtn')
  const overlay = document.getElementById('navOverlay')
  const curtain = document.getElementById('navCurtain')
  if (!burger || !overlay) return

  const bars   = burger.querySelectorAll('.burger-icon span')
  const items  = overlay.querySelectorAll('.nav-overlay__item')
  const panels = curtain ? [...curtain.querySelectorAll('.nav-curtain__panel')] : []

  function openNav() {
    navIsOpen = true

    // Position panels off-screen: odd panels slide from right, even from left
    panels.forEach((p, i) => gsap.set(p, { x: i % 2 === 0 ? '-101%' : '101%' }))
    if (curtain) gsap.set(curtain, { visibility: 'visible' })
    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'all', opacity: 0 })

    const revealContent = () => {
      gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      items.forEach((item, i) => {
        const chars = item.querySelectorAll('.char')
        gsap.fromTo(chars,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.65, stagger: 0.02, ease: 'menuEase', delay: i * 0.06 }
        )
      })
    }

    if (panels.length) {
      gsap.to(panels, {
        x: 0, duration: 0.55, stagger: 0.07, ease: 'power3.inOut',
        onComplete: revealContent
      })
    } else {
      revealContent()
    }

    // Bars → X
    gsap.to(bars[0], { y: 5,  rotation: 45,  duration: 0.3, ease: 'power2.inOut' })
    gsap.to(bars[1], { opacity: 0, duration: 0.15 })
    gsap.to(bars[2], { y: -5, rotation: -45, duration: 0.3, ease: 'power2.inOut' })
  }

  function closeNav() {
    navIsOpen = false

    gsap.to(overlay, {
      opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' })
        if (panels.length) {
          gsap.to(panels, {
            x: (i) => i % 2 === 0 ? '-101%' : '101%',
            duration: 0.5,
            stagger: { each: 0.07, from: 'end' },
            ease: 'power3.in',
            onComplete: () => { if (curtain) gsap.set(curtain, { visibility: 'hidden' }) }
          })
        }
      }
    })

    // X → bars
    gsap.to(bars[0], { y: 0, rotation: 0, duration: 0.3, ease: 'power2.inOut' })
    gsap.to(bars[1], { opacity: 1, duration: 0.2, delay: 0.1 })
    gsap.to(bars[2], { y: 0, rotation: 0, duration: 0.3, ease: 'power2.inOut' })
  }

  burger.addEventListener('click', () => { navIsOpen ? closeNav() : openNav() })

  overlay.querySelectorAll('.nav-overlay__item').forEach(link => {
    link.addEventListener('click', closeNav)
  })

  // Side image - swaps on nav link hover
  const sideImg = document.getElementById('navSideImg')
  if (sideImg) {
    const NAV_IMAGES = {
      '/':              './src/assets/images/logo/logo-large.jpg',
      '/projects.html': './src/assets/images/projects/kims-apparel/01.jpg',
      '/about.html':    './src/assets/images/company/IMG_20260406_210056.jpg.jpeg',
      '/contact.html':  './src/assets/images/projects/chaneys-hair/01.jpg',
    }
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const src = NAV_IMAGES[item.getAttribute('href')]
        if (!src || sideImg.src.endsWith(src)) return
        gsap.to(sideImg, {
          opacity: 0, duration: 0.2,
          onComplete: () => {
            sideImg.src = src
            gsap.to(sideImg, { opacity: 1, duration: 0.35 })
          }
        })
      })
    })
  }
}

// ─── 3. Gallery slideshow ─────────────────────────────────────────────────────

let galleryCurrent = 0

function initGallery() {
  const trigger  = document.getElementById('galleryTrigger')
  const overlay  = document.getElementById('galleryOverlay')
  const closeBtn = document.getElementById('galleryClose')
  const prevBtn  = document.getElementById('galleryPrev')
  const nextBtn  = document.getElementById('galleryNext')
  const image    = document.getElementById('galleryImage')
  const slideNum = document.getElementById('gallerySlideNum')
  if (!trigger || !overlay) return

  function openGallery(index = 0) {
    galleryCurrent = ((index % GALLERY_IMAGES.length) + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    updateSlide()
    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'all' })
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    if (trigger) trigger.textContent = 'Close'
  }

  // Expose so project list items can open gallery at a specific index
  _openGallery = openGallery

  function closeGallery() {
    gsap.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' })
    })
    if (trigger) trigger.textContent = 'Gallery'
  }

  function updateSlide() {
    if (image) {
      gsap.to(image, { opacity: 0, duration: 0.2, onComplete: () => {
        image.src = GALLERY_IMAGES[galleryCurrent]
        gsap.to(image, { opacity: 1, duration: 0.3 })
      }})
    }
    if (slideNum) slideNum.textContent = String(galleryCurrent + 1).padStart(2, '0')
  }

  trigger.addEventListener('click', e => {
    e.preventDefault()
    overlay.style.visibility === 'visible' ? closeGallery() : openGallery(0)
  })

  if (closeBtn) closeBtn.addEventListener('click', closeGallery)

  if (prevBtn) prevBtn.addEventListener('click', () => {
    galleryCurrent = (galleryCurrent - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
    updateSlide()
  })

  if (nextBtn) nextBtn.addEventListener('click', () => {
    galleryCurrent = (galleryCurrent + 1) % GALLERY_IMAGES.length
    updateSlide()
  })

  document.addEventListener('keydown', e => {
    if (overlay.style.visibility !== 'visible') return
    if (e.key === 'ArrowLeft')  prevBtn?.click()
    if (e.key === 'ArrowRight') nextBtn?.click()
    if (e.key === 'Escape')     closeGallery()
  })

  // Touch swipe on gallery
  const galleryLeft = overlay.querySelector('.gallery-overlay__left')
  if (galleryLeft) {
    onSwipe(galleryLeft,
      () => { galleryCurrent = (galleryCurrent + 1) % GALLERY_IMAGES.length; updateSlide() },
      () => { galleryCurrent = (galleryCurrent - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length; updateSlide() }
    )
  }
}

// ─── 4. Home cycling thumbnails ───────────────────────────────────────────────
// Colours are sampled from each project image; pre-defined here as brand-adjacent tones.
// Wheel-down / click → next; wheel-up → prev. No auto-timer.

const HOME_BG = ['#26211d', '#272b25', '#1c1b18']

function initHomeCycle() {
  const thumbs  = document.querySelectorAll('.home-hero__thumb')
  const counter = document.getElementById('homeCycleCounter')
  const hero    = document.querySelector('.home-hero')
  if (!thumbs.length || !hero) return

  const total = thumbs.length
  let current = 0
  let locked  = false   // debounce so one wheel tick = one slide

  function showThumb(index) {
    const next = ((index % total) + total) % total
    const prev = current
    current    = next

    // Background colour cross-fade (transition is on .home-hero in SCSS)
    hero.style.backgroundColor = HOME_BG[current] || HOME_BG[0]

    thumbs.forEach((t, i) => {
      if (i === current) {
        gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
        t.classList.add('is-active')
        t.style.pointerEvents = 'auto'
      } else {
        if (i === prev) gsap.to(t, { opacity: 0, duration: 0.4, ease: 'power2.in' })
        t.classList.remove('is-active')
        t.style.pointerEvents = 'none'
      }
    })

    if (counter) {
      counter.textContent = `${String(current + 1).padStart(2, '0')} - ${String(total).padStart(2, '0')}`
    }

    // Sync slide indicators
    document.querySelectorAll('.home-hero__indicator').forEach((ind, i) => {
      ind.classList.toggle('is-active', i === current)
    })

    const title = document.getElementById('homeHeroTitle')
    if (title) {
      if (current === 0) {
        gsap.to(title, { opacity: 0, duration: 0.4, ease: 'power2.inOut' })
      } else if (prev === 0) {
        const words = title.querySelectorAll('.home-hero__word')
        gsap.set(title, { opacity: 1 })
        gsap.fromTo(words, 
          { yPercent: 110, rotation: 4, opacity: 0, scale: 0.95 }, 
          { yPercent: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out', overwrite: true }
        )
      }
    }
  }

  // Set initial state (no animation on first load)
  hero.style.backgroundColor = HOME_BG[0]
  thumbs[0]?.classList.add('is-active')
  gsap.set(thumbs[0], { opacity: 1 })
  if (counter) counter.textContent = `01 - ${String(total).padStart(2, '0')}`
  document.querySelectorAll('.home-hero__indicator')[0]?.classList.add('is-active')

  // Auto-advance every 10 seconds
  if (window.homeCycleTimer) clearInterval(window.homeCycleTimer)
  window.homeCycleTimer = setInterval(() => showThumb(current + 1), 10000)

  // Click on the active thumbnail → next
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', e => {
      e.preventDefault()
      clearInterval(window.homeCycleTimer)
      showThumb(current + 1)
      window.homeCycleTimer = setInterval(() => showThumb(current + 1), 10000)
    })
  })
}

// ─── 5. Projects grid - card click opens project panel ─────────────────────────

const PROJECT_DATA = [
  {
    name: 'MultiCare Dental Surgery', type: 'Clinic',
    desc: 'A full clinical fit-out designed to project precision while remaining welcoming. We balanced hygienic material specification, professional atmosphere, and patient comfort — optimising treatment and reception areas for both staff efficiency and the patient experience.',
    img: './src/assets/images/projects/multicare-dental/01.jpg',
    chips: ['Clinical Fit-Out', 'Hygiene Specification', 'Reception Design', 'Integrated Lighting'],
    year: '2025', location: 'Bulawayo', scope: 'Full Fit-Out', galleryIndex: 3,
  },
  {
    name: 'Aventra Pharmacy', type: 'Retail',
    desc: 'A retail interior designed to elevate the customer experience while meeting operational standards. Clean product displays, deliberate material choices, and a considered circulation flow guide customers through the space and reduce congestion at peak hours.',
    img: './src/assets/images/projects/aventra-pharmacy/01.jpg',
    chips: ['Retail Planning', 'Display Design', 'Circulation Flow', 'Integrated Lighting'],
    year: '2025', location: 'Bulawayo', scope: 'Interior Design', galleryIndex: 5,
  },
  {
    name: "Kim's Apparel", type: 'Boutique',
    desc: "A strategic retail environment designed to maximise merchandise impact. Bespoke display solutions, a curated material palette, and considered spatial planning establish Kim's Apparel as a destination in Bulawayo's fashion landscape.",
    img: './src/assets/images/projects/kims-apparel/01.jpg',
    chips: ['Retail Interior', 'Bespoke Joinery', 'Material Palette', 'Track Lighting'],
    year: '2025', location: 'Bulawayo', scope: 'Full Fit-Out', galleryIndex: 9,
  },
  {
    name: "Chaney's Modern Hair Luxury", type: 'Salon',
    desc: "A premium salon concept designed to attract and retain a discerning clientele. The curated interior — bespoke finishes, considered material selection, and statement lighting — creates an atmosphere of effortless, Instagram-worthy luxury.",
    img: './src/assets/images/projects/chaneys-hair/01.jpg',
    chips: ['Luxury Interior', 'Statement Lighting', 'Bespoke Finishes', 'Brand Atmosphere'],
    year: '2024', location: 'Bulawayo', scope: 'Concept & Build', galleryIndex: 10,
  },
  {
    name: 'Luxehub', type: 'Hospitality',
    desc: 'A hospitality venue designed for atmosphere and social energy. Layered spatial zones, a deliberate material language, and integrated feature lighting create distinct moods — drawing guests in and ensuring they stay longer.',
    img: './src/assets/images/projects/luxehub/01.jpg',
    chips: ['Hospitality Interior', 'Spatial Zoning', 'Feature Lighting', 'Material Language'],
    year: '2025', location: 'Bulawayo', scope: 'Interior & Lighting', galleryIndex: 12,
  },
  {
    name: '2026 Installation', type: 'Commercial',
    desc: "A bespoke commercial interior installation showcasing Negus's technical capabilities — combining architectural lighting integration, decorative pendant features, and programmable scene control within a considered spatial framework.",
    img: './src/assets/images/company/IMG_20260406_210056.jpg.jpeg',
    chips: ['Commercial Interior', 'Architectural LED', 'Pendant Feature', 'Scene Control'],
    year: '2026', location: 'Bulawayo', scope: 'Commercial Install', galleryIndex: 14,
  },
]

function initProjectsGrid() {
  const cards      = document.querySelectorAll('.projects-card')
  if (!cards.length) return

  const panel      = document.getElementById('projectPanel')
  const panelInner = document.getElementById('projectPanelInner')
  const panelImg   = document.getElementById('projectPanelImg')
  const panelTitle = document.getElementById('panelTitle')
  const panelEyebrow = document.getElementById('panelEyebrow')
  const panelDesc  = document.getElementById('panelDesc')
  const panelChips = document.getElementById('panelChips')
  const panelYear  = document.getElementById('panelYear')
  const panelLoc   = document.getElementById('panelLocation')
  const panelScope = document.getElementById('panelScope')
  const closeBtn   = document.getElementById('projectPanelClose')
  const galleryBtn = document.getElementById('panelGalleryBtn')
  if (!panel) return

  let currentGalleryIndex = 0

  function openPanel(index) {
    const data = PROJECT_DATA[index]
    if (!data) return
    panelImg.src             = data.img
    panelImg.alt             = data.name
    panelTitle.textContent   = data.name
    panelEyebrow.textContent = data.type
    panelDesc.textContent    = data.desc
    panelYear.textContent    = data.year
    panelLoc.textContent     = data.location
    panelScope.textContent   = data.scope
    currentGalleryIndex      = data.galleryIndex
    panelChips.innerHTML     = data.chips.map(c => `<span class="project-panel__chip">${c}</span>`).join('')
    panel.classList.add('is-open')
    gsap.fromTo(panelInner,
      { y: '100%', opacity: 0 },
      { y: '0%',   opacity: 1, duration: 0.75, ease: 'power4.out' }
    )
    gsap.fromTo(panelImg,
      { scale: 1.08 },
      { scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 }
    )
    document.body.style.overflow = 'hidden'
  }

  function closePanel() {
    gsap.to(panelInner, {
      y: '100%', opacity: 0, duration: 0.55, ease: 'power3.in',
      onComplete: () => {
        panel.classList.remove('is-open')
        document.body.style.overflow = ''
      }
    })
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', e => { e.preventDefault(); openPanel(i) })
  })

  if (closeBtn) closeBtn.addEventListener('click', closePanel)

  if (galleryBtn) galleryBtn.addEventListener('click', () => {
    closePanel()
    setTimeout(() => { if (_openGallery) _openGallery(currentGalleryIndex) }, 600)
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel()
  })
}

function initProjectsCarousel() {
  initProjectsGrid()
}

// ─── 6. Scroll reveal (ScrollTrigger) ─────────────────────────────────────────

function getScroller() {
  const ns = getNamespace()
  if (ns === 'home')     return document.querySelector('[data-barba-namespace="home"]') || window
  if (ns === 'about')    return document.querySelector('.about-page')                   || window
  if (ns === 'projects') return document.querySelector('.projects-page')                || window
  return window
}

function registerScrollerProxy(el) {
  if (!el || el === window) return
  ScrollTrigger.scrollerProxy(el, {
    scrollTop(value) {
      if (arguments.length) { el.scrollTop = value }
      return el.scrollTop
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
    },
    pinType: el.style.transform ? 'transform' : 'fixed'
  })
  // Keep ScrollTrigger in sync when the custom scroller moves
  el.addEventListener('scroll', ScrollTrigger.update, { passive: true })
}

function initScrollReveal() {
  const scroller = getScroller()

  // Standard fade-up reveal
  document.querySelectorAll('[data-reveal]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', scroller }
      }
    )
  })

  // Clip-path image reveal + inner parallax drift
  document.querySelectorAll('[data-reveal-img]').forEach(wrap => {
    gsap.fromTo(wrap,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: wrap, start: 'top 88%', scroller }
      }
    )
    const img = wrap.querySelector('img')
    if (img) {
      gsap.fromTo(img,
        { yPercent: 14 },
        {
          yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1, scroller }
        }
      )
    }
  })

  // Stagger-children reveal
  document.querySelectorAll('[data-reveal-stagger]').forEach(parent => {
    const children = parent.querySelectorAll('[data-reveal-child]')
    if (!children.length) return
    gsap.fromTo(children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: parent, start: 'top 85%', scroller }
      }
    )
  })
}

// ─── 10. Home cases slider ─────────────────────────────────────────────────────

function initHomeCasesSlider() {
  const container = document.querySelector('.home-cases')
  const track     = document.getElementById('homeCasesTrack')
  const prevBtn   = document.getElementById('homeSliderPrev')
  const nextBtn   = document.getElementById('homeSliderNext')
  if (!track || !prevBtn || !nextBtn || !container) return

  const slides = track.querySelectorAll('.home-cases__slide')
  let current  = 0
  const total  = slides.length

  function goTo(index) {
    current = ((index % total) + total) % total
    gsap.to(track, {
      x: -(current * container.clientWidth),
      duration: 0.75,
      ease: 'power3.inOut'
    })
  }

  prevBtn.addEventListener('click', () => goTo(current - 1))
  nextBtn.addEventListener('click', () => goTo(current + 1))

  // Touch swipe on the case studies
  onSwipe(container,
    () => goTo(current + 1),
    () => goTo(current - 1)
  )
}

// ─── 11. Parallax ─────────────────────────────────────────────────────────────

function initParallax() {
  // Skip on touch devices - parallax is GPU-heavy and pointless without a mouse
  if (window.matchMedia('(max-width: 820px)').matches) return

  const scroller = getScroller()

  // Featured project bg - subtle vertical drift on scroll
  const featBg = document.querySelector('.home-featured__bg')
  if (featBg) {
    gsap.fromTo(featBg,
      { yPercent: -8 },
      {
        yPercent: 8, ease: 'none',
        scrollTrigger: {
          trigger: '.home-featured',
          start: 'top bottom', end: 'bottom top',
          scrub: 1.2, scroller
        }
      }
    )
  }

  // About editorial photo - scale + drift
  const aboutPhoto = document.querySelector('.about-photo')
  if (aboutPhoto) {
    gsap.set(aboutPhoto, { scale: 1.12 })
    gsap.fromTo(aboutPhoto,
      { yPercent: -6 },
      {
        yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: {
          trigger: '.about-photo-wrap',
          start: 'top bottom', end: 'bottom top',
          scrub: 1.2, scroller
        }
      }
    )
  }
}

// ─── 12. Magnetic hover elements ─────────────────────────────────────────────

function initMagneticElements() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width  / 2)
      const y = e.clientY - (r.top  + r.height / 2)
      gsap.to(el, { x: x * 0.38, y: y * 0.38, duration: 0.4, ease: 'power2.out' })
    })
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.45)' })
    })
  })
}

// ─── 13. Page entrance animations ────────────────────────────────────────────

let _firstLoad = true

function initPageEntrance() {
  const ns = getNamespace()

  // Navbar + status bar only animate once on first load - they persist across navigations
  if (_firstLoad) {
    _firstLoad = false
    const logo   = document.querySelector('.navbar__logo')
    const right  = document.querySelector('.navbar__right')
    const status = document.querySelector('.status-bar')
    gsap.set([logo, right, status].filter(Boolean), { opacity: 0 })
    gsap.to([logo, right].filter(Boolean), {
      opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2
    })
    gsap.to(status, { opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 })
  }

  if      (ns === 'home')    _entranceHome()
  else if (ns === 'about')   _entranceAbout()
  else if (ns === 'projects') _entranceProjects()
  else if (ns === 'contact')  _entranceContact()
}

function _entranceHome() {
  const line1 = document.querySelector('.home-hero__line:nth-child(1) .home-hero__word')
  const line2 = document.querySelector('.home-hero__line:nth-child(2) .home-hero__word')
  const meta  = document.querySelector('.home-hero__meta')
  const thumb = document.querySelector('.home-hero__thumb.is-active')
  const title = document.getElementById('homeHeroTitle')
  if (!line1) return

  gsap.set([line1, line2], { yPercent: 110 })
  gsap.set([meta, thumb].filter(Boolean), { opacity: 0 })
  if (title) gsap.set(title, { opacity: 0 })

  gsap.timeline({ delay: 0.25 })
    .to(line1, { yPercent: 0, duration: 1.2, ease: 'menuEase' })
    .to(line2, { yPercent: 0, duration: 1.2, ease: 'menuEase' }, '-=0.9')
    .to(meta,  { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.55')
    .to(thumb, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.55')
}

function _entranceAbout() {
  // Only animate the hero title words - section subheadings are handled by data-reveal
  const words  = document.querySelectorAll('.about-top__title .about-top__word')
  const status = document.querySelectorAll('.about-top__status span')
  if (!words.length) return

  gsap.set(words,  { yPercent: 110 })
  gsap.set(status, { opacity: 0, y: 12 })

  gsap.timeline({ delay: 0.25 })
    .to(words,  { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'menuEase' })
    .to(status, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
}

function _entranceProjects() {
  const title = document.querySelector('.projects-header__title')
  const count = document.querySelector('.projects-header__count')
  const cards = document.querySelectorAll('.projects-card')
  if (!cards.length) return

  gsap.set([title, count].filter(Boolean), { opacity: 0, y: -14 })
  gsap.set(cards, { opacity: 0, y: 32 })

  gsap.to([title, count].filter(Boolean), {
    opacity: 1, y: 0, duration: 0.7, stagger: 0.08, delay: 0.2, ease: 'power3.out'
  })
  gsap.to(cards, {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.3, ease: 'power3.out'
  })
}

function _entranceContact() {
  const photo = document.querySelector('.contact-page__photo-wrap')
  const info  = document.querySelector('.contact-page__info')
  const els   = [photo, info].filter(Boolean)
  if (!els.length) return

  gsap.set(els, { opacity: 0, y: 32 })
  gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.18, delay: 0.25, ease: 'power3.out' })
}

// ─── 7. Set active nav item ───────────────────────────────────────────────────

function setActiveNav() {
  const path = window.location.pathname
  document.querySelectorAll('.nav-overlay__item').forEach(link => {
    const href = link.getAttribute('href') || ''
    const isActive = path === href || (path === '/' && href === '/') ||
                     (path !== '/' && href.includes(path.replace('.html', '')))
    link.classList.toggle('is-active', isActive)
  })
}

// ─── 8. Status bar center content per page ────────────────────────────────────

const STATUS_BAR = {
  home:     '<a href="/projects.html">View All Projects</a>',
  projects: '<a href="/about.html">About the Studio</a>',
  about:    '',
  contact:  '<a href="https://instagram.com/neguslighting" target="_blank" rel="noopener">Instagram</a>&nbsp;&nbsp;<a href="#" target="_blank" rel="noopener">Facebook</a>',
}

function updateStatusBar(namespace) {
  const center = document.getElementById('statusBarCenter')
  if (center) center.innerHTML = STATUS_BAR[namespace] || ''
}

function getNamespace() {
  return document.querySelector('[data-barba-namespace]')?.dataset.barbaNamespace || ''
}

// ─── 9. Page-level init ───────────────────────────────────────────────────────

function initPageFeatures() {
  const ns = getNamespace()
  updateStatusBar(ns)
  initHomeCycle()
  initHomeCasesSlider()
  initProjectsCarousel()

  // Register custom scroller proxy BEFORE creating ScrollTrigger instances
  const scroller = getScroller()
  registerScrollerProxy(scroller)

  initScrollReveal()
  initParallax()
  initMagneticElements()
  setActiveNav()

  // Wait for fonts before refreshing so text reflow from font-swap
  // doesn't invalidate the trigger positions we just registered.
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh(true))
  })
}

// ─── Barba page transitions ────────────────────────────────────────────────────

barba.init({
  transitions: [{
    name: 'default',
    leave({ current }) {
      // Kill all ScrollTriggers before leaving so they don't bleed into the next page
      ScrollTrigger.killAll()

      // Force-close the nav overlay immediately so its animation doesn't
      // race with the page transition and leave visual artifacts.
      const overlay = document.getElementById('navOverlay')
      const curtain = document.getElementById('navCurtain')
      if (overlay) {
        gsap.killTweensOf(overlay)
        gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none', opacity: 0 })
      }
      if (curtain) {
        gsap.killTweensOf(curtain.querySelectorAll('.nav-curtain__panel'))
        gsap.set(curtain, { visibility: 'hidden' })
      }
      navIsOpen = false
      // Reset burger icon bars
      const bars = document.querySelectorAll('.burger-icon span')
      gsap.set(bars[0], { y: 0, rotation: 0 })
      gsap.set(bars[1], { opacity: 1 })
      gsap.set(bars[2], { y: 0, rotation: 0 })

      if (window.homeCycleTimer) clearInterval(window.homeCycleTimer)

      return gsap.to(current.container, {
        opacity: 0, y: -40, duration: 0.45, ease: 'power3.in'
      })
    },
    enter({ next }) {
      // Reset scroll position on the new page's scroll container
      const scroller = next.container.querySelector('.about-page, .projects-page')
      if (scroller) scroller.scrollTop = 0
      // Home uses the main element itself as scroller
      if (next.namespace === 'home') next.container.scrollTop = 0

      gsap.set(next.container, { opacity: 0, y: 50 })
      return gsap.to(next.container, {
        opacity: 1, y: 0, duration: 0.65, ease: 'power3.out'
      })
    },
    afterEnter() {
      // Defer init so the browser completes layout recalculation after
      // the Barba container swap. Without this, querySelectorAll finds
      // elements but their layout rects are stale, causing ScrollTrigger
      // to bake in wrong positions and entrance animations to misfire.
      setTimeout(() => {
        initPageEntrance()
        initPageFeatures()
      }, 50)
    }
  }]
})

// ─── Boot ─────────────────────────────────────────────────────────────────────

initCursor()
initHamburger()
initGallery()
initPageFeatures()
initPageEntrance()
