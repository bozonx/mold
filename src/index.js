import Main from './Main';

// TODO: лучше наоборот - сначала schema потом config, так как config не обязательный
export default function(config, schema) {
  return new Main(config, schema);
}
