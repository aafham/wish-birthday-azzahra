const replayBtn = document.querySelector('.replay');
const animated = document.querySelectorAll('.fade');
const wishParas = document.querySelectorAll('.wish p');
const card = document.querySelector('.card');
const cardScroll = document.querySelector('.card-scroll');
const imageBox = document.querySelector('.image-box');
const themeToggle = document.querySelector('.theme-toggle');
const shareBtn = document.querySelector('.share');
const typewriter = document.querySelector('.typewriter');
const swipeHint = document.querySelector('.swipe-hint');
const wish = document.querySelector('.wish');
const wishBox = document.querySelector('.wish-box');
const wishToggle = document.querySelector('.wish-toggle');
const copyWish = document.querySelector('.copy-wish');
const scrollProgress = document.querySelector('.scroll-progress');
const stickers = document.querySelectorAll('.sticker');
const modal = document.querySelector('.image-modal');
const modalImg = document.querySelector('.image-modal__img');
const modalClose = document.querySelector('.image-modal__close');
const modalBackdrop = document.querySelector('.image-modal__backdrop');
const bgMusic = document.querySelector('.bg-music');

const themes = ['rose', 'elegant', 'minimal'];
const themeLabels = {
  rose: 'Rose',
  elegant: 'Elegant',
  minimal: 'Minimal'
};
let themeIndex = 0;
let musicStarted = false;
let typeTimer = null;
let rafId = null;
let progressRaf = null;
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyTheme() {
  const theme = themes[themeIndex];
  document.body.dataset.theme = theme;
  const label = themeLabels[theme] || theme;
  themeToggle.textContent = `Tema: ${label}`;
}

function setupStagger() {
  wishParas.forEach((p, i) => {
    p.classList.add('fade');
    p.style.animationDelay = `${0.8 + i * 0.2}s`;
  });
}

