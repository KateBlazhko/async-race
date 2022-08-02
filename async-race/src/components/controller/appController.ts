import AppLoader from './appLoader';
import AppState, { ICar, ISettings, IEngineData, ICarState } from '../state/appState'
import { carBrand, carModal } from '../state/dataCars'
import { TrackData } from '../view/garage/garageView';
import Control from '../common/control';
import Car from '../view/garage/car';

interface IAnimationFrames {
  [id: number]: number
}

enum StatusEngine {
  start = 'started',
  stop = 'stopped',
  drive = 'drive'
}

class AppController {
  private loader: AppLoader
  private animationFrames: IAnimationFrames;
  private _carState: ICarState

  set carState(value: ICarState) {
    this._carState = value
    this.checkRaceState()
  }
  get carState() {
    return this._carState
  }

  constructor(private state: AppState) {
    this.state = state
    this.loader = new AppLoader();
    this.animationFrames = {}
    this._carState = this.state.carState
  }

  public async getCars() {
    const endpoint: string = '/garage';
    const garageState = this.state.garageState
    const pageNumber = garageState.pageNumber

    const data = await this.loader.get({ 
      endpoint,
      gueryParams: {
          _page: pageNumber,
          _limit: garageState.pageLimit,
      },
    }) as ICar[];

    if (AppState.checkCars(data)) {
      if (data.length > 0) {
        this.state.pageCars = {
          page: data,
          pageNumber: pageNumber
        }

      } else {
        if (pageNumber - 1 > 0) {
          this.state.garageState = { 
            ...this.state.garageState,
            pageNumber: pageNumber - 1
          }
          
          this.getCars()
        }
      }
    }

    this.getCountCars()
  }

  public async getCountCars() {
    const endpoint: string = '/garage';
    const garageState = this.state.garageState

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: garageState.pageLimit,
      },
    }, 'X-Total-Count') 

    this.state.carsCount =  Number(data) ? Number(data) : 0    
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
    const garageState = this.state.garageState

    const endpoint: string = '/garage' + `/${this.state.garageState.selectCar}`;

    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify(car)

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getCars()

      this.state.garageState = {
        ...garageState,
        selectCar: ''
      }
    }
  }

  public async startRace(carList: Car[]) {

    const [ car ] = carList
    const trackLenght = car.getTrackLength()
    
    this.state.winner = await Promise.any(carList.map(async (car) => {
      const trackData: TrackData = {
        [car.id]: [car.image, trackLenght]
      }
      const resultCar = await this.startEngine(trackData)
      if (resultCar === undefined) throw Error ("Car is broken")
      return {[car.name]: (resultCar / 1000).toFixed(1)}
    }))
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
  

      const timeMoving = this.countAnimationTime(result, +id, ...track)
      return await this.toDriveMode(timeMoving, +id) 

    } catch (e: unknown) {
      const error = e as Error
      console.error(error.message)
    }
    
  }

  private async toDriveMode(timeMoving: number, id: number) {
    const endpoint: string = '/engine';

    try {
      const result = await this.loader.patch(
        { endpoint, gueryParams: 
          {
          id: id,
          status: StatusEngine.drive
          }
        })
  
      if (result === 'stop') {
        this.stopAnimation(id)
        throw Error(`Car#${id} is broken`)
      }

      return timeMoving
  
    } catch (e: unknown) { 
      const error = e as Error
      console.error(error.message)
    }
  }

  public async stopEngine(trackData: TrackData) {
    const [ id ]= Object.keys(trackData)
    const [ track ]= Object.values(trackData)
    const isDriving = this.state.carState[+id]

    if (isDriving) {
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
        this.stopAnimation(+id)
      }  
    }
    const [ car ] = track
    this.resetCarPosition(+id, car)
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
    this.addCarState(id, true)

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
    // this.addCarState(id, false)
    window.cancelAnimationFrame(this.animationFrames[id])
  }

  private resetCarPosition(id: number, car: Control) {
    car.node.style.left = "0%"
    this.addCarState(id, false)

    delete this.state.carState[id]

    this.carState = this.state.carState
  }

  public async removeCar(car: ICar) {
    const garageState = this.state.garageState

    const endpoint: string = '/garage' + `/${car.id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} }
    )

    if(result) {
      this.getCars()
    }
  }

  public selectCar(car: ICar) {
    const garageState = this.state.garageState

    this.state.garageState = {
      ...garageState,
      selectCar: car.id
    }
  }

  public getSelectedCar() {
    return this.state.garageState.selectCar
  }
 
  public inputChange(input: Omit<ISettings, 'create' | 'update'>) {
    const garageState = this.state.garageState

    const [ key ] = Object.keys(input) as Array<keyof ISettings>
    const [ value ]: Array<Record<string, string>>= Object.values(input)

    this.state.garageState = {
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

  public getButtonDisable() {
    const pageNumber = this.state.garageState.pageNumber
    const pagesCount = this.state.garageState.pagesCount
    const next = (pageNumber + 1 <= pagesCount) ? false : true
    const prev = (pageNumber - 1 >= 1) ? false : true

    return [prev, next]
  }

  public changePageNumber(pageNumber: number){
    const garageState = this.state.garageState

    this.state.garageState = {
      ...garageState,
      pageNumber: pageNumber
    }

    this.getCars()
  }

  private addCarState(id: number, isDriving: boolean) {
    this.state.carState = {
      ...this.state.carState,
      [id]: isDriving
    }

    this.carState = this.state.carState
  }

  private checkRaceState() {
    const maxCars = this.state.garageState.pageLimit

    if (Object.keys(this.carState).length > 0) {
      this.state.raceState = {
        race: true
      }
    }
    if (Object.keys(this.carState).length === 0) {
      this.state.raceState = {
        race: false
      }
    }
  }
 }

export default AppController;
