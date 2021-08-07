import {concatUniqStrArrays} from 'squidlet-lib/src/arrays'

import {MoldSchema, MoldSchemaFieldRelation} from '../interfaces/MoldSchema'
import {SetsDefinition} from '../transform/interfaces/MoldHook'
import {normalizeSchema} from './normalizeSchema'
import {populate} from '../hooks/populate'


/**
 * Add validation of data of create and patch actions and populate hooks
 * @param schema
 * @param transforms
 */
export function mergeHooksFromSchema(
  schema: MoldSchema,
  transforms: SetsDefinition
): SetsDefinition {
  return mergeTransforms(extractHooksFromSchema(schema), transforms)
}

export function mergeTransforms(
  bottom: SetsDefinition,
  top: SetsDefinition
): SetsDefinition {
  const result: SetsDefinition = {}

  for (let key of concatUniqStrArrays(Object.keys(result), Object.keys(top))) {
    result[key] = [
      ...bottom[key],
      ...top[key],
    ]
  }

  return result
}

export function extractHooksFromSchema(schema: MoldSchema): SetsDefinition {
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
      const relation: MoldSchemaFieldRelation | undefined = schema[setName][fieldName]?.relation

      if (!relation) continue

      if (!result[setName]) result[setName] = []

      result[setName].push(populate(
        relation.set,
        // TODO: review
        String(relation.id),
        // TODO: название должно быть без id или указанное в relation
        fieldName,
      ))
    }

  }

  return result
}
