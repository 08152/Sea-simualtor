window.FS = window.FS || {};
FS.Interaction = {
  objects:[],raycaster:new THREE.Raycaster(),center:new THREE.Vector2(0,0),current:null,lastScan:0,
  register(obj){if(obj&&!this.objects.includes(obj))this.objects.push(obj);},
  unregisterAll(){this.objects=[];},
  scan(){
    if(!FS.World.camera||FS.State.mode!=="free"||FS.State.isPiloting||FS.FishingMinigame.active)return;
    this.raycaster.setFromCamera(this.center,FS.World.camera);
    const hits=this.raycaster.intersectObjects(this.objects,true);
    this.current=null;
    for(const h of hits){
      let obj=h.object;
      while(obj&&!obj.userData.interact)obj=obj.parent;
      if(obj&&obj.userData.interact){this.current={object:obj,kind:obj.userData.interact.kind,label:obj.userData.interact.label,distance:h.distance};break;}
    }
    if(this.current&&this.current.distance>FS.CFG.interactDistance)this.current=null;
    FS.State.currentTarget=this.current;
    const el=document.getElementById("target-prompt");
    if(this.current){
      let label=this.current.label;
      if(this.current.kind==="buoy"&&!FS.State.hasBait)label="Boje bereit – im Hafen Köder kaufen";
      if(this.current.kind==="crane"&&FS.Fishing.status==="waiting")label=`Warten: ${Math.ceil(FS.Fishing.waitLeft)} s`;
      if(this.current.kind==="crane"&&FS.Fishing.status==="idle")label="Erst die Boje auswerfen";
      el.innerHTML=`<strong>E</strong>${label}`;el.classList.remove("hidden");
    }else el.classList.add("hidden");
  },
  use(){
    if(FS.State.mode==="harbor"){return;}
    if(FS.State.mode!=="free")return;
    if(FS.State.isPiloting && FS.Harbor.canDock()){FS.Harbor.open();return;}
    if(FS.State.isPiloting){FS.State.isPiloting=false;FS.CameraRig.restore();FS.toast("Du verlässt das Steuer.");return;}
    if(FS.Harbor.canDock()){FS.Harbor.open();return;}
    const target=this.current;
    if(!target){FS.toast("Sieh ein Objekt mit dem Punkt in der Mitte an, um damit zu interagieren.",2.2);return;}
    switch(target.kind){
      case "door": FS.Boat.toggleDoor();break;
      case "helm":
        if(!FS.Boat.doorOpen){FS.toast("Öffne zuerst die Kajütentür.");break;}
        FS.State.isPiloting=true;FS.Input.driveThrottle=0;FS.Input.turn=0;FS.CameraRig.followHelm();
        FS.toast("Steuer übernommen. W/S fahren, A/D lenken. E verlässt das Steuer.",3);
        FS.setMission("Steuere dein Boot zum lila Anlegebereich. E legt im Hafen an.");
        break;
      case "buoy":
        if(!FS.State.hasBait){FS.toast("Die Boje hat keinen Köder. Kaufe einen im Hafen für 500 Credits.");break;}
        if(FS.Fishing.status!=="idle"){FS.toast("Die Boje ist bereits im Einsatz.");break;}
        FS.Fishing.beginCast();break;
      case "crane":
        if(FS.Fishing.status==="ready")FS.Fishing.beginReel();
        else if(FS.Fishing.status==="waiting")FS.toast(`Noch ${Math.ceil(FS.Fishing.waitLeft)} Sekunden warten.`);
        else if(FS.Fishing.status==="idle")FS.toast("Wirf zuerst die Boje aus.");
        else FS.toast("Das Netz wird bereits eingeholt.");
        break;
      case "table":
        if(FS.State.fish.some(f=>!f.processed))FS.Processing.start();
        else FS.toast("Der Tisch ist bereit. Fang zuerst Fische oder fahre zum Hafen.");
        break;
      case "box":FS.toast(`In der Kiste liegen ${FS.State.fish.length} Fische.`);break;
      default:FS.toast("Hier gibt es gerade nichts zu tun.");
    }
  }
};
