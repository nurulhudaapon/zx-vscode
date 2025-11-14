import type { ExtensionContext } from "vscode";
// Lazy require vscode so tests that import modules don't need vscode at load time
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vscode = require("vscode");
const { languages, CompletionItem, CompletionItemKind } = vscode;

const COMMON_TAGS = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];

export function registerTagCompletion(context: ExtensionContext) {
  const provider = languages.registerCompletionItemProvider(
    { language: "zx", scheme: "file" },
    {
      provideCompletionItems(document: any, position: any) {
        // Provide tag-name completions when cursor is after a '<' on the same line
        const line = document.lineAt(position.line).text;
        const upto = line.slice(0, position.character);
        const lastLt = upto.lastIndexOf("<");
        if (lastLt === -1) return [];

        // don't trigger inside a closing tag like </
        if (upto[lastLt + 1] === "/") return [];

        const prefix = upto.slice(lastLt + 1);

        const startCol = lastLt + 1;
        const replaceRange = new vscode.Range(
          position.line,
          startCol,
          position.line,
          position.character,
        );

        const items: any[] = [];
        for (const tag of COMMON_TAGS) {
          const item = new CompletionItem(tag, CompletionItemKind.Snippet);
          try {
            item.insertText = new vscode.SnippetString(`${tag}>$0</${tag}>`);
          } catch (err) {
            item.insertText = `${tag}></${tag}>`;
          }
          item.detail = "HTML tag";
          item.range = replaceRange;
          // simple filter: only include tags that start with the typed prefix
          if (!prefix || tag.startsWith(prefix)) items.push(item);
        }
        return items;
      },
    },
    "<",
  );

  context.subscriptions.push(provider);
}

export default registerTagCompletion;
