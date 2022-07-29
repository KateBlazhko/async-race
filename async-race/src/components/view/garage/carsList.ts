import Control from '../../common/control';
import Signal from '../../common/signal';
import { ICar, IPageCars } from '../../state/appState';
import Car from './car'

class CarsList extends Control {
  private list: Car[]
  private title: Control
  private subtitle: Control

  constructor(
    public parent: HTMLElement | null, 
    public className: string
  ) {
    super(parent, 'div', className);
    this.list = []
    this.title = new Control(this.node, 'h2', 'title title_h2', `Garage (0)`)
    this.subtitle = new Control(this.node, 'h3', 'title title_h3', `Page#1`)
  }

  updateTitle(carsCount: number) {
    this.title.node.textContent = `Garage (${carsCount})`
  }

  updateSubtitle(ageNumber: number){
    this.subtitle.node.textContent = `Page#${ageNumber}`

  }

  render(
    onSelectCar: Signal<ICar>, 
    onRemoveCar: Signal<ICar>, 
    onStartCar: Signal<number>,
    onStopCar: Signal<number>,
    cars: IPageCars, 
  ) {
    this.updateSubtitle(cars.pageNumber)

    if (this.list.length > 0) this.list.map(car => car.destroy())

    this.list = cars.page.map(car => {
      return  new Car(this.node, 'garage__car', car, onSelectCar, onRemoveCar, onStartCar, onStopCar)
    })
  }
}

export default CarsList;
