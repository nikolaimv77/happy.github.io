(() => {
  'use strict';
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); try { tg.setHeaderColor('#2a0029'); tg.setBackgroundColor('#2a0029'); } catch (_) {} }
  const $ = (id) => document.getElementById(id);
  const poster = $('poster-screen'), storyShell = $('story-shell'), posterOpen = $('poster-open');
  function openStoryApp() { if (poster) poster.hidden = true; if (storyShell) storyShell.hidden = false; }
  if (posterOpen) posterOpen.addEventListener('click', () => { if (isLocked()) { showLockNote(); return; } burstFrom(posterOpen); openStoryApp(); showChapter(0); if (music && music.paused) playMusic(); });
  const musicButton = $('music-toggle'), music = $('background-music'), musicState = $('music-state');
  function syncMusic() {
    if (!musicButton || !music) return;
    const playing = !music.paused;
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Выключить песню' : 'Включить песню');
    if (musicState) musicState.textContent = playing ? 'Играет · нажми, чтобы выключить' : 'Нажми, чтобы включить';
  }
  function fadeVolume(to, ms = 2500) {
    const from = music.volume, start = performance.now();
    const tick = (now) => { const t = Math.min(1, (now - start) / ms); music.volume = from + (to - from) * t; if (t < 1 && !music.paused) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  async function playMusic() {
    if (!music) return;
    try { music.volume = 0; await music.play(); fadeVolume(0.85); } catch (_) { if (musicState) musicState.textContent = 'Нажми ещё раз'; }
    syncMusic();
  }
  if (musicButton && music) {
    musicButton.addEventListener('click', () => { if (music.paused) playMusic(); else { music.pause(); syncMusic(); } });
    music.addEventListener('play', syncMusic); music.addEventListener('pause', syncMusic);
    const bar = $('music-bar');
    music.addEventListener('timeupdate', () => { if (bar && music.duration) bar.style.width = (music.currentTime / music.duration * 100).toFixed(2) + '%'; });
  }
  const scene = $('scene'), eyebrow = $('eyebrow'), title = $('title'), body = $('body'), next = $('next'), back = $('back'), counter = $('counter'), hint = $('hint'), countdown = $('countdown'), progress = $('progress'), fill = $('progress-fill'), signature = $('signature'), letterStage = $('letter-stage'), envelope = $('envelope');
  // Birthday is fixed to 30 October 2026, midnight in Tashkent (UTC+5).
  const target = new Date('2026-10-30T00:00:00+05:00');
  // Предпросмотр до дня рождения — только для автора по ссылке с ключом ?preview=solnce3010.
  const previewMode = new URLSearchParams(location.search).get('preview') === 'solnce3010';
  // Сюрприз закрыт до 30.10.2026 00:00 (Ташкент); в эту минуту бот присылает уведомление.
  const isLocked = () => Date.now() < target.getTime() && !previewMode;
  let lockTimer = 0;
  function showLockNote() {
    const note = $('lock-note'); if (!note) return;
    note.hidden = false; note.classList.remove('show'); void note.offsetWidth; note.classList.add('show');
    if (posterOpen) { posterOpen.classList.remove('shake'); void posterOpen.offsetWidth; posterOpen.classList.add('shake'); }
    window.clearTimeout(lockTimer); lockTimer = window.setTimeout(() => { note.hidden = true; }, 5000);
  }
  let lastLocked = null;
  function syncLock() {
    const locked = isLocked(); if (!posterOpen || locked === lastLocked) return; lastLocked = locked;
    posterOpen.classList.toggle('locked', locked);
    posterOpen.innerHTML = locked ? '<span class="lock">🔒</span> Откроется 30.10 в 00:00' : 'Открыть сюрприз <span>♡</span>';
  }
  const chapters = [
    {eyebrow:'ГЛАВА I · ОТ ВСЕГО СЕРДЦА',title:'Ты особенная',body:'Солнце, иногда мы привыкаем к тому, что хорошие люди есть рядом. И не всегда находим время сказать им, насколько они важны.\n\nСегодня я не хочу оставлять это несказанным. Ты занимаешь особое место в моём сердце, и мне хочется, чтобы ты всегда знала, как много значишь для меня.',button:'Продолжить историю',counter:'01 / 04'},
    {eyebrow:'ГЛАВА II · МОЁ СОЛНЫШКО',title:'Почему я так тебя называю',body:'В слове «солнышко» есть что-то очень простое и настоящее: свет, тепло, уют. Что-то, к чему хочется возвращаться.\n\nЯ не обещаю, что каждый день будет идеальным. Но хочу, чтобы рядом со мной у тебя было больше поводов улыбаться, больше спокойствия и больше уверенности в том, что тебя любят.',button:'Ещё несколько слов',counter:'02 / 04'},
    {eyebrow:'ГЛАВА III · МОЁ ЖЕЛАНИЕ',title:'Пусть впереди будет много хорошего',body:'Я желаю тебе не только счастья, здоровья и исполнения желаний. Хочу, чтобы ты чаще чувствовала себя счастливой в самых обычных моментах.\n\nПусть у тебя хватает сил на важное, времени на то, что радует, и спокойствия для того, что нельзя изменить. И пусть в твоей жизни всегда будет место для нежности, смеха и любви.',button:'Посмотреть наши моменты',counter:'03 / 04'},
    {eyebrow:'МОЕМУ СОЛНЫШКУ · С ЛЮБОВЬЮ',title:'С днём рождения, моё солнце',body:'Моё любимое солнце.\n\nС днём рождения тебя. ❤️\n\nСегодня мне хочется, чтобы ты хотя бы на мгновение остановилась и почувствовала, насколько ты важна. Иногда самые искренние чувства непросто выразить словами, но самое главное оказывается гораздо проще.\n\nЯ рад, что ты есть в моей жизни.\n\nМне хочется, чтобы ты чаще улыбалась, чтобы твои глаза светились от счастья, чтобы у тебя исполнялись желания, о которых ты пока никому не рассказываешь. Хочу, чтобы ты берегла себя, не забывала о своих мечтах и всегда находила время для того, что делает тебя счастливой.\n\nА ещё мне хочется дарить тебе тепло не только в праздники. В обычные дни, когда нет особого повода, когда достаточно одного доброго слова, объятия или просто ощущения, что рядом есть близкий человек.\n\nЯ не знаю, какими будут все наши завтрашние дни. Но я знаю, что хочу наполнять их хорошими моментами вместе с тобой, радовать тебя и находить новые причины говорить тебе, как ты мне дорога.\n\nПусть новый год твоей жизни будет добрым к тебе. Пусть в нём будет много света, здоровья, душевного спокойствия, любви и счастливых мгновений.\n\nСпасибо тебе за то, что ты есть. Крепко обнимаю тебя. ❤️\n\nТвой человек.',button:'Прочитать письмо ещё раз',counter:'04 / 04',letter:true}
  ];
  chapters.splice(3, 0,
    {eyebrow:'ГЛАВА IV · НАШИ МОМЕНТЫ',title:'Ты — моё вдохновение',body:'Я храню эти кадры не потому, что на них красивые горы.\nА потому, что на них — ты.',button:'Почему я тебя люблю',gallery:true},
    {eyebrow:'ГЛАВА V · ПРИЧИНЫ',title:'Почему я тебя люблю',body:'Нажми на каждую карточку ♥',button:'Открыть моё письмо',reasons:true}
  );
  const gallery = $('gallery'), reasonsBox = $('reasons'), secretHeart = $('secret-heart');
  let typingTimer = 0;
  let mode = 'countdown', chapterIndex = 0, letterOpened = false;
  const isBirthday = () => { const now = new Date(); return now >= target && now < new Date('2026-10-31T00:00:00+05:00'); };
  const unitWords = {days:['день','дня','дней'], hours:['час','часа','часов'], minutes:['минута','минуты','минут'], seconds:['секунда','секунды','секунд']};
  const plural = (n, w) => { const a = n % 100, b = n % 10; if (a > 10 && a < 20) return w[2]; if (b === 1) return w[0]; if (b > 1 && b < 5) return w[1]; return w[2]; };
  function setNumber(node, value) {
    if (!node) return; const text = String(value).padStart(2, '0');
    if (node.textContent === text) return;
    const changed = node.textContent !== '--'; node.textContent = text;
    if (changed) { node.classList.remove('tick'); void node.offsetWidth; node.classList.add('tick'); }
  }
  // Маленький салют из сердечек в точке нажатия.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function burst(x, y, count = 14) {
    if (reduceMotion) return;
    const glyphs = ['♥', '♡', '✦', '❀'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span'); el.className = 'burst'; el.textContent = glyphs[i % glyphs.length];
      const angle = (Math.PI * 2 * i) / count + Math.random() * .5, dist = 60 + Math.random() * 90;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px'); el.style.setProperty('--dy', Math.sin(angle) * dist - 40 + 'px');
      el.style.setProperty('--s', (.7 + Math.random() * .8).toFixed(2)); el.style.setProperty('--r', (Math.random() * 80 - 40).toFixed(0) + 'deg');
      document.body.appendChild(el); el.addEventListener('animationend', () => el.remove());
    }
  }
  const burstFrom = (el) => { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); };
  function updateCountdown() {
    syncLock();
    const now = Date.now(); let diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hours = Math.floor(diff / 3600000); diff %= 3600000;
    const minutes = Math.floor(diff / 60000); const seconds = Math.floor((diff % 60000) / 1000);
    const values = {days, hours, minutes, seconds};
    for (const [key, value] of Object.entries(values)) {
      setNumber($(key), value); setNumber($('poster-' + key), value);
      const label = plural(value, unitWords[key]);
      for (const id of [key + '-label', 'poster-' + key + '-label']) { const l = $(id); if (l) l.textContent = label; }
    }
    if (Date.now() >= target.getTime() && !document.body.classList.contains('is-birthday')) {
      document.body.classList.add('is-birthday');
      const posterSubtitle = $('poster-subtitle'), posterCountdown = $('poster-countdown');
      if (posterSubtitle) posterSubtitle.innerHTML = 'Сегодня твой день!<br>С днём рождения,<br>моя любимая';
      if (posterCountdown) posterCountdown.hidden = true;
      const cake = $('cake'); if (cake) cake.hidden = false;
      if (posterOpen) posterOpen.innerHTML = 'Открыть поздравление <span>♡</span>';
      window.setTimeout(() => { burst(window.innerWidth / 2, window.innerHeight / 2, 28); confettiRain(70); }, 600);
      if (eyebrow) eyebrow.textContent = '30 ОКТЯБРЯ · ТВОЙ ОСОБЕННЫЙ ДЕНЬ';
      if (hint) hint.textContent = 'Сегодня всё это — для тебя ❤️';
      if (next) next.innerHTML = 'Начать поздравление <span>↗</span>';
    }
  }
  function showChapter(index) {
    chapterIndex = index; mode = 'story'; const c = chapters[index];
    scene.classList.remove('reveal','letter'); void scene.offsetWidth; if (c.letter) scene.classList.add('letter');
    eyebrow.textContent = c.eyebrow; title.textContent = c.title; body.textContent = c.body; letterOpened = false; letterStage.hidden = !c.letter; body.hidden = Boolean(c.letter); if (c.letter) { envelope.classList.remove('open'); next.innerHTML = 'Открыть моё письмо <span>♥</span>'; } else { next.innerHTML = c.button + ' <span>↗</span>'; } counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0'); gallery.hidden = !c.gallery; reasonsBox.hidden = !c.reasons; secretHeart.hidden = true; window.clearTimeout(typingTimer); if (c.gallery) gallery.querySelector('.gallery-track').scrollLeft = 0; hint.hidden = true; countdown.hidden = true; progress.hidden = false; fill.style.width = `${((index+1)/chapters.length)*100}%`; back.hidden = false; signature.textContent = 'Создано специально для тебя ♥'; scene.classList.add('reveal');
  }
  function showCountdown() {
    mode = 'countdown'; gallery.hidden = true; reasonsBox.hidden = true; secretHeart.hidden = true; window.clearTimeout(typingTimer); letterStage.hidden = true; body.hidden = false; scene.classList.remove('letter','reveal'); void scene.offsetWidth; eyebrow.textContent = 'ДО ТВОЕГО ОСОБЕННОГО ДНЯ ОСТАЛОСЬ'; title.innerHTML = 'Моё<br>солнышко'; body.innerHTML = 'С каждым днём<br>я всё больше понимаю,<br>как мне повезло, что ты есть<br>в моей жизни <span class="pink-heart">♥</span>'; hint.hidden = false; countdown.hidden = false; progress.hidden = true; back.hidden = true; signature.innerHTML = 'Создано специально для тебя <span>♥</span>'; counter.textContent = '30 · 10 · 2026'; next.innerHTML = 'Открыть сюрприз <span>♡</span>'; scene.classList.add('reveal'); updateCountdown();
  }
  next.addEventListener('click', () => {
    burstFrom(next);
    if (mode === 'story' && chapters[chapterIndex].letter) {
      if (!letterOpened) { letterOpened = true; envelope.classList.add('open'); next.innerHTML = 'Письмо открывается… <span>♥</span>'; window.setTimeout(typeLetter, 900); }
      else typeLetter(true);
      return;
    }
    if (mode === 'countdown') {
      if (Date.now() < target.getTime() && !previewMode) { eyebrow.textContent = 'МАЛЕНЬКАЯ ПОДСКАЗКА'; title.textContent = 'Самое главное — впереди'; body.textContent = 'Это не просто поздравление. Я хочу подарить тебе несколько слов, которые идут от сердца. А самое главное ты узнаешь 30 октября. ❤️'; countdown.hidden = true; hint.textContent = 'Пусть это пока останется нашим маленьким секретом'; next.innerHTML = 'Вернуться к отсчёту <span>↗</span>'; mode = 'teaser'; return; }
      showChapter(0); return;
    }
    if (mode === 'teaser') { showCountdown(); return; }
    if (chapterIndex < chapters.length - 1) showChapter(chapterIndex + 1); else showChapter(chapters.length - 1);
  });
  back.addEventListener('click', showCountdown);

  // ---------- 2. Письмо печатается на глазах (касание — показать сразу) ----------
  function typeLetter(instant) {
    const text = chapters[chapters.length - 1].body; let i = 0;
    window.clearTimeout(typingTimer); body.hidden = false; body.textContent = ''; body.classList.add('typing'); secretHeart.hidden = true;
    const finish = () => { window.clearTimeout(typingTimer); body.textContent = text; body.classList.remove('typing'); next.innerHTML = 'Прочитать письмо ещё раз <span>↗</span>'; secretHeart.hidden = false; };
    if (instant === true || reduceMotion) { finish(); return; }
    next.innerHTML = 'Показать письмо целиком <span>↓</span>';
    const step = () => { i = Math.min(text.length, i + 2); body.textContent = text.slice(0, i); if (i >= text.length) { finish(); return; } const ch = text[i - 1]; typingTimer = window.setTimeout(step, ch === '\n' ? 160 : /[.,!?]/.test(ch) ? 90 : 22); };
    step();
  }
  body.addEventListener('click', () => { if (body.classList.contains('typing')) typeLetter(true); });

  // ---------- 1. Галерея ----------
  const photos = [
    {src:'photo-1.jpg', caption:'Ты смотришь вдаль, а я — на тебя'},
    {src:'photo-2.jpg', caption:'Сильная и нежная одновременно'},
    {src:'photo-3.jpg', caption:'Весь мир — у твоих ног'},
    {src:'photo-4.jpg', caption:'Свободная, как ветер в горах'},
    {src:'photo-5.jpg', caption:'Моя королева гор'},
    {src:'photo-6.jpg', caption:'Даже древние башни не так прекрасны'},
    {src:'photo-7.jpg', caption:'Город в огнях, а самый яркий свет — ты'}
  ].map((p) => ({...p, src:'./assets/images/gallery/' + p.src}));
  const track = $('gallery-track'), dots = $('gallery-dots');
  photos.forEach((p, i) => {
    const fig = document.createElement('figure'); fig.className = 'polaroid'; fig.style.setProperty('--tilt', (i % 2 ? 2.2 : -2.2) + 'deg');
    fig.innerHTML = `<button type="button" aria-label="Открыть фото ${i + 1}"><img src="${p.src}" alt="${p.caption}" loading="lazy" draggable="false"></button><figcaption>${p.caption}</figcaption>`;
    fig.querySelector('button').addEventListener('click', () => openLightbox(i));
    track.appendChild(fig);
    const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', 'Фото ' + (i + 1));
    dot.addEventListener('click', () => track.children[i].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'}));
    dots.appendChild(dot);
  });
  const syncDots = () => {
    const center = track.scrollLeft + track.clientWidth / 2; let best = 0, bestDist = Infinity;
    [...track.children].forEach((el, i) => { const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center); if (d < bestDist) { bestDist = d; best = i; } });
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === best));
    [...track.children].forEach((el, i) => el.classList.toggle('active', i === best));
  };
  track.addEventListener('scroll', () => window.requestAnimationFrame(syncDots), {passive:true}); syncDots();

  const lightbox = $('lightbox'), lbImg = $('lightbox-img'), lbCap = $('lightbox-caption'), lbCount = $('lightbox-count');
  let lbIndex = 0;
  function showPhoto(i) { lbIndex = (i + photos.length) % photos.length; const p = photos[lbIndex]; lbImg.classList.remove('in'); void lbImg.offsetWidth; lbImg.src = p.src; lbImg.alt = p.caption; lbCap.textContent = p.caption; lbCount.textContent = (lbIndex + 1) + ' / ' + photos.length; lbImg.classList.add('in'); }
  function openLightbox(i) { showPhoto(i); lightbox.hidden = false; document.body.classList.add('no-scroll'); $('lightbox-close').focus(); }
  function closeLightbox() { lightbox.hidden = true; document.body.classList.remove('no-scroll'); }
  $('lightbox-close').addEventListener('click', closeLightbox);
  $('lightbox-prev').addEventListener('click', () => showPhoto(lbIndex - 1));
  $('lightbox-next').addEventListener('click', () => showPhoto(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend', (e) => { if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 45) showPhoto(lbIndex + (dx < 0 ? 1 : -1)); touchX = null; });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.hidden) { if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowRight') showPhoto(lbIndex + 1); if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1); }
    else if (!secret.hidden && e.key === 'Escape') closeSecret();
  });

  // ---------- 4. «Почему я тебя люблю» ----------
  const reasons = [
    ['☀', 'Твоя улыбка', 'Она делает любой день теплее — даже самый пасмурный.'],
    ['✦', 'Твоя сила', 'Ты справляешься с тем, что другим не под силу, и остаёшься нежной.'],
    ['♡', 'Твоя забота', 'Рядом с тобой хочется быть лучше и спокойнее.'],
    ['❀', 'Твой взгляд', 'В нём столько света, что я каждый раз теряюсь.'],
    ['⛰', 'Твоя смелость', 'Ты поднимаешься на вершины — и тянешь меня за собой.'],
    ['∞', 'Просто ты', 'Мне не нужна причина. Я люблю тебя целиком.']
  ];
  reasons.forEach(([icon, front, back], i) => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'reason-card'; card.style.setProperty('--d', (i * 70) + 'ms');
    card.innerHTML = `<span class="reason-inner"><span class="reason-face reason-front"><i>${icon}</i><b>${front}</b><small>нажми</small></span><span class="reason-face reason-back">${back}</span></span>`;
    card.addEventListener('click', (e) => { card.classList.toggle('flipped'); if (card.classList.contains('flipped')) burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 8); });
    reasonsBox.appendChild(card);
  });

  // ---------- 7. Тайная концовка ----------
  const secret = $('secret');
  function closeSecret() { secret.hidden = true; document.body.classList.remove('no-scroll'); }
  secretHeart.addEventListener('click', () => { secret.hidden = false; document.body.classList.add('no-scroll'); burst(window.innerWidth / 2, window.innerHeight / 2, 24); $('secret-close').focus(); });
  $('secret-close').addEventListener('click', () => { burstFrom($('secret-close')); window.setTimeout(closeSecret, 350); });
  secret.addEventListener('click', (e) => { if (e.target === secret) closeSecret(); });

  // ---------- 3. День рождения: свечи и конфетти ----------
  function confettiRain(count = 60) {
    if (reduceMotion) return;
    const colors = ['#f1c56e', '#fff0c2', '#cab3e6', '#af7bbd', '#dbd9e8', '#7a3776'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('i'); el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw'; el.style.background = colors[i % colors.length];
      el.style.animationDuration = (2.6 + Math.random() * 2.4).toFixed(2) + 's'; el.style.animationDelay = (Math.random() * 1.2).toFixed(2) + 's';
      el.style.setProperty('--drift', (Math.random() * 120 - 60).toFixed(0) + 'px');
      document.body.appendChild(el); el.addEventListener('animationend', () => el.remove());
    }
  }
  document.querySelectorAll('.candle').forEach((c) => c.addEventListener('click', (e) => {
    if (c.classList.contains('out')) return; c.classList.add('out'); burst(e.clientX, e.clientY, 6);
    if ([...document.querySelectorAll('.candle')].every((x) => x.classList.contains('out'))) { $('cake-hint').textContent = 'Желание загадано — пусть сбудется ✨'; confettiRain(90); }
  }));
  if (envelope) envelope.addEventListener('click', () => { if (!letterOpened) next.click(); });
  document.querySelectorAll('.flourish-heart .heart').forEach((h) => h.closest('svg').addEventListener('click', (e) => burst(e.clientX, e.clientY, 10)));
  updateCountdown(); setInterval(updateCountdown, 1000);
  // If opened through a Telegram deep link with ?story=1, start at the story screen.
  const params = new URLSearchParams(location.search);
  if (params.get('story') === '1' && !isLocked()) { openStoryApp(); showCountdown(); }
  else { showCountdown(); }
})();
