# NÚCLEO FC — Jogo da Memória

Jogo de navegador para estudar arquitetura de computadores em clima de futebol. Dois bonequinhos — **VOCÊ** e **BUG** — comentam a partida enquanto você joga um **jogo da memória** no campo.

Cada um dos **16 termos** tem a sua **pista**. Vire duas cartas por vez e encontre os pares (termo + pista). Cada par certo vale um gol. O conteúdo aparece como cartas, sem quiz de alternativas, e há um **Modo Estudo** com todos os termos e pistas.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página: placar, campo com tabuleiro, bonequinhos, painel, tela inicial/final e modo estudo. |
| `style.css` | Visual neon de estádio, cartas com giro 3D, animações dos bonequinhos, layout responsivo e suporte a `prefers-reduced-motion`. |
| `script.js` | Lógica do jogo da memória, 16 pares, rodadas, timer, som (Web Audio API) e modo estudo. |

## Como jogar

1. Clique em **INICIAR DUELO**.
2. O tabuleiro mostra 8 cartas por rodada: 4 termos e 4 pistas, embaralhados.
3. Vire duas cartas por vez clicando nelas (ou usando `Enter`/`Espaço` com o teclado).
4. Se o termo combinar com a pista, o par fica aberto e você marca um gol. Se não, as cartas se fecham e conta um erro.
5. Encontre os 4 pares da rodada para avançar. São 4 rodadas, totalizando os 16 pares.

### Controles

| Ação | Teclado | Mouse/toque |
|---|---|---|
| Virar carta | `Enter` ou `Espaço` na carta focada | Clique na carta |
| Abrir/fechar modo estudo | `Esc` fecha | Botões **MODO ESTUDO** |
| Ligar/desligar som | n/a | Botão **SOM** |
| Reiniciar partida | n/a | Botão **REINICIAR** |

## Regras e pontuação

- **Objetivo:** encontrar os 16 pares de termo + pista.
- **Acerto:** o par fica revelado, conta um gol e aumenta a sequência.
- **Erro:** as cartas se fecham, a sequência zera e o contador de erros sobe.
- **Rodadas:** 4 rodadas de 4 pares.
- **Resultado:** quanto menos erros, melhor. Até 4 erros = vitória; até 10 = bom jogo; acima disso = treine mais.
- **Recorde:** a menor quantidade de erros (e o tempo de desempate) fica salva no `localStorage`.
- **Tempo:** o cronômetro total aparece no painel, mas não limita a partida.

## Modo Estudo

O botão **MODO ESTUDO** abre uma lista com todos os 16 termos, suas pistas e uma busca por palavra. É o material de revisão do conteúdo, disponível antes, durante e depois da partida. No fim do jogo, o botão **REVISAR CONTEÚDO** abre a mesma lista.

## Os 16 termos

| Termo | Pista |
|---|---|
| CPU | Chip que executa as instruções dos programas; é o "cérebro" do computador |
| ULA | Parte da CPU que faz as contas e as operações lógicas |
| UC | Parte da CPU que interpreta as instruções e coordena os demais componentes |
| REGISTRADORES | Pequenas memórias dentro da CPU, as mais rápidas de todas |
| RAM | Memória volátil principal onde ficam programas e dados em uso |
| ROM | Memória não volátil gravada na fabricação |
| EEPROM | Memória não volátil regravável byte a byte |
| FLASH | Memória não volátil regravável que apaga por blocos |
| CACHE | Memória pequena e rápida entre a CPU e a RAM |
| ARMAZENAMENTO | HD/SSD, grande capacidade e não volátil |
| DMA | Periféricos e RAM trocam dados sem passar pela CPU |
| ADDRESSBUS | Linhas de sentido único que indicam a posição de memória |
| DATABUS | Linhas bidirecionais que transportam os valores lidos/escritos |
| MICROCONTROLADOR | Chip único com processador, memória e E/S para tarefas dedicadas |
| DUALCORE | Processador com dois núcleos de execução no mesmo chip |
| QUADCORE | Processador com quatro núcleos no mesmo chip |

## Personalização

- **Termos e pistas:** edite o array `PALAVRAS` no início de `script.js`. Cada item tem `resposta` e `pista`. A quantidade de rodadas se ajusta automaticamente.
- **Pares por rodada:** ajuste a constante `PARES_POR_RODADA`.
- **Falas dos bonequinhos:** edite `FALAS_RIVAL` e `FALAS_VOCE` em `script.js`.
- **Cores:** variáveis CSS em `:root` no `style.css` (`--verde`, `--ciano`, `--magenta`, `--amarelo`).
- **Armazenamento local:** chaves `nucleofc_memoria_erros`, `nucleofc_memoria_tempo` e `nucleofc_som`.

## Observações

- As cartas de pista mostram o texto completo da pista; as de termo mostram o nome do componente.
- Não há cronômetro eliminatório: o tempo é apenas informativo.
- O som usa a Web Audio API e é ativado no primeiro clique.
