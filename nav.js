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
    { href: 'https://www.goodreads.com/author/show/7356842.David_Mateos', label: 'Goodreads', target: '_blank' },
  ];

  const items = links.map(({ href, label, target }) => {
    const fileName = href.replace('/', '');
    const isActive = currentPath === fileName ? ' class="active"' : '';
    const targetAttr = target ? ` target="${target}"` : '';
    return `<li><a href="${href}"${isActive}${targetAttr}>${label}</a></li>`;
  }).join('');

  const nav = document.querySelector('nav');
  if (!nav) return;

  const hasNavInner = nav.querySelector('.nav-inner');

  if (hasNavInner) {
    // Pages using style-shared.css (inicio, blog, recursos-docentes...)
    hasNavInner.innerHTML = `
      <a href="/inicio.html" class="nav-logo">David Mateos</a>
      <ul class="nav-links">${items}</ul>
    `;
  } else {
    // Pages using legacy inline CSS (libros, autor, contacto...)
    nav.innerHTML = `
      <a class="nav-logo" href="/inicio.html">David Mateos</a>
      <ul class="nav-links">${items}</ul>
    `;
  }
})();
