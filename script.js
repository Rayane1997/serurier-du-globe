/* ============================================
   SERRURERIE DU GLOBE - ANIMATIONS SCRIPT
   ============================================ */

(function() {
  'use strict';

  // ==================
  // UTILITIES
  // ==================

  // Store cleanup functions for event listeners
  const cleanupFunctions = [];

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ==================
  // SCROLL REVEAL ANIMATIONS
  // ==================

  function initScrollReveal() {
    if (prefersReducedMotion) return;

    // Elements to animate on scroll
    const revealElements = document.querySelectorAll(`
      .service-card,
      .service-card-new,
      .reassurance-item,
      .atelier-content,
      .atelier-image,
      .contact-info,
      .contact-form-wrapper
    `);

    // Add scroll-reveal class to elements
    revealElements.forEach(el => {
      el.classList.add('scroll-reveal');
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optionally unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Stagger animation for grid items
    const gridContainers = document.querySelectorAll('.services-grid, .services-grid-new, .reassurance-grid');

    gridContainers.forEach(grid => {
      const items = grid.querySelectorAll('.service-card, .service-card-new, .reassurance-item');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
      });
    });
  }

  // ==================
  // SMOOTH SCROLL
  // ==================

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    if (links.length === 0) return;

    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 80;

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Skip if it's just "#"
        if (href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = targetPosition - headerHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==================
  // PARALLAX EFFECT
  // ==================

  function initParallax() {
    if (prefersReducedMotion) return;

    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) return;

    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;

      // Only apply parallax when hero is visible
      if (scrolled < window.innerHeight) {
        requestAnimationFrame(() => {
          if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
          }
        });
      }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Store cleanup function
    cleanupFunctions.push(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  // ==================
  // SERVICE CARD HOVER ANIMATIONS
  // ==================

  function initServiceCardAnimations() {
    if (prefersReducedMotion) return;

    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length === 0) return;

    serviceCards.forEach(card => {
      const icon = card.querySelector('.service-icon');

      card.addEventListener('mouseenter', () => {
        if (icon) {
          icon.style.animation = 'iconBounce 0.6s ease';
        }
      });

      card.addEventListener('mouseleave', () => {
        if (icon) {
          icon.style.animation = '';
        }
      });

      // Reset animation to allow replay
      if (icon) {
        card.addEventListener('animationend', (e) => {
          if (e.animationName === 'iconBounce') {
            icon.style.animation = '';
          }
        });
      }
    });

    // Also animate reassurance icons
    const reassuranceItems = document.querySelectorAll('.reassurance-item');
    if (reassuranceItems.length === 0) return;

    reassuranceItems.forEach(item => {
      const icon = item.querySelector('.reassurance-icon');

      item.addEventListener('mouseenter', () => {
        if (icon) {
          icon.style.animation = 'iconPulse 0.8s ease';
        }
      });

      item.addEventListener('mouseleave', () => {
        if (icon) {
          icon.style.animation = '';
        }
      });
    });
  }

  // ==================
  // COUNTER ANIMATIONS
  // ==================

  function animateCounter(element, target, duration = 2000) {
    if (prefersReducedMotion) {
      element.textContent = target;
      return;
    }

    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  function initCounters() {
    if (prefersReducedMotion) return;

    // Counter elements (for future use)
    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length === 0) return;

    const observerOptions = {
      root: null,
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-counter'));
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
  }

  // ==================
  // HEADER SCROLL EFFECT
  // ==================

  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const handleScroll = throttle(() => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Store cleanup function
    cleanupFunctions.push(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }

  // ==================
  // HERO CONTENT ANIMATION
  // ==================

  function initHeroAnimation() {
    if (prefersReducedMotion) return;

    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    // Animate hero elements sequentially
    const heroElements = [
      '.hero-badge',
      '.hero-title',
      '.hero-location',
      '.hero-description',
      '.hero-cta'
    ];

    heroElements.forEach((selector, index) => {
      const element = heroContent.querySelector(selector);
      if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';

        setTimeout(() => {
          element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
      }
    });
  }

  // ==================
  // FORM ENHANCEMENTS
  // ==================

  function initFormAnimations() {
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select');
    if (formInputs.length === 0) return;

    formInputs.forEach(input => {
      // Add focus animations
      input.addEventListener('focus', () => {
        if (input.parentElement) {
          input.parentElement.classList.add('focused');
        }
      });

      input.addEventListener('blur', () => {
        if (!input.value && input.parentElement) {
          input.parentElement.classList.remove('focused');
        }
      });

      // Floating label effect (if needed in future)
      if (input.value && input.parentElement) {
        input.parentElement.classList.add('focused');
      }
    });
  }

  // ==================
  // MOBILE MENU TOGGLE
  // ==================

  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }

  // ==================
  // FORM VALIDATION & SUBMISSION
  // ==================

  function initFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    // Custom validation messages
    const validationMessages = {
      name: 'Veuillez entrer votre nom complet (au moins 2 caractères)',
      phone: 'Veuillez entrer un numéro de téléphone valide',
      email: 'Veuillez entrer une adresse email valide',
      service: 'Veuillez sélectionner un type de service',
      message: 'Veuillez entrer votre message (au moins 10 caractères)'
    };

    // Validation functions
    const validators = {
      name: (value) => value.trim().length >= 2,
      phone: (value) => /^[\d\s\+\-\(\)]{8,}$/.test(value.trim()),
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      service: (value) => value.trim() !== '',
      message: (value) => value.trim().length >= 10
    };

    // Show error message
    function showError(input, message) {
      const formGroup = input.parentElement;
      let errorDiv = formGroup.querySelector('.error-message');

      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
      }

      errorDiv.textContent = message;
      formGroup.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
    }

    // Clear error message
    function clearError(input) {
      const formGroup = input.parentElement;
      const errorDiv = formGroup.querySelector('.error-message');

      if (errorDiv) {
        errorDiv.remove();
      }

      formGroup.classList.remove('error');
      input.removeAttribute('aria-invalid');
    }

    // Validate single field
    function validateField(input) {
      const fieldName = input.name;
      const value = input.value;

      if (!validators[fieldName]) return true;

      if (validators[fieldName](value)) {
        clearError(input);
        return true;
      } else {
        showError(input, validationMessages[fieldName]);
        return false;
      }
    }

    // Add real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value) {
          validateField(input);
        }
      });

      input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    // Form submission handler with EmailJS
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let isValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.classList.add('loading');
      submitButton.setAttribute('aria-busy', 'true');

      try {
        // Send email using EmailJS
        const result = await emailjs.sendForm(
          'service_dt8a1c7',
          'template_cyq449f',
          form
        );

        console.log('Email sent successfully:', result);

        // Show success message
        showFormMessage('success', 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');

        // Reset form
        form.reset();
        inputs.forEach(input => clearError(input));

      } catch (error) {
        console.error('Email sending failed:', error);
        // Show error message
        showFormMessage('error', 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement par téléphone au +32 475 76 08 30.');
      } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('aria-busy');
      }
    });

    // Show form message
    function showFormMessage(type, message) {
      // Remove existing message
      const existingMessage = form.querySelector('.form-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Create new message
      const messageDiv = document.createElement('div');
      messageDiv.className = `form-message form-message-${type}`;
      messageDiv.textContent = message;
      messageDiv.setAttribute('role', 'alert');

      // Insert at top of form
      form.insertBefore(messageDiv, form.firstChild);

      // Scroll to message
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Auto-remove after 10 seconds
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
      }, 10000);
    }
  }

  // ==================
  // LOADING ANIMATION
  // ==================

  function initPageLoadAnimation() {
    if (prefersReducedMotion) return;

    // Add loaded class to body when DOM is ready
    document.body.style.opacity = '0';

    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
      });
    });
  }

  // ==================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ==================

  function addAnimationClasses() {
    // Add animation classes based on viewport visibility
    const animatedElements = document.querySelectorAll('.hero-badge, .section-title, .section-subtitle');

    animatedElements.forEach((el, index) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2
      });

      if (!prefersReducedMotion) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      }
    });
  }

  // ==================
  // CLEANUP
  // ==================

  function cleanup() {
    // Execute all cleanup functions
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions.length = 0;
  }

  // Expose cleanup function globally if needed
  window.cleanupAnimations = cleanup;


  // ==================
  // INITIALIZATION
  // ==================

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initPageLoadAnimation();
    initHeroAnimation();
    initScrollReveal();
    initSmoothScroll();
    initParallax();
    initServiceCardAnimations();
    initCounters();
    initHeaderScroll();
    initFormAnimations();
    initFormValidation();
    initMobileMenu();
    addAnimationClasses();
  }

  // Start initialization
  init();

  // Cleanup on page unload (for SPAs)
  window.addEventListener('beforeunload', cleanup);

})();
