import Control from './control'

class SVG extends Control{
  constructor(
    private parent: HTMLElement | null,
    private className: string,
    private link: string
  ) {
    super(parent, 'div', className)
    
    this.node.innerHTML = `
    <svg class="svg">
      <use xlink:href="${link}"/>
    </svg>
    `
  }

  setColor(color: string) {
    this.node.style.fill = color
  }
}

export default SVG
