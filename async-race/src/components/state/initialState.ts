import { IStateData }from './appState'

export const initialState: IStateData = {
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
  currentPage: 1,
  carsCount: 0
}