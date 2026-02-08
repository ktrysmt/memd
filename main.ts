import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { renderMermaidAscii } from 'beautiful-mermaid';
import * as fs from 'fs';
import * as path from 'path';

// コマンドライン引数からファイルパスを取得
function getFilePathFromArgs(): string | null {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return null;
  }
  return args[0];
}

// ファイルを読み込んでmarkdownを返す
function readMarkdownFile(filePath: string): string {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  return fs.readFileSync(absolutePath, 'utf-8');
}

// Mermaid blocks in markdown を ASCII art に変換する
function convertMermaidToAscii(markdown: string): string {
  const mermaidRegex = /```mermaid\s+([\s\S]+?)```/g;

  return markdown.replace(mermaidRegex, (_, code) => {
    try {
      const asciiArt = renderMermaidAscii(code.trim(), {});
      // marked-terminal が警告を出さないように、言語指定なしのコードブロックにする
      return `\`\`\`text\n${asciiArt}\n\`\`\``;
    } catch (error) {
      // 変換に失敗した場合は元の mermaid block を返す
      return `\`\`\`mermaid\n${code.trim()}\n\`\`\``;
    }
  });
}

// marked-terminal を使用して markdown を terminal 表示用に変換
marked.use(markedTerminal());

// markdown をパースして出力
function renderMdmd(markdown: string): void {
  const processedMarkdown = convertMermaidToAscii(markdown);
  const result = marked.parse(processedMarkdown);
  console.log(result);
}

export { renderMdmd, convertMermaidToAscii };

// CLIでの使用
const filePath = getFilePathFromArgs();
if (filePath) {
  try {
    const markdown = readMarkdownFile(filePath);
    renderMdmd(markdown);
  } catch (error) {
    console.error(`Error reading file: ${(error as Error).message}`);
    process.exit(1);
  }
} else {
  // 引数がない場合は使い方を表示
  console.log(`Usage: node main.ts <markdown-file>

Converts markdown with mermaid diagrams to terminal output.`);
  process.exit(1);
}
