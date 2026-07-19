// Shared body-scroll lock so the modal and lightbox can stack without fighting over overflow state
var scrollLockCount = 0;
function lockScroll() {
  scrollLockCount++;
  document.body.style.overflow = 'hidden';
}
function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) { document.body.style.overflow = ''; }
}

(function () {
  var openBtn = document.getElementById('openCertModal');
  var closeBtn = document.getElementById('closeCertModal');
  var overlay = document.getElementById('certModalOverlay');
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    lockScroll();
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }
  function closeModal() {
    overlay.hidden = true;
    unlockScroll();
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') { closeModal(); }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) { closeModal(); }
  });
})();

(function () {
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    mobileMenu.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    mobileMenu.hidden = false;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  // Close the menu after tapping a link
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close automatically if the viewport grows back past the mobile breakpoint
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) { closeMenu(); }
  });
})();

// Certificate lightbox — opens a zoomed view when a "View credential" / "View" link is clicked.
// Supports multiple images per credential: data-cert-img can hold one path, or several
// separated by commas (e.g. "cert-1.jpg,cert-2.jpg"), and the lightbox adds prev/next
// arrows plus a counter automatically whenever there's more than one image.
(function () {
  var overlay = document.getElementById('lightboxOverlay');
  var stage = document.getElementById('lightboxStage');
  var img = document.getElementById('lightboxImg');
  var titleEl = document.getElementById('lightboxTitle');
  var countEl = document.getElementById('lightboxCount');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var closeBtn = document.getElementById('closeLightbox');
  var triggers = document.querySelectorAll('.work-link[data-cert-img], .index-link[data-cert-img]');
  var lastFocused = null;
  var currentImages = [];
  var currentIndex = 0;

  function renderImage() {
    img.src = currentImages[currentIndex];
    stage.classList.remove('zoomed');
    stage.scrollTop = 0;
    stage.scrollLeft = 0;

    var multiple = currentImages.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
    countEl.textContent = multiple ? (currentIndex + 1) + ' / ' + currentImages.length : '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderImage();
  }
  function showNext() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderImage();
  }

  // Reads a data-cert-img value that may hold one path, or several separated by commas
  function parseImages(value) {
    return value.split(',')
      .map(function (src) { return src.trim(); })
      .filter(Boolean);
  }

  function openLightbox(imgAttr, title) {
    lastFocused = document.activeElement;
    currentImages = parseImages(imgAttr);
    currentIndex = 0;
    img.alt = title || 'Certificate';
    titleEl.textContent = title || '';
    renderImage();
    overlay.hidden = false;
    lockScroll();
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }
  function closeLightbox() {
    overlay.hidden = true;
    stage.classList.remove('zoomed');
    unlockScroll();
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') { closeLightbox(); }
    if (e.key === 'ArrowLeft' && currentImages.length > 1) { showPrev(); }
    if (e.key === 'ArrowRight' && currentImages.length > 1) { showNext(); }
  }

  triggers.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(link.getAttribute('data-cert-img'), link.getAttribute('data-cert-title'));
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) { closeLightbox(); }
  });

  // Click the image itself to toggle zoom in/out
  img.addEventListener('click', function () {
    stage.classList.toggle('zoomed');
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  });
})();