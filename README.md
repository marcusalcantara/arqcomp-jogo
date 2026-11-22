# Desafio de Arquitetura Computacional

Jogo de navegador para treinar os termos da disciplina **Tópicos de Arquitetura Computacional**.
Leia a pista, descubra o termo e digite as letras direto nas casas do tabuleiro.

## Como jogar
1. Leia a pista de cada linha (o número de letras aparece ao final).
2. Digite a resposta nas casas (maiúsculas, minúsculas e acentos são aceitos).
3. Ao completar uma linha ela é conferida na hora: verde = certa, vermelho = tente de novo.
4. Clique em **Conferir** para revisar todas as linhas de uma vez.
5. Use **Dica** para revelar uma letra da linha em foco (custa 10 pontos).
6. Acertos em sequência aumentam o **combo** e valem mais pontos. O **tempo** corre desde a primeira tecla e o **recorde** fica salvo no navegador.
7. Ao acertar tudo você ganha um bônus e uma chuva de confetes. Clique em **Reiniciar** para uma nova rodada embaralhada.

## Tecnologias
HTML, CSS e JavaScript puros, sem bibliotecas.

## Estrutura
- `index.html`: página principal
- `style.css`: estilos
- `script.js`: palavras, pistas e lógica do jogo
