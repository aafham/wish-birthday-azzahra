const replayBtn = document.querySelector('.replay');
const animated = document.querySelectorAll('.fade');
const wishParas = document.querySelectorAll('.wish p');
const card = document.querySelector('.card');
const cardScroll = document.querySelector('.card-scroll');
const imageBox = document.querySelector('.image-box');
const themeToggle = document.querySelector('.theme-toggle');
const soundToggle = document.querySelector('.sound-toggle');
const shareBtn = document.querySelector('.share');
const typewriter = document.querySelector('.typewriter');
const swipeHint = document.querySelector('.swipe-hint');
const wish = document.querySelector('.wish');
const wishBox = document.querySelector('.wish-box');
const wishToggle = document.querySelector('.wish-toggle');
const copyWish = document.querySelector('.copy-wish');

const themes = ['rose', 'elegant', 'minimal'];
const themeLabels = {
  rose: 'Rose',
  elegant: 'Elegant',
  minimal: 'Minimal'
};
let themeIndex = 0;
let soundOn = true;
let audioCtx = null;
let typeTimer = null;
let rafId = null;
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

function createAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playChime() {
  if (!soundOn) return;
  try {
    const ctx = createAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, now + 0.05);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 1.1);
    osc2.stop(now + 1.1);
  } catch (e) {
    // ignore audio errors
  }
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
  playChime();
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

function updateSoundLabel() {
  if (!soundToggle) return;
  soundToggle.textContent = soundOn ? 'Bunyi: On' : 'Bunyi: Off';
  soundToggle.classList.toggle('off', !soundOn);
}

function setupSoundToggle() {
  if (!soundToggle) return;
  updateSoundLabel();

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    updateSoundLabel();
    if (soundOn) playChime();
  });
}

function setupWishToggle() {
  if (!wish || !wishToggle || !wishBox) return;
  wish.classList.add('collapsed');
  wishToggle.addEventListener('click', () => {
    const isCollapsed = wish.classList.contains('collapsed');
    wish.classList.toggle('collapsed');
    wishToggle.textContent = isCollapsed ? 'Tutup' : 'Baca lagi';
    wishToggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
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

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  setupStagger();
  setupParallax();
  setupShare();
  setupSoundToggle();
  setupWishToggle();
  setupCopyWish();
  runTypewriter();
  launchConfetti();
  updateSwipeHint();
  autoScrollReveal();
  playChime();

  const img = imageBox ? imageBox.querySelector('img') : null;
  if (img) {
    img.addEventListener('load', updateSwipeHint);
  }
});

window.addEventListener('resize', updateSwipeHint);
if (cardScroll) {
  cardScroll.addEventListener('scroll', updateSwipeHint, { passive: true });
}

themeToggle.addEventListener('click', () => {
  themeIndex = (themeIndex + 1) % themes.length;
  applyTheme();
  launchConfetti();
});

replayBtn.addEventListener('click', replayAnimations);
