import { renderMarkdownKatex } from './markdown-katex.util';

export interface ExportarPdfOptions {
  titulo?: string;
  autor?: string;
  subtitulo?: string;
}

/**
 * Constrói o HTML estruturado para impressão em formato A4,
 * dividindo em seções por quebra de página com cabeçalho técnico fiel ao preview.
 */
export function gerarHtmlPdf(
  conteudoOuPaginas: string | string[],
  options: ExportarPdfOptions = {}
): string {
  let paginas: string[];

  if (Array.isArray(conteudoOuPaginas)) {
    paginas = conteudoOuPaginas.length > 0 ? conteudoOuPaginas : [''];
  } else {
    const raw = String(conteudoOuPaginas || '').trim();
    if (!raw) {
      paginas = [''];
    } else {
      const split = raw.split(/<!--\s*pagebreak\s*-->/gi);
      paginas = split.length > 0 ? split : [''];
    }
  }

  const autor = options.autor?.trim() || 'Autor';
  const titulo = options.titulo?.trim() || 'Resolução Probend';
  const totalPaginas = paginas.length;

  const paginasHtml = paginas.map((paginaTexto, idx) => {
    const conteudoRenderizado = renderMarkdownKatex(paginaTexto, { removePagebreaks: true });
    return `
      <section class="folha-a4-pdf">
        <header class="folha-cabecalho-tecnico">
          <span class="folha-tag-doc">Por: ${escapeHtml(autor)}</span>
          <span class="folha-numero-pagina">Pág. ${idx + 1} / ${totalPaginas}</span>
        </header>
        <div class="folha-corpo-renderizado doc-tema-claro">
          ${conteudoRenderizado}
        </div>
      </section>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(titulo)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css">
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 18mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 1rem;
      line-height: 1.75;
      -webkit-font-smoothing: antialiased;
    }

    .folha-a4-pdf {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 100%;
      min-height: calc(297mm - 30mm);
      page-break-after: always;
      break-after: page;
      padding-bottom: 10mm;
    }

    .folha-a4-pdf:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .folha-cabecalho-tecnico {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .folha-tag-doc {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      text-transform: uppercase;
    }

    .folha-numero-pagina {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #0f172a;
      background-color: #f1f5f9;
      padding: 3px 10px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    .folha-corpo-renderizado {
      flex: 1;
      font-size: 1rem;
      line-height: 1.75;
      color: #1e293b;
      word-break: break-word;
    }

    /* Tipografia e Markdown em fundo claro */
    .doc-h1 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 0.35rem;
      break-after: avoid;
    }

    .doc-h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 0.9rem;
      margin-bottom: 0.4rem;
      break-after: avoid;
    }

    .doc-h3 {
      font-size: 1.05rem;
      font-weight: 600;
      color: #334155;
      margin-top: 0.8rem;
      margin-bottom: 0.35rem;
      break-after: avoid;
    }

    .doc-h4 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #475569;
      margin-top: 0.75rem;
      margin-bottom: 0.3rem;
      break-after: avoid;
    }

    .doc-p {
      margin-bottom: 0.85rem;
      color: #1e293b;
    }

    .doc-strong {
      color: #0f172a;
      font-weight: 700;
    }

    .doc-em {
      color: #1e293b;
    }

    .doc-del {
      color: #64748b;
    }

    .doc-blockquote {
      border-left: 3px solid #cbd5e1;
      background-color: #f8fafc;
      margin: 0.85rem 0;
      padding: 0.4rem 0.85rem;
      color: #334155;
      font-style: italic;
      border-radius: 0 4px 4px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .doc-inline-code {
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.88em;
      border: 1px solid #e2e8f0;
    }

    .doc-code-block {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.85rem 1rem;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.88em;
      color: #0f172a;
      margin: 0.85rem 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .doc-list {
      margin: 0.6rem 0;
      padding-left: 1.5rem;
    }

    .doc-list-item {
      margin-bottom: 0.25rem;
      color: #1e293b;
    }

    .doc-figure {
      margin: 1.25rem auto;
      text-align: center;
      display: block;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .doc-figure-img {
      max-width: 100%;
      max-height: 140mm;
      height: auto;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      display: block;
      margin: 0 auto;
    }

    .doc-figure-caption {
      margin-top: 0.45rem;
      font-size: 0.8rem;
      color: #64748b;
      font-style: italic;
    }

    .doc-hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1.25rem 0;
    }

    .doc-link {
      color: #2563eb;
      text-decoration: underline;
    }

    .katex {
      color: #0f172a;
    }

    .katex-display {
      margin: 1em 0;
      overflow-x: visible;
      overflow-y: visible;
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${paginasHtml}
</body>
</html>`;
}

/**
 * Dispara a impressão/exportação para PDF de uma resolução via iframe isolado,
 * garantindo renderização de fontes KaTeX e imagens antes de abrir a janela.
 */
export function exportarResolucaoPdf(
  conteudoOuPaginas: string | string[],
  options: ExportarPdfOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const html = gerarHtmlPdf(conteudoOuPaginas, options);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        reject(new Error('Não foi possível inicializar o contexto de impressão.'));
        return;
      }

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      const tentarImprimir = () => {
        try {
          const win = iframe.contentWindow;
          if (!win) {
            removerIframe();
            resolve();
            return;
          }

          // Aguarda fontes externas do KaTeX carregarem se a API estiver disponível
          const fontsPromise = (iframeDoc as any).fonts?.ready ?? Promise.resolve();

          // Aguarda imagens presentes no documento
          const imagens = Array.from(iframeDoc.images);
          const imagensPromise = Promise.all(
            imagens.map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise<void>(resImg => {
                img.onload = () => resImg();
                img.onerror = () => resImg();
              });
            })
          );

          Promise.all([fontsPromise, imagensPromise]).then(() => {
            setTimeout(() => {
              try {
                win.focus();
                win.print();
              } catch (e) {
                console.warn('Erro durante win.print():', e);
              } finally {
                // Remove o iframe após a conclusão ou cancelamento do diálogo
                setTimeout(removerIframe, 1000);
                resolve();
              }
            }, 250);
          }).catch(() => {
            win.focus();
            win.print();
            setTimeout(removerIframe, 1000);
            resolve();
          });
        } catch (err) {
          removerIframe();
          reject(err);
        }
      };

      const removerIframe = () => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      // Se o iframe já terminou o load básico
      if (iframeDoc.readyState === 'complete') {
        tentarImprimir();
      } else {
        iframe.onload = () => tentarImprimir();
      }
    } catch (err) {
      reject(err);
    }
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
