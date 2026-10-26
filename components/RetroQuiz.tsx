"use client";
import { useState } from "react";

const questions = [
  { q: "Dans Retour vers le futur, quelle vitesse déclenche le voyage temporel ?", a: ["88 miles/h", "100 km/h", "120 miles/h"], correct: 0 },
  { q: "Quel objet ne doit surtout pas être mouillé dans Gremlins ?", a: ["Le Mogwaï", "La DeLorean", "Le Walkman"], correct: 0 },
  { q: "Comment s’appelle le groupe d’amis des Goonies ?", a: ["Les Goonies", "Les Ghostbusters", "Les Lost Boys"], correct: 0 },
  { q: "Quel jeu vidéo met en scène un plombier moustachu ?", a: ["Pac-Man", "Super Mario", "Sonic"], correct: 1 }
];

export default function RetroQuiz() {
  const [index,setIndex]=useState(0); const [score,setScore]=useState(0); const [finished,setFinished]=useState(false);
  function answer(choice:number){ const next=score+(choice===questions[index].correct?1:0); setScore(next); if(index===questions.length-1)setFinished(true); else setIndex(index+1); }
  function reset(){setIndex(0);setScore(0);setFinished(false);}
  if(finished) return <div className="quiz-card result-card"><p className="kicker">Game over</p><h2>{score} / {questions.length}</h2><p>{score===questions.length?"Score parfait. Simon approuve !":"Belle tentative, retente ta chance."}</p><button onClick={reset}>Rejouer</button></div>;
  const question=questions[index];
  return <div className="quiz-card"><div className="quiz-top"><span>Question {index+1}/{questions.length}</span><span>Score {score}</span></div><h2>{question.q}</h2><div className="quiz-answers">{question.a.map((option,i)=><button onClick={()=>answer(i)} key={option}>{option}</button>)}</div></div>;
}

