new CssIncluder( "classes/getInfoButton/info.css" ).include();

class HidingInfo {
  constructor(elementSelector, content){
    this.element = document.querySelector(elementSelector);
    this.content = content;

    this.element.classList.add("info-element")
    this.element.addEventListener( "mouseenter", this.mouseEnterHandle.bind(this) );
  }

  async mouseEnterHandle(e){
    let beforeContent = this.element.textContent;
    this.element.classList.add("info-open");
    this.element.innerHTML = this.content;

    await new Promise(res => this.element.addEventListener("mouseleave", res, {once: true}));

    this.element.classList.remove("info-open");
    this.element.textContent = beforeContent;
  }
}
