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
    const tick = (now) => { const t = Math.max(0, Math.min(1, (now - start) / ms)); music.volume = Math.max(0, Math.min(1, from + (to - from) * t)); if (t < 1 && !music.paused) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  async function playMusic() {
    if (!music) return;
    try { music.volume = 0; await music.play(); fadeVolume(0.85); } catch (_) { if (musicState) musicState.textContent = 'Нажми еще раз'; }
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
  // Предпросмотр до дня рождения - только для автора по ссылке с ключом ?preview=solnce3010.
  // Режим автора: полный доступ в любой день, если Mini App открыт с аккаунта автора в Telegram.
  const OWNER_TELEGRAM_ID = 33612524;
  const isOwner = tg?.initDataUnsafe?.user?.id === OWNER_TELEGRAM_ID;
  let previewMode = new URLSearchParams(location.search).get('preview') === 'solnce3010' || isOwner;
  // Сдвиг времени для тестов автора (перемотка к полуночи 30.10); у неё всегда 0.
  let timeOffset = 0;
  const now = () => Date.now() + timeOffset;
  // Сюрприз закрыт до 30.10.2026 00:00 (Ташкент); в эту минуту бот присылает уведомление.
  const isLocked = () => now() < target.getTime() && !previewMode;
  const waitScreen = $('wait-screen');
  function showLockNote() {
    if (!waitScreen) return;
    updateWaitLeft(); waitScreen.hidden = false; document.body.classList.add('no-scroll');
    burstFrom(posterOpen); $('wait-close').focus();
  }
  function closeWait() { waitScreen.hidden = true; document.body.classList.remove('no-scroll'); if (posterOpen) posterOpen.focus(); }
  function updateWaitLeft() {
    const el = $('wait-left'); if (!el) return;
    const diff = Math.max(0, target.getTime() - now()), d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000), m = Math.floor(diff % 3600000 / 60000);
    const parts = []; if (d) parts.push(d + ' ' + plural(d, unitWords.days)); if (h) parts.push(h + ' ' + plural(h, unitWords.hours)); parts.push(m + ' ' + plural(m, unitWords.minutes));
    el.textContent = 'Осталось ' + parts.join(' ');
  }
  let lastLocked = null;
  function syncLock() {
    const locked = isLocked(); if (locked === lastLocked) return; lastLocked = locked;
    if (!locked && waitScreen && !waitScreen.hidden) closeWait();
  }
  const chapters = [
    {
      eyebrow:'ГЛАВА I · ОТ ВСЕГО СЕРДЦА',
      title:'Ты особенная',
      body:'Солнце, иногда мы привыкаем к тому, что хорошие люди есть рядом. И не всегда находим время сказать им, насколько они важны.\n\nСегодня я не хочу оставлять это несказанным. Ты занимаешь особое место в моем сердце, и мне хочется, чтобы ты всегда знала, как много значишь для меня.',
      button:'Продолжить историю',
      counter:'01 / 04'
    },
    {
      eyebrow:'ГЛАВА II · МОЕ СОЛНЫШКО',
      title:'Почему я так тебя называю',
      body:'В слове «солнышко» есть что-то очень простое и настоящее: свет, тепло, уют. Что-то, к чему хочется возвращаться.\n\nЯ не обещаю, что каждый день будет идеальным. Но хочу, чтобы рядом со мной у тебя было больше поводов улыбаться, больше спокойствия и больше уверенности в том, что тебя любят.',
      button:'Еще несколько слов',
      counter:'02 / 04'
    },
    {
      eyebrow:'ГЛАВА III · МОЕ ЖЕЛАНИЕ',
      title:'Пусть впереди будет много хорошего',
      body:'Я желаю тебе не только счастья, здоровья и исполнения желаний. Хочу, чтобы ты чаще чувствовала себя счастливой в самых обычных моментах.\n\nПусть у тебя хватает сил на важное, времени на то, что радует, и спокойствия для того, что нельзя изменить. И пусть в твоей жизни всегда будет место для нежности, смеха и любви.',
      button:'Смотреть фото',
      counter:'03 / 04'
    },
    {
      eyebrow:'МОЕМУ СОЛНЫШКУ · С ЛЮБОВЬЮ',
      title:'С днем рождения, мое солнце',
      body:'Мое любимое солнышко.\n\nС днем рождения тебя. ❤️\n\nСегодня мне хочется, чтобы ты хотя бы на мгновение остановилась и почувствовала, насколько ты важна. Иногда самые искренние чувства непросто выразить словами, но самое главное оказывается гораздо проще.\n\nЯ рад, что ты есть в моей жизни.\n\nМне хочется, чтобы ты чаще улыбалась, чтобы твои глаза светились от счастья, чтобы у тебя исполнялись желания, о которых ты пока никому не рассказываешь. Хочу, чтобы ты берегла себя, не забывала о своих мечтах и всегда находила время для того, что делает тебя счастливой.\n\nА еще мне хочется дарить тебе тепло не только в праздники. В обычные дни, когда нет особого повода, когда достаточно одного доброго слова, объятия или просто ощущения, что рядом есть близкий человек.\n\nЯ не знаю, какими будут все наши завтрашние дни. Но я знаю, что хочу наполнять их хорошими моментами вместе с тобой, радовать тебя и находить новые причины говорить тебе, как ты мне дорога.\n\nПусть новый год твоей жизни будет добрым к тебе. Пусть в нем будет много света, здоровья, душевного спокойствия, любви и счастливых мгновений.\n\nСпасибо тебе за то, что ты есть. Крепко крепко обнимаю тебя и нежно целую. ❤️\n\n Люблю тебя. ❤️',
      button:'Прочитать письмо еще раз',
      counter:'04 / 04',
      letter:true
    }

  ];
  chapters.splice(3, 0,
    {eyebrow:'ГЛАВА IV · ФОТО',title:'Ты - мое вдохновение',body:'Я храню эти кадры не потому, что на них красивые горы.\nА потому, что на них - ты.',button:'Почему я тебя люблю',gallery:true},
    {eyebrow:'ГЛАВА V · ПРИЧИНЫ',title:'Почему я тебя люблю',body:'Нажми на каждую карточку ♥',button:'Открыть мое письмо',reasons:true}
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
    let diff = Math.max(0, target.getTime() - now());
    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hours = Math.floor(diff / 3600000); diff %= 3600000;
    const minutes = Math.floor(diff / 60000); const seconds = Math.floor((diff % 60000) / 1000);
    const values = {days, hours, minutes, seconds};
    for (const [key, value] of Object.entries(values)) {
      setNumber($(key), value); setNumber($('poster-' + key), value);
      const label = plural(value, unitWords[key]);
      for (const id of [key + '-label', 'poster-' + key + '-label']) { const l = $(id); if (l) l.textContent = label; }
    }
    if (now() >= target.getTime() && !document.body.classList.contains('is-birthday')) {
      document.body.classList.add('is-birthday');
      const posterSubtitle = $('poster-subtitle'), posterCountdown = $('poster-countdown');
      if (posterSubtitle) posterSubtitle.innerHTML = 'Сегодня твой день!<br>С днем рождения,<br>моя любимая';
      if (posterCountdown) posterCountdown.hidden = true;
      const cake = $('cake'); if (cake) cake.hidden = false;
      if (posterOpen) posterOpen.innerHTML = 'Открыть поздравление <span>♡</span>';
      window.setTimeout(() => { burst(window.innerWidth / 2, window.innerHeight / 2, 28); confettiRain(70); }, 600);
      if (eyebrow) eyebrow.textContent = '30 ОКТЯБРЯ · ТВОЙ ОСОБЕННЫЙ ДЕНЬ';
      if (hint) hint.textContent = 'Сегодня все это - для тебя ❤️';
      if (next) next.innerHTML = 'Начать поздравление';
    }
  }
  function showChapter(index) {
    chapterIndex = index; mode = 'story'; const c = chapters[index];
    scene.classList.remove('reveal','letter'); void scene.offsetWidth; if (c.letter) scene.classList.add('letter');
    eyebrow.textContent = c.eyebrow; title.textContent = c.title; body.textContent = c.body; letterOpened = false; letterStage.hidden = !c.letter; body.hidden = Boolean(c.letter); if (c.letter) {
      envelope.classList.remove('open');
      next.innerHTML = 'Открыть мое письмо <span>♥</span>';
    } else {
      next.innerHTML = c.button;
    }
    counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(chapters.length).padStart(2, '0');
    gallery.hidden = !c.gallery;
    reasonsBox.hidden = !c.reasons;
    secretHeart.hidden = true;
    window.clearTimeout(typingTimer);
    if (c.gallery) gallery.querySelector('.gallery-track').scrollLeft = 0; hint.hidden = true; countdown.hidden = true; progress.hidden = false; fill.style.width = `${((index+1)/chapters.length)*100}%`; back.hidden = false; signature.textContent = 'Создано специально для тебя ♥'; scene.classList.add('reveal'); placeHeart(index);
  }
  function showCountdown() {
    mode = 'countdown'; placeHeart(-1); gallery.hidden = true; reasonsBox.hidden = true; secretHeart.hidden = true; window.clearTimeout(typingTimer); letterStage.hidden = true; body.hidden = false; scene.classList.remove('letter','reveal'); void scene.offsetWidth; eyebrow.textContent = 'ДО ТВОЕГО ОСОБЕННОГО ДНЯ ОСТАЛОСЬ'; title.innerHTML = 'Мое<br>солнышко'; body.innerHTML = 'С каждым днем<br>я все больше понимаю,<br>как мне повезло, что ты есть<br>в моей жизни <span class="pink-heart">♥</span>'; hint.hidden = false; countdown.hidden = false; progress.hidden = true; back.hidden = true; signature.innerHTML = 'Создано специально для тебя <span>♥</span>'; counter.textContent = '30 · 10 · 2026'; next.innerHTML = 'Открыть сюрприз <span>♡</span>'; scene.classList.add('reveal'); updateCountdown();
  }
  next.addEventListener('click', () => {
    burstFrom(next);
    if (mode === 'story' && chapters[chapterIndex].letter) {
      if (!letterOpened) { letterOpened = true; envelope.classList.add('open'); next.innerHTML = 'Письмо открывается… <span>♥</span>'; window.setTimeout(typeLetter, 900); }
      else typeLetter(true);
      return;
    }
    if (mode === 'countdown') {
      if (now() < target.getTime() && !previewMode) {
        eyebrow.textContent = 'МАЛЕНЬКАЯ ПОДСКАЗКА';
        title.textContent = 'Самое главное - впереди';
        body.textContent = 'Это не просто поздравление. Я хочу подарить тебе несколько слов, которые идут от сердца. А самое главное ты узнаешь 30 октября. ❤️';
        countdown.hidden = true; hint.textContent = 'Пусть это пока останется нашим маленьким секретом';
        next.innerHTML = 'Вернуться к отсчету';
        mode = 'teaser';
        return;
      }
      showChapter(0); return;
    }
    if (mode === 'teaser') { showCountdown(); return; }
    if (chapterIndex < chapters.length - 1) showChapter(chapterIndex + 1); else showChapter(chapters.length - 1);
  });
  back.addEventListener('click', showCountdown);
  $('wait-close').addEventListener('click', closeWait);
  waitScreen.addEventListener('click', (e) => { if (e.target === waitScreen) closeWait(); });
  setInterval(() => { if (!waitScreen.hidden) updateWaitLeft(); }, 1000);

  // ---------- 2. Письмо печатается на глазах (касание - показать сразу) ----------
  function typeLetter(instant) {
    const text = chapters[chapters.length - 1].body; let i = 0;
    window.clearTimeout(typingTimer); body.hidden = false; body.textContent = ''; body.classList.add('typing'); secretHeart.hidden = true;
    const finish = () => { window.clearTimeout(typingTimer); body.textContent = text; body.classList.remove('typing'); next.innerHTML = 'Прочитать письмо еще раз'; secretHeart.hidden = false; };
    if (instant === true || reduceMotion) { finish(); return; }
    next.innerHTML = 'Показать письмо целиком <span>↓</span>';
    const step = () => { i = Math.min(text.length, i + 2); body.textContent = text.slice(0, i); if (i >= text.length) { finish(); return; } const ch = text[i - 1]; typingTimer = window.setTimeout(step, ch === '\n' ? 160 : /[.,!?]/.test(ch) ? 90 : 22); };
    step();
  }
  body.addEventListener('click', () => { if (body.classList.contains('typing')) typeLetter(true); });

  // ---------- 1. Галерея ----------
  const photos = [
    {src:'photo-1.webp', caption:'Ты смотришь вдаль, а я - на тебя'},
    {src:'photo-2.webp', caption:'Сильная и нежная одновременно'},
    {src:'photo-3.webp', caption:'Весь мир - у твоих ног'},
    {src:'photo-4.webp', caption:'Свободная, как ветер в горах'},
    {src:'photo-5.webp', caption:'Моя королева гор'},
    {src:'photo-6.webp', caption:'Даже древние башни не так прекрасны'},
    {src:'photo-7.webp', caption:'Город в огнях, а самый яркий свет - ты'}
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

  // Фотогалерея открыта всегда - даже до 30.10, когда сам сюрприз еще закрыт.
  const posterGallery = $('poster-gallery');
  if (posterGallery) posterGallery.addEventListener('click', () => openLightbox(0));
  const lightbox = $('lightbox'), lbImg = $('lightbox-img'), lbCap = $('lightbox-caption'), lbCount = $('lightbox-count');
  let lbIndex = 0;
  function showPhoto(i) { lbIndex = (i + photos.length) % photos.length; const p = photos[lbIndex]; new Image().src = photos[(lbIndex + 1) % photos.length].src; lbImg.classList.remove('in'); void lbImg.offsetWidth; lbImg.src = p.src; lbImg.alt = p.caption; lbCap.textContent = p.caption; lbCount.textContent = (lbIndex + 1) + ' / ' + photos.length; lbImg.classList.add('in'); }
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
    else if (!waitScreen.hidden && e.key === 'Escape') closeWait();
    else if (!future.hidden && e.key === 'Escape') closeFuture();
    else if (!bonus.hidden && e.key === 'Escape') closeBonus();
    else if (!finale.hidden && e.key === 'Escape') closeFinale();
  });

  // ---------- 4. «Почему я тебя люблю» ----------
  const reasons = [
    ['☀', 'Твоя улыбка', 'Она делает любой день теплее - даже самый пасмурный.'],
    ['✦', 'Твоя сила', 'Ты справляешься с тем, что другим не под силу, и остаешься нежной.'],
    ['♡', 'Твоя забота', 'Рядом с тобой хочется быть лучше и спокойнее.'],
    ['❀', 'Твой взгляд', 'В нем столько света, что я каждый раз теряюсь.'],
    ['⛰', 'Твоя смелость', 'Ты поднимаешься на вершины - и тянешь меня за собой.'],
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
  $('secret-close').addEventListener('click', () => { burstFrom($('secret-close')); window.setTimeout(() => { closeSecret(); openFinale(); }, 450); });

  // ---------- Финал: «С днем рождения» на весь экран и салют ----------
  const finale = $('finale'), canvas = $('fireworks'), ctx = canvas.getContext('2d');
  const fwColors = ['#f1c56e', '#fff0c2', '#cab3e6', '#af7bbd', '#f7b8e4', '#ffffff'];
  let rockets = [], sparks = [], fwFrame = 0, fwLaunch = 0, dpr = 1;
  function sizeCanvas() { dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function launch(x) {
    const w = innerWidth, h = innerHeight;
    rockets.push({x: x ?? w * (.15 + Math.random() * .7), y: h, vx: (Math.random() - .5) * 1.2, vy: -(h * .011 + Math.random() * 3), color: fwColors[Math.floor(Math.random() * fwColors.length)]});
  }
  function explode(r) {
    const n = 46 + Math.floor(Math.random() * 30), heart = Math.random() < .35;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n; let vx, vy;
      if (heart) { const t = a; vx = 16 * Math.sin(t) ** 3 * .28; vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * .28; }
      else { const sp = 2 + Math.random() * 4.5; vx = Math.cos(a) * sp; vy = Math.sin(a) * sp; }
      sparks.push({x: r.x, y: r.y, vx, vy, life: 1, decay: .012 + Math.random() * .012, color: Math.random() < .25 ? '#fff' : r.color});
    }
  }
  function fwTick() {
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    rockets = rockets.filter((r) => { r.x += r.vx; r.y += r.vy; r.vy += .09; ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, 7); ctx.fill(); if (r.vy >= -1) { explode(r); return false; } return true; });
    sparks = sparks.filter((p) => { p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .045; p.life -= p.decay; if (p.life <= 0) return false; ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 1.9, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return true; });
    if (performance.now() > fwLaunch) { launch(); fwLaunch = performance.now() + 450 + Math.random() * 650; }
    fwFrame = requestAnimationFrame(fwTick);
  }
  function salvo() { for (let i = 0; i < 5; i++) window.setTimeout(() => launch(innerWidth * (.15 + i * .175)), i * 140); }
  function openFinale() {
    finale.hidden = false; document.body.classList.add('no-scroll'); finale.classList.remove('play'); void finale.offsetWidth; finale.classList.add('play');
    if (reduceMotion) return;
    sizeCanvas(); cancelAnimationFrame(fwFrame); rockets = []; sparks = []; fwLaunch = 0; fwTick(); salvo(); confettiRain(50);
  }
  function closeFinale() { finale.hidden = true; document.body.classList.remove('no-scroll'); cancelAnimationFrame(fwFrame); ctx.clearRect(0, 0, innerWidth, innerHeight); }
  window.addEventListener('resize', () => { if (!finale.hidden) sizeCanvas(); });
  // ---------- «Найди сердечки»: по одному в главах I–V ----------
  const heartSpots = [
    {top:'14%', left:'7%'}, {top:'52%', left:'90%'}, {top:'86%', left:'10%'}, {top:'9%', left:'84%'}, {top:'64%', left:'4%'}
  ];
  const HEARTS_KEY = 'solnce-hearts-2026';
  const hiddenHeart = $('hidden-heart'), heartsBadge = $('hearts-badge'), heartsDots = $('hearts-dots'), heartsText = $('hearts-text'), bonus = $('bonus');
  let foundHearts = new Set();
  try { foundHearts = new Set(JSON.parse(localStorage.getItem(HEARTS_KEY) || '[]')); } catch (_) {}
  function renderHearts() {
    heartsDots.innerHTML = heartSpots.map((_, i) => `<i class="${foundHearts.has(i) ? 'on' : ''}">♥</i>`).join('');
    heartsText.textContent = foundHearts.size >= heartSpots.length ? 'Все сердечки найдены - открыть бонус' : `Найди спрятанные сердечки · ${foundHearts.size} из ${heartSpots.length}`;
    heartsBadge.classList.toggle('complete', foundHearts.size >= heartSpots.length);
  }
  function placeHeart(index) {
    heartsBadge.hidden = index < 0;
    const spot = heartSpots[index];
    if (!spot || foundHearts.has(index)) { hiddenHeart.hidden = true; return; }
    hiddenHeart.hidden = false; hiddenHeart.dataset.index = index; hiddenHeart.classList.remove('caught');
    hiddenHeart.style.top = spot.top; hiddenHeart.style.left = spot.left;
  }
  hiddenHeart.addEventListener('click', (e) => {
    const i = Number(hiddenHeart.dataset.index); if (foundHearts.has(i)) return;
    foundHearts.add(i); try { localStorage.setItem(HEARTS_KEY, JSON.stringify([...foundHearts])); } catch (_) {}
    burst(e.clientX, e.clientY, 12); hiddenHeart.classList.add('caught'); window.setTimeout(() => { if (hiddenHeart.dataset.index === String(i)) hiddenHeart.hidden = true; }, 500);
    renderHearts(); heartsBadge.classList.remove('pulse'); void heartsBadge.offsetWidth; heartsBadge.classList.add('pulse');
    if (foundHearts.size >= heartSpots.length) window.setTimeout(openBonus, 700);
  });
  function openBonus() { bonus.hidden = false; document.body.classList.add('no-scroll'); burst(innerWidth / 2, innerHeight / 2, 28); confettiRain(60); $('bonus-close').focus(); }
  function closeBonus() { bonus.hidden = true; document.body.classList.remove('no-scroll'); }
  heartsBadge.addEventListener('click', () => { if (foundHearts.size >= heartSpots.length) openBonus(); else { heartsBadge.classList.remove('pulse'); void heartsBadge.offsetWidth; heartsBadge.classList.add('pulse'); } });
  $('bonus-close').addEventListener('click', () => { burstFrom($('bonus-close')); window.setTimeout(closeBonus, 350); });
  bonus.addEventListener('click', (e) => { if (e.target === bonus) closeBonus(); });
  renderHearts();

  // ---------- Письмо «Открой через год»: заблокировано до 30.10.2027 00:00 ----------
  const futureTarget = new Date('2027-10-30T00:00:00+05:00');
  let futureForceOpen = false;
  const future = $('future');
  function renderFuture() {
    const open = now() >= futureTarget.getTime() || futureForceOpen;
    $('future-locked').hidden = open; $('future-text').hidden = !open;
    $('future-eyebrow').textContent = open ? '30 · 10 · 2027 · ПРОШЕЛ ГОД' : 'ПИСЬМО В БУДУЩЕЕ';
    $('future-close').innerHTML = open ? 'Обнять тебя <span>♥</span>' : 'Буду ждать <span>♡</span>';
    if (!open) {
      const diff = futureTarget.getTime() - now(), d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000);
      $('future-left').textContent = 'Откроется через ' + d + ' ' + plural(d, unitWords.days) + (h ? ' ' + h + ' ' + plural(h, unitWords.hours) : '');
    }
  }
  function openFuture() { renderFuture(); future.hidden = false; $('future-close').focus(); }
  function closeFuture() { future.hidden = true; }
  $('finale-future').addEventListener('click', openFuture);
  $('future-close').addEventListener('click', closeFuture);
  future.addEventListener('click', (e) => { if (e.target === future) closeFuture(); });

  $('finale-again').addEventListener('click', (e) => { salvo(); burst(e.clientX, e.clientY, 16); });
  $('finale-restart').addEventListener('click', () => { closeFinale(); showChapter(0); window.scrollTo({top:0, behavior:'smooth'}); });
  canvas.addEventListener('click', (e) => launch(e.clientX));
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
    if ([...document.querySelectorAll('.candle')].every((x) => x.classList.contains('out'))) { $('cake-hint').textContent = 'Желание загадано - пусть сбудется ✨'; confettiRain(90); }
  }));
  if (envelope) envelope.addEventListener('click', () => { if (!letterOpened) next.click(); });
  document.querySelectorAll('.flourish-heart .heart').forEach((h) => h.closest('svg').addEventListener('click', (e) => burst(e.clientX, e.clientY, 10)));
  updateCountdown(); setInterval(updateCountdown, 1000);

  // ---------- Заставка: прячем, когда загрузились портрет и шрифты (не дольше 4 с) ----------
  const splash = $('splash');
  if (splash) {
    const bg = document.querySelector('.poster-bg');
    const imgReady = bg && !bg.complete ? new Promise((r) => { bg.addEventListener('load', r, {once:true}); bg.addEventListener('error', r, {once:true}); }) : Promise.resolve();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const hide = () => { splash.classList.add('done'); window.setTimeout(() => splash.remove(), 700); };
    Promise.race([Promise.all([imgReady, fontsReady]), new Promise((r) => window.setTimeout(r, 4000))]).then(hide);
  }
  // ---------- Панель автора (видна только автору) ----------
  if (isOwner || new URLSearchParams(location.search).get('preview') === 'solnce3010') {
    const panel = document.createElement('div'); panel.className = 'owner-panel';
    panel.innerHTML = `<button class="owner-toggle" type="button" aria-expanded="false" aria-label="Панель автора">🔧</button>
      <div class="owner-menu" hidden>
        <p class="owner-hint">Это видишь только ты</p>
        <button type="button" data-act="full">Полный доступ: <b>вкл</b></button>
        <button type="button" data-act="midnight">⏩ 10 секунд до 00:00 30.10</button>
        <button type="button" data-act="birthday">🎂 Сразу день рождения</button>
        <button type="button" data-act="real">🕐 Реальное время</button>
        <button type="button" data-act="future">💌 Письмо через год: <b>закрыто</b></button>
        <button type="button" data-act="finale">🎆 Показать финал</button>
        <button type="button" data-act="hearts">♥ Сбросить сердечки</button>
      </div>`;
    document.body.appendChild(panel); document.body.classList.add('has-owner');
    const menu = panel.querySelector('.owner-menu'), toggle = panel.querySelector('.owner-toggle');
    const label = (act, text) => { panel.querySelector(`[data-act="${act}"] b`).textContent = text; };
    const subtitleHTML = $('poster-subtitle').innerHTML, openHTML = posterOpen.innerHTML;
    const resetBirthday = () => {
      document.body.classList.remove('is-birthday'); lastLocked = null;
      $('poster-subtitle').innerHTML = subtitleHTML; $('poster-countdown').hidden = false; posterOpen.innerHTML = openHTML;
      $('cake').hidden = true; document.querySelectorAll('.candle').forEach((c) => c.classList.remove('out')); $('cake-hint').textContent = 'Загадай желание и задуй свечи';
    };
    toggle.addEventListener('click', () => { menu.hidden = !menu.hidden; toggle.setAttribute('aria-expanded', String(!menu.hidden)); });
    menu.addEventListener('click', (e) => {
      const act = e.target.closest('button')?.dataset.act; if (!act) return;
      if (act === 'full') { previewMode = !previewMode; label('full', previewMode ? 'вкл' : 'выкл - как увидит она'); lastLocked = null; updateCountdown(); }
      if (act === 'midnight') { timeOffset = target.getTime() - 10000 - Date.now(); previewMode = false; label('full', 'выкл - как увидит она'); resetBirthday(); if (storyShell && !storyShell.hidden) { storyShell.hidden = true; poster.hidden = false; } updateCountdown(); menu.hidden = true; }
      if (act === 'birthday') { timeOffset = target.getTime() + 60000 - Date.now(); resetBirthday(); updateCountdown(); menu.hidden = true; }
      if (act === 'real') { location.reload(); }
      if (act === 'future') { futureForceOpen = !futureForceOpen; label('future', futureForceOpen ? 'открыто' : 'закрыто'); }
      if (act === 'finale') { openFinale(); menu.hidden = true; }
      if (act === 'hearts') { try { localStorage.removeItem(HEARTS_KEY); } catch (_) {} foundHearts = new Set(); renderHearts(); if (mode === 'story') placeHeart(chapterIndex); }
    });
  }

  // If opened through a Telegram deep link with ?story=1, start at the story screen.
  const params = new URLSearchParams(location.search);
  if (params.get('story') === '1' && !isLocked()) { openStoryApp(); showCountdown(); }
  else { showCountdown(); }
})();
