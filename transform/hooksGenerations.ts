import {SetsDefinition} from './interfaces/MoldHook';
import {MoldSchema} from '../interfaces/MoldSchema';
import {concatUniqStrArrays} from '../helpers/arrays';


export function addSchemaHooks(schema: MoldSchema, transforms: SetsDefinition): SetsDefinition {
  return mergeTransforms(makeSchemaHooks(schema), transforms);
}

export function mergeTransforms(bottom: SetsDefinition, top: SetsDefinition): SetsDefinition {
  const result: SetsDefinition = {};

  for (let key of concatUniqStrArrays(Object.keys(result), Object.keys(top))) {
    result[key] = [
      ...bottom[key],
      ...top[key],
    ]
  }

  return result;
}

export function makeSchemaHooks(schema: MoldSchema): SetsDefinition {
  return mergeTransforms(makeValidateHooks(schema), makePopulateHooks(schema));
}

export function makeValidateHooks(schema: MoldSchema): SetsDefinition {
  // TODO: add
  return {};
}

export function makePopulateHooks(schema: MoldSchema): SetsDefinition {
  // TODO: add
  return {};
}
