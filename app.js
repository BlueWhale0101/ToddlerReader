const state = {
  childName: 'TORBEN',
  feedStickers: 0,
  huntStickers: 0,
  nameProgress: [],
  currentGame: 'home',
  currentFeedRound: null,
  currentHuntRound: null,
  audioUnlocked: false,
  calmMode: false,
  stats: {feed:0,hunt:0,name:0},
  misses: {},
  mastery: {},
  ponyVoiceIndex: 0,
  pony: {accessory:'🎀', blanket:'🟪', treat:'🥕'},
  unlocks: {accessories:['🎀'], blankets:['🟪'], treats:['🥕']},
  pendingUnlock: null,
  ponyPositions: {accessory:{x:64,y:22}, blanket:{x:46,y:58}, treat:{x:77,y:60}}
};

const feedRounds = [
  { letter:'A', sound:'ah', prompt:'Feed the pony something that starts with /a/!', choices:[{emoji:'🍎',label:'apple',ok:true},{emoji:'🥕',label:'carrot'},{emoji:'🍞',label:'bread'}] },
  { letter:'B', sound:'buh', prompt:'Feed the pony something that starts with /b/!', choices:[{emoji:'🍌',label:'banana',ok:true},{emoji:'🍎',label:'apple'},{emoji:'🥛',label:'milk'}] },
  { letter:'C', sound:'kuh', prompt:'Feed the pony something that starts with /c/!', choices:[{emoji:'🥕',label:'carrot',ok:true},{emoji:'🍇',label:'grapes'},{emoji:'🧀',label:'cheese'}] },
  { letter:'G', sound:'guh', prompt:'Feed the pony something that starts with /g/!', choices:[{emoji:'🍇',label:'grapes',ok:true},{emoji:'🍌',label:'banana'},{emoji:'🥕',label:'carrot'}] },
  { letter:'M', sound:'mmm', prompt:'Feed the pony something that starts with /m/!', choices:[{emoji:'🥛',label:'milk',ok:true},{emoji:'🍎',label:'apple'},{emoji:'🍞',label:'bread'}] },
  { letter:'P', sound:'puh', prompt:'Feed the pony something that starts with /p/!', choices:[{emoji:'🍐',label:'pear',ok:true},{emoji:'🧀',label:'cheese'},{emoji:'🍇',label:'grapes'}] },
];

const huntRounds = [
  { scene:'park', prompt:'Find something in the pony park that starts with /b/!', items:[
    {emoji:'⚽',label:'ball',ok:true,pos:{left:'8%',top:'18%'}},
    {emoji:'🌳',label:'tree',pos:{left:'52%',top:'10%'}},
    {emoji:'🛝',label:'slide',pos:{left:'30%',top:'54%'}}
  ]},
  { scene:'beach', prompt:'Find something at the pony beach that starts with /s/!', items:[
    {emoji:'⭐',label:'starfish',ok:true,pos:{left:'14%',top:'56%'}},
    {emoji:'🍦',label:'ice cream',pos:{left:'55%',top:'18%'}},
    {emoji:'⛱️',label:'umbrella',pos:{left:'36%',top:'46%'}}
  ]},
  { scene:'kitchen', prompt:'Find something in the pony kitchen that starts with /c/!', items:[
    {emoji:'🥕',label:'carrot',ok:true,pos:{left:'18%',top:'48%'}},
    {emoji:'🥛',label:'milk',pos:{left:'58%',top:'18%'}},
    {emoji:'🍞',label:'bread',pos:{left:'42%',top:'56%'}}
  ]},
  { scene:'trail', prompt:'Find something on the pony trail that starts with /f/!', items:[
    {emoji:'🌼',label:'flower',ok:true,pos:{left:'18%',top:'52%'}},
    {emoji:'🪨',label:'rock',pos:{left:'52%',top:'58%'}},
    {emoji:'🍃',label:'leaf',pos:{left:'36%',top:'18%'}}
  ]},
  { scene:'park', prompt:'Find something in the pony park that starts with /k/!', items:[
    {emoji:'🪁',label:'kite',ok:true,pos:{left:'28%',top:'8%'}},
    {emoji:'🌳',label:'tree',pos:{left:'58%',top:'18%'}},
    {emoji:'🎈',label:'balloon',pos:{left:'14%',top:'56%'}}
  ]}
];

