# Примеры использования Tracery

## Содержание
1. [Базовые примеры](#базовые-примеры)
2. [Примеры с модификаторами](#примеры-с-модификаторами)
3. [Примеры с действиями](#примеры-с-действиями)
4. [Сложные грамматики](#сложные-грамматики)
5. [Практические применения](#практические-применения)
6. [Интерактивные примеры](#интерактивные-примеры)

## Базовые примеры

### Пример 1: Простая грамматика
```javascript
var tracery = require('./tracery.js');

var grammar = tracery.createGrammar({
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'origin': ['The #animal# is cute.']
});

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "The cat is cute."
// "The dog is cute."
// "The bird is cute."
// "The fish is cute."
```

### Пример 2: Множественные правила
```javascript
var grammar = tracery.createGrammar({
  'sentence': [
    '#subject# #verb# #object#.',
    '#object# is #adjective#.',
    '#subject# and #object# are friends.'
  ],
  'subject': ['The cat', 'The dog', 'The bird'],
  'verb': ['chases', 'loves', 'watches'],
  'object': ['the mouse', 'the ball', 'the fish'],
  'adjective': ['cute', 'playful', 'sleepy'],
  'origin': ['#sentence#']
});

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "The cat chases the mouse."
// "the ball is cute."
// "The dog and the fish are friends."
```

### Пример 3: Вложенные символы
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#character# #action#'],
  'character': ['#name# the #title#'],
  'name': ['Alice', 'Bob', 'Charlie'],
  'title': ['#adjective# #profession#'],
  'adjective': ['brave', 'wise', 'clever'],
  'profession': ['knight', 'wizard', 'thief'],
  'action': ['saves the day', 'casts a spell', 'steals treasure']
});

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "Alice the brave knight saves the day"
// "Bob the wise wizard casts a spell"
// "Charlie the clever thief steals treasure"
```

## Примеры с модификаторами

### Пример 4: Базовые модификаторы
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#name.capitalize# is #adjective#.'],
  'name': ['alice', 'bob', 'charlie'],
  'adjective': ['happy', 'sad', 'excited']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "Alice is happy."
// "Bob is sad."
// "Charlie is excited."
```

### Пример 5: Цепочки модификаторов
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#animal.a.capitalize# is #emotion#.'],
  'animal': ['cat', 'dog', 'elephant', 'unicorn'],
  'emotion': ['happy', 'sad', 'angry']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "A cat is happy."
// "An elephant is sad."
// "A unicorn is angry."
```

### Пример 6: Модификатор replace
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#text.replace(old,new)#'],
  'text': ['The old cat is old and old-fashioned']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
// Результат: "The new cat is new and new-fashioned"
```

### Пример 7: Множественное число
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#animal.s.capitalize# are #adjective#.'],
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'adjective': ['cute', 'playful', 'colorful']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "Cats are cute."
// "Dogs are playful."
// "Birds are colorful."
```

## Примеры с действиями

### Пример 8: Push действия
```javascript
var grammar = tracery.createGrammar({
  'origin': ['[name:Alice]#greeting#'],
  'greeting': ['Hello, #name#! How are you?']
});

console.log(grammar.flatten('#origin#'));
// Результат: "Hello, Alice! How are you?"
```

### Пример 9: Множественные push
```javascript
var grammar = tracery.createGrammar({
  'origin': ['[name:Alice][mood:happy]#story#'],
  'story': ['#name# is feeling #mood# today.']
});

console.log(grammar.flatten('#origin#'));
// Результат: "Alice is feeling happy today."
```

### Пример 10: Push и Pop
```javascript
var grammar = tracery.createGrammar({
  'origin': ['[name:Alice]#greeting#[name:POP]#farewell#'],
  'greeting': ['Hello, #name#! '],
  'farewell': ['Goodbye!']
});

console.log(grammar.flatten('#origin#'));
// Результат: "Hello, Alice! Goodbye!"
```

### Пример 11: Динамические правила
```javascript
var grammar = tracery.createGrammar({
  'origin': ['[hero:Alice][villain:Bob]#conflict#'],
  'conflict': ['#hero# fights #villain# in an epic battle.']
});

console.log(grammar.flatten('#origin#'));
// Результат: "Alice fights Bob in an epic battle."
```

## Сложные грамматики

### Пример 12: Генератор историй
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#beginning# #middle# #ending#'],
  'beginning': [
    'Once upon a time, there was #character#.',
    'In a land far away, #character# lived.',
    'Long ago, #character# was born.'
  ],
  'character': [
    '#name# the #title#',
    'a #adjective# #profession#'
  ],
  'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
  'title': ['brave knight', 'wise wizard', 'clever thief', 'beautiful princess'],
  'adjective': ['brave', 'wise', 'clever', 'mysterious', 'powerful'],
  'profession': ['warrior', 'mage', 'rogue', 'healer', 'archer'],
  'middle': [
    '#character# went on a quest to #goal#.',
    '#character# discovered #discovery#.',
    '#character# met #companion# and together they #adventure#.'
  ],
  'goal': ['find treasure', 'save the princess', 'defeat the dragon', 'restore peace'],
  'discovery': ['an ancient artifact', 'a hidden cave', 'a magical spell', 'a secret passage'],
  'companion': ['a talking cat', 'a wise owl', 'a brave knight', 'a magical fairy'],
  'adventure': ['explored the forest', 'climbed the mountain', 'crossed the river', 'entered the castle'],
  'ending': [
    'And they lived happily ever after.',
    'The adventure was just beginning.',
    'From that day forward, #character# was known as a hero.'
  ]
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
```

### Пример 13: Генератор персонажей
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#character#'],
  'character': ['#name# the #title#'],
  'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
  'title': ['#adjective# #profession#'],
  'adjective': ['brave', 'wise', 'clever', 'mysterious', 'powerful', 'gentle'],
  'profession': ['warrior', 'mage', 'rogue', 'healer', 'archer', 'bard'],
  'stats': [
    'Strength: #strength#, Intelligence: #intelligence#',
    'Dexterity: #dexterity#, Wisdom: #wisdom#'
  ],
  'strength': ['15', '16', '17', '18'],
  'intelligence': ['12', '13', '14', '15'],
  'dexterity': ['14', '15', '16', '17'],
  'wisdom': ['13', '14', '15', '16']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
```

### Пример 14: Диалоговая система
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#speaker#: "#dialogue#"'],
  'speaker': ['#name.capitalize#'],
  'name': ['alice', 'bob', 'charlie', 'diana'],
  'dialogue': [
    '#greeting# #question#',
    '#statement# #emotion#',
    '#exclamation# #reaction#',
    '#question# #response#'
  ],
  'greeting': ['Hello', 'Hi there', 'Hey', 'Good morning'],
  'question': ['how are you?', "what's new?", 'are you okay?', 'how was your day?'],
  'statement': ["I'm fine", 'Nothing much', "I'm busy", 'I had a great day'],
  'emotion': ['happily', 'sadly', 'excitedly', 'worriedly'],
  'exclamation': ['Wow!', 'Amazing!', 'Incredible!', 'Fantastic!'],
  'reaction': ['That sounds great!', 'Tell me more!', 'I can relate!', 'Really?'],
  'response': ['Thanks for asking!', 'Same to you!', 'You too!', 'Likewise!']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
```

## Практические применения

### Пример 15: Генератор названий
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#title#'],
  'title': [
    '#adjective# #noun#',
    '#noun# of #place#',
    '#adjective# #noun# #suffix#'
  ],
  'adjective': ['Dark', 'Bright', 'Ancient', 'Mystic', 'Golden', 'Silver'],
  'noun': ['Forest', 'Mountain', 'River', 'Castle', 'Tower', 'Cave'],
  'place': ['Shadows', 'Light', 'Eternity', 'Dreams', 'Hope', 'Despair'],
  'suffix': ['Chronicles', 'Legends', 'Tales', 'Saga', 'Adventures']
});

console.log(grammar.flatten('#origin#'));
// Возможные результаты:
// "Dark Forest"
// "Mountain of Light"
// "Ancient Castle Chronicles"
```

### Пример 16: Генератор описаний
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#description#'],
  'description': [
    'A #size# #color# #object# sits #location#.',
    '#object.capitalize# #color# and #texture# #verb# in the #environment#.',
    'The #adjective# #object# #action# #location#.'
  ],
  'size': ['small', 'large', 'tiny', 'massive', 'huge'],
  'color': ['red', 'blue', 'green', 'purple', 'golden', 'silver'],
  'object': ['cat', 'dog', 'bird', 'flower', 'tree', 'rock'],
  'location': ['on the table', 'in the garden', 'by the window', 'under the tree'],
  'texture': ['smooth', 'rough', 'soft', 'hard', 'shiny', 'dull'],
  'verb': ['rests', 'sleeps', 'plays', 'watches', 'listens'],
  'environment': ['forest', 'garden', 'meadow', 'park', 'field'],
  'adjective': ['beautiful', 'mysterious', 'ancient', 'magical', 'peaceful'],
  'action': ['glows', 'shimmers', 'sparkles', 'dances', 'sings']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
```

### Пример 17: Генератор квестов
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#quest#'],
  'quest': [
    '#hero# must #task# to #goal#.',
    'Help #hero# #task# and #reward#.',
    '#villain# has #problem#. #hero# must #solution#.'
  ],
  'hero': ['the brave knight', 'the wise wizard', 'the clever rogue'],
  'villain': ['the evil sorcerer', 'the dark lord', 'the wicked witch'],
  'task': ['find', 'retrieve', 'defeat', 'rescue', 'destroy'],
  'goal': ['the lost treasure', 'the ancient artifact', 'the princess'],
  'reward': ['save the kingdom', 'restore peace', 'gain great power'],
  'problem': ['stolen the crystal', 'cursed the village', 'kidnapped the children'],
  'solution': ['break the curse', 'return the crystal', 'free the children']
});

