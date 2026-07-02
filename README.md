# FerieSpill

A top-down webpage car game about **exploring a city and the areas around it**.
Race a loop track that strings together the city's highlights — visit every one,
answer a question about it, then drive back to **START** as fast as you can.

First stop: **Bergen, Norway** 🇳🇴 (the fjord, Bryggen, Fløyen, Ulriken and more).

## Play

No build step. Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

**Controls:** Arrow keys / WASD to drive, Space for the handbrake (drift the
mountain hairpins!). On touch devices, on-screen buttons appear. Slow down inside
a highlight's ring to trigger its question — answer correctly to drive on. Wrong
answers cost +5 seconds.

## How it works

The car uses an arcade drift model: steering rotates the heading, then the
velocity's sideways component is bled off by a grip factor — turn too hard (or
hit the handbrake / go off-road) and the car slides. See `PLAN.md` for the design
and the city-data format used to add more cities.
