import {HookContext} from '../transform/interfaces/HookContext';
import {MoldResponse} from '../interfaces/MoldResponse';
import {ItemResponse, ListResponse} from '../interfaces/ReponseStructure';
import {PreHookDefinition} from '../transform/interfaces/MoldHook';


async function requestRelatedItem(
  context: HookContext,
  id: string | number,
  relatedSet: string,
  relatedIdField: string,
): Promise<Record<string, any> | undefined> {
  if (!context.response?.result || typeof id === 'undefined') return;

  const relatedResult: MoldResponse<ItemResponse> = await context.app.request({
    set: relatedSet,
    action: 'get',
    id,
  });

  if (!relatedResult.success) {
    const errors = (relatedResult.errors || []).join(', ');

    throw new Error(`Populate: ${relatedSet}, ${relatedIdField}. ${errors}`);
  }

  return relatedResult.result?.data || undefined;
}

async function populateItemHook(
  context: HookContext,
  relatedSet: string,
  relatedIdField: string,
  populateField: string
) {
  const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
    context,
    context.response?.result.data[relatedIdField],
    relatedSet,
    relatedIdField,
  );

  if (context.response && relatedItem) {
    context.response.result.data[populateField] = relatedItem;
  }
}

async function populateFindHook(
  context: HookContext,
  relatedSet: string,
  relatedIdField: string,
  populateField: string
) {
  if (!context.response?.result) return;

  const findResponse: ListResponse = context.response.result;

  if (!findResponse.data) return;

  // TODO: асинхронно

  for (let item of findResponse.data) {
    const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
      context,
      item[relatedIdField],
      relatedSet,
      relatedIdField,
    );

    if (relatedItem) item[populateField] = relatedItem;
  }
}


/**
 * Populate item or items
 * @param relatedSet - name of set which will be called to find related item
 * @param relatedIdField - field name which is contains an id of related item
 * @param populateField - field name to put related item data.
 */
export function populate(
  relatedSet: string,
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
    {
      type: 'after',
      action: 'find',
      hook: (context: HookContext) => populateFindHook(
        context,
        relatedSet,
        relatedIdField,
        populateField
      ),
    },
  ];
}
