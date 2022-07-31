import AppLoader from './appLoader';
import AppState, { ICar, ISettings, IRaceData } from '../state/appState'
import { carBrand, carModal } from '../state/dataCars'
import { TrackData } from '../view/garage/garageView';
import Control from '../common/control';

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
  private animationFrames: IAnimationFrames
  // private carState: ICarState
  constructor(private state: AppState) {
    this.state = state
    this.loader = new AppLoader();
    this.animationFrames = {}
    // this.carState = {}
  }

  public async getCars() {
    const endpoint: string = '/garage';
    const dataState = this.state.dataState
    const pageNumber = dataState.pageNumber

    const data = await this.loader.get({ 
      endpoint,
      gueryParams: {
          _page: pageNumber,
          _limit: dataState.pageLimit,
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
          this.state.dataState = { 
            ...this.state.dataState,
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
    const dataState = this.state.dataState

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: dataState.pageLimit,
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
    const dataState = this.state.dataState

    const endpoint: string = '/garage' + `/${this.state.dataState.selectCar}`;

    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify(car)

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getCars()

      this.state.dataState = {
        ...dataState,
        selectCar: ''
      }
    }
  }

//TODO remove from winners
  public async removeCar(car: ICar) {
    const dataState = this.state.dataState

    const endpoint: string = '/garage' + `/${car.id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} }
    )

    if(result) {
      this.getCars()
    }
  }

  public async startEngine(trackData: TrackData) {
    const [ id ]= Object.keys(trackData)
    const [ track ]= Object.values(trackData)
    // const isDriving = this.carState[+id]

    const endpoint: string = '/engine';
    const headers = {'Content-Type': 'application/json'}
    const result = await this.loader.patch(
      { endpoint, gueryParams: 
        {
        id: id,
        status: StatusEngine.start
        }
      },
      headers
    ) as IRaceData

    if (result)  {
      this.countAnimationTime(result, +id, ...track)
      this.toDriveMode(+id)
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
      ) as IRaceData
  
      if (result)  {  
        this.stopAnimation(+id)
      }  
    }

    const [ car ] = track
    this.resetCarPosition(+id, car)
  }


  private countAnimationTime(data: IRaceData, id: number, car: Control, length: number) {
    const timeMoving = Math.round(data.distance / data.velocity)
    const distance = ((length - car.node.clientWidth) * 100) / length

    this.animateCar(timeMoving, distance, car, id)
  }

  private animateCar(timeMoving: number, distance: number, car: Control, id: number) {
    this.state.carState = {
      ...this.state.carState,
      [id]: true
    }

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

  private async toDriveMode(id: number) {
    const endpoint: string = '/engine';

    const result = await this.loader.patch(
      { endpoint, gueryParams: 
        {
        id: id,
        status: StatusEngine.drive
        }
      })

    if(result === 'stop') {
      this.stopAnimation(id)
    }
  }

  private stopAnimation(id: number) {
    this.state.carState = {
      ...this.state.carState,
      [id]: false
    }
    window.cancelAnimationFrame(this.animationFrames[id])
  }

  private resetCarPosition(id: number, car: Control) {
    car.node.style.left = "0%"
    delete this.state.carState[id]
  }

  public selectCar(car: ICar) {
    const dataState = this.state.dataState

    this.state.dataState = {
      ...dataState,
      selectCar: car.id
    }
  }

  public getSelectedCar() {
    return this.state.dataState.selectCar
  }
 
  public inputChange(input: Omit<ISettings, 'create' | 'update'>) {
    const dataState = this.state.dataState

    const [ key ] = Object.keys(input) as Array<keyof ISettings>
    const [ value ]: Array<Record<string, string>>= Object.values(input)

    this.state.dataState = {
      ...dataState,
      settings: {
        ...dataState.settings,
        [key]: {
          ...dataState.settings[key],
          ...value
        },
      }
    }
  }

  public getButtonDisable() {
    const pageNumber = this.state.dataState.pageNumber
    const pagesCount = this.state.dataState.pagesCount
    const next = (pageNumber + 1 <= pagesCount) ? false : true
    const prev = (pageNumber - 1 >= 1) ? false : true

    return [prev, next]
  }

  public changePageNumber(pageNumber: number){
    const dataState = this.state.dataState

    this.state.dataState = {
      ...dataState,
      pageNumber: pageNumber
    }

    this.getCars()
  }
}

export default AppController;
