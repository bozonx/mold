import {Logger, LogLevel} from '../../interfaces/Logger'
import {MoldFrontendConfig} from './MoldFrontendConfig'
import {BackendClient} from '../../interfaces/BackendClient'
import {StorageAdapter} from './StorageAdapter'


export interface MoldProps {
  // is app in production mode.
  // In not production mode the window.$mold variable will be set for debug purpose.
  //production?: boolean
  config: Partial<MoldFrontendConfig>
  // fill almost one backend. Name of backend is used in any request.
  // "default" backend doesn't have to be specified in request.
  backends: {[index: string]: BackendClient}
  // Set your own storage or default will be used
  storage: StorageAdapter
  // set your logger of use default ConsoleLogger with specified logLevel
  log: Logger | LogLevel
}
