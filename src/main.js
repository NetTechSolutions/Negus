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
  '/src/assets/images/hero/hero_1.jpeg',
  '/src/assets/images/hero/hero_2.jpg',
  '/src/assets/images/hero/hero_3.jpeg',
  '/src/assets/images/projects/multicare-dental/01.jpg',
  '/src/assets/images/projects/multicare-dental/02.jpg',
  '/src/assets/images/projects/aventra-pharmacy/01.jpg',
  '/src/assets/images/projects/aventra-pharmacy/02.jpg',
  '/src/assets/images/projects/kims-apparel/01.jpg',
  '/src/assets/images/projects/chaneys-hair/01.jpg',
  '/src/assets/images/projects/chaneys-hair/02.jpg',
  '/src/assets/images/projects/luxehub/01.jpg',
  '/src/assets/images/projects/luxehub/02.jpg',
]

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
    galleryCurrent = index
    updateSlide()
    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'all' })
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    if (trigger) trigger.textContent = 'Close'
  }

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
}

// ─── 4. Home cycling thumbnails ───────────────────────────────────────────────
// Colours are sampled from each project image; pre-defined here as brand-adjacent tones.
// Wheel-down / click → next; wheel-up → prev. No auto-timer.

const HOME_BG = ['#26211d', '#1c1b18', '#1d191d']

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
      counter.textContent = `${String(current + 1).padStart(2, '0')} — ${String(total).padStart(2, '0')}`
    }
  }

  // Set initial state (no animation on first load)
  hero.style.backgroundColor = HOME_BG[0]
  thumbs[0]?.classList.add('is-active')
  gsap.set(thumbs[0], { opacity: 1 })
  if (counter) counter.textContent = `01 — ${String(total).padStart(2, '0')}`

  // Wheel: down = next, up = prev
  hero.addEventListener('wheel', e => {
    if (locked) return
    locked = true
    setTimeout(() => { locked = false }, 750)
    showThumb(e.deltaY > 0 ? current + 1 : current - 1)
  }, { passive: true })

  // Click on the active thumbnail → next
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', e => {
      e.preventDefault()
      showThumb(current + 1)
    })
  })
}

// ─── 5. Projects vertical list — hover preview image ──────────────────────────

function initProjectsList() {
  const items   = document.querySelectorAll('.projects-item')
  const preview = document.getElementById('projectsPreview')
  const inner   = preview?.querySelector('.projects-preview__inner')
  const img     = document.getElementById('projectsPreviewImg')
  if (!items.length || !preview) return

  let mouseX = window.innerWidth  / 2
  let mouseY = window.innerHeight / 2
  let raf    = null

  function trackMouse(e) {
    mouseX = e.clientX
    mouseY = e.clientY
  }

  function animatePreview() {
    gsap.set(preview, { x: mouseX, y: mouseY })
    raf = requestAnimationFrame(animatePreview)
  }

  items.forEach(item => {
    const src = item.dataset.img

    item.addEventListener('mouseenter', () => {
      if (src && img) {
        img.src = src
      }
      inner?.classList.add('is-visible')
      if (!raf) {
        window.addEventListener('mousemove', trackMouse)
        raf = requestAnimationFrame(animatePreview)
      }
    })

    item.addEventListener('mouseleave', () => {
      inner?.classList.remove('is-visible')
    })
  })

  // Stop tracking when leaving the list entirely
  document.querySelector('.projects-list')?.addEventListener('mouseleave', () => {
    inner?.classList.remove('is-visible')
    if (raf) {
      cancelAnimationFrame(raf)
      raf = null
      window.removeEventListener('mousemove', trackMouse)
    }
  })
}

// ─── 5b. Projects image / card view ──────────────────────────────────────────

function initProjectsCardView() {
  const cards = document.getElementById('projectsCards')
  const track = document.getElementById('projectsCardsTrack')
  const fill  = document.getElementById('projectsProgressFill')
  if (!cards || !track) return

  let currentX = 0
  let targetX  = 0
  let raf      = null

  // Called live so it reads correct scrollWidth after display:block
  function getMax() {
    return Math.max(0, track.scrollWidth - window.innerWidth)
  }

  function updateFill() {
    const max = getMax()
    if (fill && max > 0) fill.style.width = (Math.abs(currentX) / max * 100) + '%'
  }

  function tick() {
    currentX += (targetX - currentX) * 0.1
    if (Math.abs(currentX - targetX) < 0.1) currentX = targetX
    gsap.set(track, { x: currentX })
    updateFill()
    raf = currentX !== targetX ? requestAnimationFrame(tick) : null
  }

  cards.addEventListener('wheel', e => {
    e.preventDefault()
    targetX = gsap.utils.clamp(-getMax(), 0, targetX - e.deltaY)
    if (!raf) raf = requestAnimationFrame(tick)
  }, { passive: false })
}

