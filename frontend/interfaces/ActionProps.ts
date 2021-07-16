import {MoldRequest} from '../../interfaces/MoldRequest'


// This is Mold's action props
export interface ActionProps extends MoldRequest {
  // Backend where set is placed. If it isn't set it points to the default backend.
  backend?: string
  // means that this is find or get action or some custom action that works as find or get.
  isReading?: boolean
}
