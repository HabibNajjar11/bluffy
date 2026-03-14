import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, set, get, onValue, off, update, remove } from "firebase/database";
import QRCode from "react-qr-code";

// ═══ FLAGS ═══
const FC={"Japan":"jp","France":"fr","South Korea":"kr","Mexico":"mx","Thailand":"th","Colombia":"co","Romania":"ro","Ivory Coast":"ci","Brazil":"br","Germany":"de","Italy":"it","Canada":"ca","Australia":"au","India":"in","China":"cn","Russia":"ru","United States":"us","United Kingdom":"gb","Spain":"es","Turkey":"tr","Egypt":"eg","Argentina":"ar","Sweden":"se","Norway":"no","Denmark":"dk","Poland":"pl","Hungary":"hu","Austria":"at","Belgium":"be","Netherlands":"nl","Portugal":"pt","Ireland":"ie","Iceland":"is","Greece":"gr","Switzerland":"ch","Finland":"fi","Czech Republic":"cz","Croatia":"hr","Ukraine":"ua","Israel":"il","Saudi Arabia":"sa","Nigeria":"ng","South Africa":"za","Kenya":"ke","Morocco":"ma","Nepal":"np","Mongolia":"mn","Chad":"td","Cuba":"cu","Peru":"pe","Chile":"cl","Jamaica":"jm","Ghana":"gh","Tanzania":"tz","New Zealand":"nz","Singapore":"sg","Malaysia":"my","Indonesia":"id","Philippines":"ph","Vietnam":"vn","Pakistan":"pk","Bangladesh":"bd","Iran":"ir","Jordan":"jo","Qatar":"qa","Kuwait":"kw","Bahrain":"bh","Oman":"om","Lebanon":"lb","Estonia":"ee","Latvia":"lv","Lithuania":"lt","Slovenia":"si","Slovakia":"sk","Albania":"al","Georgia":"ge","Kazakhstan":"kz","Costa Rica":"cr","Panama":"pa","Paraguay":"py","Uruguay":"uy","Bolivia":"bo","Ecuador":"ec","Venezuela":"ve","Haiti":"ht","Dominican Republic":"do","Trinidad and Tobago":"tt"};
const flagUrl=(c)=>{const x=FC[c];return x?`https://flagcdn.com/w160/${x}.png`:null;};

// Questions loaded from external file
import QS from "./questions";

const ICONS={general_knowledge:"🧠",history:"📜",geography:"🌍",flags:"🏳️",movies:"🎬",cartoons:"📺",famous:"⭐",sport:"🏆",football:"⚽",fashion:"👗",strange_questions:"🤯",science:"🔬"};
const CATS=Object.keys(ICONS);
const EMO=["😎","🤩","🥳","😏","🤓"];

// ═══ AVATARS ═══
const AVATARS=[
  {id:"ninja",emoji:"🥷",label:"Ninja",bg:"linear-gradient(135deg,#1a1a2e,#16213e)"},
  {id:"dragon",emoji:"🐉",label:"Dragon",bg:"linear-gradient(135deg,#b91c1c,#f59e0b)"},
  {id:"alien",emoji:"👾",label:"Alien",bg:"linear-gradient(135deg,#7c3aed,#2dd4bf)"},
  {id:"robot",emoji:"🤖",label:"Robot",bg:"linear-gradient(135deg,#475569,#94a3b8)"},
  {id:"wizard",emoji:"🧙",label:"Wizard",bg:"linear-gradient(135deg,#4338ca,#a855f7)"},
  {id:"pirate",emoji:"🏴‍☠️",label:"Pirate",bg:"linear-gradient(135deg,#78350f,#d97706)"},
  {id:"ghost",emoji:"👻",label:"Ghost",bg:"linear-gradient(135deg,#334155,#cbd5e1)"},
  {id:"devil",emoji:"😈",label:"Devil",bg:"linear-gradient(135deg,#7f1d1d,#dc2626)"},
  {id:"unicorn",emoji:"🦄",label:"Unicorn",bg:"linear-gradient(135deg,#db2777,#a78bfa)"},
  {id:"skull",emoji:"💀",label:"Skull",bg:"linear-gradient(135deg,#1e1b4b,#6366f1)"},
  {id:"fox",emoji:"🦊",label:"Fox",bg:"linear-gradient(135deg,#c2410c,#fb923c)"},
  {id:"cat",emoji:"🐱",label:"Cat",bg:"linear-gradient(135deg,#854d0e,#fbbf24)"},
];

const T={en:{appName:"Bluffy",tagline:"Bluff your way to the win!",createGame:"Create Game",joinGame:"Join Game",enterName:"Your name",enterCode:"Room code",join:"Join",start:"Start Game!",players:"Players",settings:"Settings",time:"Time/question",sec:"sec",rounds:"Rounds",cats:"Categories",all:"All",none:"None",pickCat:"Pick a Category!",turn:"'s turn",typeAns:"Type answer...",submit:"Submit",waiting:"Waiting for others...",bluffMsg:"Correct! Type a plausible WRONG answer.",typeBluff:"Fake answer...",sendBluff:"Submit Bluff",skip:"Skip",choose:"Pick the correct answer",round:"Round",of:"of",pts:"pts",correct:"Correct",fooled:"fooled",scoreboard:"Scoreboard",next:"Next Round",over:"Game Over!",winner:"Winner!",again:"Play Again",menu:"Menu",kick:"Kick",leave:"Leave",host:"Host",wroteBy:"by",selfFool:"picked own bluff!",flag:"Which country's flag?",allAns:"All Answers",auto:"Auto",share:"Share code:",or:"or scan QR:",copied:"Copied!",copy:"Copy Link",waitHost:"Waiting for host...",youAnswered:"Answer submitted!",general_knowledge:"General Knowledge",history:"History",geography:"Geography",flags:"Flags",movies:"Movies",cartoons:"Cartoons",famous:"Famous People",sport:"Sport",football:"Football",fashion:"Fashion",strange_questions:"Strange Q's",science:"Science",timerLabel:"sec left",back:"Back",howToPlay:"How to Play",howTitle:"How to Play Bluffy",howBody:"1. Create a room and share the code\n2. Each round, one player picks a category\n3. Everyone types their answer\n4. If CORRECT — write a convincing WRONG answer to fool others!\n5. All answers shuffled as multiple choice\n6. Everyone picks what they think is correct\n\nScoring:\n+2 for correct pick\n+1 per player your fake answer fools\n0 if you pick your own fake (self-fool!)\n\nMost points wins!",close:"Close",legal:"Terms & Privacy",terms:"Terms",privacy:"Privacy Policy",termsTitle:"Terms of Use",privacyTitle:"Privacy Policy"},
he:{appName:"Bluffy",tagline:"!בלוף את דרכך עד לניצחון",createGame:"צור משחק",joinGame:"הצטרף",enterName:"השם שלך",enterCode:"קוד חדר",join:"הצטרף",start:"!התחל",players:"שחקנים",settings:"הגדרות",time:"זמן/שאלה",sec:"שנ׳",rounds:"סיבובים",cats:"קטגוריות",all:"הכל",none:"כלום",pickCat:"!בחר קטגוריה",turn:" בוחר/ת",typeAns:"...הקלד תשובה",submit:"שלח",waiting:"...ממתינים",bluffMsg:"!נכון! הקלד תשובה שגויה משכנעת",typeBluff:"...מזויפת",sendBluff:"שלח בלאף",skip:"דלג",choose:"?מה נכון",round:"סיבוב",of:"מתוך",pts:"נק׳",correct:"נכון",fooled:"רימה",scoreboard:"ניקוד",next:"הבא",over:"!נגמר",winner:"!מנצח",again:"שוב",menu:"תפריט",kick:"הסר",leave:"עזוב",host:"מארח",wroteBy:"ע\"י",selfFool:"!בלאף עצמי",flag:"לאיזו מדינה שייך הדגל?",allAns:"כל התשובות",auto:"אוטו",share:"שתפו:",or:"או QR:",copied:"!הועתק",copy:"העתק",waitHost:"...ממתינים למארח",youAnswered:"!נשלח",general_knowledge:"ידע כללי",history:"היסטוריה",geography:"גיאוגרפיה",flags:"דגלים",movies:"סרטים",cartoons:"קריקטורות",famous:"מפורסמים",sport:"ספורט",football:"כדורגל",fashion:"אופנה",strange_questions:"שאלות מוזרות",science:"מדע",timerLabel:"שנ׳ נותרו",back:"חזרה",howToPlay:"איך משחקים",howTitle:"איך משחקים בבלאפי",howBody:"1. צרו חדר ושתפו את הקוד עם חברים\n2. כל סיבוב, שחקן בוחר קטגוריה\n3. כולם מקלידים תשובה\n4. אם נכון — כתבו תשובה שגויה משכנעת!\n5. כל התשובות מעורבבות כרב-ברירה\n6. כולם בוחרים את הנכונה\n\nניקוד:\n+2 על בחירה נכונה\n+1 לכל שחקן שהבלאף שלכם רימה\n0 אם בחרתם בבלאף שלכם!\n\nהכי הרבה נקודות מנצח!",close:"סגור",legal:"תקנון ופרטיות",terms:"תקנון",privacy:"מדיניות פרטיות",termsTitle:"תקנון שימוש",privacyTitle:"מדיניות פרטיות"}};


// ═══════════════════════════════════════════════════════════
// IR MATCHING ENGINE
// ═══════════════════════════════════════════════════════════

function norm(s){
  if(!s)return"";
  return s.toLowerCase().trim()
    .replace(/[\u0591-\u05C7]/g,"")
    .replace(/[^\w\s\u0590-\u05FF]/g,"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ").trim();
}

function normHe(s){
  return s.replace(/ך/g,"כ").replace(/ם/g,"מ").replace(/ן/g,"נ").replace(/ף/g,"פ").replace(/ץ/g,"צ");
}

function deepNorm(s){return normHe(norm(s));}

// Damerau-Levenshtein: transpositions (ei→ie) count as 1 edit, not 2
function dlev(a,b){
  const m=a.length,n=b.length;
  if(m===0)return n;if(n===0)return m;
  const d=Array.from({length:m+2},()=>Array(n+2).fill(0));
  const mx=m+n;d[0][0]=mx;
  for(let i=0;i<=m;i++){d[i+1][0]=mx;d[i+1][1]=i;}
  for(let j=0;j<=n;j++){d[0][j+1]=mx;d[1][j+1]=j;}
  const da={};
  for(let i=1;i<=m;i++){
    let db=0;
    for(let j=1;j<=n;j++){
      const i1=da[b[j-1]]||0,j1=db;
      let cost=1;
      if(a[i-1]===b[j-1]){cost=0;db=j;}
      d[i+1][j+1]=Math.min(d[i][j]+cost,d[i+1][j]+1,d[i][j+1]+1,d[i1][j1]+(i-i1-1)+1+(j-j1-1));
    }
    da[a[i-1]]=i;
  }
  return d[m+1][n+1];
}

// Is this typo acceptable? Uses edit distance + similarity ratio
// Tight enough to reject Iran≠Iraq, Austria≠Australia
// Loose enough to accept Gren→Green, Einstien→Einstein, Daimond→Diamond
function typoOk(a,b){
  const d=dlev(a,b);
  if(d===0)return true;
  const maxLen=Math.max(a.length,b.length);
  const ratio=1-d/maxLen;
  if(maxLen<=3)return false;              // Cat, Red, Au → exact only
  if(maxLen<=8)return d<=1&&ratio>0.75;   // Green(5), Diamond(7) → 1 edit, >75% match
  if(maxLen<=14)return d<=2&&ratio>0.80;  // Cleopatra(9), Shakespeare(11) → 2 edits, >80%
  return d<=3&&ratio>0.80;                // Very long words → 3 edits, >80%
}

