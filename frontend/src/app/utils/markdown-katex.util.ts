import katex from 'katex';

/**
 * Utilitário para conversão segura e formatada de Markdown + LaTeX (KaTeX) em HTML.
 * Preserva fórmulas matemáticas protegendo-as antes de qualquer parsing de texto,
 * e sanitiza atributos e tags HTML para evitar vulnerabilidades XSS.
 */

interface MathToken {
  id: string;
  math: string;
  displayMode: boolean;
}

interface CodeToken {
  id: string;
  html: string;
}

export interface RenderMarkdownKatexOptions {
  removePagebreaks?: boolean;
  inline?: boolean;
}

/**
 * Converte uma string de Markdown enriquecida com fórmulas LaTeX para HTML formatado.
 */
export function renderMarkdownKatex(content: string, options?: RenderMarkdownKatexOptions): string {
  if (content == null || !String(content).trim()) {
    return '';
  }

  let processed = String(content);
  const codeTokens: CodeToken[] = [];
  let codeCounter = 0;

  // 1. Proteger blocos de código multilinhas (```lang ... ```)
  // Tokens não contêm underscores ou asteriscos para não colidirem com sintaxe Markdown
  processed = processed.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = `KATEXCODEBLOCKTOKEN${codeCounter++}ENDK`;
    const escaped = escapeHtml(code.trim());
    const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    codeTokens.push({
      id,
      html: `<pre class="doc-code-block"><code${langAttr}>${escaped}</code></pre>`
    });
    return `\n\n${id}\n\n`;
  });

  // 2. Proteger código inline (`...`)
  processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
    const id = `KATEXINLINECODETOKEN${codeCounter++}ENDK`;
    codeTokens.push({
      id,
      html: `<code class="doc-inline-code">${escapeHtml(code)}</code>`
    });
    return id;
  });

  const mathTokens: MathToken[] = [];
  let tokenCounter = 0;

  // 3. Fórmulas em bloco: $$...$$ e \[...\]
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const id = `KATEXBLOCKTOKEN${tokenCounter++}ENDK`;
    mathTokens.push({ id, math: math.trim(), displayMode: true });
    return `\n\n${id}\n\n`;
  });

  processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
    const id = `KATEXBLOCKTOKEN${tokenCounter++}ENDK`;
    mathTokens.push({ id, math: math.trim(), displayMode: true });
    return `\n\n${id}\n\n`;
  });

  // 4. Fórmulas inline: $...$ e \(...\)
  // Utiliza lookbehind negativo para ignorar \$ (cifrão monetário escapado)
  processed = processed.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, math) => {
    const id = `KATEXINLINETOKEN${tokenCounter++}ENDK`;
    mathTokens.push({ id, math: math.trim(), displayMode: false });
    return id;
  });

  processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    const id = `KATEXINLINETOKEN${tokenCounter++}ENDK`;
    mathTokens.push({ id, math: math.trim(), displayMode: false });
    return id;
  });

  // 5. Tratar quebras de página (<!-- pagebreak -->) se for renderização contínua
  if (options?.removePagebreaks) {
    processed = processed.replace(/<!--\s*pagebreak\s*-->/gi, '');
  } else {
    processed = processed.replace(
      /<!--\s*pagebreak\s*-->/gi,
      '\n\n<div class="doc-pagebreak-divider"><span class="doc-pagebreak-label">Quebra de Pagina</span></div>\n\n'
    );
  }

  // 6. Processar Markdown
  let html = options?.inline ? parseInline(processed) : parseMarkdown(processed);

  // 7. Restaurar blocos e elementos de código
  for (const token of codeTokens) {
    html = html.replaceAll(token.id, () => token.html);
  }

  // 8. Restaurar os tokens de matemática renderizando via KaTeX
  for (const token of mathTokens) {
    const renderedMath = renderKaTeXSafe(token.math, token.displayMode);
    html = html.replaceAll(token.id, () => renderedMath);
  }

  // 9. Desfazer escape de \$ para $
  html = html.replace(/\\(\$)/g, '$1');

  return html;
}

/**
 * Parser de Markdown com suporte a figuras, cabeçalhos, listas, citações e ênfase.
 */
