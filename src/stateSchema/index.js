import SchemaInstance from './SchemaInstance';


// TODO: поддержка вложенных схем - рекурсиваная обработка
// TODO: добавить списки
// TODO: синхронные / асинхронные запросы - async await
// TODO: добавить возможность вставлять в стейт полный сохраненный стейт - initialState - для тестов и загрузки с сервера
// TODO: сделать pounch

// TODO: сделать localStorage
// TODO: добавить события
// TODO: сделать валидацию параметров
// TODO: сделать валидацию схемы



export function initSchema(schema) {
  return new SchemaInstance(schema);
}



// export function list(itemSchema) {
//   return {
//     type: 'list',
//     itemSchema: itemSchema,
//   }
// }
