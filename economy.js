window.FS = window.FS || {};
FS.Economy = {
  addFish(species,quality=0){
    const base=FS.CFG.fishMinValue+Math.floor(Math.random()*(FS.CFG.fishMaxValue-FS.CFG.fishMinValue+1));
    const fish={id:Date.now()+"-"+Math.random().toString(16).slice(2),species,name:species.name,baseValue:base,catchPoints:quality,value:base+quality*5,processed:false,stars:0};
    FS.State.fish.push(fish);FS.Boat.addCrateFish(fish,FS.State.fish.length-1);FS.SaveSystem?.save();
    return fish;
  },
  markProcessed(fish,stars){
    fish.processed=true;fish.stars=stars;
    fish.value=Math.max(fish.value,FS.Scoring.valueAfterProcessing(fish.baseValue,stars));
    FS.SaveSystem?.save();
  },
  sellAll(){
    if(!FS.State.fish.length){FS.toast("Die Kiste ist leer.");return 0;}
    const total=FS.State.fish.reduce((sum,f)=>sum+f.value,0);
    const count=FS.State.fish.length;FS.State.credits+=total;FS.State.fish=[];
    FS.Boat.clearCrateFish();FS.SaveSystem?.save();FS.HUD.update();
    FS.Audio.success();FS.toast(`${count} Fische verkauft: +${total} Credits`,3.5);FS.Harbor.refreshPanel();
    return total;
  },
  buyBait(){
    if(FS.State.hasBait){FS.toast("Du hast bereits einen Köder.");return false;}
    if(FS.State.credits<FS.CFG.baitPrice){FS.toast("Dafür brauchst du 500 Credits.");return false;}
    FS.State.credits-=FS.CFG.baitPrice;FS.State.hasBait=true;FS.SaveSystem?.save();FS.HUD.update();FS.Audio.click();FS.toast("Neuer Köder gekauft. Die Boje ist bereit.");FS.Harbor.refreshPanel();return true;
  }
};
