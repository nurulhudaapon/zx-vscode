import * as vscode from "vscode";
import * as ts from "typescript";

export function registerHover(
  context: vscode.ExtensionContext,
  languageId = "zx",
) {
  let proxyActive = false;

  const provider: vscode.HoverProvider = {
    provideHover(doc, pos) {
      const text = doc.getText();
      const offset = doc.offsetAt(pos);

      // skip if inside an HTML tag
      const lastOpen = text.lastIndexOf("<", Math.max(0, offset - 1));
      const lastClose = text.lastIndexOf(">", Math.max(0, offset - 1));
      if (lastOpen > lastClose) return;

      const wordRange = doc.getWordRangeAtPosition(pos, /[$A-Za-z_]\w*/);
      if (!wordRange) return;
      const ident = doc.getText(wordRange);

      // 1) iterator pattern: look for `|name|` inside a nearby `for` expression
      const nearby = text.slice(
        Math.max(0, offset - 400),
        Math.min(text.length, offset + 100),
      );
      const iterMatch = nearby.match(new RegExp("\\|\\s*" + ident + "\\s*\\|"));
      if (iterMatch) {
        const md = new vscode.MarkdownString();
        md.appendCodeblock(`(parameter) ${ident}`, "txt");
        return new vscode.Hover(md, wordRange);
      }

      // 2) const/var declaration search (search backwards then forwards)
      const declRe = new RegExp(
        "\\b(?:const|var)\\s+" + ident + "\\b[^;\\n]*",
        "i",
      );
      const before = text.slice(0, offset);
      const mBefore = declRe.exec(before);
      if (mBefore) {
        const decl = mBefore[0].trim();
        const md = new vscode.MarkdownString();
        md.appendCodeblock(decl, "zig");
        return new vscode.Hover(md, wordRange);
      }
      const after = text.slice(offset);
      const mAfter = declRe.exec(after);
      if (mAfter) {
        const decl = mAfter[0].trim();
        const md = new vscode.MarkdownString();
        md.appendCodeblock(decl, "zig");
        return new vscode.Hover(md, wordRange);
      }

      return undefined;
    },
  };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider({ language: languageId }, provider),
  );
}
