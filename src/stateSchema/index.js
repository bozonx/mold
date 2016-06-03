import MainInstance from './MainInstance';


// TODO: composition

// TODO: handlers переименовать в drivers
// TODO: поддержка вложенных схем - рекурсиваная обработка
// TODO: добавить списки
// TODO: синхронные / асинхронные запросы - async await
// TODO: добавить возможность вставлять в стейт полный сохраненный стейт - initialState - для тестов и загрузки с сервера
// TODO: сделать pounch
// TODO: forceUpdate - обновить данные с сервера

// TODO: сделать localStorage
// TODO: добавить события
// TODO: сделать валидацию параметров
// TODO: сделать валидацию схемы



export function initSchema(schema) {
  return new MainInstance(schema);
}



// export function list(itemSchema) {
//   return {
//     type: 'list',
//     itemSchema: itemSchema,
//   }
// }
