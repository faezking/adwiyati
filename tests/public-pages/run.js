// Smoke test for the public website.
// Opens every public page in all 15 languages at three screen widths and fails on:
// a script error, horizontal overflow, or text that was left untranslated.
//
//   node tests/public-pages/run.js
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const SITE=path.resolve(__dirname,'../../site');
const PAGES=['home','pharmacies','languages','about','login'];
const LANGS=['ar','en','ur','bn','hi','tl','id','ms','es','tr','fr','de','ja','ru','zh'];
const WIDTHS=[1440,820,390];
(async()=>{
  const b=await chromium.launch(); let checks=0; const problems=[];
  for(const w of WIDTHS) for(const lang of LANGS){
    const ctx=await b.newContext({viewport:{width:w,height:900}});
    await ctx.route('**/*',r=>{const u=new URL(r.request().url());
      if(u.host!=='t.local') return r.abort();
      const f=path.join(SITE,decodeURIComponent(u.pathname));
      return fs.existsSync(f)&&fs.statSync(f).isFile()?r.fulfill({path:f}):r.fulfill({status:404,body:''});});
    await ctx.addInitScript(l=>{try{localStorage.setItem('adw.site.lang',l)}catch(e){}},lang);
    for(const pg of PAGES){
      const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      await p.goto('http://t.local/'+pg+'.html'); await p.waitForTimeout(250);
      const r=await p.evaluate(()=>({over:document.documentElement.scrollWidth-window.innerWidth,
        lang:document.documentElement.lang, h1:(document.querySelector('h1')||{}).textContent||''}));
      checks++;
      if(errs.length) problems.push(`${pg} ${lang} ${w}: script error: ${errs[0]}`);
      if(r.over>1) problems.push(`${pg} ${lang} ${w}: horizontal overflow ${r.over}px`);
      if(r.lang!==lang) problems.push(`${pg} ${lang} ${w}: page language is "${r.lang}"`);
      if(!['ar','ur'].includes(lang) && /[ء-ي]{4,}/.test(r.h1)) problems.push(`${pg} ${lang} ${w}: heading not translated`);
      await p.close();
    }
    await ctx.close();
  }
  problems.forEach(x=>console.log('PROBLEM:',x));
  console.log(`page checks: ${checks} · problems: ${problems.length}`);
  process.exitCode=problems.length?1:0; await b.close();
})();
