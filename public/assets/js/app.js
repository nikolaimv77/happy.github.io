(() => {
  'use strict';
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); try { tg.setHeaderColor('#2a0029'); tg.setBackgroundColor('#2a0029'); } catch (_) {} }
  const $ = (id) => document.getElementById(id);
  const poster = $('poster-screen'), storyShell = $('story-shell'), posterOpen = $('poster-open');
  function openStoryApp() { if (poster) poster.hidden = true; if (storyShell) storyShell.hidden = false; }
  if (posterOpen) posterOpen.addEventListener('click', () => { burstFrom(posterOpen); openStoryApp(); showChapter(0); if (music && music.paused) playMusic(); });
  const musicButton = $('music-toggle'), music = $('background-music'), musicState = $('music-state');
  function syncMusic() {
    if (!musicButton || !music) return;
    const playing = !music.paused;
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Выключить песню' : 'Включить песню');
    if (musicState) musicState.textContent = playing ? 'Играет · нажми, чтобы выключить' : 'Нажми, чтобы включить';
  }
  async function playMusic() {
    if (!music) return;
    try { music.volume = 0.85; await music.play(); } catch (_) { if (musicState) musicState.textContent = 'Нажми ещё раз'; }
    syncMusic();
  }
  if (musicButton && music) {
    musicButton.addEventListener('click', () => { if (music.paused) playMusic(); else { music.pause(); syncMusic(); } });
    music.addEventListener('play', syncMusic); music.addEventListener('pause', syncMusic);
  }
  const scene = $('scene'), eyebrow = $('eyebrow'), title = $('title'), body = $('body'), next = $('next'), back = $('back'), counter = $('counter'), hint = $('hint'), countdown = $('countdown'), progress = $('progress'), fill = $('progress-fill'), signature = $('signature'), letterStage = $('letter-stage'), envelope = $('envelope');
  // Birthday is fixed to 30 October 2026, midnight in Tashkent (UTC+5).
  const target = new Date('2026-10-30T00:00:00+05:00');
  const previewMode = new URLSearchParams(location.search).get('preview') === '1';
  const chapters = [
    {eyebrow:'ГЛАВА I · ОТ ВСЕГО СЕРДЦА',title:'Ты особенная',body:'Солнце, иногда мы привыкаем к тому, что хорошие люди есть рядом. И не всегда находим время сказать им, насколько они важны.\n\nСегодня я не хочу оставлять это несказанным. Ты занимаешь особое место в моём сердце, и мне хочется, чтобы ты всегда знала, как много значишь для меня.',button:'Продолжить историю',counter:'01 / 04'},
    {eyebrow:'ГЛАВА II · МОЁ СОЛНЫШКО',title:'Почему я так тебя называю',body:'В слове «солнышко» есть что-то очень простое и настоящее: свет, тепло, уют. Что-то, к чему хочется возвращаться.\n\nЯ не обещаю, что каждый день будет идеальным. Но хочу, чтобы рядом со мной у тебя было больше поводов улыбаться, больше спокойствия и больше уверенности в том, что тебя любят.',button:'Ещё несколько слов',counter:'02 / 04'},
    {eyebrow:'ГЛАВА III · МОЁ ЖЕЛАНИЕ',title:'Пусть впереди будет много хорошего',body:'Я желаю тебе не только счастья, здоровья и исполнения желаний. Хочу, чтобы ты чаще чувствовала себя счастливой в самых обычных моментах.\n\nПусть у тебя хватает сил на важное, времени на то, что радует, и спокойствия для того, что нельзя изменить. И пусть в твоей жизни всегда будет место для нежности, смеха и любви.',button:'Открыть моё письмо',counter:'03 / 04'},
    {eyebrow:'МОЕМУ СОЛНЫШКУ · С ЛЮБОВЬЮ',title:'С днём рождения, моё солнце',body:'Моё любимое солнце.\n\nС днём рождения тебя. ❤️\n\nСегодня мне хочется, чтобы ты хотя бы на мгновение остановилась и почувствовала, насколько ты важна. Иногда самые искренние чувства непросто выразить словами, но самое главное оказывается гораздо проще.\n\nЯ рад, что ты есть в моей жизни.\n\nМне хочется, чтобы ты чаще улыбалась, чтобы твои глаза светились от счастья, чтобы у тебя исполнялись желания, о которых ты пока никому не рассказываешь. Хочу, чтобы ты берегла себя, не забывала о своих мечтах и всегда находила время для того, что делает тебя счастливой.\n\nА ещё мне хочется дарить тебе тепло не только в праздники. В обычные дни, когда нет особого повода, когда достаточно одного доброго слова, объятия или просто ощущения, что рядом есть близкий человек.\n\nЯ не знаю, какими будут все наши завтрашние дни. Но я знаю, что хочу наполнять их хорошими моментами вместе с тобой, радовать тебя и находить новые причины говорить тебе, как ты мне дорога.\n\nПусть новый год твоей жизни будет добрым к тебе. Пусть в нём будет много света, здоровья, душевного спокойствия, любви и счастливых мгновений.\n\nСпасибо тебе за то, что ты есть. Крепко обнимаю тебя. ❤️\n\nТвой человек.',button:'Прочитать письмо ещё раз',counter:'04 / 04',letter:true}
  ];
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
      if (posterOpen) posterOpen.innerHTML = 'Открыть поздравление <span>♡</span>';
      window.setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, 28), 600);
      if (eyebrow) eyebrow.textContent = '30 ОКТЯБРЯ · ТВОЙ ОСОБЕННЫЙ ДЕНЬ';
      if (hint) hint.textContent = 'Сегодня всё это — для тебя ❤️';
      if (next) next.innerHTML = 'Начать поздравление <span>↗</span>';
    }
  }
  function showChapter(index) {
    chapterIndex = index; mode = 'story'; const c = chapters[index];
    scene.classList.remove('reveal','letter'); void scene.offsetWidth; if (c.letter) scene.classList.add('letter');
    eyebrow.textContent = c.eyebrow; title.textContent = c.title; body.textContent = c.body; letterOpened = false; letterStage.hidden = !c.letter; body.hidden = Boolean(c.letter); if (c.letter) { envelope.classList.remove('open'); next.innerHTML = 'Открыть моё письмо <span>♥</span>'; } else { next.innerHTML = c.button + ' <span>↗</span>'; } counter.textContent = c.counter; hint.hidden = true; countdown.hidden = true; progress.hidden = false; fill.style.width = `${((index+1)/chapters.length)*100}%`; back.hidden = false; signature.textContent = 'Создано специально для тебя ♥'; scene.classList.add('reveal');
  }
  function showCountdown() {
    mode = 'countdown'; letterStage.hidden = true; body.hidden = false; scene.classList.remove('letter','reveal'); void scene.offsetWidth; eyebrow.textContent = 'ДО ТВОЕГО ОСОБЕННОГО ДНЯ ОСТАЛОСЬ'; title.innerHTML = 'Моё<br>солнышко'; body.innerHTML = 'С каждым днём<br>я всё больше понимаю,<br>как мне повезло, что ты есть<br>в моей жизни <span class="pink-heart">♥</span>'; hint.hidden = false; countdown.hidden = false; progress.hidden = true; back.hidden = true; signature.innerHTML = 'Создано специально для тебя <span>♥</span>'; counter.textContent = '30 · 10 · 2026'; next.innerHTML = 'Открыть сюрприз <span>♡</span>'; scene.classList.add('reveal'); updateCountdown();
  }
  next.addEventListener('click', () => {
    burstFrom(next);
    if (mode === 'story' && chapters[chapterIndex].letter) {
      if (!letterOpened) { letterOpened = true; envelope.classList.add('open'); next.innerHTML = 'Письмо открыто · читать ещё раз <span>♥</span>'; window.setTimeout(() => { body.hidden = false; body.classList.remove('letter-copy-reveal'); void body.offsetWidth; body.classList.add('letter-copy-reveal'); next.innerHTML = 'Прочитать письмо ещё раз <span>↗</span>'; }, 720); } else { body.hidden = false; body.classList.remove('letter-copy-reveal'); void body.offsetWidth; body.classList.add('letter-copy-reveal'); } return;
    }
    if (mode === 'countdown') {
      if (Date.now() < target.getTime() && !previewMode) { eyebrow.textContent = 'МАЛЕНЬКАЯ ПОДСКАЗКА'; title.textContent = 'Самое главное — впереди'; body.textContent = 'Это не просто поздравление. Я хочу подарить тебе несколько слов, которые идут от сердца. А самое главное ты узнаешь 30 октября. ❤️'; countdown.hidden = true; hint.textContent = 'Пусть это пока останется нашим маленьким секретом'; next.innerHTML = 'Вернуться к отсчёту <span>↗</span>'; mode = 'teaser'; return; }
      showChapter(0); return;
    }
    if (mode === 'teaser') { showCountdown(); return; }
    if (chapterIndex < chapters.length - 1) showChapter(chapterIndex + 1); else showChapter(chapters.length - 1);
  });
  back.addEventListener('click', showCountdown);
  document.querySelectorAll('.flourish-heart .heart').forEach((h) => h.closest('svg').addEventListener('click', (e) => burst(e.clientX, e.clientY, 10)));
  updateCountdown(); setInterval(updateCountdown, 1000);
  // If opened through a Telegram deep link with ?story=1, start at the story screen.
  const params = new URLSearchParams(location.search);
  if (params.get('story') === '1' || (previewMode && params.get('preview') === '1' && params.get('story') === '1')) { openStoryApp(); showCountdown(); }
  else { showCountdown(); }
})();
