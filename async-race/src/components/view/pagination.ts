import Control from '../common/control';
import Button from './button';

enum InnerButton {
  prevButton = 'Prev',
  nextButton = 'Next',
}

class Pagination extends Control {
  private paginationButtons: Button[];

  private initialSate: boolean[] | null = null;

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
    this.initialSate = initialSate;
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

  public updateButtons(raceState: boolean) {
    const isRace = raceState;
    const [buttonPrev, buttonNext] = this.paginationButtons;

    if (isRace) {
      buttonPrev.node.disabled = isRace;
      buttonNext.node.disabled = isRace;
    } else if (this.initialSate) {
      const [prev, next] = this.initialSate;
      buttonPrev.node.disabled = prev;
      buttonNext.node.disabled = next;
    }
  }
}

export default Pagination;
