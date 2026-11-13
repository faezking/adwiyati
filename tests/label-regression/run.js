// Label regression test.
// Renders the reference prescriptions through the real staff page (site/index.html)
// with a snapshot of the reviewed phrase dictionary, then compares every label
// image with the approved baseline (byte-identical PNG = pass).
//
//   npm i playwright && npx playwright install chromium
//   node tests/label-regression/run.js
//
// No sign-in and no network are used: every request outside the local files is blocked.
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
const SITE=path.resolve(__dirname,'../../site');
const PHR=fs.readFileSync(path.join(__dirname,'dictionary.snapshot.json'),'utf8');
const cases=JSON.parse(fs.readFileSync(path.join(__dirname,'cases.json'),'utf8'));
const BASE=path.join(__dirname,'baseline'); const OUT=path.join(__dirname,'out');
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1300,height:1000}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',async r=>{const u=r.request().url();
   if(u.startsWith('http://t.local/')){const f=path.join(SITE,decodeURIComponent(u.slice(15).split('?')[0])||'index.html');
     if(!fs.existsSync(f)) return r.fulfill({status:404,body:''});
     let body=fs.readFileSync(f); if(f.endsWith('index.html')){ body=body.toString().replace(/(<script type="application\/json" id="phrasesData">)[\s\S]*?(<\/script>)/,(m,a,c)=>a+PHR.replace(/<\/script/g,'<\\/script')+c); }
     return r.fulfill({status:200,body,contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':undefined});}
   return r.abort();});
 // labels print the dispensing date, so the clock is fixed to the day the baseline was approved
 await p.clock.setFixedTime(new Date('2026-11-10T09:00:00'));
 await p.goto('http://t.local/index.html?staff'); await p.waitForTimeout(800);
 await p.evaluate(()=>{ addLanguagesShippedWithPage(PHRASES); appStarted=true; startApp(); });
 await p.waitForTimeout(500);
 for(const c of cases){
   const res=await p.evaluate(async c=>{
     const $=id=>document.getElementById(id);
     // pick the medicine through the search, as a pharmacist does
     const s=$('drugSearch'); s.value=c.q; s.dispatchEvent(new Event('input',{bubbles:true}));
     await new Promise(r=>setTimeout(r,150));
     const all=[...document.querySelectorAll('#drugs .drug')];
     const btn=all.find(x=>x._d && !x._prod && (x._d.name.en||'').toLowerCase().includes(c.drug.toLowerCase())) || all.find(x=>x.offsetParent);
     btn.click(); await new Promise(r=>setTimeout(r,100));
     const set=(id,v)=>{ if(v==null) return; const e=$(id); e.value=v; e.dispatchEvent(new Event('change',{bubbles:true})); };
     set('amount',c.amount); set('freq',c.freq); set('timing',c.timing); set('days',c.days);
     document.querySelectorAll('#auxList input').forEach(x=>{x.checked=(c.aux||[]).includes(x.value);});
     if($('pName')) $('pName').value=c.name||'';
     const li=PHRASES.languages.findIndex(l=>l.code===c.lang); const lb=document.getElementById('langs').children[li];
     if(lb) lb.click(); await new Promise(r=>setTimeout(r,80));
     set('optSize',c.size);
     $('checked').checked=true; if($('printStatus')) $('printStatus').textContent='';
     $('makeBtn').click();
     await new Promise(r=>setTimeout(r,2500));
     const imgs=[...document.querySelectorAll('#sheet .canvasLabel img')].map(i=>({src:i.src,alt:i.alt}));
     const prob=(document.getElementById('printStatus')||{}).textContent||'';
     return {imgs, prob, langBtn: !!lb, drug: btn&&btn._d&&btn._d.name.en};
   },c);
   res.imgs.forEach((im,i)=>{ if(im.src.startsWith('data:image/png')) fs.writeFileSync(path.join(OUT,`${c.id}_${i}.png`),Buffer.from(im.src.split(',')[1],'base64')); });
   console.log(c.id, 'imgs',res.imgs.length,'lang',res.langBtn,res.drug,'|',res.prob.slice(0,160));
 }
 let pass=0, fail=0;
 for(const f of fs.readdirSync(BASE).filter(f=>f.endsWith('.png'))){
   const md5=p=>crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
   const o=path.join(OUT,f);
   if(fs.existsSync(o) && md5(o)===md5(path.join(BASE,f))) pass++; else { fail++; console.log('DIFFERENT:',f); }
 }
 console.log(`labels compared: ${pass+fail} · identical: ${pass} · different: ${fail} · page errors: ${errs.length}`);
 process.exitCode = (fail||errs.length) ? 1 : 0;
 await b.close();})();
