const PALAVRAS = [
  { resposta: "CPU",
    pista: "Chip que executa as instruções dos programas; é o \"cérebro\" do computador." },
  { resposta: "ULA",
    pista: "Parte da CPU que faz as contas e as operações lógicas." },
  { resposta: "UC",
    pista: "Parte da CPU que interpreta as instruções e coordena o trabalho dos demais componentes." },
  { resposta: "REGISTRADORES",
    pista: "Pequenas memórias dentro da CPU, as mais rápidas de todas, que guardam os dados em uso imediato." },
  { resposta: "RAM",
    pista: "Memória volátil principal onde ficam programas e dados em uso; perde tudo ao desligar." },
  { resposta: "ROM",
    pista: "Memória não volátil gravada na fabricação, cujo conteúdo em geral não é alterado pelo usuário." },
  { resposta: "EEPROM",
    pista: "Memória não volátil regravável que permite apagar e escrever byte a byte, usada para guardar configurações pequenas." },
  { resposta: "FLASH",
    pista: "Memória não volátil regravável que apaga por blocos; presente em pendrives e cartões SD." },
  { resposta: "CACHE",
    pista: "Memória pequena e muito rápida entre a CPU e a RAM que guarda cópias de dados usados com frequência." },
  { resposta: "ARMAZENAMENTO",
    pista: "Dispositivo de grande capacidade e não volátil, como HD ou SSD, que guarda arquivos e programas de forma permanente." },
  { resposta: "DMA",
    pista: "Mecanismo que deixa periféricos e a RAM trocarem blocos de dados sem passar pela CPU, liberando-a para outras tarefas." },
  { resposta: "ADDRESSBUS",
    pista: "Conjunto de linhas, de sentido único, pelo qual a CPU indica a posição de memória que quer acessar." },
  { resposta: "DATABUS",
    pista: "Conjunto de linhas bidirecional que transporta os valores lidos ou escritos entre CPU, memória e periféricos." },
  { resposta: "MICROCONTROLADOR",
    pista: "Circuito integrado único com processador, memória e entradas/saídas, feito para tarefas dedicadas em sistemas embarcados." },
  { resposta: "DUALCORE",
    pista: "Processador com dois núcleos de execução no mesmo chip." },
  { resposta: "QUADCORE",
    pista: "Processador com quatro núcleos de execução no mesmo chip, capaz de executar tarefas em paralelo." }
];

const CHAVE_RECORDE = "nucleozero_recorde";
const CHAVE_SOM = "nucleozero_som";
const MAX_INTEGRIDADE = 5;
const INTEGRIDADE_INICIAL = 3;
const MODULOS_POR_NIVEL = 4;
const BONUS_VITORIA = 500;
const CUSTO_DICA = 10;

const grade = document.getElementById("modulos-grade");
const consoleEl = document.getElementById("console");
const elModulos = document.getElementById("modulos");
const elPontos = document.getElementById("pontos");
const elCombo = document.getElementById("combo");
const elTempo = document.getElementById("tempo");
const elRecorde = document.getElementById("recorde");
const elIntegridade = document.getElementById("integridade");
const elStatus = document.getElementById("status");
const elPista = document.getElementById("pista");
const elTamanho = document.getElementById("tamanho");
const elBarra = document.getElementById("tempo-preenchimento");
const elNumSinal = document.getElementById("num-sinal");
const btnSelecionar = document.getElementById("btn-selecionar");
const btnDica = document.getElementById("btn-dica");
const btnSom = document.getElementById("btn-som");
const overlay = document.getElementById("overlay");
const overlayTitulo = document.getElementById("overlay-titulo");
const overlayTexto = document.getElementById("overlay-texto");
const overlayStats = document.getElementById("overlay-stats");
const btnIniciar = document.getElementById("btn-iniciar");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

