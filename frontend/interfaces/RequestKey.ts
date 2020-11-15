export type RequestKey = [
  // backend
  string,
  // set
  string,
  // action: find, get, getFirst, actionGet.
  string,
  // request hash. This is a hash of serialized id, query and meta
  string,
];

// export default interface RequestKey {
//   backend: string;
//   set: string;
//   action: string;
//   // hash of serialized id, query and meta
//   request: string;
// }
