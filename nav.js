// nav.js — menú compartido para todas las páginas de davidmateos.com
(function () {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    { href: '/',                       label: 'Inicio' },
    { href: '/libros.html',            label: 'Mis libros' },
    { href: '/autor.html',             label: 'Sobre el autor' },
    { href: '/blog.html',              label: 'Blog' },
    { href: '/suscribete.html',        label: 'Suscríbete' },
    { href: '/recursos-docentes.html', label: 'Para docentes' },
    { href: '/contacto.html',          label: 'Contacto' },
    { href: 'https://www.goodreads.com/author/show/7356842.David_Mateos', label: 'Goodreads', target: '_blank' },
  ];

  const items = links.map(({ href, label, target }) => {
    const fileName = href.replace('/', '');
    const isHome = href === '/' && (currentPath === 'index.html' || currentPath === 'inicio.html');
    const isActive = (currentPath === fileName && fileName !== '') || isHome ? ' class="active"' : '';
    const targetAttr = target ? ` target="${target}"` : '';
    return `<li><a href="${href}"${isActive}${targetAttr}>${label}</a></li>`;
  }).join('');

  const nav = document.querySelector('nav');
  if (!nav) return;

  const hasNavInner = nav.querySelector('.nav-inner');

  if (hasNavInner) {
    // Pages using style-shared.css (inicio, blog, recursos-docentes...)
    hasNavInner.innerHTML = `
      <a href="/" class="nav-logo">David Mateos</a>
      <ul class="nav-links">${items}</ul>
    `;
  } else {
    // Pages using legacy inline CSS (libros, autor, contacto...)
    nav.innerHTML = `
      <a class="nav-logo" href="/">David Mateos</a>
      <ul class="nav-links">${items}</ul>
    `;
  }
})();
