(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const pads = [$('leftPad'), $('rightPad')];
  const sequence = [];
  let inputAt = 0, accepting = false, soundOn = true, vibrationOn = true, audio;
  const bestKey = 'eco-memory-best-v1';
  const pacing = {
    rapido: { first: 350, interval: 480, response: 350, next: 450 },
    normal: { first: 550, interval: 720, response: 520, next: 800 },
    demorado: { first: 800, interval: 1050, response: 800, next: 1000 }
  };
  const currentPacing = () => pacing[$('speedSelect').value] || pacing.normal;
  const vibrates = 'vibrate' in navigator;
  const vibrationToggle = $('vibToggle');
  if (!vibrates) { vibrationToggle.checked = false; vibrationToggle.disabled = true; vibrationOn = false; }
  function announce(message) {
    $('live').textContent = '';
    window.setTimeout(() => { $('live').textContent = message; }, 35);
  }
  function status(message) { $('status').textContent = message; announce(message); }
  function tone(index, kind = 'tap') {
    if (!soundOn) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = kind === 'good' ? 740 : kind === 'bad' ? 155 : index === 0 ? 310 : 560;
      gain.gain.setValueAtTime(.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.18, audio.currentTime + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + (kind === 'tap' ? .22 : .38));
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .4);
    } catch (_) { /* Alguns navegadores só liberam áudio depois do primeiro toque. */ }
  }
  function buzz(index) {
    if (!vibrationOn || !vibrates) return;
    try { navigator.vibrate(index === 0 ? 70 : [45, 45, 45]); } catch (_) { /* Vibração opcional. */ }
  }
  function signal(index, kind = 'tap') {
    pads[index].classList.add('active'); tone(index, kind); buzz(index);
    window.setTimeout(() => pads[index].classList.remove('active'), kind === 'tap' ? 380 : 420);
  }
  function playSequence() {
    accepting = false;
    $('level').textContent = String(sequence.length);
    status('Ouça a sequência…');
    const pace = currentPacing();
    sequence.forEach((index, step) => window.setTimeout(() => {
      signal(index);
      if (step === sequence.length - 1) window.setTimeout(() => {
        accepting = true; inputAt = 0; status('Sua vez — repita a sequência.');
      }, pace.response);
    }, pace.first + step * pace.interval));
  }
  function nextRound() { sequence.push(Math.random() < .5 ? 0 : 1); playSequence(); }
  function endGame() {
    accepting = false; signal(0, 'bad');
    const level = sequence.length;
    status(`Fim de jogo — você chegou ao nível ${level}.`);
  }
  pads.forEach((pad, index) => pad.addEventListener('click', () => {
    if (!accepting) return;
    signal(index);
    if (sequence[inputAt] !== index) { endGame(); return; }
    inputAt++;
    if (inputAt === sequence.length) {
      accepting = false; tone(index, 'good'); status('Certo!');
      window.setTimeout(nextRound, currentPacing().next);
    }
  }));
  $('startBtn').addEventListener('click', () => {
    sequence.length = 0; inputAt = 0; accepting = false;
    $('level').textContent = '1';
    if (audio?.state === 'suspended') audio.resume();
    nextRound();
  });
  $('soundToggle').addEventListener('change', (event) => {
    soundOn = event.currentTarget.checked;
    if (soundOn) tone(0);
  });
  vibrationToggle.addEventListener('change', (event) => {
    vibrationOn = event.currentTarget.checked && vibrates;
    if (vibrationOn) navigator.vibrate(45);
  });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
})();
