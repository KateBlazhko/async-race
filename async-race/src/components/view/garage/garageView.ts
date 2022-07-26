import Control from "../../common/control";

class GarageView extends Control{
  constructor(parent: HTMLElement | null, className: string) {
    super(parent, "header", className)

    const text = new Control(this.node, 'div', '', 'Garage')
  }
}

export default GarageView