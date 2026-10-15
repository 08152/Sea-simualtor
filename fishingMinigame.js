window.FS = window.FS || {};
FS.FishingMinigame = {
  active:false,marker:null,phase:null,phaseTime:0,elapsed:0,ring:null,callbacks:null,
  init(){this.ring=document.getElementById("timing-ring");},
  start(marker,onResult){
    this.active=true;this.marker=marker;this.elapsed=0;this.phase="red";this.phaseTime=0;this.callbacks=onResult;
    if(marker)marker.status="timing";
    document.getElementById("fishing-overlay").classList.remove("hidden");
    document.getElementById("crosshair").classList.add("hidden");
    document.getElementById("fishing-subtitle").textContent="Klicke im richtigen Moment.";
    this.updateRing();
  },
  update(dt){
    if(!this.active)return;
    this.elapsed+=dt;this.phaseTime+=dt;
    // Tight timing windows; ring contracts continuously and changes from red to gold, green, then blue.
    if(this.phase==="red"&&this.phaseTime>.85){this.phase="yellow";this.phaseTime=0;}
    else if(this.phase==="yellow"&&this.phaseTime>.75){this.phase="green";this.phaseTime=0;}
    else if(this.phase==="green"&&this.phaseTime>.48){this.phase="blue";this.phaseTime=0;}
    else if(this.phase==="blue"&&this.phaseTime>.19){this.finish("miss");return;}
    this.updateRing();
  },
  updateRing(){
    if(!this.ring)return;
    let size=168;
    if(this.phase==="red")size=168-this.phaseTime*18;
    else if(this.phase==="yellow")size=152-this.phaseTime*50;
    else if(this.phase==="green")size=114-this.phaseTime*120;
    else size=56-this.phaseTime*105;
    const s=Math.max(34,size);
    this.ring.style.setProperty("--ring-size",`${s}px`);
    this.ring.className="timing-ring "+this.phase;
    document.getElementById("fishing-subtitle").textContent=({red:"Zu früh …",yellow:"Jetzt könnte es klappen!",green:"Sehr gut!",blue:"PERFEKT!"})[this.phase];
  },
  click(){
    if(!this.active)return false;
    const phase=this.phase;
    if(phase==="red"){FS.Audio.fail();this.finish("miss");}
    else if(phase==="yellow"){FS.Audio.click();this.finish("catch",0);}
    else if(phase==="green"){FS.Audio.success();this.finish("catch",5);}
    else {FS.Audio.bell();this.finish("catch",10);}
    return true;
  },
  finish(result,points=0){
    if(!this.active)return;
    const cb=this.callbacks;this.active=false;this.callbacks=null;
    document.getElementById("fishing-overlay").classList.add("hidden");
    if(FS.State.mode==="fishing")document.getElementById("crosshair").classList.remove("hidden");
    if(cb)cb(result,points);
  },
  cancel(){if(this.active)this.finish("cancel");}
};