const paradeIcons = ['🐎','🎀','🏅','⭐','🌼','🧡','🎠','🌈','🦄','🏇'];

function $(id) { return document.getElementById(id); }

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function unlockAudio() {
  if (state.audioUnlocked) return;
  ['tapAudio','winAudio','bigAudio'].forEach(id => {
    const a = $(id);
    if (!a) return;
    a.volume = 1;
    try {
      a.muted = true;
      a.play().then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      }).catch(() => {
        a.muted = false;
      });
    } catch (e) {}
  });
  state.audioUnlocked = true;
}

function playAudio(id) {
  if (!id || state.calmMode) return;
  unlockAudio();
  const a = $(id);
  if (!a) return;
  try {
    const clone = a.cloneNode(true);
    clone.volume = a.volume || 1;
    clone.playsInline = true;
    clone.setAttribute('playsinline','');
    clone.style.display = 'none';
    document.body.appendChild(clone);
    const cleanup = () => { try { clone.remove(); } catch (e) {} };
    clone.addEventListener('ended', cleanup, {once:true});
    clone.play().catch(() => cleanup());
    setTimeout(cleanup, 2000);
  } catch (e) {
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch (e2) {}
  }
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.82;
    u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function saveName() {
  const raw = $('childName').value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,12) || 'TORBEN';
  $('childName').value = raw;
  state.childName = raw;
  resetNameGame();
}

function hideAllGames() {
  $('home').classList.add('hidden');
  $('feedGame').classList.add('hidden');
  $('huntGame').classList.add('hidden');
  $('nameGame').classList.add('hidden');
  $('ponyGame').classList.add('hidden');
}

function goHome() {
  hideAllGames();
  $('home').classList.remove('hidden');
  state.currentGame = 'home';
}

function openGame(game) {
  unlockAudio();
  hideAllGames();
  state.currentGame = game;
  if (game === 'feed') {
    $('feedGame').classList.remove('hidden');
    newFeedRound();
  }
  if (game === 'hunt') {
    $('huntGame').classList.remove('hidden');
    newHuntRound();
  }
  if (game === 'name') {
    $('nameGame').classList.remove('hidden');
    resetNameGame();
  }
  if (game === 'pony') {
    $('ponyGame').classList.remove('hidden');
    renderPony();
  }
}

function updateStickerRow(id, count) {
  const el = $(id);
  if (!el) return;
  if (!count) {
    el.classList.add('empty-slots');
    el.innerHTML = '<span class="empty-slot"></span><span class="empty-slot"></span><span class="empty-slot"></span>';
  } else {
    el.classList.remove('empty-slots');
    el.textContent = '🐎🏅 '.repeat(count).trim();
  }
}

function animateFoodToHorse(fromEl, emoji, onDone) {
  const mouth = document.getElementById('feedMouth');
  const horse = document.getElementById('feedHorse');
  if (!fromEl || !mouth || !horse) {
    if (onDone) onDone();
    return;
  }
  const from = fromEl.getBoundingClientRect();
  const to = mouth.getBoundingClientRect();

  const outer = document.createElement('div');
  outer.className = 'food-arc-outer';
  outer.style.left = (from.left + from.width/2) + 'px';
  outer.style.top = (from.top + from.height/2) + 'px';

  const inner = document.createElement('div');
  inner.className = 'food-arc-inner';
  inner.textContent = emoji;
  outer.appendChild(inner);
  document.body.appendChild(outer);

  const dx = (to.left + to.width/2) - (from.left + from.width/2);
  const dy = (to.top + to.height/2) - (from.top + from.height/2);
  const duration = 950;
  const arcHeight = Math.max(70, Math.min(150, Math.abs(dx) * 0.18));
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const x = dx * ease;
    const yLinear = dy * ease;
    const arc = -4 * arcHeight * t * (1 - t);
    outer.style.transform = 'translate(' + x + 'px,' + yLinear + 'px)';
    inner.style.transform = 'translate(0px,' + arc + 'px) scale(' + (1 - 0.45 * t) + ')';
    inner.style.opacity = String(1 - 0.75 * t);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      horse.classList.add('chomp');
      outer.remove();
      setTimeout(() => horse.classList.remove('chomp'), 220);
      horse.classList.remove('happy-dance');
      void horse.offsetWidth;
      horse.classList.add('happy-dance');
      setTimeout(() => horse.classList.remove('happy-dance'), 720);
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(frame);
}

