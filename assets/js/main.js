const OFFER={checkoutUrl:'https://pay.kiwify.com.br/hlngerK',value:47,currency:'BRL',name:'Looks Inteligentes'};
const $=id=>document.getElementById(id);
const IMG='assets/img/';
const PHOTO_SIZES='(max-width: 760px) 80vw, 100vw';
const photoSet=name=>[640,960,1440].map(w=>`${IMG}${name}-${w}.webp ${w}w`).join(', ');
const PRODUCT=IMG+'ebook-looks-inteligentes.webp';
function setPhoto(img,name){if(img.dataset.photo===name)return;img.dataset.photo=name;img.sizes=PHOTO_SIZES;img.srcset=photoSet(name);img.src=`${IMG}${name}-640.webp`}
const preloaded=new Set();
function preloadPhoto(name){if(!name||preloaded.has(name))return;preloaded.add(name);const img=new Image();img.sizes=PHOTO_SIZES;img.srcset=photoSet(name);img.src=`${IMG}${name}-640.webp`}
function preloadSrc(src){if(preloaded.has(src))return;preloaded.add(src);const img=new Image();img.src=src}

/* Meta Pixel: each event fires once per session, even after back, review or restart. */
const fired=(()=>{try{return new Set(JSON.parse(sessionStorage.getItem('villa-d-px')||'[]'))}catch{return new Set()}})();
function track(key,name,params,standard){if(fired.has(key))return;fired.add(key);try{sessionStorage.setItem('villa-d-px',JSON.stringify([...fired]))}catch{}if(typeof fbq!=='function')return;standard?fbq('track',name,params):fbq('trackCustom',name,params)}
function trackProgress(answered){const pct=Math.round(answered/questions.length*100);[25,50,75,100].forEach(m=>{if(pct>=m)track('p'+m,'Quiz'+m,{perguntas_respondidas:answered,total_perguntas:questions.length})})}
const questions=[
 {
  "label": "Seu armário hoje",
  "title": "Abriu o armário. E aí?",
  "options": [
   "Tenho roupa, mas não sei combinar.",
   "Vou no mesmo look de sempre.",
   "Troco várias vezes e ainda fico na dúvida."
  ],
  "photo": "q1-armario"
 },
 {
  "label": "As peças que ficam para depois",
  "title": "E aquela roupa que você quase não usa?",
  "options": [
   "Gosto dela, mas não sei com o que usar.",
   "Uso quase tudo, mas sempre do mesmo jeito.",
   "Experimento e tiro. Parece que falta algo."
  ],
  "photo": "q2-pecas"
 },
 {
  "label": "O tempo que vai embora",
  "title": "Na hora de sair, o que costuma acontecer?",
  "options": [
   "Perco tempo tentando fazer as peças combinarem.",
   "Vou no look de sempre para ganhar tempo.",
   "Troco os detalhes e ainda saio na dúvida."
  ],
  "photo": "q3-tempo"
 },
 {
  "label": "Quando você compra",
  "title": "Uma peça nova costuma resolver?",
  "options": [
   "Nem sempre. Ela vira mais uma peça difícil de usar.",
   "Por um tempo. Depois volto aos mesmos looks.",
   "Compro pouco. Quero aprender a usar melhor o que tenho."
  ],
  "photo": "q4-compra"
 },
 {
  "label": "Na frente do espelho",
  "title": "O look está pronto. Como você se sente?",
  "options": [
   "Podia aproveitar muito mais essas roupas.",
   "Está bom, mas de novo a mesma combinação.",
   "Falta um toque para eu me sentir mais segura."
  ],
  "photo": "q5-espelho"
 },
 {
  "label": "O que está faltando",
  "title": "O que mais trava um look diferente?",
  "options": [
   "Não saber quais peças funcionam juntas.",
   "Faltar uma ideia fácil de colocar em prática.",
   "Ter dúvida sobre proporção e acessórios."
  ],
  "photo": "q6-detalhes"
 },
 {
  "label": "A mudança que você quer",
  "title": "O que faria mais diferença na sua rotina?",
  "options": [
   "Usar as peças que hoje ficam paradas.",
   "Me arrumar com facilidade e variar mais.",
   "Me olhar no espelho com mais confiança."
  ],
  "photo": "q7-confianca"
 },
 {
  "label": "Seu próximo passo",
  "title": "O que te ajudaria a começar hoje?",
  "options": [
   "Fórmulas para criar novas combinações.",
   "Looks de referência para adaptar.",
   "Um caminho para acertar nos detalhes."
  ],
  "photo": "q8-comecar"
 }
];
const profiles=[
{cta:'Quero criar novos looks',focus:'Seu foco é criar combinações novas. Cada fórmula traz 6 formas de usar e mostra o que mudou de um look para o outro.',label:'Seu foco: novas combinações',title:'Faça suas roupas virarem novos looks.',text:'Escolha uma fórmula. Adapte com suas peças. Experimente uma combinação que você ainda não tinha visto.'},
{cta:'Quero looks mais práticos',focus:'Seu foco é praticidade. Você abre o guia, escolhe uma fórmula e já tem 6 referências para adaptar.',label:'Seu foco: praticidade',title:'Chega de começar o look do zero.',text:'Abra o guia, escolha uma referência e adapte. Um ponto de partida para variar com mais facilidade.'},
{cta:'Quero vestir com mais confiança',focus:'Seu foco é confiança. Cada fórmula explica por que funciona. Assim você monta o look com intenção, não no chute.',label:'Seu foco: confiança',title:'Vista suas peças com mais confiança.',text:'Use as fórmulas e os detalhes de composição para montar looks com mais intenção. Comece pelo que você já tem.'}
];
let redirecting=false,step=0,answers=[],locked=false,selectTimer=null,frame=null,doneTimer=null,toastTimer=null,current='intro',lastStage=-1;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function save(){try{sessionStorage.setItem('villa-d-stories-v16',JSON.stringify({answers,step,current,proofIndex}))}catch{}}
function show(id,focusId){if(typeof updateBar==='function')queueMicrotask(updateBar);cancelAnimationFrame(frame);clearTimeout(doneTimer);clearTimeout(selectTimer);locked=false;current=id;document.querySelectorAll('.screen').forEach(el=>{const active=el.id===id;el.classList.toggle('active',active);el.hidden=!active});window.scrollTo({top:0,behavior:'instant'});if(focusId)$(focusId).focus({preventScroll:true});save()}
function renderQuestion(){const q=questions[step];setPhoto($('quiz-img'),q.photo);preloadPhoto(questions[step+1]?.photo);$('q-title').textContent=q.title;$('q-label').textContent=q.label;$('quiz-count').textContent=String(step+1).padStart(2,'0')+' / '+String(questions.length).padStart(2,'0');$('bars').innerHTML=Array.from({length:questions.length+4},(_,i)=>`<i class="${i<step+1?'done':i===step+1?'current':''}"></i>`).join('');$('remaining').textContent=step===questions.length-1?'Seu resultado vem a seguir':`Falta${step===questions.length-2?'':'m'} ${questions.length-1-step} resposta${step===questions.length-2?'':'s'}`;$('options').replaceChildren();q.options.forEach((text,i)=>{const btn=document.createElement('button');btn.className='option';btn.type='button';btn.setAttribute('aria-pressed',answers[step]===i?'true':'false');if(answers[step]===i)btn.classList.add('selected');const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+i);letter.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=text;const arrow=document.createElement('span');arrow.className='option-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');btn.append(letter,label,arrow);btn.addEventListener('click',()=>answer(i,btn));$('options').append(btn)});$('question').classList.remove('enter');void $('question').offsetWidth;$('question').classList.add('enter');show('quiz','q-title')}
function answer(value,btn){if(locked)return;locked=true;answers[step]=value;trackProgress(step+1);document.querySelectorAll('.option').forEach(el=>{el.disabled=true;el.classList.toggle('selected',el===btn);el.setAttribute('aria-pressed',el===btn?'true':'false')});save();selectTimer=setTimeout(()=>{if(step<questions.length-1){step++;renderQuestion()}else{startProcessing()}},reduced?50:220)}
function getProfile(){const scores=[0,0,0];answers.forEach((a,i)=>scores[a]+=i===6?2:1);const max=Math.max(...scores);return profiles[scores[answers[6]]===max?answers[6]:scores.indexOf(max)]}
function renderResult(){$('product-img').src=PRODUCT;track('vc','ViewContent',{content_name:OFFER.name,value:OFFER.value,currency:OFFER.currency},true);const profile=getProfile();$('result-profile').textContent=profile.label;$('result-title').textContent=profile.title;$('result-text').textContent=profile.text;$('result-evidence').textContent='“'+questions[0].options[answers[0]]+'”';$('result-goal').textContent='“'+questions[6].options[answers[6]]+'”';$('result-focus').textContent=profile.focus;show('result','result-title')}
function setProgress(percent){$('percent').textContent=percent;$('progress-fill').style.width=percent+'%';$('progress').setAttribute('aria-valuenow',percent);const stage=percent<34?0:percent<72?1:2;if(stage!==lastStage){lastStage=stage;$('process-note').textContent=['Reunindo suas respostas…',getProfile().label+'.','Preparando seu próximo passo…'][stage];document.querySelectorAll('.process-step').forEach((el,i)=>{el.classList.toggle('active',i===stage);el.classList.toggle('complete',i<stage)})}if(percent===100){$('process-note').textContent='Pronto. Bora ao seu próximo look?';document.querySelectorAll('.process-step').forEach(el=>el.classList.add('complete'))}}
function startProcessing(){setPhoto($('processing-img'),questions[questions.length-1].photo);preloadPhoto('diagnostico');proofItems.forEach(item=>preloadSrc(item.src));preloadSrc(PRODUCT);show('processing','process-title');lastStage=-1;setProgress(0);const duration=reduced?650:2900;const start=performance.now();function tick(now){const ratio=Math.min((now-start)/duration,1);setProgress(Math.min(100,Math.floor((1-Math.pow(1-ratio,1.2))*100)));if(ratio<1)frame=requestAnimationFrame(tick);else doneTimer=setTimeout(renderDiagnosis,reduced?50:350)}frame=requestAnimationFrame(tick)}
function buy(){let checkout;try{checkout=new URL(OFFER.checkoutUrl);if(checkout.protocol!=='https:')throw new Error()}catch{$('toast').textContent='O link de compra ainda não está disponível. Tente novamente em breve.';$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true},4500);return}new URLSearchParams(location.search).forEach((v,k)=>{if(!checkout.searchParams.has(k))checkout.searchParams.set(k,v)});if(redirecting)return;redirecting=true;track('checkout','CliqueCheckout',{content_name:OFFER.name,value:OFFER.value,currency:OFFER.currency});setTimeout(()=>window.location.assign(checkout.href),typeof fbq==='function'?300:0)}
function startQuiz(){track('start','QuizInicio');step=0;renderQuestion()}
$('start').addEventListener('click',startQuiz);$('intro').addEventListener('click',e=>{if(!e.target.closest('#start'))startQuiz()});$('tap-back').addEventListener('click',()=>$('back').click());$('back').addEventListener('click',()=>{if(locked)return;if(step>0){step--;renderQuestion()}else show('intro','intro-title')});$('restart').addEventListener('click',()=>{answers=[];step=0;proofIndex=0;$('toast').hidden=true;show('intro','intro-title')});document.querySelectorAll('.buy').forEach(btn=>btn.addEventListener('click',buy));window.addEventListener('pageshow',()=>{redirecting=false});
const bar=$('buy-bar'),seen=new Map();
function updateBar(){const visible=current==='result'&&!seen.get('final-offer');bar.classList.toggle('show',visible);bar.setAttribute('aria-hidden',String(!visible));bar.querySelector('button').tabIndex=visible?0:-1}
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{entries.forEach(e=>seen.set(e.target.id,e.isIntersecting));updateBar()});io.observe($('final-offer'));new IntersectionObserver(entries=>{if(current==='result'&&entries.some(e=>e.isIntersecting))track('oferta','VerOferta',{content_name:OFFER.name,value:OFFER.value,currency:OFFER.currency})},{threshold:.35}).observe($('final-offer'))}
document.querySelectorAll('.sample').forEach(btn=>btn.addEventListener('click',()=>{$('sample-large').src=btn.dataset.src;$('sample-large').alt=btn.dataset.alt;$('sample-dialog').showModal()}));
const goTo=id=>$(id).scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});$('scroll-cue').addEventListener('click',()=>goTo('inside-title'));$('bar-go').addEventListener('click',()=>goTo('final-offer'));
$('sample-close').addEventListener('click',()=>$('sample-dialog').close());$('see-prints').addEventListener('click',renderProof);
const conclusions=[
{title:'Você tem peças. Falta enxergar os looks.',text:'Suas respostas apontam para peças que não viram combinações. O armário tem opções, mas a sensação de “não tenho o que vestir” continua. Comprar outra peça pode manter esse ciclo.',bridge:'O próximo passo é ter uma fórmula para combinar. O Looks Inteligentes mostra caminhos para começar com suas peças.'},
{title:'A pressa está escolhendo seus looks por você.',text:'Pelas suas respostas, a pressa te leva ao look de sempre. Você resolve a saída, mas deixa a vontade de variar para depois. Amanhã, a mesma dúvida volta.',bridge:'Você precisa de um ponto de partida. No Looks Inteligentes, escolha uma referência e adapte à sua rotina.'},
{title:'A dúvida está travando suas escolhas.',text:'Suas respostas sugerem que a dúvida pesa mais que a falta de roupa. Você experimenta, troca, ajusta. E nem sempre sai se sentindo tão bem quanto gostaria.',bridge:'O Looks Inteligentes te ajuda a entender composição e detalhes para experimentar com mais clareza.'}
];
function renderDiagnosis(){track('diag','QuizDiagnostico');setPhoto($('diagnosis-img'),'diagnostico');const conclusion=conclusions[profiles.indexOf(getProfile())];$('diagnosis-title').textContent=conclusion.title;$('diagnosis-text').textContent=conclusion.text;$('diagnosis-evidence').textContent='“'+questions[0].options[answers[0]]+'”';$('diagnosis-goal').textContent='“'+questions[6].options[answers[6]]+'”';$('diagnosis-bridge').textContent=conclusion.bridge;show('diagnosis','diagnosis-title')}
const proofItems=[{"quote": "“agora entendi pq eu travava tanto pra montar look”", "alt": "Conversa: leitora conta que fez o quiz, se identificou, entendeu por que travava pra montar look e está amando o e-book, que achou bem explicado e prático.", "src": "assets/img/relato-quiz-ebook.webp", "top": 200, "bottom": 1508}, {"quote": "“me senti arrumada sem parecer montada demais”", "alt": "Conversa: leitora manda foto do look que montou com uma das ideias e conta que nunca tinha pensado nessa combinação.", "src": "assets/img/relato-look-pronto.webp", "top": 162, "bottom": 1505}, {"quote": "“já consegui separar uns looks pra usar essa semana”", "alt": "Conversa: leitora conta que achou o e-book prático, separou looks pra semana e ficou animada pra testar combinações novas.", "src": "assets/img/relato-looks-semana.webp", "top": 198, "bottom": 1262}];
let proofIndex=0;
function cropConversation(id,item){const target=$(id);target.style.setProperty('--crop-aspect',String(941/(item.bottom-item.top)));target.style.setProperty('--crop-shift',String(-item.top/1672*100)+'%')}
function updateProof(){const item=proofItems[proofIndex];cropConversation('proof-crop',item);$('proof-image').src=item.src;$('proof-image').alt=item.alt;$('proof-quote').textContent=item.quote;$('proof-count').textContent=String(proofIndex+1).padStart(2,'0')+' / 03';save()}
function renderProof(){track('proof','QuizRelatos');updateProof();show('proof','proof-title')}
function changeProof(delta){proofIndex=(proofIndex+delta+proofItems.length)%proofItems.length;updateProof()}
function openProof(){const item=proofItems[proofIndex];cropConversation('proof-crop-large',item);$('proof-large').src=item.src;$('proof-large').alt=item.alt;$('dialog-count').textContent=String(proofIndex+1)+' de 3';$('proof-dialog').showModal()}
$('proof-prev').addEventListener('click',()=>changeProof(-1));$('proof-next').addEventListener('click',()=>changeProof(1));$('proof-enlarge').addEventListener('click',openProof);$('proof-close').addEventListener('click',()=>$('proof-dialog').close());$('proof-dialog').addEventListener('close',()=>$('proof-enlarge').focus());$('proof-back').addEventListener('click',renderDiagnosis);$('see-offer').addEventListener('click',renderResult);

$('see-solution').addEventListener('click',renderProof);$('back-result').addEventListener('click',renderProof);$('review-answers').addEventListener('click',()=>{step=0;renderQuestion()});

try{const saved=JSON.parse(sessionStorage.getItem('villa-d-stories-v16'));if(saved&&Array.isArray(saved.answers)&&saved.answers.length<=questions.length&&saved.answers.every(a=>Number.isInteger(a)&&a>=0&&a<=2)&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<questions.length){answers=saved.answers;step=Math.min(saved.step,answers.length);proofIndex=Number.isInteger(saved.proofIndex)&&saved.proofIndex>=0&&saved.proofIndex<3?saved.proofIndex:0;if(saved.current==='proof'&&answers.length===questions.length)renderProof();else if(saved.current==='diagnosis'&&answers.length===questions.length)renderDiagnosis();else if(saved.current==='result'&&answers.length===questions.length)renderResult();else if(saved.current==='processing'&&answers.length===questions.length)startProcessing();else if(saved.current==='quiz'&&step<questions.length)renderQuestion()}}catch{}