function parseMarkdown(md: string): string {
  // Imagens com legenda: ![alt](url)
  md = md.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    const cleanUrl = sanitizeUrl(url.trim());
    const cleanAlt = escapeHtml(alt.trim());
    const captionHtml = cleanAlt ? `<figcaption class="doc-figure-caption">${cleanAlt}</figcaption>` : '';
    return `\n\n<figure class="doc-figure"><img src="${cleanUrl}" alt="${cleanAlt}" loading="lazy" class="doc-figure-img" />${captionHtml}</figure>\n\n`;
  });

  // Links: [texto](url)
  md = md.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    const cleanUrl = sanitizeUrl(url.trim());
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="doc-link">${parseInline(text)}</a>`;
  });

  // Quebrar em blocos de parágrafos
  const blocks = md.split(/\n{2,}/);
  const parsedBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Se for placeholder de código, math block ou divisão de página, mantém sem envelopar em <p>
    if (trimmed.startsWith('KATEXCODEBLOCKTOKEN') && trimmed.endsWith('ENDK')) {
      parsedBlocks.push(trimmed);
      continue;
    }
    if (trimmed.startsWith('KATEXBLOCKTOKEN') && trimmed.endsWith('ENDK')) {
      parsedBlocks.push(trimmed);
      continue;
    }
    if (trimmed.includes('doc-pagebreak-divider') || trimmed.includes('doc-figure')) {
      parsedBlocks.push(trimmed);
      continue;
    }

    // Cabeçalhos: #, ##, ###, ####
    if (trimmed.startsWith('#### ')) {
      parsedBlocks.push(`<h4 class="doc-h4">${parseInline(trimmed.substring(5))}</h4>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      parsedBlocks.push(`<h3 class="doc-h3">${parseInline(trimmed.substring(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      parsedBlocks.push(`<h2 class="doc-h2">${parseInline(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      parsedBlocks.push(`<h1 class="doc-h1">${parseInline(trimmed.substring(2))}</h1>`);
      continue;
    }

    // Citação / Blockquote: > texto
    if (trimmed.startsWith('> ')) {
      const quoteContent = trimmed
        .split('\n')
        .map(line => line.replace(/^>\s?/, ''))
        .join(' ');
      parsedBlocks.push(`<blockquote class="doc-blockquote">${parseInline(quoteContent)}</blockquote>`);
      continue;
    }

    // Listas não-ordenadas (- item ou * item)
    if (/^[\*\-]\s+/.test(trimmed)) {
      const items = trimmed
        .split('\n')
        .filter(l => /^[\*\-]\s+/.test(l.trim()))
        .map(l => `<li class="doc-list-item">${parseInline(l.replace(/^[\*\-]\s+/, ''))}</li>`);
      parsedBlocks.push(`<ul class="doc-list doc-list-unordered">${items.join('')}</ul>`);
      continue;
    }

    // Listas ordenadas (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed
        .split('\n')
        .filter(l => /^\d+\.\s+/.test(l.trim()))
        .map(l => `<li class="doc-list-item">${parseInline(l.replace(/^\d+\.\s+/, ''))}</li>`);
      parsedBlocks.push(`<ol class="doc-list doc-list-ordered">${items.join('')}</ol>`);
      continue;
    }

    // Linha horizontal
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      parsedBlocks.push('<hr class="doc-hr" />');
      continue;
    }

    // Parágrafo padrão com quebra de linha suave
    const paragraphLines = trimmed.split('\n').map(l => parseInline(l));
    parsedBlocks.push(`<p class="doc-p">${paragraphLines.join('<br />')}</p>`);
  }

  return parsedBlocks.join('\n');
}

/**
 * Trata estilizações inline: negrito, itálico e tachado.
 */
function parseInline(text: string): string {
  // Negrito: **texto** ou __texto__
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="doc-strong">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="doc-strong">$1</strong>');

  // Itálico: *texto* ou _texto_
  text = text.replace(/\*([^\*]+?)\*/g, '<em class="doc-em">$1</em>');
  text = text.replace(/_([^_]+?)_/g, '<em class="doc-em">$1</em>');

  // Tachado: ~~texto~~
  text = text.replace(/~~(.*?)~~/g, '<del class="doc-del">$1</del>');

  return text;
}

function renderKaTeXSafe(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, {
      displayMode,
      throwOnError: false
    });
  } catch {
    return escapeHtml(math);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeUrl(url: string): string {
  const normalized = url.trim();
  // Permite caminhos relativos (ex: /api/midia/imagens/...) e protocolos seguros
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('./') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:image/')
  ) {
    return normalized.replace(/[<>"'\s]/g, '');
  }
  return '#';
}
