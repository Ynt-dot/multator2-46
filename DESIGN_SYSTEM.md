# Design System «Мультатор 2»

## 1. ЦВЕТОВАЯ ПАЛИТРА

### 1.1 Акцентные цвета (Primary)
**Философия:** Тёплая, ностальгическая палитра, вдохновлённая золотым часом, закатом и винтажными мультфильмами 2000-х.

| Название | Hex | RGB | Использование |
|----------|-----|-----|-----------------|
| **Sunset Gold** | `#D4A574` | rgb(212, 165, 116) | Основной акцент, выделение, логотип, CTA кнопки |
| **Warm Amber** | `#F0A860` | rgb(240, 168, 96) | Вторичный акцент, ховеры, активные состояния |
| **Coral Rose** | `#E87A6B` | rgb(232, 122, 107) | Эмоции, награды, медали, положительные уведомления |
| **Dusty Plum** | `#8B6F7F` | rgb(139, 111, 127) | Аккордный акцент, глубина, модерация контента |

**Palette Harmony:**
- Sunset Gold + Coral Rose = тёплое наследие, креативность
- Warm Amber + Dusty Plum = баланс энергии и созерцания

---

### 1.2 Нейтральная шкала (Grays)
**Философия:** Мягкие, обогащённые серые с еле заметным тёплым подтоном (к белому добавлена капля Gold).

| Уровень | Hex | RGB | Использование |
|---------|-----|-----|-----------------|
| **White (Surface)** | `#FEFDFB` | rgb(254, 253, 251) | Основной фон, карточки, модальные окна |
| **Gray 50** | `#F8F7F4` | rgb(248, 247, 244) | Лёгкий фон, неактивные области |
| **Gray 100** | `#F0EFEA` | rgb(240, 239, 234) | Контейнеры, разделители |
| **Gray 200** | `#E5E3DC` | rgb(229, 227, 220) | Границы, линии, слабый фон |
| **Gray 300** | `#D4D1C7` | rgb(212, 209, 199) | Границы форм, неактивные элементы |
| **Gray 400** | `#B8B3A7` | rgb(184, 179, 167) | Вспомогательный текст, подсказки |
| **Gray 500** | `#9D9790` | rgb(157, 151, 144) | Placeholder text |
| **Gray 600** | `#6F6B65` | rgb(111, 107, 101) | Основной текст, заголовки (при необходимости) |
| **Gray 700** | `#4A4741` | rgb(74, 71, 65) | Сильный текст, контрастные элементы |
| **Gray 800** | `#2F2D29` | rgb(47, 45, 41) | Максимальный контраст, редко |
| **Black (Text)** | `#1A1815` | rgb(26, 24, 21) | Основной текст для всего контента |

---

### 1.3 Семантические цвета
| Семантика | Hex | RGB | Назначение |
|-----------|-----|-----|-----------|
| **Success** | `#6DBE7E` | rgb(109, 190, 126) | Успешные операции, загрузки, подтверждения |
| **Warning** | `#F5A623` | rgb(245, 166, 35) | Внимание, рисковые действия, предупреждения |
| **Error/Danger** | `#E74C3C` | rgb(231, 76, 60) | Ошибки, удаления, критические события |
| **Info** | `#5B9DBB` | rgb(91, 157, 187) | Информационные сообщения, подсказки |
| **Highlight** | `#FFE5B4` | rgb(255, 229, 180) | Мягкая подсветка, баннеры анонсов |

---

## 2. ТИПОГРАФИЧЕСКАЯ ШКАЛА

### Шрифты
- **Display/Brand:** `Georgia` или `Playfair Display` (для заголовков, логотипа) — изысканность, ностальгия
- **Heading:** `Source Serif Pro` (заголовки) — читаемость с характером
- **Body:** `Inter` или `Lato` (основной текст) — дружелюбный, современный
- **Code/Monospace:** `JetBrains Mono` (если нужны технические элементы)

### Шкала размеров и высоты строк

