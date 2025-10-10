/**
 * Демонстрация возможностей библиотеки Tracery
 * Показывает основные функции и примеры использования
 */

var tracery = require('./tracery.js');

console.log('🎭 Демонстрация библиотеки Tracery\n');

// ============================================================================
// Пример 1: Простая грамматика
// ============================================================================
console.log('📝 Пример 1: Простая грамматика');

var simpleGrammar = tracery.createGrammar({
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'emotion': ['happy', 'sad', 'angry', 'excited'],
  'origin': ['The #emotion# #animal# runs fast.']
});

console.log('Генерируем 3 варианта:');
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + simpleGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 2: Грамматика с модификаторами
// ============================================================================
console.log('✨ Пример 2: Грамматика с модификаторами');

var modifierGrammar = tracery.createGrammar({
  'origin': ['#animal.a.capitalize# is #emotion#.'],
  'animal': ['cat', 'dog', 'elephant', 'unicorn'],
  'emotion': ['happy', 'sad', 'angry']
});

modifierGrammar.addModifiers(tracery.baseEngModifiers);

console.log('Генерируем 3 варианта с модификаторами:');
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + modifierGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 3: Грамматика с действиями
// ============================================================================
console.log('🎬 Пример 3: Грамматика с действиями');

var actionGrammar = tracery.createGrammar({
  'origin': ['[name:Alice][mood:happy]#story#'],
  'story': ['#name# is feeling #mood# today. She #action#.'],
  'action': ['goes for a walk', 'reads a book', 'calls her friend']
});

console.log('Генерируем 3 варианта с действиями:');
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + actionGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 4: Сложная грамматика - генератор историй
// ============================================================================
console.log('📚 Пример 4: Генератор историй');

var storyGrammar = tracery.createGrammar({
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

storyGrammar.addModifiers(tracery.baseEngModifiers);

console.log('Генерируем 2 истории:');
for (var i = 0; i < 2; i++) {
  console.log('\nИстория ' + (i + 1) + ':');
  console.log(storyGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 5: Детерминистическая генерация
// ============================================================================
console.log('🎯 Пример 5: Детерминистическая генерация');

// Seeded random number generator
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

var detGrammar = tracery.createGrammar({
  'origin': ['#animal# is #color#'],
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'color': ['red', 'blue', 'green', 'yellow']
});

console.log('С одинаковым seed (12345):');
tracery.setRng(seededRandom(12345));
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + detGrammar.flatten('#origin#'));
}

console.log('\nС другим seed (54321):');
tracery.setRng(seededRandom(54321));
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + detGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 6: Пользовательские модификаторы
// ============================================================================
console.log('🔧 Пример 6: Пользовательские модификаторы');

var customModifiers = {
  'shout': function(s) {
    return s.toUpperCase() + '!';
  },
  'whisper': function(s) {
    return s.toLowerCase() + '...';
  },
  'repeat': function(s, params) {
    var count = parseInt(params[0]) || 2;
    return s.repeat(count);
  }
};

var customGrammar = tracery.createGrammar({
  'origin': ['#text.shout#', '#text.whisper#', '#text.repeat(3)#'],
  'text': ['hello world']
});

customGrammar.addModifiers(customModifiers);

console.log('Генерируем с пользовательскими модификаторами:');
for (var i = 0; i < 3; i++) {
  console.log('  ' + (i + 1) + '. ' + customGrammar.flatten('#origin#'));
}
console.log('');

// ============================================================================
// Пример 7: Обработка ошибок
// ============================================================================
console.log('⚠️  Пример 7: Обработка ошибок');

var errorGrammar = tracery.createGrammar({
  'origin': ['#existingSymbol# #missingSymbol#'],
  'existingSymbol': ['Hello']
});

var errorResult = errorGrammar.flatten('#origin#');
console.log('Результат с отсутствующим символом:');
console.log('  "' + errorResult + '"');
console.log('');

// ============================================================================
// Заключение
// ============================================================================
console.log('🎉 Демонстрация завершена!');
console.log('');
console.log('📋 Показанные возможности:');
console.log('✓ Базовые символы и правила');
console.log('✓ Встроенные модификаторы (capitalize, a/an, s, replace)');
console.log('✓ Действия (push/pop)');
console.log('✓ Сложные рекурсивные грамматики');
console.log('✓ Детерминистическая генерация');
console.log('✓ Пользовательские модификаторы');
console.log('✓ Обработка ошибок');
console.log('');
console.log('🚀 Библиотека Tracery готова для создания сложных генеративных систем!');
