/**
 * OffersCarousel - Horizontal scrolling carousel for internship offers
 * Offers scroll from right to left with smooth animation
 */
export class OffersCarousel {
  constructor(containerId = 'offers-track') {
    this.container = document.getElementById(containerId);
    this.track = this.container;
    this.offers = [];
    this.animationSpeed = 0.08; // pixels per millisecond
    this.autoScroll = true;
    this.isAnimating = false;
    this.scrollPosition = 0;
    this.animationFrameId = null;
    this.lastFrameTime = 0;

    // Get base path for routing
    const baseEl = document.querySelector('base');
    this.basePath = baseEl ? baseEl.getAttribute('href') : '';
  }

  /**
   * Fetch random offers from API
   */
  async loadOffers() {
    try {
      const response = await fetch(this.basePath + 'api/offers/random');
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      this.offers = await response.json();
      this.renderOffers();
      this.startAutoScroll();
    } catch (error) {
      console.error('Error loading offers:', error);
      this.showErrorMessage();
    }
  }

  /**
   * Render offer cards in the carousel
   */
  renderOffers() {
    this.track.innerHTML = '';
    
    if (!this.offers || this.offers.length === 0) {
      this.showNoOffersMessage();
      return;
    }

    // Create cards for each offer (duplicate for seamless loop)
    const offersToRender = [...this.offers, ...this.offers.slice(0, Math.min(3, this.offers.length))];
    
    offersToRender.forEach((offer, index) => {
      const card = this.createOfferCard(offer, index);
      this.track.appendChild(card);
    });
  }

  /**
   * Create individual offer card element
   */
  createOfferCard(offer, index) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.setAttribute('data-offer-id', offer.IdInternship);
    
    // Format budget
    const budgetText = offer.Budget ? `$${parseFloat(offer.Budget).toFixed(0)}/mo` : 'N/A';
    
    // Format duration
    const durationText = offer.Time_ ? `${offer.Time_} weeks` : 'TBD';
    
    // Truncate description
    const description = offer.Description ? offer.Description.substring(0, 80) + '...' : 'No description';

    card.innerHTML = `
      <div>
        <h3 class="offer-card-title">${this.escapeHtml(offer.Title)}</h3>
        <div class="offer-card-company">${this.escapeHtml(offer.CompanyName)}</div>
        <span class="offer-card-category">${this.escapeHtml(offer.CategoryName)}</span>
        <p style="font-size: 0.9em; color: #666; margin: 8px 0; line-height: 1.4;">${this.escapeHtml(description)}</p>
      </div>
      <div class="offer-card-meta">
        <div class="offer-card-budget">${budgetText}</div>
        <div class="offer-card-duration">${durationText}</div>
      </div>
    `;

    // Add click handler to navigate to offer detail
    card.addEventListener('click', () => {
      this.navigateToOffer(offer.IdInternship);
    });

    // Add keyboard accessibility
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.navigateToOffer(offer.IdInternship);
      }
    });

    return card;
  }

  /**
   * Navigate to offer detail page
   */
  navigateToOffer(offerId) {
    const detailUrl = this.basePath + 'internship/detail?id=' + offerId;
    window.location.href = detailUrl;
  }

  /**
   * Start auto-scroll animation
   */
  startAutoScroll() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Stop auto-scroll animation
   */
  stopAutoScroll() {
    this.isAnimating = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Animation loop using requestAnimationFrame
   */
  animate = () => {
    if (!this.isAnimating) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update scroll position
    this.scrollPosition += this.animationSpeed * deltaTime;

    // Get track width and content width
    const trackWidth = this.track.offsetWidth;
    const contentWidth = this.track.scrollWidth;

    // Reset position when carousel completes one full scroll
    if (this.scrollPosition >= contentWidth - trackWidth) {
      this.scrollPosition = 0;
    }

    // Apply transform
    this.track.style.transform = `translateX(${-this.scrollPosition}px)`;

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Pause animation on hover of individual cards
   */
  addHoverPause() {
    const carousel = document.querySelector('.offers-carousel');
    if (!carousel) return;

    let hoverCount = 0;

    // Use event delegation on the carousel container
    carousel.addEventListener('mouseenter', (e) => {
      // Only pause if hovering over an offer card
      if (e.target.closest('.offer-card')) {
        hoverCount++;
        this.stopAutoScroll();
      }
    }, true); // Use capture phase to catch events before they bubble

    carousel.addEventListener('mouseleave', (e) => {
      // Only resume if leaving an offer card and no other cards are hovered
      if (e.target.closest('.offer-card')) {
        hoverCount = Math.max(0, hoverCount - 1);
        if (hoverCount === 0) {
          this.startAutoScroll();
        }
      }
    }, true);
  }

  /**
   * Show no offers message
   */
  showNoOffersMessage() {
    this.track.innerHTML = `
      <div style="width: 100%; display: flex; align-items: center; justify-content: center; color: #666;">
        <p>No offers available at the moment. Check back soon!</p>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showErrorMessage() {
    this.track.innerHTML = `
      <div style="width: 100%; display: flex; align-items: center; justify-content: center; color: #d32f2f;">
        <p>Failed to load offers. Please refresh the page.</p>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Initialize carousel
   */
  async init() {
    await this.loadOffers();
    this.addHoverPause();
  }

  /**
   * Destroy carousel and cleanup
   */
  destroy() {
    this.stopAutoScroll();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
