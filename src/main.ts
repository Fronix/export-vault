import { Plugin, TFile, Notice } from "obsidian";

export default class ExportVaultPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "export-vault",
      name: "Export Vault to Combined Markdown",
      callback: async () => {
        await this.exportVault();
      },
    });
  }

  async exportVault() {
    const files = this.app.vault.getMarkdownFiles();
    let combinedContent = "";

    for (const file of files) {
      const content = await this.app.vault.read(file);
      combinedContent += `# ${file.basename}\n\n${content}\n\n`;
    }

    const combinedFilePath = "exported_vault.md";
    let combinedFile = this.app.vault.getAbstractFileByPath(combinedFilePath);

    if (combinedFile instanceof TFile) {
      await this.app.vault.modify(combinedFile, combinedContent);
    } else {
      await this.app.vault.create(combinedFilePath, combinedContent);
    }

    new Notice("Vault exported to exported_vault.md");
  }
}
