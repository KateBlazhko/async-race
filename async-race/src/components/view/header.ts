import Control from "../common/control";
import { Page } from '../app/app'


class Header extends Control{

  constructor(parent: HTMLElement | null, className: string, pages: Page[]) {
    super(parent, "header", className);

    pages.map(page => {
      const button = new Control<HTMLLinkElement>(this.node, 'a', 'button')
      button.node.href = `#${page.hash}`;
      button.node.innerText = page.hash;
    })
  }
}

export default Header