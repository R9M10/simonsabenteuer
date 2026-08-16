(() => {
  "use strict";
  if (window.__SIMON_FLIRT_SYSTEM_V40__) return;
  window.__SIMON_FLIRT_SYSTEM_V40__ = true;

  const FLIRTS = Object.freeze({
    secondLook: { name: "Der zweite Blick", source: "enrique-free", effect: "secondLook", lines: [{speaker:"simon",text:"Hoi."}] },
    coinToss: { name: "Der Münzwurf", source: "playbook", effect: "coin", lines: [
      {speaker:"simon",text:"Kopf: Ich lad dich uf en Drink ii. Zahl: du mich."},
      {speaker:"woman",text:"Und?"}, {speaker:"simon",text:"Kopf."}
    ]},
    bookworm: { name: "Der Bücherwurm", source: "playbook", effect: "book", lines: [
      {speaker:"simon",text:"Kurzi Frag: Was isch dis Lieblingsbuech?"},
      {speaker:"simon",text:"Und bitte säg nöd irgende öppis Langwiiliges."}
    ]},
    fakeTourist: { name: "Der falsche Tourist", source: "playbook", effect: "map", lines: [
      {speaker:"simon",text:"Entschuldigung... ich glaub, ich han mi komplett verlaufe."},
      {speaker:"simon",text:"Oder ich ha eifach en guete Grund gsuecht, dich azspreche."}
    ]},
    enrique1: { name: "Flirt 1", source: "enrique-paid", effect: "spark", lines: [{speaker:"simon",text:"Du hesch grad irgendwie de ganze Raum interessanter gmacht."}] },
    enrique2: { name: "Flirt 2", source: "enrique-paid", effect: "spark", lines: [{speaker:"simon",text:"Kurzi Frag: bisch du immer so souverän?"}] },
    enrique3: { name: "Flirt 3", source: "enrique-paid", effect: "spark", lines: [
      {speaker:"simon",text:"Ich han grad überleit, öppis Cleveres z'säge."},
      {speaker:"simon",text:"Aber hoi funktioniert glaub au."}
    ]}
  });

  const PLAYBOOK = ["coinToss", "bookworm", "fakeTourist"];

  const ENRIQUE_FLIRTS = Object.freeze({
    enrique1: { flirtId:"enrique1", label:"FLIRT 1", name:"Flirt 1", price:100, explanation:[
      {speaker:"simon",text:"Wie funktioniert Flirt 1?"},
      {speaker:"enrique",text:"Du machsch es Kompliment. Aber nöd über d'Schueh."},
      {speaker:"simon",text:"Wieso nöd d'Schueh?"},
      {speaker:"enrique",text:"Simon. Du redsch scho viel z'viel über Schueh."}
    ]},
    enrique2: { flirtId:"enrique2", label:"FLIRT 2", name:"Flirt 2", price:100, explanation:[
      {speaker:"simon",text:"Okay. Und Flirt 2?"},
      {speaker:"enrique",text:"Du stellsch e Frag, wo nöd komplett belanglos isch."},
      {speaker:"simon",text:"Also nöd: Was machsch du so?"},
      {speaker:"enrique",text:"Genau. Das isch es Bewerbungsgspröch, kei Flirt."}
    ]},
    enrique3: { flirtId:"enrique3", label:"FLIRT 3", name:"Flirt 3", price:100, explanation:[
      {speaker:"simon",text:"Und de letschti?"},
      {speaker:"enrique",text:"Du muesch nöd immer clever wirke."},
      {speaker:"simon",text:"Das tönt verdächtig eifach."},
      {speaker:"enrique",text:"Isches au. Schwieriger wirds, wenn du wieder drüber nachdenksch."}
    ]}
  });

  const WOMEN = Object.freeze({
    woman_hive_01: {
      observations:[
        "Sie beobachtet die Leute ziemlich genau.",
        "Sie wirkt ziemlich selbstbewusst.",
        "Zwischen all dem Lärm wirkt sie überraschend ruhig.",
        "Sie sieht aus, als würde sie viel lesen."
      ],
      successfulFlirts:["secondLook","bookworm"],
      successTexts:["Okay... de war guet.","Hmm. Gar nöd schlecht."],
      failureTexts:["Nei.","Bitte hör uf.","Eher nöd."]
    }
  });

  const state = window.__SIMON_FLIRT_STATE_V40__ || {
    learnedFlirts:[], enriquePurchased:{}, enriqueIntroCompleted:false, women:{}
  };
  if (!Array.isArray(state.learnedFlirts)) state.learnedFlirts=[];
  if (!state.enriquePurchased) state.enriquePurchased={};
  if (!state.women) state.women={};
  for (const id of Object.keys(WOMEN)) {
    const old=state.women[id]||{};
    state.women[id]={
      attemptedFlirts:Array.isArray(old.attemptedFlirts)?[...new Set(old.attemptedFlirts)]:[],
      flirtAttemptedThisVisit:Boolean(old.flirtAttemptedThisVisit)
    };
  }
  window.__SIMON_FLIRT_STATE_V40__=state;

  let clickOverlay=null;
  function game(){return window.__SIMON_ACTIVE_GAME_V28__||window.__SIMON_ACTIVE_GAME_V20__||window.__SIMON_ACTIVE_GAME__||null;}
  function scene(g,key){try{return g?.scene?.getScene?.(key)||null;}catch{return null;}}
  function womanState(id){return state.women[id]||(state.women[id]={attemptedFlirts:[],flirtAttemptedThisVisit:false});}
  function attach(s){if(!s)return;s.learnedFlirts=state.learnedFlirts;s.flirtProgress=state.women;s.enriqueFlirtsPurchased=state.enriquePurchased;s.ownedFlirts=state.learnedFlirts;}
  function learned(id){return state.learnedFlirts.includes(id);}

  function notice(s,title,names){
    const text=[title,...names.map(x=>x.toUpperCase())].join("\n");
    if(typeof s?.showTopTextNotice==="function") {s.showTopTextNotice(text,{duration:3300,key:"flirt-unlock"});return;}
    const root=document.getElementById("phaser-game");if(!root)return;
    const b=document.createElement("div");b.dataset.simonUi="flirt-unlock-v40";b.textContent=text;
    Object.assign(b.style,{position:"absolute",left:"50%",top:"46px",transform:"translateX(-50%)",zIndex:"410000",maxWidth:"80%",padding:"10px 14px",border:"3px solid #d7bd78",background:"rgba(33,25,20,.96)",color:"#fff0c2",fontFamily:'"Press Start 2P", monospace',fontSize:"7px",lineHeight:"1.7",whiteSpace:"pre-line",textAlign:"center",pointerEvents:"none"});
    root.appendChild(b);setTimeout(()=>b.remove(),3300);
  }
  function learn(s,id,show=true){if(!FLIRTS[id]||learned(id))return false;state.learnedFlirts.push(id);attach(s);if(show)notice(s,"NEUER FLIRT GELERNT",[FLIRTS[id].name]);return true;}
  function learnMany(s,ids){const n=[];ids.forEach(id=>{if(learn(s,id,false))n.push(id);});if(n.length)notice(s,"NEUE FLIRTS GELERNT",n.map(id=>FLIRTS[id].name));}

  function patchPlaybook(s){
    if(!s||typeof s.playBookReadingAnimation!=="function"||s.playBookReadingAnimation.__flirtV40)return;
    const original=s.playBookReadingAnimation.bind(s);
    const wrapped=function(itemKey,...args){
      const item=this.getItemDefinition?.(itemKey);const isPB=item?.bookKey==="playbook";const was=Boolean(this.booksRead?.playbook);
      const result=original(itemKey,...args);if(isPB&&!was){const started=Date.now();const check=()=>{if(!this.sys?.isActive?.())return;if(this.readingBook&&Date.now()-started<4000){setTimeout(check,80);return;}this.booksRead=this.booksRead||{};if(!this.booksRead.playbook){this.booksRead.playbook=true;learnMany(this,PLAYBOOK);this.updateInventoryUI?.();}};setTimeout(check,1700);}return result;
    };wrapped.__flirtV40=true;s.playBookReadingAnimation=wrapped;
  }

  function overlay(onAdvance,key){
    clickOverlay?.remove?.();const root=document.getElementById("phaser-game");if(!root)return null;
    const o=document.createElement("div");o.dataset.simonUi=key;Object.assign(o.style,{position:"absolute",inset:"0",zIndex:"420000",background:"transparent",pointerEvents:"auto",touchAction:"manipulation"});let last=-1e9;
    const stop=e=>{e.preventDefault?.();e.stopPropagation?.();e.stopImmediatePropagation?.();};
    const go=e=>{stop(e);const now=performance.now();if(now-last<280)return;last=now;onAdvance?.();};
    o.addEventListener("pointerdown",stop,{passive:false});o.addEventListener("pointerup",go,{passive:false});o.addEventListener("click",go,{passive:false});root.appendChild(o);clickOverlay=o;return o;
  }
  function clearOverlay(){clickOverlay?.remove?.();clickOverlay=null;}

  function hiveSequence(hive,steps,done){
    if(!hive||!steps?.length)return;hive.closeModal?.();hive.actionLocked=true;let i=0;
    const render=()=>{const st=steps[i];if(!st){clearOverlay();hive.destroySpeechBubble?.();hive.stopSimonAction?.();if(hive.womanSprite?.active)hive.womanSprite.play?.("woman-v14-idle",true);hive.actionLocked=false;done?.();return;}
      hive.destroySpeechBubble?.();if(st.speaker==="simon"){hive.playSimonAction?.("simon-v14-talk",{loop:true});hive.showSpeechBubble?.(hive.player,st.text,0);}else{hive.stopSimonAction?.();if(hive.womanSprite?.active)hive.womanSprite.play?.(st.reject?"woman-v14-reject":"woman-v14-idle",true);hive.showSpeechBubble?.(hive.womanSprite,st.text,0);}};
    overlay(()=>{i++;render();},"hive-flirt-sequence-v40");render();
  }

  function observe(hive,id){
    const d=WOMEN[id];if(!d)return;hive.closeModal?.();hive.actionLocked=true;const text=d.observations[Math.floor(Math.random()*d.observations.length)];hive.showSpeechBubble?.(hive.player,text,0);
    if(hive.speechBubble?.active){hive.speechBubble.add([hive.add.circle(-5,41,6,0xfff8df,1).setStrokeStyle(2,0x382d36,1),hive.add.circle(-13,53,3.5,0xfff8df,1).setStrokeStyle(2,0x382d36,1)]);}
    overlay(()=>{clearOverlay();hive.destroySpeechBubble?.();hive.actionLocked=false;},"observe-v40");
  }

  function mini(hive,id){const f=FLIRTS[id];if(!hive?.player?.active||!f)return;const x=hive.player.x+28,y=hive.player.y-68;
    if(f.effect==="secondLook"){const old=hive.player.flipX;hive.time?.delayedCall?.(180,()=>hive.player?.active&&hive.player.setFlipX(!old));hive.time?.delayedCall?.(500,()=>hive.player?.active&&hive.player.setFlipX(old));return;}
    if(f.effect==="coin"){const c=hive.add.circle(x,y,7,0xe0b74d,1).setStrokeStyle(2,0x6b4a1d,1).setDepth(510);hive.tweens.add({targets:c,y:y-55,angle:720,duration:360,yoyo:true,onComplete:()=>c.destroy()});return;}
    const g=hive.add.graphics();const obj=hive.add.container(x,y,[g]).setDepth(510);
    if(f.effect==="book"){g.fillStyle(0x355f85,1);g.fillRoundedRect(-12,-16,24,32,3);g.fillStyle(0xf5eccf,1);g.fillRect(-8,-12,16,24);}else if(f.effect==="map"){g.fillStyle(0xe6d7aa,1);g.fillRect(-20,-13,40,26);g.lineStyle(2,0x756443,1);g.strokeRect(-20,-13,40,26);g.lineBetween(-7,-12,-7,12);g.lineBetween(7,-12,7,12);}else{g.fillStyle(0xffe48c,1);g.fillCircle(0,0,7);}
    hive.tweens.add({targets:obj,y:y-18,angle:{from:-5,to:5},alpha:{from:1,to:0},duration:700,onComplete:()=>obj.destroy(true)});
  }
  function heart(hive){if(!hive?.womanSprite?.active)return;const h=hive.add.text(hive.womanSprite.x,hive.womanSprite.y-118,"♥",{fontFamily:"Georgia, serif",fontSize:"24px",color:"#e95770"}).setOrigin(.5).setDepth(520);hive.tweens.add({targets:h,y:h.y-28,scale:1.35,alpha:0,duration:800,onComplete:()=>h.destroy()});}

  function startFlirt(hive,wid,fid){const d=WOMEN[wid],ws=womanState(wid),f=FLIRTS[fid];if(!d||!f||ws.flirtAttemptedThisVisit||ws.attemptedFlirts.includes(fid)||!learned(fid))return;hive.closeModal?.();ws.attemptedFlirts.push(fid);ws.flirtAttemptedThisVisit=true;const ok=d.successfulFlirts.includes(fid);mini(hive,fid);const pool=ok?d.successTexts:d.failureTexts;const result=pool[Math.floor(Math.random()*pool.length)];hiveSequence(hive,[...f.lines,{speaker:"woman",reject:!ok,text:result}],()=>{if(ok)heart(hive);});}

  function womanMenu(hive,wid="woman_hive_01"){
    const has=state.learnedFlirts.length>0;hive.openDialog?.("ANSPRECHEN","Was soll Simon machen?",[
      {label:"BEOBACHTEN",action:()=>observe(hive,wid)},
      {label:has?"FLIRTEN":"FLIRTEN 🔒",disabled:!has,action:()=>flirtMenu(hive,wid)},
      {label:"REDEN",action:()=>hive.startRejectedDanceInvite?.()},
      {label:"ZURÜCK",action:()=>hive.closeModal?.()}
    ]);
  }
  function flirtMenu(hive,wid){const ws=womanState(wid);if(ws.flirtAttemptedThisVisit){hive.closeModal?.();hiveSequence(hive,[{speaker:"woman",text:"Vielleicht später."}]);return;}
    const ids=state.learnedFlirts.filter(id=>FLIRTS[id]);if(!ids.length){hive.openDialog?.("FLIRTEN","Simon kennt no kein Flirt.",[{label:"ZURÜCK",action:()=>womanMenu(hive,wid)}]);return;}
    const attempted=new Set(ws.attemptedFlirts);const buttons=ids.map(id=>({label:FLIRTS[id].name.toUpperCase(),disabled:attempted.has(id),action:()=>startFlirt(hive,wid,id)}));buttons.push({label:"ZURÜCK",action:()=>womanMenu(hive,wid)});hive.openDialog?.("WÄHLE EINEN FLIRT","",buttons);
    const names=new Set(ws.attemptedFlirts.map(id=>FLIRTS[id]?.name?.toUpperCase()).filter(Boolean));hive.currentModal?.querySelectorAll("button").forEach(b=>{if(names.has(String(b.textContent||"").trim().toUpperCase())){b.style.textDecoration="line-through";b.style.opacity=".48";b.disabled=true;}});
  }
  function patchHive(hive){if(!hive||hive.__flirtWomanV40)return;hive.__flirtWomanV40=true;
    if(typeof hive.init==="function"&&!hive.init.__flirtV40){const old=hive.init.bind(hive);const w=function(...args){womanState("woman_hive_01").flirtAttemptedThisVisit=false;const r=old(...args);if(this.overworld)attach(this.overworld);return r;};w.__flirtV40=true;hive.init=w;}
    hive.getOwnedFlirts=()=>[...state.learnedFlirts];hive.openWomanMenu=function(){womanMenu(this);};
  }

  function clearZBubble(s){s?.__flirtV40Bubble?.destroy?.(true);s.__flirtV40Bubble=null;}
  function zBubble(s,speaker,text){clearZBubble(s);const a=speaker==="simon"?s.__sv37ClubSimon:s.__sv37Enrique;if(!a)return;if(s.__sv37ClubSimon?.active){if(speaker==="simon"){s.__sv37ClubSimon.setScale(.52);if(s.anims?.exists?.("simon-v14-talk"))s.__sv37ClubSimon.play("simon-v14-talk",true);}else{s.__sv37ClubSimon.setScale(.42);s.__sv37ClubSimon.play?.("simon-idle",true);}}
    const x=Phaser.Math.Clamp(a.x,140,680),y=Phaser.Math.Clamp(a.y-120,60,225);const b=typeof s.createSpeechBubble==="function"?s.createSpeechBubble(x,y,text,0):s.add.text(x,y,text,{fontFamily:'"Press Start 2P", monospace',fontSize:"8px",color:"#2a2017",backgroundColor:"#fff8df",padding:{x:12,y:10},wordWrap:{width:260},align:"center"}).setOrigin(.5);b?.setScrollFactor?.(0);b?.setDepth?.(1550);s.__flirtV40Bubble=b;}
  function closeEModal(s){const m=s?.__sv37EnriqueModal;if(m?.overlay)s.destroyDOMModal?.(m);s.__sv37EnriqueModal=null;}
  function eSequence(s,steps,done){if(!s||!steps?.length)return;closeEModal(s);s.__sv37EnriqueModal={__flirtSequence:true};let i=0;const render=()=>{const st=steps[i];if(!st){clearOverlay();clearZBubble(s);if(s.__sv37ClubSimon?.active){s.__sv37ClubSimon.setScale(.42);s.__sv37ClubSimon.play?.("simon-idle",true);}s.__sv37EnriqueModal=null;done?.();return;}zBubble(s,st.speaker,st.text);};overlay(()=>{i++;render();},"enrique-sequence-v40");render();}

  const INTRO=[
    {speaker:"enrique",text:"Simon! Endlich bisch da!"},{speaker:"enrique",text:"Ich ha scho denkt, du chunsch gar nüm."},{speaker:"simon",text:"Enrique?"},{speaker:"enrique",text:"Ja man! Freut mi mega, dich z'gseh."},{speaker:"enrique",text:"Aber Simon... ich muss dir öppis zeige."},{speaker:"simon",text:"Was?"},{speaker:"enrique",text:"De zweite Blick."},{speaker:"simon",text:"Was isch de zweite Blick?"},{speaker:"enrique",text:"Ganz eifach. Du laufsch an ere Frau verbii."},{speaker:"enrique",text:"Du luegsch sie aa."},{speaker:"enrique",text:"Du laufsch wiiter."},{speaker:"enrique",text:"Und denn... luegsch nomal zrugg."},{speaker:"simon",text:"Das isch alles?"},{speaker:"enrique",text:"Ja."},{speaker:"enrique",text:"Aber nur EINMAL. Susch wirds creepy."}
  ];
  function startIntro(s){if(state.enriqueIntroCompleted)return;eSequence(s,INTRO,()=>{state.enriqueIntroCompleted=true;s.enriqueIntroCompleted=true;s.markEnriqueConversationComplete?.();s.enriqueSpoken=true;learn(s,"secondLook");setTimeout(()=>openEMenu(s),220);});}

  function addEButton(s,list,label,action,disabled=false){const b=s.createDOMButton?.(label,action,{color:disabled?"#837e72":"#fff2d5",background:disabled?"#2d2a28":"#5c4535",border:disabled?"#5a554d":"#9c7d59",minHeight:"44px",fontSize:"6px",padding:"7px"});if(!b)return;if(disabled){b.disabled=true;b.style.opacity=".55";b.style.textDecoration="line-through";}list.appendChild(b);}
  function openEMenu(s){if(!s?.__sv37ZofingiaOpen)return;closeEModal(s);const m=s.createDOMModal?.({key:"enrique-v40",width:"min(92%,570px)",background:"#e9dcc1",border:"#5e3b28",shade:"rgba(10,7,6,.62)",padding:"14px"});if(!m)return;s.__sv37EnriqueModal=m;m.panel.dataset.enriqueV40="true";m.overlay.style.zIndex="100180";
    const top=document.createElement("div");Object.assign(top.style,{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",marginBottom:"10px"});const title=s.createDOMText?.("ENRIQUE",{fontSize:"12px",color:"#4a2d21"})||document.createElement("div");const wallet=s.createDOMText?.(s.developerMode?"COINS ∞":`${Math.max(0,Number(s.coins)||0)} COINS`,{fontSize:"7px",color:"#5a3d26"})||document.createElement("div");top.append(title,wallet);const list=document.createElement("div");Object.assign(list.style,{display:"grid",gridTemplateColumns:"1fr",gap:"7px"});
    addEButton(s,list,"WO ISCH DE GENERAL?",()=>eSequence(s,[{speaker:"simon",text:"Weisch du, wo de General isch?"},{speaker:"enrique",text:"De Mobutu?"},{speaker:"enrique",text:"Ich ha ghört, de isch grad in Venedig."}],()=>openEMenu(s)));
    Object.values(ENRIQUE_FLIRTS).forEach(d=>{const bought=Boolean(state.enriquePurchased[d.flirtId]);addEButton(s,list,bought?`${d.label} · GELERNT`:`${d.label} · ${d.price} COINS`,()=>buyE(s,d),bought);});m.panel.replaceChildren(top,list);
  }
  function buyE(s,d){if(state.enriquePurchased[d.flirtId])return;const coins=Math.max(0,Number(s.coins)||0);if(!s.developerMode&&coins<d.price){eSequence(s,[{speaker:"enrique",text:"Simon... 100 Münze."},{speaker:"enrique",text:"Ich bin Enrique, nöd Caritas."}],()=>openEMenu(s));return;}if(!s.developerMode)s.coins=Math.max(0,coins-d.price);s.updateCoinHUD?.();state.enriquePurchased[d.flirtId]=true;eSequence(s,d.explanation,()=>{learn(s,d.flirtId);openEMenu(s);});}
  function inspectE(s){if(!s?.__sv37ZofingiaOpen)return;attach(s);const m=s.__sv37EnriqueModal;if(m?.panel&&!m.panel.dataset.enriqueV40&&!m.panel.dataset.__flirtSeen){m.panel.dataset.__flirtSeen="1";if(!state.enriqueIntroCompleted&&!s.enriqueSpoken){closeEModal(s);startIntro(s);}else{state.enriqueIntroCompleted=true;s.enriqueIntroCompleted=true;if(!learned("secondLook"))learn(s,"secondLook");closeEModal(s);openEMenu(s);}}else if(s.enriqueSpoken&&!state.enriqueIntroCompleted){state.enriqueIntroCompleted=true;s.enriqueIntroCompleted=true;if(!learned("secondLook"))learn(s,"secondLook");}}

  function install(g){if(!g?.scene)return;const milk=scene(g,"MilchbuckScene"),station=scene(g,"BahnhofquaiScene"),venice=scene(g,"VeniceScene"),hive=scene(g,"HiveInteriorScene");[milk,station,venice].filter(Boolean).forEach(s=>{attach(s);patchPlaybook(s);});if(hive)patchHive(hive);if(station)inspectE(station);}
  const wrapped=window.startSimonGame;if(typeof wrapped==="function")window.startSimonGame=function(options={}){const g=wrapped.call(this,options);if(g)install(g);return g;};
  const loop=()=>{const g=game();if(g)install(g);requestAnimationFrame(loop);};requestAnimationFrame(loop);

  window.SimonFlirtsV40=Object.freeze({FLIRTS,ENRIQUE_FLIRTS,WOMEN,state,learn(id){const g=game(),s=scene(g,"BahnhofquaiScene")||scene(g,"MilchbuckScene")||scene(g,"VeniceScene");return learn(s,id);},getLearned(){return state.learnedFlirts.map(id=>({id,name:FLIRTS[id]?.name||id}));},getWomanState(id="woman_hive_01"){return {...(WOMEN[id]||{}),...(womanState(id)||{})};}});
  console.info("Flirt-System v40 geladen.");
})();
