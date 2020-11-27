// props for high level methods like Vue composition functions
import {ActionProps} from './MethodsProps';


export type CompositionProps = Omit<Omit<ActionProps, 'action'>, 'isGetting'>;
