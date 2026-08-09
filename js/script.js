// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initScrollReveal();
  initTypedCode();
  initProjectFilter();
  initProjectModal();
  initContactForm();
  initScrollTop();
});

function setYear(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
}

// ==========================================================================
// MOBILE MENU
// ==========================================================================
function initMobileMenu(){
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if(!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  menu.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}

function closeMobileMenu(){
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if(!toggle || !menu) return;
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

// ==========================================================================
// SMOOTH SCROLL (with sticky-nav offset)
// ==========================================================================
function initSmoothScroll(){
  const nav = document.getElementById('nav');
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if(!id || id === '#') return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });
}

// ==========================================================================
// ACTIVE NAV LINK ON SCROLL
// ==========================================================================
function initActiveNav(){
  const sections = ['home','about','skills','projects','experience','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav__link[data-nav]');

  if(!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

// ==========================================================================
// SCROLL REVEAL
// ==========================================================================
function initScrollReveal(){
  const items = document.querySelectorAll('[data-reveal]');
  if(!items.length) return;

  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
}

// ==========================================================================
// TYPED CODE EFFECT (hero editor)
// ==========================================================================
function initTypedCode(){
  const codeEl = document.getElementById('typedCode');
  const cursorEl = document.getElementById('typedCursor');
  if(!codeEl) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lines = [
    { text: 'const developer = {', cls: '' },
    { text: '  name: ', cls: '', cont: [{t:'"Jan Paul Daguman"', c:'tok-str'}, {t:',', c:'tok-punc'}] },
    { text: '  role: ', cls: '', cont: [{t:'"Front-End / Full-Stack Developer"', c:'tok-str'}, {t:',', c:'tok-punc'}] },
    { text: '  stack: ', cls: '', cont: [{t:'["PHP", "Laravel", "React", "WordPress"]', c:'tok-str'}, {t:',', c:'tok-punc'}] },
    { text: '  location: ', cls: '', cont: [{t:'"Philippines"', c:'tok-str'}, {t:',', c:'tok-punc'}] },
    { text: '', special: 'build' },
    { text: '};', cls: '' },
  ];

  if(prefersReduced){
    renderStatic(codeEl, lines);
    if(cursorEl) cursorEl.style.display = 'none';
    return;
  }

  let lineIndex = 0;

  function typeLine(){
    if(lineIndex >= lines.length){
      // brief pause, then restart
      setTimeout(() => {
        codeEl.innerHTML = '';
        lineIndex = 0;
        typeLine();
      }, 3200);
      return;
    }

    const line = lines[lineIndex];
    const container = document.createElement('div');
    codeEl.appendChild(container);

    if(line.special === 'build'){
      container.innerHTML = '  <span class="tok-fn">build</span><span class="tok-punc">(</span><span class="tok-kw">app</span><span class="tok-punc">)</span><span class="tok-punc">;</span> <span class="tok-com">// let\'s ship it</span>';
      lineIndex++;
      setTimeout(typeLine, 260);
      return;
    }

    const prefix = line.text;
    let charIndex = 0;

    function typePrefix(){
      if(charIndex <= prefix.length){
        container.textContent = prefix.slice(0, charIndex);
        charIndex++;
        setTimeout(typePrefix, 16);
      } else if(line.cont){
        line.cont.forEach(part => {
          const span = document.createElement('span');
          span.className = part.c;
          span.textContent = part.t;
          container.appendChild(span);
        });
        lineIndex++;
        setTimeout(typeLine, 180);
      } else {
        lineIndex++;
        setTimeout(typeLine, 140);
      }
    }
    typePrefix();
  }

  typeLine();
}

function renderStatic(codeEl, lines){
  codeEl.textContent = lines.map(l => l.special === 'build' ? '  build(app); // let\'s ship it' : (l.text + (l.cont ? l.cont.map(c=>c.t).join('') : ''))).join('\n');
}

// ==========================================================================
// PROJECT FILTERING
// ==========================================================================
function initProjectFilter(){
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if(!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      buttons.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });

      cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        const show = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });
}

