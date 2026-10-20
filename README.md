# Парк «Зелена алея» — інтерактивна 3D-сцена (React Three Fiber)

## Запуск
```
npm install
npm run dev
```

## Публікація на GitHub Pages
```
npm run deploy
```
Потім GitHub → Settings → Pages → Branch: `gh-pages` / `(root)`.

## Керування
- W A S D / стрілки — їхати, Пробіл — гальмо
- H — фари (авто/увімк/вимк), C — камера (вільна/за авто), R — на старт
- Клік по лавці — переліт камери, можна посадити людину; клік по фонтану — вмикає/вимикає
- Панель праворуч: пора року, час доби, вітер, туман, колір авто, ліхтарі

## Структура
- `src/App.jsx` — Canvas, UI, цикл доби
- `src/store.js` — стан (zustand)
- `src/lib/` — розкладка парку (`layout.js`), день/ніч, пори року, текстури з canvas, геометрія
- `src/scene/` — 3D-компоненти (Car, Trees, Benches, Lamps, Fountain, Lighting, CameraRig...)
- `src/ui/` — інтерфейс (Panel, Hud)
- `public/textures/` — текстури (Poly Haven, CC0)
