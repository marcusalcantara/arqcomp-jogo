# NÚCLEO ZERO

Jogo de navegador sobre arquitetura de computadores. Uma pista aparece no terminal, quatro módulos disputam a resposta e um scanner salta entre eles. Você precisa travar o scanner no termo correto antes que o tempo acabe.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página: HUD, terminal, grade de módulos, botões, tela inicial/final e canvas do confete. |
| `style.css` | Visual neon escuro, animações, layout responsivo (breakpoint em 520 px) e suporte a `prefers-reduced-motion`. |
| `script.js` | Lógica do jogo, som (Web Audio API), timers, pontuação e confete. |

## Como jogar

1. Clique em **INICIAR TRANSMISSÃO**.
2. Leia a pista no terminal. O número de letras do termo aparece abaixo dela.
3. Quatro módulos mostram as opções de resposta. O scanner percorre os módulos em ciclo.
4. Pressione **SELECIONAR** (ou **Espaço** / **Enter**) quando o scanner estiver no termo correto.
5. Se travar, use **DICA (-10)** para destacar a resposta certa por 1,6 s. Há uma dica por rodada.

### Controles

| Ação | Teclado | Mouse/toque |
|---|---|---|
| Selecionar módulo | `Espaço` ou `Enter` | Botão SELECIONAR |
| Dica | n/a | Botão DICA (-10) |
| Ligar/desligar som | n/a | Botão SOM no canto superior direito |

## Regras

- **Objetivo:** restaurar os 16 módulos (um por termo) antes que a integridade chegue a zero.
- **Integridade:** começa em 3 núcleos e vai até no máximo 5.
- **Erro:** custa 1 de integridade e zera o combo. A mesma pista continua, e o tempo restante é retomado (com pelo menos 0,9 s).
- **Tempo esgotado:** custa 1 de integridade, zera o combo e o termo volta para o fim da fila.
- **Níveis:** o nível sobe a cada 4 módulos restaurados. Cada novo nível dá +1 de integridade (até o máximo), acelera o scanner e reduz o tempo da rodada.
- **Fim de jogo:** vitória ao restaurar os 16 módulos; derrota quando a integridade chega a 0.

### Pontuação

- Acerto: `100 × multiplicador`, em que `multiplicador = min(1 + combo × 0,2; 5)`. O combo já conta o acerto atual, então o primeiro acerto da sequência vale 120.
- Dica: −10 pontos.
- Vitória: +500 de bônus.
- O **recorde** é salvo no `localStorage` do navegador.

### Dificuldade por nível

| Parâmetro | Fórmula | Limite |
|---|---|---|
| Intervalo do scanner | `760 − (nível − 1) × 90` ms | mínimo 260 ms |
| Tempo da rodada | `7000 − (nível − 1) × 1100` ms | mínimo 3200 ms |

## Os 16 termos

| Termo | Assunto |
|---|---|
| CPU | Processador, o "cérebro" do computador |
| ULA | Unidade que faz contas e operações lógicas |
| UC | Unidade de controle, que interpreta instruções |
| REGISTRADORES | Memórias mais rápidas, dentro da CPU |
| RAM | Memória volátil principal |
| ROM | Memória não volátil gravada na fabricação |
| EEPROM | Não volátil, regravável byte a byte |
| FLASH | Não volátil, apaga por blocos (pendrives, cartões SD) |
| CACHE | Memória pequena e rápida entre CPU e RAM |
| ARMAZENAMENTO | HD/SSD, guarda dados de forma permanente |
| DMA | Acesso direto à memória, sem passar pela CPU |
| ADDRESSBUS | Barramento de endereços, sentido único |
| DATABUS | Barramento de dados, bidirecional |
| MICROCONTROLADOR | Chip único com processador, memória e E/S |
| DUALCORE | Processador de dois núcleos |
| QUADCORE | Processador de quatro núcleos |

## Personalização

- **Termos e pistas:** edite o array `PALAVRAS` no início de `script.js`. Cada item tem `resposta` e `pista`. Se mudar a quantidade de termos, ajuste também os textos fixos "16" e "0/16" no `index.html` e em `script.js` (mensagens finais).
- **Balanceamento:** as constantes no topo do `script.js` controlam o jogo: `INTEGRIDADE_INICIAL`, `MAX_INTEGRIDADE`, `MODULOS_POR_NIVEL`, `BONUS_VITORIA` e `CUSTO_DICA`.
- **Cores:** variáveis CSS em `:root` no `style.css` (`--verde`, `--ciano`, `--magenta`, `--amarelo`).
- **Armazenamento local:** chaves `nucleozero_recorde` e `nucleozero_som`.

## Limitações conhecidas da versão original

- Os módulos errados são sorteados entre todos os 16 termos, sem considerar a categoria.
- Depois de um erro, a mesma pista continua e a resposta certa não é revelada.
- Não há pausa, e o jogo continua correndo se você trocar de aba.
- O resumo final não lista os termos que você errou.
