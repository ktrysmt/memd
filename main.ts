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

// パスの正規化と安全な読み込み
function readMarkdownFile(filePath: string): string {
  // 相対パスを絶対パスに変換
  const absolutePath = path.resolve(filePath);

  // セキュリティチェック: 指定されたファイルがカレントディレクトリ以下のものであることを確認
  const currentDir = process.cwd();
  const currentDirResolved = path.resolve(currentDir);

  // path.relativeでカレントディレクトリからの相対パスを取得
  // ../ が含まれている場合、カレントディレクトリ外へのアクセスとみなす
  const relativePath = path.relative(currentDirResolved, absolutePath);

  // .. が含まれている場合はカレントディレクトリ外へのアクセスとみなして拒否
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Invalid path: access outside current directory is not allowed');
  }

  // ファイルが存在するかチェック
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

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
  const result = marked.parse(processedMarkdown) as string;
  // HTMLタグを除去してからstdoutへ書き込み
  // ReDoS対策: 簡易的なHTMLタグ除去で十分（mermaidのASCII artにはHTMLタグ含まれない想定）
  process.stdout.write(result.replace(/<\/?[a-zA-Z][^>]*>/g, ''));
}

export { renderMdmd, convertMermaidToAscii };

// CLIでの使用
const filePath = getFilePathFromArgs();
if (filePath) {
  try {
    const markdown = readMarkdownFile(filePath);
    renderMdmd(markdown);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error reading file: ${errorMessage}`);
    process.exit(1);
  }
} else {
  // 引数がない場合は使い方を表示
  console.log(`Usage: node main.ts <markdown-file>

Converts markdown with mermaid diagrams to terminal output.`);
  process.exit(1);
}