// ─── 5c. View toggle (list ↔ image) ──────────────────────────────────────────

let _viewToggleHandler = null

function initViewToggle() {
  const toggleBtn   = document.getElementById('viewToggleBtn')
  const listView    = document.getElementById('projectsList')
  const cardView    = document.getElementById('projectsCards')
  const listPreview = document.getElementById('projectsPreview')
  if (!toggleBtn || !listView || !cardView) return

  if (_viewToggleHandler) toggleBtn.removeEventListener('click', _viewToggleHandler)

  function setView(mode) {
    const isCard = mode === 'card'
    listView.style.display = isCard ? 'none' : ''
    if (listPreview) listPreview.style.display = isCard ? 'none' : ''
    cardView.classList.toggle('is-active', isCard)
    toggleBtn.textContent = isCard ? 'List View' : 'Image View'
  }

  _viewToggleHandler = () => setView(cardView.classList.contains('is-active') ? 'list' : 'card')
  toggleBtn.addEventListener('click', _viewToggleHandler)
}

function initProjectsCarousel() {
  initProjectsList()
  initProjectsCardView()
  initViewToggle()
}

// ─── 6. Scroll reveal (ScrollTrigger) ─────────────────────────────────────────

function getScroller() {
  const ns = getNamespace()
  if (ns === 'home')  return document.querySelector('[data-barba-namespace="home"]') || window
  if (ns === 'about') return document.querySelector('.about-page') || window
  return window
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
}

// ─── 11. Parallax ─────────────────────────────────────────────────────────────

function initParallax() {
  const scroller = getScroller()

  // Featured project bg — subtle vertical drift on scroll
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

  // About editorial photo — scale + drift
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

  // Navbar + status bar only animate once on first load — they persist across navigations
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
  if (!line1) return

  gsap.set([line1, line2], { yPercent: 110 })
  gsap.set([meta, thumb].filter(Boolean), { opacity: 0 })

  gsap.timeline({ delay: 0.25 })
    .to(line1, { yPercent: 0, duration: 1.2, ease: 'menuEase' })
    .to(line2, { yPercent: 0, duration: 1.2, ease: 'menuEase' }, '-=0.9')
    .to(meta,  { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.55')
    .to(thumb, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.55')
}

function _entranceAbout() {
  const words  = document.querySelectorAll('.about-top__line .about-top__word')
  const status = document.querySelectorAll('.about-top__status span')
  if (!words.length) return

  gsap.set(words,  { yPercent: 110 })
  gsap.set(status, { opacity: 0, y: 12 })

  gsap.timeline({ delay: 0.25 })
    .to(words,  { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'menuEase' })
    .to(status, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
}

function _entranceProjects() {
  const title  = document.querySelector('.projects-header__title')
  const scroll = document.querySelector('.projects-header__scroll')
  const items  = document.querySelectorAll('.projects-item')
  if (!items.length) return

  gsap.set([title, scroll].filter(Boolean), { opacity: 0, y: -16 })
  gsap.set(items, { opacity: 0, x: -24 })

  gsap.to([title, scroll].filter(Boolean), {
    opacity: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.25, ease: 'power3.out'
  })
  gsap.to(items, {
    opacity: 1, x: 0, duration: 0.55, stagger: 0.07, delay: 0.35, ease: 'power3.out'
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

// Removed STATUS_BAR logic

function getNamespace() {
  return document.querySelector('[data-barba-namespace]')?.dataset.barbaNamespace || ''
}

// ─── 9. Page-level init ───────────────────────────────────────────────────────

function initPageFeatures() {
  const ns = getNamespace()
  initHomeCycle()
  initHomeCasesSlider()
  initProjectsCarousel()
  initScrollReveal()
  initParallax()
  initMagneticElements()
  setActiveNav()
  ScrollTrigger.refresh()
}

// ─── Barba page transitions ────────────────────────────────────────────────────

barba.init({
  transitions: [{
    name: 'default',
    leave({ current }) {
      return gsap.to(current.container, {
        opacity: 0, y: -40, duration: 0.45, ease: 'power3.in'
      })
    },
    enter({ next }) {
      gsap.set(next.container, { opacity: 0, y: 50 })
      return gsap.to(next.container, {
        opacity: 1, y: 0, duration: 0.65, ease: 'power3.out'
      })
    },
    afterEnter() {
      initPageFeatures()
      initPageEntrance()
    }
  }]
})

// ─── Boot ─────────────────────────────────────────────────────────────────────

initCursor()
initHamburger()
initGallery()
initPageFeatures()
initPageEntrance()
