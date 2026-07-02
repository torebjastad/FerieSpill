// Stavanger, Norway. Compressed/adapted geography: the old town and cathedral by
// the central Vågen harbour and Breiavatnet lake, Hafrsfjord (Sverd i fjell) to
// the south-west, and the Lysefjord country (Preikestolen, Kjerag) to the east.
// Not to scale — arranged into a fun loop.
window.CITIES = window.CITIES || {};

window.CITIES.stavanger = {
  id: 'stavanger',
  name: 'Stavanger',
  country: 'Norway',
  description:
    'Norway’s oil capital and the gateway to the Lysefjord. Race the old wooden ' +
    'town and harbour, then out to the swords of Hafrsfjord and the cliffs of ' +
    'Preikestolen and Kjerag.',

  theme: {
    land: '#8ab36a',
    sea: '#356f92',
    water: '#3d89ab',
    lake: '#4496b6',
    road: '#3b4046',
    roadEdge: '#2a2e33',
    roadLine: '#f0d64e',
    park: '#5ea24b',
    forest: '#4a8b3c',
    building: '#d6d2c4',
    buildingAlt: '#c96f4a'
  },

  roadWidth: 74,

  // Start line at the harbour waypoint (index 18) — a stretch clear of every
  // highlight ring, so no quiz fires the instant the race begins.
  startIndex: 18,

  waypoints: [
    { x: 760, y: 820 },   // 0  START (city centre, Domkirke / Breiavatnet)
    { x: 700, y: 720 },   // 1
    { x: 620, y: 640 },   // 2  Gamle Stavanger (old town)
    { x: 560, y: 760 },   // 3
    { x: 500, y: 940 },   // 4
    { x: 470, y: 1120 },  // 5  Sverd i fjell (Hafrsfjord)
    { x: 620, y: 1290 },  // 6
    { x: 860, y: 1360 },  // 7
    { x: 1140, y: 1380 }, // 8
    { x: 1420, y: 1330 }, // 9
    { x: 1660, y: 1240 }, // 10
    { x: 1860, y: 1120 }, // 11 Lysefjord / Kjerag
    { x: 1900, y: 900 },  // 12
    { x: 1800, y: 700 },  // 13
    { x: 1640, y: 560 },  // 14 Preikestolen
    { x: 1420, y: 520 },  // 15
    { x: 1200, y: 560 },  // 16
    { x: 1020, y: 640 },  // 17 Norsk Oljemuseum (harbour)
    { x: 880, y: 720 }    // 18 back toward START
  ],

  water: [
    // Open sea (Boknafjord) framing the coast to the north.
    { type: 'sea', points: [
      { x: -600, y: -600 }, { x: 2500, y: -600 }, { x: 2500, y: 120 },
      { x: 1700, y: 300 }, { x: 1000, y: 360 }, { x: 400, y: 420 },
      { x: -600, y: 520 }
    ]},
    // Vågen harbour.
    { type: 'water', points: [
      { x: 842, y: 742 }, { x: 828, y: 640 }, { x: 862, y: 558 },
      { x: 944, y: 558 }, { x: 966, y: 660 }, { x: 934, y: 742 }
    ]},
    // Breiavatnet (little city lake by the cathedral).
    { type: 'lake', points: [
      { x: 772, y: 900 }, { x: 852, y: 906 }, { x: 868, y: 956 },
      { x: 820, y: 986 }, { x: 760, y: 966 }
    ]},
    // Hafrsfjord (south-west).
    { type: 'water', points: [
      { x: 170, y: 1000 }, { x: 440, y: 1050 }, { x: 472, y: 1210 },
      { x: 380, y: 1360 }, { x: 170, y: 1380 }
    ]},
    // Lysefjord (east arm).
    { type: 'water', points: [
      { x: 1900, y: 1040 }, { x: 2260, y: 1015 }, { x: 2280, y: 1185 },
      { x: 1990, y: 1220 }, { x: 1900, y: 1160 }
    ]}
  ],

  parks: [
    // Byparken by Breiavatnet.
    [ { x: 880, y: 860 }, { x: 1000, y: 880 }, { x: 990, y: 1000 },
      { x: 870, y: 980 } ],
    // Preikestolen highland forest.
    [ { x: 1480, y: 340 }, { x: 1720, y: 360 }, { x: 1740, y: 520 },
      { x: 1500, y: 520 } ],
    // Kjerag / Lysefjord mountains.
    [ { x: 1980, y: 1230 }, { x: 2180, y: 1260 }, { x: 2160, y: 1470 },
      { x: 1960, y: 1440 } ]
  ],

  buildings: [
    // Gamle Stavanger — white wooden houses.
    { x: 470, y: 560, w: 26, h: 52, color: '#eef0ea' },
    { x: 502, y: 558, w: 26, h: 56, color: '#e6e8e0' },
    { x: 534, y: 560, w: 26, h: 50, color: '#f2f3ee' },
    { x: 470, y: 622, w: 26, h: 50, color: '#e6e8e0' },
    { x: 502, y: 622, w: 26, h: 54, color: '#eef0ea' },
    { x: 534, y: 622, w: 26, h: 48, color: '#dfe2d9' },
    // City centre / harbour.
    { x: 980, y: 780, w: 44, h: 44, color: '#c96f4a' },
    { x: 1030, y: 785, w: 40, h: 46, color: '#d9a441' },
    { x: 985, y: 835, w: 46, h: 42, color: '#b7c0cc' },
    // Petroleum museum (distinctive metallic block).
    { x: 1060, y: 560, w: 70, h: 44, color: '#9fb0bd' },
    { x: 1112, y: 546, w: 24, h: 24, color: '#d0d8de' }
  ],

  highlights: [
    {
      id: 'gamle', name: 'Gamle Stavanger',
      x: 540, y: 600, radius: 120,
      blurb: 'A district of around 170 preserved white wooden houses from the ' +
             '1700s–1800s, one of the best-kept wooden settlements in Northern Europe.',
      questions: [
        { q: 'What colour are the preserved old houses of Gamle Stavanger?',
          options: ['White', 'Bright red', 'Blue', 'Black'], answer: 0 },
        { q: 'The old houses of Gamle Stavanger are mostly built from what?',
          options: ['Wood', 'Brick', 'Concrete', 'Stone'], answer: 0 },
        { q: 'Gamle Stavanger’s houses mostly date from roughly which era?',
          options: ['The 1700s–1800s', 'The 1200s', 'The 1500s', 'The 1950s'], answer: 0 }
      ]
    },
    {
      id: 'sverd', name: 'Sverd i fjell',
      x: 400, y: 1180, radius: 120,
      blurb: 'Three giant bronze swords planted in the rock at Hafrsfjord, marking ' +
             'the battle where Norway was first united into one kingdom.',
      questions: [
        { q: 'The Sverd i fjell monument commemorates a great battle in which year?',
          options: ['872', '1066', '1349', '1905'], answer: 0 },
        { q: 'How many swords make up the Sverd i fjell monument?',
          options: ['Three', 'One', 'Seven', 'Twelve'], answer: 0 },
        { q: 'Which king united Norway after the Battle of Hafrsfjord?',
          options: ['Harald Fairhair', 'Olav the Holy', 'Harald Bluetooth',
                    'Erik the Red'], answer: 0 }
      ]
    },
    {
      id: 'kjerag', name: 'Lysefjord & Kjerag',
      x: 1962, y: 1118, radius: 122,
      blurb: 'The “light fjord” cuts deep into the mountains. High above hangs ' +
             'Kjeragbolten — a boulder wedged in a crevice almost 1000 m over the water.',
      questions: [
        { q: 'Kjeragbolten, high above the Lysefjord, is famously what?',
          options: ['A boulder wedged in a crevice', 'A waterfall', 'A church',
                    'A suspension bridge'], answer: 0 },
        { q: 'The name “Lysefjord” roughly means which of these?',
          options: ['The light fjord', 'The dark fjord', 'The cold fjord',
                    'The long fjord'], answer: 0 },
        { q: 'Roughly how far above the fjord is the Kjeragbolten boulder wedged?',
          options: ['Almost 1000 m', 'About 100 m', 'About 30 m', 'About 5000 m'], answer: 0 }
      ]
    },
    {
      id: 'preikestolen', name: 'Preikestolen (Pulpit Rock)',
      x: 1700, y: 458, radius: 122,
      blurb: 'A dramatic flat-topped cliff rising about 604 m straight above the ' +
             'Lysefjord — one of Norway’s most famous hikes.',
      questions: [
        { q: 'About how high does Preikestolen tower above the Lysefjord?',
          options: ['About 600 m', 'About 100 m', 'About 2000 m', 'About 50 m'], answer: 0 },
        { q: 'Preikestolen’s almost-flat top gives it which English nickname?',
          options: ['Pulpit Rock', 'Table Mountain', 'Sugarloaf', 'The Needle'], answer: 0 },
        { q: 'Over which fjord does Preikestolen tower?',
          options: ['Lysefjord', 'Geirangerfjord', 'Sognefjord', 'Oslofjord'], answer: 0 }
      ]
    },
    {
      id: 'oljemuseum', name: 'Norsk Oljemuseum',
      x: 1080, y: 540, radius: 120,
      blurb: 'On the harbour, the Norwegian Petroleum Museum tells the story of ' +
             'the country’s North Sea oil adventure — Stavanger is Norway’s oil capital.',
      questions: [
        { q: 'Stavanger is often called Norway’s capital of which industry?',
          options: ['Oil', 'Fishing', 'Timber', 'Textiles'], answer: 0 },
        { q: 'The Norwegian Petroleum Museum celebrates oil found in which sea?',
          options: ['The North Sea', 'The Baltic Sea', 'The Red Sea',
                    'The Caribbean Sea'], answer: 0 },
        { q: 'Norway’s offshore oil adventure began around which time?',
          options: ['The late 1960s', 'The 1820s', 'The 1920s', 'The 2010s'], answer: 0 }
      ]
    },
    {
      id: 'domkirke', name: 'Stavanger Domkirke',
      x: 820, y: 910, radius: 122,
      blurb: 'Beside the Breiavatnet lake stands Norway’s oldest cathedral still ' +
             'in use, begun around 1100 and dedicated to Saint Svithun.',
      questions: [
        { q: 'Stavanger Cathedral is Norway’s oldest what, still in use today?',
          options: ['Cathedral', 'Bridge', 'Lighthouse', 'Railway station'], answer: 0 },
        { q: 'In roughly which century was Stavanger Cathedral built?',
          options: ['The 1100s', 'The 1600s', 'The 1800s', 'The 1900s'], answer: 0 },
        { q: 'To which saint is Stavanger Cathedral dedicated?',
          options: ['Saint Svithun', 'Saint Olav', 'Saint Nicholas', 'Saint George'], answer: 0 }
      ]
    }
  ]
};
