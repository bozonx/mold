import {MoldSchema} from '../interfaces/MoldSchema';
import {MoldSeedContext} from '../interfaces/MoldSeedContext';
import {parseSchema} from '../schema/parseSchema';


export function extractSeedFromSchema(schemas: MoldSchema[]): (context: MoldSeedContext) => void {
  const schema: MoldSchema = parseSchema(schemas);

  return (context: MoldSeedContext) => {
    for (let setName of Object.keys(schema)) {
      if (!schema[setName].seed) continue;

      context.insert(setName, schema[setName].seed!);
    }
  };
}
