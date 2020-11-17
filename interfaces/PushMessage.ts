export default interface PushMessage {
  set: string;
  // if set and itemId doesn't set it means do all the requests of specified action
  action?: string;
  // If set and action doesn't set it means find items with specified id in
  // all the requests all the actions of this set. And do new requests on of those
  // which contain specified item id.
  // If action and itemId are set it means find only at specified action.
  itemId?: number | string;
}
