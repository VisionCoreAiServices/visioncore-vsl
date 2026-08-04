/**
 * VisionCore AI VSL Landing Page Interactivity
 * Focuses on mobile-first user experience and booking CTA optimization.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupMobileStickyCta();
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
