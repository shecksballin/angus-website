/* Angus T. — page behaviour. No dependencies. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Nav only takes a background once the hero is behind it ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Testimonials ----------
     Placeholder copy: replace with real client names and quotes before launch. */
  var TESTIMONIALS = [
    {
      name: 'Client One',
      role: 'Role / company',
      quote:
        'Replace this with a real client testimonial: what they were selling, what changed, and the result. A specific number reads stronger than praise.'
    },
    {
      name: 'Client Two',
      role: 'Role / company',
      quote:
        'Replace this with a real client testimonial: keep it short and in their own words. One concrete before-and-after does more than a paragraph of adjectives.'
    },
    {
      name: 'Client Three',
      role: 'Role / company',
      quote:
        'Replace this with a real client testimonial: name the objection they used to lose deals on and what they do differently now.'
    }
  ];

  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var quote = document.getElementById('quote');

  function initials(name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) { return part.charAt(0); })
      .join('')
      .toUpperCase();
  }

  function select(index) {
    var data = TESTIMONIALS[index];
    if (!data || !quote) return;

    chips.forEach(function (chip, i) {
      var on = i === index;
      chip.setAttribute('aria-selected', on ? 'true' : 'false');
      chip.tabIndex = on ? 0 : -1;
    });

    var fill = function () {
      quote.querySelector('[data-quote]').textContent = '“' + data.quote + '”';
      quote.querySelector('[data-name]').textContent = data.name;
      quote.querySelector('[data-role]').textContent = data.role;
      quote.querySelector('[data-initials]').textContent = initials(data.name);
    };

    if (reduced) { fill(); return; }

    // Fade out, swap, fade back in, so the change registers as a change.
    quote.classList.add('is-swapping');
    window.setTimeout(function () {
      fill();
      quote.classList.remove('is-swapping');
    }, 180);
  }

  chips.forEach(function (chip, i) {
    chip.addEventListener('click', function () { select(i); });
    // Arrow keys move between tabs, which is what a tablist is expected to do.
    chip.addEventListener('keydown', function (event) {
      var step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      var next = (i + step + chips.length) % chips.length;
      chips[next].focus();
      select(next);
    });
  });

  if (chips.length) select(0);

  /* ---------- Accordion rows ----------
     Animating to a measured height rather than a guessed max-height, so long
     answers do not get clipped and short ones do not lag. */
  var triggers = document.querySelectorAll('.row__trigger');
  Array.prototype.forEach.call(triggers, function (trigger) {
    var row = trigger.closest('.row');
    var body = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!row || !body) return;

    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') === 'true';

      if (open) {
        body.style.height = body.scrollHeight + 'px';
        // Force a reflow so the browser has a start value to animate from.
        void body.offsetHeight;
        body.style.height = '0px';
      } else {
        body.style.height = body.scrollHeight + 'px';
      }

      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
      row.classList.toggle('is-open', !open);
    });

    // Once open, let the panel size itself again so reflow (a resize, a font
    // swap) cannot leave it clipped at a stale pixel height.
    body.addEventListener('transitionend', function (event) {
      if (event.propertyName !== 'height') return;
      if (trigger.getAttribute('aria-expanded') === 'true') body.style.height = 'auto';
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    Array.prototype.forEach.call(reveals, function (el) { observer.observe(el); });
  }
})();
