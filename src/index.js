import Main from './Main';

// TODO: переделать на export default

export function initSchema(config, schema) {
  return new Main(config, schema);
}
