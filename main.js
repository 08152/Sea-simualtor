window.FS = window.FS || {};
FS.Game = {
  lastTime:0,startedOnce:false,animId:0,
  boot(){
    const loading=document.getElementById("loading-screen");
    const saved=FS.SaveSystem.load();
    if(saved){FS.SaveSystem.apply(saved);document.getElementById("player-name").value=FS.State.name;document.getElementById("start-button").textContent="WEITERFAHREN →";document.getElementById("new-game-button").classList.remove("hidden");}
    document.getElementById("start-button").addEventListener("click",()=>{});
    FS.HUD.init();FS.Input.init();FS.Processing.init();FS.FishingMinigame.init();FS.Harbor.bindUI();
    try{
      FS.World.init();FS.State.gameBuilt=true;
      FS.CameraRig.init(FS.World.camera);
      FS.Interaction.register(FS.Boat.door);FS.Interaction.register(FS.Boat.helm);FS.Interaction.register(FS.Boat.crane);
      FS.Interaction.register(FS.Boat.buoy);FS.Interaction.register(FS.Boat.table);FS.Interaction.register(FS.Boat.box);
      FS.World.renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();FS.toast("Grafik-Verbindung unterbrochen. Lade die Seite neu.",5);});
      loading.classList.add("hidden");document.getElementById("menu-screen").classList.remove("hidden");
    }catch(err){
      loading.querySelector("#loading-text").textContent="Die 3D-Grafik konnte nicht gestartet werden. Öffne das Spiel mit Internetverbindung und lade neu.";
      console.error(err);
    }
    this.animate();
  },
  start(){
    const name=document.getElementById("player-name").value.trim().slice(0,18)||"Kapitän";
    const saved=FS.SaveSystem.load();
    if(saved && !FS.State.started){FS.SaveSystem.apply(saved);}
    else {FS.State.name=name;}
    FS.State.name=name||FS.State.name;
    FS.State.started=true;
    document.getElementById("menu-screen").classList.add("hidden");
    FS.setMode("free");
    FS.CameraRig.setForWalk();
    FS.HUD.update();FS.HUD.syncMode();
    FS.toast(`Willkommen an Bord, ${FS.State.name}.`,2.7);
    FS.setMission("Gehe zur Kajüte, öffne die Tür und übernimm das Steuer.");
    FS.SaveSystem.save();
    if(FS.World.renderer?.domElement)FS.World.renderer.domElement.requestPointerLock?.();
  },
  newGame(){
    const name=document.getElementById("player-name").value.trim().slice(0,18)||"Kapitän";
    FS.State.name=name;FS.State.credits=0;FS.State.fish=[];FS.State.hasBait=true;FS.State.buoyOnDeck=true;FS.State.mapSeed=FS.CFG.worldSeed;
    if(FS.Boat){FS.Boat.clearCrateFish();FS.Boat.setBuoyOnDeck(true);FS.Boat.group.position.set(0,0,0);FS.Boat.group.rotation.set(0,0,0);}
    if(FS.Rope)FS.Rope.hide();FS.Fishing.status="idle";
    FS.SaveSystem.save();this.start();
  },
  goHome(){
    if(FS.State.mode==="menu")return;
    if(FS.State.mode==="fishing"){FS.FishingMinigame.cancel();FS.Rope.hide();FS.Buoy.retrieve();FS.Fishing.status="idle";FS.Boat.setBuoyOnDeck(true);}
    if(FS.State.mode==="cutting"){FS.Processing.active=false;document.getElementById("cutting-overlay").classList.add("hidden");FS.CameraRig.restore();}
    if(FS.State.mode==="harbor")document.getElementById("harbor-overlay").classList.add("hidden");
    document.exitPointerLock?.();
    FS.State.isPiloting=false;FS.setMode("menu");
    document.getElementById("menu-screen").classList.remove("hidden");
    document.getElementById("crosshair").classList.add("hidden");
    document.getElementById("start-button").innerHTML="WEITERFAHREN <span>→</span>";
    document.getElementById("new-game-button").classList.remove("hidden");
    FS.SaveSystem.save();
  },
  animate(){
    this.animId=requestAnimationFrame(()=>this.animate());
    if(!FS.World.scene)return;
    const dt=Math.min(.05,FS.World.clock.getDelta());this.lastTime+=dt;
    if(FS.State.mode==="free")FS.Input.update(dt);
    FS.World.update(dt,this.lastTime);
    if(FS.State.mode==="free"&&!FS.State.isPiloting){FS.Interaction.scan();}
    if(FS.State.mode==="free"&&FS.State.isPiloting&&FS.Harbor.canDock())FS.HUD.setBoatStatus("LILA ZONE · E ANLEGEN");
    if(FS.State.mode==="fishing")FS.FishingMinigame.update(dt);
    FS.HUD.update();FS.HUD.toastTick();
    FS.World.render();
  }
};
window.addEventListener("load",()=>FS.Game.boot());
