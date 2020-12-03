// props for high level methods like Vue composition functions
import {ActionProps} from './ActionProps';


//export type CompositionProps = Omit<Omit<ActionProps, 'action'>, 'isReading'>;
export type CompositionProps = Omit<ActionProps, 'isReading'>;
