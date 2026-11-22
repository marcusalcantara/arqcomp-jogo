# FREQUÊNCIA ZERO

Jogo de reflexo e sintonia em HTML, CSS e JavaScript puros.
Uma agulha varre o mostrador: pare-a dentro da faixa luminosa para decodificar cada canal.

## Como jogar
1. Clique em **INICIAR TRANSMISSÃO** (ou pressione **Espaço**).
2. A agulha gira sem parar. Toque em **SINTONIZAR** / **Espaço** quando ela cruzar a faixa iluminada.
3. O tom ambiente sobe conforme a agulha se aproxima do alvo — use o som para acertar.
4. Acertar no centro da faixa dá **PERFEITO** e mais pontos. Acertos seguidos aumentam o **combo**.
5. Cada erro tira 1 núcleo de integridade. Sem núcleos, o sinal é perdido.
6. A cada 4 canais você sobe de nível: a agulha acelera, a faixa diminui e, mais adiante, o sentido de giro inverte.
7. O **recorde** de pontos fica salvo no navegador.

## Recursos
- Mostrador desenhado em `<canvas>` com agulha, alvos, rastro, partículas e tremor de tela.
- Áudio procedural via Web Audio API: hum guiado por proximidade, acordes de acerto, erro, nível e fim de jogo.
- Botão para ligar/desligar o som (a preferência é salva).
- Funciona com teclado, mouse e toque.

## Tecnologias
HTML, CSS e JavaScript puros, sem bibliotecas.

## Estrutura
- `index.html`: estrutura da tela e overlay de início/fim
- `style.css`: estética neon de osciloscópio
- `script.js`: loop do jogo, desenho no canvas e síntese de áudio
