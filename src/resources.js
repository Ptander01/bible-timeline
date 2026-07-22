// External links to the author's companion apps and study resources, surfaced
// in the detail panel for the relevant person / book / event.
const LIB = 'https://ptander01.github.io/Bible-Study-Library';
const LIBRARY = { label: 'Bible Study Library', url: `${LIB}/`, kind: 'library' };
const PAULS   = { label: "Paul's World",  url: 'https://pauls-world.vercel.app', kind: 'app' };
const JESUS   = { label: 'Jesus World',   url: 'https://jesus-world.vercel.app', kind: 'app' };

// Leadership studies keyed by figure id
const LEADERSHIP = {
  moses:  { label: 'Leadership Study: Moses',  url: `${LIB}/leadership/moses.html`,  kind: 'study' },
  joshua: { label: 'Leadership Study: Joshua', url: `${LIB}/leadership/joshua.html`, kind: 'study' },
  david:  { label: 'Leadership Study: David',  url: `${LIB}/leadership/david.html`,  kind: 'study' },
  peter:  { label: 'Leadership Study: Peter',  url: `${LIB}/leadership/peter.html`,  kind: 'study' },
  paul:   { label: 'Leadership Study: Paul',   url: `${LIB}/leadership/paul.html`,   kind: 'study' },
  jesus:  { label: 'Leadership Study: Jesus',  url: `${LIB}/leadership/jesus.html`,  kind: 'study' },
};

// Book-specific study / context links keyed by book id
const TIMOTHY_TITUS = { label: 'Leadership Study: Timothy & Titus', url: `${LIB}/leadership/timothy-titus.html`, kind: 'study' };
const BOOK_LINKS = {
  '1timothy': TIMOTHY_TITUS,
  '2timothy': TIMOTHY_TITUS,
  titus:      TIMOTHY_TITUS,
  amos:       { label: 'Study: Amos', url: `${LIB}/standalone/amos.html`, kind: 'study' },
  philippians:{ label: 'Philippi — City Map', url: 'https://pauls-world.vercel.app/philippians-map.html', kind: 'app' },
};

// Event-specific study links keyed by event id
const EVENT_LINKS = {
  'amos-prophecy': { label: 'Study: Amos', url: `${LIB}/standalone/amos.html`, kind: 'study' },
};

const GOSPELS = new Set(['matthew', 'mark', 'luke', 'john']);
const PAULINE = new Set([
  'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
  'philippians', 'colossians', '1thessalonians', '2thessalonians',
  '1timothy', '2timothy', 'titus', 'philemon',
]);
const JESUS_EVENTS = new Set([
  'john-born', 'jesus-born', 'nazareth-return', 'temple-12', 'john-baptizes',
  'temptation', 'first-miracle', 'sermon-mount', 'jesus-jerusalem-31',
  'john-executed', 'five-thousand', 'transfiguration', 'jesus-jerusalem-32',
  'crucifixion',
]);
const PAUL_EVENTS = new Set([
  'saul-converted', 'paul-barnabas', 'paul-journey1', 'paul-journey2',
  'paul-journey3', 'paul-jerusalem', 'paul-caesarea', 'paul-appeals',
  'paul-rome', 'paul-troas', 'paul-arrested', 'paul-martyred',
]);

// Returns the companion resources relevant to a selected item, most-specific first.
export function resourcesFor(item, type) {
  if (!item) return [];
  const id = item.id;
  const out = [];

  if (type === 'figure') {
    if (id === 'jesus') out.push(JESUS);
    if (id === 'paul')  out.push(PAULS);
    if (LEADERSHIP[id]) out.push(LEADERSHIP[id]);
    out.push(LIBRARY);
  } else if (type === 'book') {
    if (GOSPELS.has(id)) out.push(JESUS);
    if (PAULINE.has(id) || id === 'acts') out.push(PAULS);
    if (BOOK_LINKS[id]) out.push(BOOK_LINKS[id]);
    out.push(LIBRARY);
  } else if (type === 'event') {
    if (JESUS_EVENTS.has(id)) out.push(JESUS);
    if (PAUL_EVENTS.has(id))  out.push(PAULS);
    if (EVENT_LINKS[id])      out.push(EVENT_LINKS[id]);
  }

  return out.filter((r, i) => out.findIndex(x => x.url === r.url) === i);
}
