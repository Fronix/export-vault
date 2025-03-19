import { Plugin, TFile, Notice, TFolder } from "obsidian";

export default class CombineMarkdownPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "combine-markdown-files",
      name: "Combine all markdown files",
      callback: async () => {
        await this.combineMarkdownFiles();
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFolder) {
          menu.addItem((item) => {
            item.setTitle("Export folder to combined markdown")
              .setIcon("document")
              .onClick(async () => {
                await this.exportFolder(file as TFolder);
              });
          });
        }
      })
    );
  }

  async combineMarkdownFiles() {
    const files = this.app.vault.getMarkdownFiles();
    await this.createCombinedFile(files, "combined.md");
    new Notice("Combined markdown files into combined.md");
  }

  async exportFolder(folder: TFolder) {
    const files = this.app.vault.getFiles().filter((file) => file.path.startsWith(folder.path) && file.extension === "md");
    if (files.length === 0) {
      new Notice("No markdown files found in folder");
      return;
    }
    const folderPath = folder.path.replace(/\//g, "_");
    await this.createCombinedFile(files, `exported_${folderPath}.md`);
    new Notice(`Exported markdown files from folder ${folder.name}`);
  }

  async createCombinedFile(files: TFile[], outputPath: string) {
    let combinedContent = "";
    for (const file of files) {
      const content = await this.app.vault.read(file);
      combinedContent += `# ${file.basename}\n\n${content}\n\n`;
    }
    let combinedFile = this.app.vault.getAbstractFileByPath(outputPath);
    if (combinedFile instanceof TFile) {
      await this.app.vault.modify(combinedFile, combinedContent);
    } else {
      await this.app.vault.create(outputPath, combinedContent);
    }
  }
}
