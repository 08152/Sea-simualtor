window.FS = window.FS || {};
FS.Models = {
  mat(color, opts={}) { return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.78,metalness:0},opts)); },
  box(w,h,d, material, x=0,y=0,z=0) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    m.position.set(x,y,z); m.castShadow=false; m.receiveShadow=true; return m;
  },
  cylinder(rt,rb,h,segments,material,x=0,y=0,z=0) {
    const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);
    m.position.set(x,y,z); return m;
  },
  textured(name,color=0xffffff,opts={}) {
    return new THREE.MeshStandardMaterial(Object.assign({map:FS.Textures.get(name),color,roughness:.84,metalness:0},opts));
  },
  makeLabel(text, color="#c8ffff") {
    const c=document.createElement("canvas");c.width=512;c.height=128;const x=c.getContext("2d");
    x.clearRect(0,0,512,128);x.fillStyle="rgba(2,18,25,.82)";x.fillRect(0,0,512,128);
    x.strokeStyle="#4c8991";x.lineWidth=4;x.strokeRect(2,2,508,124);
    x.fillStyle=color;x.font="bold 34px Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(text,256,64);
    const t=new THREE.CanvasTexture(c);return new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide});
  }
};
