(() => {
  'use strict';

  // Subtle floating lilac hearts and golden sparkles; decorative only.
  (() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div');
    layer.className = 'ambient-particles';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    const symbols = ['✦', '✧', '♥', '·'];
    const colors = ['#f7d98b', '#d9a9ff', '#f8e9ff', '#c58aff'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('span');
      p.className = i % 3 === 0 ? 'ambient-particle dot' : 'ambient-particle';
      p.style.setProperty('--x', `${Math.random() * 100}%`);
      p.style.setProperty('--size', `${8 + Math.random() * 13}px`);
      p.style.setProperty('--particle-color', colors[i % colors.length]);
      p.style.setProperty('--duration', `${13 + Math.random() * 18}s`);
      p.style.setProperty('--delay', `${-Math.random() * 25}s`);
      p.style.setProperty('--drift', `${Math.round(Math.random() * 100 - 50)}px`);
      if (!p.classList.contains('dot')) p.textContent = symbols[i % symbols.length];
      layer.appendChild(p);
    }
  })();

  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); try { tg.setHeaderColor('#07111f'); tg.setBackgroundColor('#07111f'); } catch (_) {} }
  const $ = (id) => document.getElementById(id);
  const scene = $('scene'), eyebrow = $('eyebrow'), title = $('title'), body = $('body'), next = $('next'), back = $('back'), counter = $('counter'), hint = $('hint'), countdown = $('countdown'), progress = $('progress'), fill = $('progress-fill'), signature = $('signature'), letterStage = $('letter-stage'), envelope = $('envelope');
  // Preview mode: temporarily allow opening every chapter before the birthday.
  // Set PREVIEW_MODE to false to restore the date lock after approval.
  const PREVIEW_MODE = true;
  const target = new Date('2026-10-30T00:00:00+05:00');
  const chapters = [
    {eyebrow:'ГЛАВА I · ОТ ВСЕГО СЕРДЦА',title:'Ты особенная',body:'Солнце, иногда мы привыкаем к тому, что хорошие люди есть рядом. И не всегда находим время сказать им, насколько они важны.\n\nСегодня я не хочу оставлять это несказанным. Ты занимаешь особое место в моём сердце, и мне хочется, чтобы ты всегда знала, как много значишь для меня.',button:'Продолжить историю',counter:'01 / 04'},
    {eyebrow:'ГЛАВА II · МОЁ СОЛНЫШКО',title:'Почему я так тебя называю',body:'В слове «солнышко» есть что-то очень простое и настоящее: свет, тепло, уют. Что-то, к чему хочется возвращаться.\n\nЯ не обещаю, что каждый день будет идеальным. Но хочу, чтобы рядом со мной у тебя было больше поводов улыбаться, больше спокойствия и больше уверенности в том, что тебя любят.',button:'Ещё несколько слов',counter:'02 / 04'},
    {eyebrow:'ГЛАВА III · МОЁ ЖЕЛАНИЕ',title:'Пусть впереди будет много хорошего',body:'Я желаю тебе не только счастья, здоровья и исполнения желаний. Хочу, чтобы ты чаще чувствовала себя счастливой в самых обычных моментах.\n\nПусть у тебя хватает сил на важное, времени на то, что радует, и спокойствия для того, что нельзя изменить. И пусть в твоей жизни всегда будет место для нежности, смеха и любви.',button:'Открыть моё письмо',counter:'03 / 04'},
    {eyebrow:'МОЕМУ СОЛНЫШКУ · С ЛЮБОВЬЮ',title:'С днём рождения, моё солнце',body:'Моё любимое солнце.\n\nС днём рождения тебя. ❤️\n\nСегодня мне хочется, чтобы ты хотя бы на мгновение остановилась и почувствовала, насколько ты важна. Иногда самые искренние чувства непросто выразить словами, но самое главное оказывается гораздо проще.\n\nЯ рад, что ты есть в моей жизни.\n\nМне хочется, чтобы ты чаще улыбалась, чтобы твои глаза светились от счастья, чтобы у тебя исполнялись желания, о которых ты пока никому не рассказываешь. Хочу, чтобы ты берегла себя, не забывала о своих мечтах и всегда находила время для того, что делает тебя счастливой.\n\nА ещё мне хочется дарить тебе тепло не только в праздники. В обычные дни, когда нет особого повода, когда достаточно одного доброго слова, объятия или просто ощущения, что рядом есть близкий человек.\n\nЯ не знаю, какими будут все наши завтрашние дни. Но я знаю, что хочу наполнять их хорошими моментами вместе с тобой, радовать тебя и находить новые причины говорить тебе, как ты мне дорога.\n\nПусть новый год твоей жизни будет добрым к тебе. Пусть в нём будет много света, здоровья, душевного спокойствия, любви и счастливых мгновений.\n\nСпасибо тебе за то, что ты есть. Крепко обнимаю тебя. ❤️\n\nТвой человек.',button:'Прочитать письмо ещё раз',counter:'04 / 04',letter:true}
  ];
  let mode = 'countdown', chapterIndex = 0, letterOpened = false;
  const isBirthday = () => { const now = new Date(); return now >= target && now < new Date('2026-10-31T00:00:00+05:00'); };
  function updateCountdown() {
    const now = Date.now(); let diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hours = Math.floor(diff / 3600000); diff %= 3600000;
    const minutes = Math.floor(diff / 60000); const seconds = Math.floor((diff % 60000) / 1000);
    $('days').textContent = String(days).padStart(2,'0'); $('hours').textContent = String(hours).padStart(2,'0'); $('minutes').textContent = String(minutes).padStart(2,'0'); $('seconds').textContent = String(seconds).padStart(2,'0');
    if (!PREVIEW_MODE && Date.now() >= target.getTime()) {
      eyebrow.textContent = '30 ОКТЯБРЯ · ТВОЙ ОСОБЕННЫЙ ДЕНЬ'; title.innerHTML = 'С днём рождения,<br>моё солнышко'; body.textContent = 'Сегодня я хочу подарить тебе несколько слов, которые идут от сердца. Эта маленькая история создана специально для тебя.'; hint.textContent = 'Сегодня всё это — для тебя ❤️'; next.innerHTML = 'Начать нашу историю <span>↗</span>'; countdown.hidden = true;
    }
  }
  function showChapter(index) {
    chapterIndex = index; mode = 'story'; const c = chapters[index];
    scene.classList.remove('reveal','letter'); void scene.offsetWidth; if (c.letter) scene.classList.add('letter');
    eyebrow.textContent = c.eyebrow; title.textContent = c.title; body.textContent = c.body; letterOpened = false; letterStage.hidden = !c.letter; body.hidden = Boolean(c.letter); if (c.letter) { envelope.classList.remove('open'); next.innerHTML = 'Открыть моё письмо <span>♥</span>'; } else { next.innerHTML = c.button + ' <span>↗</span>'; } counter.textContent = c.counter; hint.hidden = true; countdown.hidden = true; progress.hidden = false; fill.style.width = `${((index+1)/chapters.length)*100}%`; back.hidden = false; signature.textContent = 'Создано специально для тебя ♥'; scene.classList.add('reveal');
  }
  function showCountdown() {
    mode = 'countdown'; letterStage.hidden = true; body.hidden = false; scene.classList.remove('letter','reveal'); void scene.offsetWidth; eyebrow.textContent = 'A LITTLE STORY FOR YOU'; title.innerHTML = 'Моё солнышко,<br>это для тебя'; body.textContent = 'Я приготовил для тебя кое-что особенное. Маленькую историю, в которой каждое слово — от сердца.'; hint.hidden = false; countdown.hidden = false; progress.hidden = true; back.hidden = true; signature.innerHTML = 'Создано специально для тебя <span>♥</span>'; counter.textContent = '30 · 10 · 2026'; next.innerHTML = 'Открыть сюрприз <span>↗</span>'; scene.classList.add('reveal'); updateCountdown();
  }
  next.addEventListener('click', () => {
    if (mode === 'story' && chapters[chapterIndex].letter) {
      if (!letterOpened) { letterOpened = true; envelope.classList.add('open'); next.innerHTML = 'Письмо открыто · читать ещё раз <span>♥</span>'; window.setTimeout(() => { body.hidden = false; body.classList.remove('letter-copy-reveal'); void body.offsetWidth; body.classList.add('letter-copy-reveal'); next.innerHTML = 'Прочитать письмо ещё раз <span>↗</span>'; }, 720); } else { body.hidden = false; body.classList.remove('letter-copy-reveal'); void body.offsetWidth; body.classList.add('letter-copy-reveal'); } return;
    }
    if (mode === 'countdown') {
      showChapter(0); return;
    }
    if (mode === 'teaser') { showCountdown(); return; }
    if (chapterIndex < chapters.length - 1) showChapter(chapterIndex + 1); else showChapter(chapters.length - 1);
  });
  back.addEventListener('click', () => {
    if (mode === 'story' && chapterIndex > 0) showChapter(chapterIndex - 1);
    else showCountdown();
  });
  updateCountdown(); setInterval(updateCountdown, 1000);
  // If opened through a Telegram deep link with ?story=1, start at the story screen.
  if (new URLSearchParams(location.search).get('story') === '1') showChapter(0);
})();
