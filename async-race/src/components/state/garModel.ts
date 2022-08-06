import Signal from '../common/signal';
import { initialGarageState } from './initialState';

export interface ICar {
  name: string,
  color: string,
  id: number
}

export interface IEngineData {
  'velocity': number,
  'distance': number
}

export interface IPageCars {
  page: ICar[],
  pageNumber: number
}

export interface ISettings {
  create: {
    name: string,
    color: string,
  },
  update: {
    name: string,
    color: string,
  }
}

export interface IGarState {
  settings: ISettings,
  selectCar: string | number,
  pageNumber: number,
  pageLimit: number,
  carsCount: number
  pagesCount: number
}

export interface ICarState {
  [id: number]: boolean
}

class GarModel {
  private _pageCars: IPageCars;

  private _carsCount: number;

  private _state: IGarState;

  private _carState: ICarState;

  private _raceState: boolean;

  private _isFinish: boolean;

  public _lastWinner: Record<string, string | number>;

  get pageCars() {
    return this._pageCars;
  }

  set pageCars(value: IPageCars) {
    this._pageCars = value;

    this.onGetCars.emit(this._pageCars);
  }

  get carsCount() {
    return this._carsCount;
  }

  set carsCount(value: number) {
    this._carsCount = value;

    const pagesCount = Math.ceil(this._carsCount / this.state.pageLimit);
    this.state = {
      ...this.state,
      carsCount: this._carsCount,
      pagesCount,
    };
    this.onGetCarsCount.emit(this._carsCount);
  }

  get state() {
    return this._state;
  }

  set state(value: IGarState) {
    this._state = value;
  }

  get carState() {
    return this._carState;
  }

  set carState(value: ICarState) {
    const lastLength = Object.keys(this.carState).length;
    this._carState = value;

    if (Object.keys(this.carState).length !== lastLength) {
      this.checkRaceState();
      this.onChangeCarState.emit(this._carState);
    }
  }

  get raceState() {
    return this._raceState;
  }

  set raceState(value: boolean) {
    if (this.raceState !== value) {
      this._raceState = value;
      this.onChangeRaceState.emit(value);
    }
  }

  get lastWinner() {
    return this._lastWinner;
  }

  set lastWinner(value: Record<string, string | number>) {
    this._lastWinner = value;
    this.onShowWinner.emit(this.lastWinner);
  }

  get isFinish() {
    return this._isFinish;
  }

  set isFinish(value: boolean) {
    this._isFinish = value;
    if (this.isFinish) { this.checkRaceState(); }
  }

  constructor() {
    // super()
    this._state = initialGarageState;
    this._carsCount = this._state.carsCount;
    this._lastWinner = {};

    this._carState = {};
    this._raceState = false;
    this._isFinish = false;
    this._pageCars = {
      page: [],
      pageNumber: this._state.pageNumber,
    };
  }

  public onGetCars = new Signal<IPageCars>();

  public onGetCarsCount = new Signal<number>();

  public onChangeCarState = new Signal<ICarState>();

  public onChangeRaceState = new Signal<boolean>();

  public onShowWinner = new Signal<Record<string, string | number>>();

  public onRemoveCar = new Signal<number>();

  private checkRaceState() {
    if (Object.keys(this.carState).length > 0) {
      this.raceState = true;
      return;
    }
    if (Object.keys(this.carState).length === 0) {
      if (this.isFinish) this.raceState = false;
    }
  }

  public static checkCars(data: ICar[]) {
    return data.every((car) => {
      if (!(typeof car.name === 'string')) throw new Error('Name is not string');
      if (!(car.color && typeof car.color === 'string')) throw new Error('Color is not string');
      if (!(car.id && typeof car.id === 'number')) throw new Error('Id is not number');
      return true;
    });
  }

  public static checkRaceData(data: IEngineData) {
    if (!(data.velocity && typeof data.velocity === 'number')) throw new Error('Velocity is not number');
    if (!(data.distance && typeof data.distance === 'number')) throw new Error('Distance is not number');
    return true;
  }
}

export default GarModel;
