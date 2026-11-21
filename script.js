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
  { resposta: "MEMORIADEMASSA",
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

const tabuleiro = document.getElementById("tabuleiro");
const contador = document.getElementById("contador");

function criarTabuleiro() {
  tabuleiro.innerHTML = "";

  PALAVRAS.forEach(function (palavra, indice) {
    const linha = document.createElement("div");
    linha.className = "linha";
    linha.dataset.indice = indice;

    const pista = document.createElement("p");
    pista.className = "pista";

    const numero = document.createElement("span");
    numero.className = "numero";
    numero.textContent = (indice + 1) + ".";

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
      input.setAttribute("aria-label", "Palavra " + (indice + 1) + ", letra " + (i + 1));
      casas.appendChild(input);
    }

    linha.append(pista, casas);
    tabuleiro.appendChild(linha);
  });

  atualizarContador(null);
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function limparEstado(linha) {
  linha.classList.remove("certa", "errada");
}

tabuleiro.addEventListener("input", function (e) {
  const casa = e.target;
  if (!casa.classList.contains("casa")) return;

  const letras = normalizar(casa.value);
  casa.value = letras.slice(-1);
  limparEstado(casa.closest(".linha"));

  if (casa.value && casa.nextElementSibling) {
    casa.nextElementSibling.focus();
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
    conferir();
  }
});

tabuleiro.addEventListener("focusin", function (e) {
  if (e.target.classList.contains("casa")) e.target.select();
});

function lerResposta(linha) {
  return Array.from(linha.querySelectorAll(".casa"))
    .map(function (c) { return c.value; })
    .join("");
}

function conferir() {
  let acertos = 0;

  document.querySelectorAll(".linha").forEach(function (linha) {
    const esperado = PALAVRAS[linha.dataset.indice].resposta;
    limparEstado(linha);

    if (lerResposta(linha) === esperado) {
      linha.classList.add("certa");
      acertos++;
    } else {
      linha.classList.add("errada");
    }
  });

  atualizarContador(acertos);
}

function atualizarContador(acertos) {
  const total = PALAVRAS.length;
  if (acertos === null) {
    contador.textContent = "0 de " + total + " palavras";
    return;
  }
  contador.textContent = acertos + " de " + total + " palavras";
  if (acertos === total) {
    contador.textContent += " - Parabéns!";
  }
}

function reiniciar() {
  document.querySelectorAll(".casa").forEach(function (c) { c.value = ""; });
  document.querySelectorAll(".linha").forEach(limparEstado);
  atualizarContador(null);
  const primeira = document.querySelector(".casa");
  if (primeira) primeira.focus();
}

document.getElementById("btn-conferir").addEventListener("click", conferir);
document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);

criarTabuleiro();
