import Control from '../../common/control';
import Signal from '../../common/signal';
import { ICar } from '../../state/appState'
import Button from '../button';

class Car extends Control {

  constructor(
    parent: HTMLElement | null, 
    className: string, 
    car: ICar, 
    onSelectCar: Signal<ICar>,
    onRemoveCar: Signal<ICar>,
    ) {
    super(parent, 'div', className, car.name);
    const test = new Control(this.node, 'span', '', car.id.toString())

    const buttonSelect = new Button(this.node, 'button', 'Select')
    buttonSelect.node.onclick = () => {
      onSelectCar.emit(car)
    }

    const buttonRemove = new Button(this.node, 'button', 'Remove')
    buttonRemove.node.onclick = () => {
      onRemoveCar.emit(car)
    }
  }

}

export default Car;