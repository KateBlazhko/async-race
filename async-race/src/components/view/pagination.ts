import Control from '../common/control';
import Button from './button';

enum InnerButton {
  prevButton = 'Prev',
  nextButton = 'Next',
}

class Pagination extends Control {
  private paginationButtons: Button[];

  public onPrev: (button: Button) => void;

  public onNext: (button: Button) => void;

  constructor(
    parent: HTMLElement | null,
    className: string,
  ) {
    super(parent, 'div', className);
    this.onPrev = () => {};
    this.onNext = () => {};

    this.paginationButtons = [];
  }

  public render(initialSate: boolean[]) {
    if (this.paginationButtons && this.paginationButtons.length > 0) {
      this.paginationButtons.map((button) => button.destroy());
    }

    const [prev, next] = initialSate;

    const buttonPrev = new Button(this.node, 'button', InnerButton.prevButton, prev);
    buttonPrev.node.onclick = () => {
      this.onPrev(buttonPrev);
    };

    const buttonNext = new Button(this.node, 'button', InnerButton.nextButton, next);
    buttonNext.node.onclick = () => {
      this.onNext(buttonNext);
    };

    this.paginationButtons = [buttonPrev, buttonNext];
  }
}

export default Pagination;