const jogo = {
  ativo: false,
  pontos: 0,
  combo: 0,
  integridade: INTEGRIDADE_INICIAL,
  nivel: 1,
  resolvidas: 0,
  fila: [],
  atual: null,
  opcoes: [],
  corretaPos: 0,
  scannerPos: 0,
  scannerTimer: null,
  bloqueado: false,
  dicaUsada: false,
  inicio: 0,
  tempoTimer: null,
  recorde: carregarNum(CHAVE_RECORDE),
  novoRecorde: false,
  som: carregarSom()
};

let audioCtx = null;
let padGain = null;
let particulas = [];
let animacaoConfetti = null;
let rodadaTimer = null;
let rodadaFim = 0;
let rodadaDuracao = 0;
let rodadaRestante = 0;

function carregarNum(chave) {
  try {
    const valor = Number(localStorage.getItem(chave) || 0);
    return Number.isFinite(valor) ? valor : 0;
  } catch (e) { return 0; }
}

function salvarNum(chave, valor) {
  try { localStorage.setItem(chave, String(valor)); } catch (e) {}
}

function carregarSom() {
  try {
    const valor = localStorage.getItem(CHAVE_SOM);
    return valor === null ? true : valor === "1";
  } catch (e) { return true; }
}

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copia[i];
    copia[i] = copia[j];
    copia[j] = tmp;
  }
  return copia;
}

function formatarTempo(ms) {
  const total = Math.floor(ms / 1000);
  const min = String(Math.floor(total / 60)).padStart(2, "0");
  const seg = String(total % 60).padStart(2, "0");
  return min + ":" + seg;
}

function obterAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tom(freq, duracao, tipo, volume, atraso) {
  if (!jogo.som) return;
  const a = obterAudio();
  if (!a) return;
  const t0 = a.currentTime + (atraso || 0);
  const dur = duracao || 0.12;
  const osc = a.createOscillator();
  const ganho = a.createGain();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  ganho.gain.setValueAtTime(0.0001, t0);
  ganho.gain.exponentialRampToValueAtTime(volume || 0.06, t0 + 0.012);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(ganho);
  ganho.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function tomVar(freqIni, freqFim, duracao, tipo, volume, atraso) {
  if (!jogo.som) return;
  const a = obterAudio();
  if (!a) return;
  const t0 = a.currentTime + (atraso || 0);
  const dur = duracao || 0.2;
  const osc = a.createOscillator();
  const ganho = a.createGain();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freqIni, t0);
  osc.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur);
  ganho.gain.setValueAtTime(0.0001, t0);
  ganho.gain.exponentialRampToValueAtTime(volume || 0.06, t0 + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(ganho);
  ganho.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function somTick(pos) { tom(360 + pos * 90, 0.035, "square", 0.02); }
function somClique() { tom(1250, 0.03, "square", 0.028); }
function somHover() { tom(700, 0.025, "sine", 0.018); }

function somAcerto() {
  const base = 700 + Math.min(jogo.combo, 6) * 70;
  tom(base, 0.09, "triangle", 0.07);
  tom(base * 1.5, 0.16, "triangle", 0.055, 0.06);
}

function somInstalar() {
  tom(150, 0.12, "sine", 0.06);
  tom(95, 0.18, "triangle", 0.045, 0.03);
}

function somErro() {
  tomVar(190, 65, 0.3, "sawtooth", 0.055);
  tomVar(95, 45, 0.32, "square", 0.03, 0.02);
}

function somDica() { tomVar(420, 1100, 0.32, "sine", 0.05); }
function somInicio() { tomVar(200, 900, 0.45, "sine", 0.055); }
function somAlerta() {
  tom(900, 0.05, "square", 0.04);
  tom(900, 0.05, "square", 0.04, 0.13);
}

function somNivel() {
  [523, 659, 784, 1047].forEach(function (f, i) {
    tom(f, 0.15, "triangle", 0.055, i * 0.08);
  });
}

function somVitoria() {
  [523, 659, 784, 1047, 1319].forEach(function (f, i) {
    tom(f, 0.28, "triangle", 0.065, i * 0.12);
  });
}

function somFim() {
  [392, 330, 262, 196].forEach(function (f, i) {
    tom(f, 0.24, "sawtooth", 0.05, i * 0.13);
  });
  tomVar(130, 40, 0.9, "sine", 0.045, 0.12);
}

function iniciarAmbiente() {
  const a = obterAudio();
  if (!a) return;
  if (!padGain) {
    padGain = a.createGain();
    padGain.gain.value = 0;
    const filtro = a.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 520;
    const p1 = a.createOscillator();
    p1.type = "sine";
    p1.frequency.value = 55;
    const p2 = a.createOscillator();
    p2.type = "triangle";
    p2.frequency.value = 82.5;
    p1.connect(filtro);
    p2.connect(filtro);
    filtro.connect(padGain);
    padGain.connect(a.destination);
    p1.start();
    p2.start();
  }
  padGain.gain.setTargetAtTime(jogo.som ? 0.022 : 0, a.currentTime, 0.3);
}

function pararAmbiente() {
  if (!audioCtx || !padGain) return;
  padGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.25);
}

