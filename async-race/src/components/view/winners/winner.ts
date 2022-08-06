import Control from '../../common/control';
import SVG from '../../common/svgElement';
import svg from '../../../assets/sprite.svg';
import Signal from '../../common/signal';
import { IWinner } from '../../state/winModel'
import Button from '../button';


class Car extends Control {
  
  constructor(
    public parent: HTMLElement | null, 
    public className: string, 
    private number: number,
    private winner: IWinner, 
    private onSortByWins: Signal<IWinner>,
    private onSortByTimes: Signal<IWinner>,
  ){
    super(parent, 'div', className);

    this.winner = winner
    this.number = number

    this.onSortByWins = onSortByWins
    this.onSortByTimes = onSortByTimes
    this.render()
  }
  render () {
    const tableCells:(keyof typeof this.winner)[] = ['id', 'color', 'name', 'wins', 'time']
    tableCells.map(cell => {
      if (cell === 'color' && this.winner.color) {
        const svgWrap = new Control(this.node, 'div', 'winners__cell')
        const car = new SVG(svgWrap.node, 'svg_car', svg + '#car')
        car.setColor(this.winner.color)
        return car
      } 
      if (cell === 'id') {
        return new Control(this.node, 'span', 'winners__cell', this.number.toString())
      }

      return new Control(this.node, 'span', 'winners__cell', this.winner[cell]?.toString())

    })

  }

}

export default Car;