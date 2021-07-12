import {MoldProps} from '../../frontend/interfaces/MoldProps'
import {App} from '@vue/runtime-core'
import Mold from '../../frontend/Mold'


export default function createMold (props: MoldProps) {
  const mold = new Mold(props)

  return {
    install(app: App) {

      console.log(111, app, mold)

      app.provide('mold', mold)
    },
  }
}
