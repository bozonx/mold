import {MoldProps} from '../../frontend/interfaces/MoldProps'
import {App} from '@vue/runtime-core'
import Mold from '../../frontend/Mold'
import {VUE_CONTEXT_NAME} from './constants'


export default function createMold (props: MoldProps) {
  const mold = new Mold(props)

  return {
    install(app: App) {
      app.provide(VUE_CONTEXT_NAME, mold)
    },
  }
}
