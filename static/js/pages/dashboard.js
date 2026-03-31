document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.getElementById('stats-carousel');
    const prevBtn = document.getElementById('stats-prev');
    const nextBtn = document.getElementById('stats-next');
    const scrollAmount = 320;

    if (!carousel || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
});