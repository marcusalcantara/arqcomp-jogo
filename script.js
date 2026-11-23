const PALAVRAS = [
  { resposta: "CPU", pista: "Chip que executa as instruções dos programas; é o \"cérebro\" do computador." },
  { resposta: "ULA", pista: "Parte da CPU que faz as contas e as operações lógicas." },
  { resposta: "UC", pista: "Parte da CPU que interpreta as instruções e coordena o trabalho dos demais componentes." },
  { resposta: "REGISTRADORES", pista: "Pequenas memórias dentro da CPU, as mais rápidas de todas, que guardam os dados em uso imediato." },
  { resposta: "RAM", pista: "Memória volátil principal onde ficam programas e dados em uso; perde tudo ao desligar." },
  { resposta: "ROM", pista: "Memória não volátil gravada na fabricação, cujo conteúdo em geral não é alterado pelo usuário." },
  { resposta: "EEPROM", pista: "Memória não volátil regravável que permite apagar e escrever byte a byte, usada para guardar configurações pequenas." },
  { resposta: "FLASH", pista: "Memória não volátil regravável que apaga por blocos; presente em pendrives e cartões SD." },
  { resposta: "CACHE", pista: "Memória pequena e muito rápida entre a CPU e a RAM que guarda cópias de dados usados com frequência." },
  { resposta: "ARMAZENAMENTO", pista: "Dispositivo de grande capacidade e não volátil, como HD ou SSD, que guarda arquivos e programas de forma permanente." },
  { resposta: "DMA", pista: "Mecanismo que deixa periféricos e a RAM trocarem blocos de dados sem passar pela CPU, liberando-a para outras tarefas." },
  { resposta: "ADDRESSBUS", pista: "Conjunto de linhas, de sentido único, pelo qual a CPU indica a posição de memória que quer acessar." },
  { resposta: "DATABUS", pista: "Conjunto de linhas bidirecional que transporta os valores lidos ou escritos entre CPU, memória e periféricos." },
  { resposta: "MICROCONTROLADOR", pista: "Circuito integrado único com processador, memória e entradas/saídas, feito para tarefas dedicadas em sistemas embarcados." },
  { resposta: "DUALCORE", pista: "Processador com dois núcleos de execução no mesmo chip." },
  { resposta: "QUADCORE", pista: "Processador com quatro núcleos de execução no mesmo chip, capaz de executar tarefas em paralelo." }
];

const CHAVE_RECORDE_ERROS = "nucleozero_memoria_erros";
const CHAVE_RECORDE_TEMPO = "nucleozero_memoria_tempo";
const CHAVE_SOM = "nucleozero_som";
const TOTAL = PALAVRAS.length;
const PARES_POR_RODADA = 4;
const RODADAS = Math.ceil(TOTAL / PARES_POR_RODADA);

const FALAS_RIVAL = {
  provocar: [
    "Aposto que você não lembra de nada!",
    "Vira essa carta, vai!",
    "Estudou mesmo ou vai arriscar?",
    "Essa pista é fácil... pro meu nível.",
    "Cadê essa memória toda?",
    "Vou achar esse par primeiro."
  ],
  falha: [
    "Errou! Esse par é meu!",
    "Valeu pela dica, hein!",
    "Errou feio. A rodada é minha."
  ],
  erro: [
    "Como assim?!",
    "Sorte de principiante...",
    "Não acredito nisso!",
    "Calma, ainda tô aquecendo."
  ]
};

const FALAS_VOCE = {
  acerto: ["Achei o par!", "Memória de aço!", "Na mosca!", "Fácil demais!", "Mais um par!"],
  erro: ["Foi mal...", "Quase!", "Errei o par.", "Foi só um deslize."],
  pronto: ["Bora! Presta atenção.", "Agora é minha vez.", "Tô pronto. Vira as cartas.", "Foco total."]
};

