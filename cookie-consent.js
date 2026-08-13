/* Banner de consentimiento de cookies — davidmateos.com
 *
 * Por qué existe: la web sirve Google Tag Manager y AdSense, que ponen cookies de
 * analítica y de publicidad. Esas cookies necesitan permiso PREVIO del usuario, y
 * hasta el 13/08/2026 se ponían nada más entrar.
 *
 * Cómo funciona: el bloque que va en el <head> de cada página declara Consent Mode v2
 * con todo DENEGADO por defecto, así que GTM y AdSense arrancan en modo restringido
 * antes de que este fichero llegue siquiera. Aquí solo se pinta el banner y, según lo
 * que elija el usuario, se actualiza el consentimiento.
 *
 * OJO, y esto no lo arregla este fichero: para servir anuncios a usuarios del EEE y
 * Reino Unido, Google exige además un CMP certificado por él e integrado con el TCF de
 * IAB. Eso se activa en la consola de AdSense (Privacidad y mensajes) y no se puede
 * hacer desde el código de la web.
 */
(function () {
  'use strict';

  var CLAVE = 'dm_consent_v1';
  var MESES = 6; // vuelve a preguntar pasado este tiempo

  function leer() {
    try {
      var b = JSON.parse(localStorage.getItem(CLAVE));
      if (!b || !b.ts) return null;
      var meses = (Date.now() - b.ts) / (1000 * 60 * 60 * 24 * 30);
      return meses > MESES ? null : b;
    } catch (e) { return null; }
  }

  function guardar(acepta) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ acepta: acepta, ts: Date.now() })); } catch (e) {}
  }

  function aplicar(acepta) {
    var v = acepta ? 'granted' : 'denied';
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v
      });
    }
  }

  var ESTILO = [
    '.dm-cookies{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1a2332;color:#f5f2eb;',
    'padding:1.1rem 1.25rem;box-shadow:0 -4px 20px rgba(0,0,0,.25);font-size:.9rem;line-height:1.55;',
    'max-height:55vh;overflow-y:auto}',
    '.dm-cookies-inner{max-width:1000px;margin:0 auto;display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap}',
    '.dm-cookies p{margin:0;flex:1 1 340px}',
    '.dm-cookies a{color:#d4af37;text-decoration:underline}',
    '.dm-cookies-btns{display:flex;gap:.6rem;flex-wrap:wrap}',
    '.dm-cookies button{font-family:inherit;font-size:.85rem;padding:.6rem 1.3rem;border-radius:4px;',
    'cursor:pointer;border:1px solid #d4af37;white-space:nowrap}',
    '.dm-c-si{background:#d4af37;color:#1a2332;font-weight:700}',
    '.dm-c-no{background:transparent;color:#f5f2eb}',
    '.dm-c-si:hover{background:#e0bd4a}.dm-c-no:hover{background:rgba(255,255,255,.1)}',
    '.dm-cookies-link{position:fixed;left:12px;bottom:12px;z-index:9998;background:#1a2332;color:#f5f2eb;',
    'border:1px solid #d4af37;border-radius:4px;padding:.35rem .7rem;font-size:.72rem;cursor:pointer;opacity:.75}',
    '.dm-cookies-link:hover{opacity:1}',
    '@media(max-width:640px){.dm-cookies{font-size:.82rem;padding:.9rem 1rem;max-height:70vh}',
    '.dm-cookies-inner{flex-direction:column;align-items:stretch;gap:.8rem}',
    '.dm-cookies p{flex:0 1 auto}',
    '.dm-cookies-btns button{flex:1}}'
  ].join('');

  function css() {
    if (document.getElementById('dm-cookies-css')) return;
    var s = document.createElement('style');
    s.id = 'dm-cookies-css'; s.textContent = ESTILO;
    document.head.appendChild(s);
  }

  function botonReabrir() {
    if (document.querySelector('.dm-cookies-link')) return;
    var b = document.createElement('button');
    b.className = 'dm-cookies-link';
    b.type = 'button';
    b.textContent = 'Cookies';
    b.setAttribute('aria-label', 'Cambiar mis preferencias de cookies');
    b.addEventListener('click', function () { b.remove(); banner(); });
    document.body.appendChild(b);
  }

  function banner() {
    css();
    var d = document.createElement('div');
    d.className = 'dm-cookies';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-live', 'polite');
    d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML =
      '<div class="dm-cookies-inner">' +
      '<p>Esta web usa cookies propias necesarias para funcionar y, si lo autorizas, cookies de ' +
      'Google (analítica y publicidad) que ayudan a mantenerla. Puedes aceptarlas o rechazarlas: ' +
      'si las rechazas, la web funciona igual. Más detalle en la ' +
      '<a href="https://davidmateos.com/cookies.html">política de cookies</a>.</p>' +
      '<div class="dm-cookies-btns">' +
      '<button type="button" class="dm-c-no">Rechazar</button>' +
      '<button type="button" class="dm-c-si">Aceptar</button>' +
      '</div></div>';
    document.body.appendChild(d);
    // El popup de newsletter mira esta marca para no salir encima del banner.
    document.documentElement.setAttribute('data-cookies-abierto','1');

    function decidir(acepta) {
      guardar(acepta); aplicar(acepta); d.remove(); botonReabrir();
      document.documentElement.removeAttribute('data-cookies-abierto');
    }
    d.querySelector('.dm-c-si').addEventListener('click', function () { decidir(true); });
    d.querySelector('.dm-c-no').addEventListener('click', function () { decidir(false); });
  }

  function arrancar() {
    var previo = leer();
    if (previo) { aplicar(previo.acepta); css(); botonReabrir(); return; }
    css(); banner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
