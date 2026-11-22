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

const CHAVE_RECORDE = "arqcomp_recorde";
const CHAVE_SOM = "arqcomp_som";
const CUSTO_DICA = 10;
const BONUS_FINAL = 100;

const tabuleiro = document.getElementById("tabuleiro");
const contador = document.getElementById("contador");
const elTempo = document.getElementById("tempo");
const elPontos = document.getElementById("pontos");
const elCombo = document.getElementById("combo");
const elRecorde = document.getElementById("recorde");
const barra = document.getElementById("barra");
const progresso = document.querySelector(".progresso");
const btnDica = document.getElementById("btn-dica");
const btnSom = document.getElementById("btn-som");
const toastEl = document.getElementById("toast");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

const estado = {
  ordem: [],
  acertos: new Set(),
  pontos: 0,
  combo: 0,
  iniciado: false,
  finalizado: false,
  inicio: 0,
  timerId: null,
  som: carregarSom()
};

let audioCtx = null;

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function formatarTempo(ms) {
  const total = Math.floor(ms / 1000);
  const min = String(Math.floor(total / 60)).padStart(2, "0");
  const seg = String(total % 60).padStart(2, "0");
  return min + ":" + seg;
}

function carregarSom() {
  try { return localStorage.getItem(CHAVE_SOM) !== "off"; } catch (e) { return true; }
}

function salvarSom() {
  try { localStorage.setItem(CHAVE_SOM, estado.som ? "on" : "off"); } catch (e) {}
}

function atualizarBotaoSom() {
  btnSom.textContent = estado.som ? "Som: ligado" : "Som: desligado";
  btnSom.setAttribute("aria-pressed", String(estado.som));
}

function tocar(freq, duracao, tipo, volume) {
  if (!estado.som) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();
    osc.type = tipo || "sine";
    osc.frequency.value = freq;
    osc.connect(ganho);
    ganho.connect(audioCtx.destination);
    const agora = audioCtx.currentTime;
    const vol = volume || 0.06;
    ganho.gain.setValueAtTime(vol, agora);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
    osc.start(agora);
    osc.stop(agora + duracao);
  } catch (e) {}
}

function somAcerto() {
  tocar(660, 0.09, "triangle", 0.07);
  setTimeout(function () { tocar(990, 0.14, "triangle", 0.07); }, 90);
}

function somErro() { tocar(180, 0.2, "sawtooth", 0.05); }

function somDica() {
  tocar(520, 0.08, "sine", 0.05);
  setTimeout(function () { tocar(780, 0.12, "sine", 0.05); }, 80);
}

function somVitoria() {
  [523, 659, 784, 1047].forEach(function (f, i) {
    setTimeout(function () { tocar(f, 0.25, "triangle", 0.08); }, i * 140);
  });
}

function mostrarToast(mensagem) {
  toastEl.textContent = mensagem;
  toastEl.classList.add("visivel");
  clearTimeout(mostrarToast.id);
  mostrarToast.id = setTimeout(function () {
    toastEl.classList.remove("visivel");
  }, 2600);
}

function animarPulso(el) {
  el.classList.remove("pulso");
  void el.offsetWidth;
  el.classList.add("pulso");
}

function criarTabuleiro() {
  tabuleiro.innerHTML = "";
  estado.ordem = embaralhar(PALAVRAS.map(function (_, i) { return i; }));

  estado.ordem.forEach(function (indiceOriginal, posicao) {
    const palavra = PALAVRAS[indiceOriginal];

    const linha = document.createElement("div");
    linha.className = "linha";
    linha.dataset.indice = indiceOriginal;

    const pista = document.createElement("p");
    pista.className = "pista";

    const numero = document.createElement("span");
    numero.className = "numero";
    numero.textContent = posicao + 1;

    const texto = document.createElement("span");
    texto.textContent = palavra.pista + " ";

    const tamanho = document.createElement("span");
    tamanho.className = "tamanho";
    tamanho.textContent = "(" + palavra.resposta.length + " letras)";

    pista.append(numero, texto, tamanho);

    const casas = document.createElement("div");
    casas.className = "casas";

    for (let i = 0; i < palavra.resposta.length; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "casa";
      input.autocomplete = "off";
      input.autocapitalize = "characters";
      input.spellcheck = false;
      input.setAttribute("aria-label", "Palavra " + (posicao + 1) + ", letra " + (i + 1));
      casas.appendChild(input);
    }

    linha.append(pista, casas);
    tabuleiro.appendChild(linha);
  });
}

