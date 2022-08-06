// import AppState, { ICar, ISettings, IEngineData, ICarState } from '../state/appState'
import GarState, { ICar, ISettings, IEngineData, ICarState } from '../state/garModel'

import { carBrand, carModal } from '../state/dataCars'
import { TrackData } from '../view/garage/garView';
import Control from '../common/control';
import Car from '../view/garage/car';
import AppController from './appController';

interface IAnimationFrames {
  [id: number]: number
}

enum StatusEngine {
  start = 'started',
  stop = 'stopped',
  drive = 'drive'
}

class GarController extends AppController{
  private animationFrames: IAnimationFrames;

  constructor(public model: GarState) {
    super(model)
    this.animationFrames = {}
  }

  public async getCars() {
    const endpoint: string = '/garage';
    const state = this.model.state
    const pageNumber = state.pageNumber

    const data = await this.loader.get({ 
      endpoint,
      gueryParams: {
          _page: pageNumber,
          _limit: state.pageLimit,
      },
    }) as ICar[];
    if (GarState.checkCars(data)) {
      if (data.length > 0) {
        this.model.pageCars = {
          page: data,
          pageNumber: pageNumber
        }

      } else {
        if (pageNumber - 1 > 0) {
          this.model.state = { 
            ...this.model.state,
            pageNumber: pageNumber - 1
          }
          
          this.getCars()
        }
      }
    }

    this.model.carState = {}

    this.getCountCars()
  }

