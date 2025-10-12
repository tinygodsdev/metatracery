# Подход к генерации шаблонов в GrammarAnalyzer

## Проблема

Текущий подход к генерации шаблонов имеет следующие проблемы:

1. **Дублирование параметров**: параметры повторяются многократно в одном шаблоне
2. **Неправильные пути**: `origin` и другие символы встречаются многократно в одном пути
3. **Смешение логики**: обход дерева и сборка параметров происходят одновременно
4. **Несогласованность**: логика генерации отличается от логики подсчета (которая работает правильно)

## Предлагаемое решение: Двухпроходная генерация

### Проход 1: Создание структуры путей
Используем **проверенную логику обхода дерева** из метода `countAllPaths`:

```typescript
interface PathStructure {
  template: string;           // Исходный шаблон: "#S# #S# #S#"
  path: string[];            // Уникальный путь: ["origin", "S", "S", "S"]
  parameterPositions: number[]; // Позиции параметров в шаблоне: [0, 1, 2]
}
```

**Логика:**
- Обходим дерево грамматики (как в `countAllPaths`)
- Для каждого уникального пути создаем структуру
- Записываем позиции параметров в шаблоне
- Создаем словарь: `Map<string, PathStructure>` где ключ - уникальный идентификатор пути

### Проход 2: Заполнение шаблонов значениями
Для каждого пути из словаря:

```typescript
interface GenerationTemplate {
  template: string;          // "#S# #S# #S#"
  parameters: Array<{symbol: string, value: string}>; // [{symbol: "S", value: "A"}, ...]
  path: string[];           // ["origin", "S", "S", "S"]
}
```

**Логика:**
- Берем структуру пути из словаря
- Заполняем параметры значениями из грамматики
- Создаем финальный `GenerationTemplate`
- Передаем в `TemplateRenderer` для рендеринга

## Преимущества подхода

1. **Разделение ответственности**: обход дерева отдельно от сборки параметров
2. **Переиспользование логики**: используем проверенный `countAllPaths`
3. **Чистота кода**: нет смешения разных задач
4. **Легче тестировать**: каждый проход можно тестировать отдельно
5. **Согласованность**: генерация и подсчет используют одинаковую логику обхода

## Детали реализации

### Структура данных для путей

```typescript
interface PathNode {
  symbol: string;           // "S", "origin", etc.
  alternatives: string[];   // ["A", "B", "C"]
  isParameter: boolean;     // true if alternatives.length > 1
  children: PathNode[];     // Дочерние узлы
}

interface PathChoice {
  nodeSymbol: string;       // "S"
  chosenAlternative: string; // "A"
  childPath?: PathChoice[]; // Рекурсивная структура
}
```

### Алгоритм прохода 1

```typescript
function generatePathStructures(
  node: PathNode, 
  currentPath: string[], 
  currentTemplate: string,
  constraints?: Record<string, string>
): PathStructure[] {
  
  // Если узел встречается в шаблоне
  if (currentTemplate.includes(`#${node.symbol}#`)) {
    // Создаем ветки для каждой альтернативы
    for (const alternative of node.alternatives) {
      // Проверяем ограничения
      if (constraints && constraints[node.symbol] && constraints[node.symbol] !== alternative) {
        continue;
      }
      
      // Рекурсивно обрабатываем дочерние узлы
      const childStructures = generatePathStructures(
        childNode, 
        [...currentPath, node.symbol], 
        currentTemplate,
        constraints
      );
      
      // Объединяем результаты
    }
  }
  
  // Если это листовой узел
  if (node.children.length === 0) {
    return [{
      template: currentTemplate,
      path: [...currentPath, node.symbol],
      parameterPositions: findParameterPositions(currentTemplate)
    }];
  }
}
```

### Алгоритм прохода 2

```typescript
function fillTemplatesWithValues(
  pathStructures: PathStructure[],
  grammar: GrammarRule
): GenerationTemplate[] {
  
  return pathStructures.map(structure => {
    const parameters: Array<{symbol: string, value: string}> = [];
    
    // Заполняем параметры значениями из грамматики
    for (let i = 0; i < structure.path.length; i++) {
      const symbol = structure.path[i];
      if (grammar[symbol]) {
        // Находим соответствующее значение для этого символа
        const value = findValueForSymbol(symbol, structure.path, i, grammar);
        parameters.push({ symbol, value });
      }
    }
    
    return {
      template: structure.template,
      parameters,
      path: structure.path
    };
  });
}
```

## Интеграция с существующим кодом

1. **Удалить старые методы генерации**:
   - `generateAllTemplatesWithContent`
   - `generateSequenceTemplatesWithContent`
   - `generateAllPathsWithContent`
   - `generateSequencePathsWithContent`

2. **Создать новые методы**:
   - `generatePathStructures` (проход 1)
   - `fillTemplatesWithValues` (проход 2)
   - `generateAllTemplates` (объединяет оба прохода)

3. **Обновить `generateAllCombinations`**:
   - Использовать новые методы
   - Передавать результат в `TemplateRenderer`

## Тестирование

1. **Тест прохода 1**: проверить, что генерируются правильные структуры путей
2. **Тест прохода 2**: проверить, что параметры заполняются корректно
3. **Интеграционный тест**: проверить, что финальные шаблоны соответствуют ожиданиям
4. **Тест с ограничениями**: проверить работу с constraints

## Примеры

### Простая грамматика
```json
{
  "origin": ["#S# #S# #S#"],
  "S": ["A", "B", "C"]
}
```

**Проход 1**: Создает 27 структур путей (3×3×3)
**Проход 2**: Заполняет каждую структуру значениями A, B, C

### Лингвистическая грамматика
```json
{
  "origin": ["#word_order#"],
  "word_order": ["#SVO#", "#VSO#"],
  "SVO": ["#SP# #VP# #OP#"],
  "VSO": ["#VP# #SP# #OP#"],
  "SP": ["#NP#"],
  "OP": ["#NP#"],
  "NP": ["girl", "cat"],
  "VP": ["loves", "eats", "pets"]
}
```

**Проход 1**: Создает 24 структуры путей (2×2×2×3)
**Проход 2**: Заполняет каждую структуру значениями из грамматики