function lerResposta(linha) {
  return Array.from(linha.querySelectorAll(".casa"))
    .map(function (c) { return c.value; })
    .join("");
}

function linhaCheia(linha) {
  return Array.from(linha.querySelectorAll(".casa")).every(function (c) { return c.value !== ""; });
}

function iniciarTimer() {
  if (estado.iniciado || estado.finalizado) return;
  estado.iniciado = true;
  estado.inicio = Date.now();
  estado.timerId = setInterval(function () {
    elTempo.textContent = formatarTempo(Date.now() - estado.inicio);
  }, 200);
}

function pararTimer() {
  clearInterval(estado.timerId);
  estado.timerId = null;
}

function atualizarHUD() {
  const total = PALAVRAS.length;
  const acertos = estado.acertos.size;

  elPontos.textContent = estado.pontos;
  elCombo.textContent = "x" + Math.max(1, estado.combo);
  contador.textContent = acertos + " de " + total + " palavras";

  const pct = (acertos / total) * 100;
  barra.style.width = pct + "%";
  progresso.setAttribute("aria-valuenow", acertos);
}

function registrarAcerto(linha) {
  const indice = Number(linha.dataset.indice);
  if (estado.acertos.has(indice)) return;

  estado.acertos.add(indice);
  estado.combo += 1;
  const multiplicador = Math.min(estado.combo, 5);
  const ganho = 10 * multiplicador;
  estado.pontos += ganho;

  linha.classList.remove("errada");
  linha.classList.add("certa");
  linha.querySelectorAll(".casa").forEach(function (c) {
    c.readOnly = true;
    c.classList.remove("revelada");
  });

  animarPulso(elPontos);
  animarPulso(elCombo);
  somAcerto();

  if (estado.combo > 1) {
    mostrarToast("Combo x" + multiplicador + "! +" + ganho + " pontos");
  }

  atualizarHUD();

  if (estado.acertos.size === PALAVRAS.length) finalizarJogo();
}

function focarProximaCasa() {
  const proxima = Array.from(document.querySelectorAll(".casa")).find(function (c) {
    return !c.readOnly && c.value === "";
  });
  if (proxima) proxima.focus();
}

function validarLinha(linha, automatico) {
  if (estado.acertos.has(Number(linha.dataset.indice))) return true;

  const esperado = PALAVRAS[linha.dataset.indice].resposta;
  const atual = lerResposta(linha);

  if (atual === esperado) {
    registrarAcerto(linha);
    if (automatico) setTimeout(focarProximaCasa, 120);
    return true;
  }

  linha.classList.add("errada");
  const token = (linha._tokenAuto || 0) + 1;
  linha._tokenAuto = token;

  if (!automatico) {
    estado.combo = 0;
    somErro();
    atualizarHUD();
  } else {
    setTimeout(function () {
      if (linha._tokenAuto === token && !estado.acertos.has(Number(linha.dataset.indice))) {
        linha.classList.remove("errada");
      }
    }, 900);
  }
  return false;
}

function conferir() {
  if (estado.finalizado) return;
  iniciarTimer();

  let erros = 0;
  document.querySelectorAll(".linha").forEach(function (linha) {
    if (!estado.acertos.has(Number(linha.dataset.indice))) {
      if (!validarLinha(linha, false)) erros++;
    }
  });

  if (erros > 0) {
    mostrarToast(erros === 1 ? "1 palavra incorreta" : erros + " palavras incorretas");
  }
}

function usarDica() {
  if (estado.finalizado) return;
  iniciarTimer();

  const linhaAtiva = document.activeElement && document.activeElement.closest
    ? document.activeElement.closest(".linha")
    : null;

  let alvo = linhaAtiva && !estado.acertos.has(Number(linhaAtiva.dataset.indice))
    ? linhaAtiva
    : null;

  if (!alvo) {
    alvo = Array.from(document.querySelectorAll(".linha")).find(function (l) {
      if (estado.acertos.has(Number(l.dataset.indice))) return false;
      return Array.from(l.querySelectorAll(".casa")).some(function (c) { return c.value === ""; });
    });
  }

  if (!alvo) {
    mostrarToast("Tudo preenchido! Clique em Conferir.");
    return;
  }

  const esperado = PALAVRAS[alvo.dataset.indice].resposta;
  const casas = Array.from(alvo.querySelectorAll(".casa"));
  const vazia = casas.find(function (c) { return c.value === ""; });

  if (!vazia) {
    mostrarToast("Essa linha já está completa.");
    return;
  }

  const posicao = casas.indexOf(vazia);
  vazia.value = esperado[posicao];
  vazia.classList.add("revelada");

  estado.pontos = Math.max(0, estado.pontos - CUSTO_DICA);
  animarPulso(elPontos);
  atualizarHUD();
  somDica();
  mostrarToast("Letra revelada (-" + CUSTO_DICA + " pontos)");

  const proxima = casas.slice(posicao + 1).find(function (c) { return c.value === ""; });
  if (proxima) {
    proxima.focus();
  } else if (linhaCheia(alvo)) {
    validarLinha(alvo, true);
  }
}

