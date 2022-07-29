import Control from '../../common/control';
import SVG from '../../common/svg';
import svg from '../../../assets/car.svg'
import Signal from '../../common/signal';
import { ICar } from '../../state/appState'
import Button from '../button';

class Car extends Control {

  constructor(
    parent: HTMLElement | null, 
    className: string, 
    car: ICar, 
    onSelectCar: Signal<ICar>,
    onRemoveCar: Signal<ICar>,
    onStartCar: Signal<number>,
    onStopCar: Signal<number>,
    ) {
    super(parent, 'div', className);

    const buttonSelect = new Button(this.node, 'button', 'Select')
    buttonSelect.node.onclick = () => {
      onSelectCar.emit(car)
    }

    const buttonRemove = new Button(this.node, 'button', 'Remove')
    buttonRemove.node.onclick = () => {
      onRemoveCar.emit(car)
    }

    new Control(this.node, 'span', '', car.name)

    const buttonStart = new Button(this.node, 'button', 'Start')
    buttonStart.node.onclick = () => {
      onStartCar.emit(car.id)
      buttonStart.node.disabled = true
      buttonStop.node.disabled = false
    }

    const buttonStop = new Button(this.node, 'button', 'Stop', true)
    buttonStop.node.onclick = () => {
      onStopCar.emit(car.id)
      buttonStart.node.disabled = false
      buttonStop.node.disabled = true
    }

    const carImage = new Control(this.node, 'div', 'garage__image')
    carImage.node.innerHTML = this.renderImage(car.color)
  }

  renderImage (color: string) {
    return `
    <svg class="svg" viewBox="0 0 430 170" xmlns="http://www.w3.org/2000/svg" version="1.1">    
      <path stroke="black" stroke-width="2" d="m412.41424,106.12533c-1.56,-26.14 -24.58,-36.676 -44.86933,-46.82c-20.28933,-10.144 -73.352,-10.92533 -73.352,-10.92533c-0.58823,1.7647 -14.61363,-20.12935 -33.6893,-32.61468c-19.07567,-12.48533 -38.32775,-16.26532 -90.00791,-15.76532c-51.68016,0.5 -89.33345,32.77467 -113.91478,57.35466c-24.58,24.58133 -29.56,48.77066 -29.56,48.77066c0,0 -26.62533,-4.29067 -27.01467,8.41067c-0.392,12.704 17.752,12.09467 17.752,12.09467l0,6.74667c30.66667,0.328 36.16933,-14.94133 36.16933,-14.94133c0,0 -5.84564,9.01898 3.536,-5.776c9.38164,-14.79498 19.984,-25.13733 37.43733,-25.13733c19.36,0 36.5,11.98667 42.08133,29.81867c3.76533,12.03733 1.696,22.488 1.696,22.488l182.42133,0c0,0 -1.94267,-8.16133 2.29867,-24.112c4.36267,-16.39333 21.68,-27.08 39.524,-27.08c14.04667,0 26.59333,5.22 34.66667,15.50933c8.46667,10.79333 8.584,25.44133 8.584,25.44133l8.58,-0.41733l-0.77867,-5.08533c0,0 14.82533,3.50533 14.82533,-7.41867c0,-10.92533 -16.38533,-10.54133 -16.38533,-10.54133" id="path360" fill="${color}"/>
      <path stroke="black" stroke-width="2" d="m126.67183,58.448c0,0 -15.22933,1.87733 -16.88,-10.708c-0.82667,-6.29266 4.53259,-19.8229 20.59116,-26.97708c16.05856,-7.15417 37.2282,-11.75582 55.9635,-10.1913l0.58824,41.76313c-0.58823,2.94117 -0.62776,5.75215 -8.54156,5.16392c-7.9138,-0.58823 -51.72133,0.94933 -51.72133,0.94933" id="path368" fill="white"/>
      <path stroke="black" stroke-width="2" d="m218.05246,57.24533l-19.17641,-0.50933c0,0 -3.97009,0.63467 -4.29958,-5.72l-0.52485,-40.69756c13.276,-0.59135 20.98577,0.0287 30.34384,2.15913c9.35806,2.13042 20.42526,4.16666 34.77176,16.79976c14.34651,12.6331 11.72835,27.62479 0.9268,27.75279c-10.80039,0.12667 -42.04157,0.21521 -42.04157,0.21521" id="path370" fill="white"/>
      <path stroke="black" stroke-width="2" d="m133.65067,130.57467c0,20.75272 -16.7113,37.57467 -37.32597,37.57467c-20.61341,0 -37.3247,-16.82195 -37.3247,-37.57467c0,-20.75272 16.7113,-37.57467 37.3247,-37.57467c20.61466,0 37.32597,16.82195 37.32597,37.57467" id="svg_1" fill="${color}"/>
      <path stroke="black" stroke-width="2" d="m400.87025,131.07466c0,20.75272 -16.7113,37.57467 -37.32597,37.57467c-20.61341,0 -37.3247,-16.82195 -37.3247,-37.57467c0,-20.75272 16.7113,-37.57467 37.3247,-37.57467c20.61467,0 37.32597,16.82195 37.32597,37.57467" id="svg_2" fill="${color}"/>
    </svg>
    `
  }
}

export default Car;