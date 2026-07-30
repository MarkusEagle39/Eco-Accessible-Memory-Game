# Eco — Jogo de Memória Acessível

Jogo no estilo Simon/Genius, feito para pessoas com deficiência visual. Em vez de depender de cores, o jogo usa **vibração** e **som** como principais canais de feedback — a cor fica como reforço extra pra quem tem baixa visão.

## Como jogar

1. Abra `index.html` no navegador (funciona melhor num celular Android, veja o aviso sobre iOS abaixo).
2. Toque em **Iniciar jogo**.
3. Preste atenção na sequência: cada vez que um lado "acende", ele também vibra e emite um som.
4. Repita a sequência tocando nos lados na mesma ordem.
5. A cada acerto, entra mais um item na sequência. Errou, o jogo acaba e mostra o nível alcançado.

## Os dois lados

| Lado | Cor | Vibração | Som |
|---|---|---|---|
| Esquerda | Vermelho | Pulso único (uma vibração) | Tom grave |
| Direita | Azul | Pulso duplo (duas vibrações curtas) | Tom agudo |

## Estrutura dos arquivos

```
eco/
├── index.html   → estrutura da página (HTML)
├── style.css    → aparência e animações (CSS)
├── script.js    → lógica do jogo (JavaScript)
└── README.md    → este arquivo
```

Os três arquivos de código estão comentados por dentro, bloco por bloco, explicando o motivo de cada decisão — bom pra estudar ou adaptar depois.

## Recursos de acessibilidade

- **Vibração**: `navigator.vibrate()` com padrões diferentes por lado.
- **Som**: gerado na hora com a Web Audio API (sem arquivos de áudio externos), com tons distintos por lado e sons próprios de acerto/erro.
- **Leitor de tela**: os botões têm `aria-label` descritivo, são navegáveis por teclado (Tab + Enter/Espaço), e uma região `aria-live="assertive"` anuncia "Sua vez", "Certo" e "Errou" automaticamente, sem precisar de foco.
- **`prefers-reduced-motion`**: quem tem essa preferência ativada no aparelho não vê a animação do anel pulsante (a vibração e o som continuam normalmente).
- **Toggles de Som e Vibração**: no topo da tela, para quem quiser jogar só com um dos dois estímulos.

## Limitação conhecida: vibração no iPhone

A Vibration API **não é suportada no Safari/iOS** — é uma decisão da própria Apple, não tem contorno via código. Nesses aparelhos, o jogo detecta a ausência da API automaticamente, mostra um aviso na tela e passa a depender de som e cor.

## Possíveis próximos passos

- Salvar o recorde (nível mais alto) usando `localStorage`.
- Padrões de vibração diferentes por nível de dificuldade.
- Modo com três ou quatro lados, para uma versão mais avançada.
