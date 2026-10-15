window.FS = window.FS || {};
FS.Rope = {
  tube:null,material:null,markers:[],active:false,buoyWorld:null,lastTubeUpdate:0,
  init(){
    this.material=FS.Models.textured("oldWood",0xd9cbb0,{roughness:.95,metalness:0});
    const pts=[];for(let i=0;i<=FS.CFG.ropeSegments;i++)pts.push(new THREE.Vector3(0,.7,-i*.04));
    this.tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),FS.CFG.ropeSegments,.024,5,false),this.material);
    this.tube.visible=false;FS.World.scene.add(this.tube);
  },
  deploy(){
    this.buoyWorld=null;this.active=true;this.tube.visible=true;
    this.buoyWorld=FS.Buoy.end?FS.Buoy.end.clone():FS.Boat.getWorldPoint(new THREE.Vector3(5,.6,.2));
  },
  hide(){
    this.active=false;if(this.tube)this.tube.visible=false;
    this.markers.forEach(m=>FS.World.scene.remove(m.mesh));this.markers=[];
    this.buoyWorld=null;
  },
  point(t,time,offset=0){
    const start=FS.Boat.getWorldPoint(new THREE.Vector3(2.12,2.68,-.42));
    const end=(FS.Buoy.visible&&FS.Buoy.group)?FS.Buoy.group.position:(this.buoyWorld||start.clone().add(new THREE.Vector3(4,-2,1)));
    const p=start.clone().lerp(end,t);
    p.y-=Math.sin(Math.PI*t)*(.35+offset);
    p.x+=Math.sin(t*4+time*.7)*.08*Math.sin(Math.PI*t);
    p.z+=Math.sin(t*3+time*.8)*.06*Math.sin(Math.PI*t);
    return p;
  },
  update(dt,time){
    if(!this.active||!this.tube||time-this.lastTubeUpdate<.045)return;
    this.lastTubeUpdate=time;
    const pts=[];for(let i=0;i<=FS.CFG.ropeSegments;i++)pts.push(this.point(i/FS.CFG.ropeSegments,time,0));
    const curve=new THREE.CatmullRomCurve3(pts);
    const nextGeo=new THREE.TubeGeometry(curve,FS.CFG.ropeSegments,.024,5,false);
    const old=this.tube.geometry;this.tube.geometry=nextGeo;old.dispose();
    this.markers.forEach(m=>{
      if(!m.mesh.visible)return;
      const t=Math.max(0,Math.min(1,m.progress));
      m.mesh.position.copy(this.point(1-t,time,.08));
      m.mesh.rotation.set(time*2+m.seed,time*1.5,Math.sin(time*2+m.seed)*.25);
    });
  },
  spawnMarkers(count){
    this.markers=[];
    for(let i=0;i<count;i++){
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.22),FS.Models.mat(0xffdf28,{emissive:0x332400,roughness:.3}));
      mesh.visible=false;FS.World.scene.add(mesh);
      this.markers.push({mesh,progress:.02,seed:Math.random()*8,status:"queued",fish:null});
    }
  },
  cleanupMarker(m){if(m&&m.mesh){FS.World.scene.remove(m.mesh);m.mesh.visible=false;}}
};