// ═══ MAIN MATCHING FUNCTION ═══
// Handles: exact, numbers, single words with typos, multi-word partial names
function isCorrect(input,correct){
  if(!input||!correct)return false;
  const a=deepNorm(input),b=deepNorm(correct);
  if(!a||!b)return false;
  if(a===b)return true;

  // Numbers: exact only (1945≠1946, 7≠17)
  if(/^\d+\.?\d*$/.test(b))return a===b;

  const aT=a.split(" ").filter(w=>w.length>0);
  const bT=b.split(" ").filter(w=>w.length>0);

  // Single word answer: check typo tolerance
  if(bT.length===1)return typoOk(a,b);

  // Multi-word answer: get significant tokens (3+ chars, skip "da", "of", "the")
  const sig=bT.filter(t=>t.length>=3);
  if(sig.length===0)return typoOk(a,b);

  // User typed single word (3+ chars) → match ANY significant token
  // "Messi" matches "Lionel Messi", "Armstrong" matches "Neil Armstrong"
  if(aT.length===1&&aT[0].length>=3)
    return sig.some(t=>typoOk(aT[0],t));

  // Single word too short → reject ("of", "le", "da" alone = not enough)
  if(aT.length===1)return false;

  // User typed multiple words → must cover ALL significant tokens
  let matched=0;
  for(const bt of sig){
    if(aT.some(at=>typoOk(at,bt)))matched++;
  }
  if(matched>=sig.length)return true;

  // Partial multi-word: at least one 4+ char word matches a token
  for(const at of aT){
    if(at.length>=4&&sig.some(bt=>typoOk(at,bt)))return true;
  }

  return false;
}

// Check against both English and Hebrew answers
function isCorrectBilingual(input,ansEn,ansHe){
  return isCorrect(input,ansEn)||isCorrect(input,ansHe);
}

// Are two wrong answers effectively the same? (for grouping duplicates)
function isSameText(a,b){
  const na=deepNorm(a),nb=deepNorm(b);
  if(na===nb)return true;
  if(na.length>3&&nb.length>3){const d=dlev(na,nb);return d<=1&&(1-d/Math.max(na.length,nb.length))>0.80;}
  return false;
}

// Title Case for English display, passthrough for Hebrew
function titleCase(s,ln){
  if(!s)return s;
  if(ln==="he"||/[\u0590-\u05FF]/.test(s))return s;
  return s.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase());
}

// Exact normalized match (for bluff rejection: don't let them submit the correct answer)
function strictMatch(i,c){return deepNorm(i)===deepNorm(c);}

// ═══════════════════════════════════════════════════════════
// SMART DISTRACTOR GENERATION
// ═══════════════════════════════════════════════════════════

function detectAnswerType(q){
  const a=(q.answer_en||"").trim();
  if(q.flag_country||q.flag_code||q.category==="flags")return"country";
  if(/^\d{3,4}$/.test(a))return"year";
  if(/^\d+\.?\d*$/.test(a))return"number";
  const colors=["red","blue","green","yellow","orange","purple","pink","black","white","brown","gray","grey","gold","silver","teal","cyan","magenta","violet","indigo","scarlet","crimson","maroon","navy","turquoise","beige","ivory","coral","lime"];
  if(colors.includes(a.toLowerCase()))return"color";
  const animals=["dog","cat","elephant","whale","lion","tiger","bear","shark","eagle","snake","wolf","dolphin","horse","monkey","penguin","rabbit","fox","deer","cow","pig","chicken","duck","goat","sheep","frog","snail","octopus","bat","owl","parrot","camel","giraffe","zebra","hippo","rhino","crocodile","turtle","slug","ant","bee","butterfly","spider","mouse","rat","hamster","koala","panda","kangaroo","cheetah","leopard","jaguar","gorilla","chimpanzee"];
  if(animals.includes(a.toLowerCase())||animals.some(an=>a.toLowerCase().includes(an)))return"animal";
  if(q.category==="famous")return"person";
  const words=a.split(" ");
  if(words.length>=2&&/^[A-Z]/.test(a)){
    const nonPlace=!["Ocean","Sea","Empire","City","America","Zealand","Trafford","Madrid","whale","dioxide","Republic","Kingdom"].some(w=>a.includes(w));
    if(nonPlace)return"person";
  }
  if(q.category==="geography"&&!/^\d/.test(a))return"country";
  if(q.category==="football")return"football";
  if(q.category==="movies"||q.category==="cartoons")return"entertainment";
  if(q.category==="fashion")return"fashion";
  if(q.category==="sport")return"sport_term";
  if(q.category==="science")return"science_term";
  if(q.category==="strange_questions")return"strange";
  return"general";
}

