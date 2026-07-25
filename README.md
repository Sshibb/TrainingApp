# FitTracker

Трекер тренировок на React Native (Expo). Тёмная тема, полное отслеживание прогресса.

## Фичи

- **Тренировки** — выбор упражнений по группам мышц, таймер, подсчёт подходов
- **Rest Timer** — автоматический обратный отсчёт между подходами (30с–3мин)
- **RPE** — оценка усилия для каждого подхода (1–10)
- **Личные рекорды** — автоматический расчёт PR и 1RM
- **Прогресс** — графики веса и объёма по каждому упражнению
- **Шаблоны** — сохраняй и запускай тренировки в один клик
- **Статистика** — streak, недельная активность, история
- **Предыдущие подходы** — показывает что было на прошлой тренировке

## Стек

- React Native + Expo SDK 52
- TypeScript
- React Navigation (bottom tabs + stack)
- AsyncStorage
- expo-haptics

## Запуск

```bash
npm install
npx expo run:android
```

## Структура

```
src/
├── components/
│   ├── RestTimer.tsx        — таймер отдыха
│   └── RPEPicker.tsx        — выбор RPE
├── screens/
│   ├── HomeScreen.tsx       — главная (стата, PR, история)
│   ├── NewWorkoutScreen.tsx — выбор упражнений
│   ├── ActiveWorkoutScreen.tsx — активная тренировка
│   ├── StatsScreen.tsx      — статистика
│   ├── TemplatesScreen.tsx  — шаблоны тренировок
│   └── ExerciseProgressScreen.tsx — прогресс упражнения
├── storage/storage.ts       — AsyncStorage + PR логика
├── data/exercises.ts        — 17 упражнений
├── types/types.ts           — TypeScript типы
└── navigation/AppNavigator.tsx — навигация
```
