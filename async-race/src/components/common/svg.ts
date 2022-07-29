import Control from './control'

class SVG extends Control<HTMLObjectElement>{
  constructor(
    private parent: HTMLElement | null,
    private className: string,
    private data: string,
    private content?: string
  ) {
    super(parent, 'object', className, content)
    
    this.node.type = 'image/svg+xml'
    this.node.data = data
  }

  setColor(color: string) {

    this.node.style.setProperty('--element-color', '#' + color)
  }
}

export default SVG