  public async getCountCars() {
    const endpoint: string = '/garage';
    const garageState = this.model.state

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: garageState.pageLimit,
      },
    }, 'X-Total-Count') 

    this.model.carsCount =  Number(data) ? Number(data) : 0    
  }

  public async createCar(car: Omit<ICar, 'id'>) {
    const endpoint: string = '/garage';
    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify(car)

    const result = await this.loader.post(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getCars()
      return result
    }
  }

  public async createRandomCars() {
    const endpoint: string = '/garage';
    const headers = {'Content-Type': 'application/json'}
    const randomCars = this.getRandomsCars()

    const result = await this.loader.postAll(
      { endpoint, gueryParams: {} },
      headers,
      randomCars.map(car => JSON.stringify(car)))

    if(result) {
      this.getCars()
      return result
    }
  }

  private getRandomsCars() {
    const COUNTCARS = 100
    const MAXCOLOR = 0xFFFFFF

    return Array(COUNTCARS)
      .fill(0)
      .map(() => {
        const brandIndex = +this.getRandomNumber(carBrand.length)
        const modalIndex = +this.getRandomNumber(carModal.length)
        return {
          name: `${carBrand[brandIndex]} ${carModal[modalIndex]}`,
          color: '#' + this.getRandomNumber(Number(MAXCOLOR.toString(10)), 16),
        }
      })
  }

  private getRandomNumber(max: number, ss?: number) {
    return ss? Math.floor(Math.random()*max).toString(ss) : Math.floor(Math.random()*max)
  }
 
  public async updateCar(car: Omit<ICar, 'id'>) {
    const garageState = this.model.state

    const endpoint: string = '/garage' + `/${this.model.state.selectCar}`;

    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify(car)

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getCars()

      this.model.state = {
        ...garageState,
        selectCar: ''
      }
    }
  }

  public async startRace(carList: Car[]) {
    try {
      const [ car ] = carList
      const trackLenght = car.getTrackLength()
      this.model.isFinish = false

      const resultRace = await Promise.any(carList.map(async (car) => {

        const trackData: TrackData = {
          [car.id]: [car.image, trackLenght]
        }

        const resultCar = await this.startEngine(trackData)
        if (resultCar === undefined) throw Error ("Car is broken")
        return {
          name: car.name,
          time: (resultCar / 1000).toFixed(1),
          id: car.id
        }
      }))

      this.model.isFinish = true
      if(this.model.carState[resultRace.id]) 
        this.model.lastWinner = resultRace

    } catch (e: unknown) {
      const error = e as Error
      this.model.isFinish = true
      console.error(error.message)
    }
    
  }

  public async resetRace(carList: Car[]) {
    const [ car ] = carList
    const trackLenght = car.getTrackLength()

    carList.map((car) => {
      const trackData: TrackData = {
        [car.id]: [car.image, trackLenght]
      }
      return this.stopEngine(trackData)
    })
  }

  public async startEngine(trackData: TrackData) {
    const [ id ]= Object.keys(trackData)
    const [ track ]= Object.values(trackData)
    const endpoint: string = '/engine';
    const headers = {'Content-Type': 'application/json'}

    try {
      const result = await this.loader.patch(
        { endpoint, gueryParams: 
          {
          id: id,
          status: StatusEngine.start
          }
        },
        headers
      ) as IEngineData
        console.log('start', id)
      const timeMoving = this.countAnimationTime(result, +id, ...track)
      this.addCarState(+id, true)
      const resultCar = await this.toDriveMode(+id) 

      return resultCar ? timeMoving: undefined

    } catch (e: unknown) {
      const error = e as Error
      console.error(error.message)
    }
    
  }

  private async toDriveMode(id: number) {
    const endpoint: string = '/engine';

    try {
      const result = await this.loader.patch(
        { endpoint, gueryParams: 
          {
          id: id,
          status: StatusEngine.drive
          }
        })
  
      if (result === '500') {
        this.stopAnimation(id)
        throw Error(`Car#${id} is broken`)
      }

      if (result)
        return true
  
    } catch (e: unknown) { 
      const error = e as Error
      console.error(error.message)
    }
  }

  public async stopEngine(trackData: TrackData) {
    const [ id ]= Object.keys(trackData)
    const [ track ]= Object.values(trackData)
    const isDriving = this.model.carState[+id]
    
    if (isDriving === false) {
      const [ car ] = track
      this.resetCarPosition(+id, car)

    } else {
      const endpoint: string = '/engine';
      const headers = {'Content-Type': 'application/json'}
      const result = await this.loader.patch(
        { endpoint, gueryParams: 
          {
          id: id,
          status: StatusEngine.stop
          }
        },
        headers
      ) as IEngineData
  
      if (result)  {  
        console.log('stop', id)
        this.stopAnimation(+id)

        const [ car ] = track
        this.resetCarPosition(+id, car)
      }  
    }
    
  }


  private countAnimationTime(data: IEngineData, id: number, car: Control, length: number) {
    const MAXCARSIZE = 0.18

    const timeMoving = Math.round(data.distance / data.velocity)
    const carSize = car.node.clientWidth || (length * MAXCARSIZE)
    const distance = ((length - carSize) * 100) / length

    this.animateCar(timeMoving, distance, car, id)
    return timeMoving
  }

  private animateCar(timeMoving: number, distance: number, car: Control, id: number) {
    car.node.style.left = '0'
    const start = new Date().getTime()
    let previousTimeStamp = start
    let done = false
    
    const animate = () => {
      const timestamp = new Date().getTime()
      const timeDifference =  timestamp - start

      const offset = (distance / timeMoving) * (timestamp - previousTimeStamp)
      const left = Math.min((parseFloat(car.node.style.left) + offset), distance)
      car.node.style.left = `${left}%`;
      if (left === distance) done = true;

      if (timeDifference < timeMoving) {
        previousTimeStamp = timestamp 
        if (!done)
        this.animationFrames[id] = window.requestAnimationFrame(animate)
      }
    }
    this.animationFrames[id] = window.requestAnimationFrame(animate)
  }

  private stopAnimation(id: number) {
    window.cancelAnimationFrame(this.animationFrames[id])
    this.changeCarState(+id, false)
  }

  private resetCarPosition(id: number, car: Control) {
    car.node.style.left = "0%"

    this.delCarState(id)
  }

  public async removeCar(car: ICar) {
    const endpoint: string = '/garage' + `/${car.id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} }
    )

    if(result) {
      this.getCars()

      if (car.id in this.model.carState) {
        this.delCarState(car.id)
      }
    }
  }

  public selectCar(car: ICar) {
    const garageState = this.model.state

    this.model.state = {
      ...garageState,
      selectCar: car.id
    }
  }

  public getSelectedCar() {
    return this.model.state.selectCar
  }
 
  public inputChange(input: Omit<ISettings, 'create' | 'update'>) {
    const garageState = this.model.state

    const [ key ] = Object.keys(input) as Array<keyof ISettings>
    const [ value ]: Array<Record<string, string>>= Object.values(input)

    this.model.state = {
      ...garageState,
      settings: {
        ...garageState.settings,
        [key]: {
          ...garageState.settings[key],
          ...value
        },
      }
    }
  }

  private addCarState(id: number, isDriving: boolean) { 
      this.model.carState = {
        ...this.model.carState,
        [id]: isDriving
      }
  }

  private changeCarState(id: number, isDriving: boolean) {
    if (id in this.model.carState) {
      this.model.carState = {
        ...this.model.carState,
        [id]: isDriving
      }
    }
  }

  private delCarState(id: number) {
    const {[id]: deleted, ...carState} = this.model.carState
    this.model.carState = {...carState}
  }

}

export default GarController;
