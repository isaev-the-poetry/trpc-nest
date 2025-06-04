# 🚀 Demo Instructions: tRPC NestJS Decorators

Этот файл содержит пошаговые инструкции для демонстрации всех возможностей пакета `trpc-nest-decorators`.

## 📋 Предварительные требования

- Node.js (версия 14 или выше)
- npm или yarn
- curl (для HTTP запросов)
- python3 (для форматирования JSON, опционально)

## 🛠️ Настройка

### 1. Установка и сборка основного пакета

```bash
cd ../packages/trpc-nest-decorators
npm install
npm run build
```

### 2. Установка зависимостей примера

```bash
cd ../example
npm install
```

### 3. Сборка примера

```bash
npm run build
```

### 4. Запуск сервера

```bash
npm start
```

Сервер запустится на http://localhost:3000

## 🎯 Демонстрационные сценарии

### Сценарий 1: Быстрое тестирование базовой функциональности

**Время выполнения:** ~2 минуты

```bash
# Запустите простой тест
./test-current-api.sh
```

**Что демонстрируется:**
- ✅ Проверка работы сервера
- ✅ Получение информации о зарегистрированных контроллерах
- ✅ Схема автоматически сгенерированного tRPC роутера
- ✅ Базовый пример вызова `posts.getAll`

### Сценарий 2: Полная демонстрация всех возможностей

**Время выполнения:** ~5 минут

```bash
# Запустите полную демонстрацию
./trpc-demo-working.sh
```

**Что демонстрируется:**
- 📊 Query операции (getAll, getById, search)
- 🔄 Mutation операции (create, update, delete)
- 🛡️ Валидация входных данных
- ❌ Обработка ошибок
- 📈 Проверка изменений в реальном времени
- ⚡ Тестирование производительности

### Сценарий 3: Концептуальные примеры для продакшена

**Время выполнения:** ~3 минуты

```bash
# Посмотрите примеры для полной интеграции
./demo-trpc-calls.sh
```

**Что демонстрируется:**
- 🔮 Примеры с полным tRPC HTTP адаптером
- 📡 GET запросы для query операций
- 📤 POST запросы для mutations
- 🔄 Batch запросы
- 🌐 WebSocket subscriptions
- 📚 Инструкции по интеграции

## 🧪 Ручные тесты

### Тест 1: Основные endpoints

```bash
# Информация о приложении
curl http://localhost:3000/api

# Схема tRPC роутера
curl http://localhost:3000/api/trpc-schema
```

### Тест 2: Query операции

```bash
# Получить всех пользователей
curl -X POST http://localhost:3000/api/trpc/users.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Получить всех постов
curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Получить пользователя по ID
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# Поиск пользователей
curl -X POST http://localhost:3000/api/trpc/users.search \
  -H "Content-Type: application/json" \
  -d '{"query": "john"}'
```

### Тест 3: Mutation операции

```bash
# Создать нового пользователя
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "age": 28}'

# Создать новый пост
curl -X POST http://localhost:3000/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo Post", "content": "This is a demo post!", "authorId": 1}'

# Обновить пост
curl -X POST http://localhost:3000/api/trpc/posts.update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Updated Title", "content": "Updated content"}'
```

### Тест 4: Обработка ошибок

```bash
# Несуществующая процедура
curl -X POST http://localhost:3000/api/trpc/invalid.method \
  -H "Content-Type: application/json" \
  -d "{}"

# Неверный формат процедуры
curl -X POST http://localhost:3000/api/trpc/invalidformat \
  -H "Content-Type: application/json" \
  -d "{}"

# Несуществующий пользователь
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 999}'
```

## 🎨 Демонстрация для презентации

### Слайд 1: Введение
```bash
# Покажите основную информацию
curl http://localhost:3000/api | python3 -m json.tool
```

### Слайд 2: Простота использования
```bash
# Покажите как легко вызвать процедуру
curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}" | python3 -m json.tool
```

### Слайд 3: Валидация данных
```bash
# Покажите создание с валидацией
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com", "age": 25}' | python3 -m json.tool
```

### Слайд 4: Обработка ошибок
```bash
# Покажите graceful error handling
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 999}' | python3 -m json.tool
```

## 📊 Анализ производительности

### Время отклика одиночных запросов

```bash
# Измерьте время отклика
time curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}" > /dev/null 2>&1
```

### Множественные запросы

```bash
# Тест множественных вызовов
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/trpc/users.getAll \
    -H "Content-Type: application/json" \
    -d "{}" -s -w "Request $i: %{time_total}s\n" -o /dev/null
done
```

### Нагрузочное тестирование (если установлен ab)

```bash
# Apache Bench тестирование (опционально)
ab -n 100 -c 10 -T 'application/json' -p data.json \
   http://localhost:3000/api/trpc/posts.getAll
```

Где `data.json` содержит: `{}`

## 🔧 Настройка для разных сценариев

### Разработка

```bash
# Запуск в режиме разработки
npm run start:dev
```

### Продакшн

```bash
# Сборка для продакшена
npm run build

# Запуск продакшн версии
npm start
```

### Дебаг

```bash
# Запуск с расширенным логированием
DEBUG=* npm start
```

## 📝 Пример ответов

### Успешный ответ

```json
{
  "procedure": "posts.getAll",
  "input": {},
  "result": [
    {
      "id": 1,
      "title": "First Post",
      "content": "This is the first post content",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-06-04T16:52:54.411Z"
}
```

### Ответ с ошибкой

```json
{
  "error": "Router 'invalid' not found. Available: users, posts",
  "procedure": "invalid.method",
  "timestamp": "2025-06-04T16:53:00.123Z"
}
```

## 🎯 Ключевые моменты для демонстрации

1. **Простота интеграции**: Достаточно добавить декораторы к существующим контроллерам
2. **Автоматическая генерация**: tRPC роутеры создаются автоматически
3. **Типобезопасность**: Полная поддержка TypeScript
4. **Валидация**: Интеграция с Zod из коробки
5. **DI совместимость**: Работает с существующей DI системой NestJS
6. **Гибкость**: Поддерживает query, mutation и subscription
7. **Производительность**: Минимальные накладные расходы

## 🚨 Частые проблемы

### Сервер не запускается
```bash
# Проверьте порт
lsof -i :3000

# Убийте процесс если нужно
pkill -f "node.*nest"
```

### Ошибки curl
```bash
# Убедитесь что сервер запущен
curl http://localhost:3000/api

# Проверьте формат JSON
echo '{"id": 1}' | python3 -m json.tool
```

### Зависимости
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

## 💡 Дополнительные ресурсы

- [tRPC Documentation](https://trpc.io)
- [NestJS Documentation](https://nestjs.com)
- [Zod Documentation](https://zod.dev)
- [TypeScript Documentation](https://typescriptlang.org)

---

**Удачной демонстрации! 🎉** 