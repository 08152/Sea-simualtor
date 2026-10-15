window.FS = window.FS || {};
FS.Boat = {
  group:null, door:null, wheel:null, table:null, box:null, crane:null, helm:null, buoy:null,
  speed:0, throttle:0, fishMeshes:[], doorAngle:0, doorTarget:0, doorOpen:false,
  localInteractables:[],
  create(){
    const g=this.group=new THREE.Group();g.name="playerBoat";FS.World.scene.add(g);
    const hullMat=FS.Models.textured("oldWood",0xb5b2a0,{roughness:.82});
    const deckMat=FS.Models.textured("wood",0xffffff,{roughness:.87});
    const metalMat=FS.Models.textured("rust",0xffffff,{roughness:.75,metalness:.25});
    const metalClean=FS.Models.mat(0x516a72,{metalness:.65,roughness:.38});
    // Faceted fishing-boat hull.
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.7,2.05,6.8,10,1,false),hullMat);
    hull.rotation.x=Math.PI/2;hull.scale.set(.92,.56,1);hull.position.set(0,.55,.1);g.add(hull);
    const keel=FS.Models.box(.22,.28,5.9,FS.Models.mat(0x252f32),0,.26,.05);g.add(keel);
    const deck=FS.Models.box(3.55,.18,6.25,deckMat,0,1.12,.05);g.add(deck);
    // Side rails with open working gaps.
    for(const side of [-1,1]){
      g.add(FS.Models.box(.1,.36,2.2,deckMat,side*1.75,1.32,-1.95));
      g.add(FS.Models.box(.1,.36,1.2,deckMat,side*1.75,1.32,1.88));
      g.add(FS.Models.box(.1,.26,1.0,deckMat,side*1.75,1.29,.02));
    }
    // Cabin front at -Z; the aft wall has a doorway gap.
    const cabin=new THREE.Group();cabin.name="cabin";g.add(cabin);
    const cabinWood=FS.Models.textured("oldWood",0xffffff);
    cabin.add(FS.Models.box(2.38,.12,2.25,deckMat,0,1.27,-2.05));
    cabin.add(FS.Models.box(.12,2.1,.12,cabinWood,-1.16,2.32,-2.95));
    cabin.add(FS.Models.box(.12,2.1,.12,cabinWood,1.16,2.32,-2.95));
    cabin.add(FS.Models.box(.12,2.1,.12,cabinWood,-1.16,2.32,-1.12));
    cabin.add(FS.Models.box(.12,2.1,.12,cabinWood,1.16,2.32,-1.12));
    cabin.add(FS.Models.box(2.3,.26,.12,cabinWood,0,3.28,-2.95));
    cabin.add(FS.Models.box(.66,.2,.12,cabinWood,-.82,3.23,-1.12));
    cabin.add(FS.Models.box(.66,.2,.12,cabinWood,.82,3.23,-1.12));
    cabin.add(FS.Models.box(.68,.62,.1,cabinWood,-.81,2.95,-1.12));
    cabin.add(FS.Models.box(.68,.62,.1,cabinWood,.81,2.95,-1.12));
    cabin.add(FS.Models.box(2.25,.12,1.75,deckMat,0,3.42,-2.05));
    // Windows / windshield.
    const glass=FS.Models.mat(0x75b9c1,{transparent:true,opacity:.34,metalness:.25,roughness:.15});
    cabin.add(FS.Models.box(1.1,.55,.045,glass,0,2.68,-3.01));
    for(const side of [-1,1])cabin.add(FS.Models.box(.045,.65,.52,glass,side*1.23,2.7,-2.4));
    // Door on a hinge: visible rust texture, animated around the hinge.
    this.door=new THREE.Group();this.door.position.set(-.43,2.25,-1.11);g.add(this.door);
    const doorPanel=FS.Models.box(.84,1.68,.12,FS.Models.textured("rust",0xffffff,{roughness:.9}),.42,0,0);
    doorPanel.userData.interact={kind:"door",label:"Tür öffnen/schließen"};this.door.add(doorPanel);
    for(let i=0;i<4;i++)this.door.add(FS.Models.box(.018,1.55,.03,FS.Models.mat(0x232a2a),.18+i*.17,0,.075));
    const handle=FS.Models.box(.07,.12,.045,FS.Models.mat(0xd49d51,{metalness:.65}),.73,-.05,.1);this.door.add(handle);
    this.door.userData.interact={kind:"door",label:"Tür öffnen/schließen"};
    // Steering console inside cabin.
    const consoleGroup=new THREE.Group();consoleGroup.position.set(0,1.3,-2.5);consoleGroup.userData.interact={kind:"helm",label:"Am Steuer übernehmen"};g.add(consoleGroup);
    consoleGroup.add(FS.Models.box(.75,.65,.48,metalMat,0,.5,0));
    FS.Interaction?.register(consoleGroup);
    const post=FS.Models.cylinder(.045,.06,.7,8,metalClean,0,.98,-.08);consoleGroup.add(post);
    this.wheel=new THREE.Mesh(new THREE.TorusGeometry(.34,.035,8,18),metalClean);this.wheel.position.set(0,1.27,-.08);this.wheel.rotation.x=.45;consoleGroup.add(this.wheel);
    this.helm=FS.Models.box(.9,1.1,.75,FS.Models.mat(0x273a41,{roughness:.86}),0,2.15,-2.48);
    this.helm.visible=false;this.helm.userData.interact={kind:"helm",label:"Am Steuer übernehmen"};g.add(this.helm);
    // Rear fish box, open top.
    this.box=new THREE.Group();this.box.position.set(0,1.21,2.18);g.add(this.box);
    const wood=FS.Models.textured("wood",0xffffff);
    this.box.add(FS.Models.box(1.55,.12,1.18,wood,0,.12,0));
    this.box.add(FS.Models.box(1.55,.62,.12,wood,0,.43,-.53));
    this.box.add(FS.Models.box(1.55,.62,.12,wood,0,.43,.53));
    this.box.add(FS.Models.box(.12,.62,1.18,wood,-.715,.43,0));
    this.box.add(FS.Models.box(.12,.62,1.18,wood,.715,.43,0));
    this.box.userData.interact={kind:"box",label:"Fangkiste ansehen"};
    // Metal work table on port side.
    this.table=new THREE.Group();this.table.position.set(-1.15,1.22,.12);g.add(this.table);
    const tableTop=FS.Models.box(.95,.12,1.16,metalMat,0,.76,0);
    tableTop.userData.interact={kind:"table",label:"Fisch verarbeiten"};this.table.add(tableTop);
    for(const x of [-.38,.38])for(const z of [-.47,.47])this.table.add(FS.Models.box(.075,.75,.075,metalClean,x,.36,z));
    this.table.add(FS.Models.box(.88,.055,1.08,metalMat,0,.32,0));
    this.table.userData.interact={kind:"table",label:"Fisch verarbeiten"};
    // Buoy sits low beside / under the table.
    this.buoy=new THREE.Group();this.buoy.position.set(-1.22,1.36,-.62);g.add(this.buoy);
    const buoyMat=FS.Models.textured("rust",0xffa24a,{roughness:.44,metalness:.02});
    const ball=new THREE.Mesh(new THREE.SphereGeometry(.19,14,10),buoyMat);ball.scale.set(1,1.12,1);this.buoy.add(ball);
    this.buoy.add(FS.Models.cylinder(.05,.05,.18,10,FS.Models.mat(0xf6ead5),0,.2,0));
    const buoyTag=FS.Models.box(.34,.06,.08,FS.Models.mat(0xffcd64),0,0,0);buoyTag.userData.interact={kind:"buoy",label:"Boje auswerfen"};this.buoy.add(buoyTag);
    this.buoy.userData.interact={kind:"buoy",label:"Boje auswerfen"};
    // Right-side net hauling device and gantry.
    this.crane=new THREE.Group();this.crane.position.set(1.52,1.25,-.42);g.add(this.crane);
    const craneMat=metalMat;
    this.crane.add(FS.Models.box(.16,1.6,.16,craneMat,0,.8,0));
    const arm=FS.Models.box(1.05,.14,.14,craneMat,-.36,1.58,0);arm.rotation.z=-.15;this.crane.add(arm);
    const pulley=new THREE.Mesh(new THREE.TorusGeometry(.27,.07,8,18),metalClean);pulley.position.set(-.77,1.38,0);pulley.rotation.y=Math.PI/2;this.crane.add(pulley);
    const drum=FS.Models.cylinder(.24,.24,.32,12,metalMat,.08,.36,0);drum.rotation.z=Math.PI/2;this.crane.add(drum);
    this.crane.userData.interact={kind:"crane",label:"Netz einholen"};
    const winch=FS.Models.box(.75,.55,.42,metalMat,1.13,1.45,.24);g.add(winch);winch.userData.interact={kind:"crane",label:"Netz einholen"};
    // Small details: bollards, deck strips, lights and rope coil.
    for(const side of [-1,1])for(let z of [-2.3,-.6,1.5])g.add(FS.Models.cylinder(.08,.1,.22,8,metalClean,side*1.43,1.29,z));
    for(let i=0;i<9;i++)g.add(FS.Models.box(3.25,.014,.018,FS.Models.mat(0x523d2c),0,1.22,-2.75+i*.7));
    this.localInteractables=[this.door,...this.buoy.children,this.crane,this.helm,this.table,this.box,winch];
    this.buoy.children.forEach(c=>{if(c.userData.interact)FS.Interaction?.register(c);});
    FS.Interaction?.register(this.door.children[0]);FS.Interaction?.register(this.door);
    FS.Interaction?.register(this.helm);FS.Interaction?.register(this.crane);FS.Interaction?.register(winch);
    FS.Interaction?.register(this.table.children[0]);FS.Interaction?.register(this.table);FS.Interaction?.register(this.box);
    this.buoy.visible=true;
  },
  toggleDoor(){
    this.doorTarget=this.doorOpen?0:Math.PI*.72;
    this.doorOpen=!this.doorOpen;
    FS.Audio.click();FS.toast(this.doorOpen?"Die Kajütentür öffnet sich.":"Die Kajütentür ist geschlossen.");
  },
  update(dt,time){
    if(this.door){this.doorAngle+=(this.doorTarget-this.doorAngle)*Math.min(1,dt*7);this.door.rotation.y=this.doorAngle;}
    if(this.wheel){this.wheel.rotation.z+=(FS.State.isPiloting?FS.Input.turn:-this.wheel.rotation.z)*Math.min(1,dt*3);}
    if(this.group){
      this.group.position.y=Math.sin(time*1.2)*.045;
      this.group.rotation.z=Math.sin(time*.62)*.012;
      this.group.rotation.x=Math.sin(time*.55+.5)*.008;
    }
    // Gentle boat drive, only while actively piloting at the helm.
    if(FS.State.isPiloting && FS.State.mode==="free"){
      const d=FS.Input.driveThrottle*FS.CFG.boatSpeed*dt;
      const forward=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),this.group.rotation.y);
      this.group.position.addScaledVector(forward,d);
      this.group.rotation.y+=FS.Input.turn*FS.CFG.turnSpeed*dt;
      FS.CameraRig.followHelm();
      this.speed=FS.Input.driveThrottle;
    }else this.speed*=.95;
  },
  addCrateFish(fish,index){
    const mesh=FS.Fish.makeCrateFish(fish.species,index);
    const col=index%3,row=Math.floor(index/3);
    mesh.position.set(-.45+col*.45,.28+row*.11,-.26+row*.13);
    mesh.rotation.y+=((index%4)-1.5)*.18;
    this.box.add(mesh);this.fishMeshes.push(mesh);
  },
  clearCrateFish(){this.fishMeshes.forEach(m=>this.box.remove(m));this.fishMeshes=[];},
  getWorldPoint(local){return this.group.localToWorld(local.clone());},
  setBuoyOnDeck(visible){this.buoy.visible=visible;FS.State.buoyOnDeck=visible;},
  inBounds(local){
    if(local.x<-1.55||local.x>1.55||local.z<-3.0||local.z>3.0)return false;
    if(!this.doorOpen && local.z<-1.05&&local.z>-1.9&&Math.abs(local.x)<.55)return false;
    // Keep the player from walking through the table, crate, and heavy machinery.
    const blocks=[
      {x:-1.15,z:.12,rx:.55,rz:.67},
      {x:0,z:2.18,rx:.86,rz:.7},
      {x:1.5,z:-.42,rx:.4,rz:.48},
      {x:0,z:-2.95,rx:1.22,rz:.2}
    ];
    return !blocks.some(b=>Math.abs(local.x-b.x)<b.rx&&Math.abs(local.z-b.z)<b.rz);
  }
};
