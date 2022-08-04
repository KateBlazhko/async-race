import Signal from "../common/signal";
import { initialGarageState, initialWinnersState }from './initialState'

export interface ICar {
  name: string,
  color: string,
  id: number
}

export interface IWinner {
  wins: number,
  time: number,
  id: number
}

export interface IEngineData {
  "velocity": number,
  "distance": number
}

export interface IPageCars {
  page: ICar[],
  pageNumber: number
}

export interface IPageWinners {
  page: IWinner[],
  pageNumber: number
}

export interface IGarageState {
  settings: ISettings,
  selectCar: string | number,
  pageNumber: number,
  pageLimit: number,
  carsCount: number
  pagesCount: number
}

export interface IWinnersState {
  pageNumber: number,
  pageLimit: number,
  winnersCount: number
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

export interface IRaceState {
  race: boolean
}

class AppState {
  private _pageCars: IPageCars;
  private _carsCount: number;
  private _garageState: IGarageState
  private _carState: ICarState
  private _raceState: IRaceState
  private _winner: Record<string, string>
  private _pageWinners: IPageWinners;
  private _winnersCount: number;
  private _winnersState: IWinnersState

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

    const pagesCount = Math.ceil(this._carsCount / this.garageState.pageLimit)
    this.garageState = {
      ...this.garageState,
      carsCount: this._carsCount,
      pagesCount: pagesCount
    }
    this.onGetCarsCount.emit(this._carsCount);
  }

  get garageState() {
    return this._garageState;
  }
  set garageState(value: IGarageState) {
    this._garageState = value;
  }

  get carState() {
    return this._carState;
  }
  set carState(value: ICarState) {
    this._carState = value;
    this.onChangeCarState.emit(this._carState)
  }

  get raceState() {
    return this._raceState;
  }
  set raceState(value: IRaceState) {
    this._raceState = value;
    this.onChangeRaceState.emit(this._raceState)
  }

  get winner() {
    return this._winner;
  }
  set winner(value: Record<string, string>) {
    this._winner = value;
    // this.garageState = {
    //   ...this.garageState,
    //   winners: {
    //     ...this.garageState.winners,
    //     ...value
    //   }
    // }
    this.onShowWinner.emit(this._winner)
  }

  get pageWinners() {
    return this._pageWinners;
  }
  set pageWinners(value: IPageWinners) {
    this._pageWinners = value;

    this.onGetWinners.emit(this._pageWinners);
  }

  get winnersCount() {
    return this._winnersCount;
  }
  set winnersCount(value: number) {
    this._winnersCount = value;

    const pagesCount = Math.ceil(this._winnersCount / this.winnersState.pageLimit)
    this.winnersState = {
      ...this.winnersState,
      winnersCount: this._winnersCount,
      pagesCount: pagesCount
    }
    this.onGetWinnersCount.emit(this._winnersCount);
  }

  get winnersState() {
    return this._winnersState;
  }
  set winnersState(value: IWinnersState) {
    this._winnersState = value;
  }

  constructor() {
    this._garageState = initialGarageState
    this._winnersState = initialWinnersState
    this._carsCount = this._garageState.carsCount
    this._winnersCount = this._winnersState.winnersCount
    
    this._carState = {}
    this._raceState = {
      race: false
    }

    this._pageCars = {
      page: [],
      pageNumber: this._garageState.pageNumber
    }

    this._pageWinners = {
      page: [],
      pageNumber: this._winnersState.pageNumber
    }
    this._winner = {}
  }

  public onGetCars = new Signal<IPageCars>();
  public onGetCarsCount = new Signal<number>();
  public onChangeCarState = new Signal<ICarState>();
  public onChangeRaceState = new Signal<IRaceState>();
  public onShowWinner = new Signal<Record<string, string>>();
  public onGetWinners = new Signal<IPageWinners>();
  public onGetWinnersCount = new Signal<number>();

  public static checkCars(data: ICar[]) {

    return data.every(car => {
      if (!(typeof car.name === 'string')) throw new Error('Name is not string');
      if (!(car.color && typeof car.color === 'string')) throw new Error('Color is not string');
      if (!(car.id && typeof car.id === 'number')) throw new Error('Id is not number');
      return true
    })
  }

  public static checkWinners(data: IWinner[]) {
    return data.every(winner => {
      if (!(winner.time && typeof winner.time === 'number')) throw new Error('Time is not number');
      if (!(winner.wins && typeof winner.wins === 'number')) throw new Error('Wins is not number');
      if (!(winner.id && typeof winner.id === 'number')) throw new Error('Id is not number');
      return true
    })
  }

  public static checkRaceData(data: IEngineData) {
    if (!(data.velocity && typeof data.velocity === 'number')) throw new Error('Velocity is not number');
    if (!(data.distance && typeof data.distance === 'number')) throw new Error('Distance is not number');
    return true
  }
}

export default AppState