# Storage

Каждая нода имеет свой storage доступный по адресу moldPath. Все эти storages хранятся в плоском виде.
Каждый storage разделен на actions.
Каждый action имеет следующую структуру

    {
      combined: {}
      state: {}
      solid: {}
      meta: {}
      mold: {}
    }

где:

* combined - combined state and solid
* state - current state, can be partial updated. Это стейт интерфейса.
* solid - bottom level. Устанавливается только целиком. Обычно это данные с сервера.
* meta - метаданные, например номер страницы, если ли следующая страница и тд.
* mold - мутированный слепок состояния, который мутирует сама node, так как только она может знать
         о ключах например.

