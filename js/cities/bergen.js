// Bergen, Norway. Positions are compressed/adapted from the real geography:
// the fjord (Byfjorden) lies to the west, the Vågen harbour cuts in from the
// north, Bryggen lines its east side, and the mountains Fløyen & Ulriken rise
// to the east. Not to scale — arranged to make a fun loop.
window.CITIES = window.CITIES || {};

window.CITIES.bergen = {
  id: 'bergen',
  name: 'Bergen',
  country: 'Norway',
  description:
    'The gateway to the fjords and Norway’s "city of seven mountains". ' +
    'Race the harbour, the old Hanseatic wharf and the mountains around town.',

  theme: {
    land: '#84b06a',
    sea: '#2f6d8f',
    water: '#3a86a8',
    lake: '#3f93b3',
    road: '#3b4046',
    roadEdge: '#2a2e33',
    roadLine: '#f0d64e',
    park: '#5ea24b',
    forest: '#4f9040',
    building: '#c96f4a',
    buildingAlt: '#d9a441'
  },

  roadWidth: 74,

  // Closed loop centerline, roughly clockwise starting from the city centre.
  waypoints: [
    { x: 760, y: 980 },   // 0  START (Torgallmenningen, city centre)
    { x: 820, y: 840 },   // 1
    { x: 900, y: 760 },   // 2  head of Vågen — Fish Market
    { x: 1000, y: 690 },  // 3
    { x: 1120, y: 560 },  // 4  Bryggen wharf
    { x: 1080, y: 420 },  // 5
    { x: 1000, y: 300 },  // 6  Bergenhus Fortress (north tip)
    { x: 1130, y: 250 },  // 7  turn inland/east
    { x: 1360, y: 320 },  // 8  climbing
    { x: 1560, y: 430 },  // 9  Fløyen
    { x: 1630, y: 640 },  // 10 ridge road
    { x: 1710, y: 840 },  // 11
    { x: 1790, y: 1030 }, // 12 Ulriken
    { x: 1650, y: 1190 }, // 13 descend
    { x: 1410, y: 1250 }, // 14
    { x: 1170, y: 1230 }, // 15
    { x: 1050, y: 1120 }, // 16 KODE / Lille Lungegårdsvann
    { x: 900, y: 1070 },  // 17
    { x: 780, y: 1030 }   // 18 back toward START
  ],

  // Filled water polygons.
  water: [
    // Byfjorden / open fjord to the west and north.
    { type: 'sea', points: [
      { x: -900, y: -900 }, { x: 720, y: -900 }, { x: 720, y: 250 },
      { x: 660, y: 600 }, { x: 705, y: 1000 }, { x: 690, y: 1700 },
      { x: -900, y: 1700 }
    ]},
    // Vågen — the harbour inlet.
    { type: 'water', points: [
      { x: 955, y: 792 }, { x: 928, y: 640 }, { x: 945, y: 480 },
      { x: 985, y: 360 }, { x: 1050, y: 330 }, { x: 1092, y: 420 },
      { x: 1074, y: 560 }, { x: 1010, y: 690 }, { x: 986, y: 782 }
    ]},
    // Store Lungegårdsvann (larger city lake, south).
    { type: 'lake', points: [
      { x: 1230, y: 1330 }, { x: 1380, y: 1300 }, { x: 1500, y: 1360 },
      { x: 1520, y: 1470 }, { x: 1400, y: 1540 }, { x: 1250, y: 1500 },
      { x: 1200, y: 1410 }
    ]},
    // Lille Lungegårdsvann (small octagonal lake by KODE).
    { type: 'lake', points: [
      { x: 1160, y: 1030 }, { x: 1210, y: 1035 }, { x: 1235, y: 1070 },
      { x: 1228, y: 1110 }, { x: 1190, y: 1132 }, { x: 1148, y: 1120 },
      { x: 1128, y: 1082 }, { x: 1136, y: 1048 }
    ]}
  ],

  parks: [
    // Nygårdsparken (south-west).
    [ { x: 560, y: 1120 }, { x: 720, y: 1120 }, { x: 730, y: 1280 },
      { x: 560, y: 1300 } ],
    // Forest below Fløyen.
    [ { x: 1450, y: 250 }, { x: 1700, y: 300 }, { x: 1720, y: 520 },
      { x: 1500, y: 520 } ],
    // Slopes of Ulriken.
    [ { x: 1820, y: 900 }, { x: 2020, y: 980 }, { x: 2010, y: 1200 },
      { x: 1820, y: 1180 } ]
  ],

  // Flavour buildings (colourful Bergen facades).
  buildings: [
    { x: 1150, y: 470, w: 26, h: 60, color: '#c94a4a' },
    { x: 1185, y: 470, w: 26, h: 66, color: '#e0b23f' },
    { x: 1220, y: 470, w: 26, h: 58, color: '#d9762f' },
    { x: 1255, y: 470, w: 26, h: 64, color: '#e8e0d0' },
    { x: 1160, y: 545, w: 26, h: 60, color: '#7a9e46' },
    { x: 1195, y: 545, w: 26, h: 62, color: '#c94a4a' },
    { x: 1230, y: 545, w: 26, h: 56, color: '#e0b23f' },
    { x: 640, y: 900, w: 40, h: 40, color: '#d9a441' },
    { x: 690, y: 905, w: 44, h: 46, color: '#c96f4a' },
    { x: 640, y: 960, w: 46, h: 42, color: '#b7c0cc' },
    { x: 695, y: 965, w: 40, h: 40, color: '#d9a441' },
    { x: 980, y: 1030, w: 50, h: 44, color: '#b7c0cc' },
    { x: 1040, y: 1035, w: 46, h: 48, color: '#c96f4a' }
  ],

  highlights: [
    {
      id: 'fisketorget', name: 'Fisketorget (Fish Market)',
      x: 962, y: 792, radius: 110,
      blurb: 'A meeting place for merchants and fishermen since the 1200s, ' +
             'and one of Norway’s most visited outdoor markets.',
      question: {
        q: 'Roughly how many visitors does Bergen’s Fish Market draw each year?',
        options: ['Over 1 million', 'About 10,000', 'About 100,000', 'About 50 million'],
        answer: 0
      }
    },
    {
      id: 'bryggen', name: 'Bryggen',
      x: 1222, y: 540, radius: 110,
      blurb: 'The old wooden Hanseatic wharf, a UNESCO World Heritage Site and ' +
             'the postcard face of Bergen.',
      question: {
        q: 'Bryggen’s colourful wharf houses were built by merchants of which trading league?',
        options: ['The Hanseatic League', 'The Dutch East India Company',
                  'A Viking guild', 'The Roman Empire'],
        answer: 0
      }
    },
    {
      id: 'bergenhus', name: 'Bergenhus Festning',
      x: 908, y: 252, radius: 110,
      blurb: 'One of Norway’s oldest and best-preserved fortresses, guarding ' +
             'the mouth of the harbour since the Middle Ages.',
      question: {
        q: 'What is the great medieval royal hall at Bergenhus, built for King Håkon Håkonsson, called?',
        options: ['Håkonshallen', 'Holmenkollen', 'Frognerhallen', 'Nidarosdomen'],
        answer: 0
      }
    },
    {
      id: 'floyen', name: 'Fløyen',
      x: 1652, y: 382, radius: 115,
      blurb: 'A 400 m mountain right above town, reached by the Fløibanen ' +
             'funicular for sweeping views over the city and fjord.',
      question: {
        q: 'In which year did the Fløibanen funicular up Mount Fløyen open?',
        options: ['1918', '1885', '1950', '2001'],
        answer: 0
      }
    },
    {
      id: 'ulriken', name: 'Ulriken',
      x: 1892, y: 1058, radius: 115,
      blurb: 'The highest of Bergen’s seven city mountains, topped by a cable ' +
             'car station and a TV mast.',
      question: {
        q: 'Ulriken is the highest of the seven city mountains. About how tall is it?',
        options: ['643 m', '320 m', '200 m', '1500 m'],
        answer: 0
      }
    },
    {
      id: 'kode', name: 'KODE & Lille Lungegårdsvann',
      x: 1138, y: 1058, radius: 115,
      blurb: 'The cultural heart of town: the KODE art museums sit by the little ' +
             'octagonal lake, holding a large collection tied to Bergen’s ' +
             'famous composer.',
      question: {
        q: 'Which world-famous composer was born in Bergen?',
        options: ['Edvard Grieg', 'Edvard Munch', 'Henrik Ibsen', 'Roald Amundsen'],
        answer: 0
      }
    }
  ]
};
