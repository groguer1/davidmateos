// nav.js — menú compartido para todas las páginas de davidmateos.com
(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    { href: '/inicio.html',            label: 'Inicio' },
    { href: '/libros.html',            label: 'Mis libros' },
    { href: '/autor.html',             label: 'Sobre el autor' },
    { href: '/blog.html',              label: 'Blog' },
    { href: '/suscribete.html',        label: 'Suscríbete' },
    { href: '/recursos-docentes.html', label: 'Para docentes' },
    { href: '/contacto.html',          label: 'Contacto' },
  ];

  const items = links.map(({ href, label }) => {
    const fileName = href.replace('/', '');
    const isActive = currentPath === fileName ? ' class="active"' : '';
    return `<li><a href="${href}"${isActive}>${label}</a></li>`;
  }).join('');

  const navHTML = `
    <a class="nav-logo" href="/inicio.html">David Mateos</a>
    <ul class="nav-links">${items}</ul>
  `;

  // Replace existing nav content or inject into first <nav>
  const nav = document.querySelector('nav');
  if (nav) {
    // Preserve nav-inner wrapper if it exists
    const inner = nav.querySelector('.nav-inner');
    if (inner) {
      inner.innerHTML = navHTML;
    } else {
      nav.innerHTML = `<div class="nav-inner">${navHTML}</div>`;
    }
  }
})();
