// Bootstrap: build the city picker on the menu, wire the buttons, create the
// game.
(function () {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);
  window.__game = game; // exposed for debugging / automated smoke tests

  const cities = Object.values(window.CITIES || {});
  const select = document.getElementById('city-select');
  const descEl = document.getElementById('city-desc');
  const listEl = document.getElementById('city-highlights');

  function renderCity(city) {
    descEl.textContent = city.description;
    listEl.innerHTML = '';
    city.highlights.forEach((h, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${h.name}`;
      listEl.appendChild(li);
    });
    let best = null;
    try { best = parseFloat(localStorage.getItem('feriespill.best.' + city.id)); }
    catch (e) { /* ignore */ }
    const bestEl = document.getElementById('city-best');
    bestEl.textContent = best ? 'Best time: ' + Utils.formatTime(best) : '';
  }

  cities.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}, ${c.country}`;
    select.appendChild(opt);
  });

  const cityById = (id) => cities.find((c) => c.id === id);
  if (cities.length) renderCity(cities[0]);
  select.addEventListener('change', () => renderCity(cityById(select.value)));

  document.getElementById('start-btn').addEventListener('click', () => {
    game.start(cityById(select.value) || cities[0]);
  });

  document.getElementById('again-btn').addEventListener('click', () => {
    game.start(game.city);
  });
  document.getElementById('menu-btn').addEventListener('click', () => {
    document.getElementById('finish').classList.remove('show');
    document.getElementById('menu').classList.add('show');
    game.state = 'menu';
    renderCity(game.city || cities[0]);
  });
})();
