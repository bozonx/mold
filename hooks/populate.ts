import {HookContext} from '../transform/interfaces/HookContext'
import {MoldResponse} from '../interfaces/MoldResponse'
import {ItemResponse, ListResponse} from '../interfaces/ReponseStructure'
import {PreHookDefinition} from '../transform/interfaces/MoldHook'


async function requestRelatedItem(
  context: HookContext,
  remoteItemId: string | number,
  relatedSet: string,
  relatedIdField: string,
): Promise<Record<string, any> | undefined> {
  const relatedResult: MoldResponse<ItemResponse> = await context.app.request({
    set: relatedSet,
    action: 'get',
    query: {id: remoteItemId},
  })

  if (!relatedResult.success) {
    const errors = (relatedResult.errors || []).join(', ')

    throw new Error(`Populate: ${relatedSet}, ${relatedIdField}. ${errors}`)
  }

  return relatedResult.result?.data || undefined
}

async function populateItemHook(
  context: HookContext,
  relatedSet: string,
  relatedIdField: string,
  populateField: string
) {
  const remoteItemId: string | number | undefined | null =
    context.response?.result.data?.[relatedIdField]

  if (typeof remoteItemId !== 'string' && typeof remoteItemId !== 'number') return

  const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
    context,
    remoteItemId,
    relatedSet,
    relatedIdField,
  )

  if (relatedItem) context.response!.result.data[populateField] = relatedItem
}

// TODO: review
// async function populateFindHook(
//   context: HookContext,
//   relatedSet: string,
//   relatedIdField: string,
//   populateField: string
// ): Promise<void> {
//   if (!context.response?.result) return
//
//   const findResponse: ListResponse = context.response.result
//
//   if (!findResponse.data) return
//
//   await Promise.all(findResponse.data.map(async (item) => {
//     const id = item[relatedIdField]
//
//     if (typeof id !== 'undefined' && id !== null) return
//
//     const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
//       context,
//       id,
//       relatedSet,
//       relatedIdField,
//     )
//
//     if (relatedItem) item[populateField] = relatedItem
//   }))
// }


/**
 * Populate item or items
 * @param relatedSet - name of set which will be called to find related item
 * @param relatedIdField - field name which is contains an id of related item
 * @param populateField - field name to put related item data.
 */
export function populate(
  relatedSet: string,
  // TODO: почему так?? может просто id передать
  relatedIdField: string,
  populateField: string
): PreHookDefinition[] {
  return [
    {
      type: 'after',
      action: 'get',
      hook: (context: HookContext) => populateItemHook(
        context,
        relatedSet,
        relatedIdField,
        populateField
      ),
    },
    // {
    //   type: 'after',
    //   action: 'find',
    //   hook: (context: HookContext) => populateFindHook(
    //     context,
    //     relatedSet,
    //     relatedIdField,
    //     populateField
    //   ),
    // },
  ]
}