| Уровень | Размер | Вес | Высота строки | Использование |
|---------|--------|-----|---------------|---------------|
| **H1 (Hero)** | 48px | 700 | 1.2 | Заголовки страниц, главные логотипы |
| **H2 (Section)** | 36px | 600 | 1.3 | Основные секции, области контента |
| **H3 (Subsection)** | 28px | 600 | 1.4 | Подзаголовки, названия проектов |
| **H4 (Card)** | 24px | 600 | 1.4 | Заголовки карточек, категории |
| **H5 (Label)** | 18px | 600 | 1.5 | Подтекст, метки |
| **Body Large** | 16px | 400 | 1.6 | Основной контент, описания |
| **Body Regular** | 14px | 400 | 1.6 | Стандартный текст |
| **Body Small** | 12px | 400 | 1.5 | Подсказки, комментарии, мета-информация |
| **Caption** | 11px | 400 | 1.4 | Очень мелкий текст, временные метки |

### Буквенный интервал
- Заголовки: -0.5px (слегка утрамбованные)
- Основной текст: 0px (нормальный)
- Метки/кнопки: +0.5px (немного разреженные, официальные)

---

## 3. ШКАЛА ОТСТУПОВ И РАЗМЕРОВ

**Базовая единица:** 4px (часто называют 1 unit)

| Размер | Px | Использование |
|--------|----|----|
| **xs** | 4px | Микро-отступы между элементами |
| **sm** | 8px | Отступы внутри компонентов (padding кнопок) |
| **md** | 12px | Стандартный отступ между элементами |
| **lg** | 16px | Отступы между блоками контента |
| **xl** | 24px | Отступы между большими секциями |
| **2xl** | 32px | Большие интервалы, разделители |
| **3xl** | 48px | Макро-отступы между секциями |
| **4xl** | 64px | Очень большие интервалы, героические зоны |

---

## 4. ШКАЛА РАДИУСОВ И СКРУГЛЕНИЯ

| Размер | Px | Использование |
|--------|----|----|
| **sharp** | 0px | Прямые углы (редко) |
| **xs** | 2px | Очень мелкие элементы (иконки, чекбоксы) |
| **sm** | 4px | Малые скругления (кнопки, поля ввода) |
| **md** | 8px | Стандартное скругление (карточки, модали) |
| **lg** | 12px | Мягкое скругление (большие контейнеры) |
| **xl** | 16px | Более дружелюбное, мечтательное (основные карточки) |
| **full** | 9999px | Пиллы, аватары, полностью закруглённые элементы |

**Философия:** Закруглённые, "мягкие" углы во всём — отражение дружелюбного и мечтательного духа.

---

## 5. ШКАЛА ТЕНИ И ГЛУБИНЫ

| Уровень | CSS | Использование |
|---------|-----|--------|
| **None** | none | Плоские элементы |
| **xs** | `0 1px 2px rgba(26, 24, 21, 0.05)` | Едва заметные разделения |
| **sm** | `0 2px 4px rgba(26, 24, 21, 0.08)` | Лёгкое поднятие (хувер) |
| **md** | `0 4px 12px rgba(26, 24, 21, 0.12)` | Карточки, модальные окна |
| **lg** | `0 8px 24px rgba(26, 24, 21, 0.16)` | Выпадающие меню, поплавки |
| **xl** | `0 12px 40px rgba(26, 24, 21, 0.20)` | Диалоги, очень важные элементы |

