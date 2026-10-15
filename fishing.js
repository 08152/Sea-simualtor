window.FS = window.FS || {};
FS.Fishing = {
  status:"idle",waitLeft:0,processed:0,activeIndex:0,markers:[],pendingResult:null,hand:null,miniStarted:false,
  beginCast(){
    if(!FS.State.hasBait){FS.toast("Du brauchst einen neuen Köder aus dem Hafen.");return;}
    if(!FS.State.buoyOnDeck){FS.toast("Die Boje ist gerade draußen.");return;}
    FS.State.hasBait=false;FS.Boat.setBuoyOnDeck(false);
    this.status="waiting";this.waitLeft=FS.CFG.waitSeconds;
    FS.Buoy.deploy();FS.Rope.deploy();FS.SaveSystem?.save();FS.Audio.splash();
    FS.setMission("Die Boje ist draußen. Warte auf den Fang und behalte den Kran im Blick.");
    FS.toast("Boje ausgeworfen. Die Fische brauchen etwas Zeit.");
    FS.HUD.update();
  },
  canReel(){
    if(this.status!=="ready")return false;
    const crane=FS.Boat.getWorldPoint(new THREE.Vector3(1.55,1.75,-.42));
    return FS.CameraRig.camera.position.distanceTo(crane)<FS.CFG.interactDistance+3.5;
  },
  beginReel(){
    if(this.status!=="ready"){if(this.status==="waiting")FS.toast(`Noch ${Math.ceil(this.waitLeft)} Sekunden warten.`);return;}
    if(!FS.Rope.active){FS.toast("Die Leine ist nicht draußen.");return;}
    this.status="reeling";this.processed=0;this.activeIndex=0;
    FS.setMode("fishing");FS.State.isPiloting=false;
    document.exitPointerLock?.();
    FS.Rope.spawnMarkers(FS.CFG.catchMarkers);
    FS.Rope.markers.forEach((m,i)=>{m.progress=.02;m.status=i===0?"moving":"queued";m.mesh.visible=i===0;});
    this.miniStarted=false;
    this.startNextMarker();
    FS.setMission("Hol die gelben Markierungen ein. Mit Linksklick erwischst du den Fang.");
  },
  startNextMarker(){
    if(this.activeIndex>=FS.Rope.markers.length){this.finishReel();return;}
    const marker=FS.Rope.markers[this.activeIndex];
    marker.mesh.visible=true;marker.status="moving";
    this.pendingResult=null;this.miniStarted=false;
    if(marker.progress>=.88)this.startTiming(marker);
  },
  startTiming(marker){
    if(this.miniStarted||this.activeIndex>=FS.Rope.markers.length)return;
    this.miniStarted=true;
    FS.FishingMinigame.start(marker,(result,points)=>{this.miniStarted=false;this.resolveMarker(marker,result,points);});
  },
  resolveMarker(marker,result,points){
    if(result==="catch"){
      const species=FS.Fish.randomSpecies();
      const fish=FS.Economy.addFish(species,points);
      marker.status="caught";marker.fish=fish;
      this.animateCatch(marker,species,fish);
    }else{
      marker.status="missed";FS.Rope.cleanupMarker(marker);this.processed++;this.activeIndex++;
      setTimeout(()=>this.startNextMarker(),350);
    }
  },
  animateCatch(marker,species,fish){
    // Pause hauling, turn the marker into a lively stylised fish, and move it to the aft box.
    const fishModel=FS.Fish.build(species,.72);FS.Hand.attachTo(fishModel);FS.World.scene.add(fishModel);
    fishModel.position.copy(marker.mesh.position);FS.Rope.cleanupMarker(marker);
    const start=fishModel.position.clone();
    const end=FS.Boat.getWorldPoint(new THREE.Vector3(0,1.75,2.1));
    const began=performance.now();const duration=1750;
    const step=()=>{
      const t=Math.min(1,(performance.now()-began)/duration);
      fishModel.position.lerpVectors(start,end,t);
      fishModel.position.y+=Math.sin(t*Math.PI)*1.1;
      fishModel.rotation.z=Math.sin(t*20)*.2;
      FS.Fish.animate(fishModel,performance.now()/1000,.12);
      if(t<1)requestAnimationFrame(step);
      else{
        FS.World.scene.remove(fishModel);
        FS.Boat.fishMeshes.forEach(m=>{m.position.y+=.01;});
        marker.status="caught";this.processed++;this.activeIndex++;
        FS.toast(`${species.name} gefangen! +${points} Fangpunkte`,1.8);
        setTimeout(()=>this.startNextMarker(),380);
      }
    };step();
  },
  finishReel(){
    FS.FishingMinigame.cancel();FS.Rope.hide();FS.Buoy.retrieve();
    FS.Boat.setBuoyOnDeck(true);
    this.status="idle";this.waitLeft=0;
    FS.setMode("free");FS.CameraRig.restore();
    FS.setMission(FS.State.fish.some(f=>!f.processed)?"Geh zum Metalltisch, um deine Fische zu verarbeiten.":"Geh zum Steuer und fahre zu einem Hafen, um Fische zu verkaufen.");
    FS.toast("Einholen abgeschlossen. Die Boje liegt wieder am Tisch.");
    FS.HUD.syncMode();FS.HUD.update();FS.SaveSystem?.save();
  },
  update(dt,time){
    if(this.status==="waiting"){
      this.waitLeft-=dt;
      if(this.waitLeft<=0){this.waitLeft=0;this.status="ready";FS.Audio.bell();FS.toast("Es könnte ein Fang dran sein! Sieh zum Kran und drücke E.");FS.setMission("Der Fang ist bereit. Schau zum Kran und drücke E.");}
      else if(Math.floor(this.waitLeft)!==Math.floor(this.waitLeft+dt))FS.HUD.setBoatStatus(`BOJE DRAUSSEN · ${Math.ceil(this.waitLeft)} S`);
    } else if(this.status==="reeling"){
      const moving=FS.Rope.markers[this.activeIndex];
      if(moving && moving.status==="moving" && !this.miniStarted)moving.progress=Math.min(.96,moving.progress+dt*.28);
      const current=FS.Rope.markers[this.activeIndex];
      if(current && current.status==="moving" && current.progress>=.88 && !this.miniStarted)this.startTiming(current);
    } else if(this.status==="ready"){
      FS.HUD.setBoatStatus("FANG BEREIT · KRAN");
    } else if(this.status==="waiting"){
      FS.HUD.setBoatStatus(`BOJE DRAUSSEN · ${Math.ceil(this.waitLeft)} S`);
    }
  }
};
