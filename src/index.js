import MainInstance from './MoldInstance';

// TODO: переделать на export default

export function initSchema(config, schema) {
  return new MainInstance(config, schema);
}
