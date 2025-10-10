# Возможности работы с грамматиками в Tracery

## Обзор возможностей

Tracery предоставляет мощный набор инструментов для создания сложных генеративных грамматик. Библиотека поддерживает множество продвинутых функций для создания динамического, контекстно-зависимого контента.

## 1. Базовые символы и правила

### Простые символы
```javascript
{
  "animal": ["cat", "dog", "bird", "fish"],
  "color": ["red", "blue", "green", "yellow"]
}
```

### Символы с вложенными ссылками
```javascript
{
  "origin": ["#animal# is #color#"],
  "animal": ["cat", "dog"],
  "color": ["red", "blue"]
}
```

### Множественные правила
```javascript
{
  "sentence": [
    "#subject# #verb# #object#",
    "#object# is #adjective#",
    "#subject# and #object# are friends"
  ]
}
```

## 2. Модификаторы

### Встроенные модификаторы

#### `capitalize` - Первая буква заглавная
```javascript
{
  "origin": ["#name.capitalize# is here"]
}
// Результат: "Alice is here"
```

#### `capitalizeAll` - Все слова с заглавной буквы
```javascript
{
  "origin": ["#title.capitalizeAll#"]
}
// Результат: "The Great Adventure"
```

#### `a` - Артикль a/an
```javascript
{
  "origin": ["#animal.a# is cute"]
}
// Результат: "a cat is cute" или "an elephant is cute"
```

#### `s` - Множественное число
```javascript
{
  "origin": ["#animal.s# are cute"]
}
// Результат: "cats are cute", "dogs are cute"
```

#### `firstS` - Множественное число первого слова
```javascript
{
  "origin": ["#phrase.firstS# are here"]
}
// Результат: "cats and dogs are here"
```

#### `ed` - Прошедшее время
```javascript
{
  "origin": ["#verb.ed# yesterday"]
}
// Результат: "walked yesterday", "played yesterday"
```

#### `replace` - Замена текста
```javascript
{
  "origin": ["#text.replace(old,new)#"]
}
```

### Цепочки модификаторов
```javascript
{
  "origin": ["#name.capitalize.a# is here"]
}
// Результат: "A Alice is here"
```

### Модификаторы с параметрами
```javascript
{
  "origin": ["#text.replace(cat,dog)#"]
}
```

## 3. Действия (Actions)

### Push действия - добавление правил
```javascript
{
  "origin": ["[name:Alice]#greeting#"],
  "greeting": ["Hello, #name#!"]
}
// Результат: "Hello, Alice!"
```

### Pop действия - удаление правил
```javascript
{
  "origin": ["[name:Alice]#greeting#[name:POP]#farewell#"],
  "greeting": ["Hello, #name#! "],
  "farewell": ["Goodbye!"]
}
// Результат: "Hello, Alice! Goodbye!"
```

### Множественные push
```javascript
{
  "origin": ["[name:Alice][mood:happy]#story#"],
  "story": ["#name# is #mood#"]
}
```

### Динамические правила
```javascript
{
  "origin": ["[hero:Alice][villain:Bob]#conflict#"],
  "conflict": ["#hero# fights #villain#"]
}
```

## 4. Сложные грамматические структуры

### Рекурсивные структуры
```javascript
{
  "origin": ["#story#"],
  "story": [
    "#beginning# #middle# #ending#",
    "#beginning# #story#"
  ],
  "beginning": ["Once upon a time, "],
  "middle": ["something happened. "],
  "ending": ["The end."]
}
```

### Условные структуры
```javascript
{
  "origin": ["#character# #action#"],
  "character": ["hero", "villain"],
  "action": [
    "saves the day",
    "causes trouble"
  ]
}
```

### Вложенные структуры
```javascript
{
  "origin": ["#sentence#"],
  "sentence": ["#subject# #predicate#"],
  "subject": ["#noun#", "#adjective# #noun#"],
  "predicate": ["#verb# #object#"],
  "object": ["#noun#", "#adjective# #noun#"],
  "noun": ["cat", "dog", "house", "tree"],
  "adjective": ["big", "small", "red", "blue"],
  "verb": ["runs", "jumps", "sits", "stands"]
}
```

## 5. Стратегии выбора правил

### Shuffle (перемешивание)
```javascript
// Правила выбираются в случайном порядке без повторений
// до исчерпания всех вариантов
```

### Weighted (взвешенный выбор)
```javascript
// Планируется к реализации
// Позволит задавать веса для правил
```

