import Control from '../../common/control';
import Input from '../input'
import Button from '../button'
import { ICar, ISettings } from '../../state/appState'
import Signal from '../../common/signal';


class Settings extends Control {
  private createInputList: Control<HTMLInputElement | HTMLButtonElement>[]
  private updateInputList: Control<HTMLInputElement | HTMLButtonElement>[]

  constructor(
    parent: HTMLElement | null,
    className: string,
    inputParams: ISettings,
    onCreateCar: Signal<Omit<ICar, 'id'>>,
    onUpdateCar: Signal<Omit<ICar, 'id'>>,
    selectedCar: number | string
  ){
    super(parent, 'div', className);
    const createField = new Control(this.node, 'div', 'settings__field field')
    this.createInputList = []
    this.drawInputField(
      createField.node,
      this.createInputList,
      "Create",
      inputParams.create,
      onCreateCar
    )
    const disable = selectedCar? false : true
    const updateField = new Control(this.node, 'div', 'settings__field field')
    this.updateInputList = []
    this.drawInputField(
      updateField.node,
      this.updateInputList,
      'Update',
      inputParams.update, 
      onUpdateCar,
      disable)
  }
  public onInputChange = new Signal<Omit<ISettings, 'create' | 'update'>>()

  private drawInputField(
    parent: HTMLElement,
    list: Control<HTMLInputElement | HTMLButtonElement>[],
    text: string,
    param: Record<string, string>,
    signalClick: Signal<Omit<ICar, 'id'>>,
    disable?: boolean
    ) {

    const inputName = new Input(parent, 'field__input-data', 'name', param.name, disable);
    list.push(inputName)
    inputName.node.oninput = () => {
      this.onInputChange.emit({
        [text.toLowerCase()]: {
          name: inputName.node.value
        }
      })
    }

    const inputColor = new Input(parent, 'field__input-color', 'color', param.color, disable);
    list.push(inputColor)
    inputColor.node.oninput = () => {
      this.onInputChange.emit({
        [text.toLowerCase()]: {
          color: inputColor.node.value
        }
      })
    }

    const button = new Button(parent, 'button', text, disable)
    list.push(button)
    button.node.onclick = () => {    
      signalClick.emit({name: inputName.node.value, color: inputColor.node.value})
      this.resetInputs(list, disable) 
    }
  }

  public changeInputsUpdate(car: ICar){
    this.updateInputList.map(input => input.node.disabled = false)
    const [ inputName, inputColor ] = this.updateInputList
    inputName.node.value = car.name
    inputColor.node.value = car.color

    this.onInputChange.emit({
      update: {
        name: inputName.node.value
      }
    })
    this.onInputChange.emit({
      update: {
        color: inputColor.node.value
      }
    })
  }

  private resetInputs(list: Control<HTMLInputElement | HTMLButtonElement>[], disable?: boolean): void {
    const [ inputName, inputColor ] = list
    inputName.node.value = ''
    inputColor.node.value = '#000000'
    console.log('dd')
    if (disable)
      this.updateInputList.map(input => input.node.disabled = true)
  }

}

export default Settings;
