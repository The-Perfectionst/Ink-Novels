const STORAGE_KEY = 'ink-novels-story-bible-v2';

const dom = {
  chapterForm: document.getElementById('chapterForm'),
  chapterTitle: document.getElementById('chapterTitle'),
  chapterArc: document.getElementById('chapterArc'),
  chapterText: document.getElementById('chapterText'),
  latestExtraction: document.getElementById('latestExtraction'),
  chapterCards: document.getElementById('chapterCards'),
  chapterCount: document.getElementById('chapterCount'),
  entityCount: document.getElementById('entityCount'),
  relationshipCount: document.getElementById('relationshipCount'),
  eventCount: document.getElementById('eventCount'),
  charactersList: document.getElementById('charactersList'),
  locationsList: document.getElementById('locationsList'),
  organizationsList: document.getElementById('organizationsList'),
  systemsList: document.getElementById('systemsList'),
  artifactsList: document.getElementById('artifactsList'),
  timelineList: document.getElementById('timelineList'),
  graphCanvas: document.getElementById('graphCanvas'),
  entityCardTemplate: document.getElementById('entityCardTemplate'),
  exportButton: document.getElementById('exportButton'),
  importInput: document.getElementById('importInput'),
  resetButton: document.getElementById('resetButton'),
  loadDemoButton: document.getElementById('loadDemoButton'),
  menuButton: document.getElementById('menuButton'),
};

const STOP_WORDS = new Set([
  'The', 'A', 'An', 'And', 'But', 'Or', 'If', 'When', 'After', 'Before', 'During', 'At', 'In',
  'On', 'To', 'From', 'For', 'With', 'Without', 'Into', 'By', 'As', 'He', 'She', 'They', 'We',
  'I', 'It', 'His', 'Her', 'Their', 'My', 'Our', 'Your', 'Chapter', 'Volume', 'Arc', 'Then',
  'There', 'That', 'This', 'These', 'Those', 'Night', 'Morning', 'Evening', 'Noon'
]);

const ORG_KEYWORDS = ['Guild', 'Order', 'House', 'Company', 'Temple', 'Council', 'Court', 'Legion', 'Clan', 'Watch'];
const LOCATION_HINTS = ['City', 'Forest', 'Kingdom', 'Market', 'Tower', 'Harbor', 'District', 'Village', 'Palace', 'Academy', 'Station', 'Wasteland', 'Carriage', 'Floor'];
const ARTIFACT_HINTS = ['Sword', 'Crown', 'Relic', 'Shard', 'Book', 'Ring', 'Key', 'Lantern', 'Amulet', 'Seal', 'Knife', 'Dagger'];
const SYSTEM_KEYWORDS = ['System', 'Rules', 'Rule', 'Platform', 'Room', 'Information', 'Details', 'Talent', 'Workbench', 'Module', 'Train'];
const EVENT_VERBS = ['revealed', 'discovered', 'confronted', 'escaped', 'arrived', 'found', 'accepted', 'awoke', 'unleashed', 'swore', 'woke', 'opened', 'pressed'];
const TYPE_COLORS = {
  character: '#7c9cff',
  location: '#73f0c4',
  organization: '#f5c06a',
  system: '#8ef0ff',
  artifact: '#ff8dbc',
  term: '#c1b8ff',
};

const initialState = { chapters: [], entities: {}, relationships: {}, timeline: [] };
let state = loadState();
let activeNode = null;

