# Kanishka frontend

Astro + TypeScript + React. Это основное приложение сайта; результат сборки находится в `../dist`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
```

Разработка/просмотр: http://127.0.0.1:8081/. Astro 7 запускает dev-сервер в фоне; остановка — `pnpm exec astro dev stop`. Для просмотра сборки используйте `pnpm preview` после остановки dev-сервера.

Общая архитектура, данные и ограничения описаны в `../README.md`, полный стек и следующие задачи — в `../FRONTEND.md`.

## Watermelon UI

- `src/components/ui/accordion-1.tsx` — адаптация Watermelon accordion-1; состояние контролирует ProductExperience.
- `src/components/ui/accordion-1.original.tsx` — сохранённый исходный пример.
- `src/components/ui/accordion.tsx` — примитив shadcn/Radix.
- `watermelon-accordion.registry.json` — официальный registry payload; `components.json` — namespace `@watermelon`.
- `src/styles.css` — Tailwind 4 utilities без глобального reset, чтобы сохранить брендовые стили.

React теперь собирается официальной интеграцией `@astrojs/react`. Ручного window.kanishkaUI, createRoot-обёртки и старого IIFE-бандла в активном сайте больше нет.

Registry endpoint ранее отвечал HTTP 403; тот же payload получен из официального GitHub Watermelon. MIT-лицензия сохранена в `WATERMELON-LICENSE`.

Источники:

- [Watermelon installation](https://ui.watermelon.sh/installation)
- [Framework requirements](https://ui.watermelon.sh/framework-support)
- [Watermelon accordion](https://github.com/WatermelonCorp/watermellon-registry/blob/main/public/r/accordion-1.json)
- [shadcn MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)
