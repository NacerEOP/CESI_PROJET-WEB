export class Animation {
  constructor(element, className) {
    this.el = element;
    this.className = className;
  }

  play() {
    // Ensure animation restarts: remove classes, force reflow, then add class
    this.el.classList.remove(this.className, "reverse");
    void this.el.offsetWidth;
    this.el.classList.add(this.className);
  }

  reverse() {
    // Restart animation in reverse: remove then re-add class, then mark reverse
    this.el.classList.remove(this.className);
    void this.el.offsetWidth;
    this.el.classList.add(this.className);
    this.el.classList.add("reverse");
  }

  reset() {
    this.el.classList.remove(this.className, "reverse");
  }
}