const chapterOneSeed = {
  title: 'Chapter 1 — The Train is About to Depart, May You All Live Forever',
  arc: 'Arc 1 — Awakening on the Train',
  synopsis:
    'Ye Qiyan wakes inside a mysterious train crossing an endless wasteland, learns the survival rules of the railway world, discovers a rare Talent called Sublimation, and successfully upgrades a starter knife before trying to use the same power on the train itself.',
  text:
    'Ye Qiyan wakes in a train carriage crossing an endless wasteland. A public announcement distributes Train Rules about stations, survival, resources, and train upgrades. He checks the Train Control System and finds train details, a chat room, and a trading platform. The chat reveals panic among ten thousand survivors and implies leaving the train early is fatal. In his personal information, Ye Qiyan learns he has the rare Talent Sublimation, which can evolve any existence by consuming Spirit or Stamina. He tests the Talent on a Shoddy Knife and turns it into a Sharp Enchanted Dagger, then prepares to try the same power on the train itself.',
  curatedEntities: [
    {
      name: 'Ye Qiyan',
      type: 'character',
      summary: 'The protagonist and current train conductor. He wakes inside the carriage, quickly tests the rules of the world, and discovers the rare Talent Sublimation.',
      notes: ['Role: protagonist', 'ID: E-3-1102', 'Starts with Spirit 100 and Stamina 100'],
    },
    {
      name: 'Xiaowen',
      type: 'character',
      summary: 'A name glimpsed in the global chat, showing that many survivors were separated from loved ones at the moment of arrival.',
      notes: ['Only mentioned through chat dialogue in chapter 1'],
    },
    {
      name: 'Train Carriage',
      type: 'location',
      summary: 'Ye Qiyan’s immediate starting environment. It is cold, sparse, and contains the train console and starter supplies.',
      notes: ['Initial safe zone', 'Contains the workbench and Train Control System'],
    },
    {
      name: 'Endless Wasteland',
      type: 'location',
      summary: 'The desolate landscape outside the train windows. Its scale reinforces the isolation and danger of the new world.',
      notes: ['Seen moving past both windows', 'Suggests an enormous hostile world'],
    },
    {
      name: 'Station',
      type: 'location',
      summary: 'The next major destination in the train loop. Trains reach a new Station every 24 hours and may stop for three hours.',
      notes: ['First stop arrives in one hour', 'Disembarking is optional once a Station is reached'],
    },
    {
      name: 'All Survivors',
      type: 'organization',
      summary: 'The broadcast’s label for the ten thousand people placed into the train survival scenario.',
      notes: ['Initial population shown as 10000', 'One person appears to die after leaving the train early'],
    },
    {
      name: 'Train Rules',
      type: 'system',
      summary: 'The foundational rule set governing trains, stations, resource collection, upgrading, and survival.',
      notes: ['Do not discard your train', 'Do not leave the train before arriving at a Station', 'Survive'],
    },
    {
      name: 'Train Control System',
      type: 'system',
      summary: 'The oval device and light screen at the front of the carriage that exposes the train interface.',
      notes: ['Front-of-carriage console', 'Acts as the primary interface for information and management'],
    },
    {
      name: 'Chat Room',
      type: 'system',
      summary: 'A global communication interface that immediately reveals the terror, denial, and confusion of other survivors.',
      notes: ['Population display changes from 10000 to 9999', 'Acts as an information source and mood barometer'],
    },
    {
      name: 'Trading Platform',
      type: 'system',
      summary: 'A listed train option, implying future player commerce even though it is not yet explored in detail.',
      notes: ['Visible in chapter 1 but not yet used'],
    },
    {
      name: 'Workbench',
      type: 'system',
      summary: 'A level 1 train module that can recycle and decompose resource items, hinting at early crafting and progression loops.',
      notes: ['Level 1 at the start', 'Part of train progression'],
    },
    {
      name: 'Sublimation',
      type: 'system',
      summary: 'Ye Qiyan’s Talent. It can evolve any existence regardless of category, level, or condition by consuming Spirit or Stamina.',
      notes: ['Likely rare or extremely rare', 'Successfully used on a knife in chapter 1'],
    },
    {
      name: 'Level 1 Train',
      type: 'artifact',
      summary: 'Ye Qiyan’s starting train with low speed, basic parts, and clear upgrade requirements for future progression.',
      notes: ['Speed: 20 km/h', 'Upgrade requirements include wood, metal, and machine parts'],
    },
    {
      name: 'Shoddy Knife',
      type: 'artifact',
      summary: 'The starter blade left on the workbench. It becomes the first successful target of Sublimation.',
      notes: ['Level 1 before evolution'],
    },
    {
      name: 'Sharp Enchanted Dagger',
      type: 'artifact',
      summary: 'The upgraded form of the Shoddy Knife after Ye Qiyan uses Sublimation and spends 10 Stamina.',
      notes: ['Level 2 after evolution', 'Confirms the Talent works in practice'],
    },
    {
      name: 'Spirit',
      type: 'term',
      summary: 'A mental attribute tied to fatigue, doubt, sanity, and frenzy thresholds.',
      notes: ['Displayed in personal information'],
    },
    {
      name: 'Stamina',
      type: 'term',
      summary: 'A physical resource used for action and Talent activation. Sublimation of the knife reduces it from 100 to 90.',
      notes: ['Can be restored through food or rest'],
    },
  ],
  relationships: [
    ['Ye Qiyan', 'Sublimation', 5],
    ['Ye Qiyan', 'Train Control System', 4],
    ['Ye Qiyan', 'Level 1 Train', 4],
    ['Ye Qiyan', 'Sharp Enchanted Dagger', 4],
    ['Ye Qiyan', 'Train Rules', 3],
    ['Train Rules', 'Station', 4],
    ['Train Rules', 'All Survivors', 3],
    ['Train Control System', 'Chat Room', 3],
    ['Train Control System', 'Trading Platform', 2],
    ['Train Control System', 'Workbench', 2],
    ['Sublimation', 'Shoddy Knife', 3],
    ['Sublimation', 'Sharp Enchanted Dagger', 4],
    ['Level 1 Train', 'Workbench', 2],
    ['Level 1 Train', 'Station', 2],
    ['Train Carriage', 'Workbench', 2],
    ['Train Carriage', 'Train Control System', 3],
    ['Chat Room', 'All Survivors', 3],
  ],
  timeline: [
    'Ye Qiyan wakes in a train carriage with no clear memory of how he arrived.',
    'A broadcast announces the Train Rules and explains stations, train upgrading, and survival.',
    'The Chat Room proves that ten thousand survivors were brought here together and implies leaving the train early is fatal.',
    'Ye Qiyan inspects the train details and realizes speed may matter even in a fixed station cycle.',
    'He discovers his personal Talent, Sublimation, and realizes it may be extremely rare.',
    'Ye Qiyan upgrades a Shoddy Knife into a Sharp Enchanted Dagger, confirming the Talent works.',
    'With growing confidence, he attempts to use Sublimation on the train itself.',
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : structuredClone(initialState);
  } catch (error) {
    console.warn('Failed to load saved story bible state.', error);
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeName(value) {
  return value.replace(/[^\p{L}\p{N}' -]/gu, '').trim().replace(/\s+/g, ' ');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function chapterIdFromTitle(title) {
  return `chapter-${slugify(title)}`;
}

function entityKey(type, name) {
  return `${type}:${name.toLowerCase()}`;
}

function sentenceSplit(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function classifyName(name) {
  if (SYSTEM_KEYWORDS.some((keyword) => name.includes(keyword))) return 'system';
  if (ORG_KEYWORDS.some((keyword) => name.includes(keyword))) return 'organization';
  if (LOCATION_HINTS.some((keyword) => name.includes(keyword))) return 'location';
  if (ARTIFACT_HINTS.some((keyword) => name.includes(keyword))) return 'artifact';
  if (name.split(' ').length === 1 && name.length > 10) return 'term';
  return 'character';
}

function extractCandidates(text) {
  const sentences = sentenceSplit(text);
  const candidates = {
    character: new Map(),
    location: new Map(),
    organization: new Map(),
    system: new Map(),
    artifact: new Map(),
    term: new Map(),
    events: [],
    sentenceEntities: [],
  };

  sentences.forEach((sentence, index) => {
    const foundInSentence = [];
    const multiWordMatches = sentence.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g) || [];

    multiWordMatches.forEach((match) => {
      const name = normalizeName(match);
      if (!name || STOP_WORDS.has(name)) return;
      const type = classifyName(name);
      candidates[type].set(name, (candidates[type].get(name) || 0) + 1);
      foundInSentence.push({ name, type });
    });

    if (EVENT_VERBS.some((verb) => sentence.toLowerCase().includes(verb)) || foundInSentence.length >= 3) {
      candidates.events.push({
        summary: sentence,
        sourceSentence: index + 1,
        entities: [...new Set(foundInSentence.map((item) => item.name))],
      });
    }

    candidates.sentenceEntities.push([...new Map(foundInSentence.map((item) => [item.name, item])).values()]);
  });

  return candidates;
}

function buildSummary(type, name, chapterTitle, count) {
  const intros = {
    character: `${name} appears to be a character with narrative presence in ${chapterTitle}.`,
    location: `${name} is treated as a place or environmental anchor in ${chapterTitle}.`,
    organization: `${name} looks like a group, population, or power structure in ${chapterTitle}.`,
    system: `${name} functions as a rule, interface, or progression mechanic in ${chapterTitle}.`,
    artifact: `${name} stands out as a named object, item, or vehicle in ${chapterTitle}.`,
    term: `${name} looks like a recurring concept or stat term introduced in ${chapterTitle}.`,
  };

  return `${intros[type]} Detected ${count} time${count === 1 ? '' : 's'} so far.`;
}

function mergeEntity(name, type, chapterMeta, count, custom = {}) {
  const key = entityKey(type, name);
  const existing = state.entities[key] || {
    key,
    name,
    type,
    chapters: [],
    appearances: 0,
    summary: '',
    notes: [],
  };

  existing.name = name;
  existing.type = type;
  existing.appearances += count;
  existing.summary = custom.summary || existing.summary || buildSummary(type, name, chapterMeta.title, existing.appearances);
  existing.notes = [...new Set([...(existing.notes || []), ...(custom.notes || [])])];
  if (!existing.chapters.some((chapter) => chapter.id === chapterMeta.id)) {
    existing.chapters.push({ id: chapterMeta.id, title: chapterMeta.title, arc: chapterMeta.arc });
  }

  state.entities[key] = existing;
  return key;
}

function mergeRelationshipKeys(keyA, keyB, weight = 1) {
  if (!keyA || !keyB || keyA === keyB) return;
  const [a, b] = [keyA, keyB].sort();
  const relationKey = `${a}__${b}`;
  state.relationships[relationKey] = (state.relationships[relationKey] || 0) + weight;
}

function mergeRelationships(entityKeys) {
  for (let i = 0; i < entityKeys.length; i += 1) {
    for (let j = i + 1; j < entityKeys.length; j += 1) {
      mergeRelationshipKeys(entityKeys[i], entityKeys[j], 1);
    }
  }
}

function ingestChapter(title, arc, text, options = {}) {
  const extraction = extractCandidates(text);
  const chapterMeta = {
    id: chapterIdFromTitle(title),
    title,
    arc: arc || 'Unsorted arc',
    synopsis: options.synopsis || extraction.events[0]?.summary || text.slice(0, 220),
    excerpt: text.slice(0, 220),
    createdAt: new Date().toISOString(),
  };

  state.chapters = state.chapters.filter((chapter) => chapter.id !== chapterMeta.id);
  state.chapters.push(chapterMeta);

  ['character', 'location', 'organization', 'system', 'artifact', 'term'].forEach((type) => {
    extraction[type].forEach((count, name) => {
      mergeEntity(name, type, chapterMeta, count);
    });
  });

  (options.curatedEntities || []).forEach((entity) => {
    mergeEntity(entity.name, entity.type, chapterMeta, 1, entity);
  });

  extraction.sentenceEntities.forEach((items) => {
    const keys = items.map((item) => entityKey(item.type, item.name)).filter((key) => state.entities[key]);
    mergeRelationships([...new Set(keys)]);
  });

  (options.relationships || []).forEach(([nameA, nameB, weight]) => {
    const keyA = Object.values(state.entities).find((entity) => entity.name === nameA)?.key;
    const keyB = Object.values(state.entities).find((entity) => entity.name === nameB)?.key;
    mergeRelationshipKeys(keyA, keyB, weight);
  });

  const timelineEvents = options.timeline || extraction.events.slice(0, 6).map((event) => event.summary);
  timelineEvents.forEach((summary, index) => {
    const exists = state.timeline.some((event) => event.chapterId === chapterMeta.id && event.summary === summary);
    if (exists) return;
    state.timeline.push({
      id: `${chapterMeta.id}-event-${index}`,
      chapterId: chapterMeta.id,
      chapterTitle: chapterMeta.title,
      arc: chapterMeta.arc,
      summary,
      entities: [],
      sortOrder: state.timeline.length,
    });
  });

  saveState();
  render(extraction, chapterMeta);
}

function ensureSeedData() {
  if (state.chapters.length) return;
  ingestChapter(chapterOneSeed.title, chapterOneSeed.arc, chapterOneSeed.text, chapterOneSeed);
}

function entityGroups() {
  return Object.values(state.entities).reduce(
    (acc, entity) => {
      acc[entity.type].push(entity);
      return acc;
    },
    { character: [], location: [], organization: [], system: [], artifact: [], term: [] },
  );
}

function connectedNames(entityKeyValue) {
  return Object.entries(state.relationships)
    .filter(([key]) => key.includes(entityKeyValue))
    .map(([key, weight]) => {
      const [a, b] = key.split('__');
      const otherKey = a === entityKeyValue ? b : a;
      const other = state.entities[otherKey];
      return other ? `${other.name} (${weight})` : null;
    })
    .filter(Boolean)
    .slice(0, 6);
}

function renderEntityList(container, entities) {
  container.innerHTML = '';
  if (!entities.length) {
    container.classList.add('empty-state');
    container.textContent = 'Nothing here yet.';
    return;
  }

  container.classList.remove('empty-state');
  const sorted = [...entities].sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name));

  sorted.forEach((entity) => {
    const node = dom.entityCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.entity-type').textContent = entity.type;
    node.querySelector('.entity-name').textContent = entity.name;
    node.querySelector('.entity-frequency').textContent = `${entity.appearances} mentions`;
    node.querySelector('.entity-summary').textContent = entity.summary;

    const tagRow = node.querySelector('.tag-row');
    entity.chapters.slice(-3).forEach((chapter) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = chapter.title;
      tagRow.appendChild(tag);
    });

    (entity.notes || []).slice(0, 2).forEach((note) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = note;
      tagRow.appendChild(tag);
    });

    connectedNames(entity.key).slice(0, 2).forEach((name) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = `↔ ${name}`;
      tagRow.appendChild(tag);
    });

    container.appendChild(node);
  });
}