function finalizarJogo() {
  if (estado.finalizado) return;
  estado.finalizado = true;
  pararTimer();

  const tempoFinal = estado.inicio ? Date.now() - estado.inicio : 0;
  elTempo.textContent = formatarTempo(tempoFinal);

  estado.pontos += BONUS_FINAL;
  atualizarHUD();
  animarPulso(elPontos);

  let novoRecorde = false;
  try {
    const anterior = Number(localStorage.getItem(CHAVE_RECORDE) || 0);
    if (!anterior || tempoFinal < anterior) {
      localStorage.setItem(CHAVE_RECORDE, String(tempoFinal));
      novoRecorde = true;
    }
  } catch (e) {}

  atualizarRecorde();
  somVitoria();
  dispararConfetti();

  mostrarToast(
    "Parabéns! +" + BONUS_FINAL + " de bônus" + (novoRecorde ? " e novo recorde!" : "!")
  );
}

function atualizarRecorde() {
  try {
    const ms = Number(localStorage.getItem(CHAVE_RECORDE) || 0);
    elRecorde.textContent = ms ? formatarTempo(ms) : "--:--";
  } catch (e) {
    elRecorde.textContent = "--:--";
  }
}

function reiniciar() {
  pararTimer();
  estado.acertos.clear();
  estado.pontos = 0;
  estado.combo = 0;
  estado.iniciado = false;
  estado.finalizado = false;
  estado.inicio = 0;
  elTempo.textContent = "00:00";
  limparConfetti();
  criarTabuleiro();
  atualizarHUD();
  const primeira = document.querySelector(".casa");
  if (primeira) primeira.focus();
}

tabuleiro.addEventListener("input", function (e) {
  const casa = e.target;
  if (!casa.classList.contains("casa")) return;

  iniciarTimer();

  const letras = normalizar(casa.value);
  casa.value = letras.slice(-1);
  casa.classList.remove("revelada");

  const linha = casa.closest(".linha");
  if (!estado.acertos.has(Number(linha.dataset.indice))) {
    linha.classList.remove("errada");
  }

  if (casa.value && casa.nextElementSibling) {
    casa.nextElementSibling.focus();
  }

  if (linhaCheia(linha)) {
    validarLinha(linha, true);
  }
});

tabuleiro.addEventListener("keydown", function (e) {
  const casa = e.target;
  if (!casa.classList.contains("casa")) return;

  if (e.key === "Backspace" && !casa.value && casa.previousElementSibling) {
    casa.previousElementSibling.focus();
  } else if (e.key === "ArrowLeft" && casa.previousElementSibling) {
    casa.previousElementSibling.focus();
  } else if (e.key === "ArrowRight" && casa.nextElementSibling) {
    casa.nextElementSibling.focus();
  } else if (e.key === "Enter") {
    e.preventDefault();
    conferir();
  }
});

tabuleiro.addEventListener("focusin", function (e) {
  if (e.target.classList.contains("casa") && !e.target.readOnly) e.target.select();
});

document.getElementById("btn-conferir").addEventListener("click", conferir);
document.getElementById("btn-dica").addEventListener("click", usarDica);
document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);

btnSom.addEventListener("click", function () {
  estado.som = !estado.som;
  salvarSom();
  atualizarBotaoSom();
  if (estado.som) somDica();
});

const CORES_CONFETTI = ["#7c5cff", "#22d3ee", "#34d399", "#fbbf24", "#fb7185", "#a78bfa"];
let particulas = [];
let animacaoConfetti = null;

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function dispararConfetti() {
  ajustarCanvas();
  particulas = [];
  const quantidade = 160;
  for (let i = 0; i < quantidade; i++) {
    particulas.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
      y: canvas.height * 0.32 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -9 - 3,
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

  particulas.forEach(function (p) {
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
  });

  if (ativos > 0) {
    animacaoConfetti = requestAnimationFrame(animarConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function limparConfetti() {
  cancelAnimationFrame(animacaoConfetti);
  particulas = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", ajustarCanvas);

atualizarBotaoSom();
atualizarRecorde();
criarTabuleiro();
atualizarHUD();
