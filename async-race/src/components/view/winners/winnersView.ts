import Control from "../../common/control";

class WinnersView extends Control{
  constructor(parent: HTMLElement | null, className: string) {
    super(parent, "header", className)

    const text = new Control(this.node, 'div', '', 'Winners')

  }
}

export default WinnersView