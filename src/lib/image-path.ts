function isVideoFile(path: string): boolean {
  return /\.(mp4|mov|webm|avi)$/i.test(path);
}

export function getRenderableMediaSrc(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().replace(/^["']+|["']+$/g, "");

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

export function getRenderableImageSrc(value?: string | null): string | null {
  const src = getRenderableMediaSrc(value);
  if (!src || isVideoFile(src)) {
    return null;
  }
  return src;
}

export function getRenderableImageList(values: string[] | undefined | null) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => getRenderableImageSrc(value))
    .filter((value): value is string => Boolean(value));
}

export function getRenderableMediaList(values: string[] | undefined | null) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => getRenderableMediaSrc(value))
    .filter((value): value is string => Boolean(value));
}

