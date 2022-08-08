import GarState, {
  ICar, ISettings, IEngineData,
} from '../state/garModel';

import { carBrand, carModal } from '../state/dataCars';
import { TrackData } from '../view/garage/garView';
import Control from '../common/control';
import Car from '../view/garage/car';
import AppController from './appController';

interface IAnimationFrames {
  [id: number]: number
}

type Success = {
  'success': true
}

enum StatusEngine {
  start = 'started',
  stop = 'stopped',
  drive = 'drive'
}

class GarController extends AppController {
  private animationFrames: IAnimationFrames = {};

  public abortController: AbortController | null = null;

  constructor(public model: GarState) {
    super(model);
  }

  public async getCars() {
    const endpoint: string = '/garage';
    const { state } = this.model;
    const { pageNumber } = state;

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
          pageNumber,
        };
      } else if (pageNumber - 1 > 0) {
        this.model.state = {
          ...this.model.state,
          pageNumber: pageNumber - 1,
        };

        this.getCars();
      }
    }

    this.model.carState = {};

    this.getCountCars();
  }

  public async getCountCars() {
    const endpoint: string = '/garage';
    const garageState = this.model.state;

    const data = await this.loader.getHeaderValue({
      endpoint,
      gueryParams: {
        _limit: garageState.pageLimit,
      },
    }, 'X-Total-Count');

    this.model.carsCount = Number(data) ? Number(data) : 0;
  }

  public async createCar(car: Omit<ICar, 'id'>) {
    const endpoint: string = '/garage';
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(car);

    const result = await this.loader.post(
      { endpoint, gueryParams: {} },
      headers,
      body,
    );

    if (result) {
      this.getCars();
      return result;
    }

    return false;
  }

  public async createRandomCars() {
    const endpoint: string = '/garage';
    const headers = { 'Content-Type': 'application/json' };
    const randomCars = GarController.getRandomsCars();

    const result = await this.loader.postAll(
      { endpoint, gueryParams: {} },
      headers,
      randomCars.map((car) => JSON.stringify(car)),
    );

    if (result) {
      this.getCars();
      return result;
    }

    return false;
  }

  private static getRandomsCars() {
    const COUNTCARS = 100;
    const MAXCOLOR = 0xFFFFFF;

    return Array(COUNTCARS)
      .fill(0)
      .map(() => {
        const brandIndex = Number(GarController.getRandomNumber(carBrand.length));
        const modalIndex = Number(GarController.getRandomNumber(carModal.length));
        return {
          name: `${carBrand[brandIndex]} ${carModal[modalIndex]}`,
          color: `#${GarController.getRandomNumber(Number(MAXCOLOR.toString(10)), 16)}`,
        };
      });
  }

  private static getRandomNumber(max: number, ss?: number) {
    return ss ? Math.floor(Math.random() * max).toString(ss) : Math.floor(Math.random() * max);
  }

  public async updateCar(car: Omit<ICar, 'id'>) {
    const garageState = this.model.state;

    const endpoint: string = `/garage/${this.model.state.selectCar}`;

    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify(car);

    const result = await this.loader.put(
      { endpoint, gueryParams: {} },
      headers,
      body,
    );

    if (result) {
      this.getCars();

      this.model.state = {
        ...garageState,
        selectCar: '',
      };
    }

    return false;
  }

  public async startRace(carList: Car[]) {
    try {
      const [firstCar] = carList;
      const trackLenght = firstCar.getTrackLength();
      this.model.isFinish = false;

      const resultStart = await Promise.all(
        carList.map(async (car): Promise<[IEngineData, TrackData, string]> => {
          const trackData: TrackData = {
            [car.id]: [car.image, trackLenght],
          };
          const result = await this.startEngine(car.id);
          if (!result) throw new Error('Bad start');
          return [result, trackData, car.name];
        }),
      );

      const resultRace = await this.driveRace(resultStart);
      this.model.lastWinner = resultRace;
    } catch {
      console.error('Race is stopped');
    } finally {
      this.model.isFinish = true;
    }
  }

  private async driveRace(resultStart: [IEngineData, TrackData, string][]) {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const resultRace = await Promise.any(resultStart.map(async (race) => {
      const [engineData, trackData, name] = race;
      const [[id, track]] = Object.entries(trackData);

      const timeMoving = this.countAnimationTime(engineData, +id, ...track);
      const resultCar = await this.toDriveMode(+id, signal);

      if (resultCar === false) throw Error;
      return {
        name,
        time: (timeMoving / 1000).toFixed(1),
        id,
      };
    }));

    return resultRace;
  }

  public async resetRace(carList: Car[]) {
    const [firstCar] = carList;
    const trackLenght = firstCar.getTrackLength();

    await Promise.all(carList.map(async (car) => {
      const trackData: TrackData = {
        [car.id]: [car.image, trackLenght],
      };
      const result = await this.stopEngine(trackData);
      if (!result) throw new Error('Bad finish');
      return true;
    }));

    return true;
  }

  public async startSingleRace(trackData: TrackData) {
    try {
      const [id] = Object.keys(trackData);
      const [track] = Object.values(trackData);

      const resultStart = await this.startEngine(Number(id));

      if (resultStart) {
        const timeMoving = this.countAnimationTime(resultStart, +id, ...track);

        this.abortController = new AbortController();
        const { signal } = this.abortController;
        const resultCar = await this.toDriveMode(+id, signal);

        return resultCar === true ? timeMoving : false;
      }

      return false;
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return false;
    }
  }

  public async startEngine(id: number) {
    const endpoint: string = '/engine';
    const headers = { 'Content-Type': 'application/json' };

    try {
      const result = await this.loader.patch(
        {
          endpoint,
          gueryParams:
          {
            id,
            status: StatusEngine.start,
          },
        },
        headers,
      ) as IEngineData;

      return result;
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return false;
    }
  }

  private async toDriveMode(id: number, signal: AbortSignal) {
    const endpoint: string = '/engine';
    try {
      this.addCarState(id, true);
      const result = await this.loader.patch(
        {
          endpoint,
          gueryParams:
          {
            id,
            status: StatusEngine.drive,
          },
        },
        {},
        '',
        signal,
      ) as Success | '500';

      if (result === '500') {
        throw Error(`Car#${id} is broken`);
      }

      if (result) return true;

      throw new Error('Car is stopped');
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      this.stopAnimation(id);
      return false;
    }
  }

  public async stopEngine(trackData: TrackData) {
    const [id] = Object.keys(trackData);
    const [track] = Object.values(trackData);
    const isDriving = this.model.carState[+id];

    if (isDriving === false) {
      const [car] = track;
      this.resetCarPosition(+id, car);
      return true;
    }

    try {
      const endpoint: string = '/engine';
      const headers = { 'Content-Type': 'application/json' };
      this.abortController?.abort();

      const result = await this.loader.patch(
        {
          endpoint,
          gueryParams:
          {
            id,
            status: StatusEngine.stop,
          },
        },
        headers,
      ) as IEngineData;

      this.stopAnimation(+id);
      const [car] = track;
      this.resetCarPosition(+id, car);
      return result;
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return false;
    }
  }

  private countAnimationTime(data: IEngineData, id: number, car: Control, length: number) {
    const MAXCARSIZE = 0.18;

    const timeMoving = Math.round(data.distance / data.velocity);
    const carSize = car.node.clientWidth || (length * MAXCARSIZE);
    const distance = ((length - carSize) * 100) / length;

    this.animateCar(timeMoving, distance, car, id);
    return timeMoving;
  }

  private animateCar(timeMoving: number, distance: number, car: Control, id: number) {
    car.node.style.left = '0';
    const start = new Date().getTime();
    let previousTimeStamp = start;
    let done = false;

    const animate = () => {
      const timestamp = new Date().getTime();
      const timeDifference = timestamp - start;

      const offset = (distance / timeMoving) * (timestamp - previousTimeStamp);
      const left = Math.min((parseFloat(car.node.style.left) + offset), distance);
      car.node.style.left = `${left}%`;
      if (left === distance) done = true;

      if (timeDifference < timeMoving) {
        previousTimeStamp = timestamp;
        if (!done) this.animationFrames[id] = window.requestAnimationFrame(animate);
      }
    };
    this.animationFrames[id] = window.requestAnimationFrame(animate);
  }

  private stopAnimation(id: number) {
    window.cancelAnimationFrame(this.animationFrames[id]);
    this.changeCarState(+id, false);
  }

  private resetCarPosition(id: number, car: Control) {
    car.node.style.left = '0%';

    setTimeout(() => {
      this.delCarState(id);
    }, 300);
  }

  public async removeCar(car: ICar) {
    const endpoint: string = `/garage/${car.id}`;

    const result = await this.loader.delete(
      { endpoint, gueryParams: {} },
    );

    if (result) {
      this.model.onRemoveCar.emit(car.id);

      this.getCars();
    }
  }

  public selectCar(car: ICar) {
    const garageState = this.model.state;

    this.model.state = {
      ...garageState,
      selectCar: car.id,
    };
  }

  public getSelectedCar() {
    return this.model.state.selectCar;
  }

  public inputChange(input: Omit<ISettings, 'create' | 'update'>) {
    const garageState = this.model.state;

    const [key] = Object.keys(input) as Array<keyof ISettings>;
    const [value]: Array<Record<string, string>> = Object.values(input);

    this.model.state = {
      ...garageState,
      settings: {
        ...garageState.settings,
        [key]: {
          ...garageState.settings[key],
          ...value,
        },
      },
    };
  }

  private addCarState(id: number, isDriving: boolean) {
    this.model.carState = {
      ...this.model.carState,
      [id]: isDriving,
    };
  }

  private changeCarState(id: number, isDriving: boolean) {
    if (id in this.model.carState) {
      this.model.carState = {
        ...this.model.carState,
        [id]: isDriving,
      };
    }
  }

  private delCarState(id: number) {
    const { [id]: deleted, ...carState } = this.model.carState;
    this.model.carState = { ...carState };
  }
}

export default GarController;