// ═══════════════════════════════════════════════════════════
// SMART DISTRACTOR ENGINE (5 strategies)
// ═══════════════════════════════════════════════════════════
function genSmartDistractors(q,existingTexts,ln,count){
  const results=[];
  const used=new Set(existingTexts.map(deepNorm));
  const aType=detectAnswerType(q);
  const aEn=q.answer_en||"";
  const aHe=q.answer_he||"";

  function addIfNew(text){
    if(!text)return false;
    const t=titleCase(String(text),ln);
    const n=deepNorm(t);
    if(n&&n.length>0&&!used.has(n)&&!isCorrect(t,aEn)&&!isCorrect(t,aHe)){
      used.add(n);results.push(t);return true;
    }
    return false;
  }

  // ─── S1: Mine QS for same-type answers in same category ───
  try{
    const sameCat=QS.filter(function(o){return o.id!==q.id&&o.category===q.category&&detectAnswerType(o)===aType;});
    const sh=[...sameCat].sort(function(){return Math.random()-0.5;});
    for(var si=0;si<sh.length&&results.length<count;si++){
      var ans=ln==="he"?(sh[si].answer_he||sh[si].answer_en):sh[si].answer_en;
      addIfNew(ans);
    }
  }catch(e){}

  // ─── S2: Near-miss for years and numbers ───
  if(aType==="year"&&results.length<count){
    var yr=parseInt(aEn);
    if(!isNaN(yr)){
      var offsets=[-1,1,-2,2,-3,3,-5,5,-10,10].sort(function(){return Math.random()-0.5;});
      for(var oi=0;oi<offsets.length&&results.length<count;oi++) addIfNew(String(yr+offsets[oi]));
    }
  }
  if(aType==="number"&&results.length<count){
    var num=parseFloat(aEn);
    if(!isNaN(num)){
      var near=num<=20?[num-1,num+1,num-2,num+2,num+3,num-3,num*2,num*3]:[num-1,num+1,num-2,num+2,num-5,num+5,num-10,num+10,Math.round(num*1.1),Math.round(num*0.9),num*2,Math.round(num/2)];
      near=near.filter(function(n){return n>0;}).sort(function(){return Math.random()-0.5;});
      for(var ni=0;ni<near.length&&results.length<count;ni++){
        var v=near[ni];
        addIfNew(String(v%1===0?v:v.toFixed(1)));
      }
    }
  }

  // ─── S3: Curated confusion banks (bilingual) ───
  var CB={
    color:{en:["Red","Blue","Green","Yellow","Orange","Purple","Pink","Black","White","Brown","Gray","Gold","Silver","Teal","Cyan","Magenta","Violet","Indigo","Scarlet","Crimson","Maroon","Navy","Turquoise","Beige","Ivory","Coral","Lime"],he:["אדום","כחול","ירוק","צהוב","כתום","סגול","ורוד","שחור","לבן","חום","אפור","זהב","כסף","טורקיז","ציאן","מגנטה","סגלגל","אינדיגו","ארגמן","בורדו","שנהב","אלמוג"]},
    animal:{en:["Dog","Cat","Elephant","Lion","Tiger","Bear","Shark","Eagle","Snake","Wolf","Dolphin","Horse","Monkey","Penguin","Rabbit","Fox","Deer","Whale","Octopus","Giraffe","Zebra","Hippopotamus","Rhinoceros","Crocodile","Turtle","Snail","Bat","Owl","Parrot","Camel","Koala","Panda","Kangaroo","Cheetah","Gorilla","Chameleon","Flamingo","Jellyfish","Seahorse"],he:["כלב","חתול","פיל","אריה","נמר","דוב","כריש","נשר","נחש","זאב","דולפין","סוס","קוף","פינגווין","ארנב","שועל","אייל","לווייתן","תמנון","ג'ירפה","זברה","היפופוטם","קרנף","תנין","צב","חילזון","עטלף","ינשוף","תוכי","גמל","קואלה","פנדה","קנגורו","ברדלס","גורילה","זיקית","פלמינגו","מדוזה"]},
    person:{en:["Nikola Tesla","Thomas Edison","Isaac Newton","Charles Darwin","Galileo Galilei","Wolfgang Mozart","Pablo Picasso","Vincent Van Gogh","Benjamin Franklin","Napoleon Bonaparte","Aristotle","Plato","Sigmund Freud","Leonardo DiCaprio","Marie Antoinette","Alexander The Great","Genghis Khan","Socrates","Martin Luther King","Abraham Lincoln","Winston Churchill","Mahatma Gandhi","Nelson Mandela","Albert Einstein","Stephen Hawking","Marie Curie","Marco Polo","Christopher Columbus","Beethoven","Bach","Shakespeare","Michelangelo","Rembrandt","Frida Kahlo","Salvador Dali","Alfred Nobel","Alexander Fleming","Tim Berners-Lee","Alan Turing"],he:["ניקולה טסלה","תומאס אדיסון","אייזק ניוטון","צ'רלס דרווין","גלילאו גלילאי","וולפגנג מוצרט","פבלו פיקאסו","וינסנט ואן גוך","בנג'מין פרנקלין","נפוליאון בונפרטה","אריסטו","אפלטון","זיגמונד פרויד","לאונרדו דיקפריו","מארי אנטואנט","אלכסנדר הגדול","ג'ינגיס חאן","סוקרטס","מרטין לותר קינג","אברהם לינקולן","וינסטון צ'רצ'יל","מהטמה גנדי","נלסון מנדלה","אלברט איינשטיין","סטיבן הוקינג","מארי קירי","מרקו פולו","כריסטופר קולומבוס","בטהובן","באך","שייקספיר","מיכלאנג'לו","רמברנדט","פרידה קאלו","אלפרד נובל","אלכסנדר פלמינג","טים ברנרס לי","אלן טיורינג"]},
    country:{en:["Sweden","Norway","Denmark","Poland","Hungary","Austria","Belgium","Netherlands","Portugal","Ireland","Iceland","Greece","Switzerland","Finland","Estonia","Latvia","Lithuania","Croatia","Serbia","Bulgaria","Morocco","Algeria","Tunisia","Chile","Peru","Bolivia","Ecuador","Venezuela","Cuba","Panama","Philippines","Vietnam","Malaysia","Thailand","Cambodia","Sri Lanka","Nepal","Bangladesh","Pakistan","Kazakhstan","Qatar","Kuwait","Oman","Jordan","Lebanon","Georgia","Armenia","Azerbaijan","Mongolia","Paraguay","Uruguay","New Zealand","South Africa","Kenya","Tanzania","Ethiopia","Ghana","Senegal","Madagascar"],he:["שוודיה","נורבגיה","דנמרק","פולין","הונגריה","אוסטריה","בלגיה","הולנד","פורטוגל","אירלנד","איסלנד","יוון","שוויץ","פינלנד","אסטוניה","לטביה","ליטא","קרואטיה","סרביה","בולגריה","מרוקו","אלג'יריה","תוניסיה","צ'ילה","פרו","בוליביה","אקוודור","ונצואלה","קובה","פנמה","הפיליפינים","וייטנאם","מלזיה","תאילנד","קמבודיה","סרי לנקה","נפאל","בנגלדש","פקיסטן","קזחסטן","קטאר","כווית","עומאן","ירדן","לבנון","גאורגיה","ארמניה","אזרבייג'ן","מונגוליה","פרגוואי","אורוגוואי","ניו זילנד","דרום אפריקה","קניה","טנזניה","אתיופיה","גאנה","סנגל","מדגסקר"]},
    football:{en:["Barcelona","Liverpool","Bayern Munich","Juventus","AC Milan","Ajax","Porto","Benfica","Chelsea","Arsenal","PSG","Borussia Dortmund","Inter Milan","Atletico Madrid","Manchester City","Manchester United","Tottenham","Napoli","Roma","Lazio","Sevilla","Valencia","Lyon","Marseille","Celtic","Galatasaray","Fenerbahce","Villarreal","Newcastle","Bayer Leverkusen"],he:["ברצלונה","ליברפול","באיירן מינכן","יובנטוס","מילאן","אייאקס","פורטו","בנפיקה","צ'לסי","ארסנל","פ.ס.ז'","דורטמונד","אינטר מילאן","אטלטיקו מדריד","מנצ'סטר סיטי","מנצ'סטר יונייטד","טוטנהאם","נאפולי","רומא","לאציו","סביליה","ולנסיה","ליון","מרסיי","סלטיק","גלטסראי","ויאריאל","ניוקאסל","באייר לברקוזן"]},
    entertainment:{en:["Tom Hanks","Brad Pitt","Meryl Streep","Leonardo DiCaprio","Scarlett Johansson","Morgan Freeman","Robert De Niro","Al Pacino","Johnny Depp","Denzel Washington","Harrison Ford","Tom Cruise","Will Smith","Matt Damon","George Clooney","Julia Roberts","Angelina Jolie","Nicole Kidman","Robin Williams","Jack Nicholson","Christian Bale","Keanu Reeves","Ryan Gosling","Emma Stone","Natalie Portman","Hogwarts","Gotham","Wakanda","Narnia","Mordor","Pandora","Asgard"],he:["טום הנקס","בראד פיט","מריל סטריפ","לאונרדו דיקפריו","סקרלט ג'והנסון","מורגן פרימן","רוברט דה נירו","אל פצ'ינו","ג'וני דפ","דנזל וושינגטון","האריסון פורד","טום קרוז","וויל סמית","מט דיימון","ג'ורג' קלוני","ג'וליה רוברטס","אנג'לינה ג'ולי","ניקול קידמן","רובין וויליאמס","כריסטיאן בייל","קיאנו ריבס","ריאן גוסלינג","אמה סטון","נטלי פורטמן","הוגוורטס","גותהם","וואקנדה","נרניה","מורדור","פנדורה","אסגארד"]},
    fashion:{en:["Gucci","Prada","Versace","Armani","Dior","Louis Vuitton","Burberry","Balenciaga","Hermes","Fendi","Valentino","Givenchy","YSL","Zara","Dolce & Gabbana","Calvin Klein","Ralph Lauren","Tommy Hilfiger","Hugo Boss","Lacoste","Chanel","Nike","Adidas","Puma","Reebok","Converse","Rolex","Cartier"],he:["גוצ'י","פראדה","ורסאצ'ה","ארמני","דיור","לואי ויטון","ברברי","בלנסיאגה","הרמס","פנדי","ולנטינו","ז'יבנשי","זארה","דולצ'ה וגבאנה","קלווין קליין","ראלף לורן","טומי הילפיגר","הוגו בוס","לקוסט","שאנל","נייקי","אדידס","פומה","ריבוק","קונברס","רולקס","קרטייה"]},
    sport_term:{en:["Tennis","Basketball","Baseball","Hockey","Swimming","Boxing","Cycling","Wrestling","Fencing","Rowing","Rugby","Golf","Volleyball","Badminton","Table Tennis","Archery","Judo","Karate","Taekwondo","Surfing","Skiing","Skating","Climbing","Gymnastics","Diving","Cricket","Handball"],he:["טניס","כדורסל","בייסבול","הוקי","שחייה","אגרוף","רכיבה","היאבקות","סיוף","חתירה","רוגבי","גולף","כדורעף","בדמינטון","טניס שולחן","קשתות","ג'ודו","קראטה","טאקוונדו","גלישה","סקי","החלקה","טיפוס","התעמלות","צלילה","קריקט","כדוריד"]},
    science_term:{en:["Hydrogen","Helium","Carbon","Iron","Oxygen","Sodium","Calcium","Mercury","Uranium","Lithium","Platinum","Copper","Zinc","Lead","Neon","Argon","Tungsten","Nitrogen","Phosphorus","Sulfur","Chlorine","Potassium","Magnesium","Silicon","Titanium","Cobalt","Nickel","Aluminum","Mitochondria","Nucleus","Gravity","Friction","Velocity","Momentum"],he:["מימן","הליום","פחמן","ברזל","חמצן","נתרן","סידן","כספית","אורניום","ליתיום","פלטינה","נחושת","אבץ","עופרת","ניאון","ארגון","טונגסטן","חנקן","זרחן","גופרית","כלור","אשלגן","מגנזיום","סיליקון","טיטניום","מיטוכונדריה","גרעין","כוח הכבידה","חיכוך"]},
    strange:{en:["2","3","4","5","6","7","8","9","10","12","15","20","24","50","100","Red","Blue","Green","Yellow","Purple","Orange","Pink","Black","White","Dog","Cat","Elephant","Snail","Octopus","Whale","Dolphin","Butterfly","Spider","Bat","Penguin","Flamingo"],he:["2","3","4","5","6","7","8","9","10","12","15","20","24","50","100","אדום","כחול","ירוק","צהוב","סגול","כתום","ורוד","שחור","לבן","כלב","חתול","פיל","חילזון","תמנון","לווייתן","דולפין","פרפר","עכביש","עטלף","פינגווין","פלמינגו"]},
    general:{en:["Mercury","Venus","Jupiter","Saturn","Mars","Neptune","Uranus","Pluto","Diamond","Gold","Silver","Bronze","Iron","Copper","Cotton","Silk","Wool","Leather","Gravity","Magnetism","Friction","Inertia","North","South","East","West","Spring","Summer","Autumn","Winter"],he:["כוכב חמה","נוגה","צדק","שבתאי","מאדים","נפטון","אורנוס","פלוטו","יהלום","זהב","כסף","ארד","ברזל","נחושת","כותנה","משי","צמר","עור","כוח הכבידה","מגנטיות","חיכוך","אינרציה","צפון","דרום","מזרח","מערב","אביב","קיץ","סתיו","חורף"]}
  };

  if(results.length<count){
    var bk=CB[aType]?aType:"general";
    var pool=ln==="he"?CB[bk].he:CB[bk].en;
    var shp=[...pool].sort(function(){return Math.random()-0.5;});
    for(var pi=0;pi<shp.length&&results.length<count;pi++) addIfNew(shp[pi]);
  }

  // ─── S4: Cross-category from QS ───
  if(results.length<count){
    try{
      var cross=QS.filter(function(o){return o.id!==q.id&&o.category!==q.category&&detectAnswerType(o)===aType;});
      var shc=[...cross].sort(function(){return Math.random()-0.5;});
      for(var ci=0;ci<shc.length&&results.length<count;ci++){
        var ca2=ln==="he"?(shc[ci].answer_he||shc[ci].answer_en):shc[ci].answer_en;
        addIfNew(ca2);
      }
    }catch(e){}
  }

  // ─── S5: General fallback ───
  if(results.length<count){
    var fb=ln==="he"?CB.general.he:CB.general.en;
    var shf=[...fb].sort(function(){return Math.random()-0.5;});
    for(var fi=0;fi<shf.length&&results.length<count;fi++) addIfNew(shf[fi]);
  }

  return results;
}

function genDecoy(q,existingTexts,ln){
  var r=genSmartDistractors(q,existingTexts,ln,1);
  return r.length>0?r[0]:(ln==="he"?"לא יודע":"Unknown");
}

function genMultipleDecoys(q,existingTexts,ln,count){
  return genSmartDistractors(q,existingTexts,ln,count);
}