const $ = function (id) { return document.getElementById(id); };
const paresEl = $("pares"), errosEl = $("erros"), rodadaEl = $("rodada"), comboEl = $("combo"), tempoEl = $("tempo");
const falaVoce = $("fala-voce"), falaRival = $("fala-rival");
const tabuleiro = $("tabuleiro"), acertoFlash = $("acerto-flash"), narracaoEl = $("narracao");
const btnEstudo = $("btn-estudo"), btnSom = $("btn-som"), btnReiniciar = $("btn-reiniciar");
const overlay = $("overlay"), overlayTitulo = $("overlay-titulo"), overlayTexto = $("overlay-texto"), overlayStats = $("overlay-stats");
const btnIniciar = $("btn-iniciar"), btnEstudoOverlay = $("btn-estudo-overlay");
const modal = $("modal-estudo"), btnFecharEstudo = $("btn-fechar-estudo"), buscaEl = $("busca-estudo"), estudoLista = $("estudo-lista");

function carregarNumOuNulo(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto === null) return null;
    const valor = Number(bruto);
    return Number.isFinite(valor) ? valor : null;
  } catch (e) { return null; }
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

const jogo = {
  ativo: false,
  bloqueado: false,
  paresPool: [],
  rodadaAtual: 0,
  cartas: [],
  viradas: [],
  paresTotal: 0,
  erros: 0,
  combo: 0,
  inicio: 0,
  tempoTimer: null,
  recordeErros: carregarNumOuNulo(CHAVE_RECORDE_ERROS),
  recordeTempo: carregarNumOuNulo(CHAVE_RECORDE_TEMPO),
  som: carregarSom()
};

let audioCtx = null;
let avancarTimer = null;
let flashTimer = null;

function embaralhar(lista) {
  const c = lista.slice();
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = c[i]; c[i] = c[j]; c[j] = t;
  }
  return c;
}

function escolher(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

function formatarTempo(ms) {
  const total = Math.floor(ms / 1000);
  return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}

/* ---------- Som ---------- */
function obterAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tom(freq, duracao, tipo, volume, atraso, freqFim) {
  if (!jogo.som) return;
  const a = obterAudio();
  if (!a) return;
  const t0 = a.currentTime + (atraso || 0);
  const dur = duracao || 0.12;
  const osc = a.createOscillator();
  const ganho = a.createGain();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (freqFim) osc.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur);
  ganho.gain.setValueAtTime(0.0001, t0);
  ganho.gain.exponentialRampToValueAtTime(volume || 0.06, t0 + 0.012);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(ganho);
  ganho.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function sequencia(freqs, dur, tipo, vol, passo) {
  freqs.forEach(function (f, i) { tom(f, dur, tipo, vol, i * passo); });
}

function somVirar() { tom(540, 0.04, "square", 0.022); }
function somHover() { tom(720, 0.025, "sine", 0.016); }
function somInicio() { sequencia([523, 784], 0.16, "triangle", 0.05, 0.1); }
function somRodada() { sequencia([523, 659, 784], 0.14, "triangle", 0.05, 0.08); }
function somAcerto() { sequencia([523, 659, 784, 1047], 0.18, "triangle", 0.06, 0.08); }
function somErro() {
  tom(320, 0.3, "sawtooth", 0.045, 0, 80);
  tom(150, 0.32, "square", 0.025, 0.02, 55);
}
function somFim() { sequencia([392, 330, 262, 196], 0.24, "sawtooth", 0.05, 0.13); }

/* ---------- Interface ---------- */
function atualizarBotaoSom() {
  btnSom.textContent = jogo.som ? "SOM: LIGADO" : "SOM: DESLIGADO";
  btnSom.setAttribute("aria-pressed", String(jogo.som));
}

function atualizarHUD() {
  paresEl.textContent = jogo.paresTotal + "/" + TOTAL;
  errosEl.textContent = jogo.erros;
  rodadaEl.textContent = "RODADA " + Math.max(1, Math.min(jogo.rodadaAtual, RODADAS)) + "/" + RODADAS;
  comboEl.textContent = "SEQUÊNCIA x" + jogo.combo;
}

function falar(quem, texto) { (quem === "voce" ? falaVoce : falaRival).textContent = texto; }
function narracao(texto) { narracaoEl.textContent = texto; }

function mostrarFlashAcerto() {
  acertoFlash.classList.remove("mostrar");
  void acertoFlash.offsetWidth;
  acertoFlash.classList.add("mostrar");
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(function () { acertoFlash.classList.remove("mostrar"); }, 950);
}

function criarCarta(carta, posicao) {
  const el = document.createElement("div");
  el.className = "carta";
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", "Carta virada para baixo");

  const inner = document.createElement("div");
  inner.className = "carta-inner";

  const verso = document.createElement("div");
  verso.className = "carta-face carta-verso";
  const icone = document.createElement("span");
  icone.className = "verso-icone";
  const marca = document.createElement("span");
  marca.className = "verso-texto";
  marca.textContent = "NÚCLEO ZERO";
  verso.appendChild(icone);
  verso.appendChild(marca);

  const frente = document.createElement("div");
  frente.className = "carta-face carta-frente " + carta.tipo;
  const conteudo = document.createElement(carta.tipo === "termo" ? "strong" : "p");
  conteudo.className = carta.tipo === "termo" ? "carta-termo" : "carta-pista";
  conteudo.textContent = carta.texto;
  frente.appendChild(conteudo);

  inner.appendChild(verso);
  inner.appendChild(frente);
  el.appendChild(inner);

  el.addEventListener("click", function () { virarCarta(posicao); });
  el.addEventListener("keydown", function (e) {
    if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      virarCarta(posicao);
    }
  });
  return el;
}

