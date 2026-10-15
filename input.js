window.FS = window.FS || {};
FS.Input = {
  keys:Object.create(null),lastMouse:0,turn:0,driveThrottle:0,locked:false,
  init(){
    document.addEventListener("keydown",e=>{
      const key=e.key.toLowerCase();this.keys[key]=true;
      if(["w","a","s","d"," "].includes(key))e.preventDefault();
      if(e.key==="Escape"){e.preventDefault();FS.Game.goHome();return;}
      if(key==="e"&&!e.repeat)FS.Interaction.use();
      if(key==="f"&&!e.repeat&&!FS.State.isPiloting&&FS.State.mode==="free")FS.toast("Gehe in die Kajüte und schau zum Steuer. Drücke E, um zu fahren.");
      if(key==="enter"&&FS.State.mode==="menu"&&!e.repeat)FS.Game.start();
    });
    document.addEventListener("keyup",e=>{this.keys[e.key.toLowerCase()]=false;});
    document.addEventListener("mousemove",e=>{
      if(document.pointerLockElement===FS.World.renderer?.domElement && FS.State.mode==="free"){
        if(!FS.CameraRig.topDown)FS.CameraRig.rotate(e.movementX||0,e.movementY||0);
      }
    });
    document.addEventListener("pointerlockchange",()=>{this.locked=document.pointerLockElement===FS.World.renderer?.domElement;});
    document.addEventListener("mousedown",e=>{
      if(e.button!==0)return;
      if(FS.State.mode==="fishing"){FS.FishingMinigame.click();return;}
      if(FS.State.mode==="free"&&!this.locked&&!FS.State.isPiloting&&!FS.Processing.active){
        if(FS.World.renderer?.domElement)FS.World.renderer.domElement.requestPointerLock?.();
      }
    });
    const canvas=document.getElementById("game-root");
    canvas.addEventListener("click",e=>{
      if(FS.State.mode==="free"&&!this.locked&&!FS.State.isPiloting&&e.target.id==="game-canvas")FS.World.renderer.domElement.requestPointerLock?.();
    });
    this.driveThrottle=0;
  },
  update(dt){
    this.turn=0;
    if(FS.State.mode!=="free"){this.driveThrottle=0;return;}
    const w=this.keys.w||this.keys.arrowup,s=this.keys.s||this.keys.arrowdown;
    const a=this.keys.a||this.keys.arrowleft,d=this.keys.d||this.keys.arrowright;
    if(FS.State.isPiloting){
      this.driveThrottle=(w?1:0)-(s?1:0);this.turn=(a?1:0)-(d?1:0);
    }else{
      this.driveThrottle=0;this.turn=0;
      const forward=(w?1:0)-(s?1:0),side=(d?1:0)-(a?1:0);
      if(forward||side){
        const len=Math.hypot(forward,side)||1;
        FS.CameraRig.moveWalk(side/len*FS.CFG.movementSpeed*dt,forward/len*FS.CFG.movementSpeed*dt);
      }
    }
  }
};
