window.FS = window.FS || {};
FS.SaveSystem = {
  key:"riskySeasSaveV1",
  save(){
    try{
      const data={name:FS.State.name,credits:FS.State.credits,fish:FS.State.fish,hasBait:FS.State.hasBait,buoyOnDeck:FS.State.buoyOnDeck,mapSeed:FS.State.mapSeed};
      localStorage.setItem(this.key,JSON.stringify(data));
    }catch(e){}
  },
  load(){
    try{
      const raw=localStorage.getItem(this.key);if(!raw)return null;
      const d=JSON.parse(raw);if(!d||typeof d!=="object")return null;
      return d;
    }catch(e){return null;}
  },
  apply(data){
    if(!data)return false;
    FS.State.name=String(data.name||"Kapitän").slice(0,18);
    FS.State.credits=Math.max(0,Number(data.credits)||0);
    FS.State.fish=Array.isArray(data.fish)?data.fish:[];
    FS.State.hasBait=!!data.hasBait;
    FS.State.buoyOnDeck=data.buoyOnDeck!==false;
    FS.State.mapSeed=Number(data.mapSeed)||FS.CFG.worldSeed;
    return true;
  }
};