function launchConfetti() {
  if (reduceMotion) return;
  const existing = document.querySelector('.confetti');
  if (existing) existing.remove();

  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  const colors = ['#ff4d6d', '#ff7ea8', '#f7b4c3', '#ffd166', '#4a6cf7'];
  const count = 36;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 6;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.4}px`;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    confetti.appendChild(piece);
  }

  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3500);
}

function runTypewriter() {
  if (!typewriter) return;
  const text = typewriter.dataset.text || '';
  typewriter.textContent = '';
  typewriter.classList.remove('done');
  let i = 0;
  if (typeTimer) clearInterval(typeTimer);

  typeTimer = setInterval(() => {
    typewriter.textContent += text[i] || '';
    i += 1;
    if (i >= text.length) {
      clearInterval(typeTimer);
      typewriter.classList.add('done');
    }
  }, 40);
}

function updateSwipeHint() {
  if (!swipeHint) return;
  if (!cardScroll) return;
  const overflow = cardScroll.scrollHeight > cardScroll.clientHeight + 8;
  swipeHint.style.display = overflow ? 'block' : 'none';
}

function updateScrollProgress() {
  if (!scrollProgress || !cardScroll) return;
  if (progressRaf) return;
  progressRaf = window.requestAnimationFrame(() => {
    const max = cardScroll.scrollHeight - cardScroll.clientHeight;
    const ratio = max > 0 ? Math.min(cardScroll.scrollTop / max, 1) : 0;
    scrollProgress.style.height = `${ratio * 100}%`;
    progressRaf = null;
  });
}

function autoScrollReveal() {
  if (!cardScroll || !imageBox) return;
  const overflow = cardScroll.scrollHeight > cardScroll.clientHeight + 8;
  if (!overflow) return;

  setTimeout(() => {
    imageBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }, 2500);
}

function replayAnimations() {
  animated.forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  wishParas.forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });

  runTypewriter();
  launchConfetti();
}

function setupParallax() {
  if (!imageBox || !cardScroll || reduceMotion) return;
  const handleScroll = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      const ratio = Math.min(cardScroll.scrollTop / 220, 1);
      imageBox.style.transform = `translateY(${ratio * 8}px)`;
      rafId = null;
    });
  };
  cardScroll.addEventListener('scroll', handleScroll, { passive: true });
}

function setupShare() {
  if (!shareBtn) return;
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'Birthday Wish',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      shareBtn.textContent = 'Copied';
      setTimeout(() => (shareBtn.textContent = 'Share'), 1200);
    } catch (e) {
      shareBtn.textContent = 'Share';
    }
  });
}

function setupWishToggle() {
  if (!wish || !wishToggle || !wishBox) return;
  const paragraphs = wishBox.querySelectorAll('p');
  wish.classList.add('collapsed');
  const updateWishHeights = () => {
    if (!paragraphs.length) return;
    const baseHeight = Array.from(paragraphs)
      .slice(0, 2)
      .reduce((sum, p) => sum + p.getBoundingClientRect().height, 0);
    const padding = 28;
    const collapsedHeight = baseHeight + padding;
    if (wish.classList.contains('collapsed')) {
      wishBox.style.maxHeight = `${collapsedHeight}px`;
    } else {
      wishBox.style.maxHeight = `${wishBox.scrollHeight}px`;
    }
  };
  updateWishHeights();
  window.addEventListener('resize', updateWishHeights);
  wishToggle.addEventListener('click', () => {
    const isCollapsed = wish.classList.contains('collapsed');
    wish.classList.toggle('collapsed');
    wishToggle.textContent = isCollapsed ? 'Tutup' : 'Baca lagi';
    wishToggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
    updateWishHeights();
    updateSwipeHint();
    if (isCollapsed) {
      setTimeout(() => {
        wishBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }, 120);
    }
  });
}

function setupCopyWish() {
  if (!copyWish || !wishBox) return;
  copyWish.addEventListener('click', async () => {
    const text = wishBox.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
      const prev = copyWish.textContent;
      copyWish.textContent = 'Copied';
      setTimeout(() => (copyWish.textContent = prev), 1200);
    } catch (e) {
      copyWish.textContent = 'Gagal';
      setTimeout(() => (copyWish.textContent = 'Copy Doa'), 1200);
    }
  });
}

function setupStickerSparkles() {
  if (!stickers.length || !card) return;
  stickers.forEach(sticker => {
    sticker.addEventListener('click', () => {
      if (reduceMotion) return;
      const count = 6 + Math.floor(Math.random() * 4);
      const stickerRect = sticker.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.className = 'sparkle-particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 16 + Math.random() * 14;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        const x = stickerRect.left - cardRect.left + stickerRect.width / 2 + (Math.random() * 8 - 4);
        const y = stickerRect.top - cardRect.top + stickerRect.height / 2 + (Math.random() * 8 - 4);
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        card.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
      }
    });
  });
}

function setupImageModal() {
  if (!imageBox || !modal || !modalImg || !modalClose || !modalBackdrop) return;
  const img = imageBox.querySelector('img');
  if (!img) return;

  const openModal = () => {
    modalImg.src = img.src;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  };

  img.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

function setupHaptics() {
  if (!navigator.vibrate) return;
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => navigator.vibrate(10));
  });
  stickers.forEach(sticker => {
    sticker.addEventListener('click', () => navigator.vibrate(10));
  });
}

function setupBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.loop = true;
  const startMusic = () => {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.play().catch(() => {});
  };
  bgMusic.play().catch(() => {});
  document.addEventListener('click', startMusic, { once: true });
  document.addEventListener('touchstart', startMusic, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupStagger();
  setupParallax();
  setupShare();
  setupWishToggle();
  setupCopyWish();
  setupStickerSparkles();
  setupImageModal();
  setupHaptics();
  setupBackgroundMusic();
  runTypewriter();
  launchConfetti();
  updateSwipeHint();
  updateScrollProgress();
  autoScrollReveal();
  const img = imageBox ? imageBox.querySelector('img') : null;
  if (img) {
    img.addEventListener('load', () => {
      updateSwipeHint();
      updateScrollProgress();
    });
  }
});

window.addEventListener('resize', () => {
  updateSwipeHint();
  updateScrollProgress();
});
if (cardScroll) {
  cardScroll.addEventListener('scroll', updateSwipeHint, { passive: true });
  cardScroll.addEventListener('scroll', updateScrollProgress, { passive: true });
}

themeToggle.addEventListener('click', () => {
  themeIndex = (themeIndex + 1) % themes.length;
  applyTheme();
  launchConfetti();
});

replayBtn.addEventListener('click', replayAnimations);
