/**
 * VisionCore AI VSL Landing Page Interactivity
 * Focuses on mobile-first user experience and booking CTA optimization.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupMobileStickyCta();
  setupLeadModal();
});

/**
 * Monitors the VSL video visibility and toggles the mobile sticky bottom CTA
 * once the primary video content has been scrolled out of view.
 */
function setupMobileStickyCta() {
  const videoWrapper = document.getElementById('vsl-video-wrapper');
  const stickyCta = document.getElementById('mobile-sticky-cta');

  // Verify elements exist to prevent runtime errors
  if (!videoWrapper || !stickyCta) return;

  // Use IntersectionObserver for high performance (runs off the main thread)
  const observerOptions = {
    root: null, // Default: browser viewport
    threshold: 0 // Trigger as soon as the video completely leaves or starts entering
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const rect = entry.boundingClientRect;

      // Show the sticky CTA bar only if the user has scrolled *past* the video
      // (i.e. video is no longer visible and its top boundary is above the viewport)
      if (!entry.isIntersecting && rect.top < 0) {
        stickyCta.classList.add('show');
      } else {
        stickyCta.classList.remove('show');
      }
    });
  }, observerOptions);

  observer.observe(videoWrapper);
}

/**
 * Lead capture modal: opens on any "Book Call" click instead of redirecting,
 * handles phone auto-formatting, lightweight email validation, and submits
 * to Formspree via fetch so the form can collapse into a success state
 * in-place before sending the user on to Calendly.
 */
function setupLeadModal() {
  const overlay = document.getElementById('lead-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  const openTriggers = document.querySelectorAll('.js-book-call');
  const formView = document.getElementById('modal-form-view');
  const successView = document.getElementById('modal-success-view');
  const form = document.getElementById('lead-form');
  const phoneInput = document.getElementById('field-phone');
  const emailInput = document.getElementById('field-email');
  const errorEl = document.getElementById('form-error');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!overlay || !form) return;

  // General, permissive email check: accepts gmail.com, hotmail.com, and any
  // other address with a properly formed domain + TLD.
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  let lastFocusedElement = null;

  function openModal(event) {
    if (event) event.preventDefault();
    lastFocusedElement = document.activeElement;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = document.getElementById('field-name');
    if (firstField) firstField.focus();
  }

  function closeModal() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetModal();
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function resetModal() {
    form.reset();
    formView.hidden = false;
    successView.hidden = true;
    hideError();
    setSubmitting(false);
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Submitting...' : 'Submit Application';
  }

  function formatPhoneNumber(digits) {
    const len = digits.length;
    if (len === 0) return '';
    if (len < 4) return `(${digits}`;
    if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  openTriggers.forEach((trigger) => trigger.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);

  // Click on the dimmed backdrop (not the box itself) closes the modal
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      phoneInput.value = formatPhoneNumber(digits);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideError();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      showError('Please enter a valid 10-digit phone number.');
      phoneInput.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(emailInput.value.trim())) {
      showError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    setSubmitting(true);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (response.ok) {
          formView.hidden = true;
          successView.hidden = false;
        } else {
          showError('Something went wrong. Please try again.');
          setSubmitting(false);
        }
      })
      .catch(() => {
        showError('Network error. Please check your connection and try again.');
        setSubmitting(false);
      });
  });
}
