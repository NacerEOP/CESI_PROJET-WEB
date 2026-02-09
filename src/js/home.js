import { ImgSlideShow } from "./imageSlideShow.js";
import { Animation } from "./animations.js";

document.addEventListener("DOMContentLoaded", () => {
 
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

  new ImgSlideShow(
    document.getElementById("home-header"),
    [
      "../assets/images/internship1.png",
      "../assets/images/internship2.jpg",
      "../assets/images/internship3.jpg"
    ],
    10000
  ).start();
});