function atualizarBotaoSom() {
  btnSom.textContent = jogo.som ? "SOM: LIGADO" : "SOM: DESLIGADO";
  btnSom.setAttribute("aria-pressed", String(jogo.som));
}

function renderIntegridade() {
  elIntegridade.innerHTML = "";
  for (let i = 0; i < MAX_INTEGRIDADE; i++) {
    const nucleo = document.createElement("span");
    nucleo.className = "nucleo" + (i < jogo.integridade ? " cheio" : "");
    elIntegridade.appendChild(nucleo);
  }
}

function atualizarHUD() {
  elModulos.textContent = jogo.resolvidas + "/" + PALAVRAS.length;
  elPontos.textContent = jogo.pontos;
  elCombo.textContent = "x" + Math.max(1, jogo.combo);
  elRecorde.textContent = jogo.recorde;
  renderIntegridade();
}

function definirStatus(texto, classe) {
  elStatus.textContent = texto;
  elStatus.className = "status-linha" + (classe ? " " + classe : "");
}

function tremerConsole() {
  consoleEl.classList.remove("tremer");
  void consoleEl.offsetWidth;
  consoleEl.classList.add("tremer");
}

function gerarOpcoes(correto) {
  const opcoes = [correto];
  while (opcoes.length < 4) {
    const r = Math.floor(Math.random() * PALAVRAS.length);
    if (opcoes.indexOf(r) === -1) opcoes.push(r);
  }
  return embaralhar(opcoes);
}

function renderModulos() {
  grade.innerHTML = "";
  jogo.opcoes.forEach(function (indicePalavra) {
    const modulo = document.createElement("div");
    modulo.className = "modulo";
    modulo.textContent = PALAVRAS[indicePalavra].resposta;
    grade.appendChild(modulo);
  });
  jogo.corretaPos = jogo.opcoes.indexOf(jogo.atual);
  jogo.scannerPos = Math.floor(Math.random() * grade.children.length);
  grade.children[jogo.scannerPos].classList.add("scanner");
}

function pararScanner() {
  if (jogo.scannerTimer) {
    clearInterval(jogo.scannerTimer);
    jogo.scannerTimer = null;
  }
}

function iniciarScanner() {
  pararScanner();
  const intervalo = Math.max(260, 760 - (jogo.nivel - 1) * 90);
  jogo.scannerTimer = setInterval(avancarScanner, intervalo);
}

function avancarScanner() {
  if (!jogo.ativo || jogo.bloqueado) return;
  const modulos = grade.children;
  if (!modulos.length) return;
  modulos[jogo.scannerPos].classList.remove("scanner");
  jogo.scannerPos = (jogo.scannerPos + 1) % modulos.length;
  modulos[jogo.scannerPos].classList.add("scanner");
  somTick(jogo.scannerPos);
}

function mostrarGanho(elemento, texto) {
  const span = document.createElement("span");
  span.className = "ganho";
  span.textContent = texto;
  elemento.appendChild(span);
  setTimeout(function () {
    if (span.parentNode) span.parentNode.removeChild(span);
  }, 950);
}

