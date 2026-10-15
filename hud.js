window.FS = window.FS || {};
FS.HUD = {
  init(){
    document.getElementById("start-button").addEventListener("click",()=>{FS.Audio.click();FS.Game.start();});
    document.getElementById("new-game-button").addEventListener("click",()=>{FS.Audio.click();FS.Game.newGame();});
    this.syncMode();this.update();
  },
  update(){
    const s=FS.State;
    document.getElementById("hud-name").textContent=s.name||"Kapitän";
    document.getElementById("hud-credits").textContent=String(s.credits);
    if(FS.Harbor?.activePort)FS.Harbor.refreshPanel();
  },
  setBoatStatus(text){const el=document.getElementById("boat-status");if(el)el.textContent=text;},
  syncMode(){
    const mode=FS.State.mode;
    const inGame=mode!=="menu";
    document.getElementById("game-ui").classList.toggle("hidden",!inGame);
    document.getElementById("crosshair").classList.toggle("hidden",mode==="menu"||mode==="cutting"||mode==="harbor"||mode==="fishing");
    if(mode!=="fishing")document.getElementById("fishing-overlay").classList.add("hidden");
    if(mode!=="cutting")document.getElementById("cutting-overlay").classList.add("hidden");
    if(mode!=="harbor")document.getElementById("harbor-overlay").classList.add("hidden");
    const prompts={
      free:"WASD Gehen · Maus Umschauen · E Interagieren · ESC Menü",
      fishing:"Linksklick im gelben, grünen oder blauen Ring",
      cutting:"Maus gedrückt halten und die Linie nachzeichnen",
      harbor:"Verkaufe deinen Fang oder kaufe Köder"
    };
    document.getElementById("help-bar").innerHTML=(prompts[mode]||"ESC Menü");
    if(mode==="free")this.setBoatStatus(FS.State.isPiloting?"STEUER · BEREIT":"BOOT · LEERLAUF");
  },
  toastTick(){
    const el=document.getElementById("toast");
    if(el&&FS.State.toastUntil&&performance.now()>FS.State.toastUntil){el.classList.add("hidden");FS.State.toastUntil=0;}
  }
};
