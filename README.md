# Eco — Jogo de memória acessível

**Jogue agora:** [markuseagle39.github.io/Eco-Accessible-Memory-Game](https://markuseagle39.github.io/Eco-Accessible-Memory-Game/)

Eco é um jogo de memória no estilo Simon: escute e observe a sequência, depois repita tocando nos lados esquerdo e direito. A cada rodada, a sequência cresce. O jogo funciona em celulares, tablets e computadores, sem instalar nada.

## Como jogar

1. Abra o [jogo no navegador](https://markuseagle39.github.io/Eco-Accessible-Memory-Game/).
2. Escolha a velocidade da sequência: **Rápido**, **Normal** ou **Demorado**.
3. Ative ou desative **Som** conforme sua preferência. Em aparelhos compatíveis, você também pode controlar a **Vibração**.
4. Toque em **Iniciar jogo** e preste atenção nos sinais.
5. Repita a sequência tocando em **Esquerda** e **Direita** na mesma ordem. A cada acerto, o jogo acrescenta um sinal; ao errar, mostra o nível alcançado.

Os dois lados também acendem com um brilho forte para deixar o sinal visual mais fácil de perceber.

## Adicionar à tela inicial

O Eco é um site instalável (PWA), não precisa ser baixado de uma loja de aplicativos.

- **Android:** abra o link no Chrome, toque no menu ⋮ e escolha **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone/iPad:** abra o link no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

Depois da primeira abertura, o jogo pode continuar disponível sem conexão, desde que o carregamento inicial e o cache tenham terminado.

## Acessibilidade e compatibilidade

- **Som:** tons diferentes identificam cada lado; o jogo também toca sinais de acerto e erro. O áudio é gerado no navegador.
- **Vibração:** usa a vibração do aparelho quando o navegador oferece suporte.
- **iPhone/iPad:** o Safari no iOS não oferece a API de vibração usada por sites. Nesse caso, a opção Vibração fica indisponível; som e sinais visuais continuam funcionando.
- **Teclado e leitores de tela:** controles são botões nativos e podem ser acessados pelo teclado. Rótulos e mensagens de estado dão contexto a leitores de tela.
- **Movimento reduzido:** respeita a preferência de movimento reduzido do sistema.
- **Computador:** o jogo funciona em navegadores modernos; vibração depende do suporte do dispositivo e navegador.

| Lado | Cor | Padrão de vibração | Tom |
|---|---|---|---|
| Esquerda | Vermelho | Um pulso | Grave |
| Direita | Azul | Dois pulsos curtos | Agudo |

## Arquivos do projeto

| Arquivo | Função |
|---|---|
| `index.html` | Conteúdo e estrutura do jogo |
| `style.css` | Layout adaptável, cores e efeitos visuais |
| `script.js` | Rodadas, sons, vibração e controles |
| `manifest.webmanifest` | Informações para instalação como PWA |
| `service-worker.js` | Cache dos arquivos para carregamento posterior e uso offline |
| `icon.svg` | Ícone do app |

O projeto usa HTML, CSS e JavaScript, sem bibliotecas ou frameworks externos.
