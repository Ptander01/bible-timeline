// External links to the author's companion apps and study resources, surfaced
// in the detail panel for the relevant person / book / event.
const LIBRARY    = { label: 'Bible Study Library',     url: 'https://ptander01.github.io/Bible-Study-Library/',                       kind: 'library' };
const PAULS      = { label: "Paul's World",            url: 'https://pauls-world.vercel.app',                                         kind: 'app' };
const JESUS      = { label: 'Jesus World',             url: 'https://jesus-world.vercel.app',                                         kind: 'app' };
const LEAD_MOSES = { label: 'Leadership Study: Moses', url: 'https://ptander01.github.io/Bible-Study-Library/leadership/moses.html',  kind: 'study' };
const LEAD_JESUS = { label: 'Leadership Study: Jesus', url: 'https://ptander01.github.io/Bible-Study-Library/leadership/jesus.html',  kind: 'study' };

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
    if (id === 'jesus') out.push(JESUS, LEAD_JESUS);
    if (id === 'paul')  out.push(PAULS);
    if (id === 'moses') out.push(LEAD_MOSES);
    out.push(LIBRARY);
  } else if (type === 'book') {
    if (GOSPELS.has(id)) out.push(JESUS);
    if (PAULINE.has(id) || id === 'acts') out.push(PAULS);
    out.push(LIBRARY);
  } else if (type === 'event') {
    if (JESUS_EVENTS.has(id)) out.push(JESUS);
    if (PAUL_EVENTS.has(id))  out.push(PAULS);
  }

  return out.filter((r, i) => out.findIndex(x => x.url === r.url) === i);
}