grammar.addModifiers(tracery.baseEngModifiers);

console.log(grammar.flatten('#origin#'));
```

## Интерактивные примеры

### Пример 18: Детерминистическая генерация
```javascript
// Seeded random number generator
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

var tracery = require('./tracery.js');

// Устанавливаем детерминистический генератор
tracery.setRng(seededRandom(12345));

var grammar = tracery.createGrammar({
  'origin': ['#animal# is #color#'],
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'color': ['red', 'blue', 'green', 'yellow']
});

// Всегда будет одинаковый результат
console.log(grammar.flatten('#origin#')); // "bird is red"
console.log(grammar.flatten('#origin#')); // "fish is blue"
console.log(grammar.flatten('#origin#')); // "cat is green"
```

### Пример 19: Множественная генерация
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#story#'],
  'story': ['#beginning# #middle# #ending#'],
  'beginning': ['Once upon a time, '],
  'middle': ['something amazing happened. '],
  'ending': ['The end.']
});

// Генерируем несколько историй
for (var i = 0; i < 5; i++) {
  console.log('Story ' + (i + 1) + ': ' + grammar.flatten('#origin#'));
}
```

### Пример 20: Обработка ошибок
```javascript
var grammar = tracery.createGrammar({
  'origin': ['#existingSymbol# #missingSymbol#'],
  'existingSymbol': ['Hello']
});

var result = grammar.flatten('#origin#');
console.log(result); // "Hello ((missingSymbol))"

// Проверяем ошибки в узле
var node = grammar.expand('#origin#');
if (node.errors.length > 0) {
  console.log('Errors found:', node.errors);
}
```

## Заключение

Эти примеры демонстрируют основные возможности Tracery:

1. **Базовые грамматики** - простые символы и правила
2. **Модификаторы** - преобразование текста
3. **Действия** - динамическое управление правилами
4. **Сложные структуры** - рекурсия и вложенность
5. **Практические применения** - реальные сценарии использования
6. **Интерактивность** - детерминизм и множественная генерация

Tracery предоставляет мощный инструментарий для создания разнообразного процедурно генерируемого контента, от простых фраз до сложных историй и диалогов.