function animateHorseToChoice(targetEl, sceneEl, onDone) {
  const horse = document.getElementById('huntRunner');
  if (!horse || !targetEl || !sceneEl) {
    if (onDone) onDone();
    return;
  }
  const horseRect = horse.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const sceneRect = sceneEl.getBoundingClientRect();

  const horseX = horseRect.left - sceneRect.left;
  const horseY = horseRect.top - sceneRect.top;
  const targetX = targetRect.left - sceneRect.left + targetRect.width * 0.15;
  const targetY = targetRect.top - sceneRect.top + targetRect.height * 0.2;

  const dx = targetX - horseX;
  const dy = targetY - horseY;

  horse.classList.add('running');
  horse.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scaleX(-1)';

  setTimeout(() => {
    horse.textContent = '🏇';
  }, 180);

  setTimeout(() => {
    horse.textContent = '🐎';
    horse.style.transform = 'translate(0px,0px) scaleX(-1)';
    setTimeout(() => {
      horse.classList.remove('running');
      if (onDone) onDone();
    }, 700);
  }, 950);
}

function animateStickerToBar(fromEl, barId) {
  if (!fromEl) return;
  const bar = document.getElementById(barId);
  if (!bar) return;
  const from = fromEl.getBoundingClientRect();
  const to = bar.getBoundingClientRect();
  const flyer = document.createElement('div');
  flyer.className = 'fly-sticker';
  flyer.textContent = '🐎🏅';
  flyer.style.left = from.left + from.width/2 - 18 + 'px';
  flyer.style.top = from.top + from.height/2 - 18 + 'px';
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    const dx = (to.left + to.width/2) - (from.left + from.width/2);
    const dy = (to.top + to.height/2) - (from.top + from.height/2);
    flyer.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.7)';
    flyer.style.opacity = '0.15';
  });

  setTimeout(() => {
    flyer.remove();
    bar.classList.remove('stable-pop');
    void bar.offsetWidth;
    bar.classList.add('stable-pop');
  }, 860);
}

function awardSticker(kind, fromEl) {
  const barId = kind === 'feed' ? 'feedStickerBar' : 'huntStickerBar';
  animateStickerToBar(fromEl, barId);
  if (kind === 'feed') {
    state.feedStickers += 1;
    setTimeout(() => updateStickerRow('feedStickers', state.feedStickers), 520);
  } else {
    state.huntStickers += 1;
    setTimeout(() => updateStickerRow('huntStickers', state.huntStickers), 520);
  }
  setTimeout(() => maybeBigWin(kind), 620);
}


const ponyLines = {
  success: ['🐴 Neigh! You got it!', '🐴 Yum yum yum!', '🐴 Great job, rider!', '🐴 That is my favorite!'],
  retry: ['🐴 Try another one!', '🐴 Almost! Let\'s try again!', '🐴 Not that one, friend!'],
  name: ['🐴 You found the right letter!', '🐴 Clip-clop, keep going!', '🐴 That fits!'],
  big: ['🐴 Pony parade time!', '🐴 You did it!', '🐴 Ribbon winner!']
};

function nextPonyLine(group) {
  const arr = ponyLines[group] || ponyLines.success;
  state.ponyVoiceIndex = (state.ponyVoiceIndex + 1) % arr.length;
  return arr[state.ponyVoiceIndex];
}

function setPonyBubble(id, text, clearMs=1400) {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
  if (clearMs) {
    setTimeout(() => {
      if (el) el.style.display = 'none';
    }, clearMs);
  }
}

