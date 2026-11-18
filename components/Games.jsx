"use client";

import { useEffect, useRef, useState } from "react";
import { TRIVIA, INGREDIENTS, BOMB, MEMORY_SET } from "@/lib/games";

/* ───────────────────────── Games Hub ───────────────────────── */
export default function Games({ onEarn }) {
  const [game, setGame] = useState(null);
  const [earned, setEarned] = useState(0);

  function finish(points) {
    setEarned((e) => e + points);
    if (points > 0) onEarn?.(points);
    setGame(null);
  }

  const cards = [
    { id: "catch", title: "Catch the Ingredients", emoji: "🫕", desc: "Tap ingredients into the pot. Dodge the chili-bomb!" },
    { id: "trivia", title: "Spice Trivia", emoji: "🌶️", desc: "How well do you know hotpot? 6 quick questions." },
    { id: "memory", title: "Memory Match", emoji: "🧠", desc: "Flip and match the hotpot pairs." },
  ];

  if (game === "catch") return <CatchGame onDone={finish} />;
  if (game === "trivia") return <TriviaGame onDone={finish} />;
  if (game === "memory") return <MemoryGame onDone={finish} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="display text-2xl text-cream">Pass the time, earn points</h3>
        {earned > 0 && (
          <span className="rounded-full bg-gold/20 px-3 py-1 text-sm font-bold text-gold">
            +{earned} pts this wait
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => setGame(c.id)}
            className="card p-5 text-left transition hover:border-chili/50"
          >
            <div className="text-4xl">{c.emoji}</div>
            <div className="mt-3 font-bold text-cream">{c.title}</div>
            <div className="mt-1 text-sm text-cream/55">{c.desc}</div>
            <div className="mt-3 text-sm font-semibold text-chili">Play →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameShell({ title, children, onQuit }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="display text-xl text-cream">{title}</h3>
        <button onClick={onQuit} className="text-sm text-cream/50 hover:text-cream">✕ Quit</button>
      </div>
      {children}
    </div>
  );
}

/* ───────────────────────── Catch the Ingredients ───────────────────────── */
function CatchGame({ onDone }) {
  const DURATION = 20;
  const [cells, setCells] = useState(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  function start() {
    setScore(0);
    setTime(DURATION);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        const empty = next.map((c, i) => (c ? null : i)).filter((i) => i !== null);
        if (empty.length) {
          const i = empty[Math.floor(Math.random() * empty.length)];
          const isBomb = Math.random() < 0.18;
          next[i] = isBomb ? BOMB : INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
          const t = setTimeout(() => {
            setCells((p) => { const n = [...p]; if (n[i]) n[i] = null; return n; });
          }, 900);
          timers.current.push(t);
        }
        return next;
      });
    }, 650);

    const tick = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(spawn);
          clearInterval(tick);
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { clearInterval(spawn); clearInterval(tick); timers.current.forEach(clearTimeout); };
  }, [running]);

  function tap(i) {
    if (!running || !cells[i]) return;
    const val = cells[i];
    setCells((p) => { const n = [...p]; n[i] = null; return n; });
    setScore((s) => (val === BOMB ? Math.max(0, s - 2) : s + 1));
  }

  const done = time === 0;
  const points = score * 5;

  return (
    <GameShell title="Catch the Ingredients" onQuit={() => onDone(0)}>
      {!running && !done && (
        <div className="py-8 text-center">
          <div className="text-5xl">🫕</div>
          <p className="mx-auto mt-3 max-w-sm text-sm text-cream/60">
            Tap the ingredients as they appear to drop them in the pot. Each catch = 5 pts.
            Avoid the chili-bomb {BOMB} — it costs you!
          </p>
          <button onClick={start} className="pill-red mt-5">Start · 20s</button>
        </div>
      )}

      {running && (
        <>
          <div className="mb-3 flex justify-between text-sm">
            <span className="font-bold text-gold">Caught: {score}</span>
            <span className="text-cream/60">⏱ {time}s</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {cells.map((c, i) => (
              <button
                key={i}
                onClick={() => tap(i)}
                className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-4xl transition active:scale-95"
              >
                {c || ""}
              </button>
            ))}
          </div>
        </>
      )}

      {done && (
        <div className="py-8 text-center">
          <div className="text-5xl">🏆</div>
          <p className="mt-3 text-lg text-cream">You caught {score} ingredients!</p>
          <p className="display mt-1 text-4xl text-flame">+{points} pts</p>
          <button onClick={() => onDone(points)} className="pill-red mt-5">Collect points</button>
        </div>
      )}
    </GameShell>
  );
}

