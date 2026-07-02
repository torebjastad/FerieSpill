# FerieSpill — City Explorer Racing Game

A top-down, loop-track driving game with the theme of **exploring a city and the
areas around it**. You race a car around a compressed-but-recognizable circuit
that strings together the city's highlights. At each highlight you must answer
one question about it before you may drive on. Goal: visit **all** highlights and
return to **START** as fast as possible.

First city shipped: **Bergen, Norway** (fits the "ferie" / holiday theme). The
game is data-driven so more cities can be added later.

## Core rules

- Loop track, viewed top-down. The whole track is **not** always on screen — the
  camera pans/follows the car, with a minimap for orientation.
- Visit every highlight (any order). Reaching one and slowing down opens a quiz.
- Each highlight has a **pool** of questions; one is picked at random per visit
  and the answer options are shuffled, so runs can't be memorised.
- Answer correctly to unlock the highlight. Every wrong answer adds a **+5s time
  penalty** (shown live and broken out on the finish screen) so facts pay off.
- Once all highlights are visited, drive back to START to finish. Best time
  (drive time + penalties) is saved per city. Cities shipped: Bergen, Stavanger.

## Driving feel (physics)

Arcade-realistic top-down model (world-space velocity, not just "point & move"):

1. Steering rotates the car's heading (steering authority scales with speed).
2. Current velocity is split into a **forward** and a **lateral** component
   relative to the new heading.
3. Engine/brake act on the forward component; rolling resistance + quadratic
   drag bleed off speed.
4. The lateral component is decayed by a **grip** coefficient each frame:
   - high grip → the car quickly aligns with its heading (no slide),
   - low grip (or a sharp turn at high speed) → lateral velocity persists → the
     car **slides / drifts**.
5. Handbrake drops grip hard (deliberate drifting); off-road (grass) lowers grip
   and adds drag, so cutting corners is punished.
6. On the gas you keep steering authority even from a standstill, and flooring it
   into a hard turn at low speed breaks traction (wheelspin) — so you can spin
   the car around on the spot if you're pointing the wrong way.

Tight mountain switchbacks up to Fløyen and Ulriken are where sliding matters.
Each highlight has a little "lollipop" side road (a spur to a cul-de-sac loop),
so you reach it on tarmac instead of driving across the grass.

Touch input is hardened for iOS: steering/pedals are tracked on `window` with
up/cancel/blur/visibility fallbacks (the stick can't freeze offset), and pinch /
double-tap / gesture zoom are blocked (no getting stuck zoomed in).

## Architecture

Plain HTML5 Canvas + vanilla JS, no build step — open `index.html` (or serve the
folder) and play. Classic `<script>` tags share a small global namespace so it
runs straight from disk.

```
index.html
css/style.css
js/
  utils.js         math helpers (clamp, lerp, Catmull-Rom spline, point-segment dist)
  input.js         keyboard + on-screen touch controls
  camera.js        smooth follow + look-ahead, world<->screen transform
  car.js           the drift physics + car rendering
  track.js         spline road from waypoints, water/decor, off-road test, drawing
  minimap.js       whole-track overview with car / highlights
  quiz.js          highlight quiz modal
  game.js          state machine (menu/driving/quiz/finished), loop, HUD, timing
  cities/bergen.js Bergen city data
  main.js          bootstrap + city select
```

## City data format (`window.CITIES[id]`)

```js
{
  id, name, country, description,
  theme: { land, sea, water, road, roadLine, ... },   // colors
  roadWidth,
  startIndex,                        // optional waypoint for the start line
                                     // (pick a stretch clear of highlights)
  waypoints: [ {x, y}, ... ],        // closed loop centerline (Catmull-Rom)
  water:   [ { type:'sea'|'water'|'lake', points:[{x,y},...] }, ... ],
  parks:   [ [ {x,y}, ... ], ... ],
  buildings: [ {x,y,w,h,color?}, ... ],
  highlights: [
    { id, name, x, y, radius, blurb,
      questions: [ { q, options:[...], answer: <index> }, ... ] },  // a pool
    ...
  ]
}
```

Positions are compressed/adapted from real geography for fun, not to scale.

## Roadmap / possible extensions

- More cities (each is one data file).
- Ghost car / leaderboard via `localStorage`.
- Richer touch controls, engine/skid audio.