function saveNameFromParent() {
  const raw = $('parentChildName').value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,12) || 'TORBEN';
  $('parentChildName').value = raw;
  $('childName') && ($('childName').value = raw);
  state.childName = raw;
  saveProgress();
  resetNameGame();
  renderPony();
}


const allAccessories = ['🎀','🌼','👑','🎩','🧢'];
const allBlankets = ['🟪','🟦','🟩','🟥','🟨'];
const allTreats = ['🥕','🍎','🍐','🍇'];

function maybeUnlockPonyItem() {
  const totalWins = (state.stats.feed || 0) + (state.stats.hunt || 0) + (state.stats.name || 0);
  if (totalWins > 0 && totalWins % 3 === 0) {
    const candidates = [
      {kind:'accessory', items:allAccessories, current:state.unlocks.accessories, title:'New Pony Hat!', sub:'Your pony won a colorful new hat!'},
      {kind:'blanket', items:allBlankets, current:state.unlocks.blankets, title:'New Pony Blanket!', sub:'Your pony won a cozy new blanket color!'},
      {kind:'treat', items:allTreats, current:state.unlocks.treats, title:'New Pony Treat!', sub:'Your pony won a yummy new treat!'}
    ];
    const target = candidates.find(c => c.items.find(x => !c.current.includes(x)));
    if (target) {
      const nextItem = target.items.find(x => !target.current.includes(x));
      target.current.push(nextItem);
      state.pendingUnlock = {item: nextItem, title: target.title, sub: target.sub};
    }
    saveProgress();
    renderPony();
  }
}

function showUnlockPopup() {
  if (!state.pendingUnlock) return;
  $('unlockTitle').textContent = state.pendingUnlock.title || 'New Pony Prize!';
  $('unlockItem').textContent = state.pendingUnlock.item || '🎀';
  $('unlockSub').textContent = state.pendingUnlock.sub || 'Your pony found a new dress-up treat!';
  $('unlockOverlay').classList.add('show');
}

function hideUnlockPopup() {
  $('unlockOverlay').classList.remove('show');
  state.pendingUnlock = null;
  saveProgress();
}


function clamp(val, minv, maxv) {
  return Math.max(minv, Math.min(maxv, val));
}

function setPonyItemPosition(el, type, clientX, clientY) {
  const wrap = $('ponyPreviewWrap');
  if (!wrap || !el) return;
  const rect = wrap.getBoundingClientRect();
  const xPct = clamp(((clientX - rect.left) / rect.width) * 100, 10, 90);
  const yPct = clamp(((clientY - rect.top) / rect.height) * 100, 10, 90);
  el.style.left = xPct + '%';
  el.style.top = yPct + '%';
  state.ponyPositions[type] = {x:xPct, y:yPct};
}

function initPonyDragging() {
  const wrap = $('ponyPreviewWrap');
  if (!wrap) return;
  const items = wrap.querySelectorAll('.draggable-pony-item');
  items.forEach(el => {
    if (el.dataset.dragBound === '1') return;
    el.dataset.dragBound = '1';
    const type = el.dataset.itemType;

    const onPointerDown = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      el.classList.add('dragging');
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}

      const onMove = (e2) => {
        setPonyItemPosition(el, type, e2.clientX, e2.clientY);
      };
      const onUp = () => {
        el.classList.remove('dragging');
        saveProgress();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove, {passive:false});
      window.addEventListener('pointerup', onUp, {passive:false});
      window.addEventListener('pointercancel', onUp, {passive:false});
    };

    el.addEventListener('pointerdown', onPointerDown, {passive:false});
  });
}

function cleanupPonyPreviewDuplicates() {
  const seen = new Set();
  ['ponyAccessory','ponyBlanket','ponyTreat'].forEach(id => {
    document.querySelectorAll('#' + id).forEach((el, idx) => {
      if (idx > 0) el.remove();
    });
  });
}

