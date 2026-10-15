import type { CaptionPart, WikiImage } from "./wikiImages";

// Live random Wikipedia figures for earth.exe.
//
// How a figure is picked:
//   1. A uniformly random article title seeds a start position (so the pick
//      follows the real spread of titles instead of favouring rare letters).
//   2. From that position, take the next ~20 members of "Good articles"
//      (~45k) or "Featured articles" (~7k) — a big, varied pool, but one the
//      Wikipedia community has reviewed, which also means well-captioned
//      figures and far fewer graphic ones than a truly raw random page.
//   3. Drop articles/categories/captions/filenames that match BLOCK, pick one
//      of what's left, then pick one of its captioned photos at random.
//
// The BLOCK filter is a best-effort heuristic, not a guarantee. It errs on the
// side of skipping (e.g. it also skips "shooting" the photography kind).

const API = "https://en.wikipedia.org/w/api.php";
const REST = "https://en.wikipedia.org/api/rest_v1";

const BLOCK =
  /(sex|nud(e|ity)|naked|topless|porn|erotic|genital|penis|vagin|vulva|anus|anal\b|breast|fetish|bdsm|gore|corpse|cadaver|autops|dead body|murder|massacre|genocide|holocaust|lynch|tortur|executio|hanging|suicid|rape|abus|assault|shooting|bombing|terror|victim|casualt|wound|injur|surgery|surgical|tumou?r|cancer|lesion|disfigur|mutilat|slave|concentration camp|war crime|atrocit|drug|overdose|prostitut|stripper|lingerie|bikini)/i;

// Prefer real photos over logos, maps, covers and diagrams.
const BAD_FILE =
  /(logo|icon|flag|seal|coat[ _]of[ _]arms|signature|\bmap\b|diagram|chart|graph|screenshot|poster|cover|album|box[ _]art)/i;

type CategoryPage = { title: string; categories?: { title: string }[] };
type MediaItem = {
  title: string;
  type: string;
  caption?: { html: string; text: string };
  srcset?: { src: string }[];
};

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Wikipedia responded ${res.status}`);
  return res.json() as Promise<T>;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function randomCandidates(signal?: AbortSignal): Promise<string[]> {
  const seed = await getJson<{ query: { random: { title: string }[] } }>(
    `${API}?action=query&format=json&origin=*&list=random&rnnamespace=0&rnlimit=1`,
    signal
  );
  const prefix = seed.query.random[0].title.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 4) || "A";
  const hex = Array.from(new TextEncoder().encode(prefix))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "categorymembers",
    gcmtitle: Math.random() < 0.87 ? "Category:Good_articles" : "Category:Featured_articles",
    gcmnamespace: "0",
    gcmtype: "page",
    gcmsort: "sortkey",
    gcmstarthexsortkey: hex,
    gcmlimit: "20",
    prop: "categories",
    cllimit: "max",
    clshow: "!hidden",
  });
  const data = await getJson<{ query?: { pages?: Record<string, CategoryPage> } }>(`${API}?${params}`, signal);
  const pages = Object.values(data.query?.pages ?? {});
  const allowed = pages.filter((p) => {
    const cats = (p.categories ?? []).map((c) => c.title).join(" ");
    return !BLOCK.test(p.title) && !BLOCK.test(cats);
  });
  return shuffle(allowed.map((p) => p.title));
}

// Caption HTML -> text segments, keeping only the caption's own article links.
export function parseCaption(html: string): CaptionPart[] {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const parts: CaptionPart[] = [];

  const push = (text: string, href?: string) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (!href && last && !last.href) last.text += text;
    else parts.push(href ? { text, href } : { text });
  };

  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        push(child.textContent ?? "");
      } else if (child instanceof HTMLElement) {
        if (["SUP", "STYLE", "SCRIPT"].includes(child.tagName)) return;
        if (child.tagName === "A") {
          const match = (child.getAttribute("href") ?? "").match(/^\.\/([^#?:]+)$/);
          push(child.textContent ?? "", match ? `https://en.wikipedia.org/wiki/${match[1]}` : undefined);
        } else {
          walk(child);
        }
      }
    });
  };

  if (doc.body.firstElementChild) walk(doc.body.firstElementChild);
  return parts;
}

async function figureFor(title: string, signal?: AbortSignal): Promise<WikiImage | null> {
  const data = await getJson<{ items?: MediaItem[] }>(
    `${REST}/page/media-list/${encodeURIComponent(title.replaceAll(" ", "_"))}`,
    signal
  );
  const eligible = (data.items ?? []).filter((item) => {
    const caption = item.caption?.text?.trim() ?? "";
    return (
      item.type === "image" &&
      item.srcset?.length &&
      caption.length >= 20 &&
      caption.length <= 220 &&
      caption.split(/\s+/).length >= 4 &&
      /\.jpe?g$/i.test(item.title) &&
      !BAD_FILE.test(item.title) &&
      !BLOCK.test(item.title) &&
      !BLOCK.test(caption)
    );
  });
  if (eligible.length === 0) return null;

  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  const raw = pick.srcset![0].src.split("?")[0];
  return {
    src: raw.startsWith("//") ? `https:${raw}` : raw,
    caption: parseCaption(pick.caption!.html),
    article: title,
    articleUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`,
  };
}

export function preload(src: string, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("image timed out")), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("image failed"));
    };
    img.src = src;
  });
}

// `seen` keeps one session from showing the same article or image twice.
export async function fetchRandomFigure(seen: Set<string>, signal?: AbortSignal): Promise<WikiImage> {
  for (let round = 0; round < 4; round++) {
    const titles = await randomCandidates(signal);
    for (const title of titles.slice(0, 6)) {
      if (seen.has(title)) continue;
      // Reserve it now: with two fetches in flight, checking only after the
      // image loads lets both of them pick the same article.
      seen.add(title);
      const figure = await figureFor(title, signal);
      if (!figure || seen.has(figure.src)) continue;
      seen.add(figure.src);
      try {
        await preload(figure.src);
      } catch {
        continue;
      }
      return figure;
    }
  }
  throw new Error("Couldn't find a figure on Wikipedia");
}