function carregarRodada() {
  if (!jogo.ativo) return;

  if (jogo.fila.length === 0) {
    vitoria();
    return;
  }

  const nivelAnterior = jogo.nivel;
  jogo.nivel = Math.floor(jogo.resolvidas / MODULOS_POR_NIVEL) + 1;
  const subiuNivel = jogo.nivel > nivelAnterior;

  if (subiuNivel) {
    jogo.integridade = Math.min(MAX_INTEGRIDADE, jogo.integridade + 1);
    somNivel();
  }

  jogo.atual = jogo.fila.shift();
  jogo.opcoes = gerarOpcoes(jogo.atual);
  jogo.dicaUsada = false;
  jogo.bloqueado = false;

  const palavra = PALAVRAS[jogo.atual];
  elPista.textContent = palavra.pista;
  elTamanho.textContent = "(" + palavra.resposta.length + " letras)";
  elNumSinal.textContent = jogo.resolvidas + 1;

  renderModulos();
  atualizarHUD();

  btnSelecionar.disabled = false;
  btnDica.disabled = false;

  if (subiuNivel) {
    definirStatus("NÍVEL " + jogo.nivel + " — SCANNER ACELERADO", "destaque");
  } else {
    definirStatus("SELECIONE O TERMO CORRETO", "");
  }

  iniciarRodadaTimer();
  iniciarScanner();
}

function selecionar() {
  if (!jogo.ativo || jogo.bloqueado) return;

  jogo.bloqueado = true;
  pararScanner();
  pausarRodadaTimer();
  somClique();

  const modulos = grade.children;
  const escolhido = modulos[jogo.scannerPos];
  const acertou = jogo.scannerPos === jogo.corretaPos;

  if (acertou) {
    jogo.combo++;
    const multiplicador = Math.min(1 + jogo.combo * 0.2, 5);
    const ganho = Math.round(100 * multiplicador);
    jogo.pontos += ganho;
    jogo.resolvidas++;

    escolhido.classList.remove("scanner");
    escolhido.classList.add("certa");
    mostrarGanho(escolhido, "+" + ganho);

    somAcerto();
    somInstalar();
    definirStatus("MÓDULO RESTAURADO", "ok");
    atualizarHUD();

    btnSelecionar.disabled = true;
    btnDica.disabled = true;

    setTimeout(function () {
      if (jogo.ativo) carregarRodada();
    }, 720);
  } else {
    jogo.combo = 0;
    jogo.integridade--;

    escolhido.classList.add("errada");
    somErro();
    tremerConsole();
    atualizarHUD();

    if (jogo.integridade <= 0) {
      fimDeJogo();
      return;
    }

    definirStatus("RUÍDO — INTEGRIDADE -1", "ruim");

    setTimeout(function () {
      if (!jogo.ativo) return;
      escolhido.classList.remove("errada");
      jogo.bloqueado = false;
      retomarRodadaTimer();
      iniciarScanner();
    }, 560);
  }
}

function usarDica() {
  if (!jogo.ativo || jogo.bloqueado || jogo.dicaUsada) return;

  jogo.dicaUsada = true;
  jogo.pontos = Math.max(0, jogo.pontos - CUSTO_DICA);

  const alvo = grade.children[jogo.corretaPos];
  if (alvo) {
    alvo.classList.add("revelado");
    setTimeout(function () { alvo.classList.remove("revelado"); }, 1600);
  }

  somDica();
  atualizarHUD();
  btnDica.disabled = true;
  definirStatus("DICA REVELADA (-" + CUSTO_DICA + ")", "destaque");
}

function iniciarTempo() {
  pararTempo();
  elTempo.textContent = "00:00";
  jogo.tempoTimer = setInterval(function () {
    elTempo.textContent = formatarTempo(Date.now() - jogo.inicio);
  }, 250);
}

function pararTempo() {
  if (jogo.tempoTimer) {
    clearInterval(jogo.tempoTimer);
    jogo.tempoTimer = null;
  }
}

