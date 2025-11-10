import { test, expect } from "bun:test";
import { formatZx } from "../src/fmt";
import { fmtCases } from "./data.test";

// Register virtual document providers
const virtualHtmlDocumentContents = new Map<string, string>();

test("formatZx", async () => {
  for (const { in: inputText, out: expectedText } of fmtCases) {
    const cancellationTokenSource = new CancellationTokenSource();

    const outputText = await formatZx(
      inputText,
      cancellationTokenSource.token,
      "test.zig",
      virtualHtmlDocumentContents,
    );

    console.log({ inputText, outputText });
    expect(outputText).toEqual(expectedText);
  }
});

class CancellationTokenSource {
  token = {
    isCancellationRequested: false,
    onCancellationRequested: (_callback: () => void) => {
      // Mock implementation
    },
  };
  cancel() {
    this.token.isCancellationRequested = true;
  }
  dispose() {}
}
