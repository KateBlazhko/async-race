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
  private cars: CarsList
  public name: string= 'garage'
  private paginationButtonList: Button[]

  constructor(parent: HTMLElement | null, className: string, state: AppState, controller: AppController) {
    super(parent, 'div', className);
    this.state = state
    this.controller = controller

    this.settings = new Settings(
      this.node,
      'garage__settings settings',
      this.state.stateData.settings,
      this.onCreateCar,
      this.onUpdateCar,
      this.controller.getSelectedCar()
    );

    this.cars = new CarsList(
      this.node,
      'garage__cars-list',
    );

    this.addToSignal()

    this.paginationButtonList = []
    
    this.drawCars()
  }

    public onSelectCar = new Signal<ICar>()
    public onRemoveCar = new Signal<ICar>()
    public onCreateCar = new Signal<Omit<ICar, 'id'>>()
    public onUpdateCar = new Signal<Omit<ICar, 'id'>>()

    public drawCars() {
      this.controller.getCars()
    }

    private drawButton() {
      if (this.paginationButtonList && this.paginationButtonList.length > 0) 
        this.paginationButtonList.map(button => button.destroy())

      const [prev, next] = this.controller.getButtonDisable()

      const buttonPrev = new Button(this.node, 'button', 'Prev', prev)
      buttonPrev.node.onclick = () => {
        this.controller.changePageNumber(this.state.stateData.pageNumber - 1)
        const [ prev ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = prev
      }
  
      const buttonNext = new Button(this.node, 'button', 'Next', next)
      buttonNext.node.onclick = () => {
        this.controller.changePageNumber(this.state.stateData.pageNumber + 1)
        const [ _prev, next ] = this.controller.getButtonDisable()
  
        buttonPrev.node.disabled = next
      }

      this.paginationButtonList = [buttonPrev, buttonNext]

    }

    public addToSignal() {
      this.onCreateCar.add(this.controller.createCar.bind(this.controller))
      this.onUpdateCar.add(this.controller.updateCar.bind(this.controller))
      this.onSelectCar.add(this.controller.selectCar.bind(this.controller))
      this.onSelectCar.add(this.settings.changeInputsUpdate.bind(this.settings))
      this.onRemoveCar.add(this.controller.removeCar.bind(this.controller))
      this.state.onGetCars.add(this.cars.render.bind(this.cars, this.onSelectCar, this.onRemoveCar))
      this.state.onGetCarsCount.add(this.drawButton.bind(this))
      this.state.onGetCarsCount.add(this.cars.updateTitle.bind(this.cars))
      this.settings.onInputChange.add(this.controller.inputChange.bind(this.controller))
    }
 }

export default GarageView;