function renderPonyChoices(containerId, items, current, onSelectName) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '';
  items.forEach(item => {
    const b = document.createElement('button');
    b.className = 'pony-choice' + (current === item ? ' selected' : '');
    b.textContent = item;
    b.title = current === item ? 'Tap again to turn off' : 'Select';
    b.onclick = () => {
      if (onSelectName === 'accessory') state.pony.accessory = (state.pony.accessory === item) ? '' : item;
      if (onSelectName === 'blanket') state.pony.blanket = (state.pony.blanket === item) ? '' : item;
      if (onSelectName === 'treat') state.pony.treat = (state.pony.treat === item) ? '' : item;
      microRewardFromElement(b, '✨');
      saveProgress();
      renderPony();
    };
    el.appendChild(b);
  });
}

function renderPony() {
  cleanupPonyPreviewDuplicates();
  const acc = $('ponyAccessory');
  const bl = $('ponyBlanket');
  const tr = $('ponyTreat');

  if (acc) {
    acc.style.display = 'none';
    acc.textContent = state.pony.accessory || '';
    if (state.pony.accessory) {
      acc.style.display = 'block';
      acc.style.left = (state.ponyPositions.accessory?.x || 64) + '%';
      acc.style.top = (state.ponyPositions.accessory?.y || 22) + '%';
    }
  }
  if (bl) {
    bl.style.display = 'none';
    bl.textContent = state.pony.blanket || '';
    if (state.pony.blanket) {
      bl.style.display = 'block';
      bl.style.left = (state.ponyPositions.blanket?.x || 46) + '%';
      bl.style.top = (state.ponyPositions.blanket?.y || 58) + '%';
    }
  }
  if (tr) {
    tr.style.display = 'none';
    tr.textContent = state.pony.treat || '';
    if (state.pony.treat) {
      tr.style.display = 'block';
      tr.style.left = (state.ponyPositions.treat?.x || 77) + '%';
      tr.style.top = (state.ponyPositions.treat?.y || 60) + '%';
    }
  }

  renderPonyChoices('accessoryChoices', state.unlocks.accessories || ['🎀'], state.pony.accessory, 'accessory');
  renderPonyChoices('blanketChoices', state.unlocks.blankets || ['🟪'], state.pony.blanket, 'blanket');
  renderPonyChoices('treatChoices', state.unlocks.treats || ['🥕'], state.pony.treat, 'treat');

  if ($('ponyUnlocks')) {
    const totalUnlocks = (state.unlocks.accessories.length - 1) + (state.unlocks.blankets.length - 1) + (state.unlocks.treats.length - 1);
    $('ponyUnlocks').textContent = '✨ ' + String(totalUnlocks) + ' unlocks';
  }
  if ($('ponyNote')) $('ponyNote').textContent = '🐴 Dress up your pony! Drag items where you want them, or tap a selected item again to turn it off.';
  initPonyDragging();
}


function clearPonyProgress() {
  state.pony = {accessory:'🎀', blanket:'🟪', treat:'🥕'};
  state.unlocks = {accessories:['🎀'], blankets:['🟪'], treats:['🥕']};
  state.pendingUnlock = null;
  state.ponyPositions = {accessory:{x:64,y:22}, blanket:{x:46,y:58}, treat:{x:77,y:60}};
  saveProgress();
  renderPony();
  renderStats();
}

function enableAllPonyItems() {
  state.unlocks = {
    accessories: [...allAccessories],
    blankets: [...allBlankets],
    treats: [...allTreats]
  };
  saveProgress();
  renderPony();
  renderStats();
}

function restorePonyUnlocks() {
  const totalWins = (state.stats.feed || 0) + (state.stats.hunt || 0) + (state.stats.name || 0);
  const extraUnlocks = Math.floor(totalWins / 3);
  const accessories = ['🎀'];
  const blankets = ['🟪'];
  const treats = ['🥕'];

  let remaining = extraUnlocks;
  for (const item of allAccessories.slice(1)) {
    if (remaining <= 0) break;
    accessories.push(item);
    remaining -= 1;
  }
  for (const item of allBlankets.slice(1)) {
    if (remaining <= 0) break;
    blankets.push(item);
    remaining -= 1;
  }
  for (const item of allTreats.slice(1)) {
    if (remaining <= 0) break;
    treats.push(item);
    remaining -= 1;
  }

  state.unlocks = {accessories, blankets, treats};

  if (state.pony.accessory && !state.unlocks.accessories.includes(state.pony.accessory)) {
    state.pony.accessory = '';
  }
  if (state.pony.blanket && !state.unlocks.blankets.includes(state.pony.blanket)) {
    state.pony.blanket = '';
  }
  if (state.pony.treat && !state.unlocks.treats.includes(state.pony.treat)) {
    state.pony.treat = '';
  }

  saveProgress();
  renderPony();
  renderStats();
}

