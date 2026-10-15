window.FS = window.FS || {};
FS.World = {
  scene:null,camera:null,renderer:null,clock:null,water:null,waterGeom:null,waterPositions:null,
  ports:[],islands:[],elapsed:0,
  rng(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};},
  init(){
    this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x8fb8c3);
    this.scene.fog=new THREE.FogExp2(0x9ec3c9,.00068);
    this.camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.08,2400);
    this.renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:"low-power",alpha:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,FS.CFG.maxPixelRatio));
    this.renderer.setSize(innerWidth,innerHeight);this.renderer.outputEncoding=THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled=false;
    this.renderer.domElement.id="game-canvas";this.renderer.domElement.tabIndex=0;
    document.getElementById("game-root").appendChild(this.renderer.domElement);
    const hemi=new THREE.HemisphereLight(0xd4f4ff,0x273c35,1.5);this.scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xffedcf,1.45);sun.position.set(-80,130,55);this.scene.add(sun);
    if(!FS.Textures.ready)FS.Textures.init();
    this.makeOcean();this.makeDistantHorizon();
    this.makeMap(FS.State.mapSeed||FS.CFG.worldSeed);
    this.clock=new THREE.Clock();
    window.addEventListener("resize",()=>this.resize());
    FS.Boat.create();
    FS.Buoy.init();
    FS.CameraRig.init(this.camera);
    FS.Rope.init();
    return this;
  },
  makeOcean(){
    const size=FS.CFG.oceanSize, seg=96;
    this.waterGeom=new THREE.PlaneGeometry(size,size,seg,seg);this.waterGeom.rotateX(-Math.PI/2);
    this.waterPositions=this.waterGeom.attributes.position;
    const mat=new THREE.MeshStandardMaterial({color:0x1d8292,roughness:.24,metalness:.18,transparent:false});
    this.water=new THREE.Mesh(this.waterGeom,mat);this.water.position.y=.32;this.scene.add(this.water);
    const horizon=new THREE.Mesh(new THREE.PlaneGeometry(size,220),new THREE.MeshBasicMaterial({color:0x9ec4ce,side:THREE.DoubleSide,transparent:true,opacity:.16}));
    horizon.rotation.x=-Math.PI/2;horizon.position.y=.4;horizon.position.z=-size*.34;this.scene.add(horizon);
    this.water.userData.basePositions=this.waterPositions.array.slice();
  },
  makeDistantHorizon(){
    // Soft, layered sky bands keep the view attractive without costly post-processing.
    const sky=new THREE.Mesh(new THREE.SphereGeometry(1050,20,10),new THREE.MeshBasicMaterial({color:0x9cc8d1,side:THREE.BackSide}));
    sky.position.y=0;this.scene.add(sky);
    const cloudMat=new THREE.MeshBasicMaterial({color:0xe2f4ef,transparent:true,opacity:.42});
    const rand=this.rng(FS.CFG.worldSeed+9);
    for(let i=0;i<22;i++){
      const cl=new THREE.Group();const x=(rand()-.5)*900,z=(rand()-.5)*900;
      for(let j=0;j<4;j++){const s=new THREE.Mesh(new THREE.SphereGeometry(1,7,5),cloudMat);s.scale.set(10+rand()*15,2+rand()*3,5+rand()*8);s.position.set(j*9,0,rand()*4);cl.add(s);}
      cl.position.set(x,55+rand()*30,z);this.scene.add(cl);
    }
  },
  makeTree(parent,x,y,z,scale=1,rand=Math.random){
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12*scale,.2*scale,1.5*scale,6),FS.Models.textured("oldWood",0xffffff));trunk.position.set(x,y+.75*scale,z);parent.add(trunk);
    const greens=[0x2b6651,0x3c765b,0x4b8461];
    for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry((1.05-i*.19)*scale,(1.65-i*.18)*scale,7),FS.Models.mat(greens[(i+Math.floor(rand()*3))%3],{roughness:1}));crown.position.set(x,y+(1.8+i*.45)*scale,z);parent.add(crown);}
  },
  makeHouse(parent,x,z,rand){
    const g=new THREE.Group();parent.add(g);g.position.set(x,0,z);
    const wood=FS.Models.textured("oldWood",0xffffff),rust=FS.Models.textured("rust",0xffffff);
    const w=3+rand()*2,d=2.6+rand()*1.3,h=2.4+rand()*.8;
    g.add(FS.Models.box(w,h,d,wood,0,h/2,0));
    const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.78,1.1,4),FS.Models.mat(0x3e4241));roof.rotation.y=Math.PI/4;roof.position.y=h+.5;g.add(roof);
    const door=FS.Models.box(.68,1.35,.08,rust,0,.68,d/2+.045);g.add(door);
    for(let side of [-1,1]){const win=FS.Models.box(.54,.54,.06,FS.Models.mat(0x4e8994,{emissive:0x123138}),side*w*.28,1.4,d/2+.05);g.add(win);}
    g.rotation.y=rand()*Math.PI;return g;
  },
  makeIsland(x,z,r,rand,port=false,index=0){
    const island=new THREE.Group();island.position.set(x,0,z);this.scene.add(island);this.islands.push(island);
    const sandMat=FS.Models.mat(0x9b9677,{roughness:1});
    const groundMat=FS.Models.textured("grass",0xffffff,{roughness:1});
    const base=new THREE.Mesh(new THREE.CylinderGeometry(r*.76,r,3.2,32,1),sandMat);base.position.y=-.8;base.scale.z=1.2;island.add(base);
    const top=new THREE.Mesh(new THREE.CircleGeometry(r*.76,40),groundMat);top.rotation.x=-Math.PI/2;top.position.y=.82;top.scale.set(1,1.2,1);island.add(top);
    const mounds=Math.min(9,Math.max(3,Math.floor(r/5)));
    for(let i=0;i<mounds;i++){
      const hr=2+rand()*r*.21;const hill=new THREE.Mesh(new THREE.SphereGeometry(hr,8,6),groundMat);
      hill.scale.y=.35+rand()*.25;hill.position.set((rand()-.5)*r*.95,.6+hr*.16,(rand()-.5)*r*1.15);island.add(hill);
    }
    const treeCount=Math.min(8,Math.floor(r*.17)+1);
    for(let i=0;i<treeCount;i++){let a=rand()*Math.PI*2,rr=Math.sqrt(rand())*r*.72;this.makeTree(island,Math.cos(a)*rr,.9,Math.sin(a)*rr,.55+rand()*.75,rand);}
    if(port){
      const dock=new THREE.Group();dock.position.set(r*.78,.15,0);island.add(dock);
      const dockMat=FS.Models.textured("concrete",0xffffff,{roughness:.95});
      dock.add(FS.Models.box(8,.5,26,dockMat,1,.05,0));
      const plank=FS.Models.textured("wood",0xffffff);
      for(let i=0;i<8;i++)dock.add(FS.Models.box(8.2,.12,2.9,plank,1,.36,-10.2+i*2.9));
      for(let i=0;i<5;i++){dock.add(FS.Models.cylinder(.22,.28,2.2,8,FS.Models.textured("rust",0xffffff),-2,.2,-10+i*5));}
      this.makeHouse(island,r*.3,-r*.25,rand);
      this.makeHouse(island,-r*.1,r*.3,rand);
      const zone=new THREE.Mesh(new THREE.BoxGeometry(11,.06,7),new THREE.MeshBasicMaterial({color:0xb579ff,transparent:true,opacity:.18,side:THREE.DoubleSide}));
      zone.position.set(r*.78,.48,-1);dock.add(zone);
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(zone.geometry),new THREE.LineBasicMaterial({color:0xd4a6ff,transparent:true,opacity:.95}));edges.position.copy(zone.position);dock.add(edges);
      this.ports.push({id:index,name:["Nordhafen","Alter Anleger","Fischerbucht","Klippenhafen","Westkai","Sonnenhafen","Leuchtturmkai"][index%7],x:x+r*.78+1,z:z-1,radius:13,island,zone});
    }else if(rand()>.35){this.makeHouse(island,(rand()-.5)*r*.4,(rand()-.5)*r*.4,rand);}
    return island;
  },
  makeMap(seed){
    const rand=this.rng(seed);
    // First small harbour is reachable in a short drive; the rest are scattered over a large ocean map.
    this.makeIsland(0,-112,25,rand,true,0);
    const used=[[0,-112]];
    for(let i=1;i<FS.CFG.islandCount;i++){
      let x,z,attempt=0;
      do{x=(rand()-.5)*960;z=(rand()-.5)*960;attempt++;}while(attempt<80&&used.some(p=>Math.hypot(p[0]-x,p[1]-z)<90));
      used.push([x,z]);const radius=16+rand()*42;
      this.makeIsland(x,z,radius,rand,i<FS.CFG.portCount,i);
    }
    // Small navigation markers near the starter harbour.
    for(const p of this.ports){
      const buoy=new THREE.Mesh(new THREE.SphereGeometry(.55,8,7),FS.Models.mat(0xffb54d,{roughness:.44}));
      buoy.position.set(p.x,.8,p.z+15);this.scene.add(buoy);
      buoy.userData.bobSeed=rand()*10;p.navBuoy=buoy;
    }
  },
  update(dt,time){
    if(!this.scene)return;
    this.elapsed=time;
    const a=this.waterPositions.array,base=this.water.userData.basePositions;
    for(let i=1;i<a.length;i+=3){
      const x=base[i-1],z=base[i+1];
      a[i]=base[i]+Math.sin(x*.035+time*1.2)*.12+Math.cos(z*.042-time*.85)*.09+Math.sin((x+z)*.018+time)*.06;
    }
    this.waterPositions.needsUpdate=true;
    if(Math.floor(time*4)%4===0)this.waterGeom.computeVertexNormals();
    if(this.water.material.uniforms){}
    this.ports.forEach(p=>{if(p.navBuoy)p.navBuoy.position.y=.8+Math.sin(time*2+p.navBuoy.userData.bobSeed)*.18;});
    if(FS.Boat)FS.Boat.update(dt,time);
    if(FS.Buoy)FS.Buoy.update(dt,time);
    if(FS.Rope)FS.Rope.update(dt,time);
    if(FS.Fishing)FS.Fishing.update(dt,time);
    if(FS.Processing)FS.Processing.update(dt,time);
    if(FS.CameraRig)FS.CameraRig.update(dt,time);
    if(FS.Harbor)FS.Harbor.update(dt,time);
  },
  resize(){
    if(!this.camera||!this.renderer)return;
    this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,FS.CFG.maxPixelRatio));this.renderer.setSize(innerWidth,innerHeight);
  },
  render(){if(this.renderer&&this.scene&&this.camera)this.renderer.render(this.scene,this.camera);}
};
