// ============================================================
// script.js — lógica do jogo Eco
// ------------------------------------------------------------
// Tudo dentro de uma IIFE (function(){...})() pra não vazar
// nenhuma variável pro escopo global do navegador.
// ============================================================
(function(){
  "use strict";

  // ---------- referências aos elementos do HTML ----------
  const startBtn    = document.getElementById('startBtn');
  const statusEl    = document.getElementById('status');
  const scoreEl     = document.getElementById('scoreEl');
  const liveEl      = document.getElementById('live');
  const soundToggle = document.getElementById('soundToggle');
  const vibToggle   = document.getElementById('vibToggle');
  const vibWarning  = document.getElementById('vibWarning');

  // objeto com os dois botões do tabuleiro, indexados por nome —
  // assim o resto do código pode fazer sides['left'] ou sides['right']
  // em vez de dois "if" separados em toda função
  const sides = {
    left:  document.getElementById('btnLeft'),
    right: document.getElementById('btnRight')
  };

  // ---------- padrões de vibração ----------
  // navigator.vibrate aceita:
  //   - um número (vibra X ms uma vez)
  //   - um array (alterna vibra/pausa/vibra/pausa...)
  // Exemplo: [90, 90, 90] = vibra 90ms, pausa 90ms, vibra 90ms → "pulso duplo"
  const VIB_PATTERNS = { left: [140], right: [90, 90, 90] };

  // nem todo navegador tem Vibration API (o Safari/iOS, por exemplo,
  // nunca implementou). Detectamos isso testando se a função existe:
  const canVibrate = 'vibrate' in navigator;
  if (!canVibrate) {
    vibWarning.hidden = false;   // mostra o aviso na tela
    vibToggle.checked = false;   // desmarca o toggle
    vibToggle.disabled = true;   // e trava ele, pra não confundir o usuário
  }

  // ============================================================
  // ÁUDIO — usamos a Web Audio API pra gerar tons na hora (sem
  // precisar de nenhum arquivo .mp3). Cada função aqui cria um
  // "oscilador" (uma onda sonora simples) e o descarta depois de tocar.
  // ============================================================
  let audioCtx = null;

  // cria o AudioContext só na primeira vez que for preciso.
  // Isso é necessário porque os navegadores bloqueiam áudio
  // automático — só liberam depois de um toque/clique do usuário.
  function ensureAudio(){
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext; // webkit = compatibilidade Safari
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  // toca um tom simples.
  //   freq: frequência em Hz (grave → agudo)
  //   dur:  duração em segundos
  //   type: formato da onda ('sine' = suave, 'sawtooth' = mais áspero, usado no erro)
  function tone(freq, dur, type){
    if (!soundToggle.checked) return; // respeita o toggle de som
    ensureAudio();

    const osc  = audioCtx.createOscillator(); // gera a onda
    const gain = audioCtx.createGain();       // controla o volume ao longo do tempo

    osc.type = type || 'sine';
    osc.frequency.value = freq;

    // a "envelope" de volume evita o clique seco no início/fim do som:
    // sobe rápido até 0.22, depois desce suavemente até quase zero
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);

    osc.connect(gain).connect(audioCtx.destination); // osc → volume → alto-falante
    osc.start();
    osc.stop(audioCtx.currentTime + dur + 0.02);
  }

  // sons distintos por lado: grave à esquerda, agudo à direita —
  // reforça a diferença entre os lados também para quem tem baixa visão
  function playSideSound(side){
    if (side === 'left') tone(300, 0.28, 'sine');
    else tone(560, 0.22, 'sine');
  }
  function playError(){
    tone(120, 0.5, 'sawtooth'); // som mais "áspero" propositalmente, pra soar como erro
  }
  function playSuccess(){
    tone(700, 0.12, 'sine');
    setTimeout(()=>tone(900, 0.18, 'sine'), 90); // dois tons subindo = "certo!"
  }

  // ---------- vibração ----------
  function doVibrate(side){
    if (canVibrate && vibToggle.checked) {
      navigator.vibrate(VIB_PATTERNS[side]);
    }
  }

  // ============================================================
  // ACESSIBILIDADE PARA LEITOR DE TELA
  // ------------------------------------------------------------
  // #live tem aria-live="assertive" no HTML. Quando o texto dentro
  // dele muda, o VoiceOver/TalkBack lê automaticamente, mesmo sem
  // o foco estar ali. O truque de limpar e usar setTimeout existe
  // porque, se o texto novo for IGUAL ao anterior, alguns leitores
  // de tela não percebem a mudança e não leem de novo.
  // ============================================================
  function announce(text){
    liveEl.textContent = '';
    setTimeout(()=>{ liveEl.textContent = text; }, 30);
  }

  // atualiza a linha de status visível (diferente do announce,
  // que é só pra leitor de tela). kind pode ser 'ok', 'err' ou nada,
  // e controla a cor do texto via as classes .ok/.err do CSS.
  function setStatus(text, kind){
    statusEl.textContent = text;
    statusEl.className = kind || '';
  }

  // ============================================================
  // "ACENDER" UM LADO — o coração do feedback multissensorial.
  // Junta visual (classe .lit) + som (playSideSound) + vibração
  // (doVibrate) num só lugar, pra sempre disparar os três juntos.
  // Retorna uma Promise pra podermos usar "await" e esperar a
  // animação terminar antes de acender o próximo item da sequência.
  // ============================================================
  function lightUp(side, duration){
    return new Promise(resolve=>{
      const el = sides[side];
      el.classList.add('lit');

      // reinicia a animação do anel: sem isso, se o mesmo lado
      // acender duas vezes seguidas, a segunda vez não reanimaria
      // (o navegador entende que "a animação já rodou")
      el.querySelectorAll('.ring span').forEach(s=>{
        s.style.animation = 'none';
        void s.offsetWidth; // truque pra forçar o navegador a "recalcular" antes de religar
        s.style.animation = '';
      });

      playSideSound(side);
      doVibrate(side);

      // fica "aceso" por 75% da duração, depois apaga e espera
      // mais 25% antes de resolver — dá um respiro visual entre os itens
      setTimeout(()=>{
        el.classList.remove('lit');
        setTimeout(resolve, duration * 0.25);
      }, duration * 0.75);
    });
  }

  // ============================================================
  // ESTADO DO JOGO
  // ============================================================
  let sequence   = [];   // ex: ['left', 'right', 'left'] — a sequência completa até agora
  let playerStep = 0;    // em qual posição da sequência o jogador está repetindo
  let level      = 0;    // nível atual (= tamanho da sequência)
  let accepting  = false; // true = o jogo está esperando o jogador tocar
  let playing    = false; // true = tem uma partida rolando

  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  // toca a sequência inteira do início ao fim, um lado de cada vez,
  // usando await pra esperar cada lightUp() terminar antes do próximo
  async function playSequence(){
    accepting = false;
    setDisabled(true);
    setStatus('Observe a sequência…');
    announce('Observe a sequência.');
    await sleep(500); // pequena pausa antes de começar, pra dar tempo de "se preparar"

    for (const side of sequence) {
      await lightUp(side, 560);
      await sleep(220); // intervalo de silêncio entre um item e outro da sequência
    }

    setStatus('Sua vez — repita a sequência.');
    announce('Sua vez.');
    playerStep = 0;
    accepting = true;
    setDisabled(false);
  }

  // liga/desliga a aparência "desabilitada" dos dois lados
  // (usado enquanto a sequência está tocando, pra não aceitar toque)
  function setDisabled(disabled){
    Object.values(sides).forEach(el=>{
      el.classList.toggle('disabled', disabled);
      el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    });
  }

  // avança de nível: soma 1 no placar, adiciona um lado aleatório
  // na sequência, e manda tocar tudo de novo (agora um item maior)
  function nextRound(){
    level += 1;
    scoreEl.childNodes[0].nodeValue = String(level) + ' ';
    sequence.push(Math.random() < 0.5 ? 'left' : 'right');
    playSequence();
  }

  // chamada toda vez que o jogador toca em um dos lados
  async function handlePlayerInput(side){
    if (!accepting || !playing) return; // ignora toques fora de hora
    lightUp(side, 260); // feedback imediato do toque, mesmo que erre depois

    if (side === sequence[playerStep]) {
      // acertou esse passo — avança
      playerStep += 1;

      if (playerStep === sequence.length) {
        // completou a sequência inteira: sobe de nível
        accepting = false;
        setStatus('Certo! Preparando o próximo nível…', 'ok');
        announce('Certo.');
        playSuccess();
        await sleep(700);
        if (playing) nextRound();
      }
    } else {
      // errou: fim de jogo
      accepting = false;
      playing = false;
      setDisabled(true);
      playError();
      if (canVibrate && vibToggle.checked) navigator.vibrate([200, 80, 200]); // vibração de erro, diferente das duas de jogo
      setStatus('Errou na sequência. Nível alcançado: ' + level + '. Toque em Iniciar para tentar de novo.', 'err');
      announce('Errou. Nível alcançado: ' + level + '.');
      startBtn.hidden = false;
      startBtn.disabled = false;
      startBtn.textContent = '↻ Jogar de novo';
    }
  }

  // reinicia tudo e começa uma partida nova
  function startGame(){
    ensureAudio(); // aproveita o clique do usuário pra "destravar" o áudio
    sequence = [];
    level = 0;
    playing = true;
    scoreEl.childNodes[0].nodeValue = '0 ';
    startBtn.hidden = true;
    nextRound();
  }

  // ---------- ligação dos eventos ----------
  startBtn.addEventListener('click', startGame);

  Object.entries(sides).forEach(([name, el])=>{
    el.addEventListener('click', ()=> handlePlayerInput(name));
    // Enter/Espaço também funcionam, pra quem navega só com teclado
    // (leitor de tela costuma simular isso ao "ativar" um elemento)
    el.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePlayerInput(name);
      }
    });
  });

  // o <div id="scoreEl"> tem um <small>Nível</small> dentro dele.
  // Essa linha recria essa estrutura logo no carregamento, garantindo
  // que childNodes[0] (usado em nextRound/startGame pra trocar o número)
  // sempre aponte pro nó de texto certo, e não para o <small>.
  scoreEl.innerHTML = '0 <small>Nível</small>';
})();