function toggleParentPanel() {
  $('parentPanel').classList.toggle('show');
  $('calmToggle').checked = !!state.calmMode;
  if ($('parentChildName')) $('parentChildName').value = state.childName || 'TORBEN';
  renderStats();
}

function toggleCalmMode() {
  state.calmMode = $('calmToggle').checked;
  document.body.classList.toggle('calm-mode', state.calmMode);
  saveProgress();
}

function renderStats() {
  $('statFeed').textContent = 'Feed: ' + (state.stats.feed || 0);
  $('statHunt').textContent = 'Hunt: ' + (state.stats.hunt || 0);
  $('statName').textContent = 'Name: ' + (state.stats.name || 0);
  if ($('statPony')) $('statPony').textContent = 'Pony: ' + ((state.unlocks.accessories.length - 1) + (state.unlocks.blankets.length - 1) + (state.unlocks.treats.length - 1));
}

function saveProgress() {
  const payload = {
    calmMode: state.calmMode,
    stats: state.stats,
    misses: state.misses,
    mastery: state.mastery,
    childName: state.childName,
    pony: state.pony,
    unlocks: state.unlocks,
    ponyPositions: state.ponyPositions
  };
  try { localStorage.setItem('ponyReadingProgress', JSON.stringify(payload)); } catch (e) {}
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('ponyReadingProgress');
    if (!raw) return;
    const data = JSON.parse(raw);
    state.calmMode = !!data.calmMode;
    state.stats = data.stats || state.stats;
    state.misses = data.misses || {};
    state.mastery = data.mastery || {};
    state.childName = data.childName || state.childName;
    state.pony = data.pony || state.pony;
    state.unlocks = data.unlocks || state.unlocks;
    state.ponyPositions = data.ponyPositions || state.ponyPositions;
    if ($('childName')) $('childName').value = state.childName;
    if ($('parentChildName')) $('parentChildName').value = state.childName;
    document.body.classList.toggle('calm-mode', state.calmMode);
  } catch (e) {}
}

function noteMiss(key) {
  state.misses[key] = (state.misses[key] || 0) + 1;
  saveProgress();
}

function noteSuccess(key) {
  state.mastery[key] = (state.mastery[key] || 0) + 1;
  if (state.misses[key] && state.misses[key] > 0) state.misses[key] -= 1;
  saveProgress();
}


function microRewardFromElement(el, icon='✨') {
  if (!el || state.calmMode) return;
  el.classList.remove('correct-pop');
  void el.offsetWidth;
  el.classList.add('correct-pop');
  const rect = el.getBoundingClientRect();
  const sparkles = ['✨','⭐','💖', icon];
  sparkles.forEach((sp, idx) => {
    const s = document.createElement('div');
    s.className = 'micro-sparkle';
    s.textContent = sp;
    s.style.left = (rect.left + rect.width/2 + (idx-1.5)*12) + 'px';
    s.style.top = (rect.top + rect.height/2) + 'px';
    s.style.animationDelay = (idx * 0.04) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  });
}

function weightedChoice(rounds, keyField) {
  const weighted = [];
  rounds.forEach(r => {
    const key = r[keyField] || r.letter || r.prompt;
    const misses = state.misses[key] || 0;
    const mastery = state.mastery[key] || 0;
    const weight = Math.max(1, 1 + misses * 3 - Math.floor(mastery / 3));
    for (let i=0;i<weight;i++) weighted.push(r);
  });
  return shuffle(weighted)[0];
}