function genCode(){let r="";for(let i=0;i<6;i++)r+=Math.floor(Math.random()*10);if(r[0]==="0")r="1"+r.slice(1);return r;}
function genUid(){return"u"+Math.random().toString(36).slice(2,10)+Date.now().toString(36);}
const LEGAL = {
  en: {
    terms: `
Bluffy – Terms of Use

Last updated: March 2026

1. General
Bluffy is a trivia game intended for entertainment purposes only.
By using the app, you agree to these Terms of Use.

2. Operator
Bluffy is operated by a private operator based in Israel.
Contact: najjarhabib95@gmail.com

3. Use of the App
The app does not require registration or account creation.
The app currently does not include payments or in-app purchases.
The app is provided on an "AS IS" basis.

4. Children
The app is intended for a general audience, including children.
Parents or legal guardians are responsible for supervising minors’ use of the app.

5. Content
The app includes trivia questions and answers.
We make reasonable efforts to provide accurate content, but do not guarantee that all content will always be correct, complete, or up to date.

6. Prohibited Use
You may not misuse the app, interfere with its operation, attempt to bypass technical limitations, or copy/distribute app content without permission.

7. Intellectual Property
All rights in the app, including its design, text, questions, graphics, and branding, belong to the operator and/or relevant rights holders.

8. Availability
We do not guarantee uninterrupted or error-free operation of the app.
We may update, change, suspend, or discontinue the app at any time.

9. Limitation of Liability
Use of the app is at your own responsibility.
The operator will not be liable for damages resulting from use of the app, reliance on its content, or inability to use it, subject to applicable law.

10. Governing Law
These terms are governed by the laws of the State of Israel.
Exclusive jurisdiction: competent courts in Haifa District, Israel.

11. Apple Disclaimer
This app is not sponsored, endorsed, administered by, or associated with Apple Inc.
Apple is not responsible for the app or its content.
`,
    privacy: `
Bluffy – Privacy Policy

Last updated: March 2026

1. General
Your privacy matters to us. This Privacy Policy explains, in a simple way, what information may or may not be collected when you use Bluffy.

2. No Account / No Registration
Bluffy does not require you to create an account or register in order to play.

3. Personal Information
Bluffy does not intentionally ask users to provide personal information for normal gameplay.

4. Gameplay History
Bluffy does not aim to keep a personal gameplay history tied to user identity.

5. Analytics
At this time, Bluffy does not use analytics tools.
If analytics tools are added in the future, this policy will be updated accordingly.

6. Advertising
At this time, Bluffy does not display ads.
If ads are added in the future, third-party ad providers may collect technical data according to their own policies.

7. Technical Data
App stores, device operating systems, hosting services, or technical service providers may automatically process limited technical information needed for operation, security, or delivery of the service.

8. Children
Because the app may be used by children, we aim to minimize data collection as much as possible.

9. Changes
We may update this Privacy Policy from time to time. The most current version will appear in the app.

10. Contact
For privacy-related questions:
najjarhabib95@gmail.com
`
  },
  he: {
    terms: `
Bluffy – תקנון שימוש

עודכן לאחרונה: מרץ 2026

1. כללי
Bluffy היא אפליקציית טריוויה המיועדת למטרות בידור והנאה בלבד.
השימוש באפליקציה מהווה הסכמה לתנאי תקנון זה.

2. המפעיל
האפליקציה מופעלת על ידי מפעיל פרטי מישראל.
יצירת קשר: [להוסיף כתובת מייל או דרך יצירת קשר]

3. אופן השימוש
אין צורך בהרשמה או ביצירת חשבון כדי להשתמש באפליקציה.
האפליקציה אינה כוללת כיום תשלומים או רכישות בתוך האפליקציה.
האפליקציה ניתנת לשימוש כפי שהיא ("AS IS").

4. קטינים
האפליקציה מיועדת לקהל כללי, לרבות ילדים.
האחריות לפיקוח על שימוש קטינים באפליקציה חלה על הוריהם או האפוטרופוסים שלהם.

5. תוכן
האפליקציה כוללת שאלות ותשובות טריוויה.
נעשה מאמץ סביר להציג תוכן נכון, אך אין התחייבות שכל התוכן יהיה מדויק, מלא או מעודכן בכל עת.

6. שימוש אסור
אין לעשות שימוש לרעה באפליקציה, לשבש את פעולתה, לעקוף מגבלות טכניות, או להעתיק / להפיץ את תוכן האפליקציה ללא רשות.

7. קניין רוחני
כל הזכויות באפליקציה, לרבות עיצוב, טקסטים, שאלות, גרפיקה ומיתוג, שייכות למפעיל ו/או לבעלי הזכויות הרלוונטיים.

8. זמינות
אין התחייבות שהאפליקציה תפעל ללא תקלות או ללא הפרעות.
המפעיל רשאי לעדכן, לשנות, להשהות או להפסיק את האפליקציה בכל עת.

9. הגבלת אחריות
השימוש באפליקציה הוא באחריות המשתמש בלבד.
המפעיל לא יישא באחריות לנזקים שייגרמו עקב השימוש באפליקציה, הסתמכות על תוכנה, או חוסר יכולת להשתמש בה, והכול בכפוף לדין החל.

10. דין וסמכות שיפוט
על תקנון זה יחולו דיני מדינת ישראל בלבד.
סמכות השיפוט הבלעדית תהיה לבתי המשפט המוסמכים במחוז חיפה, ישראל.

11. הצהרת Apple
האפליקציה אינה ממומנת, נתמכת, מנוהלת או קשורה ל-Apple Inc.
Apple אינה אחראית לאפליקציה או לתכניה.
`,
    privacy: `
Bluffy – מדיניות פרטיות

עודכן לאחרונה:מרץ 2026

1. כללי
הפרטיות שלכם חשובה לנו. מדיניות זו מסבירה בצורה פשוטה איזה מידע עשוי או לא עשוי להיאסף בעת השימוש ב-Bluffy.

2. ללא חשבון / ללא הרשמה
Bluffy אינה דורשת יצירת חשבון או הרשמה לצורך משחק.

3. מידע אישי
Bluffy אינה מבקשת במכוון מידע אישי מהמשתמשים לצורך משחק רגיל.

4. היסטוריית משחק
Bluffy אינה מיועדת לשמור היסטוריית משחק אישית המקושרת לזהות המשתמש.

5. אנליטיקה
נכון לעכשיו, Bluffy אינה משתמשת בכלי אנליטיקה.
אם יתווספו בעתיד כלי אנליטיקה, מדיניות זו תעודכן בהתאם.

6. פרסומות
נכון לעכשיו, Bluffy אינה מציגה פרסומות.
אם יתווספו בעתיד פרסומות, ספקי פרסום של צדדים שלישיים עשויים לאסוף מידע טכני בהתאם למדיניות שלהם.

7. מידע טכני
חנויות אפליקציות, מערכות הפעלה, שירותי אחסון או ספקים טכנולוגיים עשויים לעבד באופן אוטומטי מידע טכני מוגבל הנדרש לצורך תפעול, אבטחה או אספקת השירות.

8. ילדים
מאחר שהאפליקציה עשויה להיות בשימוש ילדים, אנו שואפים לצמצם ככל האפשר איסוף מידע.

9. שינויים
אנו רשאים לעדכן מדיניות זו מעת לעת. הגרסה המעודכנת ביותר תופיע באפליקציה.

10. יצירת קשר
לשאלות בנושא פרטיות:
najjarhabib95@gmail.com
`
  }
};
export default function Bluffy(){
  const[uid]=useState(()=>genUid());
  const[lang,setLang]=useState("en");
  const[page,setPage]=useState("home"); // home, join only — everything else driven by rd.state
  const[room,setRoom]=useState(null);
  const[rd,setRd]=useState(null);
  const[myName,setMyName]=useState("");
  const[myAvatar,setMyAvatar]=useState("ninja");
  const[joinCode,setJoinCode]=useState("");
  const[ci,setCi]=useState("");
  const[bi,setBi]=useState("");
  const[err,setErr]=useState("");
  const[copied,setCopied]=useState(false);
  const[showHelp,setShowHelp]=useState(false);
  const[showLegal,setShowLegal]=useState(false);
  const[legalTab,setLegalTab]=useState("terms");
  const[timer,setTimer]=useState(0);
  const[revealTimer,setRevealTimer]=useState(0);
  const[catTimer,setCatTimer]=useState(0);
  const timerRef=useRef(null);
  const revealTimerRef=useRef(null);
  const catTimerRef=useRef(null);
  const selectedRef=useRef(false);

  const t=T[lang];const he=lang==="he";
  const isHost=rd?.host===uid;
  const playerList=rd?.players?Object.entries(rd.players).sort((a,b)=>(a[1].order||0)-(b[1].order||0)):[];
  const playerCount=playerList.length;
  const answered=!!rd?.answers?.[uid];
  const pubDone=!!rd?.publicAnswers?.[uid];
  const myAnswer=rd?.answers?.[uid];
  const needBluff=myAnswer?.ok&&!pubDone;
  const allPubCount=rd?.publicAnswers?Object.keys(rd.publicAnswers).length:0;
  const allSelCount=rd?.selections?Object.keys(rd.selections).length:0;
  const selected=rd?.selections?.[uid]!==undefined;
  selectedRef.current=selected;
  const baseUrl=typeof window!=="undefined"?window.location.origin+window.location.pathname:"";
  const joinUrl=room?`${baseUrl}?room=${room}`:"";
  const state=rd?.state||""; // lobby, catSel, answering, reveal, post, over

  // ═══ FIREBASE LISTENER ═══
  useEffect(()=>{
    if(!room)return;
    const r=ref(db,`rooms/${room}`);
    const unsub=onValue(r,snap=>{
      const d=snap.val();
      if(d){setRd(d);if(d.lang)setLang(d.lang);}
      else{setRd(null);setRoom(null);setPage("home");}
    });
    return()=>off(r);
  },[room]);

  // Check URL for room code
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const rc=p.get("room");
    if(rc){setJoinCode(rc);setPage("join");}
  },[]);

  // ═══ TIMER ═══
  useEffect(()=>{
    if(state==="answering"&&rd?.deadline){
      const tick=()=>{const left=Math.max(0,Math.ceil((rd.deadline-Date.now())/1000));setTimer(left);if(left<=0){clearInterval(timerRef.current);if(isHost)hostAutoProgress();}};
      tick();timerRef.current=setInterval(tick,1000);
      return()=>clearInterval(timerRef.current);
    }
  },[state,rd?.deadline]);

  // ═══ REVEAL TIMER ═══
  useEffect(()=>{
    if(state==="reveal"&&rd?.revealDeadline){
      const tick=()=>{
        const left=Math.max(0,Math.ceil((rd.revealDeadline-Date.now())/1000));
        setRevealTimer(left);
        if(left<=0){
          clearInterval(revealTimerRef.current);
          // Auto-submit no-answer for THIS player only if they haven't selected
          if(!selectedRef.current){
            set(ref(db,`rooms/${room}/selections/${uid}`),-1);
          }
        }
      };
      tick();revealTimerRef.current=setInterval(tick,1000);
      return()=>clearInterval(revealTimerRef.current);
    }
  },[state,rd?.revealDeadline]);

  // ═══ CATEGORY SELECTION TIMER ═══
  useEffect(()=>{
    if(state==="catSel"&&rd?.catDeadline){
      const tick=()=>{
        const left=Math.max(0,Math.ceil((rd.catDeadline-Date.now())/1000));
        setCatTimer(left);
        if(left<=0){
          clearInterval(catTimerRef.current);
          // Host auto-picks random category
          if(isHost){
            const cats=rd?.settings?.cats||CATS;
            const randomCat=cats[Math.floor(Math.random()*cats.length)];
            selectCategory(randomCat);
          }
        }
      };
      tick();catTimerRef.current=setInterval(tick,1000);
      return()=>clearInterval(catTimerRef.current);
    }
  },[state,rd?.catDeadline]);

  // ═══ AUTO-PROGRESS ═══
  useEffect(()=>{
    if(!isHost||state!=="answering")return;
    if(allPubCount>=playerCount&&playerCount>=2)setTimeout(()=>hostMoveToReveal(),800);
  },[allPubCount,playerCount,isHost,state]);

  useEffect(()=>{
    if(!isHost||state!=="reveal")return;
    if(allSelCount>=playerCount&&playerCount>=2)setTimeout(()=>hostCalcScores(),800);
  },[allSelCount,playerCount,isHost,state]);

  // ═══ ACTIONS ═══
  const createRoom=async()=>{
    if(!myName.trim())return;
    const code=genCode();
    const rr=ref(db,`rooms/${code}`);
    const ex=await get(rr);
    if(ex.exists())return createRoom();
    await set(rr,{host:uid,lang,state:"lobby",round:0,turnIdx:0,settings:{time:30,rounds:10,cats:CATS},players:{[uid]:{name:myName.trim(),score:0,order:0,avatar:myAvatar}}});
    setRoom(code);
  };

  const joinRoom=async()=>{
    if(!myName.trim()||!joinCode.trim())return;
    const code=joinCode.trim();
    const rr=ref(db,`rooms/${code}`);
    const snap=await get(rr);
    if(!snap.exists()){setErr(t.roomNotFound||"Not found");return;}
    const d=snap.val();
    if(d.players&&Object.keys(d.players).length>=5){setErr(t.roomFull||"Full");return;}
    if(d.players&&Object.values(d.players).some(p=>p.name===myName.trim())){setErr(t.nameTaken||"Name taken");return;}
    await update(ref(db,`rooms/${code}/players/${uid}`),{name:myName.trim(),score:0,order:d.players?Object.keys(d.players).length:0,avatar:myAvatar});
    setRoom(code);setLang(d.lang||"en");
    window.history.replaceState({},"",window.location.pathname);
  };

  const leaveRoom=()=>{if(room){if(isHost)remove(ref(db,`rooms/${room}`));else if(uid)remove(ref(db,`rooms/${room}/players/${uid}`));}setRoom(null);setRd(null);setPage("home");};
  const kickPlayer=(pid)=>{if(isHost&&room)remove(ref(db,`rooms/${room}/players/${pid}`));};
  const updateSetting=(k,v)=>{if(isHost&&room)update(ref(db,`rooms/${room}/settings`),{[k]:v});};
  const toggleCat=(cat)=>{if(!isHost)return;const cs=rd?.settings?.cats||[];update(ref(db,`rooms/${room}/settings`),{cats:cs.includes(cat)?cs.filter(c=>c!==cat):[...cs,cat]});};
  const changeLang=(l)=>{if(isHost&&room){setLang(l);update(ref(db,`rooms/${room}`),{lang:l});}};
  const copyLink=()=>{navigator.clipboard?.writeText(joinUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const startGame=()=>{
    if(!isHost||playerCount<2)return;
    const u={};playerList.forEach(([id])=>{u[`players/${id}/score`]=0;});
    u.state="catSel";u.round=1;u.turnIdx=0;u.usedIds="";
    u.question=null;u.answers=null;u.publicAnswers=null;u.selections=null;u.options=null;u.results=null;u.correctAnswer=null;
    u.catDeadline=Date.now()+(rd?.settings?.time||30)*1000;
    update(ref(db,`rooms/${room}`),u);
  };

  const selectCategory=(cat)=>{
    const turnUid=playerList[rd?.turnIdx||0]?.[0];
    if(turnUid!==uid)return;
    const usedIds=(rd?.usedIds||"").split(",").filter(Boolean);
    const av=QS.filter(q=>q.category===cat&&!usedIds.includes(q.id));
    const pool=av.length?av:QS.filter(q=>q.category===cat);
    const q=pool[Math.floor(Math.random()*pool.length)];
    update(ref(db,`rooms/${room}`),{
      state:"answering",question:q,cat,deadline:Date.now()+(rd?.settings?.time||30)*1000,
      usedIds:[...usedIds,q.id].join(","),answers:null,publicAnswers:null,selections:null,options:null,results:null,correctAnswer:null,
    });
  };

  const submitAnswer=()=>{
    if(!ci.trim()||!room||!rd?.question)return;
    const q=rd.question;const ln=rd.lang||lang;
    const text=titleCase(ci.trim(),ln);
    const ok=isCorrectBilingual(ci,q.answer_en,q.answer_he);
    update(ref(db,`rooms/${room}/answers/${uid}`),{text,ok});
    if(!ok)set(ref(db,`rooms/${room}/publicAnswers/${uid}`),text);
    setCi("");
  };

  const submitBluff=()=>{
    if(!bi.trim()||!room||!rd?.question)return;
    const q=rd.question;const ln=rd.lang||lang;
    if(strictMatch(bi,q.answer_en)||strictMatch(bi,q.answer_he)||isCorrectBilingual(bi,q.answer_en,q.answer_he))return;
    const text=titleCase(bi.trim(),ln);
    set(ref(db,`rooms/${room}/publicAnswers/${uid}`),text);setBi("");
  };

  const skipBluff=()=>{
    if(!room||!rd?.question)return;
    const q=rd.question;const ln=rd.lang||lang;const ex=[...Object.values(rd.publicAnswers||{}),q.answer_en,q.answer_he];
    set(ref(db,`rooms/${room}/publicAnswers/${uid}`),genDecoy(q,ex,ln));
  };

const hostAutoProgress = async () => {
  if (!isHost || !room) return;

  const roomRef = ref(db, `rooms/${room}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;

  const data = snap.val();
  const updates = {};
  const q = data.question;
  const ln = data.lang || lang;

  const answers = data.answers || {};
  const publicAnswers = data.publicAnswers || {};
  const players = Object.keys(data.players || {});

  players.forEach(id => {

    // If player never submitted answer
    if (!answers[id]) {
      updates[`answers/${id}`] = { text: "—", ok: false };
    }

    // Only generate publicAnswer if it truly doesn't exist in DB
    if (!publicAnswers[id]) {
      const a = answers[id];

      if (a && a.ok) {
        updates[`publicAnswers/${id}`] =
          genDecoy(q, [...Object.values(publicAnswers), q.answer_en, q.answer_he], ln);
      } else {
        updates[`publicAnswers/${id}`] = "—";
      }
    }

  });

  if (Object.keys(updates).length) {
    await update(roomRef, updates);
  }
};

  const hostMoveToReveal=()=>{
    if(!isHost||!rd?.question)return;
    const q=rd.question;const ln=rd.lang||lang;
    const ca=ln==="he"?q.answer_he:q.answer_en;
    
    // Step 1: Collect all wrong answers, group duplicates
    // Each group: { displayText, authorIds: [uid,...], authorNames: [name,...] }
    const groups=[];
    
    Object.entries(rd.publicAnswers||{}).forEach(([id,txt])=>{
      if(txt==="—")return;
      // Only filter if it's ACTUALLY the correct answer
      if(isCorrectBilingual(txt,q.answer_en,q.answer_he))return;
      
      // Check if this answer already exists in a group
      const existing=groups.find(g=>isSameText(g.displayText,txt));
      if(existing){
        existing.authorIds.push(id);
        existing.authorNames.push(rd.players?.[id]?.name||"?");
      }else{
        groups.push({
          displayText:titleCase(txt,ln),
          authorIds:[id],
          authorNames:[rd.players?.[id]?.name||"?"]
        });
      }
    });
    
    // Step 2: Build options array — correct answer first
    const os=[{text:ca,ok:true,ai:[],an:[]}];
    const usedTexts=new Set([norm(ca)]);
    
    // Add player wrong answers
    groups.forEach(g=>{
      os.push({text:g.displayText,ok:false,ai:g.authorIds,an:g.authorNames});
      usedTexts.add(norm(g.displayText));
    });
    
    // Step 3: Fill with smart decoys to reach target count
    // Target = playerCount + 1, minimum 4
    const target=Math.max(4,playerCount+1);
    const needed=target-os.length;
    if(needed>0){
      const allTexts=os.map(o=>o.text);
      const decoys=genMultipleDecoys(q,allTexts,ln,needed);
      for(const d of decoys){
        os.push({text:d,ok:false,ai:["sys"],an:[]});
        usedTexts.add(deepNorm(d));
      }
    }
    
    // Step 4: Shuffle all options
    for(let i=os.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [os[i],os[j]]=[os[j],os[i]];
    }
    
update(ref(db,`rooms/${room}`),{
  state:"reveal",
  options:os,
  correctAnswer:ca,
  selections:null,
  revealDeadline:Date.now()+(rd?.settings?.time||30)*1000
});
  };

  const selectOption=(idx)=>{if(!room||selected)return;set(ref(db,`rooms/${room}/selections/${uid}`),idx);};

  const hostCalcScores=()=>{
    if(!isHost||!rd?.options)return;
    const opts=rd.options;
    const res={};
    const su={};
    
    // Initialize results for all players
    playerList.forEach(([id])=>{res[id]={e:0,fb:[],sf:false};});
    
    // Step 1: +2 for picking the correct answer
    Object.entries(rd.selections||{}).forEach(([pickerId,optIdx])=>{
      if(opts[optIdx]?.ok){
        res[pickerId].e+=2;
        su[`players/${pickerId}/score`]=(rd.players[pickerId]?.score||0)+2;
      }
    });
    
    // Step 2: +1 per fool for wrong answer authors
    Object.entries(rd.selections||{}).forEach(([pickerId,optIdx])=>{
      const opt=opts[optIdx];
      if(!opt||opt.ok)return; // skip correct answer picks
      
      const authors=Array.isArray(opt.ai)?opt.ai:[];
      const isSys=authors.length===0||(authors.length===1&&authors[0]==="sys");
      if(isSys)return; // system decoy — no points to anyone
      
      // Check self-fool: picker is one of the authors
      if(authors.includes(pickerId)){
        res[pickerId].sf=true;
        return; // self-fool = 0 points
      }
      
      // Give +1 to EVERY author of this wrong answer
      authors.forEach(authorId=>{
        if(!res[authorId])return; // author may have left
        res[authorId].e+=1;
        res[authorId].fb.push(rd.players[pickerId]?.name||"?");
        const currentScore=su[`players/${authorId}/score`]??rd.players[authorId]?.score??0;
        su[`players/${authorId}/score`]=currentScore+1;
      });
    });
    
    update(ref(db,`rooms/${room}`),{state:"post",results:res,...su});
  };

  const nextRound=()=>{
    if(!isHost)return;
    if((rd?.round||1)>=(rd?.settings?.rounds||10)){update(ref(db,`rooms/${room}`),{state:"over"});return;}
    update(ref(db,`rooms/${room}`),{state:"catSel",round:(rd?.round||1)+1,turnIdx:((rd?.turnIdx||0)+1)%playerCount,question:null,answers:null,publicAnswers:null,selections:null,options:null,results:null,correctAnswer:null,catDeadline:Date.now()+(rd?.settings?.time||30)*1000});
  };

  const playAgain=()=>{if(!isHost)return;const u={};playerList.forEach(([id])=>{u[`players/${id}/score`]=0;});u.state="lobby";u.round=0;update(ref(db,`rooms/${room}`),u);};

  // ═══ COMPONENTS ═══
  const FI=({c,code,flag})=>{
  const u =
    flag ||
    (code ? `https://flagcdn.com/w160/${code}.png` : flagUrl(c));

  return u ? (
    <img
      src={u}
      alt=""
      style={{
        width:160,
        height:100,
        objectFit:"cover",
        borderRadius:8,
        border:"2px solid rgba(255,255,255,.2)",
        margin:"12px auto",
        display:"block"
      }}
    />
  ) : null;
};
  const QT=()=>{const q=rd?.question;if(!q)return"";if(q.flag_country||q.flag_code)return he?t.flag:t.flag;return he?q.question_he:q.question_en;};
  const RB=()=><div style={{textAlign:"center",mb:16,marginBottom:16}}><span style={{background:"rgba(255,215,0,.1)",color:"#FFD700",padding:"6px 20px",borderRadius:20,fontSize:13,fontWeight:700,border:"1px solid rgba(255,215,0,.2)"}}>{t.round} {rd?.round||1} {t.of} {rd?.settings?.rounds||10}</span></div>;
  const LeaveBtn=()=><button onClick={leaveRoom} style={{...B,width:"100%",background:"rgba(255,59,48,.15)",color:"#FF6B6B",padding:"12px",borderRadius:12,marginTop:16,fontSize:14,fontWeight:600}}>{t.leave} 🚪</button>;
  const TopBar=()=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <span style={{color:"#FFD700",fontWeight:700}}>{room&&`🃏 ${room}`}</span>
    <button onClick={leaveRoom} style={{...B,background:"rgba(255,59,48,.15)",color:"#FF6B6B",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600}}>{t.leave}</button>
  </div>;

  const getAvatar=(id)=>AVATARS.find(a=>a.id===id)||AVATARS[0];
  const PlayerAvatar=({avatarId,size=40})=>{const av=getAvatar(avatarId);return<div style={{width:size,height:size,borderRadius:"50%",background:av.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.5,flexShrink:0,boxShadow:"0 4px 12px rgba(0,0,0,.3)",border:"2px solid rgba(255,255,255,.15)"}}>{av.emoji}</div>;};
  const AvatarPicker=()=><div style={{marginBottom:16,width:280}}>
    <p style={{color:"rgba(255,255,255,.5)",fontSize:12,textAlign:"center",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:2}}>Choose Avatar</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
      {AVATARS.map(av=><button key={av.id} onClick={()=>setMyAvatar(av.id)} style={{...B,width:44,height:44,borderRadius:"50%",background:myAvatar===av.id?av.bg:"rgba(255,255,255,.06)",border:myAvatar===av.id?"2px solid #FFD700":"2px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,padding:0,transform:myAvatar===av.id?"scale(1.15)":"scale(1)",boxShadow:myAvatar===av.id?"0 0 16px rgba(255,215,0,.4)":"none"}}>{av.emoji}</button>)}
    </div>
  </div>;

  const bg="linear-gradient(180deg,#0f0c29,#1a1a3e)";
  const FloatingLegalButton = () => (

);
  const LegalModal = () =>
  showLegal ? (
    <div
      onClick={() => setShowLegal(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.82)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "86vh",
          overflow: "hidden",
          background: "linear-gradient(180deg,#16132f,#1a1a3e)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
          display: "flex",
          flexDirection: "column",
          direction: he ? "rtl" : "ltr"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "16px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,.08)"
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setLegalTab("terms")}
              style={{
                ...B,
                padding: "10px 14px",
                borderRadius: 10,
                background:
                  legalTab === "terms"
                    ? "rgba(255,215,0,.18)"
                    : "rgba(255,255,255,.06)",
                color: legalTab === "terms" ? "#FFD700" : "#fff",
                fontSize: 13,
                fontWeight: 700,
                border:
                  legalTab === "terms"
                    ? "1px solid rgba(255,215,0,.25)"
                    : "1px solid rgba(255,255,255,.08)"
              }}
            >
              {t.terms}
            </button>

            <button
              onClick={() => setLegalTab("privacy")}
              style={{
                ...B,
                padding: "10px 14px",
                borderRadius: 10,
                background:
                  legalTab === "privacy"
                    ? "rgba(192,132,252,.18)"
                    : "rgba(255,255,255,.06)",
                color: legalTab === "privacy" ? "#C084FC" : "#fff",
                fontSize: 13,
                fontWeight: 700,
                border:
                  legalTab === "privacy"
                    ? "1px solid rgba(192,132,252,.25)"
                    : "1px solid rgba(255,255,255,.08)"
              }}
            >
              {t.privacy}
            </button>
          </div>

          <button
            onClick={() => setShowLegal(false)}
            style={{
              ...B,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,.06)",
              color: "rgba(255,255,255,.75)",
              fontSize: 18,
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,.08)"
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: 18,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            color: "rgba(255,255,255,.86)",
            lineHeight: 1.8,
            fontSize: 14
          }}
        >
          <h2
            style={{
              margin: "0 0 14px",
              color: legalTab === "terms" ? "#FFD700" : "#C084FC",
              fontSize: 22,
              fontWeight: 900
            }}
          >
            {legalTab === "terms" ? t.termsTitle : t.privacyTitle}
          </h2>

          {LEGAL[lang][legalTab]}
        </div>
      </div>
    </div>
  ) : null;

  // ════════ HOME ════════
  if(!room&&page==="home")return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",padding:20}}>
    <button
  onClick={() => {
    setLegalTab("terms");
    setShowLegal(true);
  }}
  style={{
    position: "fixed",
    top: 14,
    right: lang === "he" ? "auto" : 14,
    left: lang === "he" ? 14 : "auto",
    zIndex: 1000,
    background: "rgba(15,12,41,.88)",
    color: "#FFD700",
    border: "1px solid rgba(255,215,0,.25)",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 800,
    boxShadow: "0 8px 24px rgba(0,0,0,.35)",
    cursor: "pointer"
  }}
>
  📄 {t.legal}
</button>

{showLegal && (
  <div
    onClick={() => setShowLegal(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.82)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: 760,
        maxHeight: "86vh",
        overflow: "hidden",
        background: "linear-gradient(180deg,#16132f,#1a1a3e)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,.08)"
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setLegalTab("terms")}
            style={{
              ...B,
              padding: "10px 14px",
              borderRadius: 10,
              background:
                legalTab === "terms"
                  ? "rgba(255,215,0,.18)"
                  : "rgba(255,255,255,.06)",
              color: legalTab === "terms" ? "#FFD700" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              border:
                legalTab === "terms"
                  ? "1px solid rgba(255,215,0,.25)"
                  : "1px solid rgba(255,255,255,.08)"
            }}
          >
            {t.terms}
          </button>

          <button
            onClick={() => setLegalTab("privacy")}
            style={{
              ...B,
              padding: "10px 14px",
              borderRadius: 10,
              background:
                legalTab === "privacy"
                  ? "rgba(192,132,252,.18)"
                  : "rgba(255,255,255,.06)",
              color: legalTab === "privacy" ? "#C084FC" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              border:
                legalTab === "privacy"
                  ? "1px solid rgba(192,132,252,.25)"
                  : "1px solid rgba(255,255,255,.08)"
            }}
          >
            {t.privacy}
          </button>
        </div>

        <button
          onClick={() => setShowLegal(false)}
          style={{
            ...B,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,.06)",
            color: "rgba(255,255,255,.75)",
            fontSize: 18,
            fontWeight: 800,
            border: "1px solid rgba(255,255,255,.08)"
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: 18,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          color: "rgba(255,255,255,.86)",
          lineHeight: 1.8,
          fontSize: 14
        }}
      >
        <h2
          style={{
            margin: "0 0 14px",
            color: legalTab === "terms" ? "#FFD700" : "#C084FC",
            fontSize: 22,
            fontWeight: 900
          }}
        >
          {legalTab === "terms" ? t.termsTitle : t.privacyTitle}
        </h2>

        {LEGAL[lang][legalTab]}
      </div>
    </div>
  </div>
)}
    <style>{`@keyframes f{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button{font-family:inherit;border:none;cursor:pointer;transition:all .2s}button:hover{filter:brightness(1.1)}input{font-family:inherit}input:focus{outline:none;border-color:rgba(192,132,252,.5)!important}`}</style>
    <div style={{fontSize:100,marginBottom:8,filter:"drop-shadow(0 0 30px rgba(255,215,0,.3))",animation:"f 3s ease-in-out infinite"}}>🃏</div>
    <h1 style={{fontSize:56,fontWeight:900,margin:0,background:"linear-gradient(135deg,#FFD700,#FF6B6B,#C084FC)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.appName}</h1>
    <p style={{color:"rgba(255,255,255,.6)",fontSize:18,marginTop:4,marginBottom:32,fontStyle:"italic"}}>{t.tagline}</p>
    <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder={t.enterName} maxLength={12} style={{...I,width:260,textAlign:"center",fontSize:18,marginBottom:16}}/>
    <AvatarPicker/>
    <button onClick={createRoom} style={{...B,background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:18,fontWeight:800,padding:"16px 0",borderRadius:14,width:260,marginBottom:12,boxShadow:"0 8px 32px rgba(255,215,0,.3)",opacity:myName.trim()?1:.4}}>{t.createGame}</button>
    <button onClick={()=>setPage("join")} style={{...B,background:"rgba(255,255,255,.1)",color:"#C084FC",fontSize:16,fontWeight:700,padding:"14px 0",borderRadius:14,width:260}}>{t.joinGame}</button>
    <button onClick={()=>setShowHelp(true)} style={{...B,background:"transparent",color:"rgba(255,255,255,.5)",fontSize:14,fontWeight:600,padding:"12px 0",width:260,marginTop:8}}>❓ {t.howToPlay}</button>
    <button
  onClick={() => {
    setLegalTab("terms");
    setShowLegal(true);
  }}
  style={{
    ...B,
    background: "transparent",
    color: "#FFD700",
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 0",
    width: 260,
    marginTop: 2,
    textDecoration: "underline",
    letterSpacing: 0.3
  }}
>
  📄 {t.legal}
</button>
    {showHelp&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowHelp(false)}>
      <div style={{background:"#1a1a3e",borderRadius:20,padding:24,maxWidth:400,width:"100%",maxHeight:"80vh",overflow:"auto",border:"1px solid rgba(255,215,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <h2 style={{color:"#FFD700",fontSize:22,margin:"0 0 16px",textAlign:"center"}}>{t.howTitle}</h2>
        <div style={{color:"rgba(255,255,255,.8)",fontSize:14,lineHeight:1.8,whiteSpace:"pre-line"}}>{t.howBody}</div>
        <button onClick={()=>setShowHelp(false)} style={{...B,width:"100%",background:"linear-gradient(135deg,#C084FC,#818CF8)",color:"#fff",padding:"12px",borderRadius:12,fontSize:16,fontWeight:700,marginTop:20}}>{t.close}</button>
      </div>
    </div>}
    <div style={{display:"flex",gap:12,marginTop:24,background:"rgba(255,255,255,.08)",borderRadius:12,padding:6}}>
      {[["en","EN"],["he","עב"]].map(([l,lb])=><button key={l} onClick={()=>setLang(l)} style={{...B,padding:"8px 16px",borderRadius:8,fontSize:14,fontWeight:700,background:lang===l?"rgba(255,215,0,.3)":"transparent",color:lang===l?"#FFD700":"rgba(255,255,255,.5)"}}>{lb}</button>)}
    </div>
  </div>);

  // ════════ JOIN ════════
  if(!room&&page==="join")return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",padding:20}}>
    <div style={{fontSize:64,marginBottom:16}}>🃏</div>
    <h2 style={{color:"#FFD700",fontSize:28,marginBottom:24}}>{t.joinGame}</h2>
    <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder={t.enterName} maxLength={12} style={{...I,width:260,textAlign:"center",fontSize:18,marginBottom:12}}/>
    <AvatarPicker/>
    <input value={joinCode} onChange={e=>setJoinCode(e.target.value.replace(/\D/g,""))} placeholder="000000" maxLength={6} style={{...I,width:240,textAlign:"center",fontSize:28,fontWeight:800,letterSpacing:8,marginBottom:16}} inputMode="numeric"/>
    {err&&<p style={{color:"#f87171",marginBottom:12,fontSize:14}}>{err}</p>}
    <button onClick={joinRoom} style={{...B,background:"linear-gradient(135deg,#C084FC,#818CF8)",color:"#fff",fontSize:18,fontWeight:700,padding:"14px 50px",borderRadius:14,opacity:myName.trim()&&joinCode.length===6?1:.4}}>{t.join}</button>
    <button onClick={()=>{setPage("home");setErr("");}} style={{...B,background:"transparent",color:"rgba(255,255,255,.5)",marginTop:16,fontSize:14}}>← {t.back}</button>
  </div>);

  // From here, we have a room. Render based on rd.state
  if(!rd)return(<div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"rgba(255,255,255,.5)"}}>Loading...</p></div>);

  // ════════ LOBBY ════════
  if(state==="lobby")return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:16}}>
      <span style={{fontSize:48}}>🃏</span>
      <h2 style={{color:"#FFD700",fontSize:24,margin:"4px 0"}}>{t.appName}</h2>
      <div style={{background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.2)",borderRadius:12,padding:"12px 20px",margin:"12px auto",maxWidth:300}}>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:12,margin:"0 0 4px"}}>{t.share}</p>
        <p style={{color:"#FFD700",fontSize:32,fontWeight:900,letterSpacing:6,margin:0,fontFamily:"monospace"}}>{room}</p>
        <div style={{margin:"12px auto",background:"#fff",padding:8,borderRadius:8,width:"fit-content"}}><QRCode value={joinUrl} size={120}/></div>
        <button onClick={copyLink} style={{...B,background:"rgba(255,255,255,.1)",color:"#C084FC",padding:"8px 20px",borderRadius:8,fontSize:13,fontWeight:600,marginTop:4}}>{copied?"✓":t.copy}</button>
      </div>
    </div>
    <div style={{...C,marginBottom:16}}>
      <h3 style={{color:"#C084FC",margin:"0 0 12px",fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.players} ({playerCount}/5)</h3>
      {playerList.map(([id,p],i)=><div key={id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:id===uid?"rgba(192,132,252,.08)":"rgba(255,255,255,.05)",borderRadius:10,marginBottom:6,border:id===uid?"1px solid rgba(192,132,252,.2)":"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <PlayerAvatar avatarId={p.avatar} size={36}/><span style={{color:"#fff",fontWeight:600}}>{p.name}{id===uid?" (You)":""}</span>
          {id===rd.host&&<span style={{background:"rgba(255,215,0,.2)",color:"#FFD700",fontSize:10,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{t.host}</span>}
        </div>
        {isHost&&id!==uid&&<button onClick={()=>kickPlayer(id)} style={{...B,background:"rgba(255,59,48,.2)",color:"#FF3B30",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600}}>{t.kick}</button>}
      </div>)}
    </div>
    {isHost&&<>
    <div style={{...C,marginBottom:16}}>
      <h3 style={{color:"#C084FC",margin:"0 0 12px",fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.settings}</h3>
      {[["time",t.time,10,120,10,t.sec],["rounds",t.rounds,1,20,1,""]].map(([k,l,mn,mx,st,sf])=>
        <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:14}}>{l}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>updateSetting(k,Math.max(mn,(rd?.settings?.[k]||30)-st))} style={SB}>−</button>
            <span style={{color:"#FFD700",fontWeight:800,fontSize:20,minWidth:40,textAlign:"center"}}>{rd?.settings?.[k]||(k==="time"?30:10)}</span>
            <button onClick={()=>updateSetting(k,Math.min(mx,(rd?.settings?.[k]||30)+st))} style={SB}>+</button>
            {sf&&<span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>{sf}</span>}
          </div>
        </div>)}
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {[["en","EN"],["he","עב"]].map(([l,lb])=><button key={l} onClick={()=>changeLang(l)} style={{...B,padding:"6px 14px",borderRadius:8,fontSize:13,background:(rd?.lang||lang)===l?"rgba(255,215,0,.2)":"rgba(255,255,255,.05)",color:(rd?.lang||lang)===l?"#FFD700":"rgba(255,255,255,.5)",fontWeight:600}}>{lb}</button>)}
      </div>
    </div>
    <div style={{...C,marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{color:"#C084FC",margin:0,fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.cats}</h3>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>update(ref(db,`rooms/${room}/settings`),{cats:CATS})} style={{...B,background:"none",color:"#4ade80",fontSize:12,fontWeight:600}}>{t.all}</button>
          <button onClick={()=>update(ref(db,`rooms/${room}/settings`),{cats:[]})} style={{...B,background:"none",color:"#f87171",fontSize:12,fontWeight:600}}>{t.none}</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {CATS.map(c=>{const a=(rd?.settings?.cats||[]).includes(c);return<button key={c} onClick={()=>toggleCat(c)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:a?"rgba(192,132,252,.15)":"rgba(255,255,255,.03)",border:a?"1px solid rgba(192,132,252,.4)":"1px solid rgba(255,255,255,.06)",borderRadius:10,...B}}>
          <span style={{fontSize:16}}>{ICONS[c]}</span><span style={{color:a?"#C084FC":"rgba(255,255,255,.4)",fontSize:12,fontWeight:a?600:400}}>{t[c]}</span>
        </button>;})}
      </div>
    </div>
    <button onClick={startGame} disabled={playerCount<2} style={{...B,width:"100%",background:playerCount>=2?"linear-gradient(135deg,#FFD700,#FFA500)":"#333",color:"#1a1a2e",fontSize:20,fontWeight:800,padding:"16px 0",borderRadius:16,opacity:playerCount>=2?1:.4}}>{t.start}</button>
    </>}
    {!isHost&&<div style={{...C,textAlign:"center"}}><p style={{color:"rgba(255,255,255,.5)"}}>{t.waitHost}</p></div>}
    <LeaveBtn/>
  </div></div>);

  // ════════ CATEGORY SELECT ════════
  if(state==="catSel"){const turnUid=playerList[rd?.turnIdx||0]?.[0];const isMyTurn=turnUid===uid;const turnName=rd?.players?.[turnUid]?.name||"?";
  const cats=rd?.settings?.cats||CATS;
  return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    {rd?.catDeadline&&<div style={{textAlign:"center",marginBottom:12}}>
      <span style={{color:catTimer<=5?"#f87171":"#FFD700",fontSize:32,fontWeight:900}}>{catTimer}</span>
      <span style={{color:"rgba(255,255,255,.4)",fontSize:12,marginInlineStart:8}}>{t.timerLabel}</span>
    </div>}
    <div style={{textAlign:"center"}}><span style={{fontSize:40}}>👆</span>
    <p style={{color:"#FFD700",fontSize:20,fontWeight:700,margin:"8px 0"}}>{turnName}{t.turn}</p></div>
    {isMyTurn?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
      {cats.slice(0,8).map(c=><button key={c} onClick={()=>selectCategory(c)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:"20px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,...B}}>
        <span style={{fontSize:32}}>{ICONS[c]}</span><span style={{color:"#fff",fontSize:13,fontWeight:600}}>{t[c]}</span>
      </button>)}
    </div>:<p style={{color:"rgba(255,255,255,.5)",marginTop:20,textAlign:"center"}}>{t.waiting}</p>}
  </div></div>);}

  // ════════ ANSWERING ════════
  if(state==="answering"){const q=rd.question;return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    <div style={{textAlign:"center",marginBottom:12}}>
      <span style={{color:timer<=5?"#f87171":"#FFD700",fontSize:32,fontWeight:900}}>{timer}</span>
      <span style={{color:"rgba(255,255,255,.4)",fontSize:12,marginInlineStart:8}}>{t.timerLabel}</span>
    </div>
    <div style={{...C,marginBottom:16,textAlign:"center",borderColor:"rgba(255,215,0,.2)"}}>
      <span style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2}}>{t[q?.category]} • {q?.difficulty}</span>
      {(q?.flag_country||q?.flag_code)&&<FI c={q.flag_country} code={q.flag_code} flag={q.flag}/>}
      <p style={{color:"#fff",fontSize:20,fontWeight:700,margin:"10px 0 0",lineHeight:1.4}}>{QT()}</p>
    </div>
    {!answered?(<div style={{...C,textAlign:"center"}}>
      <input value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitAnswer()} placeholder={t.typeAns} style={{...I,width:"100%",textAlign:"center",fontSize:18,marginBottom:12}} autoFocus/>
      <button onClick={submitAnswer} disabled={!ci.trim()} style={{...B,background:ci.trim()?"linear-gradient(135deg,#4ade80,#22c55e)":"#333",color:"#fff",padding:"12px 40px",borderRadius:12,fontSize:16,fontWeight:700,opacity:ci.trim()?1:.4}}>{t.submit}</button>
    </div>):needBluff?(<div style={{...C,textAlign:"center",borderColor:"rgba(255,215,0,.3)",background:"rgba(255,215,0,.05)"}}>
      <div style={{fontSize:48,marginBottom:8}}>🎭</div>
      <p style={{color:"#fff",fontSize:16,lineHeight:1.5,margin:"0 0 12px"}}>{t.bluffMsg}</p>
      <input value={bi} onChange={e=>setBi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitBluff()} placeholder={t.typeBluff} style={{...I,width:"100%",textAlign:"center",fontSize:18,marginBottom:4}} autoFocus/>
      {bi.trim()&&rd?.question&&(strictMatch(bi,rd.question.answer_en)||strictMatch(bi,rd.question.answer_he)||isCorrectBilingual(bi,rd.question.answer_en,rd.question.answer_he))&&<p style={{color:"#f87171",fontSize:12,margin:"4px 0 8px"}}>{he?"אי אפשר לשלוח את התשובה הנכונה!":"Can't submit the correct answer!"}</p>}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
        <button onClick={submitBluff} disabled={!bi.trim()} style={{...B,background:bi.trim()?"linear-gradient(135deg,#FFD700,#FFA500)":"#333",color:"#1a1a2e",padding:"12px 28px",borderRadius:12,fontSize:16,fontWeight:700,opacity:bi.trim()?1:.4}}>{t.sendBluff}</button>
        <button onClick={skipBluff} style={{...B,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",padding:"12px 20px",borderRadius:12,fontSize:14}}>{t.skip}</button>
      </div>
    </div>):(<div style={{...C,textAlign:"center"}}>
      <div style={{fontSize:48}}>✓</div>
      <p style={{color:"#4ade80",fontWeight:600}}>{t.youAnswered}</p>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:14,marginTop:8}}>{t.waiting}</p>
    </div>)}
    <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
      {playerList.map(([id,p],i)=>{const done=!!rd?.publicAnswers?.[id];return<div key={id} style={{width:36,height:36,borderRadius:10,background:done?"rgba(74,222,128,.2)":"rgba(255,255,255,.05)",border:done?"1px solid rgba(74,222,128,.4)":"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:done?"#4ade80":"rgba(255,255,255,.4)"}}>{done?"✓":p.name[0]}</div>;})}
    </div>
  </div></div>);}

  // ════════ REVEAL ════════
  const OPT_LETTERS=["A","B","C","D","E","F","G","H"];
  const OPT_COLORS=["#C084FC","#FFD700","#4ade80","#f87171","#38bdf8","#fb923c","#e879f9","#facc15"];
  if(state==="reveal"&&rd?.options)return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    {rd?.revealDeadline&&<div style={{textAlign:"center",marginBottom:16}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:10,background:revealTimer<=5?"rgba(248,113,113,.15)":"rgba(255,215,0,.1)",border:revealTimer<=5?"1px solid rgba(248,113,113,.3)":"1px solid rgba(255,215,0,.2)",borderRadius:30,padding:"8px 24px"}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:revealTimer<=5?"rgba(248,113,113,.2)":"rgba(255,215,0,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:revealTimer<=5?"#f87171":"#FFD700",fontSize:22,fontWeight:900}}>{revealTimer}</span>
        </div>
        <span style={{color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:600}}>{t.timerLabel}</span>
      </div>
    </div>}
    <div style={{...C,marginBottom:20,textAlign:"center",borderColor:"rgba(255,215,0,.25)",background:"rgba(255,215,0,.04)"}}>
      <span style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2}}>{t[rd.question?.category]} {rd.question?.difficulty?`• ${rd.question.difficulty}`:""}</span>
      {(rd.question?.flag_country||rd.question?.flag_code)&&<FI c={rd.question.flag_country} code={rd.question.flag_code} flag={rd.question.flag}/>}
      <p style={{color:"#fff",fontSize:20,fontWeight:700,margin:"10px 0 0",lineHeight:1.4}}>{QT()}</p>
    </div>
    {!selected?(<div>
      <p style={{textAlign:"center",color:"#C084FC",fontSize:15,fontWeight:700,marginBottom:16,letterSpacing:1}}>🎯 {t.choose}</p>
      <div style={{display:"grid",gridTemplateColumns:rd.options.length<=4?"1fr":"1fr 1fr",gap:10}}>
      {rd.options.map((o,i)=><button key={i} onClick={()=>selectOption(i)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"14px 16px",background:"rgba(255,255,255,.05)",border:`2px solid ${OPT_COLORS[i%8]}22`,borderRadius:16,textAlign:he?"right":"left",...B,position:"relative",overflow:"hidden"}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${OPT_COLORS[i%8]}20`,border:`1px solid ${OPT_COLORS[i%8]}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:OPT_COLORS[i%8],fontSize:16,fontWeight:800}}>{OPT_LETTERS[i]}</span>
        </div>
        <span style={{color:"#fff",fontSize:16,fontWeight:600,lineHeight:1.3}}>{o.text}</span>
      </button>)}
      </div>
    </div>):(<div style={{...C,textAlign:"center",borderColor:"rgba(192,132,252,.2)",background:"rgba(192,132,252,.04)"}}>
      <div style={{fontSize:48,marginBottom:4}}>🤔</div>
      <p style={{color:"#C084FC",fontWeight:700,fontSize:16,margin:"0 0 4px"}}>{he?"בחרת!":"Locked in!"}</p>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>{t.waiting}</p>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
        {playerList.map(([id,p],i)=>{const d=rd?.selections?.[id]!==undefined;return<div key={id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:40,height:40,borderRadius:12,background:d?"rgba(74,222,128,.15)":"rgba(255,255,255,.05)",border:d?"2px solid rgba(74,222,128,.4)":"2px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:d?"#4ade80":"rgba(255,255,255,.3)",transition:"all .3s"}}>{d?"✓":EMO[i]||"🎮"}</div>
          <span style={{color:d?"#4ade80":"rgba(255,255,255,.3)",fontSize:10,fontWeight:600,maxWidth:48,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
        </div>;})}
      </div>
    </div>)}
  </div></div>);

  // ════════ POST ROUND ════════
  if(state==="post"&&rd?.results){const sorted=[...playerList].sort((a,b)=>(b[1].score||0)-(a[1].score||0));const maxScore=Math.max(1,...sorted.map(([,p])=>p.score||0));return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    {/* ── Correct Answer Banner ── */}
    <div style={{...C,marginBottom:20,textAlign:"center",borderColor:"rgba(74,222,128,.3)",background:"linear-gradient(135deg,rgba(74,222,128,.08),rgba(74,222,128,.02))",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:.06}}>✓</div>
      <span style={{fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:3,fontWeight:700}}>{t.correct}</span>
      {(rd.question?.flag_country||rd.question?.flag_code)&&<FI c={rd.question.flag_country} code={rd.question.flag_code} flag={rd.question.flag}/>}
      <p style={{color:"#4ade80",fontSize:28,fontWeight:900,margin:"8px 0 0",textShadow:"0 0 20px rgba(74,222,128,.3)"}}>{rd.correctAnswer}</p>
    </div>

    {/* ── Per-Player Results ── */}
    <div style={{marginBottom:20}}>
      <h3 style={{color:"#C084FC",fontSize:12,textTransform:"uppercase",letterSpacing:3,margin:"0 0 12px",fontWeight:700}}>📊 {he?"תוצאות הסיבוב":"Round Results"}</h3>
      {playerList.map(([id,p],i)=>{const r=rd.results[id]||{};const oi=rd.selections?.[id];const pk=rd.options?.[oi];
        const pkIsSys=Array.isArray(pk?.ai)&&(pk.ai.length===0||(pk.ai.length===1&&pk.ai[0]==="sys"));
        const pkNames=Array.isArray(pk?.an)?pk.an.join(", "):"";
        const isCorrectPick=pk?.ok;
        return<div key={id} style={{...C,marginBottom:10,padding:"14px 16px",borderColor:isCorrectPick?"rgba(74,222,128,.25)":r.sf?"rgba(255,165,0,.25)":"rgba(255,255,255,.06)",background:isCorrectPick?"rgba(74,222,128,.04)":r.sf?"rgba(255,165,0,.04)":"rgba(255,255,255,.02)",transition:"all .3s"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:12,background:isCorrectPick?"rgba(74,222,128,.15)":"rgba(255,255,255,.06)",border:isCorrectPick?"2px solid rgba(74,222,128,.3)":"2px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:18}}>{EMO[i]||"🎮"}</span>
            </div>
            <div>
              <p style={{color:"#fff",fontWeight:700,margin:0,fontSize:15}}>{p.name}{id===uid?<span style={{color:"rgba(255,255,255,.3)",fontSize:11,marginInlineStart:6}}>(You)</span>:""}</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {r.e>0&&<div style={{background:r.e>=2?"linear-gradient(135deg,#FFD700,#FFA500)":"rgba(255,215,0,.15)",color:r.e>=2?"#1a1a2e":"#FFD700",padding:"4px 12px",borderRadius:20,fontSize:16,fontWeight:900}}>+{r.e}</div>}
            {r.e===0&&<div style={{color:"rgba(255,255,255,.25)",fontSize:14,fontWeight:600}}>+0</div>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:10,marginBottom:4}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.4)",flexShrink:0}}>{he?"בחר/ה:":"Picked:"}</span>
          <span style={{color:isCorrectPick?"#4ade80":"#f87171",fontWeight:600,fontSize:14}}>{isCorrectPick?"✓":"✗"} {pk?.text||"—"}</span>
        </div>
        {r.sf&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(255,165,0,.08)",borderRadius:10,marginTop:4}}>
          <span style={{fontSize:14}}>🤦</span>
          <span style={{color:"#FFA500",fontSize:12,fontWeight:600}}>{t.selfFool}</span>
        </div>}
        {!isCorrectPick&&!pkIsSys&&pkNames&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",marginTop:2}}>
          <span style={{color:"rgba(255,255,255,.25)",fontSize:11}}>✍️ {t.wroteBy} <span style={{color:"rgba(255,255,255,.5)",fontWeight:600}}>{pkNames}</span></span>
        </div>}
        {r.fb?.length>0&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"rgba(192,132,252,.06)",borderRadius:10,marginTop:4}}>
          <span style={{fontSize:14}}>😈</span>
          <span style={{color:"#C084FC",fontSize:12,fontWeight:600}}>{t.fooled} {r.fb.length}: {r.fb.join(", ")}</span>
        </div>}
        {isHost&&id!==uid&&<button onClick={()=>kickPlayer(id)} style={{...B,background:"rgba(255,59,48,.1)",color:"#FF6B6B",padding:"3px 10px",borderRadius:6,fontSize:10,marginTop:6}}>{t.kick}</button>}
      </div>;})}
    </div>

    {/* ── All Answers Breakdown ── */}
    <div style={{...C,margin:"0 0 20px",borderColor:"rgba(255,255,255,.08)"}}>
      <h3 style={{color:"rgba(255,255,255,.5)",fontSize:12,textTransform:"uppercase",letterSpacing:2,margin:"0 0 12px",fontWeight:600}}>{t.allAns}</h3>
      {(rd.options||[]).map((o,i)=>{
        const isSys=Array.isArray(o.ai)&&(o.ai.length===0||(o.ai.length===1&&o.ai[0]==="sys"));
        const names=Array.isArray(o.an)?o.an.join(", "):"";
        const pickedBy=Object.entries(rd.selections||{}).filter(([,idx])=>idx===i).map(([pid])=>rd.players?.[pid]?.name||"?");
        return<div key={i} style={{padding:"10px 12px",marginBottom:6,background:o.ok?"rgba(74,222,128,.06)":"rgba(255,255,255,.02)",border:o.ok?"1px solid rgba(74,222,128,.15)":"1px solid rgba(255,255,255,.04)",borderRadius:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:24,height:24,borderRadius:6,background:o.ok?"rgba(74,222,128,.2)":"rgba(255,255,255,.06)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:o.ok?"#4ade80":"rgba(255,255,255,.4)"}}>{OPT_LETTERS[i]}</span>
            <span style={{color:o.ok?"#4ade80":"#fff",fontWeight:o.ok?700:500,fontSize:14}}>{o.text}</span>
          </div>
          <span style={{color:"rgba(255,255,255,.3)",fontSize:11,fontWeight:600}}>{o.ok?"✓ "+t.correct:isSys?"🤖 "+t.auto:"✍️ "+names}</span>
        </div>
        {pickedBy.length>0&&<div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>
          {pickedBy.map((n,j)=><span key={j} style={{background:o.ok?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)",color:o.ok?"#4ade80":"#f87171",fontSize:10,padding:"2px 8px",borderRadius:12,fontWeight:600}}>👆 {n}</span>)}
        </div>}
      </div>;})}
    </div>

    {/* ── Score Bar Chart ── */}
    <div style={{...C,marginBottom:20,borderColor:"rgba(255,215,0,.12)"}}>
      <h3 style={{color:"#FFD700",margin:"0 0 14px",fontSize:15,textAlign:"center",fontWeight:800}}>🏆 {t.scoreboard}</h3>
      {sorted.map(([id,p],i)=>{const pct=maxScore>0?((p.score||0)/maxScore)*100:0;return<div key={id} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"rgba(255,255,255,.5)",fontWeight:900,fontSize:16,minWidth:26}}>#{i+1}</span>
            <span style={{color:"#fff",fontWeight:600,fontSize:14}}>{p.name}</span>
          </div>
          <span style={{color:"#FFD700",fontWeight:900,fontSize:18}}>{p.score||0}</span>
        </div>
        <div style={{height:8,borderRadius:4,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:4,background:i===0?"linear-gradient(90deg,#FFD700,#FFA500)":i===1?"linear-gradient(90deg,#C0C0C0,#A0A0A0)":"linear-gradient(90deg,#CD7F32,#B87333)",width:`${pct}%`,transition:"width .8s ease-out"}}/>
        </div>
      </div>;})}
    </div>

    {isHost?<button onClick={nextRound} style={{...B,width:"100%",background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:18,fontWeight:800,padding:"16px 0",borderRadius:14,boxShadow:"0 8px 32px rgba(255,215,0,.2)"}}>{(rd?.round||1)>=(rd?.settings?.rounds||10)?t.over:t.next} →</button>
    :<p style={{textAlign:"center",color:"rgba(255,255,255,.4)",fontSize:14}}>{t.waiting}</p>}
  </div></div>);}

  // ════════ GAME OVER ════════
  if(state==="over"){const sorted=[...playerList].sort((a,b)=>(b[1].score||0)-(a[1].score||0));const w=sorted[0];return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#302b63,#24243e)",padding:20,display:"flex",alignItems:"center",justifyContent:"center",direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,width:"100%",textAlign:"center"}}>
    <div style={{fontSize:80,marginBottom:8,animation:"f 2s ease-in-out infinite"}}>🏆</div>
    <h1 style={{color:"#FFD700",fontSize:36,fontWeight:900,margin:"0 0 4px"}}>{t.over}</h1>
    <div style={{...C,margin:"20px 0",borderColor:"rgba(255,215,0,.3)",background:"rgba(255,215,0,.05)",padding:24}}>
      <div style={{fontSize:56}}>👑</div>
      <p style={{color:"#FFD700",fontSize:28,fontWeight:900,margin:"0 0 4px"}}>{w?.[1]?.name}</p>
      <p style={{color:"#fff",fontSize:36,fontWeight:900}}>{w?.[1]?.score||0} {t.pts}</p>
    </div>
    {sorted.slice(1).map(([id,p],i)=><div key={id} style={{...C,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:i===0?"#C0C0C0":"#CD7F32",fontWeight:800,fontSize:20}}>#{i+2}</span>
        <span style={{color:"#fff",fontWeight:600}}>{p.name}</span>
      </div>
      <span style={{color:"rgba(255,255,255,.7)",fontWeight:800,fontSize:20}}>{p.score||0} {t.pts}</span>
    </div>)}
    <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"center"}}>
      {isHost&&<button onClick={playAgain} style={{...B,background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:16,fontWeight:700,padding:"14px 32px",borderRadius:14}}>{t.again}</button>}
      <button onClick={leaveRoom} style={{...B,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:16,padding:"14px 32px",borderRadius:14}}>{t.menu}</button>
    </div>
  </div></div>);}

  // ════════ FALLBACK ════════
  return(<div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{textAlign:"center"}}><div style={{fontSize:64}}>🃏</div><p style={{color:"rgba(255,255,255,.5)",marginTop:8}}>Loading...</p>
    <button onClick={leaveRoom} style={{...B,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",padding:"10px 24px",borderRadius:10,marginTop:16}}>← Home</button></div>
  </div>);
}

const B={border:"none",cursor:"pointer",transition:"all .2s"};
const I={background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"12px 16px",color:"#fff",fontSize:16,outline:"none"};
const C={background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"16px 20px"};
const SB={width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};
