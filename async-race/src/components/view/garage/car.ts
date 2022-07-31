import Control from '../../common/control';
import SVG from '../../common/svgElement';
import svg from '../../../assets/sprite.svg'
import Signal from '../../common/signal';
import { ICar } from '../../state/appState'
import Button from '../button';
import { TrackData } from './garageView'

enum ButtonText {
  select = "Select",
  remove = "Remove",
  start = "Start",
  stop = "Stop",
}

class Car extends Control {
  public containerImage: Control;
  private car: ICar;
  private _id: Readonly<number>
  private buttonStart: Button
  private buttonStop: Button

  get id() {
    return this._id
  }
  // public id: Readonly<number>
  
  constructor(
    parent: HTMLElement | null, 
    className: string, 
    car: ICar, 
    onSelectCar: Signal<ICar>,
    onRemoveCar: Signal<ICar>,
    onStartCar: Signal<TrackData>,
    onStopCar: Signal<TrackData>,
    ){
    super(parent, 'div', className);

    this.car = car
    this._id = this.car.id

    const buttonsControl = new Control(this.node, 'div', 'garage__button-wrap double')
    this.renderButtonsControl(buttonsControl, onSelectCar, onRemoveCar)
    
    new Control(this.node, 'span', 'garage__name', car.name)

    const buttonsEngine = new Control(this.node, 'div', 'garage__button-wrap')
    this.buttonStart = new Button(buttonsEngine.node, 'button button_car', ButtonText.start)
    this.buttonStop = new Button(buttonsEngine.node, 'button button_car', ButtonText.stop, true)

    this.containerImage = new Control(this.node, 'div', 'garage__track')

    this.renderButtonsEngine(onStartCar, onStopCar, this.renderImage(car))
  }

  renderButtonsControl(wrap: Control, onSelectCar: Signal<ICar>, onRemoveCar: Signal<ICar>) {
    const buttonSelect = new Button(wrap.node, 'button button_car', ButtonText.select)
    buttonSelect.node.onclick = () => {
      onSelectCar.emit(this.car)
    }

    const buttonRemove = new Button(wrap.node, 'button button_car', ButtonText.remove)
    buttonRemove.node.onclick = () => {
      onRemoveCar.emit(this.car)
    }
  }

  renderButtonsEngine(
    onStartCar: Signal<TrackData>, 
    onStopCar: Signal<TrackData>,
    image: Control
  ) {
    const id = this.id

    this.buttonStart.node.onclick = () => {
      onStartCar.emit({[id]: [image, this.getTrackLength()]})
      this.buttonStart.node.disabled = true
    }

    this.buttonStop.node.onclick = () => {
      onStopCar.emit({[id]: [image, this.getTrackLength()]})
      this.buttonStop.node.disabled = true
    }
  }

  public renderImage(car: ICar) {
    const carImage = new Control(this.containerImage.node, 'div', 'garage__image')
    const image = new SVG(carImage.node, 'svg', svg + '#car')
    image.setColor(car.color)
    return carImage
  }

  public getTrackLength() {
    return this.containerImage.node.clientWidth
  }

  public updateButtonEngine(state: boolean) {
    const isDriving = state
    if(isDriving)
      this.buttonStop.node.disabled = false
    else 
      this.buttonStart.node.disabled = false

  }
}

export default Car;