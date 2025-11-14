import type { ExtensionContext } from "vscode";
import { shouldAutoCloseTag } from "./autoCloseUtil";

/** Registers the on-type listener that inserts closing tags when appropriate. */
export function registerAutoClose(context: ExtensionContext) {
  // Lazy-require vscode at runtime so importing this module in tests does not
  // require the 'vscode' package to be present.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vscode = require("vscode");
  const { workspace, window, Range, Position } = vscode;

  const disposable = workspace.onDidChangeTextDocument(async (e: any) => {
    try {
      // Single change and single char '>' only
      if (e.contentChanges.length !== 1) return;
      const change = e.contentChanges[0];
      if (change.text !== ">") return;

      // Respect user setting
      const enabled = workspace
        .getConfiguration("zx")
        .get("autoCloseTags", true);
      if (!enabled) return;

      const editor = window.activeTextEditor;
      if (!editor) return;
      if (editor.document.uri.toString() !== e.document.uri.toString()) return;

      // Position after the inserted '>'
      const changePos = change.range.start.translate(0, change.text.length);

      // Get text up to position
      const fullRange = new Range(new Position(0, 0), changePos);
      const textUpTo = editor.document.getText(fullRange);

      const tag = shouldAutoCloseTag(textUpTo);
      if (!tag) return;

      // Ensure there's no immediate closing tag already
      const peekRange = new Range(
        changePos,
        changePos.translate(0, tag.length + 3),
      );
      const peek = editor.document.getText(peekRange);
      if (peek.startsWith(`</${tag}`)) return;

      // Insert closing tag at the cursor position. This will be a single undo step.
      await editor.edit((editBuilder) => {
        editBuilder.insert(changePos, `</${tag}>`);
      });
    } catch (err) {
      console.error("auto-close-tag error", err);
    }
  });

  context.subscriptions.push(disposable);
}

export default registerAutoClose;
