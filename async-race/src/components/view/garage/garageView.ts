import Control from '../../common/control';
import Settings from './settings';
import { ICar, ICarState, IPageCars } from '../../state/appState'
import AppState from '../../state/appState';
import AppController from '../../controller/appController';
import Signal from '../../common/signal';
import Button from '../button';
import Car from './car';
import Notification from '../notification'

export type TrackData = {
  [id: number]: [Control, number]
}

enum TextContent {
  title = 'Garage (0)',
  subtitle = 'Page#1',
  prevButton = 'Prev',
  nextButton = "Next",
}

class GarageView extends Control {
  private state: AppState
  private controller: AppController
  private settings: Settings;
  private cars: Control;
  private pagination: Control;
  public name: string= 'garage'
  private paginationButtons: Button[]
  private list: Car[]
  private title: Control
  private subtitle: Control

  constructor(parent: HTMLElement | null, className: string, state: AppState, controller: AppController) {
    super(parent, 'div', className);
    this.state = state
    this.controller = controller

    const selectedCar = this.controller.getSelectedCar()
    this.settings = new Settings(
      this.node,
      'garage__settings settings',
      this.state.garageState.settings,
      this.onCreateCar,
      this.onUpdateCar,
      selectedCar
    );

    this.list = []
    this.title = new Control(this.node, 'h2', 'title title_h2', TextContent.title)
    this.subtitle = new Control(this.node, 'h3', 'title title_h3', TextContent.subtitle)

    this.cars = new Control(this.node, 'div', 'garage__cars-list');
    
    this.paginationButtons = []
    this.pagination = new Control(this.node, 'div', 'garage__pagination')

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

    private renderPagination() {
      if (this.paginationButtons && this.paginationButtons.length > 0) 
        this.paginationButtons.map(button => button.destroy())

      const [prev, next] = this.controller.getButtonDisable()

      const buttonPrev = new Button(this.pagination.node, 'button', TextContent.prevButton, prev)
      buttonPrev.node.onclick = () => {
        this.controller.changePageNumber(this.state.garageState.pageNumber - 1)
        const [ prev ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = prev
      }
  
      const buttonNext = new Button(this.pagination.node, 'button', TextContent.nextButton, next)
      buttonNext.node.onclick = () => {
        this.controller.changePageNumber(this.state.garageState.pageNumber + 1)
        const [ _prev, next ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = next
      }

      this.paginationButtons = [buttonPrev, buttonNext]

    }

    private updateTitle(carsCount: number) {
      this.title.node.textContent = `Garage (${carsCount})`
    }
  
    private updateSubtitle(ageNumber: number){
      this.subtitle.node.textContent = `Page#${ageNumber}`
  
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
      const notification = new Notification(document.body, "notification", text);
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

        this.state.onGetCars.add(this.renderCars.bind(this))
        this.state.onGetCarsCount.add(this.renderPagination.bind(this))
        this.state.onGetCarsCount.add(this.updateTitle.bind(this))
        this.state.onChangeCarState.add(this.updateButtonEngine.bind(this))
        this.state.onChangeRaceState.add(this.settings.updateButtons.bind(this.settings))
        this.state.onShowWinner.add(this.renderNotification.bind(this))

        this.settings.onInputChange.add(this.controller.inputChange.bind(this.controller))
      }
    }

 }

export default GarageView;
