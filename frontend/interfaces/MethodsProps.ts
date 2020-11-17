import {JsonTypes} from '../../interfaces/Types';
import {RequestBase} from '../../interfaces/RequestBase';


// This is Mold's action props
export interface ActionProps extends RequestBase {
  // Backend where set is placed. If it isn't set it points to the default backend.
  backend?: string;
  // name of entity which is queried. It is mandatory
  set: string;
  // means that this is find or get action or some custom action that works as find or get.
  isGetting?: boolean;
}

// props for high level methods like Vue composition functions
export type HighLevelProps = Omit<Omit<ActionProps, 'action'>, 'isGetting'>;

// export interface FindBase {
//   // Page number. The first is 1. By default is 1. Don't use it if perPage = -1.
//   pageNum?: number,
//   // Items per page. By default this is config.defaultPerPage. -1 means infinity list.
//   perPage?: number,
// }

////////////// METHODS

// export type FindMethodProps = ActionPropsBase & FindBase;
//
// export interface GetMethodProps extends ActionPropsBase {
//   //id?: string | number,
// }

// export interface SaveMethodProps extends ActionPropsBase {
//   // data to save. Id doesn't matter, it should be set into query
//   data: {[index: string]: JsonTypes};
// }
//
// export type CreateMethodProps = SaveMethodProps;
//
// export interface PatchMethodProps extends ActionPropsBase {
//   //id: string | number,
//   // You cat pass an id in a request top or inside data
// }
//
// export interface DeleteMethodProps extends ActionPropsBase {
//   id: string | number,
// }
//
// export interface BatchPatchMethodProps extends ActionPropsBase {
//   // Partial data of items to patch. Items have to include an id
//   data: {[index: string]: JsonTypes}[];
// }
//
// export interface BatchDeleteMethodProps extends ActionPropsBase {
//   // Ids of items to delete
//   data: (string | number)[];
// }
