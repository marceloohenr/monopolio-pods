import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const ROOT = process.cwd();
const SOURCE_DIR = "d:/Imagens/Monopolio pods";
const OUTPUT_DIR = path.join(ROOT, "public", "assets", "feedbacks");
const FILE_PATTERN = /^WhatsApp Image 2026-04-04 at 23\.57\.\d{2}(?: \(\d\))?\.jpeg$/i;
const WHITE_THRESHOLD = 218;
const MIN_BRIGHT_COMPONENT_AREA = 10_000;
const BLUR_SIGMA = 8;
const BLUR_OPACITY = 0.76;
const AUDIO_AVATAR_SIZE = 58;
const HEADER_AVATAR_BLUR = {
  dx: 8,
  dy: 8,
  sigma: 44,
  opacity: 1,
};
const HEADER_IDENTITY_BLUR = {
  dx: 18,
  dy: 12,
  radius: 20,
  sigma: 16,
  opacity: 0.98,
};
const RECEIPT_FIELD_BLUR = {
  dx: 18,
  dy: 12,
  radius: 16,
  sigma: 16,
  opacity: 0.98,
};
const RECEIPT_SENSITIVE_BLUR = {
  ...RECEIPT_FIELD_BLUR,
  dx: 20,
  sigma: 20,
  opacity: 1,
};

const COMPANY_HINTS = [
  "banco",
  "inter",
  "pagamentos",
  "mercado pago",
  "mercado",
  "minastman",
  "s.a",
  "sa",
  "ltda",
  "eireli",
  "picpay",
  "nubank",
  "nu ",
  "brasil",
  "santander",
  "itau",
  "caixa",
];

const NAME_STOP_WORDS = new Set([
  "cliente",
  "contato",
  "mensagem",
  "voz",
  "ligacao",
  "nao",
  "atendida",
  "perdida",
  "encaminhada",
  "voce",
  "editada",
  "agora",
  "ontem",
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "compra",
  "verificada",
  "comprovante",
  "pix",
  "cpf",
  "cnpj",
  "chave",
  "conta",
  "agencia",
  "banco",
  "instituicao",
  "origem",
  "destino",
  "nome",
  "pagador",
  "recebedor",
  "beneficiario",
  "favorecido",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "e",
  "o",
  "a",
  "no",
  "na",
  "para",
  "pra",
  "pq",
  "q",
  "que",
  "qual",
  "dele",
  "dela",
  "deles",
  "delas",
  "meu",
  "minha",
  "meus",
  "minhas",
  "seu",
  "sua",
  "seus",
  "suas",
  "teu",
  "tua",
  "teus",
  "tuas",
  "irmao",
  "irmão",
  "irma",
  "irmã",
  "brother",
  "mano",
  "amigo",
  "amiga",
  "papai",
  "moral",
  "foi",
  "tava",
  "estava",
  "sem",
  "com",
  "dinheiro",
  "conta",
  "nomeado",
  "porque",
  "por",
  "isso",
  "ele",
  "ela",
  "pra",
  "pro",
  "aguardando",
  "fazer",
  "compartilhar",
  "compartinar",
  "favoritar",
  "favorita",
  "outropix",
  "contata",
  "contatá",
  "picpay",
  "esperando",
  "aqui",
  "la",
  "lá",
  "ciente",
  "menina",
  "ficar",
]);

