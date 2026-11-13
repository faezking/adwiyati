/* Adwiyati public site — language switcher.
   The pages are written in Arabic. Each language file (i18n/<code>.json) maps
   every Arabic text on the public pages to its translation. Text that is
   tagged with a lang attribute (the native-script label samples) and Arabic
   label copies (.la) are never touched. The choice is remembered per device. */
(function(){
  var LANGS=[
    ['ar','العربية','rtl'],['en','English','ltr'],['ur','اردو','rtl'],['id','Bahasa Indonesia','ltr'],
    ['ms','Bahasa Melayu','ltr'],['bn','বাংলা','ltr'],['hi','हिन्दी','ltr'],['tl','Filipino','ltr'],
    ['tr','Türkçe','ltr'],['es','Español','ltr'],['fr','Français','ltr'],['de','Deutsch','ltr'],
    ['ja','日本語','ltr'],['ru','Русский','ltr'],['zh','中文','ltr']
  ];
  var CODES=LANGS.map(function(l){return l[0];});
  var KEY='adw.site.lang';
  var FONTS={
    ur:'family=Noto+Naskh+Arabic:wght@400;600;700',
    bn:'family=Noto+Sans+Bengali:wght@400;600;700',
    hi:'family=Noto+Sans+Devanagari:wght@400;600;700',
    ja:'family=Noto+Sans+JP:wght@400;600;700',
    zh:'family=Noto+Sans+SC:wght@400;600;700'
  };
  var SKIP='script,style,svg,[lang]:not(html),.la,[translate=no],.lgsw';
  var ATTRS=['placeholder','aria-label','title'];
  /* Short names for the five header links only, so the header keeps one line
     like the Arabic one; the same words elsewhere on the page keep their full
     translation. Order: home, pharmacies, languages, my medicine page, about. */
  var NAVK=['الرئيسية','للصيدليات','اللغات','صفحة دوائي','عن أدويتي'];
  var NAV={
    en:['Home','Pharmacies','Languages','My medicines','About'],
    id:['Beranda','Apotek','Bahasa','Obat saya','Tentang'],
    ms:['Utama','Farmasi','Bahasa','Ubat saya','Tentang'],
    bn:['হোম','ফার্মেসি','ভাষা','আমার ওষুধ','পরিচিতি'],
    hi:['होम','फ़ार्मेसी','भाषाएँ','मेरी दवाएँ','परिचय'],
    tl:['Home','Mga botika','Mga wika','Aking gamot','Tungkol'],
    tr:['Ana sayfa','Eczaneler','Diller','İlaçlarım','Hakkında'],
    es:['Inicio','Farmacias','Idiomas','Mis medicamentos','Acerca de'],
    fr:['Accueil','Pharmacies','Langues','Mes médicaments','À propos'],
    de:['Start','Apotheken','Sprachen','Meine Medikamente','Über uns'],
    ja:['ホーム','薬局の方へ','言語','お薬ページ','紹介'],
    ru:['Главная','Аптекам','Языки','Мои лекарства','О нас'],
    zh:['首页','药房','语言','我的用药','关于我们']
  };
  /* the two header buttons, where the full wording is long: sign in, request a demo */
  var BTNK=['تسجيل الدخول','اطلب عرضاً'];
  var BTN={ es:['Entrar','Pedir demo'], fr:['Connexion','Demander démo'], bn:['সাইন ইন','ডেমো চান'],
    hi:['साइन इन','डेमो माँगें'], tl:['Mag-sign in','Humingi ng demo'], tr:['Giriş','Demo isteyin'] };
  var orig=new WeakMap(), origAttr=new WeakMap(), origTitle=document.title, origDesc=null;
  var cache={};
  function norm(s){ return s.replace(/\s+/g,' ').trim(); }

  function store(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function save(c){ try{ localStorage.setItem(KEY,c); }catch(e){} }
  function pick(){
    var q=(location.search.match(/[?&]lang=([a-z]{2})/)||[])[1];
    if(q && CODES.indexOf(q)>=0) return q;
    var s=store(); if(s && CODES.indexOf(s)>=0) return s;
    var full=((navigator.languages&&navigator.languages[0])||navigator.language||'ar').toLowerCase();
    var nav=/^fil\b/.test(full)?'tl':full.slice(0,2);
    return CODES.indexOf(nav)>=0 ? nav : 'ar';
  }
  function font(c){
    if(!FONTS[c] || document.getElementById('lgfont-'+c)) return;
    var l=document.createElement('link'); l.id='lgfont-'+c; l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?'+FONTS[c]+'&display=swap'; document.head.appendChild(l);
  }
  function load(c){
    if(c==='ar') return Promise.resolve({});
    if(cache[c]) return Promise.resolve(cache[c]);
    return fetch('i18n/'+c+'.json',{cache:'force-cache'}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ cache[c]=d; return d; });
  }
  function walk(fn){
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT), n, list=[];
    while((n=w.nextNode())){ if(!n.textContent.trim()) continue; if(n.parentElement.closest(SKIP)) continue; list.push(n); }
    list.forEach(fn);
  }
  /* The page layout stays exactly as it is in Arabic for every language: the
     document keeps dir=rtl, so nothing moves from side to side. Only the text
     itself follows its own direction: each element that holds translated text
     is marked, and in a left-to-right language it gets unicode-bidi:plaintext
     (reading order and start alignment from its own words). Small rows made of
     an icon and words (a button, a list item, a badge) read left to right. */
  var BLOCKY=/^(block|list-item|table-cell|flex|grid|inline-block|inline-flex|flow-root)$/;
  /* Alignment is read once, while the page is still laid out in Arabic, and kept:
     text that sits on the right in Arabic sits on the right in every language,
     centred text stays centred. Only the order of the words follows the language. */
  function tag(e){
    if(!e || e===document.body || e.classList.contains('tx')) return;
    e.classList.add('tx');
    var a=getComputedStyle(e).textAlign;
    if(a==='start' || a==='right' || a==='-webkit-right') e.classList.add('txR');
  }
  function mark(n){
    var p=n.parentElement; if(!p) return;
    tag(p);
    var b=p; while(b && b!==document.body && !BLOCKY.test(getComputedStyle(b).display)) b=b.parentElement;
    tag(b);
  }
  function apply(c,d){
    walk(function(n){
      if(!orig.has(n)) orig.set(n,n.textContent);
      mark(n);
      var o=orig.get(n), k=norm(o);
      if(c==='ar' || !d[k]){ n.textContent=o; return; }
      var lead=o.match(/^\s*/)[0], tail=o.match(/\s*$/)[0];
      var ni=NAV[c] && n.parentElement.closest('.hd nav') ? NAVK.indexOf(k) : -1;
      var bi=BTN[c] && n.parentElement.closest('.hd .r') ? BTNK.indexOf(k) : -1;
      n.textContent=lead+(ni>=0 ? NAV[c][ni] : bi>=0 ? BTN[c][bi] : d[k])+tail;
    });
    document.querySelectorAll('['+ATTRS.join('],[')+']').forEach(function(e){
      if(e.closest(SKIP)) return;
      if(!origAttr.has(e)){ var m={}; ATTRS.forEach(function(a){ if(e.hasAttribute(a)) m[a]=e.getAttribute(a); }); origAttr.set(e,m); }
      var m=origAttr.get(e);
      Object.keys(m).forEach(function(a){ var k=norm(m[a]); e.setAttribute(a, c!=='ar' && d[k] ? d[k] : m[a]); });
      /* a translated placeholder reads in its own direction but stays where the Arabic one sits */
      if(m.placeholder && /^(INPUT|TEXTAREA)$/.test(e.tagName) && e.type!=='email' && e.type!=='url'){
        var ltr=LANGS[CODES.indexOf(c)][2]==='ltr';
        e.style.direction = ltr ? 'ltr' : ''; e.style.textAlign = ltr ? 'right' : '';
      }
    });
    document.title = c!=='ar' && d[norm(origTitle)] ? d[norm(origTitle)] : origTitle;
    var md=document.querySelector('meta[name=description]');
    if(md){ if(origDesc===null) origDesc=md.content; md.content = c!=='ar' && d[norm(origDesc)] ? d[norm(origDesc)] : origDesc; }
    var L=LANGS[CODES.indexOf(c)];
    document.documentElement.lang=c; document.documentElement.dir='rtl'; document.documentElement.setAttribute('data-tdir',L[2]);
    document.documentElement.setAttribute('data-l',c);
    var cur=document.querySelector('.lgsw .lgcur'); if(cur) cur.textContent=L[1];
    document.querySelectorAll('.lgsw [data-c]').forEach(function(b){ b.setAttribute('aria-checked', b.getAttribute('data-c')===c ? 'true':'false'); });
    fit();
  }
  /* The header must stay on one line, as it is in Arabic. Longer words in some
     languages are absorbed in steps: tighter spacing, then the language button
     shows only its globe, and only if the row still does not fit does the menu
     move to its own scrolling line (the same layout the page uses on tablets). */
  function over(w){
    var r=w.getBoundingClientRect(), cs=getComputedStyle(w);
    var L=r.left+parseFloat(cs.paddingLeft)-1, R=r.right-parseFloat(cs.paddingRight)+1;
    return w.scrollWidth > w.clientWidth + 1 || [].some.call(w.children,function(k){
      if(!k.offsetParent) return false; var q=k.getBoundingClientRect();
      return q.left < L || q.right > R || q.height > 56; });
  }
  function fit(){
    var hd=document.querySelector('.hd'), w=hd && hd.querySelector('.w'); if(!w) return;
    hd.classList.remove('t1','t2','t3','m1');
    if(window.matchMedia('(max-width:1000px)').matches){
      var tall=[].some.call(hd.querySelectorAll('.r .btn'),function(b){ return b.offsetHeight>46; });
      if(tall) hd.classList.add('m1');
      return;
    }
    ['t1','t2','t3'].some(function(k){ if(!over(w)) return true; hd.classList.add(k); return false; });
  }
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(fit,120); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  function set(c,remember){
    font(c);
    load(c).then(function(d){ apply(c,d); if(remember) save(c); })
      .catch(function(){ apply('ar',{}); });
  }

  var GLOBE='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
  function build(){
    var host=document.querySelector('.hd .r'); if(!host) return;
    var w=document.createElement('div'); w.className='lgsw';
    w.innerHTML='<button type="button" class="lgbtn" aria-haspopup="true" aria-expanded="false" aria-label="Language / اللغة">'+GLOBE+'<span class="lgcur"></span></button>'+
      '<div class="lgmenu" role="menu" hidden>'+LANGS.map(function(l){
        return '<button type="button" role="menuitemradio" data-c="'+l[0]+'" lang="'+l[0]+'" dir="'+l[2]+'">'+l[1]+'</button>'; }).join('')+'</div>';
    host.insertBefore(w,host.firstChild);
    var btn=w.querySelector('.lgbtn'), menu=w.querySelector('.lgmenu');
    function close(){ menu.hidden=true; btn.setAttribute('aria-expanded','false'); }
    btn.addEventListener('click',function(e){ e.stopPropagation(); var o=menu.hidden; menu.hidden=!o; btn.setAttribute('aria-expanded',String(o)); });
    menu.addEventListener('click',function(e){ var b=e.target.closest('[data-c]'); if(!b) return; set(b.getAttribute('data-c'),true); close(); });
    document.addEventListener('click',function(e){ if(!w.contains(e.target)) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  }
  var css=document.createElement('style');
  css.textContent=
    '.lgsw{position:relative;display:inline-flex}'+
    '.lgbtn{display:inline-flex;align-items:center;gap:7px;background:transparent;border:1.5px solid #D8D2C3;color:#2F4A2A;border-radius:999px;padding:9px 14px;font:600 14px Inter,"IBM Plex Sans Arabic",sans-serif;cursor:pointer}'+
    '.lgbtn:hover,.lgbtn[aria-expanded=true]{border-color:#2F4A2A}'+
    '.lgbtn:focus-visible{outline:3px solid #E08A1E;outline-offset:2px}'+
    '.lgmenu{position:absolute;top:calc(100% + 8px);inset-inline-end:0;z-index:60;background:#FFFDF8;border:1px solid #E7E1D2;border-radius:16px;box-shadow:0 24px 48px -20px rgba(40,50,25,.35);padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:2px;width:340px}'+
    '.lgmenu[hidden]{display:none}'+
    '.lgmenu button{background:none;border:0;border-radius:10px;padding:10px 12px;font:500 15px Inter,"IBM Plex Sans Arabic","Noto Sans Bengali","Noto Sans Devanagari","Noto Sans JP","Noto Sans SC",sans-serif;color:#1C2B1A;cursor:pointer;text-align:start}'+
    '.lgmenu button:hover{background:#F4EBDA}'+
    '.lgmenu button[aria-checked=true]{background:#2F4A2A;color:#fff}'+
    'html[data-tdir=ltr] .tx{unicode-bidi:plaintext}'+'html[data-tdir=ltr] .txR{text-align:right}html[data-tdir=ltr] .btn,html[data-tdir=ltr] .lgbtn{direction:ltr}'+'html[data-tdir=ltr] .btn svg:has(path[d^="M19 12H5"]){transform:scaleX(-1)}'+'html[data-tdir=ltr] input,html[data-tdir=ltr] textarea{unicode-bidi:plaintext}'+'.cta-row .btn{max-width:100%}.hd nav a,.hd .brand b,.hd .r .btn,.lgbtn{white-space:nowrap}.lgsw,.hd .brand{flex-shrink:0}'+'@media (min-width:1001px){.hd .w{column-gap:28px}}'+'.hd.t1 nav{gap:22px}.hd.t1 .r{gap:10px}.hd.t1 .r .btn{padding:9px 15px!important;font-size:14.5px!important}'+'.hd.t2 nav{gap:16px;font-size:15px}.hd.t2 .lgbtn .lgcur{display:none}.hd.t2 .lgbtn{padding:9px 11px}.hd.t2 .brand b{font-size:22px!important}'+'.hd.m1 .r .btn{font-size:13px!important;padding:8px 11px!important;white-space:nowrap}.hd.m1 .r{gap:6px}'+'.hd.t3 .w{flex-wrap:wrap;height:auto;padding-top:12px;padding-bottom:0;gap:8px}.hd.t3 nav{order:3;width:100%;overflow-x:auto;gap:22px;padding:6px 0 10px;font-size:15px;white-space:nowrap;scrollbar-width:none}.hd.t3 .lgbtn .lgcur{display:inline}'+
    '@media (max-width:560px){.lgsw{position:static}.lgmenu{left:16px;right:16px;inset-inline-end:auto;width:auto;top:calc(100% + 6px);max-height:calc(100vh - 160px);overflow:auto}.lgbtn{padding:8px 10px}.lgbtn .lgcur{display:none}.hd .r{min-width:0;flex:0 1 auto;gap:8px}.hd .r .btn{white-space:normal;line-height:1.2;text-align:center;max-width:44vw}.hd .w>*:first-child{min-width:0}main .btn,.lf .btn{white-space:normal;text-align:center;line-height:1.3;max-width:100%}.lw{grid-template-columns:minmax(0,1fr)!important}}'+
    /* script fonts for the interface text; native-script samples keep their own rules */
    'html[data-tdir=ltr] body{font-family:Inter,"IBM Plex Sans Arabic",sans-serif}'+
    'html[data-l=ur] body,html[data-l=ur] h1,html[data-l=ur] h2,html[data-l=ur] h3,html[data-l=ur] .h2,html[data-l=ur] .btn,html[data-l=ur] nav a{font-family:"Noto Naskh Arabic","IBM Plex Sans Arabic",serif}'+
    'html[data-l=bn] body,html[data-l=bn] h1,html[data-l=bn] h2,html[data-l=bn] h3,html[data-l=bn] .h2,html[data-l=bn] .btn,html[data-l=bn] nav a{font-family:"Noto Sans Bengali",Inter,sans-serif}'+
    'html[data-l=hi] body,html[data-l=hi] h1,html[data-l=hi] h2,html[data-l=hi] h3,html[data-l=hi] .h2,html[data-l=hi] .btn,html[data-l=hi] nav a{font-family:"Noto Sans Devanagari",Inter,sans-serif}'+
    'html[data-l=ja] body,html[data-l=ja] h1,html[data-l=ja] h2,html[data-l=ja] h3,html[data-l=ja] .h2,html[data-l=ja] .btn,html[data-l=ja] nav a{font-family:"Noto Sans JP",Inter,sans-serif}'+
    'html[data-l=zh] body,html[data-l=zh] h1,html[data-l=zh] h2,html[data-l=zh] h3,html[data-l=zh] .h2,html[data-l=zh] .btn,html[data-l=zh] nav a{font-family:"Noto Sans SC",Inter,sans-serif}'+
    'html[data-tdir=ltr] h1,html[data-tdir=ltr] h2,html[data-tdir=ltr] .h2{letter-spacing:-.01em}'+
    'html[data-l=ur] h1,html[data-l=ur] h2,html[data-l=ur] .h2{line-height:1.5}';
  document.head.appendChild(css);

  function start(){ build(); var c=pick(); if(c!=='ar') set(c,false); else apply('ar',{}); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