### Falloff (затухание)
```javascript
// Планируется к реализации
// Правила в начале списка выбираются чаще
```

### По умолчанию (случайный выбор)
```javascript
// Каждое правило имеет равную вероятность выбора
```

## 6. Продвинутые возможности

### Escape-символы
```javascript
{
  "origin": ["This has \\#literal\\# symbols"]
}
// Результат: "This has #literal# symbols"
```

### Многострочные правила
```javascript
{
  "origin": [
    "Line 1\nLine 2\nLine 3",
    "Another\nmultiline\ntext"
  ]
}
```

### Смешанный контент
```javascript
{
  "origin": [
    "Text with #symbol# in the middle",
    "#symbol# at the beginning",
    "Text at the end #symbol#"
  ]
}
```

## 7. Обработка ошибок

### Отсутствующие символы
```javascript
{
  "origin": ["#missingSymbol#"]
}
// Результат: "((missingSymbol))"
```

### Незакрытые теги
```javascript
{
  "origin": ["#unclosedTag"]
}
// Ошибка: "Unclosed tag"
```

### Несбалансированные скобки
```javascript
{
  "origin": ["[unclosedAction"]
}
// Ошибка: "Too many ["
```

## 8. Производительность и оптимизация

### Ограничение глубины рекурсии
```javascript
// Библиотека автоматически отслеживает глубину рекурсии
// и предотвращает бесконечные циклы
```

### Кэширование результатов
```javascript
// Узлы кэшируют результаты развертывания
// для избежания повторных вычислений
```

### Управление памятью
```javascript
// Стеки правил автоматически очищаются
// при выполнении POP действий
```

## 9. Расширяемость

### Пользовательские модификаторы
```javascript
var customModifiers = {
  'shout': function(s) {
    return s.toUpperCase() + '!';
  },
  'whisper': function(s) {
    return s.toLowerCase() + '...';
  }
};

grammar.addModifiers(customModifiers);
```

### Пользовательские действия
```javascript
// Действия типа 2 (функции) могут быть расширены
// для выполнения пользовательской логики
```

## 10. Практические примеры

### Генератор историй
```javascript
{
  "origin": ["#beginning# #middle# #ending#"],
  "beginning": [
    "Once upon a time, there was #character#.",
    "In a land far away, #character# lived."
  ],
  "character": ["a brave knight", "a wise wizard", "a clever thief"],
  "middle": [
    "#character# went on a quest to #goal#.",
    "#character# discovered #discovery#."
  ],
  "goal": ["find treasure", "save the princess", "defeat the dragon"],
  "discovery": ["an ancient artifact", "a hidden cave", "a magical spell"],
  "ending": [
    "And they lived happily ever after.",
    "The adventure was just beginning."
  ]
}
```

### Генератор персонажей
```javascript
{
  "origin": ["#character#"],
  "character": ["#name# the #title#"],
  "name": ["Alice", "Bob", "Charlie", "Diana"],
  "title": ["#adjective# #profession#"],
  "adjective": ["brave", "wise", "clever", "mysterious"],
  "profession": ["warrior", "mage", "rogue", "healer"]
}
```

### Диалоговая система
```javascript
{
  "origin": ["#speaker#: \"#dialogue#\""],
  "speaker": ["#name.capitalize#"],
  "name": ["alice", "bob", "charlie"],
  "dialogue": [
    "#greeting# #question#",
    "#statement# #emotion#",
    "#exclamation#"
  ],
  "greeting": ["Hello", "Hi there", "Hey"],
  "question": ["how are you?", "what's new?", "are you okay?"],
  "statement": ["I'm fine", "Nothing much", "I'm busy"],
  "emotion": ["happily", "sadly", "excitedly"],
  "exclamation": ["Wow!", "Amazing!", "Incredible!"]
}
```

## 11. Лучшие практики

### Организация грамматики
- Группируйте связанные символы
- Используйте понятные имена символов
- Разделяйте контент и структуру

### Производительность
- Избегайте слишком глубокой рекурсии
- Используйте POP действия для очистки стека
- Ограничивайте количество правил в символах

### Читаемость
- Комментируйте сложные структуры
- Используйте отступы в JSON
- Разбивайте большие грамматики на модули

### Тестирование
- Создавайте детерминистические тесты
- Проверяйте границы и крайние случаи
- Тестируйте обработку ошибок