function renderChapterCards() {
  dom.chapterCards.innerHTML = '';
  if (!state.chapters.length) {
    dom.chapterCards.className = 'chapter-grid empty-state';
    dom.chapterCards.textContent = 'Chapter entries will appear here.';
    return;
  }

  dom.chapterCards.className = 'chapter-grid';
  state.chapters.forEach((chapter) => {
    const card = document.createElement('article');
    card.className = 'chapter-card';
    const relatedEntities = Object.values(state.entities)
      .filter((entity) => entity.chapters.some((entry) => entry.id === chapter.id))
      .slice(0, 8)
      .map((entity) => `<span class="tag">${entity.name}</span>`)
      .join('');

    card.innerHTML = `
      <p class="tiny-label">${chapter.arc}</p>
      <h4>${chapter.title}</h4>
      <p class="entity-summary">${chapter.synopsis}</p>
      <div class="tag-row">${relatedEntities}</div>
    `;
    dom.chapterCards.appendChild(card);
  });
}

function renderTimeline() {
  dom.timelineList.innerHTML = '';
  if (!state.timeline.length) {
    dom.timelineList.className = 'timeline empty-state';
    dom.timelineList.textContent = 'No timeline entries yet.';
    return;
  }

  dom.timelineList.className = 'timeline';
  state.timeline.forEach((event) => {
    const article = document.createElement('article');
    article.className = 'timeline-item';
    article.innerHTML = `
      <h4>${event.summary}</h4>
      <p class="timeline-meta">${event.chapterTitle} · ${event.arc}</p>
    `;
    dom.timelineList.appendChild(article);
  });
}

