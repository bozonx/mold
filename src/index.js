import MainInstance from './MainInstance';

export function initSchema(config, schema) {
  return new MainInstance(config, schema);
}
