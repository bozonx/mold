import MainInstance from './MoldInstance';

export function initSchema(config, schema) {
  return new MainInstance(config, schema);
}
