import {SetItem} from '../hooksMidleware/interfaces/MoldHook';
import {HookContext} from '../hooksMidleware/interfaces/HookContext';
import {MoldResponse} from '../interfaces/MoldResponse';
import {ItemResponse, ListResponse} from '../frontend/interfaces/ActionState';


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
): SetItem {
  async function requestRelatedItem(
    context: HookContext,
    id: string | number
  ): Promise<Record<string, any> | undefined> {
    if (!context.response?.result || typeof id === 'undefined') return;

    const relatedResult: MoldResponse<ItemResponse> = await context.app.request({
      set: relatedSet,
      action: 'get',
      id,
    });

    if (!relatedResult.success) {
      throw new Error(`Populate: ${relatedSet}, ${relatedIdField}. stringifyError(relatedResult.errors)`);
    }

    return relatedResult.result?.data || undefined;
  }

  async function populateItemHook(context: HookContext) {
    const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
      context,
      context.response?.result.data[relatedIdField],
    );

    if (context.response && relatedItem) {
      context.response.result.data[populateField] = relatedItem;
    }
  }

  async function populateFindHook(context: HookContext) {
    if (!context.response?.result) return;

    const findResponse: ListResponse = context.response.result;

    if (!findResponse.data) return;

    for (let item of findResponse.data) {
      const relatedItem: Record<string, any> | undefined = await requestRelatedItem(
        context,
        item[relatedIdField]
      );

      if (relatedItem) item[populateField] = relatedItem;
    }
  }

  return [
    {type: 'after', action: 'get', hook: populateItemHook},
    {type: 'after', action: 'find', hook: populateFindHook},
  ];
}
