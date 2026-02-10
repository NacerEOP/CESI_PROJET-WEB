import { MediaSlideShow } from "./SlideShow.js";
import { Animation } from "./animations.js";
import { GLApp } from "./GLapp.js";
import { CurvedTrackEffect } from "./ShaderEffects.js";

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

  new MediaSlideShow(
    document.getElementById("home-header"),
    [
      "../assets/images/internship1.jpg",
       { type: "video", src: "../assets/videos/vid1.mp4", muted: true, loop: true },
       { type: "video", src: "../assets/videos/vid2.mp4", muted: true, loop: true },
      "../assets/images/internship2.jpg",
      { type: "video", src: "../assets/videos/vid3.mp4", muted: true, loop: true },
      { type: "video", src: "../assets/videos/vid4.mp4", muted: true, loop: true }
    ],
    10000
  ).start();
  
  const sug_gl_canvas = document.getElementById("gl-canvas");
  if(sug_gl_canvas){
    const app = new GLApp(sug_gl_canvas);
  app.addEffect(new CurvedTrackEffect());
  app.start();
  }

});


