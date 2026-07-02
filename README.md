# FerieSpill

A top-down webpage car game about **exploring a city and the areas around it**.
Race a loop track that strings together the city's highlights — visit every one,
answer a question about it, then drive back to **START** as fast as you can.

Cities: **Bergen** 🇳🇴 (the fjord, Bryggen, Fløyen, Ulriken…) and **Stavanger**
🇳🇴 (the old town, Sverd i fjell, Preikestolen, the Lysefjord…). Each highlight
has a pool of questions picked at random, and wrong answers cost +5 seconds.

## Play

No build step. Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

**Controls:**
- *Desktop:* Arrow keys / WASD to drive, Space for the handbrake (drift the
  mountain hairpins!).
- *Phone (best in landscape):* a two-thumb layout — drag your **left thumb**
  anywhere on the left to steer (analog: a little for gentle curves, a lot to
  throw it into a slide), and use the **GAS / BRAKE / DRIFT** pedals on the
  right. Light haptics on drift and correct answers.

Slow down inside a highlight's ring to trigger its question — answer correctly to
drive on. Each visit draws a random question from that highlight's pool (options
shuffled). The clock keeps running while the quiz is open, and every wrong answer
adds +5 seconds on top — so answer fast and know your facts.

## How it works

The car uses an arcade drift model: steering rotates the heading, then the
velocity's sideways component is bled off by a grip factor — turn too hard (or
hit the handbrake / go off-road) and the car slides. See `PLAN.md` for the design
and the city-data format used to add more cities.