function renderTabuleiro() {
  tabuleiro.innerHTML = "";
  jogo.cartas.forEach(function (carta, posicao) {
    tabuleiro.appendChild(criarCarta(carta, posicao));
  });
}

/* ---------- Lógica ---------- */
function virarCarta(posicao) {
  if (!jogo.ativo || jogo.bloqueado) return;
  const carta = jogo.cartas[posicao];
  if (!carta || carta.encontrada) return;

  const el = tabuleiro.children[posicao];
  if (!el || el.classList.contains("virada") || el.classList.contains("par")) return;

  el.classList.add("virada");
  el.setAttribute("aria-label", (carta.tipo === "termo" ? "Termo: " : "Pista: ") + carta.texto);
  jogo.viradas.push(posicao);
  somVirar();

  if (jogo.viradas.length === 2) verificarPar();
}

function verificarPar() {
  const posA = jogo.viradas[0];
  const posB = jogo.viradas[1];
  const cartaA = jogo.cartas[posA];
  const cartaB = jogo.cartas[posB];
  const elA = tabuleiro.children[posA];
  const elB = tabuleiro.children[posB];

  if (cartaA.parId === cartaB.parId) {
    cartaA.encontrada = true;
    cartaB.encontrada = true;
    elA.classList.add("par");
    elB.classList.add("par");
    jogo.viradas = [];
    jogo.paresTotal++;
    jogo.combo++;

    falar("voce", escolher(FALAS_VOCE.acerto));
    falar("rival", escolher(FALAS_RIVAL.erro));
    somAcerto();
    mostrarFlashAcerto();
    narracao("Par encontrado: " + PALAVRAS[cartaA.parId].resposta + "!");
    atualizarHUD();

    if (jogo.cartas.every(function (c) { return c.encontrada; })) {
      jogo.bloqueado = true;
      avancarTimer = setTimeout(proximaRodada, 1500);
    }
  } else {
    jogo.bloqueado = true;
    jogo.erros++;
    jogo.combo = 0;
    elA.classList.add("errada");
    elB.classList.add("errada");

    falar("rival", escolher(FALAS_RIVAL.falha));
    falar("voce", escolher(FALAS_VOCE.erro));
    somErro();
    narracao("Não é esse par. Tente de novo.");
    atualizarHUD();

    avancarTimer = setTimeout(function () {
      [elA, elB].forEach(function (el) {
        el.classList.remove("virada", "errada");
        el.setAttribute("aria-label", "Carta virada para baixo");
      });
      jogo.viradas = [];
      jogo.bloqueado = false;
      avancarTimer = null;
    }, 1000);
  }
}

