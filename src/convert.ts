export interface IBatchBlock {
  content: string;
  children?: IBatchBlock[];
}

function measureIndent(line: string): number {
  return line.length - line.trimStart().length;
}

function convertListItemContent(raw: string): string {
  if (/^\[ \] (.*)/.test(raw)) return `TODO ${raw.slice(4)}`;
  if (/^\[x\] (.*)/i.test(raw)) return `DONE ${raw.slice(4)}`;
  return raw;
}

interface StackEntry {
  block: IBatchBlock;
  indent: number;
}

function insertAtDepth(stack: StackEntry[], block: IBatchBlock, depth: number): void {
  while (stack.length > 1 && stack[stack.length - 1].indent >= depth) {
    stack.pop();
  }
  const parent = stack[stack.length - 1].block;
  if (!parent.children) parent.children = [];
  parent.children.push(block);
  stack.push({ block, indent: depth });
}

export function markdownToBlocks(markdown: string): IBatchBlock[] {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const result: IBatchBlock[] = [];
  let i = 0;

  // Phase 1: YAML frontmatter
  if (lines[0] === "---") {
    i = 1;
    while (i < lines.length && lines[i] !== "---") {
      const colonIdx = lines[i].indexOf(":");
      if (colonIdx !== -1) {
        const key = lines[i].slice(0, colonIdx).trim();
        const value = lines[i].slice(colonIdx + 1).trim();
        result.push({ content: `${key}:: ${value}` });
      }
      i++;
    }
    i++; // skip closing '---'
  }

  // Phase 2: parse remaining lines into a block tree
  const root: IBatchBlock = { content: "__root__", children: [] };
  const stack: StackEntry[] = [{ block: root, indent: -1 }];

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const indent = measureIndent(line);
      const depth = Math.floor(indent / 2);
      const fenceLines: string[] = [line];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        fenceLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        fenceLines.push(lines[i]); // closing fence
      }
      i++;
      insertAtDepth(stack, { content: fenceLines.join("\n") }, depth);
      continue;
    }

    // Skip blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading
    if (/^#{1,6} /.test(line.trimStart())) {
      const indent = measureIndent(line);
      const depth = Math.floor(indent / 2);
      insertAtDepth(stack, { content: line.trim() }, depth);
      i++;
      continue;
    }

    // List item (bullet or numbered)
    const bulletMatch = line.match(/^(\s*)(?:-|\*|\d+\.) (.*)/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      const depth = Math.floor(indent / 2);
      const content = convertListItemContent(bulletMatch[2]);
      insertAtDepth(stack, { content }, depth);
      i++;
      continue;
    }

    // Plain line / paragraph
    const indent = measureIndent(line);
    const depth = Math.floor(indent / 2);
    insertAtDepth(stack, { content: line.trim() }, depth);
    i++;
  }

  return [...result, ...(root.children ?? [])];
}
