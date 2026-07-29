/* Kathors Peptides — age + research-use acknowledgement gate.
   Shows a one-time modal until the visitor confirms 21+ and research-use-only.
   Choice is remembered in localStorage (key: kap_age_ack). Advisory only. */
(function () {
  var KEY = 'kap_age_ack';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: still gate */ }

  function build() {
    if (document.getElementById('agegate')) return;

    var ov = document.createElement('div');
    ov.className = 'agegate';
    ov.id = 'agegate';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'agegate-h');
    ov.innerHTML =
      '<div class="agegate-card">' +
        '<img class="agegate-emblem" src="emblem.png" alt="" />' +
        '<p class="agegate-kicker">Kathors Peptides</p>' +
        '<h2 id="agegate-h">Before you enter</h2>' +
        '<p class="agegate-copy">All materials on this site are supplied strictly for ' +
          '<strong>laboratory research use only</strong> — they are not drugs, supplements, ' +
          'or foods, and are <strong>not for human, animal, or veterinary use</strong>.</p>' +
        '<label class="agegate-check">' +
          '<input type="checkbox" id="agegate-cb" />' +
          '<span>I am <strong>21 years of age or older</strong>, and I acknowledge these ' +
          'materials are for laboratory research use only — not for human, animal, or veterinary use.</span>' +
        '</label>' +
        '<div class="agegate-actions">' +
          '<button type="button" class="btn btn-primary" id="agegate-enter" disabled>Enter site</button>' +
          '<button type="button" class="btn" id="agegate-leave">Leave</button>' +
        '</div>' +
        '<p class="agegate-fine">By entering you agree to our ' +
          '<a href="terms.html" target="_blank" rel="noopener">Terms</a> and ' +
          '<a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</p>' +
      '</div>';

    document.body.appendChild(ov);
    document.documentElement.classList.add('agegate-lock');

    var cb = document.getElementById('agegate-cb');
    var enter = document.getElementById('agegate-enter');
    var leave = document.getElementById('agegate-leave');

    cb.addEventListener('change', function () { enter.disabled = !cb.checked; });

    enter.addEventListener('click', function () {
      if (!cb.checked) return;
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      document.documentElement.classList.remove('agegate-lock');
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    });

    leave.addEventListener('click', function () {
      window.location.href = 'https://www.google.com';
    });

    setTimeout(function () { cb.focus(); }, 30);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
