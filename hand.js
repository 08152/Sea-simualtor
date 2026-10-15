window.FS = window.FS || {};
FS.Hand = {
  attachTo(fishModel){
    const hand=new THREE.Group();
    const sleeve=FS.Models.mat(0x213b48,{roughness:.88});
    const skin=FS.Models.mat(0xc99a78,{roughness:.9});
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.055,.085,.32,7),sleeve);
    arm.rotation.z=-.25;arm.position.set(.17,.12,.05);hand.add(arm);
    const palm=FS.Models.box(.18,.055,.14,skin,.20,.25,.14);palm.rotation.y=.24;hand.add(palm);
    for(let i=0;i<4;i++){
      const finger=FS.Models.box(.035,.04,.115,skin,.145+i*.036,.24,.225);
      finger.rotation.x=-.15;hand.add(finger);
    }
    const thumb=FS.Models.box(.035,.04,.09,skin,.29,.235,.11);thumb.rotation.y=-.45;hand.add(thumb);
    hand.scale.setScalar(.83);fishModel.add(hand);return hand;
  }
};
