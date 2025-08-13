  
  // Script para manejar el menú responsive en móviles
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.navbar-links');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Cierra el menú si se hace clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });