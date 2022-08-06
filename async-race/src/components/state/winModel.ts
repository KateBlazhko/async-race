import Signal from "../common/signal";
// import AppModel from "./appModel";
import { initialWinnersState }from './initialState'

export interface IWinner {
  wins: number,
  time: number,
  id: number,
  name?: string,
  color?: string
}

export interface IPageWinners {
  page: IWinner[],
  pageNumber: number
}

export interface IWinState {
  pageNumber: number,
  pageLimit: number,
  winCount: number
  pagesCount: number
}

class WinModel {
  private _pageWinners: IPageWinners;
  private _winCount: number;
  private _state: IWinState

  get pageWinners() {
    return this._pageWinners;
  }
  set pageWinners(value: IPageWinners) {
    this._pageWinners = value;

    this.onGetWinners.emit(this._pageWinners);
  }

  get winCount() {
    return this._winCount;
  }
  set winCount(value: number) {
    this._winCount = value;

    const pagesCount = Math.ceil(this._winCount / this.state.pageLimit)
    this.state = {
      ...this.state,
      winCount: this._winCount,
      pagesCount: pagesCount
    }
    this.onGetWinCount.emit(this._winCount);
  }

  get state() {
    return this._state;
  }
  set state(value: IWinState) {
    this._state = value;
  }

  constructor() {
    // super()
    this._state = initialWinnersState
    this._winCount = this._state.winCount
  
    this._pageWinners = {
      page: [],
      pageNumber: this._state.pageNumber
    }
  }

  public onGetWinners = new Signal<IPageWinners>();
  public onGetWinCount = new Signal<number>();

  public static checkWinners(data: IWinner[]) {
    return data.every(winner => {
      if (!(winner.time && typeof winner.time === 'number')) throw new Error('Time is not number');
      if (!(winner.wins && typeof winner.wins === 'number')) throw new Error('Wins is not number');
      if (!(winner.id && typeof winner.id === 'number')) throw new Error('Id is not number');
      return true
    })
  }
}

export default WinModel