import Signal from "../common/signal";
import AppController from '../controller/appController';
import { initialState }from './initialState'

export interface ICar {
  name: string,
  color: string,
  id: number
}

export interface IPageCars {
  page: ICar[],
  pageNumber: number
}

export interface IStateData {
  settings: ISettings,
  selectCar: string | number,
  pageNumber: number,
  pageLimit: number,
  currentPage: number,
  carsCount: number
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

class AppState {
  private _pageCars: IPageCars;
  private _carsCount: number;
  private _stateData: IStateData

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

    this.stateData = {
      ...this.stateData,
      carsCount: this._carsCount
    }

    this.onGetCarsCount.emit(this._carsCount);
  }

  get stateData() {
    return this._stateData;
  }

  set stateData(value: IStateData) {
    this._stateData = value;

    // this.onGetCarsCount.emit(this._carsCount);
  }

  constructor() {
    this._stateData = initialState
    this._carsCount = this._stateData.carsCount

    this._pageCars = {
      page: [],
      pageNumber: this._stateData.pageNumber
    }

  }

  public onGetCars = new Signal<IPageCars>();
  public onGetCarsCount = new Signal<number>();
  // public onCreateCar =  new Signal<boolean>()

  public static checkCars(data: ICar[]) {
    return data.every(car => {
      if (!(car.name && typeof car.name === 'string')) throw new Error('Name is not string');
      if (!(car.color && typeof car.color === 'string')) throw new Error('Color is not string');
      if (!(car.id && typeof car.id === 'number')) throw new Error('Id is not number');
      return true
    })
    


  }
}

export default AppState