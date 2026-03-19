const elements = {
  sourceText: document.querySelector('#sourceText'),
  projectName: document.querySelector('#projectName'),
  stylePreset: document.querySelector('#stylePreset'),
  glossaryText: document.querySelector('#glossaryText'),
  rulesText: document.querySelector('#rulesText'),
  preserveNames: document.querySelector('#preserveNames'),
  preserveFormatting: document.querySelector('#preserveFormatting'),
  showArabicQuotes: document.querySelector('#showArabicQuotes'),
  doQaPass: document.querySelector('#doQaPass'),
  chunkSize: document.querySelector('#chunkSize'),
  overlapLines: document.querySelector('#overlapLines'),
  throughput: document.querySelector('#throughput'),
  totalChars: document.querySelector('#totalChars'),
  chunkCount: document.querySelector('#chunkCount'),
  glossaryCount: document.querySelector('#glossaryCount'),
  estimatedTime: document.querySelector('#estimatedTime'),
  chunkPreview: document.querySelector('#chunkPreview'),
  promptPreview: document.querySelector('#promptPreview'),
  copyPrompt: document.querySelector('#copyPrompt'),
  downloadChunks: document.querySelector('#downloadChunks'),
  demoButton: document.querySelector('#demoButton'),
  chunkTemplate: document.querySelector('#chunkCardTemplate')
};

const demoExcerpt = `Chapter 12 — The Lantern Bridge
Rain softened the city into silver. Mira stopped beneath the lantern bridge and listened to the river knock against the stone pilings.

"If he already knows we're coming," said Taren, "then stealth is a story we tell ourselves to feel brave."

Mira adjusted the letter hidden inside her sleeve. The seal of Silver Keep pressed against her wrist like a second pulse. She wished the night would choose one face and keep it: either storm or peace, hunter or witness.

Across the water, the bell tower sounded once. Then a second time, lower, as if the city had changed its mind.

"No heroics," she said.

Taren smiled in the old reckless way. "So only the necessary amount?"`;

function parseGlossary(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [source, ...targetParts] = line.split('=');
      return {
        source: source?.trim() || line,
        target: targetParts.join('=').trim() || '—'
      };
    });
}

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function chunkParagraphs(paragraphs, maxChars, overlapLines) {
  const chunks = [];
  let current = [];
  let currentLength = 0;

  paragraphs.forEach((paragraph) => {
    const addition = current.length === 0 ? paragraph.length : paragraph.length + 2;

    if (currentLength + addition > maxChars && current.length > 0) {
      chunks.push(current.join('\n\n'));
      const overlap = overlapLines > 0 ? current.slice(-overlapLines) : [];
      current = [...overlap, paragraph];
      currentLength = current.join('\n\n').length;
      return;
    }

    current.push(paragraph);
    currentLength += addition;
  });

  if (current.length > 0) {
    chunks.push(current.join('\n\n'));
  }

  return chunks;
}

function estimateTime(totalChars, throughput) {
  if (!totalChars || !throughput) {
    return '0 min';
  }

  const minutes = totalChars / throughput;

  if (minutes < 1) {
    return '<1 min';
  }

  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }

  return `${(minutes / 60).toFixed(1)} hr`;
}

function buildPrompt({ glossary, chunks }) {
  const rules = elements.rulesText.value
    .split('\n')
    .map((rule) => rule.trim())
    .filter(Boolean);

  const qaChecklist = elements.doQaPass.checked
    ? [
        'After translating, run a QA pass to ensure no sentence was omitted or summarized.',
        'Confirm tone, character voice, and dramatic pacing match the source.',
        'Verify punctuation, dialogue formatting, and glossary term consistency.'
      ]
    : [];

  const policyRules = [
    `Translate into ${elements.stylePreset.value}.`,
    'Do not summarize, censor, or simplify unless the source itself is simple.',
    elements.preserveNames.checked
      ? 'Preserve character and place names unless the glossary provides an Arabic form.'
      : 'Localize names naturally when that improves readability in Arabic.',
    elements.preserveFormatting.checked
      ? 'Preserve paragraph structure and scene breaks exactly.'
      : 'You may merge paragraphs only when it improves Arabic flow without losing structure.',
    elements.showArabicQuotes.checked
      ? 'Use natural Arabic punctuation and quotation marks where appropriate.'
      : 'Keep source punctuation style when possible.'
  ];

  const glossaryBlock = glossary.length
    ? glossary.map((entry) => `- ${entry.source} → ${entry.target}`).join('\n')
    : '- No glossary supplied yet.';

  return [
    `Project: ${elements.projectName.value || 'Untitled novel translation'}`,
    '',
    'SYSTEM / MASTER INSTRUCTIONS',
    ...policyRules.map((rule) => `- ${rule}`),
    ...rules.map((rule) => `- ${rule}`),
    ...qaChecklist.map((rule) => `- ${rule}`),
    '',
    'LOCKED GLOSSARY',
    glossaryBlock,
    '',
    'OUTPUT FORMAT',
    '- Return Arabic translation only for the provided chunk.',
    '- Keep chapter labels and inline emphasis when present.',
    '- Do not add notes unless a line is truly ambiguous and would change plot meaning.',
    '',
    `BATCH OVERVIEW: ${chunks.length} chunk(s) prepared.`,
    'Paste one chunk at a time under SOURCE CHUNK when sending to your model.',
    '',
    'SOURCE CHUNK',
    '[Paste chunk text here]'
  ].join('\n');
}

