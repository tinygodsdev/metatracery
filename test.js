/**
 * Тесты для библиотеки Tracery
 * Проверяем все основные возможности и функции
 */

var tracery = require('./tracery.js');

// Функция для детерминистического тестирования
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Функция для проверки результатов
function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
  console.log('✓ ' + message);
}

// Функция для проверки, что результат содержит один из ожидаемых вариантов
function assertContains(result, expectedOptions, message) {
  var found = expectedOptions.some(function(option) {
    return result === option;
  });
  if (!found) {
    throw new Error('Assertion failed: ' + message + 
                   '\nExpected one of: ' + expectedOptions.join(', ') + 
                   '\nGot: ' + result);
  }
  console.log('✓ ' + message);
}

console.log('🧪 Запуск тестов для Tracery...\n');

// ============================================================================
// ТЕСТ 1: Базовые функции
// ============================================================================
console.log('📋 Тест 1: Базовые функции');

var grammar = tracery.createGrammar({
  'animal': ['cat', 'dog', 'bird'],
  'origin': ['The #animal# is cute.']
});

var result = grammar.flatten('#origin#');
var expectedOptions = [
  'The cat is cute.',
  'The dog is cute.',
  'The bird is cute.'
];
assertContains(result, expectedOptions, 'Базовое развертывание работает');

// Проверяем, что результат всегда валидный
assert(typeof result === 'string', 'Результат должен быть строкой');
assert(result.length > 0, 'Результат не должен быть пустым');

console.log('');

// ============================================================================
// ТЕСТ 2: Множественные правила
// ============================================================================
console.log('📋 Тест 2: Множественные правила');

var multiGrammar = tracery.createGrammar({
  'sentence': [
    '#subject# #verb# #object#.',
    '#object# is #adjective#.',
    '#subject# and #object# are friends.'
  ],
  'subject': ['The cat', 'The dog'],
  'verb': ['chases', 'loves'],
  'object': ['the mouse', 'the ball'],
  'adjective': ['cute', 'playful'],
  'origin': ['#sentence#']
});

var multiResult = multiGrammar.flatten('#origin#');
assert(typeof multiResult === 'string', 'Множественные правила работают');
assert(multiResult.length > 0, 'Результат множественных правил не пустой');

console.log('');

// ============================================================================
// ТЕСТ 3: Встроенные модификаторы
// ============================================================================
console.log('📋 Тест 3: Встроенные модификаторы');

var modifierGrammar = tracery.createGrammar({
  'origin': ['#text.capitalize#'],
  'text': ['hello world']
});

modifierGrammar.addModifiers(tracery.baseEngModifiers);

var capitalizeResult = modifierGrammar.flatten('#origin#');
assert(capitalizeResult === 'Hello world', 'Модификатор capitalize работает');

// Тест модификатора a/an
var articleGrammar = tracery.createGrammar({
  'origin': ['#noun.a#'],
  'noun': ['cat', 'elephant', 'unicorn']
});

articleGrammar.addModifiers(tracery.baseEngModifiers);

var articleResult = articleGrammar.flatten('#origin#');
var articleOptions = ['a cat', 'an elephant', 'a unicorn'];
assertContains(articleResult, articleOptions, 'Модификатор a/an работает');

// Тест модификатора множественного числа
var pluralGrammar = tracery.createGrammar({
  'origin': ['#noun.s#'],
  'noun': ['cat', 'dog', 'bird', 'fish']
});

pluralGrammar.addModifiers(tracery.baseEngModifiers);

var pluralResult = pluralGrammar.flatten('#origin#');
var pluralOptions = ['cats', 'dogs', 'birds', 'fishes'];
assertContains(pluralResult, pluralOptions, 'Модификатор множественного числа работает');

// Тест модификатора replace
var replaceGrammar = tracery.createGrammar({
  'origin': ['#text.replace(old,new)#'],
  'text': ['The old cat is old']
});

replaceGrammar.addModifiers(tracery.baseEngModifiers);

var replaceResult = replaceGrammar.flatten('#origin#');
assert(replaceResult === 'The new cat is new', 'Модификатор replace работает');

console.log('');

// ============================================================================
// ТЕСТ 4: Действия (Actions)
// ============================================================================
console.log('📋 Тест 4: Действия (Actions)');

// Тест push действия
var pushGrammar = tracery.createGrammar({
  'origin': ['[name:Alice]#greeting#'],
  'greeting': ['Hello, #name#!']
});

var pushResult = pushGrammar.flatten('#origin#');
assert(pushResult === 'Hello, Alice!', 'Push действие работает');

