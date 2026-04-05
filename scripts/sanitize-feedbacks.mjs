import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const ROOT = process.cwd();
const SOURCE_DIR = "d:/Imagens/Monopolio pods";
const OUTPUT_DIR = path.join(ROOT, "public", "assets", "feedbacks");
const FILE_PATTERN = /^WhatsApp Image 2026-04-04 at 23\.57\.\d{2}(?: \(\d\))?\.jpeg$/i;
const HEADER_TEXT_TOP = 68;
const HEADER_TEXT_HEIGHT = 72;
const WHITE_THRESHOLD = 218;
const MIN_BRIGHT_COMPONENT_AREA = 10_000;
const BLUR_SIGMA = 16;

const RECEIPT_KEYWORDS = [
  "nome",
  "cpf",
  "cnpj",
  "institui",
  "chave",
  "pix",
  "origem",
  "destino",
  "quem recebeu",
  "dados",
  "transacao",
  "transac",
  "banco",
  "conta",
  "recebedor",
  "comprovante",
  ".pdf",
  "controle",
];

const RECEIPT_VALUE_HINTS = [
  "nome",
  "cpf",
  "cnpj",
  "institui",
  "chave",
  "origem",
  "destino",
  "recebeu",
  "conta",
];

const HEADER_CONTACT_HINTS = ["cliente", "toque para dados do contato", "toque para adicionar aos conta"];

const MANUAL_REDACTIONS = {
  "WhatsApp Image 2026-04-04 at 23.57.24 (2).jpeg": [
    { left: 20, top: 935, width: 175, height: 235 },
  ],
};

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clampRect(rect, width, height) {
  const left = Math.max(0, Math.floor(rect.left));
  const top = Math.max(0, Math.floor(rect.top));
  const right = Math.min(width, Math.ceil(rect.left + rect.width));
  const bottom = Math.min(height, Math.ceil(rect.top + rect.height));

  if (right <= left || bottom <= top) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function expandRect(rect, dx, dy, width, height) {
  return clampRect(
    {
      left: rect.left - dx,
      top: rect.top - dy,
      width: rect.width + dx * 2,
      height: rect.height + dy * 2,
    },
    width,
    height,
  );
}

function bboxToRect(bbox) {
  return {
    left: bbox.x0,
    top: bbox.y0,
    width: bbox.x1 - bbox.x0,
    height: bbox.y1 - bbox.y0,
  };
}

function overlaps(a, b, padding = 10) {
  return !(
    a.left + a.width + padding < b.left ||
    b.left + b.width + padding < a.left ||
    a.top + a.height + padding < b.top ||
    b.top + b.height + padding < a.top
  );
}

function mergeRects(rects) {
  const queue = [...rects];
  const merged = [];

  while (queue.length) {
    let current = queue.shift();
    let changed = true;

    while (changed) {
      changed = false;

      for (let index = 0; index < queue.length; index += 1) {
        const candidate = queue[index];
        if (!overlaps(current, candidate)) continue;

        current = {
          left: Math.min(current.left, candidate.left),
          top: Math.min(current.top, candidate.top),
          width:
            Math.max(current.left + current.width, candidate.left + candidate.width) -
            Math.min(current.left, candidate.left),
          height:
            Math.max(current.top + current.height, candidate.top + candidate.height) -
            Math.min(current.top, candidate.top),
        };

        queue.splice(index, 1);
        changed = true;
        break;
      }
    }

    merged.push(current);
  }

  return merged;
}

function findBrightComponents(raw, width, height) {
  const visited = new Uint8Array(width * height);
  const components = [];

  const isBright = (offset) =>
    raw[offset] >= WHITE_THRESHOLD && raw[offset + 1] >= WHITE_THRESHOLD && raw[offset + 2] >= WHITE_THRESHOLD;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      if (visited[pixelIndex]) continue;

      visited[pixelIndex] = 1;
      if (!isBright(pixelIndex * 3)) continue;

      const stack = [pixelIndex];
      let area = 0;
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;

      while (stack.length) {
        const current = stack.pop();
        const currentX = current % width;
        const currentY = Math.floor(current / width);
        area += 1;

        if (currentX < minX) minX = currentX;
        if (currentY < minY) minY = currentY;
        if (currentX > maxX) maxX = currentX;
        if (currentY > maxY) maxY = currentY;

        const neighbors = [current - 1, current + 1, current - width, current + width];

        for (const neighbor of neighbors) {
          if (neighbor < 0 || neighbor >= visited.length || visited[neighbor]) continue;

          const neighborY = Math.floor(neighbor / width);
          const isHorizontalWrap =
            (neighbor === current - 1 && neighborY !== currentY) ||
            (neighbor === current + 1 && neighborY !== currentY);

          if (isHorizontalWrap) continue;

          visited[neighbor] = 1;
          if (!isBright(neighbor * 3)) continue;
          stack.push(neighbor);
        }
      }

      if (area < MIN_BRIGHT_COMPONENT_AREA) continue;

      components.push({
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }
  }

  return components;
}

function flattenLines(blocks = []) {
  return blocks.flatMap((block) =>
    (block.paragraphs ?? []).flatMap((paragraph) =>
      (paragraph.lines ?? []).map((line) => ({
        text: line.text ?? "",
        bbox: line.bbox,
      })),
    ),
  );
}

function centerInside(rect, component) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    centerX >= component.left &&
    centerX <= component.left + component.width &&
    centerY >= component.top &&
    centerY <= component.top + component.height
  );
}

