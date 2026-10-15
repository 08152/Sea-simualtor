window.FS = window.FS || {};
FS.Textures = {
  urls: {
    wood: "https://cdn.polyhaven.com/asset_img/map_previews/wooden_planks/wooden_planks_diff_1k.jpg?height=512&quality=88&v=18d4f9f0&width=512",
    oldWood: "https://cdn.polyhaven.com/asset_img/map_previews/wood_planks/wood_planks_diff_1k.jpg?height=512&quality=88&v=da0c3e1b&width=512",
    rust: "https://cdn.polyhaven.com/asset_img/map_previews/rusty_metal/rusty_metal_diff_1k.jpg?height=512&quality=88&v=4feb9035&width=512",
    grass: "https://cdn.polyhaven.com/asset_img/map_previews/grass_ground/grass_ground_diff_1k.jpg?height=512&quality=88&width=512",
    concrete: "https://cdn.polyhaven.com/asset_img/map_previews/concrete_floor/concrete_floor_diff_1k.jpg?height=512&quality=88&width=512",
    fishScales: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Fish_scales.jpg"
  },
  maps: {},
  readyCount: 0,
  total: 0,
  ready: false,
  makeFallback(kind) {
    const c = document.createElement("canvas"); c.width=256; c.height=256;
    const ctx=c.getContext("2d");
    const palettes = {
      wood:["#59402b","#85613d","#3d2a1b"], oldWood:["#382c24","#775439","#281e18"],
      rust:["#3a4545","#9a4f2e","#be7b46"], grass:["#294d3d","#466247","#1f3b2d"],
      concrete:["#545e61","#747878","#424a4c"], metal:["#596a70","#8c9b9b","#303b40"]
    };
    const p=palettes[kind]||palettes.wood;
    ctx.fillStyle=p[0];ctx.fillRect(0,0,256,256);
    let seed=23;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    if(kind==="wood"||kind==="oldWood") {
      for(let y=0;y<256;y+=36){ctx.fillStyle=p[1];ctx.fillRect(0,y,256,33);ctx.strokeStyle=p[2];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y+2);ctx.lineTo(256,y+2);ctx.stroke();
        for(let i=0;i<10;i++){let x=rand()*256;ctx.strokeStyle="rgba(18,10,5,.22)";ctx.beginPath();ctx.ellipse(x,y+15,rand()*32+5,rand()*3+1,0,0,Math.PI*2);ctx.stroke();}
      }
    } else {
      for(let i=0;i<2100;i++){ctx.fillStyle=p[Math.floor(rand()*p.length)];ctx.globalAlpha=.12+rand()*.5;ctx.fillRect(rand()*256,rand()*256,rand()*8+1,rand()*6+1);}
      ctx.globalAlpha=1;
    }
    return new THREE.CanvasTexture(c);
  },
  init() {
    if(this.ready)return;
    this.ready=true;
    const loader = new THREE.TextureLoader(); loader.crossOrigin = "anonymous";
    const names=Object.keys(this.urls); this.total=names.length;
    names.forEach(name=>{
      const fallback=this.makeFallback(name); fallback.wrapS=fallback.wrapT=THREE.RepeatWrapping; fallback.repeat.set(name==="grass"?3:(name==="fishScales"?1:2),name==="grass"?3:(name==="fishScales"?1:2));
      this.maps[name]=fallback;
      loader.load(this.urls[name], tex=>{
        // Keep the same Texture object so materials created before download also receive the online image.
        fallback.image=tex.image; fallback.needsUpdate=true;
        fallback.wrapS=fallback.wrapT=THREE.RepeatWrapping;
        fallback.repeat.set(name==="grass"?3:(name==="fishScales"?1:2),name==="grass"?3:(name==="fishScales"?1:2));
        fallback.minFilter=THREE.LinearMipmapLinearFilter; fallback.magFilter=THREE.LinearFilter;
        fallback.anisotropy=1; this.readyCount++;
      }, undefined, ()=>{ /* Use generated fallback texture; 3D remains playable. */ });
    });
  },
  get(name){ return this.maps[name] || this.makeFallback(name); },
  list(){ return Object.entries(this.urls).map(([name,url])=>({name,url})); }
};
