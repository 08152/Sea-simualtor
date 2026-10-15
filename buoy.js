window.FS = window.FS || {};
FS.Buoy = {
  group:null,visible:false,dropping:false,elapsed:0,start:null,end:null,dropDuration:1.05,
  init(){
    this.group=new THREE.Group();this.group.visible=false;
    const orange=FS.Models.textured("rust",0xff9d38,{roughness:.42});
    const white=FS.Models.mat(0xf3eee0,{roughness:.52});
    const shell=new THREE.Mesh(new THREE.SphereGeometry(.28,14,10),orange);shell.scale.set(1,1.18,1);this.group.add(shell);
    const band=new THREE.Mesh(new THREE.TorusGeometry(.24,.035,6,14),white);band.position.y=.05;this.group.add(band);
    const cap=FS.Models.cylinder(.08,.1,.16,8,white,0,.31,0);this.group.add(cap);
    this.group.add(FS.Models.cylinder(.035,.035,.24,7,FS.Models.mat(0x414e50),0,.48,0));
    FS.World.scene.add(this.group);
  },
  deploy(){
    if(!this.group)this.init();
    this.start=FS.Boat.getWorldPoint(new THREE.Vector3(-1.22,1.42,-.62));
    const crane=FS.Boat.getWorldPoint(new THREE.Vector3(2.12,2.35,-.42));
    const offset=new THREE.Vector3(4.3,-1.9,.65).applyAxisAngle(new THREE.Vector3(0,1,0),FS.Boat.group.rotation.y);
    this.end=crane.add(offset);this.end.y=.62;
    this.group.position.copy(this.start);this.group.visible=true;this.visible=true;this.dropping=true;this.elapsed=0;
  },
  retrieve(){
    if(this.group)this.group.visible=false;this.visible=false;this.dropping=false;
  },
  update(dt,time){
    if(!this.group||!this.visible)return;
    if(this.dropping){
      this.elapsed+=dt;const t=Math.min(1,this.elapsed/this.dropDuration);
      this.group.position.lerpVectors(this.start,this.end,t);
      this.group.position.y=this.start.y+(this.end.y-this.start.y)*t+Math.sin(t*Math.PI)*1.65;
      this.group.rotation.z=Math.sin(t*Math.PI*2)*.17;
      if(t>=1){this.dropping=false;FS.Audio.splash();}
    }else{
      this.group.position.copy(this.end);
      this.group.position.y=.62+Math.sin(time*2.4)*.15+Math.cos(time*1.1)*.04;
      this.group.rotation.z=Math.sin(time*1.8)*.09;
      this.group.rotation.x=Math.sin(time*1.3)*.06;
    }
  }
};
