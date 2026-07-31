/* Kathors Peptides — intro: the K emblem flies at the viewer and
   shatters the screen like a pane of glass, revealing the page.
   - Runs ONCE per browser session (sessionStorage kap_intro_seen);
     later visits get the normal quick counter preloader instead.
   - Skipped entirely for prefers-reduced-motion.
   - Hard 2.8s failsafe cleanup: the intro can never hold the page.
   - Fully standalone (no GSAP); any error -> instant cleanup. */
(function () {
  try {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('kap_intro_seen') === '1'; } catch (e) {}
    if (reduce || seen || !window.requestAnimationFrame) return;
    try { sessionStorage.setItem('kap_intro_seen', '1'); } catch (e) {}

    window.__shatterActive = true;
    var pre = document.getElementById('preloader');
    if (pre) pre.remove();
    document.body.classList.add('loading');

    var ov = document.createElement('div');
    ov.id = 'shatter';
    ov.style.cssText = 'position:fixed;inset:0;z-index:4000;background:#070A10;';
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    ov.appendChild(cv);
    document.body.appendChild(ov);
    var ctx = cv.getContext('2d');

    var DPR = Math.min(2, window.devicePixelRatio || 1);
    var W = window.innerWidth, H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var done = false;
    function cleanup() {
      if (done) return;
      done = true;
      document.body.classList.remove('loading');
      document.documentElement.classList.add('hero-in');
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    setTimeout(cleanup, 2800);

    var img = new Image(), imgOk = false;
    img.onload = function () { imgOk = true; };
    img.src = 'emblem.png';

    /* Fracture web: radial rays x concentric rings -> glass shards. */
    var cx = W / 2, cy = H / 2;
    var RAYS = 14;
    var maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.18;
    var angles = [];
    for (var i = 0; i < RAYS; i++) angles.push((i / RAYS) * Math.PI * 2 + (Math.random() - 0.5) * 0.24);
    var rings = [0.15, 0.32, 0.56, 1.0].map(function (r) { return r * maxR; });
    function pt(a, r) {
      var j = 1 + (Math.random() - 0.5) * 0.1;
      return [cx + Math.cos(a) * r * j, cy + Math.sin(a) * r * j];
    }
    var shards = [];
    for (i = 0; i < RAYS; i++) {
      var a1 = angles[i], a2 = angles[(i + 1) % RAYS];
      if (a2 < a1) a2 += Math.PI * 2;
      var rPrev = 5 + Math.random() * 9;
      for (var j = 0; j < rings.length; j++) {
        var rNext = rings[j];
        var poly = [pt(a1, rPrev), pt(a2, rPrev), pt(a2, rNext), pt(a1, rNext)];
        var mx = (poly[0][0] + poly[2][0]) / 2, my = (poly[0][1] + poly[2][1]) / 2;
        var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        var sp = (6 + Math.random() * 7) * (1 + (d / maxR) * 2.2);
        shards.push({
          poly: poly.map(function (p) { return [p[0] - mx, p[1] - my]; }),
          x: mx, y: my, vx: (dx / d) * sp, vy: (dy / d) * sp,
          rot: 0, vr: (Math.random() - 0.5) * 0.22, a: 1
        });
        rPrev = rNext;
      }
    }

    var T0 = null, IMPACT = 650, END = 1750, revealed = false;
    function frame(t) {
      if (done) return;
      if (T0 === null) T0 = t;
      var e = t - T0;
      ctx.clearRect(0, 0, W, H);

      if (e < IMPACT) {
        /* Approach: the overlay is the opaque pane; the emblem flies
           at the viewer on top of it. */
        var p = e / IMPACT;
        var lw = Math.min(W, H) * 0.42 * (0.15 + p * p * 1.15);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((1 - p) * 0.35);
        ctx.shadowColor = 'rgba(62,155,240,' + (0.35 + p * 0.45) + ')';
        ctx.shadowBlur = 12 + 42 * p;
        if (imgOk) ctx.drawImage(img, -lw / 2, -lw / 2, lw, lw);
        ctx.restore();
      } else {
        if (!revealed) {
          revealed = true;
          /* At the moment of impact the pane becomes see-through and
             the page (headline included) is behind the flying shards. */
          ov.style.background = 'transparent';
          document.documentElement.classList.add('hero-in');
        }
        var p2 = (e - IMPACT) / (END - IMPACT);
        /* Impact flash */
        if (p2 < 0.16) {
          ctx.fillStyle = 'rgba(200,230,255,' + (0.5 * (1 - p2 / 0.16)) + ')';
          ctx.fillRect(0, 0, W, H);
        }
        /* Shards exploding toward the edges */
        for (var k = 0; k < shards.length; k++) {
          var sh = shards[k];
          sh.x += sh.vx; sh.y += sh.vy; sh.vy += 0.16; sh.rot += sh.vr;
          sh.a = Math.max(0, 1 - p2 * 1.15);
          if (sh.a <= 0) continue;
          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.rot);
          ctx.globalAlpha = sh.a;
          ctx.beginPath();
          for (var m = 0; m < sh.poly.length; m++) {
            m ? ctx.lineTo(sh.poly[m][0], sh.poly[m][1]) : ctx.moveTo(sh.poly[m][0], sh.poly[m][1]);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(14,21,38,0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(169,214,255,0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
        /* The emblem carries on past the camera and fades */
        var la = Math.max(0, 1 - p2 * 1.6);
        if (la > 0 && imgOk) {
          var lw2 = Math.min(W, H) * 0.42 * (1.3 + p2 * 0.9);
          ctx.save();
          ctx.globalAlpha = la;
          ctx.translate(cx, cy);
          ctx.drawImage(img, -lw2 / 2, -lw2 / 2, lw2, lw2);
          ctx.restore();
        }
        if (e >= END) { cleanup(); return; }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } catch (err) {
    /* Any failure: never block the page. */
    try {
      document.body.classList.remove('loading');
      document.documentElement.classList.add('hero-in');
      var o = document.getElementById('shatter');
      if (o && o.parentNode) o.parentNode.removeChild(o);
    } catch (e2) {}
  }
})();
