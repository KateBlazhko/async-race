import Control from '../../common/control';
import AppController from '../../controller/appController';
import AppState from '../../state/appState'

class WinnersView extends Control {
  private state: AppState
  private controller: AppController
  public name : string= 'winners'

  constructor(parent: HTMLElement | null, className: string, state: AppState, controller: AppController) {
    super(parent, 'div', className);
    this.state = state
    this.controller = controller
    const text = new Control(this.node, 'div', '', 'Winners');
  }
}

export default WinnersView;
