import { ImgSlideShow } from "./imageSlideShow.js";

new ImgSlideShow(
  document.getElementById("home-Header"),
  [
    "../assets/images/internship1.png",
    "../assets/images/internship2.jpg",
    "../assets/images/internship3.jpg"
  ],
  4000
).start();
