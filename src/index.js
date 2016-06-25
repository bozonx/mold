import MainInstance from './Mold';

// TODO: переделать на export default

export function initSchema(config, schema) {
  return new MainInstance(config, schema);
}
