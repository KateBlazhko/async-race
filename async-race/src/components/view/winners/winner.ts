import Control from '../../common/control';
import SVG from '../../common/svgElement';
// import svg from '../../../assets/sprite.svg';
import Signal from '../../common/signal';
import { IWinner } from '../../state/appState'
import Button from '../button';

// enum ButtonText {
//   select = "Select",
//   remove = "Remove",
//   start = "Start",
//   stop = "Stop",
// }

class Car extends Control {
  private _time: Readonly<number>
  private _id: Readonly<number>
  private _wins: Readonly<number>

  get id() {
    return this._id
  }
  get wins() {
    return this._wins
  }
  get time() {
    return this._time
  }
  
  constructor(
    public parent: HTMLElement | null, 
    public className: string, 
    private winner: IWinner, 
    private onSortByWins: Signal<IWinner>,
    private onSortByTimes: Signal<IWinner>,
  ){
    super(parent, 'div', className);

    this.winner = winner
    this._id = this.winner.id
    this._wins = this.winner.wins
    this._time = this.winner.time

    this.onSortByWins = onSortByWins
    this.onSortByTimes = onSortByTimes

    
  }
}

export default Car;