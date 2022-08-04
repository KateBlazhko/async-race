import Control from '../common/control';
import { Page } from '../app/app';

class Header extends Control {
  constructor(parent: HTMLElement | null, className: string, pages: Page[]) {
    super(parent, 'header', className);

    pages.map((page) => {
      const button = new Control<HTMLLinkElement>(this.node, 'a', `button button_header header-${page.hash}`);
      button.node.href = `#${page.hash}`;
      button.node.innerText = page.hash[0].toUpperCase() + page.hash.slice(1);
    });


  }
}

export default Header;
