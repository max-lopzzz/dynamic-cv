"use client";

import { useEffect, useRef, useState } from "react";
import { Beep } from "./Beep";
import { wikiImages, WikiImage } from "../wikiImages";
import { fetchRandomFigure, preload } from "../wikiRandom";

const QUEUE_SIZE = 2;

// Figures that came from the saved set rather than live from Wikipedia.
const fromFallback = new WeakSet<WikiImage>();

type Session = {
  alive: boolean;
  controller: AbortController;
  queue: WikiImage[];
  pending: number;
  wanted: boolean;
  seen: Set<string>;
};

// Only used when Wikipedia itself can't be reached: the hand-picked set.
async function curatedFallback(seen: Set<string>): Promise<WikiImage> {
  const fresh = wikiImages.filter((image) => !seen.has(image.src));
  const pool = fresh.length ? fresh : wikiImages;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  await preload(pick.src);
  seen.add(pick.src);
  fromFallback.add(pick);
  return pick;
}

export function WikiViewer() {
  const session = useRef<Session | null>(null);
  const [current, setCurrent] = useState<WikiImage | null>(null);
  const [waiting, setWaiting] = useState(true);
  const [failed, setFailed] = useState(false);

  // Keeps QUEUE_SIZE figures fetched, checked and image-preloaded ahead of time,
  // so "another one" is instant instead of waiting on two API calls.
  function refill(s: Session) {
    while (s.alive && s.pending + s.queue.length < QUEUE_SIZE) {
      s.pending++;
      fetchRandomFigure(s.seen, s.controller.signal)
        .catch(() => {
          // Window closed mid-fetch: don't go preload a fallback nobody will see.
          if (!s.alive) throw new Error("closed");
          return curatedFallback(s.seen);
        })
        .then((figure) => {
          if (s.alive) s.queue.push(figure);
        })
        .catch(() => {
          if (s.alive) setFailed(true);
        })
        .finally(() => {
          s.pending--;
          if (s.alive) deliver(s);
        });
    }
  }

  function deliver(s: Session) {
    if (s.wanted && s.queue.length > 0) {
      s.wanted = false;
      setCurrent(s.queue.shift()!);
      setWaiting(false);
      setFailed(false);
      refill(s);
    } else if (s.wanted && s.pending === 0) {
      // Nothing queued, nothing in flight: both live and fallback failed.
      setWaiting(false);
      setFailed(true);
    }
  }

  function next() {
    const s = session.current;
    if (!s) return;
    s.wanted = true;
    setFailed(false);
    if (s.queue.length > 0) {
      deliver(s);
    } else {
      setWaiting(true);
      refill(s);
    }
  }

  useEffect(() => {
    const s: Session = {
      alive: true,
      controller: new AbortController(),
      queue: [],
      pending: 0,
      wanted: true,
      seen: new Set(),
    };
    session.current = s;
    refill(s);
    return () => {
      s.alive = false;
      s.controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="earth-body">
      <div className="earth-stage">
        {current && (
          <figure className="wiki-thumb" key={current.src} data-loaded={waiting ? "false" : "true"}>
            {/* eslint-disable-next-line @next/next/no-img-element --
                Wikimedia already serves right-sized thumbnails; routing random remote
                images through the Next optimizer would only add usage cost. */}
            <img src={current.src} alt={current.caption.map((part) => part.text).join("")} />
            <figcaption className="wiki-caption">
              {current.caption.map((part, i) =>
                part.href ? (
                  <a key={i} href={part.href} target="_blank" rel="noreferrer">{part.text}</a>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </figcaption>
          </figure>
        )}
        {failed && !current && <p className="earth-error">Couldn’t reach Wikipedia. Try again in a moment.</p>}
      </div>

      <div className="earth-bar">
        <div className="globe" aria-hidden="true" />
        {waiting ? (
          <span className="earth-status">Loading...</span>
        ) : failed ? (
          <span className="earth-status">Couldn’t load that one</span>
        ) : current ? (
          <a className="earth-status" href={current.articleUrl} target="_blank" rel="noreferrer">
            from “{current.article}”
          </a>
        ) : null}
        <Beep onClick={next}>↻ another one</Beep>
      </div>

      <p className="earth-credit">
        Figures: <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer">Wikipedia</a> /
        Wikimedia Commons, openly licensed.{current && fromFallback.has(current) && " (Wikipedia didn’t respond, so this one is from a saved set.)"} Globe: NASA /
        Reto Stöckli,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>.
      </p>
    </div>
  );
}
