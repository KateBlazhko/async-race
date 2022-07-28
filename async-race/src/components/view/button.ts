import Control from "../common/control";

class Button extends Control<HTMLButtonElement> {
  constructor(
    parent: HTMLElement | null,
    className: string,
    content: string,
    disable?: boolean
  ) {
    super(parent, "button", className, content);

    if (disable !== undefined) {
      this.node.disabled = disable
    }
  }

  
}

export default Button