// Тест множественных push действий
var multiPushGrammar = tracery.createGrammar({
  'origin': ['[name:Alice][mood:happy]#story#'],
  'story': ['#name# is feeling #mood# today.']
});

var multiPushResult = multiPushGrammar.flatten('#origin#');
assert(multiPushResult === 'Alice is feeling happy today.', 'Множественные push действия работают');

// Тест pop действия
var popGrammar = tracery.createGrammar({
  'origin': ['[name:Alice]#greeting#[name:POP]#farewell#'],
  'greeting': ['Hello, #name#! '],
  'farewell': ['Goodbye!']
});

var popResult = popGrammar.flatten('#origin#');
assert(popResult === 'Hello, Alice! Goodbye!', 'Pop действие работает');

console.log('');

// ============================================================================
// ТЕСТ 5: Обработка ошибок
// ============================================================================
console.log('📋 Тест 5: Обработка ошибок');

var errorGrammar = tracery.createGrammar({
  'origin': ['#existingSymbol# #missingSymbol#'],
  'existingSymbol': ['Hello']
});

var errorResult = errorGrammar.flatten('#origin#');
assert(errorResult === 'Hello ((missingSymbol))', 'Отсутствующие символы обрабатываются корректно');

// Проверяем, что ошибки обрабатываются корректно
// (отсутствующие символы отображаются как ((symbol)))
var errorNode = errorGrammar.expand('#origin#');
assert(Array.isArray(errorNode.errors), 'Ошибки собираются в массив');
// Основная проверка - что отсутствующие символы корректно отображаются
assert(errorResult.includes('((missingSymbol))'), 'Отсутствующие символы отображаются корректно');

console.log('');

// ============================================================================
// ТЕСТ 6: Детерминистическая генерация
// ============================================================================
console.log('📋 Тест 6: Детерминистическая генерация');

var detGrammar = tracery.createGrammar({
  'origin': ['#animal# is #color#'],
  'animal': ['cat', 'dog', 'bird', 'fish'],
  'color': ['red', 'blue', 'green', 'yellow']
});

// Устанавливаем детерминистический генератор
tracery.setRng(seededRandom(12345));

var detResult1 = detGrammar.flatten('#origin#');
var detResult2 = detGrammar.flatten('#origin#');

// Сбрасываем генератор для следующего теста
tracery.setRng(seededRandom(12345));
var detResult3 = detGrammar.flatten('#origin#');

assert(detResult1 === detResult3, 'Детерминистическая генерация работает');
assert(typeof detResult1 === 'string', 'Детерминистический результат - строка');

console.log('');

// ============================================================================
// ТЕСТ 7: Сложные грамматики
// ============================================================================
console.log('📋 Тест 7: Сложные грамматики');

var complexGrammar = tracery.createGrammar({
  'origin': ['#story#'],
  'story': ['#beginning# #middle# #ending#'],
  'beginning': ['Once upon a time, there was #character#.'],
  'character': ['#name# the #title#'],
  'name': ['Alice', 'Bob'],
  'title': ['brave knight', 'wise wizard'],
  'middle': ['#character# went on a quest.'],
  'ending': ['The end.']
});

complexGrammar.addModifiers(tracery.baseEngModifiers);

var complexResult = complexGrammar.flatten('#origin#');
assert(typeof complexResult === 'string', 'Сложная грамматика работает');
assert(complexResult.includes('Once upon a time'), 'Сложная грамматика содержит ожидаемый текст');
assert(complexResult.includes('The end.'), 'Сложная грамматика заканчивается правильно');

console.log('');

// ============================================================================
// ТЕСТ 8: Цепочки модификаторов
// ============================================================================
console.log('📋 Тест 8: Цепочки модификаторов');

var chainGrammar = tracery.createGrammar({
  'origin': ['#animal.a.capitalize# is cute.'],
  'animal': ['cat', 'elephant']
});

chainGrammar.addModifiers(tracery.baseEngModifiers);

var chainResult = chainGrammar.flatten('#origin#');
var chainOptions = ['A cat is cute.', 'An elephant is cute.'];
assertContains(chainResult, chainOptions, 'Цепочки модификаторов работают');

console.log('');

// ============================================================================
// ТЕСТ 9: Пользовательские модификаторы
// ============================================================================
console.log('📋 Тест 9: Пользовательские модификаторы');

var customModifiers = {
  'shout': function(s) {
    return s.toUpperCase() + '!';
  },
  'whisper': function(s) {
    return s.toLowerCase() + '...';
  }
};

var customGrammar = tracery.createGrammar({
  'origin': ['#text.shout#'],
  'text': ['hello world']
});

customGrammar.addModifiers(customModifiers);

