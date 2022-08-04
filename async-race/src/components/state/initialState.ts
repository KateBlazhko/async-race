import { IGarageState, IWinnersState }from './appState'

export const initialGarageState: IGarageState = {
  settings: {
    create: {
      name: '',
      color: '#000000',
    },
    update: {
      name: '',
      color: '#000000',
    },
  },
  selectCar: '',
  pageNumber: 1,
  pageLimit: 7,
  carsCount: 0,
  pagesCount: 1,
}

export const initialWinnersState: IWinnersState = {
  pageNumber: 1,
  pageLimit: 10,
  winnersCount: 0,
  pagesCount: 1,
}