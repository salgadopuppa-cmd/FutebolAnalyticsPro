document.addEventListener('DOMContentLoaded', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeInElements.forEach(element => {
        observer.observe(element);
    });
});

// fallback para imagens dos posts — adicionado por fix/blog-images
document.addEventListener('DOMContentLoaded', function() {
  const placeholder = 'img/placeholder-article.png';
  document.querySelectorAll('img.blog-image').forEach(img => {
    img.addEventListener('error', function() {
      if (!this.dataset._fallbacked) {
        this.dataset._fallbacked = '1';
        this.src = placeholder;
      }
    });
  });
});
