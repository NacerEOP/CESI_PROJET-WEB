export class ImgSlideShow {
  constructor(parent, images, interval = 5000, transition = "fade") {
    this.parent = parent;
    this.images = images;
    this.interval = interval;
    this.transition = transition; // ← DEV CHOICE
    this.index = 0;
    this.current = 0;

    this.slides = [
      this.createSlide(),
      this.createSlide()
    ];

    // apply transition behavior ONCE
    if (this.transition === "fade") {
      this.slides.forEach(slide => {
        slide.style.transition = "opacity 600ms ease";
      });
    } else {
      this.slides.forEach(slide => {
        slide.style.transition = "none";
      });
    }
  }

  createSlide() {
    const div = document.createElement("div");
    div.className = "slide";
    this.parent.appendChild(div);
    return div;
  }

  start() {
    this.slides[0].style.backgroundImage =
      `url("${this.images[0]}")`;
    this.slides[0].classList.add("active");

    this.timer = setInterval(() => this.next(), this.interval);
  }

  next() {
    const nextIndex = (this.index + 1) % this.images.length;
    const nextSlide = this.slides[1 - this.current];
    const currentSlide = this.slides[this.current];

    nextSlide.style.backgroundImage =
      `url("${this.images[nextIndex]}")`;

    nextSlide.classList.add("active");
    currentSlide.classList.remove("active");

    this.current = 1 - this.current;
    this.index = nextIndex;
  }
}
