const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8').split('<script>')[1].split('</script>')[0];
const store={};
const el=()=>({innerHTML:'',className:'',textContent:'',value:'',addEventListener(){}});
const ids={};
global.window={AudioContext:null};
let blob=null;global.Blob=function(parts){blob=parts.join('')};global.URL={createObjectURL:()=>'blob:x'};
global.document={getElementById:id=>ids[id]||(ids[id]=el()),addEventListener(){},createElement:()=>({click(){},set href(v){},set download(v){}}),visibilityState:'visible'};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};
global.navigator={};global.location={protocol:'file:',search:'?selftest'};
global.structuredClone=global.structuredClone||(o=>JSON.parse(JSON.stringify(o)));
global.confirm=()=>true;global.prompt=()=>'Test';global.alert=m=>{throw new Error('alert: '+m)};
global.setInterval=()=>0;global.scrollTo=()=>{};window.scrollTo=()=>{};
let failed=0;console.assert=(c,m)=>{if(!c){failed++;console.error('ASSERT FAIL:',m)}};
const run=new Function(src+'\n;return {get S(){return S},go,startWorkout,logSet,delSet,finishWorkout,addVar,delVar,exDone,startRest,restPause,startStretch,srNext,srPause,logRun,newPlan,addGroup,addEx,delEx,render,exportData,monthCounts,today,calendar,addPlanItem,delPlanItem,exportIcs,toggleMenu,weekDates,ymd}');
const A=run();
// Gym-Flow (Übung -> Variante)
A.go('gym');A.startWorkout(0);
const K='Kniebeuge · Langhantel';
document.getElementById('kg0-0-0').value='100';document.getElementById('r0-0-0').value='5';A.logSet(0,0,0);
console.assert(A.S.activeWorkout.sets[K].length===1,'1 Satz');
console.assert(A.S.rest&&A.S.rest.end>Date.now()&&A.S.rest.end<=Date.now()+90000,'Pausentimer auto gestartet mit 90s');
console.assert(A.S.activeWorkout.plan.groups[0].exercises[0].variants.length===3,'3 Varianten Kniebeuge');
console.assert(A.exDone(A.S.activeWorkout.plan.groups[0].exercises[0]),'Übung erledigt');
// Nach Render: Feld vorbefüllt mit letztem Wert -> Haken übernimmt
const html=document.getElementById('app').innerHTML;console.assert(html.includes('id="kg0-0-0" value="100"')&&html.includes('id="r0-0-0" value="5"'),'vorbefüllt');
A.logSet(0,0,0);console.assert(A.S.activeWorkout.sets[K].length===2&&A.S.activeWorkout.sets[K][1].kg===100,'Haken übernimmt Vorwert');
A.delSet(0,0,0,1);console.assert(A.S.activeWorkout.sets[K].length===1,'delSet');
A.restPause();console.assert(A.S.rest.end===null&&A.S.rest.left>0,'rest pausiert');
const saved=JSON.parse(store.sportapp);console.assert(saved.activeWorkout.sets[K].length===1&&saved.screen==='workout','persistiert');
A.finishWorkout();
console.assert(A.S.lastSets[K][0].kg===100,'lastSets');console.assert(A.S.log.length===1&&A.S.screen==='home','log+home');
A.startWorkout(1);console.assert(document.getElementById('app').innerHTML.includes('Smith Machine'),'Push Varianten sichtbar');A.S.activeWorkout=null;
// Plan-Editor
A.newPlan();A.addGroup();A.addEx(0,'__new');A.addEx(0,'Kniebeuge');
const p=A.S.gymPlans[3];console.assert(p.name==='Test'&&p.groups[0].exercises.map(e=>e.name).join()==='Test,Kniebeuge','editor');
console.assert(p.groups[0].exercises[0].variants.join()==='Standard'&&p.groups[0].exercises[1].variants.length===3,'Varianten: neu=Standard, bekannt=kopiert');
A.addVar(0,0,'Kabel');A.addVar(0,0,'Kabel');console.assert(p.groups[0].exercises[0].variants.join()==='Standard,Kabel','addVar ohne Duplikat');
A.delVar(0,0,0);console.assert(p.groups[0].exercises[0].variants.join()==='Kabel','delVar');
console.assert(A.S.exerciseLibrary.includes('Test'),'lib erweitert');A.delEx(0,0);console.assert(p.groups[0].exercises.length===1,'delEx');
// Migration alter Daten
store.sportapp=JSON.stringify({gymPlans:[{id:'x',name:'Alt',groups:[{name:'G',exercises:['Kniebeuge']}]}],lastSets:{Kniebeuge:[{kg:1,reps:1}]},screen:'workout',log:[]});
// Laufen
A.go('run');
A.logRun(0);console.assert(A.S.log[1].type==='run'&&A.S.log[1].min===undefined,'run log (prompt "Test" → keine Minuten)');
// Dehnen
A.go('stretch');A.startStretch(0);console.assert(A.S.screen==='stretchRun','stretchRun');
A.srPause();console.assert(A.S.sr.end===null,'sr pause');A.srPause();
for(let i=0;i<5;i++)A.srNext();
console.assert(A.S.sr===null&&A.S.log[2].type==='stretch'&&A.S.screen==='home','stretch fertig');
// Zähler
const c=A.monthCounts(A.today().slice(0,7));console.assert(c.gym===1&&c.run===1&&c.stretch===1,'monatszähler '+JSON.stringify(c));
// Kalender
A.go('calendar');const wk=A.weekDates().map(A.ymd);console.assert(wk.length===7&&wk.includes(A.today()),'woche enthält heute');
A.addPlanItem(wk[0],'gym|UK');A.addPlanItem(wk[2],'run|Zone 2');A.addPlanItem(wk[0],'stretch|Standard');
console.assert(A.S.plan[wk[0]].length===2&&A.calendar().includes('Zone 2'),'plan items');
A.exportIcs();console.assert(blob&&blob.includes('BEGIN:VCALENDAR\r\n')&&(blob.match(/BEGIN:VEVENT/g)||[]).length===3&&blob.includes('DTSTART;VALUE=DATE:'+wk[0].replace(/-/g,'')),'ics export');
A.delPlanItem(wk[0],0);console.assert(A.S.plan[wk[0]].length===1,'delPlanItem');
console.assert(JSON.parse(store.sportapp).plan[wk[2]][0].name==='Zone 2','plan persistiert');
const h=(A.go('home'),document.getElementById('app').innerHTML);console.assert(h.includes('class="ring"')&&!h.includes('Gym</span>'),'home ring ohne labels');
A.toggleMenu();console.assert(document.getElementById('menu').hidden===false,'menu auf');A.go('gym');console.assert(document.getElementById('menu').hidden===true,'menu zu nach go');
// Alle Screens rendern ohne Fehler
for(const s of ['home','gym','run','stretch','history','settings','calendar'])A.go(s);
A.go('gymEdit',0);A.go('stretchEdit',0);
console.log(failed?`FAILED: ${failed}`:'ALL OK');process.exit(failed?1:0);
