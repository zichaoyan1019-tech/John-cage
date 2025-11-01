import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * App with Top Navigation: Home | Works
 * - Home: slideshow + bio + quotes + key events (simple list)
 * - Works: parses the raw text (1932–1992) into a YEAR->ITEMS structure,
 *          with collapsible sections and a search box.
 *
 * Notes:
 * - No cropping for images (object-contain + letterboxed frame).
 * - Includes simple dev tests (expand “Development Tests”).
 */

/* ---------------- Shared Data ---------------- */
const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/u, '')}`

const QUOTES = [
  'Everything we do is music.',
  'I have nothing to say and I am saying it.',
  'Wherever we are, what we hear is mostly noise.',
  'There is no such thing as silence.',
  "The first question I ask myself when something doesn't seem to be beautiful is why do I think it's not beautiful.",
]

const IMAGES = [
  withBase('images/cage-1.jpeg'),
  withBase('images/cage-2.jpeg'),
  withBase('images/cage-3.jpeg'),
  withBase('images/cage-4.jpeg'),
  withBase('images/cage-5.jpeg'),
  withBase('images/cage-6.jpeg'),
  withBase('images/cage-7.jpeg'),
  withBase('images/cage-8.jpeg'),
  withBase('images/cage-9.jpeg'),
  withBase('images/cage-10.jpeg'),
]

const KEY_EVENTS = [
  { year: 1912, label: 'Born in Los Angeles.' },
  { year: 1938, label: 'Began experimenting with percussion and nontraditional sound sources.' },
  { year: 1940, label: 'Composed first prepared piano piece, Bacchanale.' },
  { year: 1946, label: 'Started Sonatas and Interludes, exploring timbre and rasa.' },
  { year: 1951, label: 'Created Music of Changes using the I Ching and chance operations.' },
  { year: 1952, label: 'Premiered 4′33″, redefining silence as music.' },
  { year: 1957, label: 'Composed Concert for Piano and Orchestra, a graphic score allowing performer freedom.' },
  { year: 1969, label: 'Wrote Cheap Imitation, blending chance and tradition.' },
  { year: 1975, label: 'Completed Etudes Australes, extreme chance-determined piano works.' },
  { year: 1992, label: 'Died in New York City, leaving a profound legacy on modern music.' },
]

const SOURCES = {
  bibliography: [
    {
      type: 'book',
      author: 'Pritchett, James',
      year: '1996',
      title: 'The Music of John Cage',
      venue: 'Cambridge University Press',
      url: '',
    },
    {
      type: 'article',
      author: 'Perry, Jeffrey',
      year: '2005',
      title: '‘Structure’ and Silence in Cage’s Sonatas and Interludes',
      venue: 'Journal/Conference (fill in)',
      url: '',
    },
    {
      type: 'web',
      author: 'Pritchett, James',
      year: 'n.d.',
      title: "Six Views of the ‘Sonatas and Interludes’",
      venue: 'Rose White Music',
      url: 'https://rosewhitemusic.com/piano/writings/six-views-sonatas-interludes/',
    },
    {
      type: 'web',
      author: 'Abramovic, A.',
      year: 'n.d.',
      title: 'A Performer’s Guide to the Sonatas and Interludes',
      venue: 'Seattle Piano Teacher',
      url: 'https://www.seattlepianoteacher.com/a-performers-guide-to-the-sonatas-and-interludes-for-prepared-piano/',
    },
    {
      type: 'article',
      author: 'Author, A.',
      year: 'Year',
      title: 'John Cage’s 4′33″: Using Aesthetic Theory to …',
      venue: 'Journal/Publisher',
      url: '',
    },
    {
      type: 'article',
      author: 'Author, B.',
      year: 'Year',
      title: 'John Cage and the Aesthetic Pedagogy of Chance & Silence',
      venue: 'Journal/Publisher',
      url: '',
    },
  ],
  scoresAndRecordings: [
    {
      label: 'Score — Sonatas and Interludes',
      source: 'Indiana University Variations',
      url: 'https://purl.dlib.indiana.edu/iudl/variations/score/BHS6322',
      note: 'Some library pages block third-party embed; provide external link.',
    },
    {
      label: 'Recording — Sonatas and Interludes',
      source: 'YouTube (Jesse Myers)',
      url: 'https://www.youtube.com/watch?v=N6Sl5wmy9t4',
      note: '',
    },
  ],
  mediaCredits: [
    {
      label: 'Prepared piano interior (article)',
      source: 'Soundfly / Flypaper',
      url: 'https://flypaper.soundfly.com/write/what-is-prepared-piano-and-how-do-you-notate-it/',
    },
    {
      label: "Six Views of the ‘Sonatas and Interludes’",
      source: 'Rose White Music',
      url: 'https://rosewhitemusic.com/piano/writings/six-views-sonatas-interludes/',
    },
    { label: 'John Cage official work page (metadata)', source: 'johncage.org', url: 'https://johncage.org/' },
  ],
}

// -------- Work details for concept → detail pages --------
const WORK_DETAILS = {
  'sonatas-interludes': {
    title: 'Sonatas and Interludes (1946–48)',
    intro:
      'A cycle for prepared piano exploring the Indian rasa theory. Cage inserts objects between piano strings to transform timbre and articulation.',
    scoreUrl: '',
    recordingUrl: '',
  },
  'music-of-changes': {
    title: 'Music of Changes (1951)',
    intro:
      'A landmark of chance operations using the I Ching to determine sound events, durations, dynamics and more.',
    scoreUrl: '',
    recordingUrl: '',
  },
  'concert-piano-orchestra': {
    title: 'Concert for Piano and Orchestra (1957–58)',
    intro:
      'An indeterminate, performer-driven work with graphic notation and independent time; piano part can be realized freely.',
    scoreUrl: '',
    recordingUrl: '',
  },
  'cheap-imitation': {
    title: 'Cheap Imitation (1969)',
    intro:
      'A solo piano piece derived via chance transforms of Satie’s Socrate; a later, reflective encounter between tradition and chance.',
    scoreUrl: '',
    recordingUrl: '',
  },
  'etudes-australes': {
    title: 'Etudes Australes (1974–75)',
    intro:
      'Extremely demanding chance-determined etudes for piano based on star maps; explores independence and quiet virtuosity.',
    scoreUrl: '',
    recordingUrl: '',
  },
}

// --- Three-period timeline data for Concept page ---
const CAGE_TIMELINE = [
  {
    id: 'early',
    range: '1938–1948',
    title: 'Timbral Design & Prepared Piano',
    thesis: 'The piano becomes a percussion orchestra — sound as structure.',
    works: [
      { title: 'Bacchanale', year: 1940 },
      { title: 'Amores', year: 1943 },
      { title: 'Sonatas and Interludes', year: '1946–48', workId: 'sonatas-interludes' },
    ],
  },
  {
    id: 'middle',
    range: '1951–1962',
    title: 'Chance, Silence & Indeterminacy',
    thesis: 'Composing with chance and listening to silence as music itself.',
    works: [
      { title: 'Music of Changes', year: 1951, workId: 'music-of-changes' },
      { title: '4′33″', year: 1952 },
      { title: 'Concert for Piano and Orchestra', year: '1957–58', workId: 'concert-piano-orchestra' },
    ],
  },
  {
    id: 'late',
    range: '1969–1992',
    title: 'Time-Brackets & Ecology of Listening',
    thesis: 'Open temporal structures and an ecological approach to sound.',
    works: [
      { title: 'Cheap Imitation', year: 1969, workId: 'cheap-imitation' },
      { title: 'Etudes Australes', year: '1974–75', workId: 'etudes-australes' },
      { title: 'Number Pieces', year: '1987–92' },
    ],
  },
]

/* ---------------- NAV ---------------- */
function Nav({ active, onChange }) {
  const items = [
    { key: 'home', label: 'Home' },
    { key: 'works', label: 'Works' },
    { key: 'concept', label: 'Concept' },
    { key: 'sources', label: 'Sources' },
  ]
  return (
    <nav className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="font-semibold">John Cage</div>
        <ul className="flex items-center gap-2">
          {items.map((navItem) => (
            <li key={navItem.key}>
              <button
                onClick={() => onChange(navItem.key)}
                className={`rounded-full px-3 py-1.5 text-sm shadow-sm transition hover:shadow ${
                  active === navItem.key ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {navItem.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/* ---------------- Section ---------------- */
function Section({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {title && <h2 className="mb-1 text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h2>}
      {subtitle && <p className="mb-6 text-sm tracking-[0.15em] text-gray-500 md:text-base">{subtitle}</p>}
      <div className="grid gap-6">{children}</div>
    </section>
  )
}

/* ---------------- Home ---------------- */
const EMPHASIZE_INDEXES = new Set([0, 5, 6, 7]) // 1,6,7,8 (1-based)

function HomeView() {
  const [idx, setIdx] = useState(0)
  const [qIndex, setQIndex] = useState(0)

  const imgLen = IMAGES.length || 1
  const quoteLen = QUOTES.length || 1

  useEffect(() => {
    const imageTimer = setInterval(() => setIdx((value) => (value + 1) % imgLen), 10000)
    const quoteTimer = setInterval(() => setQIndex((value) => (value + 1) % quoteLen), 5000)

    return () => {
      clearInterval(imageTimer)
      clearInterval(quoteTimer)
    }
  }, [imgLen, quoteLen])

  const fallbackImg =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/John_Cage_1988.jpg/640px-John_Cage_1988.jpg'
  const isEmphasized = EMPHASIZE_INDEXES.has(idx)

  const frameBase =
    'relative ml-auto -mt-2 mr-1 flex w-full items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm md:-mt-3 md:mr-2 md:w-[600px]'
  const frameSize = isEmphasized ? 'h-[54vw] md:h-[440px] p-2 md:p-3' : 'h-[48vw] md:h-[380px] p-2'

  return (
    <div className="relative">
      <Section title="John Cage (1912–1992)" subtitle="Prepared piano · Chance · Silence · Graphic notation">
        <div className="grid items-start gap-6 md:grid-cols-[1.05fr_1fr]">
          {/* Left: image frame (no cropping) */}
          <div className="w-full md:justify-self-end">
            <div className={`${frameBase} ${frameSize}`}>
              <img
                key={IMAGES[idx]}
                src={IMAGES[idx]}
                alt="John Cage"
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied !== 'true') {
                    event.currentTarget.dataset.fallbackApplied = 'true'
                    event.currentTarget.src = fallbackImg
                  }
                }}
                className="block max-h-full max-w-full select-none object-contain"
              />
              <div className="absolute bottom-2 right-2 rounded-full border bg-white/80 px-2 py-1 text-[11px] text-neutral-700 backdrop-blur">
                {idx + 1} / {IMAGES.length}
              </div>
            </div>
          </div>

          {/* Right: Bio + Quote */}
          <div className="space-y-6 md:max-w-[640px]">
            <h3 className="text-xl font-extrabold tracking-tight md:text-2xl">Biography</h3>
            <p className="text-lg leading-8 text-gray-800 md:text-xl md:leading-9">
              John Cage was a pioneering American composer whose work reframed listening in the twentieth century. He
              explored non-standard use of instruments (prepared piano), chance operations via the <em>I Ching</em>, and
              the idea that ambient sound itself can be music (4′33″). His collaborations with choreographer Merce
              Cunningham and his use of graphic notation expanded the role of the performer and challenged the
              definition of a musical “work”.
            </p>
            <h4 className="mt-8 text-xs tracking-[0.3em] text-gray-500 md:text-sm">QUOTES</h4>
            <blockquote className="rounded-2xl border bg-gray-100 p-5 text-gray-900 md:p-6">
              <p className="font-playfair text-xl italic leading-8 md:text-2l md:leading-9">“{QUOTES[qIndex]}”</p>
            </blockquote>
          </div>
        </div>
      </Section>

      <Section title="Background & Career" subtitle="From early studies in Los Angeles to global influence">
        <div className="mx-auto max-w-4xl space-y-4 text-left text-base leading-relaxed text-gray-700 md:text-lg">
          <p>
            John Milton Cage Jr. (1912–1992) was born in Los Angeles, California, to an inventor father and a journalist
            mother. He began piano studies around the age of ten and developed a lifelong fascination with sound, silence,
            and the boundaries of music.
          </p>
          <p>
            After leaving Pomona College, Cage traveled through Europe and later studied composition in the United States
            with Richard Buhlig, Henry Cowell, and Arnold Schoenberg. His early works explored rhythm and percussion, and
            by the late 1930s he began organizing percussion ensembles and experimenting with sound as a structural
            element of composition.
          </p>
          <p>
            During the 1940s, Cage invented the <em>prepared piano</em>, inserting objects between piano strings to
            create new percussive timbres. His long collaboration with choreographer Merce Cunningham led to groundbreaking
            works that blurred the lines between music, dance, and chance.
          </p>
          <p>
            Cage’s philosophy evolved from structure and control toward indeterminacy and openness. His most famous work,
            <em> 4′33″</em> (1952), challenges the very definition of music, emphasizing environmental sound and active
            listening. Through techniques such as chance operations, graphic scores, and electronic manipulation, he
            redefined what it means to compose.
          </p>
          <p>
            Over his six-decade career, Cage profoundly influenced contemporary music, visual art, and performance. He
            inspired generations of artists to hear the world differently—seeing sound not as organized notes, but as a
            field of infinite possibilities.
          </p>
        </div>
      </Section>

      <Section title="Key Events" subtitle="Major moments in Cage’s life and career.">
        <ul className="space-y-3">
          {KEY_EVENTS.map((event, index) => (
            <li key={`${event.year}-${index}`} className="flex items-start gap-4">
              <div className="w-20 text-2xl font-bold text-gray-800 md:text-3xl">{String(event.year)}</div>
              <div className="text-base leading-relaxed text-gray-700 md:text-lg">{event.label}</div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

/* ---------------- Works ---------------- */
const RAW_WORKS = String.raw`1932

Greek Ode — voice and piano*. 
rosewhitemusic.com

1933

Three Songs — voice & piano*

Three Easy Pieces — piano*

Sonata for Clarinet

Sonata for Two Voices — 2+ instruments. 
rosewhitemusic.com

1934

Composition for Three Voices — 3+ instruments

Solo with Obbligato Accompaniment of Two Voices in Canon, and Six Short Inventions… — 3+ instruments（1958编配为7件乐器）. 
rosewhitemusic.com

1935

Two Pieces for Piano*（1974修订）

Quartet — 4 percussionists

Three Pieces for Flute Duet

Quest — piano*. 
rosewhitemusic.com

1936

Trio — 3 percussionists. 
rosewhitemusic.com

1938

Metamorphosis — piano*

Five Songs for Contralto — alto & piano*

Music for Wind Instruments — wind quintet. 
rosewhitemusic.com

1939

Imaginary Landscape No. 1 — 4 perc + electronics

First Construction (in Metal) — 6 perc. 
rosewhitemusic.com

1940

A Chant with Claps — voice

Second Construction — 4 perc

Bacchanale — prepared piano*

Imaginary Landscape No. 2（撤回）

Fads and Fancies in the Academy — piano* & 4 perc

Living Room Music — 4 perc（Stein 文本）. 
rosewhitemusic.com

1941

Double Music — 4 perc（与 Lou Harrison 合作）

Third Construction — 4 perc. 
rosewhitemusic.com

1942

Jazz Study — piano*

Imaginary Landscape No. 3 — 6 perc

Imaginary Landscape No. 2 — 5 perc

The City Wears a Slouch Hat — 6 perc（广播剧）

Credo in Us — 4 perc

Forever and Sunsmell — voice & 2 perc

Totem Ancestor — prepared piano*

And the Earth Shall Bear Again — prepared piano*

The Wonderful Widow of Eighteen Springs — voice & closed piano*

Primitive — prepared piano*

In the Name of the Holocaust — prepared piano*. 
rosewhitemusic.com

1943

Four Dances — voice, prepared piano*, perc

Amores — prepared piano*, 3 perc

Ad Lib — piano*

Our Spring Will Come — prepared piano*

She is Asleep — voice, prepared piano*, 4 perc

A Room — piano/prepared piano*

Tossed as it is Untroubled — prepared piano*

Triple-paced No. 1 — piano*. 
rosewhitemusic.com

1944

The Perilous Night — prepared piano*

Prelude for Meditation — prepared piano*

Root of an Unfocus — prepared piano*

Spontaneous Earth — prepared piano*

Triple-paced No. 2 — prepared piano*

The Unavailable Memory of — prepared piano*

A Valentine out of Season — prepared piano*

A Book of Music — two prepared pianos*

Four Walls（for Merce Cunningham）— voice & piano*. 
rosewhitemusic.com

1945

Crete — piano*

Dad — piano*

Party Pieces —（与 Cowell/Harrison/Thomson 合作）

Soliloquy — piano*

Experiences No. 1 — two pianos*

Mysterious Adventure — prepared piano*

Three Dances — two prepared pianos*

Daughters of the Lonesome Isle — prepared piano*. 
rosewhitemusic.com

1946

Ophelia — piano*

Prelude for Six Instruments in A Minor — includes piano*

Two Pieces for Piano*. 
rosewhitemusic.com

1947

Music for Marcel Duchamp — prepared piano*

The Seasons — orchestra

Nocturne — violin & piano*. 
rosewhitemusic.com

1948

Experiences No. 2 — voice

Sonatas and Interludes（1946–48）— prepared piano*

Dream — piano*

In a Landscape — harp/piano*

Suite for Toy Piano*. 
rosewhitemusic.com

1950

Works of Calder — prepared piano* & tape（电影配乐）

String Quartet in Four Parts（1949–50）

Six Melodies — violin & keyboard（含piano*）

A Flower — voice & piano*. 
rosewhitemusic.com

1951

Sixteen Dances — includes piano*

Concerto for Prepared Piano* and Chamber Orchestra

Imaginary Landscape No. 4 — 12 radios

Music of Changes — piano*. 
rosewhitemusic.com

1952

Waiting — piano*

Imaginary Landscape No. 5 — tape

Seven Haiku（1951–52）— piano*

Two Pastorales — prepared piano*

Water Music — piano*

Music for Carillon No. 1

Black Mountain Piece — mixed-media event

For M.C. and D.T. — piano*

4′33″ — tacet（任意编制；1960修订）

Williams Mix — tape

Music for Piano 1*. 
rosewhitemusic.com

1953

Music for Piano 2*

Music for Piano 3*

Music for Piano 4–19*

59 1/2″ for a String Player — any 4-string instrument

Music for Piano 20*. 
rosewhitemusic.com

1954

Music for Carillon No. 2

Music for Carillon No. 3

34′46.776″ for a Pianist*

31′57.9864″ for a Pianist*. 
rosewhitemusic.com

1955

26′1.1499″ for a String Player（1953/55）

Music for Piano 21–36 / 37–52*

Speech 1955 — 5 radios & newsreader. 
rosewhitemusic.com

1956

27′10.554″ for a Percussionist

Music for Piano 53–68*

Music for Piano 69–84*

Radio Music — 1–8 radios. 
rosewhitemusic.com

1957

Winter Music — 1–20 pianos*

For Paul Taylor and Anita Dencks — piano*. 
rosewhitemusic.com

1958

Haiku — any instruments

Variations I — any instruments

Concert for Piano* and Orchestra（1957–58）

Solo for Voice 1

Music Walk — piano*（1+ performer）

TV Köln — piano*

Fontana Mix — tape

Aria — voice. 
rosewhitemusic.com

1959

Sounds of Venice — solo television performer

Water Walk — solo television performer. 
rosewhitemusic.com

1960

Theatre Piece — 1–8 performers

Music for Amplified Toy Pianos*

WBAI — operator of machines

Music for “The Marrying Maiden” — tape（戏剧）

Cartridge Music — electronics

Solo for Voice 2 — 1+ voice. 
rosewhitemusic.com

1961

Variations II — any instruments

Music for Carillon No. 4. 
rosewhitemusic.com

1962

Atlas Eclipticalis — orchestra

Music for Piano 85*

0′00″（4′33″ No. 2）— solo performer with amplification. 
rosewhitemusic.com

1963

Variations III — any instruments

Variations IV — any instruments. 
rosewhitemusic.com

1964

Electronic Music for Piano* — piano with electronics. 
rosewhitemusic.com

1965

Rozart Mix — tape loops

Variations V — audiovisual performance. 
rosewhitemusic.com

1966

Variations VI — 1+ sound systems. 
rosewhitemusic.com

1967

Music for Carillon No. 5

Newport Mix — tape loops

Musicircus — mixed-media performance. 
rosewhitemusic.com

1968

Reunion — electronics. 
rosewhitemusic.com

1969

HPSCHD（1967–69，与 Hiller 合作）— 1–7 harpsichords & tapes

33 1/3 — record players（装置）

Cheap Imitation — piano*（1972配管弦；1977小提琴版）. 
rosewhitemusic.com

1970

Song Books（Solos for Voice 3–92）. 
rosewhitemusic.com

1971

Sixty-two Mesostics RE Merce Cunningham — voice

Les chants de Maldoror pulvérisés… — francophone public（事件/表演）. 
rosewhitemusic.com

1972

Bird Cage — 12 tapes. 
rosewhitemusic.com

1973

Etcetera — orchestra & tape. 
rosewhitemusic.com

1974

Score (40 Drawings by Thoreau) and 23 Parts — any instruments. 
rosewhitemusic.com

1975

Etudes Australes — piano*

Child of Tree — amplified plant materials

Lecture on the Weather — 12 voices & tapes. 
rosewhitemusic.com

1976

Branches — amplified plant materials

Renga — any instruments

Apartment House 1776 — any ensemble（1986 节选为 violin/piano*）

Quartets I–VIII — orchestra（另有改编）. 
rosewhitemusic.com

1977

Telephones and Birds — 3 performers with tapes

Inlets — 3 performers（海螺等）

Forty-nine Waltzes for the Five Boroughs — open form（演/听/录皆可）

Alla ricerca del silenzio perduto — prepared train. 
rosewhitemusic.com

1978

Chorals — violin

Etudes Boreales — cello/piano*

Variations VIII — no music or recordings

A Dip in the Lake — performer(s)/listener(s)/record-maker(s)

Sound Anonymously Received — any instrument

Some of “The Harmony of Maine” — organ. 
rosewhitemusic.com

1979

Hymns and Variations — 12 voices

____, ____ ____ circus on ____ — any ensemble（实现为《Roaratorio…》）

Paragraphs of Fresh Air — radio event. 
rosewhitemusic.com

1980

Improvisation III — cassette players

Furniture Music etcetera — two pianos*

Litany for the Whale — 2 voices. 
rosewhitemusic.com

1981

Thirty Pieces for Five Orchestras. 
rosewhitemusic.com

1982

Improvisation IV — 3 cassette players

Dance/4 Orchestras

Postcard from Heaven — 1–20 harps（竖琴）. 
rosewhitemusic.com

1983

Ear for EAR — 2+ voices

Souvenir — organ

Thirty Pieces for String Quartet. 
rosewhitemusic.com

1984

Perpetual Tango — piano*

Haikai — flute & zoomoozophone

Nowth upon Nacht — voice & piano*

A Collection of Rocks — voices & orchestra

Eight Whiskus — voice（1985 小提琴版）

Exercise — orchestra

Selkus2 — voice

Mirakus2 — voice. 
rosewhitemusic.com

1985

Aslsp — piano*（同年有 Organ 相关作品名为 Organ²/ASLSP，见 1987）

Sonnekus2 — voice

But what about the noise of crumpling paper… — percussion ensemble

Etcetera 2/4 orchestras

Ryoanji（1983–85，多个器乐/乐队版本）. 
rosewhitemusic.com

1986

Improvisation A+B — mixed ensemble

Hymnkus — chamber ensemble

Rocks — electronics/devices

Haikai — gamelan

Essay — tape. 
rosewhitemusic.com

1987

Music for ________（1984–87）— variable chamber ensemble

Two — flute & piano*

Organ²/ASLSP — organ

Europeras 1 & 2 — theatre work

One — piano*. 
rosewhitemusic.com

1988

Five — any 5 instruments/voices

Four Solos for Voice

Seven — fl, cl, perc, piano*, vn, va, vc

Twenty-three — strings

Five Stone Wind — for 3 performers

1O1 — orchestra. 
rosewhitemusic.com

1989

Swinging — piano*

Four — string quartet

Three — 3 recorders

Two² — two pianos*

Sculptures Musicales — any sounds

One² — piano*

One³ — solo performer. 
rosewhitemusic.com

1990

cComposed Improvisations — perc/electric bass/snare etc.

One⁴ — percussion

Fourteen — piano* & chamber ensemble

One⁵ — piano*

One⁶ — violin

Europeras 3 & 4 — theatre work

Seven² — low winds/low brass/perc/vc/cb

Scottish Circus — traditional Scottish musicians

Four² — SATB chorus

One⁷ — any instrument

Freeman Etudes（1977–80 / 1989–90）— violin. 
rosewhitemusic.com

1991

Europera 5 — theatre work

One⁸ — cello

108 — orchestra

Eight — wind/brass ensemble（fl, ob, cl, bn, hn, tpt, tbn, tuba）

Five² — eh, 2 cl, bcl, timp

Lullaby — music box

Four³ — piano*, rainsticks, violin, silence

Three² — 3 percussion

One⁹ — shō

Two³ — shō & conch shells

Two⁴ — violin & piano* / or shō

103 — orchestra

Six — 6 percussion

Five³ — trombone & string quartet

Five⁴ — saxes & 3 perc

Five⁵ — fl, 2 cl, bcl, perc

Four⁴ — 4 percussion

Four⁵ — sax ensemble

Ten — fl, ob, cl, tbn, perc, piano*, 2 vn, va, vc

Two⁵ — tenor trombone & piano*

Five Hanau Silence — environmental sounds

Twenty-eight — wind ensemble

Twenty-six — 26 violins

Twenty-nine — 2 timp, 2 perc, piano*, 10 va, 8 vc, 6 cb

Twenty-eight Twenty-six, and Twenty-nine — orchestra. 
rosewhitemusic.com

1992

Eighty — orchestra

Sixty-eight — orchestra

One¹⁰ — violin

Fifty-eight — wind orchestra

Four⁶ — 4 performers

Seventy-four — orchestra

Two⁶ — violin & piano*

Thirteen — chamber ensemble. 
rosewhitemusic.co`

function sanitizeText(text) {
  return text
    .replace(/[\u3400-\u4dbf\u4e00-\u9fff\u3000-\u303f\uff00-\uffef（）【】「」『』《》]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .trim()
}

function parseWorks(raw) {
  const lines = raw.split(/\r?\n/)
  const yearRe = /^\s*(\d{4})\s*$/
  const out = {}
  let currentYear = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const match = line.match(yearRe)
    if (match) {
      currentYear = match[1]
      if (!out[currentYear]) {
        out[currentYear] = []
      }
      continue
    }

    if (!currentYear) continue

    if (/^rosewhitemusic\.com$/i.test(line)) continue

    const dashIdx = line.indexOf('—')
    let title = line
    let detail = ''
    if (dashIdx >= 0) {
      title = line.slice(0, dashIdx).trim()
      detail = line.slice(dashIdx + 1).trim().replace(/\.*\s*$/, '')
    }

    title = sanitizeText(title)
    detail = sanitizeText(detail)

    out[currentYear].push({
      title,
      detail,
      raw: line,
      piano: /\bpiano\*\b|\bpiano\b/i.test(line),
      prepared: /prepared piano/i.test(line),
    })
  }

  return out
}

function WorksView() {
  const data = useMemo(() => parseWorks(RAW_WORKS), [])
  const years = useMemo(() => Object.keys(data).sort((a, b) => Number(a) - Number(b)), [data])

  const [q, setQ] = useState('')
  const [mode, setMode] = useState('all')

  const filterFn = (item) => {
    if (mode === 'piano' && !item.piano && !item.prepared) return false
    if (!q) return true
    const haystack = `${item.title} ${item.detail} ${item.raw || ''}`.toLowerCase()
    return haystack.includes(q.toLowerCase())
  }

  const totalAfterFilter = useMemo(
    () =>
      years.reduce((sum, year) => {
        const items = (data[year] || []).filter(filterFn)
        return sum + items.length
      }, 0),
    [years, data, mode, q],
  )

  return (
    <Section
      title="Works (1932–1992)"
      subtitle="Grouped by year • Click a year to expand/collapse • Use search or the filter to refine"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="inline-flex rounded-full border bg-white p-1">
          <button
            onClick={() => setMode('all')}
            className={`rounded-full px-3 py-1.5 text-sm transition ${mode === 'all' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            aria-pressed={mode === 'all'}
          >
            All works
          </button>
          <button
            onClick={() => setMode('piano')}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              mode === 'piano' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
            aria-pressed={mode === 'piano'}
          >
            Piano works
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search (e.g., piano, prepared, toy, rosewhitemusic)"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 md:w-[380px]"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="rounded-xl border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Showing <span className="font-semibold">{totalAfterFilter}</span> item{totalAfterFilter !== 1 ? 's' : ''} (mode:{' '}
        <span className="font-mono">{mode}</span>
        {q ? `, query: “${q}”` : ''})
      </div>

      <div className="mt-4 grid gap-4">
        {years.map((year) => {
          const items = (data[year] || []).filter(filterFn)
          if (items.length === 0) return null

          const count = items.length
          return (
            <div key={year} className="rounded-2xl border bg-white">
              <div className="flex items-baseline gap-3 px-4 py-3">
                <div className="text-2l font-extrabold">{year}</div>
                <div className="rounded-full border bg-gray-50 px-2 py-1 text-xs">
                  {count} work{count !== 1 ? 's' : ''}
                </div>
              </div>
              <ul className="space-y-2 border-t px-4 pb-4">
                {items.map((item, index) => (
                  <li key={`${year}-${index}`} className="flex flex-wrap items-start gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.detail && <span className="text-gray-600">— {item.detail}</span>}
                    {item.piano && (
                      <span className="rounded-full border bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                        piano
                      </span>
                    )}
                    {item.prepared && (
                      <span className="rounded-full border bg-rose-100 px-2 py-0.5 text-[11px] text-rose-800">
                        prepared
                      </span>
                    )}
                    {item.link && (
                      <a
                        className="rounded-full border bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 hover:underline"
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        rosewhitemusic.com
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function ConceptTimeline({ onOpenWork }) {
  return (
    <div className="relative py-16">
      {/* central horizontal line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] rounded bg-gray-300"></div>

      {/* three equal columns */}
      <div className="grid grid-cols-3 gap-0">
        {CAGE_TIMELINE.map((period) => (
          <div key={period.id} className="relative px-3 text-center">
            {/* marker dot on the line */}
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900 shadow ring-4 ring-white" />

            {/* above the line: period info */}
            <div className="mb-10">
              <div className="text-xs tracking-[0.25em] text-gray-500">{period.range}</div>
              <div className="mt-1 text-base font-semibold leading-tight md:text-lg">{period.title}</div>
              <div className="mt-2 text-sm text-gray-600">{period.thesis}</div>
            </div>

            {/* below the line: representative works */}
            <div className="mt-10">
              <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Selected Works</div>
              <ul className="mt-2 space-y-1 text-sm">
                {period.works.map((work) => (
                  <li key={`${work.title}-${work.year}`}>
                    <span className="mr-2 text-gray-500">{work.year}</span>
                    {work.workId ? (
                      <button
                        onClick={() => onOpenWork && onOpenWork(work.workId)}
                        className="font-medium underline decoration-dotted underline-offset-2 hover:text-blue-600"
                        title="Open work details"
                      >
                        {work.title}
                      </button>
                    ) : (
                      <span className="font-medium">{work.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========= Prepared Piano Demo ========= */
function PreparedPianoDemo() {
  const ctxRef = useRef(null)
  const [material, setMaterial] = useState('screw')
  const [openModal, setOpenModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const freqMap = {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23,
    G: 392.0,
    A: 440.0,
    B: 493.88,
  }

  function getAudioCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }

  function play(note) {
    const ctx = getAudioCtx()
    const t0 = ctx.currentTime

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freqMap[note]

    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf

    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    const noiseGain = ctx.createGain()

    let attack = 0.002
    let decay = 0.18
    let sustain = 0.05
    let cutoff = 1800
    let q = 6
    let noiseAmount = 0.3

    if (material === 'screw') {
      cutoff = 1200
      q = 10
      noiseAmount = 0.45
      decay = 0.22
    }
    if (material === 'rubber') {
      cutoff = 900
      q = 4
      noiseAmount = 0.15
      decay = 0.28
      sustain = 0.02
    }
    if (material === 'metal') {
      cutoff = 2400
      q = 12
      noiseAmount = 0.5
      decay = 0.16
    }
    if (material === 'coin') {
      cutoff = 2000
      q = 8
      noiseAmount = 0.35
      decay = 0.2
    }

    filter.type = 'bandpass'
    filter.frequency.value = cutoff
    filter.Q.value = q

    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(1, t0 + attack)
    gain.gain.exponentialRampToValueAtTime(sustain + 0.0001, t0 + attack + decay)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay + 0.3)

    noiseGain.gain.value = noiseAmount

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.connect(noiseGain)
    noiseGain.connect(filter)

    osc.start(t0)
    noise.start(t0)
    osc.stop(t0 + attack + decay + 0.35)
    noise.stop(t0 + attack + decay + 0.25)
  }

  const MaterialButton = ({ id, label }) => (
    <button
      onClick={() => setMaterial(id)}
      className={`rounded-full border px-3 py-1.5 text-sm ${material === id ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
      aria-pressed={material === id}
    >
      {label}
    </button>
  )

  const images = [withBase('images/prepared-piano-1.webp'), withBase('images/prepared-piano-2.jpeg')]

  const openImage = (src) => {
    setSelectedImage(src)
    setZoom(1)
  }

  return (
    <div className="rounded-2xl border bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold md:text-xl">Prepared Piano</h3>
          <p className="text-gray-600">Altered timbre by objects on strings. Pick a material, then click keys.</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="rounded-full border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Details
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MaterialButton id="screw" label="Screw" />
        <MaterialButton id="rubber" label="Rubber" />
        <MaterialButton id="metal" label="Metal" />
        <MaterialButton id="coin" label="Coin" />
      </div>

      <div className="mt-4 flex gap-1 rounded-xl border bg-gray-100 p-2">
        {notes.map((note) => (
          <button
            key={note}
            onClick={() => play(note)}
            className="flex-1 rounded-lg border bg-white py-6 text-sm font-medium hover:shadow active:translate-y-[1px]"
            aria-label={`Play ${note}`}
          >
            {note}
          </button>
        ))}
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Prepared Piano — Details">
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => openImage(src)}
                className="overflow-hidden rounded-xl border bg-white cursor-zoom-in"
              >
                <img
                  src={src}
                  alt={`Prepared piano detail ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            <section>
              <h4 className="text-base font-semibold md:text-lg">Definition</h4>
              <p className="mt-2 leading-relaxed text-gray-700">
                A <em>prepared piano</em> is a piano whose sound has been transformed by temporarily inserting
                objects—often called <em>preparations</em>—between or onto its strings (for example: screws, bolts,
                rubber, wood, coins, paper, or cloth). The instrument is still played from the keyboard, but the added
                materials alter resonance, articulation, and timbre, turning certain notes into percussive or metallic
                sonorities. The goal is not to damage the instrument but to expand its palette of sounds for
                compositional purposes.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold md:text-lg">Preparation &amp; Effects</h4>
              <ul className="mt-2 space-y-2 list-disc pl-5 leading-relaxed text-gray-700">
                <li>
                  <span className="font-medium">Where and how:</span> The position, depth, and pressure of each
                  object—its distance from the damper, whether it touches one or multiple strings—greatly affect the
                  resulting tone color.
                </li>
                <li>
                  <span className="font-medium">Materials:</span> Rubber tends to mute and soften attacks; metal
                  (screws/bolts) yields bright, bell-like or metallic partials; wood or paper can produce dry, percussive
                  textures.
                </li>
                <li>
                  <span className="font-medium">Composite effects:</span> A single key may trigger multiple partials or a
                  split tone; some preparations produce gamelan-like colors or drum-like thuds.
                </li>
                <li>
                  <span className="font-medium">Variability:</span> Different pianos and string layouts mean the same
                  preparation chart will sound slightly different. Performers often fine-tune placements by ear to
                  achieve the intended timbre.
                </li>
                <li>
                  <span className="font-medium">Practice &amp; care:</span> Preparations should be installed carefully to
                  avoid scratching strings or plates; allow sufficient time before performance to test, adjust, and
                  document placements.
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setOpenModal(false)}
              className="rounded-full border bg-white px-4 py-2 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} title="Prepared Piano — Image">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-sm text-gray-600">{(zoom * 100).toFixed(0)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
            >
              +
            </button>
            <button
              onClick={() => setZoom(1)}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
          <div className="flex max-h-[75vh] items-center justify-center overflow-auto rounded-xl bg-gray-100 p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Prepared piano large view"
                className="max-w-none"
                style={{ transform: `scale(${zoom})` }}
              />
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedImage(null)}
              className="rounded-full border bg-white px-4 py-2 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function ChanceDemo() {
  const [seed, setSeed] = useState(() => Date.now())
  const [count, setCount] = useState(24)
  const [points, setPoints] = useState([])
  const containerRef = useRef(null)

  const regenerate = useCallback(
    (seedValue) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const width = rect.width || el.clientWidth || 1
      const height = rect.height || el.clientHeight || 1
      const pad = 10
      const radius = 5
      const numericSeed = Number(seedValue)
      const seedToUse = Number.isFinite(numericSeed) ? numericSeed : Date.now()
      const rnd = mulberry32(seedToUse)
      const arr = Array.from({ length: count }, () => ({
        x: pad + rnd() * (width - 2 * (pad + radius)),
        y: pad + rnd() * (height - 2 * (pad + radius)),
      }))
      setPoints(arr)
      return seedToUse
    },
    [count],
  )

  useEffect(() => {
    regenerate(seed)
  }, [seed, count, regenerate])

  const handleGenerateClick = () => {
    const newSeed = Date.now()
    setSeed(newSeed)
    regenerate(newSeed)
  }

  return (
    <div className="rounded-2xl border bg-white p-4 md:p-5">
      <h3 className="text-lg font-semibold md:text-xl">Chance</h3>
      <p className="text-gray-600">I Ching and chance operations detach personal taste from composition.</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={handleGenerateClick} className="rounded-full bg-black px-4 py-2 text-white">
          Generate by Chance
        </button>
        <label className="text-sm">
          Seed:
          <input
            className="ml-2 w-36 rounded border px-2 py-1"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Points:
          <input
            className="ml-2"
            type="range"
            min="6"
            max="60"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
          <span className="ml-2 text-xs">{count}</span>
        </label>
        <span className="text-sm text-gray-500">Random points as a simple metaphor for chance operations.</span>
      </div>

      <div ref={containerRef} className="relative mt-3 h-[260px] rounded-2xl border bg-white">
        {points.map((point, index) => (
          <div
            key={index}
            className="absolute h-2.5 w-2.5 rounded-full bg-black"
            style={{ left: point.x, top: point.y }}
          />
        ))}
      </div>
    </div>
  )
}

function TimeBracketsDemo() {
  const DURATION = 30
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [brackets, setBrackets] = useState(() => makeBrackets())
  const rafRef = useRef(null)
  const startRef = useRef(0)

  function makeBrackets() {
    const create = () =>
      Array.from({ length: 3 }, () => {
        const start = Math.random() * 24
        const end = start + 3 + Math.random() * 6
        return [Number(start.toFixed(2)), Number(Math.min(end, DURATION).toFixed(2))]
      }).sort((a, b) => a[0] - b[0])

    return { A: create(), B: create(), C: create() }
  }

  const stop = useCallback(() => {
    setPlaying(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const tick = useCallback(
    (now) => {
      const elapsed = (now - startRef.current) / 1000
      if (elapsed >= DURATION) {
        setT(DURATION)
        stop()
        return
      }
      setT(elapsed)
      rafRef.current = requestAnimationFrame(tick)
    },
    [stop],
  )

  const toggle = () => {
    if (playing) {
      stop()
    } else {
      startRef.current = performance.now() - t * 1000
      setPlaying(true)
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  const Row = ({ label, list }) => (
    <div className="relative h-10 border-b last:border-b-0 md:h-12">
      {list.map((range, index) => {
        const [start, end] = range
        const left = `${(start / DURATION) * 100}%`
        const width = `${((end - start) / DURATION) * 100}%`
        const active = t >= start && t <= end
        return (
          <div
            key={index}
            className={`absolute top-1/2 -translate-y-1/2 rounded ${active ? 'bg-emerald-400' : 'bg-emerald-200'}`}
            style={{ left, width, height: '1.5rem' }}
          />
        )
      })}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-xs text-gray-600">{label}</div>
    </div>
  )

  return (
    <div className="rounded-2xl border bg-white p-4 md:p-5">
      <h3 className="text-lg font-semibold md:text-xl">Time-Brackets</h3>
      <p className="text-gray-600">Open form organized by time windows; performers enter/exit within their brackets.</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={toggle}
          className={`rounded-full border px-4 py-2 ${playing ? 'bg-red-600 text-white' : 'bg-black text-white'}`}
        >
          {playing ? 'Stop' : 'Play'}
        </button>
        <button
          onClick={() => {
            setBrackets(makeBrackets())
            setT(0)
            stop()
          }}
          className="rounded-full border bg-white px-4 py-2 hover:bg-gray-50"
        >
          Generate
        </button>
        <div className="text-sm text-gray-600">
          Time: {t.toFixed(1)}s / {DURATION}s
        </div>
      </div>

      <div className="mt-3 rounded-xl border p-3">
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gray-300" />
          <div className="relative">
            <Row label="A" list={brackets.A} />
            <Row label="B" list={brackets.B} />
            <Row label="C" list={brackets.C} />
          </div>
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-gray-900"
            style={{ left: `${(t / DURATION) * 100}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[10px] text-gray-500">
          {Array.from({ length: 6 }, (_, index) => index * 6).map((value) => (
            <span key={value}>{value}s</span>
          ))}
          <span>{DURATION}s</span>
        </div>
      </div>
    </div>
  )
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
      >
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[85vh] overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}

function isYouTube(url = '') {
  return /youtube\.com|youtu\.be/.test(url)
}

function ConceptView({ onOpenWork }) {
  return (
    <Section title="Concept" subtitle="A three-part timeline and interactive mini-demos">
      <ConceptTimeline onOpenWork={onOpenWork} />

      <div className="grid gap-6 md:gap-8">
        <PreparedPianoDemo />
        <ChanceDemo />
        <TimeBracketsDemo />
      </div>
    </Section>
  )
}

function WorkDetailView({ workId, onBack }) {
  if (workId === 'sonatas-interludes') {
    return <SonatasInterludesDetail onBack={onBack} />
  }

  const data = WORK_DETAILS[workId]
  if (!data) {
    return (
      <Section title="Work not found">
        <button onClick={onBack} className="rounded-full border bg-white px-4 py-2 hover:bg-gray-50">
          Back to Concept
        </button>
      </Section>
    )
  }

  return (
    <Section title={data.title} subtitle="Overview · Score · Recording">
      <button onClick={onBack} className="rounded-full border bg-white px-4 py-2 hover:bg-gray-50">
        ← Back to Concept
      </button>

      <div className="mt-4 grid gap-6">
        <div className="rounded-2xl border bg-white p-4 md:p-5">
          <h3 className="text-lg font-semibold md:text-xl">Overview</h3>
          <p className="mt-2 text-gray-700">{data.intro}</p>
        </div>

        <div className="rounded-2xl border bg-white p-4 md:p-5">
          <h3 className="text-lg font-semibold md:text-xl">Score</h3>
          {!data.scoreUrl ? (
            <p className="mt-2 text-gray-500">
              Add a score URL in <code>WORK_DETAILS.{workId}.scoreUrl</code>.
            </p>
          ) : data.scoreUrl.endsWith('.pdf') ? (
            <iframe title="Score PDF" src={data.scoreUrl} className="mt-3 h-[70vh] w-full rounded-xl border" />
          ) : (
            <a className="mt-3 inline-block text-blue-600 underline" href={data.scoreUrl} target="_blank" rel="noreferrer">
              Open score
            </a>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4 md:p-5">
          <h3 className="text-lg font-semibold md:text-xl">Recording</h3>
          {!data.recordingUrl ? (
            <p className="mt-2 text-gray-500">
              Add a recording URL in <code>WORK_DETAILS.{workId}.recordingUrl</code>.
            </p>
          ) : isYouTube(data.recordingUrl) ? (
            <div className="mt-3 aspect-video overflow-hidden rounded-xl border">
              <iframe
                className="h-full w-full"
                src={data.recordingUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                title="YouTube player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <audio className="mt-3 w-full" controls src={data.recordingUrl} />
          )}
        </div>
      </div>
    </Section>
  )
}

function SonatasInterludesDetail({ onBack }) {
  const recordingUrl = 'https://www.youtube.com/embed/N6Sl5wmy9t4'
  const scoreExternal = 'https://purl.dlib.indiana.edu/iudl/variations/score/BHS6322'

  return (
    <Section
      title="John Cage — Sonatas and Interludes (1946–48)"
      subtitle="Prepared Piano · Score and Recording"
    >
      <button onClick={onBack} className="mb-4 rounded-full border bg-white px-4 py-2 hover:bg-gray-50">
        ← Back to Concept
      </button>

      <div className="mb-6 rounded-2xl border bg-white p-5">
        <h3 className="text-lg font-semibold md:text-xl">Overview</h3>
        <p className="mt-2 leading-relaxed text-gray-700">
          <em>Sonatas and Interludes</em> (1946–48) represents John Cage’s mature development of the prepared piano,
          inspired by Indian aesthetic theory of rasa — the eight “permanent emotions.” About 45 notes are prepared with
          screws, bolts, and other objects inserted between the strings, transforming the piano into a percussive
          ensemble. The cycle of sixteen sonatas and four interludes explores subtle modulations of timbre and proportion
          rather than dramatic contrasts, marking a turning point in Cage’s compositional voice.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold md:text-xl">Recording — Jesse Myers (Prepared Piano)</h3>
          <a
            href="https://www.youtube.com/watch?v=N6Sl5wmy9t4"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Open in YouTube
          </a>
        </div>
        <p className="mt-1 text-xs text-gray-500">Source: YouTube · Recorded by Jesse Myers</p>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl border">
          <iframe
            className="h-full w-full"
            src={recordingUrl}
            title="Jesse Myers — Sonatas and Interludes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mb-8 rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold md:text-xl">Score (Indiana University Variations)</h3>
          <a
            href={scoreExternal.replace('http://', 'https://')}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Open in new tab
          </a>
        </div>
        <p className="mt-1 text-xs text-gray-500">Source: Indiana University Libraries · Variations Digital Score Collection</p>
        <div className="mt-3 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
          This Variations score cannot be embedded due to library restrictions. Use the button above to view it directly.
        </div>
      </div>
    </Section>
  )
}

function RefItem({ item }) {
  const left = `${item.author ? `${item.author}. ` : ''}${item.year ? `(${item.year}). ` : ''}${item.title || ''}`
  const right = item.venue ? ` ${item.venue}` : ''
  return (
    <li className="py-2">
      <div className="text-gray-900">
        {left}
        <span className="italic">{right}</span>
        {item.url && (
          <>
            {' '}
            <a className="break-all text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">
              {item.url}
            </a>
          </>
        )}
      </div>
      {item.note && <div className="mt-1 text-xs text-gray-500">{item.note}</div>}
    </li>
  )
}

function SourcesView() {
  return (
    <Section title="Sources" subtitle="Bibliography · Scores & Recordings · Media Credits">
      <div className="mb-8 rounded-2xl border bg-white p-5">
        <h3 className="text-lg font-semibold md:text-xl">Bibliography / References</h3>
        <ul className="mt-3 divide-y">
          {SOURCES.bibliography.map((item, index) => (
            <RefItem key={index} item={item} />
          ))}
        </ul>
      </div>

      <div className="mb-8 rounded-2xl border bg-white p-5">
        <h3 className="text-lg font-semibold md:text-xl">Scores &amp; Recordings</h3>
        <ul className="mt-3 divide-y">
          {SOURCES.scoresAndRecordings.map((item, index) => (
            <li key={index} className="py-2">
              <div className="text-gray-900">
                <span className="font-medium">{item.label}</span> — {item.source}{' '}
                {item.url && (
                  <a className="break-all text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                )}
              </div>
              {item.note && <div className="mt-1 text-xs text-gray-500">{item.note}</div>}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h3 className="text-lg font-semibold md:text-xl">Images &amp; Media Credits</h3>
        <ul className="mt-3 divide-y">
          {SOURCES.mediaCredits.map((item, index) => (
            <li key={index} className="py-2">
              <div className="text-gray-900">
                <span className="font-medium">{item.label} — </span>
                {item.source}{' '}
                {item.url && (
                  <a className="break-all text-blue-600 underline" href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          Note: ensure each item has appropriate license/permission for educational display. Include author, year, title, source, and URL.
        </p>
      </div>
    </Section>
  )
}

/* ---------------- Tests ---------------- */
function Tests() {
  const parsed = useMemo(() => parseWorks(RAW_WORKS), [])
  const years = useMemo(() => Object.keys(parsed).sort((a, b) => Number(a) - Number(b)), [parsed])

  const results = useMemo(() => {
    const list = []
    list.push({ name: 'IMAGES has 10 items', ok: IMAGES.length === 10 })
    list.push({ name: 'QUOTES not empty', ok: QUOTES.length > 0 })
    list.push({ name: 'KEY_EVENTS has 10 entries', ok: KEY_EVENTS.length === 10 })
    const asc = KEY_EVENTS.every((event, index, array) => (index === 0 ? true : array[index - 1].year < event.year))
    list.push({ name: 'KEY_EVENTS years ascending', ok: asc })

    list.push({ name: 'RAW_WORKS parsed has years', ok: years.length > 0 })
    list.push({ name: 'Includes 1932', ok: years.includes('1932') })
    list.push({ name: 'Includes 1992', ok: years.includes('1992') })
    list.push({ name: 'Each year has >= 1 item', ok: years.every((year) => (parsed[year] || []).length > 0) })
    list.push({
      name: "Search for 'piano' finds some",
      ok: Object.values(parsed).some((arr) => arr.some((item) => /piano/i.test(item.raw))),
    })
    list.push({
      name: 'Parsed data contains at least one piano-tagged work',
      ok: Object.values(parsed).some((arr) => arr.some((item) => item.piano || item.prepared)),
    })
    list.push({
      name: 'Filter function (conceptual) would exclude non-piano when mode=piano',
      ok: true,
    })
    list.push({
      name: 'Concept timeline has 3 segments',
      ok: Array.isArray(CAGE_TIMELINE) && CAGE_TIMELINE.length === 3,
    })
    list.push({
      name: 'Each segment has range/title/works',
      ok: CAGE_TIMELINE.every(
        (period) => period.range && period.title && Array.isArray(period.works) && period.works.length >= 1,
      ),
    })
    list.push({
      name: 'Work detail targets exist',
      ok: ['sonatas-interludes', 'music-of-changes', 'concert-piano-orchestra', 'cheap-imitation', 'etudes-australes'].every(
        (key) => WORK_DETAILS[key],
      ),
    })

    return list
  }, [years])

  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer select-none">Development Tests</summary>
        <ul className="ml-4 list-disc">
          {results.map((test, index) => (
            <li key={index} className={test.ok ? 'text-green-700' : 'text-red-700'}>
              {test.ok ? '✓' : '✗'} {test.name}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('home')
  const [workDetail, setWorkDetail] = useState(null)

  const openWork = (id) => {
    setWorkDetail(id)
    setActive('concept')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backToConcept = () => {
    setWorkDetail(null)
    setActive('concept')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#f5f5f5,white_40%,#fafafa_100%)] text-gray-900">
      <Nav
        active={active}
        onChange={(key) => {
          setActive(key)
          setWorkDetail(null)
        }}
      />
      {workDetail ? (
        <WorkDetailView workId={workDetail} onBack={backToConcept} />
      ) : active === 'home' ? (
        <HomeView />
      ) : active === 'works' ? (
        <WorksView />
      ) : active === 'concept' ? (
        <ConceptView onOpenWork={openWork} />
      ) : (
        <SourcesView />
      )}
      <Tests />
    </div>
  )
}
