/* =============================================
   Mara Events — blog.js
   Blog index page interactivity
   ============================================= */

// Blog filter functionality
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogCards  = document.querySelectorAll('.blog-card');
  const featuredPost = document.getElementById('featured-post');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // Show / hide cards with fade-in animation
      blogCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          // Restart animation
          card.style.animation = 'none';
          card.offsetHeight; // force reflow
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });

      // Hide the featured post section for non-planning / non-all filters
      if (featuredPost) {
        const featuredSection = featuredPost.closest('section');
        if (featuredSection) {
          featuredSection.style.display =
            (filter === 'all' || filter === 'planning') ? '' : 'none';
        }
      }
    });
  });
});
