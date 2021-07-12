import {MoldProps} from '../../frontend/interfaces/MoldProps'
import {App} from '@vue/runtime-core'
import Mold from '../../frontend/Mold'


export default function createMold (props: MoldProps) {
  const mold = new Mold(props)

  return {
    install(app: App) {
      app.provide('mold', mold)
    },
  }
}
