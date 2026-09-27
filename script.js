/* =========================================================
   CONFIG — replace these before deploying
========================================================= */
const CONFIG = {
  emailJsPublicKey: "YOUR_PUBLIC_KEY",
  emailJsServiceId: "YOUR_SERVICE_ID",
  emailJsTemplateId: "YOUR_TEMPLATE_ID",
  whatsappNumber: "923208644283", // international format, no + or leading 0
  // Formspree endpoint: create a form at https://formspree.io and paste the endpoint below
  // Example: "https://formspree.io/f/mnqlkzvp"
  formspreeEndpoint: "https://formspree.io/f/mgavnjpz" 
};

/* =========================================================
   Loader
========================================================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => loader.classList.add("loaded"), 500);
});

/* =========================================================
   Scroll progress + header state + back-to-top
========================================================= */
const header = document.getElementById("site-header");
const progressBar = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + "%";

  header.classList.toggle("scrolled", scrollTop > 40);
  backToTop.classList.toggle("visible", scrollTop > 500);
}
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================================
   Mobile nav toggle
========================================================= */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("[data-nav]").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
  });
});

/* =========================================================
   Typing animation (hero role line)
========================================================= */
const roles = [
  "Full-Stack Web Developer",
  "MERN Stack Engineer",
  "Python & Django Developer",
  "REST API Builder"
];
const typedEl = document.getElementById("typed-role");
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

/* =========================================================
   Scroll reveal + skill bar fill + counters (IntersectionObserver)
========================================================= */
const revealTargets = document.querySelectorAll(
  ".section-head, .about-body, .skill-group, .timeline-item, .project-card, .hire-card, .testimonial-card, #contact-form, .contact-direct"
);
revealTargets.forEach(el => el.setAttribute("data-reveal", ""));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

// Skill bars
document.querySelectorAll(".skill-group .bar").forEach(bar => {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("filled");
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  barObserver.observe(bar);
});

// Animated counters
document.querySelectorAll(".counter").forEach(counter => {
  const target = parseInt(counter.dataset.target, 10);
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let current = 0;
        const duration = 1200;
        const stepTime = 16;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = Math.floor(current);
        }, stepTime);

        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counterObserver.observe(counter);
});

/* =========================================================
   Contact form — EmailJS + WhatsApp fallback
========================================================= */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const whatsappBtn = document.getElementById("whatsapp-continue");
const resumeBtn = document.getElementById("resume-btn");

if (window.emailjs && CONFIG.emailJsPublicKey !== "YOUR_PUBLIC_KEY") {
  try {
    emailjs.init(CONFIG.emailJsPublicKey);
    console.log('EmailJS initialized');
  } catch (err) {
    console.warn('EmailJS init failed', err);
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.from_name.value.trim();
  const email = form.from_email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !subject || !message) {
    statusEl.textContent = "Please fill in every field before sending.";
    statusEl.className = "error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  statusEl.textContent = "";
  statusEl.className = "";

  const sendPromise =
    window.emailjs && CONFIG.emailJsPublicKey !== "YOUR_PUBLIC_KEY"
      ? emailjs.send(CONFIG.emailJsServiceId, CONFIG.emailJsTemplateId, {
          from_name: name,
          from_email: email,
          subject: subject,
          message: message
        })
      : // Try Formspree fallback, then mailto
        (function () {
          if (CONFIG.formspreeEndpoint && CONFIG.formspreeEndpoint !== "") {
            // Post JSON to Formspree endpoint
            return fetch(CONFIG.formspreeEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, subject, message })
            }).then(res => {
              if (res.ok) return res.json();
              return Promise.reject(new Error('Formspree returned ' + res.status));
            });
          }

          // Last resort: mailto fallback
          return new Promise((resolve, reject) => {
            try {
              const mailto = `mailto:${encodeURIComponent('hshaheer40@gmail.com')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " <" + email + ">\n\n" + message)}`;
              window.location.href = mailto;
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        })();

  sendPromise
    .then(() => {
      statusEl.textContent = "Message sent — thanks, I'll get back to you soon.";
      statusEl.className = "success";
      showWhatsappContinue(name, subject, message);
      form.reset();
    })
    .catch(() => {
      statusEl.textContent =
        "Could not send via email right now. You can continue on WhatsApp instead.";
      statusEl.className = "error";
      showWhatsappContinue(name, subject, message);
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    });
});

function showWhatsappContinue(name, subject, message) {
  const text = `Hi Shaheer, I'm ${name}. Regarding "${subject}": ${message}`;
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
  whatsappBtn.href = url;
  whatsappBtn.hidden = false;
}

// Generate PDF resume using jsPDF
function generateResumePdf() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const left = 40;
    let y = 40;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Shaheer Hassan', left, y);
    y += 22;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Full-Stack Web Developer', left, y);
    y += 18;
    doc.text('Email: hshaheer40@gmail.com  |  Phone: +92 320 8644283', left, y);
    y += 20;

    doc.setDrawColor(200);
    doc.line(left, y, 555, y);
    y += 18;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', left, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const summary = 'Experienced Full-Stack Web Developer with expertise in MERN stack and Python/Django. Skilled in building scalable web applications, RESTful APIs, database design (PostgreSQL, MongoDB), and deploying production-ready systems.';
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(summary, 520), left, y);
    y += doc.getTextDimensions(doc.splitTextToSize(summary, 520)).h + 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Projects', left, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const projects = [
      'Bank Management System — https://github.com/shaheer2005/bms',
      'Learning Management System — https://github.com/shaheer2005/lms',
      'Hospital Management System — https://github.com/shaheer2005/hms',
      'E-Commerce Store — https://github.com/shaheer2005/ecommerce'
    ];
    projects.forEach(p => { doc.text(p, left, y); y += 14; });

    doc.save('Shaheer-Hassan-Resume.pdf');
  } catch (err) {
    console.error('PDF generation failed', err);
    alert('Could not generate PDF on this browser.');
  }
}

if (resumeBtn) {
  resumeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateResumePdf();
  });
}

/* =========================================================
   Custom cursor interaction (desktop only)
========================================================= */
if (window.matchMedia("(pointer: fine)").matches) {
  const cursorGlow = document.createElement("div");
  cursorGlow.style.cssText = `
    position: fixed; width: 22px; height: 22px; border: 1px solid rgba(250,204,21,0.6);
    border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%);
    transition: width .2s ease, height .2s ease, background .2s ease; mix-blend-mode: difference;
  `;
  document.body.appendChild(cursorGlow);

  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  });

  document.querySelectorAll("a, button, .project-card, .hire-card").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursorGlow.style.width = "38px";
      cursorGlow.style.height = "38px";
      cursorGlow.style.background = "rgba(250,204,21,0.12)";
    });
    el.addEventListener("mouseleave", () => {
      cursorGlow.style.width = "22px";
      cursorGlow.style.height = "22px";
      cursorGlow.style.background = "transparent";
    });
  });
}

/* =========================================================
   Lazy-load images (if real <img> assets are added later)
========================================================= */
document.querySelectorAll("img[data-src]").forEach(img => {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src;
        imgObserver.unobserve(entry.target);
      }
    });
  });
  imgObserver.observe(img);
});