function renderChunks(chunks) {
  elements.chunkPreview.innerHTML = '';

  if (chunks.length === 0) {
    elements.chunkPreview.textContent = 'Add source text to generate chunks.';
    elements.chunkPreview.classList.add('empty-state');
    return;
  }

  elements.chunkPreview.classList.remove('empty-state');

  chunks.forEach((chunk, index) => {
    const clone = elements.chunkTemplate.content.cloneNode(true);
    const card = clone.querySelector('.chunk-card');
    const title = clone.querySelector('strong');
    const meta = clone.querySelector('span');
    const preview = clone.querySelector('p');

    title.textContent = `Chunk ${index + 1}`;
    meta.textContent = `${chunk.length} chars`;
    preview.textContent = chunk.slice(0, 320) + (chunk.length > 320 ? '…' : '');
    card.dataset.chunk = chunk;
    elements.chunkPreview.appendChild(clone);
  });
}

function updateApp() {
  const text = elements.sourceText.value.trim();
  const glossary = parseGlossary(elements.glossaryText.value);
  const paragraphs = splitParagraphs(text);
  const chunks = chunkParagraphs(
    paragraphs,
    Number(elements.chunkSize.value) || 3200,
    Number(elements.overlapLines.value) || 0
  );

  elements.totalChars.textContent = text.length.toLocaleString();
  elements.chunkCount.textContent = chunks.length.toLocaleString();
  elements.glossaryCount.textContent = glossary.length.toLocaleString();
  elements.estimatedTime.textContent = estimateTime(
    text.length,
    Number(elements.throughput.value) || 9000
  );

  renderChunks(chunks);
  elements.promptPreview.textContent = buildPrompt({ glossary, chunks });

  window.currentChunks = chunks;
}

function downloadChunks() {
  const payload = {
    project: elements.projectName.value,
    style: elements.stylePreset.value,
    chunks: (window.currentChunks || []).map((text, index) => ({
      id: index + 1,
      characters: text.length,
      text
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(elements.projectName.value || 'translation-batch')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}-chunks.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(elements.promptPreview.textContent);
    elements.copyPrompt.textContent = 'Copied!';
    setTimeout(() => {
      elements.copyPrompt.textContent = 'Copy prompt';
    }, 1500);
  } catch {
    elements.copyPrompt.textContent = 'Clipboard blocked';
    setTimeout(() => {
      elements.copyPrompt.textContent = 'Copy prompt';
    }, 1500);
  }
}

function attachEvents() {
  Object.values(elements).forEach((element) => {
    if (!element || !(element instanceof HTMLElement)) {
      return;
    }

    if (['BUTTON', 'TEMPLATE', 'PRE', 'DIV', 'STRONG', 'SPAN'].includes(element.tagName)) {
      return;
    }

    element.addEventListener('input', updateApp);
    element.addEventListener('change', updateApp);
  });

  elements.demoButton.addEventListener('click', () => {
    elements.sourceText.value = demoExcerpt;
    elements.glossaryText.value = 'Mira = ميرا\nTaren = تارن\nSilver Keep = الحصن الفضي\nLantern Bridge = جسر الفوانيس';
    elements.rulesText.value = 'Keep the prose cinematic and emotionally precise.\nAvoid overly literal Arabic when a smoother literary phrasing is available.\nMaintain tension in dialogue exchanges.';
    updateApp();
  });

  elements.copyPrompt.addEventListener('click', copyPrompt);
  elements.downloadChunks.addEventListener('click', downloadChunks);
}

attachEvents();
updateApp();
