import Control from '../../common/control';
import SVG from '../../common/svgElement';
import svg from '../../../assets/sprite.svg'
import Signal from '../../common/signal';
import { ICar } from '../../state/garModel'
import Button from '../button';
import { TrackData } from './garView'

enum ButtonText {
  select = "Select",
  remove = "Remove",
  start = "A",
  stop = "B",
}

class Car extends Control {
  public track: Control;
  private _image: Control
  private _id: Readonly<number>
  private _name: Readonly<string>
  private buttonsEngine: Button
  private buttonsEngineList: Button[]

  get id() {
    return this._id
  }
  get name() {
    return this._name
  }
  get image() {
    return this._image
  }
  
  constructor(
    public parent: HTMLElement | null, 
    public className: string, 
    private car: ICar, 
    private onSelectCar: Signal<ICar>,
    private onRemoveCar: Signal<ICar>,
    private onStartCar: Signal<TrackData>,
    private onStopCar: Signal<TrackData>,
  ){
    super(parent, 'div', className);

    this.car = car
    this._id = this.car.id
    this._name = this.car.name
    this.onStartCar = onStartCar
    this.onRemoveCar = onRemoveCar
    this.onStartCar = onStartCar
    this.onStopCar = onStopCar


    const buttonsControl = new Control(this.node, 'div', 'garage__button-wrap double')
    this.renderButtonsControl(buttonsControl)
    
    new Control(this.node, 'span', 'garage__name', car.name + car.id)

    this.buttonsEngine = new Control(this.node, 'div', 'garage__button-wrap')

    this.track = new Control(this.node, 'div', 'garage__track')
    
    this._image = this.renderImage(car)
    this.buttonsEngineList = this.renderButtonsEngine(false)
  }

  renderButtonsControl(wrap: Control) {
    const buttonSelect = new Button(wrap.node, 'button button_car', ButtonText.select)
    buttonSelect.node.onclick = () => {
      this.onSelectCar.emit(this.car)
    }

    const buttonRemove = new Button(wrap.node, 'button button_car', ButtonText.remove)
    buttonRemove.node.onclick = () => {
      this.onRemoveCar.emit(this.car)
    }
  }

  renderButtonsEngine(isDriving: boolean) {
    const id = this.id

    const buttonStart = new Button(this.buttonsEngine.node, 'button button_start', '', isDriving)
    const buttonStop = new Button(this.buttonsEngine.node, 'button button_stop', '', !isDriving)

    buttonStart.node.onclick = () => {
      this.onStartCar.emit({[id]: [this.image, this.getTrackLength()]})
      buttonStart.node.disabled = true
    }

    buttonStop.node.onclick = () => {
      this.onStopCar.emit({[id]: [this.image, this.getTrackLength()]})
      buttonStop.node.disabled = true
    }

    return [buttonStart, buttonStop]
  }

  public renderImage(car: ICar) {
    const flagContainer = new Control(this.track.node, 'div', 'garage__image-flag')
    const flag = new SVG(flagContainer.node, 'svg_flag', svg + '#flag')
    flag.setColor(car.color)

    const imageContainer = new Control(this.track.node, 'div', 'garage__image-car')
    const image = new SVG(imageContainer.node, 'svg_car', svg + '#car')
    image.setColor(car.color)
    return imageContainer
  }

  public getTrackLength() {
    return this.track.node.clientWidth
  }

  public updateButtonEngine(state: boolean) {
    const isDriving = state
    this.buttonsEngineList.map(button => button.destroy())

    this.buttonsEngineList = this.renderButtonsEngine(isDriving)

    
  }

}

export default Car;