function maybeBigWin(kind) {
  if (kind === 'feed' && state.feedStickers >= 3) {
    state.feedStickers = 0;
    updateStickerRow('feedStickers', state.feedStickers);
    triggerBigWin('Pony Parade!', 'Three ribbons for Feed the Horse!');
  }
  if (kind === 'hunt' && state.huntStickers >= 3) {
    state.huntStickers = 0;
    updateStickerRow('huntStickers', state.huntStickers);
    triggerBigWin('Trail Champion!', nextPonyLine('big'));
  }
}

function triggerBigWin(title, sub) {
  playAudio('bigAudio');
  $('bigWinTitle').textContent = title;
  $('bigWinSub').textContent = sub;
  const parade = $('parade');
  parade.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('div');
    d.className = 'floaty';
    d.textContent = paradeIcons[i % paradeIcons.length];
    d.style.left = (Math.random() * 88) + '%';
    d.style.bottom = (Math.random() * 25) + 'px';
    d.style.animationDelay = (Math.random() * 1.2) + 's';
    d.style.animationDuration = (2.8 + Math.random() * 1.8) + 's';
    d.style.fontSize = (1.7 + Math.random() * 1.6) + 'rem';
    parade.appendChild(d);
  }
  $('bigWinOverlay').classList.add('show');
  setTimeout(() => $('bigWinOverlay').classList.remove('show'), 6200);
}

function speakCurrentFeed() {
  if (!state.currentFeedRound) return;
  speak(state.currentFeedRound.prompt);
}

function speakCurrentHunt() {
  if (!state.currentHuntRound) return;
  speak(state.currentHuntRound.prompt);
}

function newFeedRound() {
  state.currentFeedRound = weightedChoice(feedRounds, 'letter');
  const round = state.currentFeedRound;
  $('feedPrompt').textContent = round.prompt;
  $('feedNote').textContent = '🐴 Pick a yummy snack!';
  $('feedCloud').textContent = '🐴 ' + round.prompt.replace('Feed the pony something that starts with ', '').replace('!', '');
  updateStickerRow('feedStickers', state.feedStickers);
  const box = $('feedChoices');
  box.innerHTML = '';
  shuffle(round.choices).forEach((choice, idx) => {
    const b = document.createElement('button');
    b.className = 'choice feed-choice-pop';
    b.style.animationDelay = (idx * 0.08) + 's';
    b.innerHTML = '<span>' + choice.emoji + '</span><span class="label">' + choice.label + '</span>';
    b.onclick = () => {
      if (choice.ok) {
        animateFoodToHorse(b, choice.emoji, () => {
          microRewardFromElement(b, '🥕');
          $('feedNote').textContent = 'Yum! The pony likes ' + choice.label + '!';
          $('feedCloud').textContent = '🐴 Yum!';
          setPonyBubble('ponyBubbleFeed', nextPonyLine('success'));
          noteSuccess(round.letter);
          state.stats.feed += 1;
          renderStats();
          playAudio(state.calmMode ? 'tapAudio' : 'winAudio');
          awardSticker('feed', b);
          maybeUnlockPonyItem();
          saveProgress();
          if (state.pendingUnlock) setTimeout(showUnlockPopup, 850);
          setTimeout(newFeedRound, state.calmMode ? 1300 : 1000);
        });
      } else {
        playAudio('tapAudio');
        $('feedNote').textContent = 'Not that one — try again!';
        $('feedCloud').textContent = '🐴 Try a different snack!';
        setPonyBubble('ponyBubbleFeed', nextPonyLine('retry'));
        noteMiss(round.letter);
      }
    };
    box.appendChild(b);
  });
}

