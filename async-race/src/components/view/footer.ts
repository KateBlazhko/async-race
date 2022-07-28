import Control from '../common/control';

class Footer extends Control {
  constructor(parent: HTMLElement | null, className: string) {
    super(parent, 'footer', className);

    this.node.innerHTML = Footer.drawFooter();
  }

  private static drawFooter() {
    return `
    <a class="link" href="https://github.com/KateBlazhko">KateBlazhko</a>
    <span>2022</span>
    <p class="text">
      Training project
    </p>
    <div class="footer__rs">
      <a class="link rs" href="https://rs.school/js/">«JavaScript/Frontend»</a>
      <div class="rs__logo"></div>
    </div>
    `;
  }
}

export default Footer;
