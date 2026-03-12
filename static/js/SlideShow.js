export class MediaSlideShow {
  constructor(parent, items, interval = 5000, transition = "fade") {
    this.parent = parent;
    this.items = items;
    this.interval = interval;
    this.transition = transition;
    this.index = 0;
    this.current = 0;
    this.timer = null;

    parent.classList.add("slideshow");

    this.bg = document.createElement("div");
    this.bg.className = "slideshow-bg";
    parent.prepend(this.bg);

    this.slides = [this.createSlide(), this.createSlide()];
    if (transition !== "fade") this.slides.forEach(s => (s.style.transition = "none"));
  }

  createSlide() {
    const div = document.createElement("div");
    div.className = "slide";
    this.bg.appendChild(div);
    return div;
  }

  normalizeItem(item) {
    if (typeof item === "string") {
      const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(item);
      return isVideo ? { type: "video", src: item } : { type: "image", src: item };
    }
    return item; // {type:"image"/"video", src:"..."}
  }

  setSlideContent(slideEl, itemRaw) {
    const item = this.normalizeItem(itemRaw);

    // clear old content (and stop old video)
    const oldVid = slideEl.querySelector("video");
    if (oldVid) { oldVid.pause(); oldVid.src = ""; }
    slideEl.innerHTML = "";

    if (item.type === "video") {
      const v = document.createElement("video");
      v.src = item.src;
      v.muted = item.muted ?? true;
      v.loop = item.loop ?? true;
      v.autoplay = item.autoplay ?? true;
      v.playsInline = true;
      v.preload = item.preload ?? "metadata";
      slideEl.appendChild(v);

      // try to start playback (may require muted=true to work reliably)
      v.play().catch(() => {});
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt ?? "";
      img.loading = "eager";
      slideEl.appendChild(img);
    }
  }

  start() {
    this.setSlideContent(this.slides[0], this.items[0]);
    this.slides[0].classList.add("active");
    this.timer = setInterval(() => this.next(), this.interval);
  }

  next() {
    const nextIndex = (this.index + 1) % this.items.length;
    const nextSlide = this.slides[1 - this.current];
    const currentSlide = this.slides[this.current];

    this.setSlideContent(nextSlide, this.items[nextIndex]);

    nextSlide.classList.add("active");
    currentSlide.classList.remove("active");

    // stop video on the slide that just got hidden
    const hiddenVid = currentSlide.querySelector("video");
    if (hiddenVid) hiddenVid.pause();

    this.current = 1 - this.current;
    this.index = nextIndex;
  }
}
