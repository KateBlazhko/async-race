import Signal from "../common/signal";
import AppController from '../controller/appController';
import { initialState }from './initialState'

export interface ICar {
  name: string,
  color: string,
  id: number
}

export interface IRaceData {
  "velocity": number,
  "distance": number
}

export interface IPageCars {
  page: ICar[],
  pageNumber: number
}

export interface IDataState {
  settings: ISettings,
  selectCar: string | number,
  pageNumber: number,
  pageLimit: number,
  // currentPage: number,
  carsCount: number
  pagesCount: number
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

export interface ICarState {
  [id: number]: boolean
}

class AppState {
  private _pageCars: IPageCars;
  private _carsCount: number;
  private _dataState: IDataState
  private _carState: ICarState

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

    const pagesCount = Math.ceil(this._carsCount / this.dataState.pageLimit)

    this.dataState = {
      ...this.dataState,
      carsCount: this._carsCount,
      pagesCount: pagesCount
    }

    this.onGetCarsCount.emit(this._carsCount);
  }

  get dataState() {
    return this._dataState;
  }

  set dataState(value: IDataState) {
    this._dataState = value;
  }

  get carState() {
    return this._carState;
  }

  set carState(value: ICarState) {
    this._carState = value;
    this.onChangeCarState.emit(this._carState)
  }

  constructor() {
    this._dataState = initialState
    this._carsCount = this._dataState.carsCount
    this._carState = {}

    this._pageCars = {
      page: [],
      pageNumber: this._dataState.pageNumber
    }

  }

  public onGetCars = new Signal<IPageCars>();
  public onGetCarsCount = new Signal<number>();
  public onChangeCarState = new Signal<ICarState>();


  public static checkCars(data: ICar[]) {
    return data.every(car => {
      if (!(car.name && typeof car.name === 'string')) throw new Error('Name is not string');
      if (!(car.color && typeof car.color === 'string')) throw new Error('Color is not string');
      if (!(car.id && typeof car.id === 'number')) throw new Error('Id is not number');
      return true
    })
  }

  public static checkRaceData(data: IRaceData) {
    if (!(data.velocity && typeof data.velocity === 'number')) throw new Error('Velocity is not number');
    if (!(data.distance && typeof data.distance === 'number')) throw new Error('Distance is not number');
    return true
  }
}

export default AppState