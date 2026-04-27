# Мультатор 2

Платформа для аниматоров и художников: публикация работ, пиксельный редактор, социальные функции (подписки, лайки, достижения).

**Стек:** Next.js 16 · React 19 · Supabase · Tailwind CSS v4 · shadcn/ui · TypeScript

---

## Требования

- Node.js ≥ 20
- npm ≥ 10
- Проект в [Supabase](https://supabase.com) (бесплатный тир подходит)

---

## Установка

```bash
git clone https://github.com/<org>/multator2-46.git
cd multator2-46
npm install
```

Скопируйте файл с переменными окружения и заполните значения:

```bash
cp .env.example .env.local
```

Минимально необходимые переменные (см. [.env.example](.env.example)):

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |

---

## База данных

Схема базы данных хранится в Supabase. Примените миграции через SQL-редактор в [Supabase Dashboard](https://supabase.com/dashboard) или через CLI:

```bash
npx supabase db push
```

Row Level Security (RLS) включён на всех таблицах — настройте политики согласно вашему проекту.

---

## Запуск

### Разработка

```bash
npm run dev
```

Приложение доступно на [http://localhost:3000](http://localhost:3000).

При локальной разработке OAuth-редирект Supabase нужно настроить на `http://localhost:3000/auth/callback`. Для переопределения адреса без изменения настроек Supabase задайте:

```env
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Продакшн-сборка

```bash
npm run build
npm run start
```

---

## Тесты

### Unit / integration (Vitest)

```bash
npm test              # однократный прогон
npm run test:watch    # watch-режим
```

Тесты находятся в `lib/actions/__tests__/` и `app/auth/callback/__tests__/`.

### E2E (Playwright)

```bash
npx playwright install  # один раз — загружает браузеры
npm run test:e2e        # headless
npm run test:e2e:ui     # интерактивный UI
```

E2E-тесты находятся в `e2e/`. Перед запуском приложение должно быть поднято (или Playwright поднимет его сам через `npm run dev`).

---

## Структура проекта

```
app/                  # Next.js App Router — страницы и маршруты
  auth/               # Авторизация (login, signup, callback)
  editor/             # Пиксельный редактор
  oldschool/          # Галерея работ — анимации
  sandbox/            # Галерея работ — рисунки
  profile/[username]/ # Профиль пользователя
  work/[id]/          # Страница отдельной работы
  admin/              # Панель администратора
  moderation/         # Модерация контента
components/           # Переиспользуемые React-компоненты
lib/
  actions/            # Server Actions (публикация, настройки, отзывы)
  auth/               # Контекст аутентификации
  fetchers.ts         # SWR-фетчеры
  i18n/               # Интернационализация (ru / en)
  logger.ts           # Обёртка над Sentry
  providers/          # React-провайдеры
  supabase/           # Клиент и серверный клиент Supabase
  types.ts            # Общие TypeScript-типы
e2e/                  # Playwright E2E-тесты
```

---

## Мониторинг ошибок (опционально)

Проект интегрирован с [Sentry](https://sentry.io). Для включения задайте в `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

Без этих переменных Sentry молча отключается.

---

## Документация

- [Дизайн-система](DESIGN_SYSTEM.md) — токены, типографика, цвета, доступность
- [Интеграция DiceBear API](API_INTEGRATION.md) — генерация аватаров