// ==========================================================================
// PROJECT CASE STUDY MODAL
// ==========================================================================
const PROJECT_DATA = {
  skillswap: {
    category: 'Mobile Application',
    title: 'SkillSwap Balingasag',
    problem: 'People in the community often need small local services — tutoring, repairs, errands — but have no easy, trustworthy way to find who nearby offers them.',
    solution: 'A mobile-first app concept where users create simple listings for services they offer or need, browse nearby offers, and connect directly — built with a React Native front end and a REST API backend.',
    features: [
      'Service discovery feed with search and categories',
      'User profiles for service providers',
      'Mobile-first, cross-platform interface with Expo',
      'REST API layer connected to a MySQL backend'
    ],
    outcome: 'A functioning application concept and architecture demonstrating mobile UI/UX design, state management, and API integration for a real community use case.',
    stack: ['React Native', 'Expo', 'TypeScript', 'REST API', 'MySQL'],
    link: '#', github: '#'
  },
  woocommerce: {
    category: 'E-Commerce',
    title: 'WooCommerce Store Customization',
    problem: 'A WordPress-based store needed product pages, checkout flow, and layout that felt custom rather than default WooCommerce styling.',
    solution: 'Customized WooCommerce templates and functionality — product presentation, cart and checkout adjustments, and layout work — while keeping the store easy for the client to manage.',
    features: [
      'Custom product page layouts',
      'Checkout flow adjustments for a smoother purchase path',
      'Responsive store design across devices',
      'Client-manageable product and inventory setup'
    ],
    outcome: 'A store that better reflects the brand while remaining fully manageable through the WordPress/WooCommerce admin the client already knows.',
    stack: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'CSS3'],
    link: '#', github: '#'
  },
  ata: {
    category: 'WordPress',
    title: 'ATA Photo Booths',
    problem: 'A photo booth rental business needed a website that presents their packages clearly and makes it easy for visitors to get in touch.',
    solution: 'Developed and customized a WordPress website with a clear service presentation and responsive layout suited to the business.',
    features: [
      'Service and package presentation',
      'Responsive layout across devices',
      'Clear contact and inquiry path for visitors'
    ],
    outcome: 'A working business website that presents the service clearly to potential customers.',
    stack: ['WordPress', 'Elementor', 'CSS3'],
    link: '#', github: '#'
  },
  constantin: {
    category: 'WordPress',
    title: 'Constantin Floors',
    problem: 'A flooring business needed a professional website to showcase their services and product range to potential customers.',
    solution: 'Built and customized a WordPress business website with a layout focused on showcasing services and making contact simple.',
    features: [
      'Service and product showcase pages',
      'Responsive, business-focused layout',
      'Customized WordPress theme functionality'
    ],
    outcome: 'A professional web presence for the business, built and customized on WordPress.',
    stack: ['WordPress', 'PHP', 'CSS3'],
    link: '#', github: '#'
  },
  memory: {
    category: 'WordPress · E-Commerce',
    title: 'Memory Creations',
    problem: 'A local custom-products business — ref magnets, keychains, stickers, and personalized items — needed a website that presents products clearly and drives inquiries or orders.',
    solution: 'Built a WordPress website focused on product presentation, with a responsive layout and clear calls-to-action guiding visitors toward ordering.',
    features: [
      'Product-focused page layouts',
      'Responsive design for browsing on mobile',
      'Clear calls-to-action for orders and inquiries'
    ],
    outcome: 'A business-focused website that presents the product range clearly and makes it easy for customers to reach out.',
    stack: ['WordPress', 'WooCommerce', 'CSS3'],
    link: '#', github: '#'
  },
  custom: {
    category: 'Custom Application',
    title: 'Custom Web Application',
    problem: 'A business needed a tool tailored to its own workflow rather than a generic off-the-shelf system.',
    solution: 'Built a custom web application on Laravel with a MySQL database and a REST API, paired with a Tailwind CSS front end designed around the specific workflow.',
    features: [
      'Custom Laravel backend with a MySQL database',
      'REST API for front-end and integration use',
      'Tailwind CSS interface built around the client\'s workflow',
      'Role-based structure suited to business needs'
    ],
    outcome: 'A working application tailored to the business\'s process, built for maintainability going forward.',
    stack: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS'],
    link: '#', github: '#'
  }
};

function initProjectModal(){
  const modal = document.getElementById('projectModal');
  if(!modal) return;

  const openButtons = document.querySelectorAll('[data-open-project]');
  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  let lastFocused = null;

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-open-project');
      const data = PROJECT_DATA[key];
      if(!data) return;
      populateModal(data);
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal__close').focus();
    });
  });

  closeButtons.forEach(el => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && !modal.hidden) closeModal();
  });

  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
  }
}

function populateModal(data){
  document.getElementById('modalCategory').textContent = data.category;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalProblem').textContent = data.problem;
  document.getElementById('modalSolution').textContent = data.solution;
  document.getElementById('modalOutcome').textContent = data.outcome;

  const featuresEl = document.getElementById('modalFeatures');
  featuresEl.innerHTML = '';
  data.features.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    featuresEl.appendChild(li);
  });

  const stackEl = document.getElementById('modalStack');
  stackEl.innerHTML = '';
  data.stack.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    stackEl.appendChild(li);
  });

  const linkEl = document.getElementById('modalLink');
  const githubEl = document.getElementById('modalGithub');
  linkEl.href = data.link;
  githubEl.href = data.github;
}

// ==========================================================================
// CONTACT FORM VALIDATION (front-end only)
// ==========================================================================
function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;

  const status = document.getElementById('formStatus');

  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    projectType: (v) => v ? '' : 'Please select a project type.',
    budget: (v) => v ? '' : 'Please select a budget range.',
    message: (v) => v.trim().length >= 10 ? '' : 'Please add a few more details (at least 10 characters).'
  };

  Object.keys(validators).forEach(field => {
    const input = form.elements[field];
    if(!input) return;
    input.addEventListener('blur', () => validateField(field));
    input.addEventListener('input', () => {
      const fieldEl = input.closest('.form-field');
      if(fieldEl && fieldEl.classList.contains('has-error')) validateField(field);
    });
  });

  function validateField(field){
    const input = form.elements[field];
    const errorEl = document.getElementById(`${field}Error`);
    const fieldEl = input.closest('.form-field');
    const message = validators[field](input.value);

    if(message){
      fieldEl.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      fieldEl.classList.remove('has-error');
      errorEl.textContent = '';
    }
    return !message;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    const fields = Object.keys(validators);
    const results = fields.map(validateField);
    const allValid = results.every(Boolean);

    if(!allValid){
      status.textContent = 'Please fix the highlighted fields above.';
      status.classList.add('is-error');
      return;
    }

    // NOTE: No backend is connected yet. Replace this block with a real
    // request to your API endpoint, e.g.:
    //
    // fetch('https://your-api-endpoint.com/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(Object.fromEntries(new FormData(form)))
    // })
    //   .then(res => res.ok ? onSuccess() : onError())
    //   .catch(onError);

    status.textContent = "Thanks — this form isn't connected to a backend yet, but validation works. Reach out directly via email in the meantime.";
    form.reset();
  });
}

// ==========================================================================
// SCROLL TO TOP
// ==========================================================================
function initScrollTop(){
  const btn = document.getElementById('scrollTop');
  if(!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