const MANUAL_REDACTIONS = {
  "WhatsApp Image 2026-04-04 at 23.57.24 (2).jpeg": [
    { left: 20, top: 935, width: 175, height: 235, shape: "roundRect", radius: 22 },
  ],
  "WhatsApp Image 2026-04-04 at 23.57.28.jpeg": [
    { left: 64, top: 503, width: 60, height: 60, shape: "circle", radius: 30, sigma: 38, opacity: 1 },
  ],
  "WhatsApp Image 2026-04-04 at 23.57.30.jpeg": [
    { left: 194, top: 171, width: 66, height: 66, shape: "circle", radius: 33, sigma: 38, opacity: 1 },
  ],
  "WhatsApp Image 2026-04-04 at 23.57.31 (2).jpeg": [
    { left: 210, top: 316, width: 64, height: 64, shape: "circle", radius: 32, sigma: 38, opacity: 1 },
  ],
  "WhatsApp Image 2026-04-04 at 23.57.25 (1).jpeg": [
    { left: 133, top: 776, width: 58, height: 58, shape: "circle", radius: 29 },
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

function overlaps(a, b, padding = 8) {
  return !(
    a.left + a.width + padding < b.left ||
    b.left + b.width + padding < a.left ||
    a.top + a.height + padding < b.top ||
    b.top + b.height + padding < a.top
  );
}

function mergeRegions(regions) {
  const queue = [...regions];
  const merged = [];

  while (queue.length) {
    let current = queue.shift();

    if (current.shape === "circle") {
      merged.push(current);
      continue;
    }

    let changed = true;

    while (changed) {
      changed = false;

      for (let index = 0; index < queue.length; index += 1) {
        const candidate = queue[index];
        if (candidate.shape === "circle") continue;
        if (!overlaps(current, candidate)) continue;

        current = {
          ...current,
          left: Math.min(current.left, candidate.left),
          top: Math.min(current.top, candidate.top),
          width:
            Math.max(current.left + current.width, candidate.left + candidate.width) -
            Math.min(current.left, candidate.left),
          height:
            Math.max(current.top + current.height, candidate.top + candidate.height) -
            Math.min(current.top, candidate.top),
          radius: Math.max(current.radius ?? 16, candidate.radius ?? 16),
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

function isGrayishPixel(raw, offset) {
  const red = raw[offset];
  const green = raw[offset + 1];
  const blue = raw[offset + 2];
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const luminance = (red + green + blue) / 3;

  return luminance >= 70 && luminance <= 190 && maxChannel - minChannel <= 28;
}

function findGrayishComponents(raw, width, height) {
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x;
      if (visited[pixelIndex]) continue;

      visited[pixelIndex] = 1;
      if (!isGrayishPixel(raw, pixelIndex * 3)) continue;

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
          if (!isGrayishPixel(raw, neighbor * 3)) continue;
          stack.push(neighbor);
        }
      }

      components.push({
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        count: area,
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
        words: line.words ?? [],
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

function getComponentLines(component, lines) {
  return lines
    .filter((line) => centerInside(bboxToRect(line.bbox), component))
    .sort((left, right) => left.bbox.y0 - right.bbox.y0 || left.bbox.x0 - right.bbox.x0);
}

function getHeaderAvatarRegion(width, height) {
  const size = Math.round(width * 0.106);
  return clampRect(
    {
      left: Math.round(width * 0.102),
      top: Math.round(height * 0.051),
      width: size,
      height: size,
      shape: "circle",
    },
    width,
    height,
  );
}

function isCompanyText(text) {
  const normalized = normalizeText(text);
  return COMPANY_HINTS.some((hint) => normalized.includes(hint));
}

function isSensitiveNumberWord(text) {
  return /\d/.test(text) && text.replace(/\D/g, "").length >= 4;
}

function isLongSensitiveNumericWord(text) {
  return text.replace(/\D/g, "").length >= 11;
}

function countDigits(text) {
  return text.replace(/\D/g, "").length;
}

function isPhoneLikeWord(text) {
  const digits = countDigits(text);
  if (digits < 8) return false;

  return /^\+?[\d()\s-]+$/.test(text) || /\+?55/.test(text) || /\d{4,5}[- ]\d{4}/.test(text);
}

function isLikelyNameWord(text) {
  const normalized = normalizeText(text);
  if (normalized.length < 2) return false;
  if (!/^[a-z]+$/i.test(normalized)) return false;
  if (NAME_STOP_WORDS.has(normalized)) return false;
  if (isCompanyText(normalized)) return false;

  return true;
}

function getLikelyPersonalNameWords(words = []) {
  return words.filter((word) => isLikelyNameWord(word.text));
}

function isLikelyPersonalNameSequence(words = []) {
  const nameWords = getLikelyPersonalNameWords(words);
  return nameWords.length >= 2 && nameWords.length <= 5;
}

function getWordsAfterFirstMatch(line, matcher) {
  const words = line.words ?? [];
  const anchorIndex = words.findIndex((word) => matcher(normalizeText(word.text)));
  if (anchorIndex === -1) return [];

  return words.slice(anchorIndex + 1);
}

function getSensitiveNameWordsFromMessage(line) {
  const words = line.words ?? [];
  const explicitLabelWords = getLikelyPersonalNameWords(
    getWordsAfterFirstMatch(
      line,
      (word) =>
        word === "titular" ||
        word === "pagador" ||
        word === "recebedor" ||
        word === "beneficiario" ||
        word === "favorecido",
    ),
  );

  if (explicitLabelWords.length) return explicitLabelWords;

  const nomeIndex = words.findIndex((word) => normalizeText(word.text) === "nome");
  if (nomeIndex === -1) return [];

  const collected = [];
  for (let index = nomeIndex + 1; index < words.length; index += 1) {
    const word = words[index];
    if (isLikelyNameWord(word.text)) {
      collected.push(word);
    }
  }

  return collected.slice(0, 3);
}

function hasSensitivePersonalContext(text) {
  return /\b(pix|chave|conta|agencia|pagamento|transferencia|banco|credito|debito|transacao|cpf|cnpj|nome|origem|destino|pagador|recebedor|beneficiario|favorecido|titular)\b/.test(
    text,
  );
}

function isPdfDescriptionLine(text) {
  return text.includes("comprovante") || text.includes(".pdf") || /\b(pdf|pagina|paginas|kb)\b/.test(text);
}

function isAudioDurationLine(line, width) {
  const text = line.text ?? "";
  const normalized = normalizeText(text);
  if (!normalized || normalized.includes("mensagem de voz")) return false;
  if (line.bbox.x0 > width * 0.68) return false;

  return /^[:;.,|l!i]?\d:\d{2}\b/.test(normalized);
}

function addRegion(regions, rect, options = {}) {
  if (!rect) return;

  const shape = options.shape ?? rect.shape ?? "roundRect";

  regions.push({
    ...rect,
    shape,
    radius: options.radius ?? 16,
    sigma: options.sigma ?? (shape === "circle" ? 20 : BLUR_SIGMA),
    opacity: options.opacity ?? (shape === "circle" ? 0.96 : BLUR_OPACITY),
  });
}

function getWordRegion(word, width, height, options = {}) {
  return expandRect(bboxToRect(word.bbox), options.dx ?? 8, options.dy ?? 6, width, height);
}

function getHeaderRegions(lines, width, height) {
  const regions = [];
  const avatarRegion = getHeaderAvatarRegion(width, height);
  if (avatarRegion) {
    const expandedAvatarRegion = expandRect(
      avatarRegion,
      HEADER_AVATAR_BLUR.dx,
      HEADER_AVATAR_BLUR.dy,
      width,
      height,
    );

    if (expandedAvatarRegion) {
      addRegion(regions, expandedAvatarRegion, {
        shape: "circle",
        radius: expandedAvatarRegion.width / 2,
        sigma: HEADER_AVATAR_BLUR.sigma,
        opacity: HEADER_AVATAR_BLUR.opacity,
      });
    }
  }

  const headerIdentityWords = lines
    .filter((line) => line.bbox.y0 >= height * 0.055 && line.bbox.y1 <= height * 0.115)
    .flatMap((line) => line.words ?? [])
    .filter(
      (word) =>
        word.bbox.x0 >= width * 0.18 &&
        word.bbox.x1 <= width * 0.74 &&
        normalizeText(word.text).length > 0,
    );

  if (headerIdentityWords.length) {
    blurWordsAsGroup(regions, headerIdentityWords, width, height, HEADER_IDENTITY_BLUR);
  }

  const namePill = clampRect(
    {
      left: Math.round(width * 0.17),
      top: Math.round(height * 0.061),
      width: Math.round(width * 0.56),
      height: Math.round(height * 0.031),
    },
    width,
    height,
  );

  if (namePill) {
    addRegion(regions, namePill, HEADER_IDENTITY_BLUR);
  }

  return regions;
}

function getBrightPixelRatio(raw, width, height, rect) {
  let brightPixels = 0;
  let totalPixels = 0;

  for (let y = rect.top; y < rect.top + rect.height; y += 1) {
    for (let x = rect.left; x < rect.left + rect.width; x += 1) {
      const offset = (y * width + x) * 3;
      const luminance = (raw[offset] + raw[offset + 1] + raw[offset + 2]) / 3;
      if (luminance > 180) brightPixels += 1;
      totalPixels += 1;
    }
  }

  return totalPixels ? brightPixels / totalPixels : 0;
}

function findAudioAvatarRegion(raw, width, height, component) {
  return clampRect(
    {
      left: component.left + 4,
      top: component.top + 10,
      width: 58,
      height: 58,
    },
    width,
    height,
  );
}

function getAudioBubbleAvatarRegions(raw, width, height, anchoredRegions = []) {
  const regions = [];
  const grayComponents = findGrayishComponents(raw, width, height);

  for (const component of grayComponents) {
    if (component.left > width * 0.3) continue;
    if (component.width < width * 0.6) continue;
    if (component.height < 76 || component.height > 110) continue;
    if (component.count < 25_000) continue;

    const brightRatio = getBrightPixelRatio(raw, width, height, component);
    if (brightRatio < 0.007 || brightRatio > 0.022) continue;

    const avatarRect = findAudioAvatarRegion(raw, width, height, component);
    if (!avatarRect) continue;
    if (anchoredRegions.some((region) => overlaps(region, avatarRect, 18))) continue;
    addRegion(regions, avatarRect, { shape: "circle", radius: (avatarRect?.width ?? 0) / 2, sigma: 40, opacity: 1 });
  }

  return regions;
}

function getAudioAvatarRegions(lines, width, height) {
  const regions = [];

  for (const line of lines) {
    if (!isAudioDurationLine(line, width)) continue;

    const isIncomingBubble = line.bbox.x0 > width * 0.35;
    const avatarSize = isIncomingBubble ? 58 : 54;
    const avatarRect = clampRect(
      {
        left: isIncomingBubble ? line.bbox.x0 - 135 : line.bbox.x1 + 32,
        top: isIncomingBubble ? line.bbox.y0 - 60 : line.bbox.y0 - 55,
        width: avatarSize,
        height: avatarSize,
      },
      width,
      height,
    );

    addRegion(regions, avatarRect, { shape: "circle", radius: avatarSize / 2, sigma: 40, opacity: 1 });
  }

  return regions;
}

function getWordsAfterLabel(line, labelWord) {
  return (line.words ?? []).filter((word) => word.bbox.x0 > labelWord.bbox.x1 + 12);
}

function getWordsRegion(words, width, height, options = {}) {
  if (!words.length) return null;

  const left = Math.min(...words.map((word) => word.bbox.x0));
  const top = Math.min(...words.map((word) => word.bbox.y0));
  const right = Math.max(...words.map((word) => word.bbox.x1));
  const bottom = Math.max(...words.map((word) => word.bbox.y1));

  return clampRect(
    {
      left: left - (options.dx ?? 10),
      top: top - (options.dy ?? 8),
      width: right - left + (options.dx ?? 10) * 2,
      height: bottom - top + (options.dy ?? 8) * 2,
    },
    width,
    height,
  );
}

function blurWordsAsGroup(regions, words, width, height, options = {}) {
  const region = getWordsRegion(
    words.filter((word) => normalizeText(word.text).length > 0),
    width,
    height,
    options,
  );

  if (!region) return;
  addRegion(regions, region, {
    radius: options.radius ?? 14,
    sigma: options.sigma,
    opacity: options.opacity,
  });
}

function groupNearbyWords(words = [], gapThreshold = 32) {
  if (!words.length) return [];

  const sortedWords = [...words].sort(
    (left, right) => left.bbox.y0 - right.bbox.y0 || left.bbox.x0 - right.bbox.x0,
  );
  const groups = [[sortedWords[0]]];

  for (let index = 1; index < sortedWords.length; index += 1) {
    const current = sortedWords[index];
    const group = groups[groups.length - 1];
    const previous = group[group.length - 1];
    const sameLine = Math.abs(current.bbox.y0 - previous.bbox.y0) < 18;
    const closeEnough = current.bbox.x0 - previous.bbox.x1 <= gapThreshold;

    if (sameLine && closeEnough) {
      group.push(current);
    } else {
      groups.push([current]);
    }
  }

  return groups;
}

function blurWordGroups(regions, words, width, height, options = {}) {
  for (const group of groupNearbyWords(words, options.gapThreshold ?? 32)) {
    blurWordsAsGroup(regions, group, width, height, options);
  }
}

function getReceiptValueColumnRegion(component, line, width, height, options = {}) {
  const startRatio = options.startRatio ?? 0.42;
  const rightInset = options.rightInset ?? 16;
  const dy = options.dy ?? RECEIPT_FIELD_BLUR.dy;
  const left = Math.round(component.left + component.width * startRatio);
  const lineTop = line?.bbox?.y0 ?? component.top;
  const lineBottom = line?.bbox?.y1 ?? lineTop + 18;
  const right = component.left + component.width - rightInset;

  if (right - left < 56) return null;

  return clampRect(
    {
      left,
      top: lineTop - dy,
      width: right - left,
      height: lineBottom - lineTop + dy * 2,
    },
    width,
    height,
  );
}

function blurReceiptValueColumn(regions, component, line, width, height, options = {}) {
  const region = getReceiptValueColumnRegion(component, line, width, height, options);
  if (!region) return;

  addRegion(regions, region, {
    radius: options.radius ?? RECEIPT_FIELD_BLUR.radius,
    sigma: options.sigma ?? RECEIPT_FIELD_BLUR.sigma,
    opacity: options.opacity ?? RECEIPT_FIELD_BLUR.opacity,
  });
}

function isIgnorableOcrLine(text) {
  const compact = normalizeText(text).replace(/[^a-z0-9]/g, "");
  return compact.length < 3;
}

function findNextMeaningfulLine(lines, startIndex) {
  for (let index = startIndex + 1; index < Math.min(lines.length, startIndex + 4); index += 1) {
    const candidate = lines[index];
    const normalized = normalizeText(candidate.text);
    if (!normalized.length || isIgnorableOcrLine(candidate.text)) continue;
    return candidate;
  }

  return null;
}

function isReceiptInstitutionLine(text) {
  return /\binstitui|banco|pagamentos|payment|credito|debito|meio|tipo|quando\b/.test(text) || isCompanyText(text);
}

function isReceiptActionLine(text) {
  return /\b(fazer|compart|favorit|outro ?pix|copiar|salvar|baixar|contat|comprovante|picpay)\b/.test(text);
}

function isNameFieldLabelWord(text) {
  const normalized = normalizeText(text);
  return (
    normalized === "nome" ||
    normalized === "origem" ||
    normalized.endsWith("rigem") ||
    normalized === "destino" ||
    normalized === "pagador" ||
    normalized === "recebedor" ||
    normalized === "beneficiario" ||
    normalized === "favorecido"
  );
}

function isNameFieldLine(text) {
  return /\b(nome|origem|rigem|destino|pagador|recebedor|beneficiario|favorecido|quem recebeu|quem fez a transacao|quem pagou|conta de origem|conta origem|conta de destino|conta destino|dados de quem fez a transacao)\b/.test(
    text,
  );
}

function isSensitiveReceiptLine(text) {
  return /\b(cpf|cnpj|pix|chave|conta|agencia|numero de controle|id da transacao|id de transacao|transacao|cartao|valor|total)\b/.test(
    text,
  );
}

function isTransactionLikeWord(text) {
  const normalized = normalizeText(text).replace(/[^a-z0-9]/g, "");
  return /[a-z]/i.test(text) && /\d/.test(text) && normalized.length >= 8;
}

function isMoneyLikeWord(text) {
  return /r\$\s*\d|^\d+[.,]\d{2}$/.test(normalizeText(text));
}

function isSensitiveReceiptWord(text) {
  return isSensitiveNumberWord(text) || isTransactionLikeWord(text) || isMoneyLikeWord(text);
}

function isLikelyPersonalValueLine(text) {
  return text.length > 1 && !isReceiptInstitutionLine(text) && !isSensitiveReceiptLine(text);
}

function shouldBlurNextLineAsPersonalValue(lineText) {
  return /\b(quem recebeu|quem fez a transacao|quem pagou|conta de origem|conta origem|conta de destino|conta destino|dados de quem fez a transacao|origem|rigem|destino|nome|pagador|recebedor|beneficiario|favorecido)\b/.test(
    lineText,
  );
}

function shouldBlurNameWords(words) {
  if (!words.length) return false;
  const text = normalizeText(words.map((word) => word.text).join(" "));
  return isLikelyPersonalValueLine(text);
}

function getReceiptRegions(component, lines, width, height) {
  const regions = [];
  const componentLines = getComponentLines(component, lines);

  for (let index = 0; index < componentLines.length; index += 1) {
    const line = componentLines[index];
    const lineText = normalizeText(line.text);
    if (!lineText) continue;
    if (isReceiptActionLine(lineText)) continue;

    const words = line.words ?? [];
    const nameLabel = words.find((word) => isNameFieldLabelWord(word.text));

    if (nameLabel) {
      const inlineNameWords = getWordsAfterLabel(line, nameLabel);
      if (shouldBlurNameWords(inlineNameWords)) {
        blurWordsAsGroup(regions, inlineNameWords, width, height, RECEIPT_FIELD_BLUR);
      } else {
        const nextLine = findNextMeaningfulLine(componentLines, index);
        if (nextLine) {
          const nextLineText = normalizeText(nextLine.text);
          if (isLikelyPersonalValueLine(nextLineText)) {
            blurWordsAsGroup(regions, nextLine.words ?? [], width, height, RECEIPT_FIELD_BLUR);
          }
        }
      }

      blurReceiptValueColumn(regions, component, line, width, height, {
        ...RECEIPT_FIELD_BLUR,
        startRatio: 0.38,
      });

      continue;
    }

    if (isNameFieldLine(lineText)) {
      blurReceiptValueColumn(regions, component, line, width, height, {
        ...RECEIPT_FIELD_BLUR,
        startRatio: 0.38,
      });

      const nextLine = findNextMeaningfulLine(componentLines, index);
      if (nextLine) {
        const nextLineText = normalizeText(nextLine.text);
        if (shouldBlurNextLineAsPersonalValue(lineText) && isLikelyPersonalValueLine(nextLineText)) {
          blurWordsAsGroup(regions, nextLine.words ?? [], width, height, RECEIPT_FIELD_BLUR);
        }
      }
      continue;
    }

    if (isSensitiveReceiptLine(lineText)) {
      const inlineSensitiveWords = words.filter((word) => isSensitiveReceiptWord(word.text));
      if (inlineSensitiveWords.length) {
        blurWordsAsGroup(regions, inlineSensitiveWords, width, height, RECEIPT_SENSITIVE_BLUR);
      } else {
        const nextLine = findNextMeaningfulLine(componentLines, index);
        if (nextLine) {
          const nextLineText = normalizeText(nextLine.text);
          if (shouldBlurNextLineAsPersonalValue(lineText) && isLikelyPersonalValueLine(nextLineText)) {
            blurWordsAsGroup(regions, nextLine.words ?? [], width, height, RECEIPT_FIELD_BLUR);
          }

          const nextSensitiveWords = (nextLine.words ?? []).filter((word) => isSensitiveReceiptWord(word.text));
          if (nextSensitiveWords.length) {
            blurWordsAsGroup(regions, nextSensitiveWords, width, height, RECEIPT_SENSITIVE_BLUR);
          }
        }
      }

      blurReceiptValueColumn(regions, component, line, width, height, {
        ...RECEIPT_SENSITIVE_BLUR,
        startRatio: 0.24,
      });
      continue;
    }

    if (
      isLikelyPersonalNameSequence(words) &&
      !isReceiptInstitutionLine(lineText) &&
      !isSensitiveReceiptLine(lineText) &&
      !isReceiptActionLine(lineText) &&
      !/\b(rua|avenida|estrada|travessa|bairro|apartamento|predio|fundao)\b/.test(lineText)
    ) {
      blurWordGroups(regions, getLikelyPersonalNameWords(words), width, height, {
        ...RECEIPT_FIELD_BLUR,
        gapThreshold: 18,
      });
      continue;
    }

    const genericSensitiveWords = words.filter((word) => isSensitiveReceiptWord(word.text));
    if (genericSensitiveWords.length && !isReceiptInstitutionLine(lineText)) {
      blurWordsAsGroup(regions, genericSensitiveWords, width, height, {
        ...RECEIPT_SENSITIVE_BLUR,
        dx: 22,
      });
      continue;
    }

    if (/\b(nome|origem|rigem|destino)\b/.test(lineText) && !isReceiptInstitutionLine(lineText)) {
      const trailingWords = words.filter((word) => !isNameFieldLabelWord(word.text));
      if (shouldBlurNameWords(trailingWords)) {
        blurWordsAsGroup(regions, trailingWords, width, height, RECEIPT_FIELD_BLUR);
      }

      blurReceiptValueColumn(regions, component, line, width, height, {
        ...RECEIPT_FIELD_BLUR,
        startRatio: 0.38,
      });
    }
  }

  return regions;
}

function getFinancialMessageRegions(lines, width, height) {
  const regions = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineText = normalizeText(line.text);
    if (!lineText || line.bbox.y0 < height * 0.12) continue;
    if (/99app|trip\.uber|placa do carro|motorista|\.pdf/.test(lineText)) continue;
    if (isPdfDescriptionLine(lineText)) continue;
    if (isReceiptActionLine(lineText)) continue;

    const words = line.words ?? [];
    const phoneWords = words.filter((word) => isPhoneLikeWord(word.text));
    if (phoneWords.length) {
      blurWordGroups(regions, phoneWords, width, height, RECEIPT_SENSITIVE_BLUR);
      continue;
    }

    const directSensitiveWords = words.filter(
      (word) => isLongSensitiveNumericWord(word.text) || isTransactionLikeWord(word.text),
    );

    if (directSensitiveWords.length) {
      blurWordGroups(regions, directSensitiveWords, width, height, RECEIPT_SENSITIVE_BLUR);
      continue;
    }

    const explicitNameWords = getSensitiveNameWordsFromMessage(line);
    if (explicitNameWords.length) {
      blurWordGroups(regions, explicitNameWords, width, height, {
        ...RECEIPT_FIELD_BLUR,
        gapThreshold: 18,
      });
      continue;
    }

    if (!hasSensitivePersonalContext(lineText)) {
      continue;
    }

    const inlineSensitiveWords = words.filter(
      (word) => isLongSensitiveNumericWord(word.text) || isTransactionLikeWord(word.text),
    );
    if (inlineSensitiveWords.length) {
      blurWordGroups(regions, inlineSensitiveWords, width, height, RECEIPT_SENSITIVE_BLUR);
    }

    const nextLine = lines[index + 1];
    if (!nextLine || nextLine.bbox.y0 - line.bbox.y1 > 90) continue;

    const nextSensitiveWords = (nextLine.words ?? []).filter(
      (word) => isLongSensitiveNumericWord(word.text) || isTransactionLikeWord(word.text),
    );
    if (nextSensitiveWords.length) {
      blurWordGroups(regions, nextSensitiveWords, width, height, RECEIPT_SENSITIVE_BLUR);
    }

    if (/^(nome|titular|pagador|recebedor|beneficiario|favorecido)\b/.test(lineText)) {
      const nextLineNameWords = getLikelyPersonalNameWords(nextLine.words ?? []).slice(0, 4);
      if (nextLineNameWords.length >= 2) {
        blurWordGroups(regions, nextLineNameWords, width, height, {
          ...RECEIPT_FIELD_BLUR,
          gapThreshold: 18,
        });
      }
    }
  }

  return regions;
}

function buildShapeMask(width, height, shape, radius = 16) {
  if (shape === "circle") {
    const circleRadius = Math.min(width, height) / 2;
    return Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><circle cx="${width / 2}" cy="${
        height / 2
      }" r="${circleRadius}" fill="white"/></svg>`,
    );
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );
}

async function createMaskedOverlay(buffer, region) {
  const base = sharp(buffer).extract(region);
  const processed =
    region.shape === "circle"
      ? base
          .clone()
          .resize(Math.max(6, Math.round(region.width * 0.12)), Math.max(6, Math.round(region.height * 0.12)), {
            fit: "fill",
            kernel: sharp.kernel.nearest,
          })
          .resize(region.width, region.height, {
            fit: "fill",
            kernel: sharp.kernel.nearest,
          })
          .blur(Math.max(10, (region.sigma ?? BLUR_SIGMA) / 2.4))
      : base.clone().blur(region.sigma ?? BLUR_SIGMA);
  const blurred = await processed.ensureAlpha(region.opacity ?? BLUR_OPACITY).png().toBuffer();
  const mask = buildShapeMask(region.width, region.height, region.shape, region.radius);

  return sharp({
    create: {
      width: region.width,
      height: region.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: blurred, left: 0, top: 0 },
      { input: mask, left: 0, top: 0, blend: "dest-in" },
    ])
    .png()
    .toBuffer();
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

async function buildSensitiveRegions(worker, sourceFileName, buffer, raw, width, height, brightComponents) {
  const {
    data: { blocks = [] },
  } = await worker.recognize(buffer, {}, { blocks: true });
  const lines = flattenLines(blocks);
  const audioAnchorRegions = getAudioAvatarRegions(lines, width, height);
  const regions = [
    ...getHeaderRegions(lines, width, height),
    ...audioAnchorRegions,
    ...getAudioBubbleAvatarRegions(raw, width, height, audioAnchorRegions),
    ...getFinancialMessageRegions(lines, width, height),
  ];

  for (const component of brightComponents) {
    regions.push(...getReceiptRegions(component, lines, width, height));
  }

  for (const manual of MANUAL_REDACTIONS[sourceFileName] ?? []) {
    const rect = clampRect(manual, width, height);
    if (!rect) continue;
    addRegion(regions, rect, manual);
  }

  return mergeRegions(regions)
    .map((region) => {
      const rect = clampRect(region, width, height);
      return rect ? { ...region, ...rect } : null;
    })
    .filter(Boolean);
}

async function blurRegions(buffer, regions) {
  const overlays = [];

  for (const region of regions) {
    const overlay = await createMaskedOverlay(buffer, region);
    overlays.push({
      input: overlay,
      left: region.left,
      top: region.top,
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
  const worker = await createWorker("por+eng");

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
      const regions = await buildSensitiveRegions(
        worker,
        fileName,
        orientedBuffer,
        raw,
        info.width,
        info.height,
        brightComponents,
      );
      const sanitizedBuffer = await blurRegions(orientedBuffer, regions);

      await fs.writeFile(outputPath, sanitizedBuffer);
      console.log(`${outputName} <- ${fileName} (${regions.length} regions)`);
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