function newHuntRound() {
  state.currentHuntRound = weightedChoice(huntRounds, 'prompt');
  const round = state.currentHuntRound;
  $('huntPrompt').textContent = round.prompt;
  $('huntNote').textContent = '🐴 Can you find it?';
  updateStickerRow('huntStickers', state.huntStickers);
  const scene = $('huntScene');
  scene.className = 'scene ' + round.scene;
  scene.innerHTML = '';

  const row = document.createElement('div');
  row.className = 'targets';
  row.style.marginTop = '12px';
  row.style.position = 'relative';
  row.style.zIndex = '2';

  round.items.forEach(item => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.innerHTML = '<span>' + item.emoji + '</span><span class="label">' + item.label + '</span>';
    b.onclick = () => {
      playAudio('tapAudio');
      if (item.ok) {
        animateHorseToChoice(b, scene, () => {
          microRewardFromElement(b, '🌟');
          $('huntNote').textContent = 'You found the ' + item.label + '!';
          noteSuccess(round.prompt);
          state.stats.hunt += 1;
          renderStats();
          playAudio(state.calmMode ? null : 'winAudio');
          awardSticker('hunt', b);
          maybeUnlockPonyItem();
          saveProgress();
          if (state.pendingUnlock) setTimeout(showUnlockPopup, 900);
          setTimeout(newHuntRound, state.calmMode ? 1450 : 1100);
        });
      } else {
        $('huntNote').textContent = nextPonyLine('retry');
        noteMiss(round.prompt);
      }
    };
    row.appendChild(b);
  });
  scene.appendChild(row);

  const shadow = document.createElement('div');
  shadow.className = 'hunt-runner-shadow';
  scene.appendChild(shadow);

  const horse = document.createElement('div');
  horse.className = 'hunt-runner';
  horse.id = 'huntRunner';
  horse.textContent = '🐎';
  scene.appendChild(horse);
}

function buildNameUI() {
  $('nameTarget').textContent = state.childName;
  const slots = $('nameSlots');
  const bank = $('letterBank');
  slots.innerHTML = '';
  bank.innerHTML = '';
  state.nameProgress = Array(state.childName.length).fill('');
  for (let i=0; i<state.childName.length; i++) {
    const s = document.createElement('div');
    s.className = 'slot';
    s.id = 'slot-' + i;
    slots.appendChild(s);
  }
  const letters = shuffle(state.childName.split(''));
  letters.forEach(letter => {
    const b = document.createElement('button');
    b.className = 'letter';
    b.textContent = letter;
    b.onclick = () => placeNextLetter(letter, b);
    bank.appendChild(b);
  });
}

function placeNextLetter(letter, btn) {
  const nextIndex = state.nameProgress.findIndex(x => x === '');
  if (nextIndex < 0) return;
  const expected = state.childName[nextIndex];
  if (letter === expected) {
    state.nameProgress[nextIndex] = letter;
    $('slot-' + nextIndex).textContent = letter;
    btn.disabled = true;
    btn.style.opacity = '.35';
    btn.style.transform = 'scale(.95)';
    microRewardFromElement(btn, '🎉');
    $('nameNote').textContent = nextIndex === state.childName.length - 1 ? 'You spelled the whole name!' : nextPonyLine('name');
    playAudio(nextIndex === state.childName.length - 1 ? (state.calmMode ? 'winAudio' : 'bigAudio') : (state.calmMode ? 'tapAudio' : 'winAudio'));
    if (state.nameProgress.every(Boolean)) {
      state.stats.name += 1;
      renderStats();
      maybeUnlockPonyItem();
      saveProgress();
      triggerBigWin('Name Champion!', state.childName + ' is all spelled out!');
      if (state.pendingUnlock) setTimeout(showUnlockPopup, 1200);
    }
  } else {
    playAudio('tapAudio');
    $('nameNote').textContent = nextPonyLine('retry') + ' Try ' + expected + '.';
  }
}

function resetNameGame() {
  $('nameNote').textContent = '🐴 Let\'s build the name!';
  $('nameRibbon').textContent = '🐎 🎀 Pony Parade Goal';
  buildNameUI();
}

document.addEventListener('pointerdown', unlockAudio, {once:false});
$('bigWinOverlay').addEventListener('click', () => $('bigWinOverlay').classList.remove('show'));

loadProgress();
saveName();
renderStats();
renderPony();
goHome();


// PWA helpers
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('installPwaBtn');
  if (btn) btn.style.display = 'inline-block';
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const btn = document.getElementById('installPwaBtn');
  if (btn) btn.style.display = 'none';
});

async function promptInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch (e) {}
  deferredInstallPrompt = null;
  const btn = document.getElementById('installPwaBtn');
  if (btn) btn.style.display = 'none';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