function iniciarRodadaTimer() {
  pararRodadaTimer();
  jogo.alertaTocado = false;
  rodadaDuracao = Math.max(3200, 7000 - (jogo.nivel - 1) * 1100);
  rodadaRestante = rodadaDuracao;
  rodadaFim = Date.now() + rodadaDuracao;
  elBarra.style.width = "100%";
  elBarra.classList.remove("baixa");
  rodadaTimer = setInterval(atualizarRodadaTimer, 80);
}

function atualizarRodadaTimer() {
  if (!jogo.ativo) { pararRodadaTimer(); return; }
  const restante = Math.max(0, rodadaFim - Date.now());
  const pct = (restante / rodadaDuracao) * 100;
  elBarra.style.width = pct + "%";

  if (pct < 28) elBarra.classList.add("baixa");
  else elBarra.classList.remove("baixa");

  if (!jogo.alertaTocado && restante <= 2200 && restante > 0) {
    jogo.alertaTocado = true;
    somAlerta();
  }

  if (restante <= 0 && !jogo.bloqueado) tempoEsgotado();
}

function pausarRodadaTimer() {
  if (rodadaTimer) {
    clearInterval(rodadaTimer);
    rodadaTimer = null;
  }
  rodadaRestante = Math.max(0, rodadaFim - Date.now());
}

function retomarRodadaTimer() {
  if (!jogo.ativo) return;
  rodadaRestante = Math.max(rodadaRestante, 900);
  rodadaFim = Date.now() + rodadaRestante;
  rodadaTimer = setInterval(atualizarRodadaTimer, 80);
}

function pararRodadaTimer() {
  if (rodadaTimer) {
    clearInterval(rodadaTimer);
    rodadaTimer = null;
  }
  elBarra.style.width = "0%";
  elBarra.classList.remove("baixa");
}

function tempoEsgotado() {
  pararRodadaTimer();
  pararScanner();
  jogo.bloqueado = true;
  jogo.combo = 0;
  jogo.integridade--;

  somErro();
  tremerConsole();
  atualizarHUD();

  if (jogo.integridade <= 0) {
    fimDeJogo();
    return;
  }

  definirStatus("TEMPO ESGOTADO — SINAL PERDIDO", "ruim");
  jogo.fila.push(jogo.atual);

  setTimeout(function () {
    if (jogo.ativo) carregarRodada();
  }, 760);
}

function iniciarJogo() {
  if (jogo.ativo) return;

  jogo.ativo = true;
  jogo.pontos = 0;
  jogo.combo = 0;
  jogo.integridade = INTEGRIDADE_INICIAL;
  jogo.nivel = 1;
  jogo.resolvidas = 0;
  jogo.fila = embaralhar(PALAVRAS.map(function (_, i) { return i; }));
  jogo.atual = null;
  jogo.opcoes = [];
  jogo.bloqueado = false;
  jogo.dicaUsada = false;
  jogo.novoRecorde = false;
  jogo.inicio = Date.now();

  overlay.classList.remove("visivel");
  pararConfetti();
  iniciarAmbiente();
  somInicio();
  iniciarTempo();

  carregarRodada();
  atualizarHUD();

  btnSelecionar.focus();
}

function vitoria() {
  if (!jogo.ativo) return;
  jogo.pontos += BONUS_VITORIA;
  finalizar(true);
}

function fimDeJogo() {
  if (!jogo.ativo) return;
  finalizar(false);
}