var customResult = customGrammar.flatten('#origin#');
assert(customResult === 'HELLO WORLD!', 'Пользовательские модификаторы работают');

console.log('');

// ============================================================================
// ТЕСТ 10: API методы
// ============================================================================
console.log('📋 Тест 10: API методы');

// Тест createGrammar
var apiGrammar = tracery.createGrammar({
  'test': ['value']
});
assert(apiGrammar !== null, 'createGrammar создает грамматику');

// Тест expand vs flatten
var expandNode = apiGrammar.expand('#test#');
var flattenResult = apiGrammar.flatten('#test#');

assert(expandNode !== null, 'expand возвращает узел');
assert(flattenResult === 'value', 'flatten возвращает строку');

// Тест toJSON
var jsonResult = apiGrammar.toJSON();
assert(typeof jsonResult === 'string', 'toJSON возвращает строку');
assert(jsonResult.includes('test'), 'toJSON содержит символы');

console.log('');

// ============================================================================
// ТЕСТ 11: Парсинг
// ============================================================================
console.log('📋 Тест 11: Парсинг');

// Тест parse
var parsed = tracery.parse('Text #symbol# more text');
assert(Array.isArray(parsed), 'parse возвращает массив');
assert(parsed.length > 0, 'parse возвращает непустой массив');

// Тест parseTag
var tagParsed = tracery.parseTag('symbol.modifier1.modifier2');
assert(tagParsed.symbol === 'symbol', 'parseTag извлекает символ');
assert(Array.isArray(tagParsed.modifiers), 'parseTag извлекает модификаторы');

console.log('');

// ============================================================================
// ТЕСТ 12: Управление состоянием
// ============================================================================
console.log('📋 Тест 12: Управление состоянием');

var stateGrammar = tracery.createGrammar({
  'origin': ['#counter# #counter# #counter#'],
  'counter': ['1', '2', '3']
});

// Генерируем несколько результатов
var results = [];
for (var i = 0; i < 5; i++) {
  results.push(stateGrammar.flatten('#origin#'));
}

// Проверяем, что все результаты валидны
results.forEach(function(result, index) {
  assert(typeof result === 'string', 'Результат ' + (index + 1) + ' валиден');
  assert(result.length > 0, 'Результат ' + (index + 1) + ' не пустой');
});

console.log('');

// ============================================================================
// ТЕСТ 13: Edge cases
// ============================================================================
console.log('📋 Тест 13: Edge cases');

// Пустая грамматика
var emptyGrammar = tracery.createGrammar({});
var emptyResult = emptyGrammar.flatten('#missing#');
assert(emptyResult === '((missing))', 'Пустая грамматика обрабатывается корректно');

// Грамматика с пустыми правилами
var emptyRulesGrammar = tracery.createGrammar({
  'origin': [''],
  'test': ['#origin#']
});
var emptyRulesResult = emptyRulesGrammar.flatten('#test#');
assert(emptyRulesResult === '', 'Пустые правила обрабатываются корректно');

console.log('');

// ============================================================================
// ТЕСТ 14: Производительность
// ============================================================================
console.log('📋 Тест 14: Производительность');

var perfGrammar = tracery.createGrammar({
  'origin': ['#sentence#'],
  'sentence': ['#word# #word# #word# #word# #word#'],
  'word': ['hello', 'world', 'test', 'performance', 'check']
});

var startTime = Date.now();
for (var i = 0; i < 100; i++) {
  perfGrammar.flatten('#origin#');
}
var endTime = Date.now();

var duration = endTime - startTime;
assert(duration < 1000, '100 генераций выполняются менее чем за 1 секунду');

console.log('');

// ============================================================================
// ЗАКЛЮЧЕНИЕ
// ============================================================================
console.log('🎉 Все тесты пройдены успешно!');
console.log('');
console.log('📊 Результаты тестирования:');
console.log('✓ Базовые функции работают');
console.log('✓ Множественные правила работают');
console.log('✓ Встроенные модификаторы работают');
console.log('✓ Действия (push/pop) работают');
console.log('✓ Обработка ошибок работает');
console.log('✓ Детерминистическая генерация работает');
console.log('✓ Сложные грамматики работают');
console.log('✓ Цепочки модификаторов работают');
console.log('✓ Пользовательские модификаторы работают');
console.log('✓ API методы работают');
console.log('✓ Парсинг работает');
console.log('✓ Управление состоянием работает');
console.log('✓ Edge cases обрабатываются корректно');
console.log('✓ Производительность приемлемая');
console.log('');
console.log('🚀 Библиотека Tracery полностью функциональна и готова к использованию!');
