import Control from "../common/control";

class Input extends Control<HTMLInputElement> {
  constructor(
    parent: HTMLElement | null,
    className: string,
    type: string,
    value: string,
    disable?: boolean
  ) {
    super(parent, "input", className);
    this.node.type = type;
    this.node.value = value;

    if (disable !== undefined) {
      this.node.disabled = disable
    }
  }

  
}

export default Input