function getHeaderRects(width, height) {
  return [
    clampRect(
      {
        left: width * 0.10,
        top: height * 0.055,
        width: width * 0.11,
        height: width * 0.11,
      },
      width,
      height,
    ),
    clampRect(
      {
        left: width * 0.17,
        top: height * 0.058,
        width: width * 0.48,
        height: height * 0.05,
      },
      width,
      height,
    ),
  ].filter(Boolean);
}

function isPhoneLine(text) {
  return /\+\d{2}\s?\d{2}\s?\d{4,5}-?\d{4}/.test(text);
}

function isHeaderContactLine(text, line) {
  return (
    line.bbox.y1 <= HEADER_TEXT_TOP + HEADER_TEXT_HEIGHT &&
    (isPhoneLine(text) || HEADER_CONTACT_HINTS.some((hint) => text.includes(hint)))
  );
}

function hasReceiptKeyword(text) {
  return RECEIPT_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hasSensitiveDigits(text) {
  return text.replace(/\D/g, "").length >= 6;
}

function shouldBlurReceiptLine(text) {
  return hasReceiptKeyword(text) || hasSensitiveDigits(text);
}

function shouldBlurNextReceiptValue(text) {
  return RECEIPT_VALUE_HINTS.some((hint) => text.includes(hint));
}

function getComponentLines(component, lines) {
  return lines
    .filter((line) => centerInside(bboxToRect(line.bbox), component))
    .sort((left, right) => left.bbox.y0 - right.bbox.y0 || left.bbox.x0 - right.bbox.x0);
}

async function prepareOutputDirectory() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const existing = await fs.readdir(OUTPUT_DIR);

  await Promise.all(
    existing
      .filter((fileName) => /^feedback-\d{3}\.jpg$/i.test(fileName))
      .map((fileName) => fs.unlink(path.join(OUTPUT_DIR, fileName))),
  );
}

async function getSourceFiles() {
  const allFiles = await fs.readdir(SOURCE_DIR);
  return allFiles.filter((fileName) => FILE_PATTERN.test(fileName)).sort((left, right) => left.localeCompare(right));
}