function renderExtraction(extraction, chapterMeta) {
  const sections = ['character', 'location', 'organization', 'system', 'artifact', 'term']
    .map((type) => {
      const values = [...extraction[type].entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      return `
        <section class="extraction-group">
          <h4>${type[0].toUpperCase() + type.slice(1)}${type.endsWith('s') ? '' : 's'}</h4>
          ${values.length
            ? `<ul>${values.map(([name, count]) => `<li>${name} <span class="tiny-label">· ${count}</span></li>`).join('')}</ul>`
            : '<p>No strong matches in this category.</p>'}
        </section>
      `;
    })
    .join('');

  dom.latestExtraction.className = 'extraction-groups';
  dom.latestExtraction.innerHTML = `
    <div class="tag-row">
      <span class="tag">${chapterMeta.title}</span>
      <span class="tag">${chapterMeta.arc}</span>
      <span class="tag">${sentenceSplit(chapterMeta.excerpt).length}+ sentences sampled</span>
    </div>
    ${sections}
  `;
}

function renderGraph() {
  dom.graphCanvas.innerHTML = '';
  const entities = Object.values(state.entities).sort((a, b) => b.appearances - a.appearances).slice(0, 24);
  if (!entities.length) {
    dom.graphCanvas.innerHTML = '<div class="empty-state">Add chapters to generate a relationship graph.</div>';
    return;
  }

  const width = dom.graphCanvas.clientWidth || 900;
  const height = dom.graphCanvas.clientHeight || 460;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(120, Math.min(width, height) * 0.34);

  const positions = entities.map((entity, index) => {
    const angle = (Math.PI * 2 * index) / entities.length;
    const wobble = index % 2 === 0 ? 22 : -18;
    return {
      ...entity,
      x: centerX + Math.cos(angle) * (radius + wobble),
      y: centerY + Math.sin(angle) * (radius - wobble),
    };
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries(state.relationships).forEach(([relationKey, weight]) => {
    const [a, b] = relationKey.split('__');
    const source = positions.find((entry) => entry.key === a);
    const target = positions.find((entry) => entry.key === b);
    if (!source || !target) return;

    const isActive = !activeNode || a === activeNode || b === activeNode;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', source.x);
    line.setAttribute('y1', source.y);
    line.setAttribute('x2', target.x);
    line.setAttribute('y2', target.y);
    line.setAttribute('stroke', isActive ? 'rgba(206, 220, 255, 0.4)' : 'rgba(206, 220, 255, 0.12)');
    line.setAttribute('stroke-width', Math.min(6, 1 + weight * 0.45));
    svg.appendChild(line);
  });
  dom.graphCanvas.appendChild(svg);

  positions.forEach((entity) => {
    const button = document.createElement('button');
    button.className = 'node-button';
    if (entity.key === activeNode) button.classList.add('active');
    button.style.left = `${entity.x}px`;
    button.style.top = `${entity.y}px`;
    button.style.transform = 'translate(-50%, -50%)';
    button.style.borderColor = `${TYPE_COLORS[entity.type]}66`;
    button.style.boxShadow = `0 0 0 1px ${TYPE_COLORS[entity.type]}33, 0 12px 24px rgba(0,0,0,0.24)`;
    button.textContent = entity.name;
    button.addEventListener('click', () => {
      activeNode = activeNode === entity.key ? null : entity.key;
      render();
    });
    dom.graphCanvas.appendChild(button);
  });
}

function renderStats() {
  dom.chapterCount.textContent = state.chapters.length;
  dom.entityCount.textContent = Object.keys(state.entities).length;
  dom.relationshipCount.textContent = Object.keys(state.relationships).length;
  dom.eventCount.textContent = state.timeline.length;
}

function render(extraction = null, chapterMeta = null) {
  const groups = entityGroups();
  renderStats();
  renderChapterCards();
  renderEntityList(dom.charactersList, groups.character);
  renderEntityList(dom.locationsList, groups.location);
  renderEntityList(dom.organizationsList, groups.organization);
  renderEntityList(dom.systemsList, groups.system);
  renderEntityList(dom.artifactsList, [...groups.artifact, ...groups.term]);
  renderTimeline();
  renderGraph();

  if (extraction && chapterMeta) {
    renderExtraction(extraction, chapterMeta);
  } else if (state.chapters.length) {
    dom.latestExtraction.className = 'extraction-groups';
    dom.latestExtraction.innerHTML = `
      <section class="extraction-group">
        <h4>Current seed</h4>
        <p>${state.chapters[0].title} has been curated into the bible and can be expanded with the next chapter.</p>
      </section>
    `;
  } else {
    dom.latestExtraction.className = 'empty-state';
    dom.latestExtraction.textContent = 'Add a chapter to see extracted entities, linked notes, and event candidates.';
  }
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'story-bible.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      state = {
        chapters: parsed.chapters || [],
        entities: parsed.entities || {},
        relationships: parsed.relationships || {},
        timeline: parsed.timeline || [],
      };
      saveState();
      render();
    } catch (error) {
      alert('Could not import that JSON file.');
    }
  };
  reader.readAsText(file);
}

