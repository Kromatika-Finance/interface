export default function copyToClipboard(textContent: string): void {
  navigator.clipboard.writeText(textContent)
}
