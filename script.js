const replayBtn = document.querySelector('.replay');
const animated = document.querySelectorAll('.fade');

replayBtn.addEventListener('click', () => {
  animated.forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });
});