function resetState() {
  state = structuredClone(initialState);
  activeNode = null;
  localStorage.removeItem(STORAGE_KEY);
  ensureSeedData();
  render();
}

function loadDemoData() {
  resetState();
  ingestChapter(
    'Chapter 2 — The Console Hums Back',
    'Arc 1 — Awakening on the Train',
    'Ye Qiyan studies the Train Control System again while the Station draws nearer. He reopens the Chat Room, compares survivor reactions, and keeps the Sharp Enchanted Dagger close. The Level 1 Train feels less like a prison and more like an extension of his Talent as he prepares to sublimate it next.',
    {
      synopsis: 'A short demo chapter showing how additional entries stack on top of the seeded chapter one bible.',
    },
  );
}

dom.chapterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  ingestChapter(dom.chapterTitle.value.trim(), dom.chapterArc.value.trim(), dom.chapterText.value.trim());
  dom.chapterForm.reset();
});

dom.exportButton.addEventListener('click', exportState);
dom.importInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) importState(file);
});
dom.resetButton.addEventListener('click', resetState);
dom.loadDemoButton.addEventListener('click', loadDemoData);
dom.menuButton.addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});

document.addEventListener('click', (event) => {
  if (window.innerWidth > 1100) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('#sidebar') || target.closest('#menuButton')) return;
  document.body.classList.remove('sidebar-open');
});

window.addEventListener('resize', () => render());

ensureSeedData();
render();
