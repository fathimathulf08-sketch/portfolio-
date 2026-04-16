/* =========================================
   FIDHA PORTFOLIO — script.js
   ========================================= */

'use strict';

// ---- Hero Canvas: Particle Constellation + Hexagons ----
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const PURPLE = '155,130,173';
  const N = 100;
  const RANGE = 140;
  let W, H, pts;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.offsetWidth || window.innerWidth;
    H = canvas.offsetHeight || window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    buildPoints();
  }

  function buildPoints() {
    pts = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.5,
      pulse: Math.random() * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.01,
    }));
  }

  function drawHex(cx, cy, r, rotation) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + rotation;
      i === 0
        ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
        : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    // Central ambient glow
    const grd = ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, W * 0.5);
    grd.addColorStop(0, 'rgba(155,130,173,0.06)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Mouse proximity glow
    if (mouse.x > -100) {
      const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
      mg.addColorStop(0, 'rgba(155,130,173,0.10)');
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
    }

    // Edges (connections between nearby points)
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < RANGE) {
          // Mouse boost
          const mx = (pts[i].x + pts[j].x) / 2;
          const my = (pts[i].y + pts[j].y) / 2;
          const md = Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2);
          const boost = md < 120 ? 1 + (1 - md / 120) * 1.8 : 1;
          const alpha = (1 - d / RANGE) * 0.22 * boost;

          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${PURPLE},${alpha})`;
          ctx.lineWidth = (1 - d / RANGE) * 0.8 * boost;
          ctx.stroke();
        }
      }
    }

    // Points
    for (const p of pts) {
      p.pulse += p.speed;
      const pSize = p.r + Math.sin(p.pulse) * 0.5;
      const md = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
      const proximity = md < 90 ? (1 - md / 90) : 0;
      const alpha = 0.4 + Math.sin(p.pulse * 0.7) * 0.2 + proximity * 0.4;

      // Glow ring on hover proximity
      if (proximity > 0.15) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pSize + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PURPLE},${proximity * 0.25})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PURPLE},${Math.min(alpha, 1)})`;
      ctx.fill();

      // Move & wrap
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      else if (p.y > H + 10) p.y = -10;
    }

    // Floating geometric hexagon accents
    ctx.lineWidth = 0.8;

    const h1a = 0.035 + Math.sin(t * 0.35) * 0.012;
    ctx.strokeStyle = `rgba(${PURPLE},${h1a})`;
    drawHex(W * 0.08, H * 0.18, 70 + Math.sin(t * 0.28) * 5, t * 0.06);

    const h2a = 0.025 + Math.cos(t * 0.28) * 0.01;
    ctx.strokeStyle = `rgba(${PURPLE},${h2a})`;
    drawHex(W * 0.88, H * 0.72, 52 + Math.cos(t * 0.22) * 4, -t * 0.05);

    const h3a = 0.03 + Math.sin(t * 0.5) * 0.01;
    ctx.strokeStyle = `rgba(${PURPLE},${h3a})`;
    drawHex(W * 0.5, H * 0.9, 38 + Math.sin(t * 0.4) * 3, t * 0.04);

    // Inner hex rings (smaller, offset)
    const h4a = 0.02 + Math.sin(t * 0.6) * 0.008;
    ctx.strokeStyle = `rgba(${PURPLE},${h4a})`;
    drawHex(W * 0.08, H * 0.18, 42 + Math.sin(t * 0.28) * 3, -t * 0.07);
    drawHex(W * 0.88, H * 0.72, 28 + Math.cos(t * 0.22) * 2, t * 0.07);

    // Scanning line
    const scanY = ((t * 60) % (H + 60)) - 30;
    const scanGrd = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
    scanGrd.addColorStop(0, 'rgba(155,130,173,0)');
    scanGrd.addColorStop(0.5, 'rgba(155,130,173,0.04)');
    scanGrd.addColorStop(1, 'rgba(155,130,173,0)');
    ctx.fillStyle = scanGrd;
    ctx.fillRect(0, scanY - 30, W, 60);

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });

  // Mouse tracking (section-relative)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    heroSection.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999;
    }, { passive: true });
  }
})();

