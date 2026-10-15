window.FS = window.FS || {};
FS.CameraRig = {
  camera:null,yaw:0,pitch:-.06,normalYaw:0,normalPitch:-.06,topDown:false,topTarget:null,
  init(camera){
    this.camera=camera;this.yaw=0;this.pitch=-.06;
    camera.position.set(0,2.88,.45);camera.rotation.order="YXZ";this.applyRotation();
  },
  applyRotation(){if(!this.camera)return;this.camera.rotation.order="YXZ";this.camera.rotation.y=this.yaw;this.camera.rotation.x=this.pitch;this.camera.rotation.z=0;},
  rotate(dx,dy){
    if(FS.State.mode!=="free"||this.topDown)return;
    this.yaw-=dx*.0021;this.pitch-=dy*.0021;this.pitch=Math.max(-1.25,Math.min(1.12,this.pitch));this.applyRotation();
  },
  setForWalk(){
    this.topDown=false;FS.State.isPiloting=false;
    this.camera.position.copy(FS.Boat.getWorldPoint(new THREE.Vector3(0,2.88,.45)));
    this.yaw=FS.Boat.group.rotation.y;this.pitch=-.06;this.applyRotation();
  },
  followHelm(){
    if(!FS.State.isPiloting)return;
    const pos=FS.Boat.getWorldPoint(new THREE.Vector3(0,2.85,-2.42));
    this.camera.position.copy(pos);
    this.yaw=FS.Boat.group.rotation.y;this.pitch=-.025;this.applyRotation();
  },
  moveWalk(dx,dz){
    if(!this.camera||FS.State.mode!=="free"||FS.State.isPiloting)return;
    const local=FS.Boat.group.worldToLocal(this.camera.position.clone());
    const forward=new THREE.Vector3(Math.sin(this.yaw-FS.Boat.group.rotation.y),0,-Math.cos(this.yaw-FS.Boat.group.rotation.y));
    const right=new THREE.Vector3(Math.cos(this.yaw-FS.Boat.group.rotation.y),0,Math.sin(this.yaw-FS.Boat.group.rotation.y));
    const next=local.clone().addScaledVector(forward,dz).addScaledVector(right,dx);
    next.y=2.88;
    if(FS.Boat.inBounds(next)){this.camera.position.copy(FS.Boat.group.localToWorld(next));}
  },
  showCutView(){
    this.topDown=true;
    const target=FS.Boat.getWorldPoint(new THREE.Vector3(-1.15,2.0,.12));
    this.camera.position.set(target.x,target.y+4.5,target.z);
    this.camera.lookAt(target.x,target.y,target.z);
  },
  restore(){
    this.topDown=false;
    if(FS.State.isPiloting)this.followHelm();
    else {
      const local=new THREE.Vector3(0,2.88,.45);
      this.camera.position.copy(FS.Boat.getWorldPoint(local));
      this.yaw=FS.Boat.group.rotation.y;this.pitch=-.06;this.applyRotation();
    }
  },
  update(){if(this.topDown)return;if(FS.State.isPiloting)this.followHelm();}
};
