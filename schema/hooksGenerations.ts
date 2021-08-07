import {concatUniqStrArrays} from 'squidlet-lib/src/arrays'
import {SetsDefinition} from './interfaces/MoldHook'
import {MoldSchema} from '../interfaces/MoldSchema'
import {normalizeSchema} from '../schema/normalizeSchema'
import {populate} from '../hooks/populate'


/**
 * Add validation of data of create and patch actions and populate hooks
 * @param schema
 * @param transforms
 */
export function extractHooksFromSchema(schema: MoldSchema, transforms: SetsDefinition): SetsDefinition {
  return mergeTransforms(makeSchemaHooks(schema), transforms)
}

export function mergeTransforms(bottom: SetsDefinition, top: SetsDefinition): SetsDefinition {
  const result: SetsDefinition = {}

  for (let key of concatUniqStrArrays(Object.keys(result), Object.keys(top))) {
    result[key] = [
      ...bottom[key],
      ...top[key],
    ]
  }

  return result
}

export function makeSchemaHooks(schema: MoldSchema): SetsDefinition {
  return mergeTransforms(makeValidateHooks(schema), makePopulateHooks(schema))
}

export function makeValidateHooks(rawSchema: MoldSchema): SetsDefinition {
  const schema: MoldSchema = normalizeSchema(rawSchema)

  // TODO: add
  return {}
}

export function makePopulateHooks(rawSchema: MoldSchema): SetsDefinition {
  const schema: MoldSchema = normalizeSchema(rawSchema)
  const result: SetsDefinition = {}

  for (let setName of Object.keys(schema)) {
    for (let fieldName of Object.keys(schema[setName])) {
      const relation: string | undefined = schema[setName][fieldName]?.relation

      if (!relation) continue

      if (!result[setName]) result[setName] = []

      // result[setName].push(populate(
      //   relation,
      //   fieldName,
      //   // TODO: название должно быть без id или указанное в relation
      // ))
    }

  }

  return result
}