// ---- Custom Cursor ----
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();

document.querySelectorAll('a, button, .service-card, .skill-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.6)';
    cursorFollower.style.borderColor = 'var(--purple-light)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.borderColor = 'var(--purple)';
  });
});

// ---- Scroll Progress ----
const scrollBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (window.scrollY / total) * 100;
  scrollBar.style.width = progress + '%';
}, { passive: true });

// ---- Navbar: scrolled state & active link ----
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightNav();
}, { passive: true });

function highlightNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

// ---- Smooth Scrolling ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Typing Animation ----
const roles = [
  'Digital Marketer',
  'SEO Specialist',
  'Content Creator',
  'Social Media Expert',
  'Brand Strategist',
];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeEffect() {
  const currentRole = roles[roleIndex];
  if (isDeleting) {
    typedEl.textContent = currentRole.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = currentRole.slice(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 60 : 110;

  if (!isDeleting && charIndex === currentRole.length) {
    delay = 2200;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 350;
  }

  setTimeout(typeEffect, delay);
}
setTimeout(typeEffect, 1000);

// ---- Intersection Observer: Reveal ----
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // trigger skill bar fills when skills section reveals
      if (entry.target.closest('#skills')) {
        triggerSkillBars();
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ---- Skill Bars ----
let skillsAnimated = false;

function triggerSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach(bar => {
    const w = bar.getAttribute('data-width');
    // slight delay so card reveal completes first
    setTimeout(() => {
      bar.style.width = w + '%';
    }, 200);
  });
}

// Also trigger via skill section observer independently
const skillSection = document.getElementById('skills');
if (skillSection) {
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerSkillBars();
        skillObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  skillObs.observe(skillSection);
}

// ---- Button Ripple Effect ----
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// ---- Contact Form Validation ----
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

function validate() {
  let valid = true;

  const nameEl   = document.getElementById('name');
  const emailEl  = document.getElementById('email');
  const subjectEl = document.getElementById('subject');
  const msgEl    = document.getElementById('message');

  const nameErr    = document.getElementById('nameErr');
  const emailErr   = document.getElementById('emailErr');
  const subjectErr = document.getElementById('subjectErr');
  const msgErr     = document.getElementById('msgErr');

  // Name
  if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
    nameErr.textContent = 'Please enter your full name.';
    valid = false;
  } else { nameErr.textContent = ''; }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailEl.value.trim())) {
    emailErr.textContent = 'Enter a valid email address.';
    valid = false;
  } else { emailErr.textContent = ''; }

  // Subject
  if (!subjectEl.value.trim() || subjectEl.value.trim().length < 3) {
    subjectErr.textContent = 'Please enter a subject.';
    valid = false;
  } else { subjectErr.textContent = ''; }

  // Message
  if (!msgEl.value.trim() || msgEl.value.trim().length < 10) {
    msgErr.textContent = 'Message must be at least 10 characters.';
    valid = false;
  } else { msgErr.textContent = ''; }

  return valid;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  // Simulate send
  const originalHTML = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Sending…</span><i class="fas fa-spinner fa-spin"></i>';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;
    form.reset();
    formSuccess.classList.add('show');
    // reset floating labels
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
      el.dispatchEvent(new Event('input'));
    });
    setTimeout(() => formSuccess.classList.remove('show'), 4000);
  }, 1800);
});

// ---- Parallax Orbs ----
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  const orbs = document.querySelectorAll('.orb');
  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 0.5;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
}, { passive: true });

// ---- Active section glow on timeline ----
const timelineItems = document.querySelectorAll('.timeline-item');
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.3 });
timelineItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  tlObserver.observe(item);
});

// ---- On load subtle body animation ----
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
});
