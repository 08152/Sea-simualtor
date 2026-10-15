window.FS = window.FS || {};
FS.Harbor = {
  activePort:null,
  update(){
    if(!FS.World||!FS.World.ports||!FS.Boat||!FS.Boat.group)return;
    const boat=FS.Boat.group.position;
    let nearest=null,dist=Infinity;
    FS.World.ports.forEach(p=>{const d=Math.hypot(boat.x-p.x,boat.z-p.z);if(d<dist){dist=d;nearest=p;}});
    const eligible=nearest&&dist<nearest.radius+5;
    this.nearPort=eligible?nearest:null;this.nearDistance=dist;
    if(FS.State.mode==="free"&&!FS.State.isPiloting&&eligible&&dist<nearest.radius+2){
      FS.HUD.setBoatStatus("HAFEN IN REICHWEITE");
    }
  },
  canDock(){
    return this.nearPort && this.nearDistance<this.nearPort.radius+2;
  },
  open(){
    if(!this.canDock()){FS.toast("Fahre näher an einen lila markierten Anlegebereich.");return;}
    this.activePort=this.nearPort;FS.State.activeHarbor=this.activePort;
    document.exitPointerLock?.();FS.State.isPiloting=false;
    FS.setMode("harbor");document.getElementById("harbor-title").textContent=this.activePort.name;
    document.getElementById("harbor-description").textContent="Angelegt. Verkaufe deinen Fang oder kaufe für 500 Credits einen frischen Köder.";
    this.refreshPanel();document.getElementById("harbor-overlay").classList.remove("hidden");
    document.getElementById("crosshair").classList.add("hidden");FS.Audio.bell();
  },
  refreshPanel(){
    document.getElementById("harbor-fish-count").textContent=FS.State.fish.length;
    document.getElementById("harbor-credits").textContent=FS.State.credits;
    document.getElementById("harbor-bait").textContent=FS.State.hasBait?"Bereit":"Leer";
    const sell=document.getElementById("sell-button");
    sell.textContent=FS.State.fish.length?`FANG VERKAUFEN · ${FS.State.fish.reduce((s,f)=>s+f.value,0)} C`:"FANG VERKAUFEN";
    document.getElementById("bait-button").textContent=FS.State.hasBait?"KÖDER BEREITS AN BORD":"KÖDER KAUFEN · 500 C";
    document.getElementById("bait-button").disabled=FS.State.hasBait;
    document.getElementById("bait-button").style.opacity=FS.State.hasBait?".45":"1";
  },
  leave(){
    document.getElementById("harbor-overlay").classList.add("hidden");
    FS.State.activeHarbor=null;this.activePort=null;FS.setMode("free");FS.HUD.syncMode();FS.CameraRig.restore();
    FS.setMission(FS.State.hasBait?"Zurück aufs Meer: Wirf die Boje aus.":"Du brauchst einen neuen Köder. Lege in einem Hafen an.");
    FS.toast("Du legst wieder ab.");FS.SaveSystem?.save();
  },
  bindUI(){
    document.getElementById("sell-button").addEventListener("click",()=>{FS.Audio.click();FS.Economy.sellAll();});
    document.getElementById("bait-button").addEventListener("click",()=>{FS.Audio.click();FS.Economy.buyBait();});
    document.getElementById("leave-harbor-button").addEventListener("click",()=>{FS.Audio.click();this.leave();});
  }
};
