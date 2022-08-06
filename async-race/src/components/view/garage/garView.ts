import Control from '../../common/control';
import Settings from './settings';
import Signal from '../../common/signal';
import Button from '../button';
import Car from './car';
import Notification from '../notification';
import Pagination from '../pagination';
import GarageController from '../../controller/garController';
import GarModel, { ICar, ICarState, IPageCars } from '../../state/garModel';

export type TrackData = {
  [id: number]: [Control, number]
}

enum InnerText {
  title = 'Garage 0',
  subtitle = '#1',
  prevButton = 'Prev',
  nextButton = 'Next',
}

class GarView extends Control {
  private model: GarModel;

  private controller: GarageController;

  private settings: Settings;

  private cars: Control;

  private pagination: Pagination;

  private list: Car[];

  private title: Control;

  private subtitle: Control;

  constructor(
    parent: HTMLElement | null,
    className: string,
    model: GarModel,
    controller: GarageController,
  ) {
    super(parent, 'div', className);
    this.model = model;

    this.controller = controller;

    const titleWrap = new Control(this.node, 'div', 'title-wrap');
    this.title = new Control(titleWrap.node, 'h2', 'title title_h2', InnerText.title);
    this.subtitle = new Control(titleWrap.node, 'h3', 'title title_h3', InnerText.subtitle);

    const selectedCar = this.controller.getSelectedCar();
    this.settings = new Settings(
      this.node,
      'garage__settings settings',
      this.model.state.settings,
      this.onCreateCar,
      this.onUpdateCar,
      selectedCar,
    );

    this.list = [];

    this.cars = new Control(this.node, 'div', 'garage__list');

    this.pagination = new Pagination(this.node, 'pagination');

    this.init();
  }

  public onSelectCar = new Signal<ICar>();

  public onRemoveCar = new Signal<ICar>();

  public onCreateCar = new Signal<Omit<ICar, 'id'>>();

  public onUpdateCar = new Signal<Omit<ICar, 'id'>>();

  public onStartCar = new Signal<TrackData>();

  public onStopCar = new Signal<TrackData>();

  private init() {
    this.initSettings();

    this.addToSignal();

    this.getCars();
  }

  private initSettings() {
    this.settings.onGenerateCars = () => {
      this.controller.createRandomCars();
    };

    this.settings.onRace = () => {
      this.controller.startRace(this.list);
    };

    this.settings.onReset = () => {
      this.controller.resetRace(this.list);
    };
  }

  private initPagination() {
    const initialSate = this.controller.getButtonDisable();

    this.pagination.render(initialSate);

    this.pagination.onPrev = (button: Button) => {
      this.controller.changePageNumber(this.model.state.pageNumber - 1);
      this.getCars();
      const [prev] = this.controller.getButtonDisable();

      button.node.disabled = prev;
    };

    this.pagination.onNext = (button: Button) => {
      this.controller.changePageNumber(this.model.state.pageNumber + 1);
      this.getCars();
      const [_prev, next] = this.controller.getButtonDisable();

      button.node.disabled = next;
    };
  }

  private getCars() {
    this.controller.getCars();
  }

  public renderCars(cars: IPageCars) {
    this.updateSubtitle(cars.pageNumber);

    if (this.list.length > 0) this.list.map((car) => car.destroy());

    this.list = cars.page.map((car) => new Car(
      this.cars.node,
      'garage__car',
      car,
      this.onSelectCar,
      this.onRemoveCar,
      this.onStartCar,
      this.onStopCar,
    ));
  }

  private updateTitle(carsCount: number) {
    this.title.node.textContent = `Garage ${carsCount}`;
  }

  private updateSubtitle(ageNumber: number) {
    this.subtitle.node.textContent = `#${ageNumber}`;
  }

  private updateButtonEngine(carState: ICarState) {
    const id = Object.keys(carState);
    this.list.forEach((car) => {
      if (id.includes(car.id.toString())) {
        car.updateButtonEngine(true);
      } else {
        car.updateButtonEngine(false);
      }
    });
  }

  private static renderNotification(winner: Record<string, string | number>) {
    const { name, time } = winner;
    const text = new Notification(document.body, 'notification', `${name} is winner!!! (${time}s)`);
  }

  private addToSignal() {
    if (this.settings && this.cars) {
      this.onCreateCar.add(this.controller.createCar.bind(this.controller));
      this.onUpdateCar.add(this.controller.updateCar.bind(this.controller));
      this.onSelectCar.add(this.controller.selectCar.bind(this.controller));
      this.onSelectCar.add(this.settings.changeInputsUpdate.bind(this.settings));
      this.onRemoveCar.add(this.controller.removeCar.bind(this.controller));

      this.onStartCar.add(this.controller.startEngine.bind(this.controller));
      this.onStopCar.add(this.controller.stopEngine.bind(this.controller));

      this.model.onGetCars.add(this.renderCars.bind(this));
      this.model.onGetCarsCount.add(this.initPagination.bind(this));
      this.model.onGetCarsCount.add(this.updateTitle.bind(this));
      this.model.onChangeCarState.add(this.updateButtonEngine.bind(this));
      this.model.onChangeRaceState.add(this.settings.updateButtons.bind(this.settings));
      this.model.onShowWinner.add(GarView.renderNotification.bind(this));

      this.settings.onInputChange.add(this.controller.inputChange.bind(this.controller));
    }
  }
}

export default GarView;
