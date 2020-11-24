import {MoldSchema} from '../interfaces/MoldSchema';


export function parseSchema(schemas: MoldSchema[]): MoldSchema {
  // TODO: add !!!
  /*
1й этап - преобразование упрощенной схемы в полную
2й этап - валидация схемы
3й этап - мержим в 1 схему
и далее считываем с нее:

* seed
* валидация seed
* формируем relation хуки которые сами сделают populate и при изменениях будут генерить изменения в populate
* правила миграции
* валидацию формы
* выбрать default значения для создания нового элемента
* валидацию бэкэнда перед записью
   */

  return schemas[0];
}