**Особенность:** Тени используют чёрный (#1A1815) с переменной прозрачностью для мягкости, а не резкости.

---

## 6. КОМПОНЕНТЫ

### 6.1 Button (Кнопка)

**Варианты:**
- **Primary (Sunset Gold):** основные действия (создать рисунок, загрузить)
- **Secondary (Coral Rose):** вторичные действия (лайк, награда)
- **Tertiary (White + Border):** дружественные, мягкие действия
- **Danger (Error Red):** удаления, критические операции
- **Ghost (Text only):** ссылки, навигация

**States:**
- Default → Hover (slight scale, shadow sm→md) → Active (pressed down) → Disabled (Gray 300)

**Пример CSS:**
```css
.btn-primary {
  background: #D4A574;
  color: #1A1815;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #F0A860;
  box-shadow: 0 2px 4px rgba(26, 24, 21, 0.08);
  transform: scale(1.02);
}
.btn-primary:active {
  transform: scale(0.98);
}
```

---

### 6.2 Card (Карточка работы)

**Структура:**
- **Header:** Аватар автора + имя + дата
- **Image:** Превью рисунка/анимации (aspect ratio 4:3 или 1:1)
- **Title:** Название работы (H4)
- **Meta:** Количество просмотров, лайков, комментариев
- **Footer:** Кнопки действия (лайк, открыть, поделиться)

**States:**
- Default (shadow md, border gray 200)
- Hover (shadow lg, border warm amber, slight lift)
- Featured/Popular (Highlight yellow border)

---

### 6.3 Avatar & User Badge

- **Size:** xs (24px), sm (32px), md (48px), lg (64px)
- **Border:** Мягкий скругление (full)
- **Badge:** Маленький значок в углу (moderator, artist, gold level)
- **Fallback:** Инициалы на нейтральном фоне (Gray 200)

---

### 6.4 Input & Form Fields

**Text Input:**
- Border: 1px Gray 300
- Focus: Border Sunset Gold (2px), shadow xs
- Placeholder: Gray 500
- Padding: sm (8px)
- Radius: sm (4px)

**Textarea (для описания работ):**
- Larger padding (md)
- Resize: vertical только
- Line-height: 1.6

**Checkbox & Radio:**
- Размер: 18px × 18px
- Border: 2px Gray 300
- Checked: Background Warm Amber, border none
- Label: Gray 700

---

### 6.5 Badge & Tag

**Медали и награды:**
- Coral Rose фон
- Иконка + текст
- Radius: full (пиллы)
- Sizes: sm (22px высота), md (28px)

**Теги (категории, жанры):**
- Background: Gray 50
- Border: 1px Gray 300
- Text: Gray 600
- Radius: md

---

### 6.6 Navigation (Основная навигация)

- **Top Bar:** Светлая (White/Gray 50), sticky
- **Logo:** Sunset Gold, Georgia 36px
- **Nav Items:** Горизонтальные, hover → underline Warm Amber
- **Active:** Underline Sunset Gold, bold
- **User Menu:** Выпадающее (dropdown), shadow lg

**Мобильная версия:** Hamburger меню, slide-out панель

---

### 6.7 Modal & Dialog

- **Overlay:** rgba(26, 24, 21, 0.4) (полупрозрачный чёрный)
- **Modal body:** White background, border-radius lg
- **Header:** H2 на White + close icon (top-right)
- **Content:** Padding xl, Gray 700 text
- **Actions:** Button row (Primary + Secondary) внизу
- **Animation:** Fade in + scale up (smooth)

---

### 6.8 Notification & Toast

**Варианты:**
- Success (Green background, Coral Rose icon)
- Warning (Yellow background)
- Error (Red background)
- Info (Blue background)

**Структура:**
- Icon + Message + Close button
- Position: fixed, bottom-right (24px margin)
- Auto-dismiss: 4 секунды для Success, 6 для Error
- Animation: Slide in from right, fade out

---

### 6.9 Rating & Like Widget

**Like Button:**
- Иконка (пустое или заполненное сердце)
- Рядом счётчик лайков
- Color: Default Gray 400 → Hover/Active Coral Rose
- Animation: Масштабирование при клике (0.9 → 1.1 → 1.0)

**5-star Rating (для медалей):**
- 5 звёзд, желтые (Warm Amber)
- Интерактивные (можно ставить оценку)
- Текст рядом "Amazing work!" в зависимости от количества звёзд

---

### 6.10 Breadcrumb & Navigation Path

- Разделители: "/" или ">"
- Color: Gray 600
- Active (последний): Sunset Gold, bold
- Hover: Underline

**Пример:** Home / Gallery / My Animations / "Dancing Cat"

---

## 7. ПРИНЦИПЫ ДИЗАЙНА

### 7.1 Принцип 1: Ностальгический оптимизм
**Суть:** Дизайн вызывает чувство возвращения домой, в безопасное и дружелюбное место. Каждый элемент напоминает о тёплых воспоминаниях о совместном творчестве 2000-х, но с современным удобством.

**Реализация:**
- Используй тёплые цвета (Sunset Gold, Coral Rose)
- Мягкие скругления, никаких острых углов
- Письмо в первом лице ("я создам", "наш", "вместе")
- Иконки с характером, немного стилизованные

---

### 7.2 Принцип 2: Иерархия через тепло
**Суть:** Самые важные элементы (CTA, новые работы) получают наиболее тёплые цвета. Второстепенные элементы и фон — нейтральные. Это создаёт естественную визуальную иерархию.

**Реализация:**
- Primary CTA: Sunset Gold (#D4A574)
- Secondary: Warm Amber (#F0A860)
- Tertiary/Support: Gray shades
- Alerts & achievements: Coral Rose (#E87A6B)

---

### 7.3 Принцип 3: Мягкость во всём
**Суть:** Нет жёстких переходов. Тени мягкие, границы закруглены, пространство дышит, типографика читаема без усилий.

**Реализация:**
- Border-radius от 4px до 16px (никогда 0)
- Тени с низкой контрастностью и размытием
- Padding/margin: всегда кратно 4px (система отступов)
- Line-height ≥ 1.5 для основного текста
- Letter-spacing: не сжимать (−0.5px максимум для заголовков)

---

### 7.4 Принцип 4: Пространство — это искусство
**Суть:** Вместо плотной информации используй generous negative space. Это создаёт спокойствие и позволяет глазу отдохнуть между элементами. Особенно важно для галереи работ.

**Реализация:**
- Карточки в сетке (grid) с gap xl (24px)
- Секции отделены 2xl или 3xl (32–48px)
- Мобильная версия: компактнее, но не переполненно
- Контейнеры max-width 1200px для читаемости

---

### 7.5 Принцип 5: Доступность — по умолчанию
**Суть:** Контраст ≥ 4.5:1 для основного текста, ≥ 3:1 для крупного. Фокусные состояния видны (outline 2px, colour #D4A574). Никаких иконок без label.

**Реализация:**
- WCAG AA compliance минимум
- Focus indicator: 2px solid Sunset Gold
- Alt text для всех изображений
- Семантический HTML (nav, main, article, etc.)
- Keyboard navigation по всему интерфейсу

---

### 7.6 Принцип 6: Прагматизм в движении
**Суть:** Анимации не слоу и не быстро (200-300ms), они поддерживают действие пользователя, а не отвлекают. Respects prefers-reduced-motion.

**Реализация:**
- Transition: 0.2s ease (стандарт для hover)
- Duration: 0.3s для более больших изменений
- Ease функции: ease, ease-in-out (не linear)
- CSS-only для основных эффектов (лучше производительность)
- `@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none; } }`

---

### 7.7 Принцип 7: Творческое самовыражение в деталях
**Суть:** Дизайн не навязывает эстетику, а служит творчеству пользователя. Детали (иконки, разделители, украшения) имеют "рукотворный" характер.

**Реализация:**
- Иконки: слегка асимметричные, с характером (не Material Design flat)
- Разделители: не просто линии, а мягкие градиенты (Gray 200 → Gray 100)
- Декоративные элементы на фоне (случайно расположённые мазки, геометрические формы)
- Каллиграфические элементы для заголовков (Georgia italic)

---

### 7.8 Принцип 8: Сообщество — в центре
**Суть:** UI отражает социальный характер платформы. Аватары, имена, взаимодействия видны везде. Ничто не анонимно, но и не навязчиво.

**Реализация:**
- Карточки работ всегда показывают автора (аватар + имя)
- Социальные действия (лайк, комментарий) видны и доступны
- Рейтинги и лидерборды — сбалансированы (не конкурентны, а вдохновляющи)
- Награды (медали) — эмоциональны и осмысленны

---

### 7.9 Принцип 9: Тёмная тема — параллельная реальность
**Суть:** Тёмная тема не просто инверсия. Это отдельный мир с собственными закрытыми оттенками (темный Sunset Gold, темный Dusty Plum). Для позднего вечера творчества.

**Реализация (для будущего):**
- Background: #1A1815 (очень тёмный, почти чёрный)
- Surface: #2F2D29, #4A4741 (тёмные серые)
- Text: #FEFDFB (почти белый)
- Accent: #D4A574 (тот же Gold, но светлее на тёмном)
- Использовать CSS custom properties (var(--color-primary))

---

### 7.10 Принцип 10: Краудфандинг в дизайне
**Суть:** Когда идёт сбор средств, это не скрывается, а показывается как часть истории. Прогресс-бары, счётчики, спасибо донорам — всё это интегрировано элегантно.

**Реализация:**
- Progress bar: Sunset Gold (fill) на Grey 100 (background)
- Donor wall: простой список с аватарами, без пафоса
- Milestone cards: "Достигли 50%! Спасибо за веру в мечту"
- Transparency: открытые цели, открытый счёт

---

## 8. ДОПОЛНИТЕЛЬНЫЕ РЕКОМЕНДАЦИИ

### Используемые шрифты (рекомендация)
```css
/* Display & Headers */
@font-face {
  font-family: 'Georgia Pro';
  src: url('/fonts/georgia-pro.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
}

/* Body */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-weight: 400;
}
```

### Dark Mode Variables
```css
:root {
  /* Light mode (default) */
  --color-primary: #D4A574;
  --color-secondary: #F0A860;
  --color-accent: #E87A6B;
  --color-background: #FEFDFB;
  --color-surface: #F8F7F4;
  --color-text: #1A1815;
  --color-border: #E5E3DC;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode */
    --color-primary: #D4A574;
    --color-background: #1A1815;
    --color-surface: #2F2D29;
    --color-text: #FEFDFB;
    --color-border: #4A4741;
  }
}
```

### Layout Grid
- Desktop: 12 columns, 24px gap
- Tablet: 8 columns, 16px gap
- Mobile: 4 columns, 12px gap
- Max-width: 1200px

### Accessibility Checklist
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text)
- [ ] Focus indicators visible (2px solid)
- [ ] All images have alt text
- [ ] Semantic HTML (nav, main, article, section)
- [ ] Form labels linked to inputs (for/id)
- [ ] Keyboard navigation works throughout
- [ ] No auto-playing audio/video
- [ ] Respects prefers-reduced-motion
- [ ] Font sizes ≥ 12px
- [ ] Touch targets ≥ 44px × 44px (mobile)

---

## 9. ПРИМЕРЫ КОМБИНАЦИЙ ЦВЕТОВ

**Вдохновляющая комбо (главная страница):**
- Background: White (#FEFDFB)
- Hero: Sunset Gold (#D4A574) + Georgia 48px
- CTA Button: Warm Amber (#F0A860)
- Supporting text: Gray 600 (#6F6B65)

**Галерея работ:**
- Card Background: White
- Card Border: Gray 200 (#E5E3DC)
- Card Hover: Border Warm Amber (#F0A860)
- Author name: Gray 700
- Like button: Coral Rose (#E87A6B) when active

**Форум/чат:**
- Message bubble (user): Light Gray 50 (#F8F7F4)
- Message bubble (other): Highlight (#FFE5B4) для особых постов модераторов
- Timestamp: Gray 500 (#9D9790)

**Модерация контента:**
- "Олдскул" (проверено): Coral Rose badge (#E87A6B)
- "Песочница" (новое): Dusty Plum badge (#8B6F7F)
- Warning banner: Warning color (#F5A623)

---

**Этот систем полностью готов к внедрению в Figma, код или дизайн-документацию.**
