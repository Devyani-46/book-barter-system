// ===== Mobile Menu Toggle =====
const toggleBtn = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggleBtn && navLinks) {
  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

// ===== Logo Preview Modal =====
const logo = document.querySelector('.logo-img');
const modal = document.getElementById('logoModal');
const modalImg = document.getElementById('logoPreview');
const closeBtn = document.querySelector('.close');

if (logo && modal && modalImg && closeBtn) {
  logo.addEventListener('click', (e) => {
    e.preventDefault(); // prevent default link action
    modal.style.display = "block";
    modalImg.src = logo.src;
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
  });

  window.addEventListener('click', (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  });
}

// ===== Highlight Active Sidebar Item Based on URL =====
const sidebarLinks = document.querySelectorAll(".sidebar nav ul li a");

sidebarLinks.forEach(link => {
  if(link.href === window.location.href){
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
