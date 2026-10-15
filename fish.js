window.FS = window.FS || {};
FS.Fish = {
  species: [
    {id:"herring",name:"Hering",color:0x8cb5bc,belly:0xd5e1d7,weight:1.0},
    {id:"mackerel",name:"Makrele",color:0x367d91,belly:0xc3dedb,weight:1.25},
    {id:"salmon",name:"Lachs",color:0xd77f66,belly:0xf1c7a4,weight:1.45},
    {id:"cod",name:"Dorsch",color:0xc6bda1,belly:0xe0d9bf,weight:1.65}
  ],
  randomSpecies() { return this.species[Math.floor(Math.random()*this.species.length)]; },
  build(species, scale=1) {
    const spec=typeof species==="string"?this.species.find(s=>s.id===species)||this.species[0]:species;
    const g=new THREE.Group(); g.userData.fishSpecies=spec.id;
    const bodyMat=FS.Models.mat(spec.color,{roughness:.52,metalness:.06,bumpMap:FS.Textures.get("fishScales"),bumpScale:.012});
    const bellyMat=FS.Models.mat(spec.belly,{roughness:.64});
    // Ten overlapping tapered ellipsoids create an inexpensive segmented fish.
    const count=10;
    for(let i=0;i<count;i++){
      const t=i/(count-1); const width=Math.sin(Math.PI*(t*.86+.05))*(.19+(.06*Math.sin(i*1.7)));
      const seg=new THREE.Mesh(new THREE.SphereGeometry(1,9,7), i<5?bodyMat:bodyMat);
      seg.scale.set(width,.12+(Math.sin(Math.PI*t)*.055),.18);
      seg.position.set(0,.05, .65-t*1.18);
      seg.userData.baseZ=seg.position.z;seg.userData.t=t;g.add(seg);
    }
    const belly=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),bellyMat);
    belly.scale.set(.13,.055,.47);belly.position.set(0,-.025,-.06);g.add(belly);
    const tail=new THREE.Mesh(new THREE.BufferGeometry(),bodyMat);
    const tailShape=new THREE.Shape();tailShape.moveTo(0,0);tailShape.lineTo(-.19,.23);tailShape.lineTo(-.12,0);tailShape.lineTo(-.19,-.23);tailShape.lineTo(0,0);
    const tailGeo=new THREE.ShapeGeometry(tailShape);tailGeo.rotateX(-Math.PI/2);
    const tailMesh=new THREE.Mesh(tailGeo,bodyMat);tailMesh.position.set(0,.05,-.68);tailMesh.rotation.y=Math.PI;g.add(tailMesh);
    const dorsal=new THREE.Mesh(new THREE.ConeGeometry(.085,.24,4),bodyMat);dorsal.rotation.z=Math.PI;dorsal.position.set(0,.18,.04);g.add(dorsal);
    const eyeMat=new THREE.MeshBasicMaterial({color:0x061116});
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),eyeMat);eye.position.set(.115,.07,.42);g.add(eye);
    const eye2=eye.clone();eye2.position.x=-.115;g.add(eye2);
    // Species-specific bands/scales as light geometry for recognisable silhouettes.
    if(spec.id==="mackerel") for(let i=0;i<6;i++){const stripe=FS.Models.box(.012,.018,.18,FS.Models.mat(0x183f50),0,.15,-.26+i*.105);stripe.rotation.z=(i%2?-.2:.2);g.add(stripe);}
    if(spec.id==="salmon") for(let i=0;i<5;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.018,6,5),FS.Models.mat(0x9b5149));dot.position.set(.13,.09,-.36+i*.13);g.add(dot);}
    g.scale.setScalar(scale);
    g.userData.segments=g.children.filter(c=>c.geometry&&c.geometry.type==="SphereGeometry");
    g.userData.tail=tailMesh;
    return g;
  },
  animate(group,time,amount=.08) {
    if(!group)return;
    group.children.forEach(child=>{
      if(child.userData && child.userData.t!==undefined) {
        const t=child.userData.t;
        child.position.x=Math.sin(time*5-t*4)*amount*(.2+t);
      }
    });
    if(group.userData.tail)group.userData.tail.rotation.y=Math.sin(time*7)*.28;
    group.rotation.z=Math.sin(time*3)*.035;
  },
  makeCrateFish(species, index) {
    const g=new THREE.Group();const c=FS.Models.mat(species.color);
    const body=FS.Models.box(.16,.12,.62,c);g.add(body);
    const tail=FS.Models.box(.18,.035,.16,c,0,.03,-.36);tail.rotation.y=.25;g.add(tail);
    g.rotation.y=(index%2?1:-1)*(.3+index*.17);g.rotation.x=-.12;return g;
  }
};