function proximaRodada() {
  avancarTimer = null;
  if (!jogo.ativo) return;

  if (jogo.paresPool.length === 0) {
    finalizarJogo();
    return;
  }

  jogo.rodadaAtual++;
  const lote = jogo.paresPool.splice(0, PARES_POR_RODADA);
  const cartas = [];
  lote.forEach(function (id) {
    cartas.push({ parId: id, tipo: "termo", texto: PALAVRAS[id].resposta, encontrada: false });
    cartas.push({ parId: id, tipo: "pista", texto: PALAVRAS[id].pista, encontrada: false });
  });

  jogo.cartas = embaralhar(cartas);
  jogo.viradas = [];
  jogo.bloqueado = false;
  renderTabuleiro();

  falar("rival", escolher(FALAS_RIVAL.provocar));
  falar("voce", escolher(FALAS_VOCE.pronto));
  narracao("Rodada " + jogo.rodadaAtual + " de " + RODADAS + ". Encontre os " + lote.length + " pares.");
  atualizarHUD();
  somRodada();
}

function iniciarTempo() {
  pararTempo();
  tempoEl.textContent = "00:00";
  jogo.tempoTimer = setInterval(function () {
    tempoEl.textContent = formatarTempo(Date.now() - jogo.inicio);
  }, 250);
}

function pararTempo() {
  if (jogo.tempoTimer) {
    clearInterval(jogo.tempoTimer);
    jogo.tempoTimer = null;
  }
}

function limparTimers() {
  if (avancarTimer) { clearTimeout(avancarTimer); avancarTimer = null; }
  if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
  pararTempo();
}

function iniciarJogo() {
  limparTimers();

  jogo.ativo = true;
  jogo.bloqueado = false;
  jogo.paresPool = embaralhar(PALAVRAS.map(function (_, i) { return i; }));
  jogo.rodadaAtual = 0;
  jogo.cartas = [];
  jogo.viradas = [];
  jogo.paresTotal = 0;
  jogo.erros = 0;
  jogo.combo = 0;
  jogo.inicio = Date.now();

  tabuleiro.innerHTML = "";
  acertoFlash.classList.remove("mostrar");
  esconderOverlay();
  iniciarTempo();
  somInicio();
  proximaRodada();
}

function finalizarJogo() {
  jogo.ativo = false;
  jogo.bloqueado = true;
  limparTimers();
  atualizarHUD();

  const tempoMs = Date.now() - jogo.inicio;
  const novoRecorde = jogo.recordeErros === null || jogo.erros < jogo.recordeErros ||
    (jogo.erros === jogo.recordeErros && (jogo.recordeTempo === null || tempoMs < jogo.recordeTempo));

  if (novoRecorde) {
    jogo.recordeErros = jogo.erros;
    jogo.recordeTempo = tempoMs;
    salvarNum(CHAVE_RECORDE_ERROS, jogo.recordeErros);
    salvarNum(CHAVE_RECORDE_TEMPO, jogo.recordeTempo);
  }

  let titulo;
  if (jogo.erros <= 4) { titulo = "VITÓRIA!"; somAcerto(); }
  else if (jogo.erros <= 10) { titulo = "BOM JOGO"; somFim(); }
  else { titulo = "TREINE MAIS"; somFim(); }

  const texto = "Você encontrou os " + TOTAL + " pares com " + jogo.erros +
    (jogo.erros === 1 ? " erro." : " erros.") + (novoRecorde ? " Novo recorde!" : "");

  mostrarOverlay(titulo, texto, [
    ["Pares", jogo.paresTotal + "/" + TOTAL],
    ["Erros", jogo.erros],
    ["Tempo", formatarTempo(tempoMs)],
    ["Recorde", jogo.recordeErros === null ? "—" : jogo.recordeErros + " erros"]
  ], "JOGAR DE NOVO", "REVISAR CONTEÚDO");
}