function finalizar(venceu) {
  jogo.ativo = false;
  pararScanner();
  pararTempo();
  pararAmbiente();

  btnSelecionar.disabled = true;
  btnDica.disabled = true;

  const tempoMs = Date.now() - jogo.inicio;
  elTempo.textContent = formatarTempo(tempoMs);

  if (jogo.pontos > jogo.recorde) {
    jogo.recorde = jogo.pontos;
    jogo.novoRecorde = true;
    salvarNum(CHAVE_RECORDE, jogo.recorde);
  } else {
    jogo.novoRecorde = false;
  }

  atualizarHUD();

  if (venceu) {
    somVitoria();
    dispararConfetti();
    definirStatus("NÚCLEO RESTAURADO", "ok");
    mostrarOverlay(
      "NÚCLEO RESTAURADO",
      "Você decodificou os 16 módulos em " + formatarTempo(tempoMs) + "." + (jogo.novoRecorde ? " Novo recorde!" : ""),
      [["Pontos", jogo.pontos], ["Tempo", formatarTempo(tempoMs)], ["Recorde", jogo.recorde]],
      "JOGAR NOVAMENTE"
    );
  } else {
    somFim();
    definirStatus("COLAPSO DO NÚCLEO", "ruim");
    mostrarOverlay(
      "COLAPSO DO NÚCLEO",
      "Você restaurou " + jogo.resolvidas + " de 16 módulos." + (jogo.novoRecorde ? " Novo recorde!" : " Tente novamente!"),
      [["Módulos", jogo.resolvidas + "/16"], ["Pontos", jogo.pontos], ["Recorde", jogo.recorde]],
      "TENTAR NOVAMENTE"
    );
  }
}

function mostrarOverlay(titulo, texto, stats, rotuloBotao) {
  overlayTitulo.textContent = titulo;
  overlayTexto.textContent = texto;
  overlayStats.innerHTML = stats.map(function (par) {
    return '<div class="ov-stat"><span>' + par[0] + "</span><strong>" + par[1] + "</strong></div>";
  }).join("");
  btnIniciar.textContent = rotuloBotao;
  overlay.classList.add("visivel");
  btnIniciar.focus();
}

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const CORES_CONFETTI = ["#3dffb0", "#26e0ff", "#ffd166", "#ff3d8b", "#a78bfa"];

function dispararConfetti() {
  ajustarCanvas();
  particulas = [];
  for (let i = 0; i < 170; i++) {
    particulas.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6,
      y: canvas.height * 0.3 + (Math.random() - 0.5) * 90,
      vx: (Math.random() - 0.5) * 11,
      vy: Math.random() * -10 - 3,
      tam: Math.random() * 8 + 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      cor: CORES_CONFETTI[Math.floor(Math.random() * CORES_CONFETTI.length)],
      vida: 1
    });
  }
  cancelAnimationFrame(animacaoConfetti);
  animarConfetti();
}

function animarConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let ativos = 0;

  for (let i = 0; i < particulas.length; i++) {
    const p = particulas[i];
    p.vy += 0.28;
    p.vx *= 0.995;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > canvas.height + 30) p.vida = 0;

    if (p.vida > 0) {
      ativos++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.cor;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      ctx.restore();
    }
  }

  if (ativos > 0) {
    animacaoConfetti = requestAnimationFrame(animarConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function pararConfetti() {
  cancelAnimationFrame(animacaoConfetti);
  particulas = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

btnSelecionar.addEventListener("click", selecionar);
btnDica.addEventListener("click", usarDica);
btnIniciar.addEventListener("click", iniciarJogo);

window.addEventListener("keydown", function (e) {
  if (e.repeat) return;
  if (e.code === "Space" || e.code === "Enter") {
    if (jogo.ativo) {
      e.preventDefault();
      selecionar();
    }
  }
});

btnSom.addEventListener("click", function () {
  jogo.som = !jogo.som;
  salvarNum(CHAVE_SOM, jogo.som ? 1 : 0);
  atualizarBotaoSom();
  if (jogo.som) {
    obterAudio();
    tom(880, 0.08, "triangle", 0.05);
    if (jogo.ativo) iniciarAmbiente();
  } else {
    pararAmbiente();
  }
});

[btnSelecionar, btnDica, btnIniciar, btnSom].forEach(function (botao) {
  botao.addEventListener("mouseenter", somHover);
});

window.addEventListener("resize", ajustarCanvas);

atualizarBotaoSom();
atualizarHUD();
ajustarCanvas();
mostrarOverlay(
  "NÚCLEO ZERO",
  "Uma pista aparece no terminal e quatro módulos disputam a resposta. Um scanner salta entre eles: pressione SELECIONAR (ou Espaço) quando ele estiver no termo correto. Cada erro custa integridade.",
  [["Recorde", jogo.recorde]],
  "INICIAR TRANSMISSÃO"
);
