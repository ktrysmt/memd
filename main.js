#!/usr/bin/env node
// @ts-nocheck
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { renderMermaidAscii } from 'beautiful-mermaid';
import * as fs from 'fs';
import * as path from 'path';

function getFilePathsFromArgs() {
  return process.argv.slice(2);
}

function readMarkdownFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const currentDir = process.cwd();
  const currentDirResolved = path.resolve(currentDir);
  const relativePath = path.relative(currentDirResolved, absolutePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Invalid path: access outside current directory is not allowed');
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error('File not found: ' + absolutePath);
  }

  return fs.readFileSync(absolutePath, 'utf-8');
}

function convertMermaidToAscii(markdown) {
  const mermaidRegex = /```mermaid\s+([\s\S]+?)```/g;

  return markdown.replace(mermaidRegex, function (_, code) {
    try {
      const asciiArt = renderMermaidAscii(code.trim(), {});
      return '```text\n' + asciiArt + '\n```';
    } catch (error) {
      return '```mermaid\n' + code.trim() + '\n```';
    }
  });
}

marked.use(markedTerminal());

function renderMdmd(markdown) {
  const processedMarkdown = convertMermaidToAscii(markdown);
  const result = marked.parse(processedMarkdown);
  const cleanResult = result.replace(/<\/?[a-zA-Z][^>]*>/g, '');

  process.stdout.write(cleanResult);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    process.stdin.on('error', reject);
  });
}

async function main() {
  const filePaths = getFilePathsFromArgs();

  if (filePaths.length === 0) {
    const stdinData = await readStdin();
    if (stdinData.trim()) {
      renderMdmd(stdinData);
    } else {
      console.log('Usage: mema <markdown-file> [markdown-file2] ...\n       echo "..." | mema\n\nConverts markdown with mermaid diagrams to terminal output.');
      process.exit(1);
    }
  } else {
    let exitCode = 0;
    for (const filePath of filePaths) {
      try {
        const markdown = readMarkdownFile(filePath);
        renderMdmd(markdown);
        console.log('');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error reading file ${filePath}: ${errorMessage}`);
        exitCode = 1;
      }
    }
    process.exit(exitCode);
  }
}

main();
