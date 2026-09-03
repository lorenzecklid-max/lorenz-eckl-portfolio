// Mobile nav burger + slide-down overlay menu. Shared by every page that has a nav.
(function () {
  function initNav() {
    var burger = document.querySelector('[data-nav-burger]');
    var menu = document.querySelector('[data-mobile-menu]');
    var logo = document.querySelector('[data-nav-logo]');
    var nav = document.querySelector('.nav');
    if (!burger || !menu) return;

    var open = false;
    var hideTimer;

    function setOpen(next) {
      open = next;
      burger.classList.toggle('is-open', open);
      if (logo) logo.classList.toggle('is-open', open);
      if (nav) nav.classList.toggle('is-open', open);

      clearTimeout(hideTimer);
      if (open) {
        menu.classList.add('is-mounted');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            menu.classList.add('is-open');
          });
        });
      } else {
        menu.classList.remove('is-open');
        hideTimer = setTimeout(function () {
          menu.classList.remove('is-mounted');
        }, 450);
      }
    }

    burger.addEventListener('click', function () { setOpen(!open); });
    burger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
