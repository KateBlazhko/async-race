import Control from '../../common/control';
import Settings from './settings';
import CarsList from './carsList'
import { ICar } from '../../state/appState'
import AppState from '../../state/appState';
import AppController from '../../controller/appController';
import Signal from '../../common/signal';
import Button from '../button';

class GarageView extends Control {
  private state: AppState
  private controller: AppController
  private settings: Settings;
  private cars: CarsList;
  private pagination: Control;
  public name: string= 'garage'
  private paginationButtons: Button[]

  constructor(parent: HTMLElement | null, className: string, state: AppState, controller: AppController) {
    super(parent, 'div', className);
    this.state = state
    this.controller = controller

    const selectedCar = this.controller.getSelectedCar()
    this.settings = new Settings(
      this.node,
      'garage__settings settings',
      this.state.stateData.settings,
      this.onCreateCar,
      this.onUpdateCar,
      selectedCar
    );

    this.cars = new CarsList(
      this.node,
      'garage__cars-list',
    );

    this.paginationButtons = []
    this.pagination = new Control(this.node, 'div', 'garage__pagination')

    this.init()
  }

    public onSelectCar = new Signal<ICar>()
    public onRemoveCar = new Signal<ICar>()
    public onCreateCar = new Signal<Omit<ICar, 'id'>>()
    public onUpdateCar = new Signal<Omit<ICar, 'id'>>()
    public onStopCar = new Signal<number>()
    public onStartCar = new Signal<number>()

    public init() {
      this.initSettings()

      this.addToSignal()
      
      this.renderCars()
    }

    private initSettings() {
      this.settings.onGenerateCars = () => {
        this.controller.createRandomCars()
      }
    }

    public renderCars() {
      this.controller.getCars()
    }

    private renderPagination() {
      if (this.paginationButtons && this.paginationButtons.length > 0) 
        this.paginationButtons.map(button => button.destroy())

      const [prev, next] = this.controller.getButtonDisable()

      const buttonPrev = new Button(this.pagination.node, 'button', 'Prev', prev)
      buttonPrev.node.onclick = () => {
        this.controller.changePageNumber(this.state.stateData.pageNumber - 1)
        const [ prev ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = prev
      }
  
      const buttonNext = new Button(this.pagination.node, 'button', 'Next', next)
      buttonNext.node.onclick = () => {
        this.controller.changePageNumber(this.state.stateData.pageNumber + 1)
        const [ _prev, next ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = next
      }

      this.paginationButtons = [buttonPrev, buttonNext]

    }

    private addToSignal() {
      if (this.settings && this.cars) {
        this.onCreateCar.add(this.controller.createCar.bind(this.controller))
        this.onUpdateCar.add(this.controller.updateCar.bind(this.controller))
        this.onSelectCar.add(this.controller.selectCar.bind(this.controller))
        this.onSelectCar.add(this.settings.changeInputsUpdate.bind(this.settings))
        this.onStartCar.add(this.controller.switchEngine.bind(this.controller, 'started'))
        this.onStopCar.add(this.controller.switchEngine.bind(this.controller, 'stopped'))

        this.onRemoveCar.add(this.controller.removeCar.bind(this.controller))
        this.state.onGetCars.add(this.cars.render.bind(
          this.cars, 
          this.onSelectCar, 
          this.onRemoveCar,
          this.onStartCar,
          this.onStopCar,
        ))
        this.state.onGetCarsCount.add(this.renderPagination.bind(this))
        this.state.onGetCarsCount.add(this.cars.updateTitle.bind(this.cars))
        this.settings.onInputChange.add(this.controller.inputChange.bind(this.controller))
      }
    }

 }

export default GarageView;
