window.FS = window.FS || {};
FS.Processing = {
  active:false,fish:null,canvas:null,ctx:null,drawing:false,points:[],distance:0,stars:0,fishModel:null,stepIndex:0,queue:[],
  init(){
    this.canvas=document.getElementById("cutting-canvas");this.ctx=this.canvas.getContext("2d");
    this.canvas.addEventListener("pointerdown",e=>this.pointerDown(e));
    this.canvas.addEventListener("pointermove",e=>this.pointerMove(e));
    window.addEventListener("pointerup",e=>this.pointerUp(e));
    document.getElementById("cutting-done").addEventListener("click",()=>this.completeCurrent());
    this.drawCanvas(false);
  },
  start(){
    const remaining=FS.State.fish.filter(f=>!f.processed);
    if(!remaining.length){FS.toast("Keine unbearbeiteten Fische. Fahre zum Hafen, um zu verkaufen.");return;}
    document.exitPointerLock?.();FS.State.isPiloting=false;this.active=true;this.queue=remaining.slice();this.stepIndex=0;
    this.fish=this.queue[0];FS.setMode("cutting");FS.CameraRig.showCutView();
    document.getElementById("crosshair").classList.add("hidden");
    document.getElementById("cutting-overlay").classList.remove("hidden");
    document.getElementById("cutting-stars").textContent="☆ ☆ ☆ ☆ ☆";
    document.getElementById("cutting-done").disabled=true;
    this.drawCanvas(false);FS.setMission("Fischverarbeitung: Folge der gestrichelten Linie.");
  },
  getPointerPos(e){
    const rect=this.canvas.getBoundingClientRect();
    return {x:(e.clientX-rect.left)/rect.width*this.canvas.width,y:(e.clientY-rect.top)/rect.height*this.canvas.height};
  },
  pointerDown(e){
    if(!this.active)return;
    this.drawing=true;this.points=[];this.distance=0;this.points.push(this.getPointerPos(e));this.canvas.setPointerCapture?.(e.pointerId);
    this.drawCanvas(true);e.preventDefault();
  },
  pointerMove(e){
    if(!this.active||!this.drawing)return;
    const p=this.getPointerPos(e);this.points.push(p);this.drawTrace();e.preventDefault();
  },
  pointerUp(){
    if(!this.active||!this.drawing)return;
    this.drawing=false;
    const xs=this.points.map(p=>p.x);
    const progress=xs.length>1?(Math.max(...xs)-Math.min(...xs))/this.canvas.width:0;
    if(progress<.23){document.getElementById("cutting-progress").textContent="Fahre von X bis zum anderen X.";return;}
    const expectedY=this.canvas.height*.54;
    const dev=this.points.reduce((sum,p)=>sum+Math.abs(p.y-expectedY),0)/this.points.length;
    const deviation=Math.max(0,1-dev/(this.canvas.height*.28));
    const coverage=Math.min(1,progress/.56);
    const accuracy=Math.max(0,Math.min(1,deviation*.75+coverage*.25));
    this.stars=FS.Scoring.starsFromAccuracy(accuracy);
    document.getElementById("cutting-stars").textContent="★ ".repeat(this.stars)+"☆ ".repeat(5-this.stars);
    document.getElementById("cutting-progress").textContent=`Genauigkeit: ${Math.round(accuracy*100)} %`;
    document.getElementById("cutting-done").disabled=false;
  },
  drawCanvas(drawFish){
    const c=this.canvas,ctx=this.ctx,w=c.width,h=c.height;ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#0b303a";ctx.fillRect(0,0,w,h);
    // Work-surface lines, stylised fish silhouette and guide line.
    ctx.strokeStyle="rgba(115,175,181,.13)";ctx.lineWidth=1;
    for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.save();ctx.translate(w/2,h*.52);
    ctx.fillStyle="#a9c8c7";ctx.beginPath();ctx.ellipse(0,0,310,104,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#8caeb0";ctx.beginPath();ctx.moveTo(-292,0);ctx.lineTo(-390,-68);ctx.lineTo(-374,0);ctx.lineTo(-390,68);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d3e3d9";ctx.beginPath();ctx.ellipse(45,14,220,56,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#143039";ctx.beginPath();ctx.arc(255,-19,9,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#69939a";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-300,0);ctx.lineTo(300,0);ctx.stroke();
    ctx.restore();
    ctx.setLineDash([11,10]);ctx.strokeStyle="#f2e9ba";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.18,h*.54);ctx.lineTo(w*.82,h*.54);ctx.stroke();ctx.setLineDash([]);
    for(const x of [w*.18,w*.82]){ctx.strokeStyle="#ffffff";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-14,h*.54-14);ctx.lineTo(x+14,h*.54+14);ctx.moveTo(x+14,h*.54-14);ctx.lineTo(x-14,h*.54+14);ctx.stroke();}
    ctx.fillStyle="#e7ffff";ctx.font="bold 18px Arial";ctx.fillText("FOLGE DER LINIE",w*.42,h*.22);
    if(drawFish)this.drawTrace();
  },
  drawTrace(){
    if(!this.points.length)return;
    const ctx=this.ctx;ctx.lineCap="round";ctx.lineJoin="round";
    for(let i=1;i<this.points.length;i++){
      ctx.strokeStyle=i%2?"#ff555e":"#b71e37";ctx.lineWidth=15;
      ctx.beginPath();ctx.moveTo(this.points[i-1].x,this.points[i-1].y);ctx.lineTo(this.points[i].x,this.points[i].y);ctx.stroke();
      ctx.strokeStyle=i%2?"#ff9292":"#e43b4e";ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(this.points[i-1].x,this.points[i-1].y);ctx.lineTo(this.points[i].x,this.points[i].y);ctx.stroke();
    }
  },
  completeCurrent(){
    if(!this.active||!this.fish)return;
    if(!this.stars){this.stars=1;FS.toast("Fisch fertiggestellt – beim nächsten Mal genauer der Linie folgen.");}
    FS.Economy.markProcessed(this.fish,this.stars);
    FS.Audio.success();
    this.stepIndex++;
    if(this.stepIndex<this.queue.length){
      this.fish=this.queue[this.stepIndex];this.points=[];this.stars=0;this.drawing=false;
      document.getElementById("cutting-stars").textContent="☆ ☆ ☆ ☆ ☆";
      document.getElementById("cutting-done").disabled=true;
      document.getElementById("cutting-progress").textContent=`Fisch ${this.stepIndex+1} von ${this.queue.length}`;
      this.drawCanvas(false);
      FS.toast("Nächster Fisch auf dem Tisch.",1.5);
    }else{
      this.active=false;document.getElementById("cutting-overlay").classList.add("hidden");
      FS.CameraRig.restore();FS.setMode("free");FS.HUD.syncMode();FS.HUD.update();
      FS.setMission("Alle Fische verarbeitet! Fahre zum lila markierten Hafenbereich und drücke E.");
      FS.toast("Verarbeitung abgeschlossen. Bonus-Credits wurden eingerechnet.",3);
      FS.SaveSystem?.save();
    }
  },
  update(){}
};
