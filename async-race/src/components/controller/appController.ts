import Loader, { RespObject } from './loader';
import AppLoader from './appLoader';
import AppState, { ICar, ISettings, IStateData} from '../state/appState'

class AppController {
  private loader: AppLoader

  constructor(private state: AppState) {
    this.state = state
    this.loader = new AppLoader();
  }

  public async getCars() {
    const endpoint: string = '/garage';
    const stateData = this.state.stateData
    const pageNumber = stateData.pageNumber

    const data = await this.loader.get({ 
      endpoint,
      gueryParams: {
          _page: pageNumber,
          _limit: stateData.pageLimit,
      },
    }) as ICar[];

    if (AppState.checkCars(data)) {
      this.state.pageCars = {
        page: data,
        pageNumber: pageNumber
      }

      this.state.stateData = { 
        ...this.state.stateData,
        currentPage: pageNumber
      }

    }
    this.getCountCars()
  }

  public async getCountCars() {
    const endpoint: string = '/garage';
    const stateData = this.state.stateData

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: stateData.pageLimit,
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

  public async updateCar(car: Omit<ICar, 'id'>) {
    const stateData = this.state.stateData

    const endpoint: string = '/garage' + `/${this.state.stateData.selectCar}`;

    const headers = {'Content-Type': 'application/json'}
    const body = JSON.stringify(car)

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body)

    if(result) {
      this.getCars()

      this.state.stateData = {
        ...stateData,
        selectCar: ''
      }
    }
  }

  public async removeCar(car: ICar) {
    const stateData = this.state.stateData

    const endpoint: string = '/garage' + `/${car.id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} }
    )

    if(result) {
      this.getCars()
    }
  }

  public selectCar(car: ICar) {
    const stateData = this.state.stateData

    this.state.stateData = {
      ...stateData,
      selectCar: car.id
    }
  }

  public getSelectedCar() {
    return this.state.stateData.selectCar
  }
 
  public inputChange(input: Omit<ISettings, 'create' | 'update'>) {
    const stateData = this.state.stateData

    const [ key ] = Object.keys(input) as Array<keyof ISettings>
    const [ value ]: Array<Record<string, string>>= Object.values(input)

    this.state.stateData = {
      ...stateData,
      settings: {
        ...stateData.settings,
        [key]: {
          ...stateData.settings[key],
          ...value
        },
      }
    }

    console.log(this.state.stateData)

  }
}

export default AppController;
