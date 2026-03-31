import { MediaSlideShow } from "../SlideShow.js";
import { Animation } from "../animations.js";
import { OffersCarousel } from "./OffersCarousel.js";

document.addEventListener("DOMContentLoaded", async () => {
 
  const target = document.querySelector('.centered-to-parent:not(#nav-bg)');
  if (target) {
    const anim = new Animation(target, "reveal-text");

 
    let wasVisible = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.intersectionRatio >= 0.9;
          if (wasVisible === null) {
            wasVisible = isVisible;
            if (isVisible) anim.play();
            return;
          }

          if (isVisible && !wasVisible) {
            anim.play();
          } else if (!isVisible && wasVisible) {
            anim.reverse();
          }

          wasVisible = isVisible;
        });
      },
      { threshold: [0, 0.9, 1] }
    );

    io.observe(target);
  }

// compute base for asset paths from <base> tag if present
    const baseEl = document.querySelector('base');
    const prefix = baseEl ? baseEl.getAttribute('href') : '';

    // helper to make URL relative to prefix
    const asset = (path) => prefix + path.replace(/^\/+/, '');

    new MediaSlideShow(
    document.getElementById("home-header"),
    [
      asset("static/assets/images/internship1.jpg"),
       { type: "video", src: asset("static/assets/videos/vid1.mp4"), muted: true, loop: true },
       { type: "video", src: asset("static/assets/videos/vid2.mp4"), muted: true, loop: true },
      asset("static/assets/images/internship2.jpg"),
      { type: "video", src: asset("static/assets/videos/vid3.mp4"), muted: true, loop: true },
      { type: "video", src: asset("static/assets/videos/vid4.mp4"), muted: true, loop: true }
    ],
    10000
  ).start();
  
  // Initialize offers carousel
  const carousel = new OffersCarousel('offers-track');
  await carousel.init();

});