/* ───────────────────────── Spice Trivia ───────────────────────── */
function TriviaGame({ onDone }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const q = TRIVIA[i];
  const last = i === TRIVIA.length - 1;

  function pick(choice) {
    if (picked !== null) return;
    setPicked(choice);
    if (choice === q.answer) setCorrect((c) => c + 1);
  }
  function next() {
    if (last) return onDone(correct * 10);
    setI(i + 1);
    setPicked(null);
  }

  return (
    <GameShell title={`Spice Trivia · ${i + 1}/${TRIVIA.length}`} onQuit={() => onDone(0)}>
      <p className="text-lg font-semibold text-cream">{q.q}</p>
      <div className="mt-4 grid gap-2">
        {q.choices.map((c, idx) => {
          const isAns = idx === q.answer;
          const show = picked !== null;
          return (
            <button
              key={idx}
              onClick={() => pick(idx)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                show && isAns
                  ? "border-green-500/60 bg-green-500/15 text-green-300"
                  : show && idx === picked
                  ? "border-chili/60 bg-chili/15 text-chili"
                  : "border-white/10 bg-black/30 text-cream/80 hover:border-white/30"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gold">Score: {correct * 10} pts</span>
          <button onClick={next} className="pill-red">{last ? "Finish" : "Next →"}</button>
        </div>
      )}
    </GameShell>
  );
}

/* ───────────────────────── Memory Match ───────────────────────── */
function MemoryGame({ onDone }) {
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const pairs = [...MEMORY_SET, ...MEMORY_SET]
      .map((e, idx) => ({ id: idx, e }))
      .sort(() => Math.random() - 0.5);
    setDeck(pairs);
  }, []);

  function flip(card) {
    if (flipped.length === 2 || flipped.find((f) => f.id === card.id) || matched.includes(card.e)) return;
    const nf = [...flipped, card];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      if (nf[0].e === nf[1].e) {
        setMatched((m) => [...m, nf[0].e]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 750);
      }
    }
  }

  const done = matched.length === MEMORY_SET.length;
  const points = Math.max(20, 80 - (moves - MEMORY_SET.length) * 5);

  return (
    <GameShell title="Memory Match" onQuit={() => onDone(0)}>
      {!done ? (
        <>
          <div className="mb-3 text-sm text-cream/60">Moves: {moves} · Matched {matched.length}/{MEMORY_SET.length}</div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {deck.map((card) => {
              const isUp = flipped.find((f) => f.id === card.id) || matched.includes(card.e);
              return (
                <button
                  key={card.id}
                  onClick={() => flip(card)}
                  className={`flex aspect-square items-center justify-center rounded-xl border text-3xl transition ${
                    isUp ? "border-chili/50 bg-black/50" : "border-white/10 bg-chili/80"
                  }`}
                >
                  {isUp ? card.e : ""}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <div className="text-5xl">🎉</div>
          <p className="mt-3 text-lg text-cream">Matched them all in {moves} moves!</p>
          <p className="display mt-1 text-4xl text-flame">+{points} pts</p>
          <button onClick={() => onDone(points)} className="pill-red mt-5">Collect points</button>
        </div>
      )}
    </GameShell>
  );
}
