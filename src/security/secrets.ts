export function assertNoSecretsIn(text: string): void {
  if (/sk-[a-zA-Z0-9]{10,}/.test(text) || /ghp_/.test(text)) {
    throw new Error("Refusing to emit a value that looks like a secret.");
  }
}
