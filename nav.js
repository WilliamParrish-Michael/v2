/* Kathors Peptides — mobile nav toggle.
   Reveals the primary navigation on small screens (hamburger menu). */
(function () {
  var t = document.querySelector('.navtoggle');
  var n = document.getElementById('navlinks');
  if (!t || !n) return;

  function close() {
    n.classList.remove('open');
    t.setAttribute('aria-expanded', 'false');
    t.setAttribute('aria-label', 'Open menu');
  }

  t.addEventListener('click', function () {
    var open = n.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* Close after tapping a link, or on Escape. */
  n.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