async function buildSensitiveRects(worker, sourceFileName, buffer, width, height, brightComponents) {
  const sensitiveRects = [...getHeaderRects(width, height)];

  for (const rect of MANUAL_REDACTIONS[sourceFileName] ?? []) {
    const safeRect = clampRect(rect, width, height);
    if (safeRect) sensitiveRects.push(safeRect);
  }

  const {
    data: { blocks = [] },
  } = await worker.recognize(buffer, {}, { blocks: true });
  const lines = flattenLines(blocks);

  for (const line of lines) {
    const text = normalizeText(line.text);
    if (!text) continue;

    if (isHeaderContactLine(text, line)) {
      const rect = expandRect(bboxToRect(line.bbox), 18, 12, width, height);
      if (rect) sensitiveRects.push(rect);
    }

    if ((text.includes(".pdf") || text.includes("comprovante")) && line.bbox.y1 < height * 0.55) {
      const rect = expandRect(bboxToRect(line.bbox), 12, 10, width, height);
      if (rect) sensitiveRects.push(rect);
    }
  }

  for (const component of brightComponents) {
    const componentLines = getComponentLines(component, lines);

    for (let index = 0; index < componentLines.length; index += 1) {
      const line = componentLines[index];
      const text = normalizeText(line.text);
      if (!shouldBlurReceiptLine(text)) continue;

      const rect = expandRect(bboxToRect(line.bbox), 10, 8, width, height);
      if (rect) sensitiveRects.push(rect);

      if (!shouldBlurNextReceiptValue(text)) continue;

      for (let nextIndex = index + 1; nextIndex < componentLines.length; nextIndex += 1) {
        const nextLine = componentLines[nextIndex];
        const nextText = normalizeText(nextLine.text);
        const verticalGap = nextLine.bbox.y0 - line.bbox.y1;

        if (verticalGap > 46) break;
        if (!nextText || hasReceiptKeyword(nextText)) break;

        const nextRect = expandRect(bboxToRect(nextLine.bbox), 10, 8, width, height);
        if (nextRect) sensitiveRects.push(nextRect);
        break;
      }
    }
  }

  return mergeRects(sensitiveRects).map((rect) => clampRect(rect, width, height)).filter(Boolean);
}

async function blurRects(buffer, rects) {
  const overlays = [];

  for (const rect of rects) {
    const fragment = await sharp(buffer).extract(rect).blur(BLUR_SIGMA).toBuffer();
    overlays.push({
      input: fragment,
      left: rect.left,
      top: rect.top,
    });
  }

  return sharp(buffer).composite(overlays).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}

async function main() {
  await prepareOutputDirectory();
  const sourceFiles = await getSourceFiles();
  const filter = process.env.FEEDBACK_FILTER?.toLowerCase().trim();
  const limit = Number.parseInt(process.env.FEEDBACK_LIMIT ?? "", 10);
  const filteredFiles = filter
    ? sourceFiles.filter((fileName) => fileName.toLowerCase().includes(filter))
    : sourceFiles;
  const filesToProcess = Number.isFinite(limit) ? filteredFiles.slice(0, limit) : filteredFiles;
  const worker = await createWorker("eng");

  try {
    for (const [index, fileName] of filesToProcess.entries()) {
      const sourcePath = path.join(SOURCE_DIR, fileName);
      const outputName = `feedback-${String(index + 1).padStart(3, "0")}.jpg`;
      const outputPath = path.join(OUTPUT_DIR, outputName);

      const image = sharp(sourcePath).rotate().removeAlpha();
      const [{ data: raw, info }, orientedBuffer] = await Promise.all([
        image.clone().raw().toBuffer({ resolveWithObject: true }),
        image.clone().toBuffer(),
      ]);

      const brightComponents = findBrightComponents(raw, info.width, info.height);
      const rects = await buildSensitiveRects(worker, fileName, orientedBuffer, info.width, info.height, brightComponents);
      const sanitizedBuffer = await blurRects(orientedBuffer, rects);

      await fs.writeFile(outputPath, sanitizedBuffer);
      console.log(`${outputName} <- ${fileName} (${rects.length} areas)`);
    }

    console.log(`Sanitized ${filesToProcess.length} feedback images into ${OUTPUT_DIR}`);
  } finally {
    await worker.terminate();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
