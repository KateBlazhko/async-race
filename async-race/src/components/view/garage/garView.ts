import Control from '../../common/control';
import Settings from './settings';
import Signal from '../../common/signal';
import Button from '../button';
import Car from './car';
import Notification from '../notification'
import Pagination from '../pagination';
import GarageController from '../../controller/garController';
import GarModel, { ICar, ICarState, IPageCars } from '../../state/garModel';

export type TrackData = {
  [id: number]: [Control, number]
}

enum TextContent {
  title = 'Garage 0',
  subtitle = '#1',
  prevButton = 'Prev',
  nextButton = "Next",
}

class GarView extends Control {
  private model: GarModel
  private controller: GarageController
  private settings: Settings;
  private cars: Control;
  private pagination: Pagination;
  private list: Car[]
  private title: Control
  private subtitle: Control

  constructor(parent: HTMLElement | null, className: string, model: GarModel, controller: GarageController) {
    super(parent, 'div', className);
    this.model = model
    this.controller = controller

    const titleWrap = new Control(this.node, 'div', 'title-wrap')
    this.title = new Control(titleWrap.node, 'h2', 'title title_h2', TextContent.title)
    this.subtitle = new Control(titleWrap.node, 'h3', 'title title_h3', TextContent.subtitle)
    
    const selectedCar = this.controller.getSelectedCar()
    this.settings = new Settings(
      this.node,
      'garage__settings settings',
      this.model.state.settings,
      this.onCreateCar,
      this.onUpdateCar,
      selectedCar
    );

    this.list = []

    this.cars = new Control(this.node, 'div', 'garage__list');
    
    this.pagination = new Pagination(this.node, 'pagination')

    this.init()
  }

    public onSelectCar = new Signal<ICar>()
    public onRemoveCar = new Signal<ICar>()
    public onCreateCar = new Signal<Omit<ICar, 'id'>>()
    public onUpdateCar = new Signal<Omit<ICar, 'id'>>()
    public onStartCar = new Signal<TrackData>()
    public onStopCar = new Signal<TrackData>()

    public init() {
      this.initSettings()

      this.addToSignal()
      
      this.getCars()
    }

    private initSettings() {
      this.settings.onGenerateCars = () => {
        this.controller.createRandomCars()
      }

      this.settings.onRace = () => {
        this.controller.startRace(this.list)
      }

      this.settings.onReset = () => {
        this.controller.resetRace(this.list)
      }
    }

    private initPagination() {
      const initialSate = this.controller.getButtonDisable(this.model.state)

      this.pagination.render(initialSate)

      this.pagination.onPrev = (button: Button) => {
        this.controller.changePageNumber(this.model.state.pageNumber - 1)
        const [ prev ] = this.controller.getButtonDisable(this.model.state)
  
        button.node.disabled = prev
      }

      this.pagination.onNext = (button: Button) => {
        this.controller.changePageNumber(this.model.state.pageNumber + 1)
        const [ _prev, next ] = this.controller.getButtonDisable(this.model.state)
  
        button.node.disabled = next
      }
    }

    public getCars() {
      this.controller.getCars()
    }

    public renderCars(cars: IPageCars) {
      this.updateSubtitle(cars.pageNumber)
  
      if (this.list.length > 0) this.list.map(car => car.destroy())
  
      this.list = cars.page.map(car => {
        return new Car(
          this.cars.node, 
          'garage__car', 
          car, 
          this.onSelectCar, 
          this.onRemoveCar, 
          this.onStartCar, 
          this.onStopCar)
      })
    }

    private updateTitle(carsCount: number) {
      this.title.node.textContent = `Garage ${carsCount}`
    }
  
    private updateSubtitle(ageNumber: number){
      this.subtitle.node.textContent = `#${ageNumber}`
  
    }

    private updateButtonEngine(carState: ICarState) {
      const id = Object.keys(carState)
      const cars = this.list.filter(car => id.includes(car.id.toString()))
      cars.map(car => {
        const id = car.id
        car.updateButtonEngine(carState[id])
      })
    }

    private renderNotification(winner: Record<string, string>) {
      const [[name, time]] = Object.entries(winner)
      const text = `${name} is winner!!! (${time}s)`
      new Notification(document.body, "notification", text);
    }

    private addToSignal() {
      if (this.settings && this.cars) {
        this.onCreateCar.add(this.controller.createCar.bind(this.controller))
        this.onUpdateCar.add(this.controller.updateCar.bind(this.controller))
        this.onSelectCar.add(this.controller.selectCar.bind(this.controller))
        this.onSelectCar.add(this.settings.changeInputsUpdate.bind(this.settings))
        this.onRemoveCar.add(this.controller.removeCar.bind(this.controller))

        this.onStartCar.add(this.controller.startEngine.bind(this.controller))
        this.onStopCar.add(this.controller.stopEngine.bind(this.controller))

        this.model.onGetCars.add(this.renderCars.bind(this))
        this.model.onGetCarsCount.add(this.initPagination.bind(this))
        this.model.onGetCarsCount.add(this.updateTitle.bind(this))
        this.model.onChangeCarState.add(this.updateButtonEngine.bind(this))
        this.model.onChangeRaceState.add(this.settings.updateButtons.bind(this.settings))
        this.model.onShowWinner.add(this.renderNotification.bind(this))

        this.settings.onInputChange.add(this.controller.inputChange.bind(this.controller))
      }
    }

 }

export default GarView;
