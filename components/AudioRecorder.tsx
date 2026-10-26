"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const MAX_SECONDS = 30;
type Player={id:number;name:string};

export default function AudioRecorder() {
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const [players,setPlayers]=useState<Player[]>([]);

  useEffect(()=>{fetch("/api/players").then(response=>response.ok?response.json():[]).then(setPlayers).catch(()=>setPlayers([]))},[]);

  useEffect(()=>()=>{if(recorderRef.current?.state==="recording")recorderRef.current.stop();streamRef.current?.getTracks().forEach(track=>track.stop());if(audioUrlRef.current)URL.revokeObjectURL(audioUrlRef.current)},[]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value + 1 >= MAX_SECONDS) {
          window.clearInterval(timer);
          if(recorderRef.current?.state==="recording")recorderRef.current.stop();
          setRecording(false);
          return MAX_SECONDS;
        }
        return value + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  async function startRecording() {
    setStatus("");
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setStatus("Ton navigateur ne permet pas l'enregistrement audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setSeconds(0);
      setAudioBlob(null);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
      setAudioUrl(null);

      const preferredTypes=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"];
      const mimeType=preferredTypes.find(type=>MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream,{mimeType}) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm"
        });
        setAudioBlob(blob);
        const nextUrl=URL.createObjectURL(blob);
        audioUrlRef.current=nextUrl;
        setAudioUrl(nextUrl);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current=null;
      };

      recorder.start();
      setRecording(true);
    } catch {
      setStatus("Accès au micro refusé. Vérifie les autorisations du navigateur.");
    }
  }

  function stopRecording() {
    if(recorderRef.current?.state==="recording")recorderRef.current.stop();
    setRecording(false);
  }

  function resetRecording() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current=null;
    setAudioUrl(null);
    setAudioBlob(null);
    setSeconds(0);
    setStatus("");
  }

  async function sendRecording() {
    if(sending)return;
    if (!name.trim()) {
      setStatus("Indique ton prénom ou ton pseudo.");
      return;
    }
    if (!audioBlob) {
      setStatus("Enregistre d'abord ton message.");
      return;
    }
    if (!accessCode.trim()) {
      setStatus("Indique le code d’accès associé à ton nom.");
      return;
    }

    setSending(true);setStatus("Envoi en cours…");
    try {
      const type=audioBlob.type.toLowerCase();const extension=type.includes("mp4")?"m4a":type.includes("ogg")?"ogg":type.includes("mpeg")?"mp3":"webm";
      const data=new FormData(); data.set("file",audioBlob,`message.${extension}`); data.set("guestName",name.trim()); data.set("accessCode",accessCode.trim()); data.set("duration",String(seconds));
      const response=await fetch("/api/media/audio",{method:"POST",body:data}); if(!response.ok){const result=await response.json().catch(()=>({error:"upload"}));if(result.error==="site_access_expired"){localStorage.removeItem("simon_access_granted");location.reload();return}if(result.error==="guest_not_found")throw new Error("guest");if(result.error==="code_not_assigned")throw new Error("unassigned");if(result.error==="invalid_guest_code")throw new Error("code");if(result.error==="file_too_large")throw new Error("size");if(result.error==="invalid_type")throw new Error("type");throw new Error("upload")}

      if(audioUrlRef.current)URL.revokeObjectURL(audioUrlRef.current);audioUrlRef.current=null;setAudioUrl(null);setAudioBlob(null);setSeconds(0);setAccessCode("");setStatus("Merci ! Ton message a rejoint les archives de Simon.");
    } catch(error) {
      const reason=error instanceof Error?error.message:"upload";setStatus(reason==="guest"?"Ce nom ne figure pas dans la liste des invités. Utilise exactement le nom enregistré.":reason==="unassigned"?"Aucun code n’a encore été attribué à ce nom. Demande-le à Simon.":reason==="code"?"Le code d’accès ne correspond pas à ce nom.":reason==="size"?"Le message audio est trop volumineux.":reason==="type"?"Ce format audio n’est pas accepté par le site.":"L'envoi a échoué. Réessaie dans quelques instants.");
    } finally { setSending(false); }
  }

  const displayTime = `00:${String(seconds).padStart(2, "0")} / 00:30`;

  return (
    <section className="recorder-panel">
      <div className="panel-rivets" />
      <div className="recorder-heading">
        <p className="kicker">Livre d'or audio</p>
        <h2>Laisse ta trace dans l'histoire</h2>
      </div>

      <label className="field-label" htmlFor="guestName">Choisis ton nom</label>
      <select id="guestName" className="retro-input" value={name} onChange={(event)=>setName(event.target.value)}><option value="">Sélectionne ton nom</option>{players.map(player=><option key={player.id} value={player.name}>{player.name}</option>)}</select>
      <label className="field-label" htmlFor="audioAccessCode">Ton code d’accès personnel</label>
      <input id="audioAccessCode" className="retro-input" type="password" value={accessCode} onChange={(event)=>setAccessCode(event.target.value)} placeholder="Code donné par Simon" maxLength={40} autoComplete="one-time-code" />
      <p className="field-help">Utilise le code personnel associé au nom sélectionné. Ton message restera privé.</p>

      <div className="cassette-recorder">
        <div className="cassette-window">
          <span className="reel" />
          <div className={`equalizer ${recording ? "active" : ""}`}>
            {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
          </div>
          <span className="reel" />
        </div>
        <div className="digital-timer">{displayTime}</div>
      </div>

      <div className="record-actions">
        {!recording ? (
          <motion.button whileTap={{ scale: .96 }} className="retro-button record" onClick={startRecording} disabled={sending}>
            ● Enregistrer
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: .96 }} className="retro-button stop" onClick={stopRecording}>
            ■ Arrêter
          </motion.button>
        )}
        <button className="retro-button ghost" onClick={resetRecording} disabled={!audioBlob||sending}>
          ↻ Recommencer
        </button>
      </div>

      {audioUrl && (
        <div className="audio-preview">
          <audio src={audioUrl} controls />
        </div>
      )}

      <button className="send-button" onClick={sendRecording} disabled={!audioBlob||sending}>
        {sending ? "Envoi en cours…" : "✦ Envoyer à Simon"}
      </button>

      {status && <p className="status-message">{status}</p>}
      <p className="recording-limit">Durée maximale : 30 secondes.</p>
    </section>
  );
}

