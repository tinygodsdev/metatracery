# Tracery - Полная документация API

## Обзор

Tracery - это библиотека для создания генеративных грамматик, которая позволяет создавать процедурно генерируемый контент на основе правил и символов. Библиотека поддерживает сложные грамматические конструкции, модификаторы, действия и различные стратегии выбора правил.

## Основные компоненты

### 1. Tracery (главный объект)

Главный объект библиотеки, содержащий все основные функции и классы.

#### Основные методы:

- `tracery.createGrammar(raw)` - создает новую грамматику
- `tracery.parse(rule)` - парсит правило в секции
- `tracery.parseTag(tagContents)` - парсит содержимое тега
- `tracery.setRng(newRng)` - устанавливает генератор случайных чисел

### 2. Grammar (Грамматика)

Основной класс для работы с грамматиками.

#### Конструктор:
```javascript
var grammar = new Grammar(raw, settings);
```

#### Методы:

##### `addModifiers(mods)`
Добавляет модификаторы к грамматике.
```javascript
grammar.addModifiers(tracery.baseEngModifiers);
```

##### `clearState()`
Очищает состояние всех символов в грамматике.

##### `loadFromRawObj(raw)`
Загружает грамматику из сырого объекта.

##### `createRoot(rule)`
Создает корневой узел для правила.

##### `expand(rule, allowEscapeChars)`
Разворачивает правило и возвращает узел.
```javascript
var node = grammar.expand('#origin#');
```

##### `flatten(rule, allowEscapeChars)`
Разворачивает правило и возвращает финальный текст.
```javascript
var text = grammar.flatten('#origin#');
```

##### `toJSON()`
Возвращает JSON представление грамматики.

##### `pushRules(key, rawRules, sourceAction)`
Добавляет правила к символу (динамически).

##### `popRules(key)`
Удаляет последние добавленные правила символа.

##### `selectRule(key, node, errors)`
Выбирает правило для символа.

### 3. Symbol (Символ)

Представляет символ в грамматике с набором правил.

#### Методы:

##### `clearState()`
Очищает состояние символа.

##### `pushRules(rawRules)`
Добавляет новые правила в стек.

##### `popRules()`
Удаляет последние правила из стека.

##### `selectRule(node, errors)`
Выбирает правило для использования.

##### `getActiveRules()`
Возвращает активные правила.

##### `rulesToJSON()`
Возвращает JSON представление правил.

### 4. RuleSet (Набор правил)

Управляет набором правил для символа.

#### Методы:

##### `selectRule(errors)`
Выбирает правило из набора.

##### `clearState()`
Очищает состояние набора правил.

### 5. TraceryNode (Узел)

Представляет узел в дереве развертывания.

#### Методы:

##### `expand(preventRecursion)`
Разворачивает узел.

##### `expandChildren(childRule, preventRecursion)`
Разворачивает дочерние узлы.

##### `clearEscapeChars()`
Очищает escape-символы из финального текста.

### 6. NodeAction (Действие узла)

Представляет действие, выполняемое при развертывании узла.

#### Типы действий:
- **0**: Push - `[key:rule]`
- **1**: Pop - `[key:POP]`
- **2**: Function - `[functionName(param0,param1)]`

#### Методы:

##### `createUndo()`
Создает действие отмены.

##### `activate()`
Активирует действие.

##### `toText()`
Возвращает текстовое представление действия.

## Синтаксис грамматики

### Основные конструкции:

#### 1. Символы
```javascript
{
  "animal": ["cat", "dog", "bird"],
  "origin": ["#animal# is here"]
}
```

#### 2. Теги с модификаторами
```javascript
{
  "origin": ["#animal.capitalize# is here"]
}
```

#### 3. Действия (Actions)
```javascript
{
  "origin": ["[pushTarget:newRule]#symbol#"]
}
```

#### 4. Сложные правила
```javascript
{
  "origin": ["#subject# #verb# #object#"],
  "subject": ["#noun#", "#adjective# #noun#"],
  "verb": ["runs", "jumps", "flies"],
  "object": ["#noun#", "#adjective# #noun#"]
}
```

## Встроенные модификаторы (baseEngModifiers)

### `replace(s, params)`
Заменяет все вхождения строки.
```javascript
"#text.replace(old,new)#"
```

### `capitalize(s)`
Делает первую букву заглавной.
```javascript
"#text.capitalize#"
```

### `capitalizeAll(s)`
Делает заглавной первую букву каждого слова.
```javascript
"#text.capitalizeAll#"
```

### `a(s)`
Добавляет артикль "a" или "an".
```javascript
"#noun.a#"
```

### `s(s)`
Добавляет множественное число.
```javascript
"#noun.s#"
```

### `firstS(s)`
Добавляет множественное число к первому слову.
```javascript
"#phrase.firstS#"
```

### `ed(s)`
Добавляет прошедшее время.
```javascript
"#verb.ed#"
```

## Стратегии распределения

### `shuffle`
Перемешивает правила и выбирает по порядку.

### `weighted`
Взвешенное распределение (не реализовано).

### `falloff`
Распределение с затуханием (не реализовано).

### По умолчанию
Случайный выбор с возможностью настройки falloff.

## Примеры использования

### Базовый пример
```javascript
var tracery = require('./tracery.js');

var grammar = tracery.createGrammar({
  'animal': ['cat', 'dog', 'bird'],
  'emotion': ['happy', 'sad', 'angry'],
  'origin': ['The #emotion# #animal# runs fast.']
});

grammar.addModifiers(tracery.baseEngModifiers);
console.log(grammar.flatten('#origin#'));
```

### Пример с действиями
```javascript
var grammar = tracery.createGrammar({
  'origin': ['[name:hero]#greeting#'],
  'greeting': ['Hello, #name#!'],
  'hero': ['Alice', 'Bob']
});
```

### Пример с модификаторами
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#animal.a.capitalize# is #emotion#.'],
  'animal': ['cat', 'dog', 'elephant'],
  'emotion': ['happy', 'sad', 'excited']
});
```

## Обработка ошибок

Библиотека включает систему обработки ошибок:
- Отсутствующие символы отображаются как `((symbol))`
- Ошибки парсинга собираются в массиве `errors`
- Незакрытые теги и скобки отслеживаются

## Детерминистическое поведение

Для создания детерминистического поведения можно использовать собственный генератор случайных чисел:

```javascript
function seededRandom(seed) {
  // Реализация seeded random
}

tracery.setRng(seededRandom);
```

## Расширенные возможности

### Подграмматики
Грамматики могут ссылаться на другие грамматики через `subgrammars`.

### Условные правила
Правила могут содержать условия для выбора (частично реализовано).

### Динамические правила
Правила могут добавляться и удаляться во время выполнения через действия.

### Escape-символы
Поддержка экранирования специальных символов с помощью `\`.

## Ограничения

1. Взвешенное распределение не реализовано
2. Распределение с затуханием не реализовано
3. Условные правила работают частично
4. Некоторые функции действий не полностью реализованы

## Производительность

- Библиотека оптимизирована для быстрого парсинга
- Поддерживает рекурсивные структуры
- Включает защиту от бесконечной рекурсии
- Эффективное управление памятью через стеки правил
