"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { anecdotePeople, anecdotes } from "@/lib/anecdotes";

type Player = { id: number; name: string };
type VerifiedPlayer = Player & { accessCode: string };

export default function MemoryMatchGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [guestId, setGuestId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [player, setPlayer] = useState<VerifiedPlayer | null>(null);
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [choice, setChoice] = useState(anecdotePeople[0]);
  const [feedback, setFeedback] = useState<null | { correct: boolean; answer: string }>(null);
  const [status, setStatus] = useState("");
  const [finished, setFinished] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/players").then((response) => response.ok ? response.json() : []).then(setPlayers).catch(() => setStatus("Impossible de charger la liste des invités."));
  }, []);

  const current = anecdotes[question];
  const progress = useMemo(() => Math.round(((question + (feedback ? 1 : 0)) / anecdotes.length) * 100), [question, feedback]);

  async function identify() {
    setStatus("");
    if (!guestId || !accessCode) return setStatus("Choisis ton nom et saisis ton code personnel.");
    try {
      const response = await fetch("/api/guest/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: Number(guestId), accessCode }) });
      const result = await response.json();
      if (!response.ok) return setStatus(result.error === "code_not_assigned" ? "Aucun code ne t’a encore été attribué. Demande-le à Simon." : "Le nom et le code ne correspondent pas.");
      setPlayer({ ...result.guest, accessCode });
    } catch { setStatus("Connexion interrompue. Réessaie dans un instant."); }
  }

  function openPicker() {
    setChoice(anecdotePeople[0]);
    setPickerOpen(true);
    requestAnimationFrame(() => wheelRef.current?.scrollTo({ top: 0 }));
  }

  function onWheelScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const itemHeight = 58;
    const index = Math.max(0, Math.min(anecdotePeople.length - 1, Math.round(wheel.scrollTop / itemHeight)));
    setChoice(anecdotePeople[index]);
  }

  function validateChoice() {
    setPickerOpen(false);
    const correct = choice === current.person;
    if (correct) setScore((value) => value + 1);
    setFeedback({ correct, answer: current.person });
  }

  async function nextQuestion() {
    if (question < anecdotes.length - 1) {
      setQuestion((value) => value + 1);
      setFeedback(null);
      return;
    }
    const finalScore = score;
    setFinished(true);
    if (!player) return;
    try {
      const response = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: player.id, accessCode: player.accessCode, gameId: "memory-match", points: finalScore }) });
      if (!response.ok) setStatus("Ton résultat n’a pas pu être enregistré. Garde cette page ouverte et réessaie.");
      else window.dispatchEvent(new Event("leaderboard-refresh"));
    } catch { setStatus("Ton résultat n’a pas pu être enregistré. Vérifie ta connexion."); }
  }

  function restart() {
    setQuestion(0); setScore(0); setFeedback(null); setFinished(false); setStatus("");
  }

  if (!player) return <section className="memory-game" id="memory-match">
    <div className="memory-game-header"><p className="kicker">Jeu 01</p><h2>Memory Match</h2><p>Identifie-toi avant de lancer les 16 anecdotes.</p></div>
    <div className="memory-identify">
      <label>Qui joue ?<select value={guestId} onChange={(event) => setGuestId(event.target.value)}><option value="">Choisis ton nom</option>{players.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label>Ton code personnel<input type="password" inputMode="numeric" autoComplete="one-time-code" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="Code d’accès" /></label>
      <button type="button" onClick={identify}>Commencer la partie</button>
      {status && <p className="memory-status" role="status">{status}</p>}
    </div>
  </section>;

  if (finished) return <section className="memory-game memory-finished" id="memory-match">
    <p className="kicker">Partie terminée</p><h2>Bien joué, {player.name} !</h2><div className="memory-final-score"><strong>{score}</strong><span>/ {anecdotes.length}</span></div><p>Ton score a été ajouté au classement général.</p>{status && <p className="memory-status">{status}</p>}<button type="button" onClick={restart}>Rejouer</button>
  </section>;

  return <section className="memory-game" id="memory-match">
    <header className="memory-play-header"><div><p className="kicker">Memory Match</p><h2>Anecdote {question + 1} / {anecdotes.length}</h2></div><div className="memory-score">{score} pt{score !== 1 ? "s" : ""}</div></header>
    <div className="memory-progress"><span style={{ width: `${progress}%` }} /></div>
    <article className="anecdote-card"><p className="anecdote-label">Avec qui Simon a-t-il vécu cette histoire ?</p><h3>{current.title}</h3><p>{current.story}</p></article>
    {!feedback ? <button className="memory-choose" type="button" onClick={openPicker}>Choisir une personne</button> : <div className={`memory-feedback ${feedback.correct ? "correct" : "wrong"}`} role="status"><strong>{feedback.correct ? "Bonne réponse !" : "Pas cette fois !"}</strong><p>La bonne réponse était <b>{feedback.answer}</b>.</p><button type="button" onClick={nextQuestion}>{question === anecdotes.length - 1 ? "Voir mon résultat" : "Anecdote suivante"}</button></div>}

    {pickerOpen && <div className="memory-picker-backdrop" role="dialog" aria-modal="true" aria-label="Choisir une personne" onMouseDown={(event) => { if (event.currentTarget === event.target) setPickerOpen(false); }}>
      <div className="memory-picker"><p className="kicker">Fais tourner la liste</p><h3>Qui était avec Simon ?</h3><div className="wheel-window"><div className="wheel-highlight" aria-hidden="true" /><div className="name-wheel" ref={wheelRef} onScroll={onWheelScroll}>{anecdotePeople.map((name) => <button type="button" key={name} className={choice === name ? "selected" : ""} onClick={() => { setChoice(name); document.getElementById(`wheel-${name}`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }} id={`wheel-${name}`}>{name}</button>)}</div></div><p className="wheel-choice">Sélection : <strong>{choice}</strong></p><div className="memory-picker-actions"><button type="button" className="picker-cancel" onClick={() => setPickerOpen(false)}>Annuler</button><button type="button" onClick={validateChoice}>Valider ce choix</button></div></div>
    </div>}
  </section>;
}

