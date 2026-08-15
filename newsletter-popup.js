// newsletter-popup.js — popup de suscripción Brevo para davidmateos.com
// Se muestra una vez a los 18 s o al 55 % de scroll; si se cierra, no vuelve
// a aparecer en 30 días; si el usuario se suscribe, no vuelve a aparecer nunca.
(function () {
  var KEY = 'dmNewsletterPopup';
  var FORM_URL = 'https://9a7395d6.sibforms.com/serve/MUIFAFlJpxGCsOukbvlXYZJP2X0cIkfeYb3cumsE0j6A9EcFCoUbhQIkxybebYzKlq5_IeS2gYkCF5J-e0uJdI2Xd-R_19MJR1TmPlaxYSh-UDywR7U3WPxF0sxaMA2GGBvb2lqX5POeIAXteM-Bz4dM2LMg4y6OgT2w7pO_5jUmZnqKp3E7yN8t9pkGsHHI8Y6y_HaZbJinmx3ycA';

  var page = window.location.pathname.split('/').pop();
  if (page === 'suscribete.html' || page === 'gracias-descarga.html') return;

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  if (state.subscribed) return;
  if (state.dismissedAt && Date.now() - state.dismissedAt < 30 * 24 * 60 * 60 * 1000) return;

  var css = '' +
    '#dm-np-overlay{position:fixed;inset:0;background:rgba(14,12,7,.55);backdrop-filter:blur(3px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.2rem;opacity:0;transition:opacity .35s}' +
    '#dm-np-overlay.dm-np-visible{opacity:1}' +
    '#dm-np{position:relative;max-width:430px;width:100%;background:#1a1208;border:1px solid #b8860b;box-shadow:0 24px 60px rgba(0,0,0,.5);padding:2.6rem 2.4rem 2.2rem;text-align:center;transform:translateY(14px);transition:transform .35s}' +
    '#dm-np-overlay.dm-np-visible #dm-np{transform:translateY(0)}' +
    '#dm-np-close{position:absolute;top:.6rem;right:.9rem;background:none;border:none;color:#8a7a5c;font-size:1.5rem;line-height:1;cursor:pointer;padding:.3rem}' +
    '#dm-np-close:hover{color:#e8d5a3}' +
    '#dm-np .dm-np-orn{color:#b8860b;font-size:.9rem;letter-spacing:.5em;margin-bottom:1rem}' +
    '#dm-np .dm-np-eyebrow{font-family:Lato,sans-serif;font-size:.68rem;letter-spacing:.25em;text-transform:uppercase;color:#b8860b;margin-bottom:.7rem}' +
    '#dm-np h2{font-family:"Playfair Display",serif;font-size:1.65rem;line-height:1.25;color:#fff;margin:0 0 .9rem;font-weight:700}' +
    '#dm-np h2 em{color:#e8d5a3;font-style:italic}' +
    '#dm-np p{font-family:Lato,sans-serif;font-size:.88rem;color:#bbab8d;line-height:1.75;margin:0 0 1.5rem;font-weight:300}' +
    '#dm-np form{display:flex;flex-direction:column;gap:.7rem}' +
    '#dm-np input[type=email]{width:100%;padding:.85rem 1rem;background:#fdf9f2;border:1px solid #d4c4a0;font-family:Lato,sans-serif;font-size:.9rem;color:#1a1208;outline:none;text-align:center}' +
    '#dm-np input[type=email]:focus{border-color:#b8860b}' +
    '#dm-np button[type=submit]{width:100%;padding:.9rem;background:#b8860b;color:#1a1208;border:none;font-family:Lato,sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;transition:background .2s}' +
    '#dm-np button[type=submit]:hover{background:#e8d5a3}' +
    '#dm-np .dm-np-note{font-size:.7rem;color:#6b5e4a;margin:1rem 0 0}' +
    '#dm-np .dm-np-note a{color:#8a7a5c}' +
    '#dm-np .dm-np-error{display:none;font-size:.78rem;color:#e8a0a0;margin:.2rem 0 0}' +
    '@media(max-width:520px){#dm-np{padding:2.1rem 1.4rem 1.8rem}#dm-np h2{font-size:1.35rem}}';

  function show() {
    if (document.getElementById('dm-np-overlay')) return;
    // Si el banner de cookies está abierto, esperar: dos modales a la vez es
    // insufrible, y además el usuario tiene que poder leer lo que acepta.
    if (document.documentElement.hasAttribute('data-cookies-abierto')) {
      setTimeout(show, 2000);
      return;
    }

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'dm-np-overlay';
    overlay.innerHTML =
      '<div id="dm-np" role="dialog" aria-modal="true" aria-labelledby="dm-np-title">' +
        '<button id="dm-np-close" aria-label="Cerrar">&times;</button>' +
        '<div class="dm-np-orn">&#10022;&#10022;&#10022;</div>' +
        '<div class="dm-np-eyebrow">Newsletter de David Mateos</div>' +
        '<h2 id="dm-np-title">&iquest;Te gustan el <em>misterio</em> y la <em>aventura</em>?</h2>' +
        '<p>Recibe los primeros cap&iacute;tulos de los nuevos libros antes que nadie, novedades de las sagas Valentina Roca y Calan Kennett, y un vistazo al proceso creativo.</p>' +
        '<form novalidate>' +
          '<input type="email" name="EMAIL" placeholder="Tu correo electr&oacute;nico" autocomplete="email" required>' +
          '<div class="dm-np-error">Escribe un correo v&aacute;lido para suscribirte.</div>' +
          '<button type="submit">Suscribirme gratis</button>' +
        '</form>' +
        '<p class="dm-np-note">Una vez al mes. Sin spam. Date de baja cuando quieras. <a href="/privacidad.html">Privacidad</a></p>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('dm-np-visible'); });

    function dismiss() {
      state.dismissedAt = Date.now();
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      overlay.classList.remove('dm-np-visible');
      setTimeout(function () { overlay.remove(); }, 350);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') dismiss(); }

    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
    document.getElementById('dm-np-close').addEventListener('click', dismiss);
    document.addEventListener('keydown', onKey);

    overlay.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = overlay.querySelector('input[type=email]');
      var error = overlay.querySelector('.dm-np-error');
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        error.style.display = 'block';
        return;
      }
      error.style.display = 'none';
      var btn = overlay.querySelector('button[type=submit]');
      btn.textContent = 'Enviando…';
      btn.disabled = true;

      var data = new FormData();
      data.append('EMAIL', email);
      data.append('OPT_IN', '1');
      data.append('email_address_check', '');
      data.append('locale', 'es');

      function done() {
        state.subscribed = true;
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e2) {}
        document.getElementById('dm-np').innerHTML =
          '<div class="dm-np-orn">&#10022;&#10022;&#10022;</div>' +
          '<h2>&iexcl;Bienvenido a bordo!</h2>' +
          '<p>Revisa tu correo para confirmar la suscripci&oacute;n. Muy pronto tendr&aacute;s noticias de Valentina, Calan y compa&ntilde;&iacute;a.</p>';
        setTimeout(function () {
          overlay.classList.remove('dm-np-visible');
          setTimeout(function () { overlay.remove(); }, 350);
        }, 3500);
      }
      fetch(FORM_URL, { method: 'POST', body: data, mode: 'no-cors' }).then(done).catch(done);
    });
  }

  var shown = false;
  function trigger() {
    if (shown) return;
    shown = true;
    show();
    window.removeEventListener('scroll', onScroll);
  }
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max > 0.55) trigger();
  }
  setTimeout(trigger, 18000);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
