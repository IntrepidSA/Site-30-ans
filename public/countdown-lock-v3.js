(() => {
  const lockStyle = document.createElement("style");
  lockStyle.textContent = ".side-nav a.locked-link,.side-nav a.locked-link:hover,.side-nav a.locked-link:active{opacity:.28!important;filter:blur(3px) grayscale(.8)!important;animation:none!important;cursor:pointer!important}";
  document.head.appendChild(lockStyle);
  const protectedPaths = ["/livre-or", "/photos", "/jeux"];
  let unlockAt = "2026-12-06T23:00:00.000Z";
  let isAdmin = false;
  let ticker = null;

  const normalizedPath = () => location.pathname === "/" ? "/" : location.pathname.replace(/\/+$/, "");
  const remainingValues = target => {
    const total = Math.max(0, new Date(target).getTime() - Date.now());
    return [Math.floor(total / 86400000), Math.floor(total / 3600000) % 24, Math.floor(total / 60000) % 60, Math.floor(total / 1000) % 60];
  };
  const remainingMarkup = target => `<div class="countdown-grid">${remainingValues(target).map((value,index) => `<div><strong>${String(value).padStart(2,"0")}</strong><span>${["Jours","Heures","Minutes","Secondes"][index]}</span></div>`).join("")}</div>`;
  const updateRemaining = (container, target) => {
    const values = remainingValues(target);
    container.querySelectorAll(".countdown-grid strong").forEach((node,index) => { node.textContent = String(values[index]).padStart(2,"0"); });
  };
  const render = () => {
    const pending = Boolean(unlockAt && new Date(unlockAt).getTime() > Date.now());
    const contentLocked = pending && !isAdmin;
    document.querySelectorAll(".side-nav a").forEach(link => link.classList.toggle("locked-link", pending && protectedPaths.includes(new URL(link.href).pathname.replace(/\/+$/, ""))));
    const existingCountdown = document.querySelector(".home-countdown");
    if (pending && normalizedPath() === "/" && existingCountdown) {
      updateRemaining(existingCountdown, unlockAt);
      document.documentElement.classList.remove("lock-preflight");
      return;
    }
    const existingScreen = document.querySelector(".locked-screen");
    if (contentLocked && protectedPaths.includes(normalizedPath()) && existingScreen) {
      updateRemaining(existingScreen, unlockAt);
      document.documentElement.classList.remove("lock-preflight");
      return;
    }
    document.querySelector(".home-countdown")?.remove();
    document.querySelector(".locked-screen")?.remove();
    if (pending && normalizedPath() === "/") {
      const countdown = document.createElement("section");
      countdown.className = "home-countdown";
      countdown.innerHTML = `<p>Ouverture des archives dans</p>${remainingMarkup(unlockAt)}`;
      document.body.append(countdown);
    }
    if (contentLocked && protectedPaths.includes(normalizedPath())) {
      const screen = document.createElement("div");
      screen.className = "locked-screen";
      screen.innerHTML = `<div><span>ACCESS LOCKED</span><h1>Cette archive est encore classée secrète</h1>${remainingMarkup(unlockAt)}<p>La section se déverrouillera automatiquement à la fin du compte à rebours.</p></div>`;
      document.body.append(screen);
    }
    document.documentElement.classList.remove("lock-preflight");
  };

  const load = async () => {
    try {
      const [settings, admin] = await Promise.all([fetch("/api/event-settings",{cache:"no-store"}), fetch("/api/admin/status",{cache:"no-store"})]);
      if (settings.ok) unlockAt = (await settings.json()).unlockAt || unlockAt;
      if (admin.ok) isAdmin = Boolean((await admin.json()).admin);
    } catch {}
    render();
    clearInterval(ticker); ticker = setInterval(render, 1000);
  };

  const installAdminSettings = async () => {
    const page = document.querySelector(".admin-page");
    if (!page || page.querySelector(".admin-tabs")) return;
    isAdmin = true; render();
    const response = await fetch("/api/admin/settings",{cache:"no-store"});
    const current = response.ok ? await response.json() : {unlockAt:null};
    let localValue = "";
    if (current.unlockAt) { const date = new Date(current.unlockAt); date.setMinutes(date.getMinutes()-date.getTimezoneOffset()); localValue=date.toISOString().slice(0,16); }
    const sections = [...page.querySelectorAll(":scope > section")];
    const tabs = document.createElement("nav"); tabs.className="admin-tabs";
    tabs.innerHTML='<button class="active">Archives</button><button>⚙ Paramètres</button>';
    const panel = document.createElement("section"); panel.className="admin-settings"; panel.hidden=true;
    panel.innerHTML=`<p class="kicker">Déverrouillage du site</p><h2>Compte à rebours</h2><p>Choisis la date et l’heure auxquelles Livre d’or, Photos et Jeux deviendront accessibles.</p><form><label for="unlock-at">Date et heure de déverrouillage</label><input id="unlock-at" type="datetime-local" value="${localValue}"><button>Enregistrer les paramètres</button></form><button class="disable-lock" type="button">Retirer le compte à rebours</button><p class="form-status"></p>`;
    page.querySelector("h1")?.after(tabs); tabs.after(panel);
    const buttons=tabs.querySelectorAll("button");
    buttons[0].onclick=()=>{buttons[0].classList.add("active");buttons[1].classList.remove("active");panel.hidden=true;sections.forEach(s=>s.hidden=false)};
    buttons[1].onclick=()=>{buttons[1].classList.add("active");buttons[0].classList.remove("active");panel.hidden=false;sections.forEach(s=>s.hidden=true)};
    const save = async value => { const status=panel.querySelector(".form-status");status.textContent="Enregistrement…";const result=await fetch("/api/admin/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({unlockAt:value})});status.textContent=result.ok?"Paramètres enregistrés.":"Impossible d’enregistrer.";if(result.ok){unlockAt=value;render()}};
    panel.querySelector("form").onsubmit=event=>{event.preventDefault();const value=panel.querySelector("input").value;save(value?new Date(value).toISOString():null)};
    panel.querySelector(".disable-lock").onclick=()=>{panel.querySelector("input").value="";save(null)};
  };

  new MutationObserver(installAdminSettings).observe(document.documentElement,{childList:true,subtree:true});
  load(); installAdminSettings();
})();