/* ---------- Overlay e modo estudo ---------- */
function mostrarOverlay(titulo, texto, stats, rotuloPrincipal, rotuloSecundario) {
  overlayTitulo.textContent = titulo;
  overlayTexto.textContent = texto;
  overlayStats.innerHTML = "";
  stats.forEach(function (par) {
    const caixa = document.createElement("div");
    caixa.className = "ov-stat";
    const rotulo = document.createElement("span");
    rotulo.textContent = par[0];
    const valor = document.createElement("strong");
    valor.textContent = par[1];
    caixa.appendChild(rotulo);
    caixa.appendChild(valor);
    overlayStats.appendChild(caixa);
  });
  btnIniciar.textContent = rotuloPrincipal;
  btnEstudoOverlay.textContent = rotuloSecundario || "MODO ESTUDO";
  overlay.classList.add("visivel");
  btnIniciar.focus();
}

function esconderOverlay() { overlay.classList.remove("visivel"); }

function renderEstudo(filtro) {
  const termo = (filtro || "").trim().toLowerCase();
  estudoLista.innerHTML = "";
  let encontrados = 0;

  PALAVRAS.forEach(function (palavra, indice) {
    if (termo && (palavra.resposta + " " + palavra.pista).toLowerCase().indexOf(termo) === -1) return;
    encontrados++;
    const card = document.createElement("div");
    card.className = "estudo-card";
    const titulo = document.createElement("strong");
    titulo.textContent = (indice + 1) + ". " + palavra.resposta;
    const pista = document.createElement("p");
    pista.textContent = "Pista: " + palavra.pista;
    card.appendChild(titulo);
    card.appendChild(pista);
    estudoLista.appendChild(card);
  });

  if (!encontrados) {
    const vazio = document.createElement("p");
    vazio.className = "estudo-vazio";
    vazio.textContent = "Nenhum termo encontrado.";
    estudoLista.appendChild(vazio);
  }
}

function abrirEstudo() {
  renderEstudo(buscaEl.value);
  modal.classList.add("aberto");
  modal.setAttribute("aria-hidden", "false");
  buscaEl.focus();
}

function fecharEstudo() {
  modal.classList.remove("aberto");
  modal.setAttribute("aria-hidden", "true");
}

/* ---------- Eventos ---------- */
btnIniciar.addEventListener("click", iniciarJogo);
btnEstudoOverlay.addEventListener("click", abrirEstudo);
btnEstudo.addEventListener("click", abrirEstudo);
btnFecharEstudo.addEventListener("click", fecharEstudo);
btnReiniciar.addEventListener("click", iniciarJogo);
buscaEl.addEventListener("input", function () { renderEstudo(buscaEl.value); });
modal.addEventListener("click", function (e) { if (e.target === modal) fecharEstudo(); });

btnSom.addEventListener("click", function () {
  jogo.som = !jogo.som;
  salvarNum(CHAVE_SOM, jogo.som ? 1 : 0);
  atualizarBotaoSom();
  if (jogo.som) tom(880, 0.08, "triangle", 0.05);
});

[btnIniciar, btnEstudoOverlay, btnEstudo, btnSom, btnReiniciar].forEach(function (b) {
  b.addEventListener("mouseenter", somHover);
});

window.addEventListener("keydown", function (e) {
  if (e.code === "Escape") fecharEstudo();
});

/* ---------- Início ---------- */
atualizarBotaoSom();
atualizarHUD();
renderEstudo("");
mostrarOverlay(
  "NÚCLEO ZERO",
  "Um jogo da memória com o conteúdo de arquitetura de computadores: cada termo tem a sua pista. Vire duas cartas por vez e encontre os pares. São " + TOTAL + " pares em " + RODADAS + " rodadas. Use o MODO ESTUDO para revisar.",
  [["Recorde", jogo.recordeErros === null ? "—" : jogo.recordeErros + " erros"], ["Pares", TOTAL]],
  "INICIAR JOGO",
  "ESTUDAR PRIMEIRO"
);