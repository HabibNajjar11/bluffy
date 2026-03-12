import { useState, useEffect, useRef } from "react";
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

const T={en:{appName:"Bluffy",tagline:"The Bluffing Party Game",createGame:"Create Game",joinGame:"Join Game",enterName:"Your name",enterCode:"Room code",join:"Join",start:"Start Game!",players:"Players",settings:"Settings",time:"Time/question",sec:"sec",rounds:"Rounds",cats:"Categories",all:"All",none:"None",pickCat:"Pick a Category!",turn:"'s turn",typeAns:"Type answer...",submit:"Submit",waiting:"Waiting for others...",bluffMsg:"Correct! Type a plausible WRONG answer.",typeBluff:"Fake answer...",sendBluff:"Submit Bluff",skip:"Skip",choose:"Pick the correct answer",round:"Round",of:"of",pts:"pts",correct:"Correct",fooled:"fooled",scoreboard:"Scoreboard",next:"Next Round",over:"Game Over!",winner:"Winner!",again:"Play Again",menu:"Menu",kick:"Kick",leave:"Leave",host:"Host",wroteBy:"by",selfFool:"picked own bluff!",flag:"Which country's flag?",allAns:"All Answers",auto:"Auto",share:"Share code:",or:"or scan QR:",copied:"Copied!",copy:"Copy Link",waitHost:"Waiting for host...",youAnswered:"Answer submitted!",general_knowledge:"General Knowledge",history:"History",geography:"Geography",flags:"Flags",movies:"Movies",cartoons:"Cartoons",famous:"Famous People",sport:"Sport",football:"Football",fashion:"Fashion",strange_questions:"Strange Q's",science:"Science",timerLabel:"sec left",back:"Back",howToPlay:"How to Play",howTitle:"How to Play Bluffy",howBody:"1. Create a room and share the code\n2. Each round, one player picks a category\n3. Everyone types their answer\n4. If CORRECT — write a convincing WRONG answer to fool others!\n5. All answers shuffled as multiple choice\n6. Everyone picks what they think is correct\n\nScoring:\n+2 for correct pick\n+1 per player your fake answer fools\n0 if you pick your own fake (self-fool!)\n\nMost points wins!",close:"Close"},
he:{appName:"בלאפי",tagline:"משחק הבלאפים",createGame:"צור משחק",joinGame:"הצטרף",enterName:"השם שלך",enterCode:"קוד חדר",join:"הצטרף",start:"!התחל",players:"שחקנים",settings:"הגדרות",time:"זמן/שאלה",sec:"שנ׳",rounds:"סיבובים",cats:"קטגוריות",all:"הכל",none:"כלום",pickCat:"!בחר קטגוריה",turn:" בוחר/ת",typeAns:"...הקלד תשובה",submit:"שלח",waiting:"...ממתינים",bluffMsg:"!נכון! הקלד תשובה שגויה משכנעת",typeBluff:"...מזויפת",sendBluff:"שלח בלאף",skip:"דלג",choose:"?מה נכון",round:"סיבוב",of:"מתוך",pts:"נק׳",correct:"נכון",fooled:"רימה",scoreboard:"ניקוד",next:"הבא",over:"!נגמר",winner:"!מנצח",again:"שוב",menu:"תפריט",kick:"הסר",leave:"עזוב",host:"מארח",wroteBy:"ע\"י",selfFool:"!בלאף עצמי",flag:"לאיזו מדינה שייך הדגל?",allAns:"כל התשובות",auto:"אוטו",share:"שתפו:",or:"או QR:",copied:"!הועתק",copy:"העתק",waitHost:"...ממתינים למארח",youAnswered:"!נשלח",general_knowledge:"ידע כללי",history:"היסטוריה",geography:"גיאוגרפיה",flags:"דגלים",movies:"סרטים",cartoons:"קריקטורות",famous:"מפורסמים",sport:"ספורט",football:"כדורגל",fashion:"אופנה",strange_questions:"שאלות מוזרות",science:"מדע",timerLabel:"שנ׳ נותרו",back:"חזרה",howToPlay:"איך משחקים",howTitle:"איך משחקים בבלאפי",howBody:"1. צרו חדר ושתפו את הקוד עם חברים\n2. כל סיבוב, שחקן בוחר קטגוריה\n3. כולם מקלידים תשובה\n4. אם נכון — כתבו תשובה שגויה משכנעת!\n5. כל התשובות מעורבבות כרב-ברירה\n6. כולם בוחרים את הנכונה\n\nניקוד:\n+2 על בחירה נכונה\n+1 לכל שחקן שהבלאף שלכם רימה\n0 אם בחרתם בבלאף שלכם!\n\nהכי הרבה נקודות מנצח!",close:"סגור"}};


// ═══════════════════════════════════════════════════════════
// IR MATCHING ENGINE + SMART DISTRACTOR SYSTEM
// ═══════════════════════════════════════════════════════════

// --- Normalization ---
function norm(s){
  if(!s)return"";
  return s.toLowerCase().trim()
    .replace(/[\u0591-\u05C7]/g,"") // remove Hebrew niqqud
    .replace(/[^\w\s\u0590-\u05FF]/g,"") // keep letters, digits, spaces, Hebrew
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"") // remove diacritics
    .replace(/\s+/g," ").trim();
}

// Hebrew final-form normalization (ך→כ, ם→מ, ן→נ, ף→פ, ץ→צ)
function normHe(s){
  return s.replace(/ך/g,"כ").replace(/ם/g,"מ").replace(/ן/g,"נ").replace(/ף/g,"פ").replace(/ץ/g,"צ");
}

function deepNorm(s){return normHe(norm(s));}

// --- Levenshtein ---
function lev(a,b){
  const m=a.length,n=b.length;
  if(m===0)return n; if(n===0)return m;
  const d=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)d[i][0]=i;
  for(let j=0;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));
  return d[m][n];
}

// Normalized edit distance [0,1] where 0=identical
function normLev(a,b){
  if(!a&&!b)return 0;
  const maxLen=Math.max(a.length,b.length);
  return maxLen===0?0:lev(a,b)/maxLen;
}

// --- Token utilities ---
function tokenize(s){return deepNorm(s).split(" ").filter(t=>t.length>0);}

function jaccard(a,b){
  const sa=new Set(tokenize(a)),sb=new Set(tokenize(b));
  if(sa.size===0&&sb.size===0)return 1;
  let inter=0;
  for(const t of sa)if(sb.has(t))inter++;
  return inter/(sa.size+sb.size-inter);
}

// Fuzzy token match: does token a match any token in set b within lev threshold?
function fuzzyTokenMatch(tok,tokens,threshold){
  return tokens.some(t=>lev(tok,t)<=threshold);
}

// --- TRANSLITERATION MAP (Hebrew ↔ common English forms) ---
const TRANSLIT={
  "מסי":"messi","רונאלדו":"ronaldo","איינשטיין":"einstein","ניוטון":"newton",
  "שייקספיר":"shakespeare","דה וינצי":"da vinci","לאונרדו":"leonardo",
  "מוצרט":"mozart","בטהובן":"beethoven","פיקאסו":"picasso",
  "ואן גוך":"van gogh","דרווין":"darwin","גלילאו":"galileo",
  "טסלה":"tesla","אדיסון":"edison","פלמינג":"fleming",
  "קירי":"curie","ארמסטרונג":"armstrong","ניל":"neil",
  "קלאופטרה":"cleopatra","נפוליאון":"napoleon","צרצ'יל":"churchill",
  "היטלר":"hitler","סטלין":"stalin","לנין":"lenin",
  "גנדי":"gandhi","מנדלה":"mandela",
};

function transliterate(s){
  const n=deepNorm(s);
  // Check if Hebrew input matches a known transliteration
  for(const[he,en] of Object.entries(TRANSLIT)){
    if(n.includes(he))return en;
  }
  // Check reverse
  for(const[he,en] of Object.entries(TRANSLIT)){
    if(n.includes(en))return he;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// isCorrect — MAIN MATCHING FUNCTION
// Score ∈ [0,1], threshold 0.85
// ═══════════════════════════════════════════════════════════
function matchScore(input,correct){
  const a=deepNorm(input),b=deepNorm(correct);
  if(!a||!b)return 0;
  if(a===b)return 1.0;

  // --- NUMERIC: must be exact ---
  if(/^\d+\.?\d*$/.test(b))return a===b?1.0:0.0;

  // --- SHORT (1-3 chars, like Au, H2O): exact or nothing ---
  if(b.length<=3)return a===b?1.0:0.0;

  // --- Compute components ---
  const jac=jaccard(input,correct);
  const nLev=1-normLev(a,b);

  // --- Named entity bonus ---
  const aToks=tokenize(input),bToks=tokenize(correct);
  let nameBonus=0;

  if(bToks.length>=2){
    // Last name match (strongest signal for person names)
    const bLast=bToks[bToks.length-1];
    if(aToks.length===1&&lev(aToks[0],bLast)<=1)nameBonus=0.5;
    // First name match
    const bFirst=bToks[0];
    if(aToks.length===1&&lev(aToks[0],bFirst)<=1)nameBonus=Math.max(nameBonus,0.4);
    // Full name with typos: check each token
    if(aToks.length>=2){
      let matched=0;
      for(const at of aToks){
        if(bToks.some(bt=>lev(at,bt)<=1))matched++;
      }
      if(matched>=bToks.length)nameBonus=0.5;
      else if(matched>0)nameBonus=0.2*(matched/bToks.length);
    }
  }

  // --- Transliteration bonus ---
  let translitBonus=0;
  const translitA=transliterate(input);
  const translitB=transliterate(correct);
  if(translitA&&deepNorm(translitA)===b)translitBonus=0.6;
  if(translitB&&deepNorm(translitB)===a)translitBonus=0.6;
  // Also check if transliterated form is close
  if(translitA&&(1-normLev(deepNorm(translitA),b))>0.8)translitBonus=Math.max(translitBonus,0.4);

  // --- Combine ---
  // Weighted: edit distance matters most, then Jaccard, then bonuses
  const score=Math.min(1.0, nLev*0.4 + jac*0.3 + nameBonus*0.2 + translitBonus*0.1
    + (a===b?1:0)*0.0); // exact already returns 1.0 above

  return score;
}

function isCorrect(input,correct){
  return matchScore(input,correct)>=0.75;
}

// Check both languages
function isCorrectBilingual(input,ansEn,ansHe){
  return isCorrect(input,ansEn)||isCorrect(input,ansHe);
}

// --- Grouping: are two wrong answers effectively the same? ---
function isSameText(a,b){
  const na=deepNorm(a),nb=deepNorm(b);
  if(na===nb)return true;
  if(na.length>3&&nb.length>3&&normLev(na,nb)<0.2)return true;
  return false;
}

// Title Case for English, passthrough for Hebrew
function titleCase(s,ln){
  if(!s)return s;
  if(ln==="he"||/[\u0590-\u05FF]/.test(s))return s;
  return s.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase());
}

// Strict match for bluff rejection (only exact normalized match)
function strictMatch(i,c){return deepNorm(i)===deepNorm(c);}

// ═══════════════════════════════════════════════════════════
// SMART DISTRACTOR GENERATION
// ═══════════════════════════════════════════════════════════

function detectAnswerType(q){
  const a=q.answer_en||"";
  if(q.flag_country||q.flag_code||q.category==="flags")return"country";
  if(/^\d{3,4}$/.test(a))return"year";
  if(/^\d+\.?\d*$/.test(a))return"number";
  if(q.category==="famous")return"person";
  // Multi-word starting with uppercase → likely person
  const words=a.split(" ");
  if(words.length>=2&&/^[A-Z]/.test(a)){
    const nonPlace=!["Ocean","Sea","Empire","City","America","Zealand","Trafford","Madrid","whale","dioxide","Republic"].some(w=>a.includes(w));
    if(nonPlace)return"person";
  }
  if(["geography"].includes(q.category)&&!/^\d/.test(a))return"country";
  if(q.category==="football")return"football";
  if(q.category==="movies"||q.category==="cartoons")return"entertainment";
  if(q.category==="fashion")return"fashion";
  if(q.category==="science")return"science_term";
  return"general";
}

// Near-miss generators by type
function genSmartDistractors(q,existingTexts,ln,count){
  const results=[];
  const used=new Set(existingTexts.map(deepNorm));
  const aType=detectAnswerType(q);
  const aEn=q.answer_en||"";
  const aHe=q.answer_he||"";
  const ca=ln==="he"?aHe:aEn;

  function addIfNew(text){
    const t=titleCase(text,ln);
    const n=deepNorm(t);
    if(n&&!used.has(n)&&!isCorrect(t,aEn)&&!isCorrect(t,aHe)){
      used.add(n);results.push(t);return true;
    }
    return false;
  }

  // Strategy 1: Near-miss based on type
  if(aType==="year"){
    const yr=parseInt(aEn);
    if(!isNaN(yr)){
      // Off-by-1, off-by-2, common confusions
      const offsets=[-3,-2,-1,1,2,3,-5,5,-10,10,-20,20];
      const shuffled=offsets.sort(()=>Math.random()-0.5);
      for(const off of shuffled){
        if(results.length>=count)break;
        const candidate=String(yr+off);
        addIfNew(candidate);
      }
    }
  }

  if(aType==="number"){
    const num=parseFloat(aEn);
    if(!isNaN(num)){
      const nearby=[num-1,num+1,num-2,num+2,num*2,Math.round(num/2),num+10,num-10,num+5,num-5].filter(n=>n>0);
      for(const n of nearby.sort(()=>Math.random()-0.5)){
        if(results.length>=count)break;
        addIfNew(String(n%1===0?n:n.toFixed(1)));
      }
    }
  }

  // Strategy 2: Category-specific banks
  const BANKS={
    person:{
      en:["Alexander Hamilton","Marco Polo","Nikola Tesla","Thomas Edison","Charles Darwin","Galileo Galilei","Wolfgang Mozart","Pablo Picasso","Vincent Van Gogh","Isaac Newton","Benjamin Franklin","Napoleon Bonaparte","Aristotle","Plato","Sigmund Freud","Henry Ford","James Watt","Louis Pasteur","Copernicus","Archimedes","Jules Verne","Mark Twain","Oscar Wilde","Frida Kahlo","Leonardo DiCaprio","Albert Schweitzer","Marie Antoinette","Cleopatra","Alexander The Great","Genghis Khan","Socrates","Confucius","Sun Tzu","Machiavelli","Che Guevara"],
      he:["אלכסנדר המילטון","מרקו פולו","ניקולה טסלה","תומאס אדיסון","צ'רלס דרווין","גלילאו גלילאי","וולפגנג מוצרט","פבלו פיקאסו","וינסנט ואן גוך","אייזק ניוטון","בנג'מין פרנקלין","נפוליאון בונפרטה","אריסטו","אפלטון","זיגמונד פרויד","הנרי פורד","לואי פסטר","קופרניקוס","ארכימדס","ז'ול ורן","מארק טוויין","פרידה קאלו","לאונרדו דיקפריו","מארי אנטואנט","קלאופטרה","אלכסנדר הגדול","ג'ינגיס חאן","סוקרטס","קונפוציוס","סון צו","מקיאוולי","צ'ה גוורה"]
    },
    country:{
      en:["Sweden","Norway","Denmark","Poland","Hungary","Austria","Belgium","Netherlands","Portugal","Ireland","Iceland","Greece","Switzerland","Finland","Estonia","Latvia","Lithuania","Croatia","Serbia","Bulgaria","Morocco","Algeria","Tunisia","Chile","Peru","Bolivia","Ecuador","Venezuela","Cuba","Panama","Philippines","Vietnam","Malaysia","Thailand","Cambodia","Sri Lanka","Nepal","Bangladesh","Pakistan","Kazakhstan","Qatar","Kuwait","Oman","Jordan","Lebanon","Georgia","Armenia","Azerbaijan","Mongolia","Paraguay","Uruguay"],
      he:["שוודיה","נורבגיה","דנמרק","פולין","הונגריה","אוסטריה","בלגיה","הולנד","פורטוגל","אירלנד","איסלנד","יוון","שוויץ","פינלנד","אסטוניה","לטביה","ליטא","קרואטיה","סרביה","בולגריה","מרוקו","אלג'יריה","תוניסיה","צ'ילה","פרו","בוליביה","אקוודור","ונצואלה","קובה","פנמה","הפיליפינים","וייטנאם","מלזיה","תאילנד","קמבודיה","סרי לנקה","נפאל","בנגלדש","פקיסטן","קזחסטן","קטאר","כווית","עומאן","ירדן","לבנון","גאורגיה","ארמניה","אזרבייג'ן","מונגוליה","פרגוואי","אורוגוואי"]
    },
    football:{
      en:["Barcelona","Liverpool","Bayern Munich","Juventus","AC Milan","Ajax","Porto","Benfica","Chelsea","Arsenal","PSG","Borussia Dortmund","Inter Milan","Atletico Madrid","Manchester City","Tottenham","Napoli","Roma","Lazio","Sevilla","Valencia","Lyon","Marseille","Celtic","Rangers"],
      he:["ברצלונה","ליברפול","באיירן מינכן","יובנטוס","מילאן","אייאקס","פורטו","בנפיקה","צ'לסי","ארסנל","פ.ס.ז'","דורטמונד","אינטר מילאן","אטלטיקו מדריד","מנצ'סטר סיטי","טוטנהאם","נאפולי","רומא","לאציו","סביליה","ולנסיה","ליון","מרסיי","סלטיק"]
    },
    entertainment:{
      en:["Tom Hanks","Brad Pitt","Meryl Streep","Leonardo DiCaprio","Scarlett Johansson","Morgan Freeman","Robert De Niro","Al Pacino","Johnny Depp","Denzel Washington","Hogwarts","Gotham","Metropolis","Wakanda","Narnia","Mordor","Pandora","Neverland","Asgard"],
      he:["טום הנקס","בראד פיט","מריל סטריפ","לאונרדו דיקפריו","סקרלט ג'והנסון","מורגן פרימן","רוברט דה נירו","אל פצ'ינו","ג'וני דפ","דנזל וושינגטון","הוגוורטס","גותהם","מטרופוליס","וואקנדה","נרניה","מורדור","פנדורה","אסגארד"]
    },
    fashion:{
      en:["Gucci","Prada","Versace","Armani","Dior","Louis Vuitton","Burberry","Balenciaga","Hermes","Fendi","Valentino","Givenchy","YSL","Zara","Dolce & Gabbana","Calvin Klein","Ralph Lauren","Tommy Hilfiger","Hugo Boss","Lacoste"],
      he:["גוצ'י","פראדה","ורסאצ'ה","ארמני","דיור","לואי ויטון","ברברי","בלנסיאגה","הרמס","פנדי","ולנטינו","ז'יבנשי","זארה","דולצ'ה וגבאנה","קלווין קליין","ראלף לורן","טומי הילפיגר","הוגו בוס","לקוסט"]
    },
    science_term:{
      en:["Hydrogen","Helium","Carbon","Iron","Oxygen","Sodium","Calcium","Mercury","Uranium","Lithium","Platinum","Copper","Zinc","Lead","Neon","Argon","Tungsten","Nitrogen","Phosphorus","Sulfur","Chlorine","Potassium","Magnesium","Silicon"],
      he:["מימן","הליום","פחמן","ברזל","חמצן","נתרן","סידן","כספית","אורניום","ליתיום","פלטינה","נחושת","אבץ","עופרת","ניאון","ארגון","טונגסטן","חנקן","זרחן","גופרית","כלור","אשלגן","מגנזיום","סיליקון"]
    },
    general:{
      en:["Mercury","Venus","Jupiter","Saturn","Mars","Neptune","Uranus","Pluto","Diamond","Gold","Silver","Bronze","Iron","Copper","Cotton","Silk","Wool","Leather","Gravity","Magnetism","Friction","Inertia","Momentum","Velocity"],
      he:["כוכב חמה","נוגה","צדק","שבתאי","מאדים","נפטון","אורנוס","פלוטו","יהלום","זהב","כסף","ארד","ברזל","נחושת","כותנה","משי","צמר","עור","כוח הכבידה","מגנטיות","חיכוך","אינרציה","מומנטום"]
    }
  };

  // Pick from appropriate bank, shuffled
  const bankKey=BANKS[aType]?aType:"general";
  const pool=ln==="he"?BANKS[bankKey].he:BANKS[bankKey].en;
  const shuffled=[...pool].sort(()=>Math.random()-0.5);

  for(const candidate of shuffled){
    if(results.length>=count)break;
    addIfNew(candidate);
  }

  // Fallback: try general bank if still short
  if(results.length<count&&bankKey!=="general"){
    const fallback=ln==="he"?BANKS.general.he:BANKS.general.en;
    for(const candidate of fallback.sort(()=>Math.random()-0.5)){
      if(results.length>=count)break;
      addIfNew(candidate);
    }
  }

  return results;
}

// Main entry: generate N distractors
function genDecoy(q,existingTexts,ln){
  const results=genSmartDistractors(q,existingTexts,ln,1);
  return results.length>0?results[0]:(ln==="he"?"לא יודע":"Unknown");
}

function genMultipleDecoys(q,existingTexts,ln,count){
  return genSmartDistractors(q,existingTexts,ln,count);
}


function genCode(){let r="";for(let i=0;i<6;i++)r+=Math.floor(Math.random()*10);if(r[0]==="0")r="1"+r.slice(1);return r;}
function genUid(){return"u"+Math.random().toString(36).slice(2,10)+Date.now().toString(36);}

export default function Bluffy(){
  const[uid]=useState(()=>genUid());
  const[lang,setLang]=useState("en");
  const[page,setPage]=useState("home"); // home, join only — everything else driven by rd.state
  const[room,setRoom]=useState(null);
  const[rd,setRd]=useState(null);
  const[myName,setMyName]=useState("");
  const[joinCode,setJoinCode]=useState("");
  const[ci,setCi]=useState("");
  const[bi,setBi]=useState("");
  const[err,setErr]=useState("");
  const[copied,setCopied]=useState(false);
  const[showHelp,setShowHelp]=useState(false);
  const[timer,setTimer]=useState(0);
  const timerRef=useRef(null);

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
    await set(rr,{host:uid,lang,state:"lobby",round:0,turnIdx:0,settings:{time:30,rounds:10,cats:CATS},players:{[uid]:{name:myName.trim(),score:0,order:0}}});
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
    await update(ref(db,`rooms/${code}/players/${uid}`),{name:myName.trim(),score:0,order:d.players?Object.keys(d.players).length:0});
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

  const hostAutoProgress=()=>{
    if(!isHost||!room)return;
    const ln=rd.lang||lang;const u={};
    playerList.forEach(([id])=>{
      if(!rd?.answers?.[id])u[`answers/${id}`]={text:"—",ok:false};
      if(!rd?.publicAnswers?.[id]){
        const a=rd?.answers?.[id];
        if(a?.ok){const q=rd.question;u[`publicAnswers/${id}`]=genDecoy(q,[...Object.values(rd.publicAnswers||{}),q.answer_en,q.answer_he],ln);}
        else u[`publicAnswers/${id}`]="—";
      }
    });
    if(Object.keys(u).length)update(ref(db,`rooms/${room}`),u);
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
    
    update(ref(db,`rooms/${room}`),{state:"reveal",options:os,correctAnswer:ca,selections:null});
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
    update(ref(db,`rooms/${room}`),{state:"catSel",round:(rd?.round||1)+1,turnIdx:((rd?.turnIdx||0)+1)%playerCount,question:null,answers:null,publicAnswers:null,selections:null,options:null,results:null,correctAnswer:null});
  };

  const playAgain=()=>{if(!isHost)return;const u={};playerList.forEach(([id])=>{u[`players/${id}/score`]=0;});u.state="lobby";u.round=0;update(ref(db,`rooms/${room}`),u);};

  // ═══ COMPONENTS ═══
  const FI=({c,code})=>{const u=code?`https://flagcdn.com/w160/${code}.png`:flagUrl(c);return u?<img src={u} alt="" style={{width:160,height:100,objectFit:"cover",borderRadius:8,border:"2px solid rgba(255,255,255,.2)",margin:"12px auto",display:"block"}}/>:null;};
  const QT=()=>{const q=rd?.question;if(!q)return"";if(q.flag_country||q.flag_code)return he?t.flag:t.flag;return he?q.question_he:q.question_en;};
  const RB=()=><div style={{textAlign:"center",mb:16,marginBottom:16}}><span style={{background:"rgba(255,215,0,.1)",color:"#FFD700",padding:"6px 20px",borderRadius:20,fontSize:13,fontWeight:700,border:"1px solid rgba(255,215,0,.2)"}}>{t.round} {rd?.round||1} {t.of} {rd?.settings?.rounds||10}</span></div>;
  const LeaveBtn=()=><button onClick={leaveRoom} style={{...B,width:"100%",background:"rgba(255,59,48,.15)",color:"#FF6B6B",padding:"12px",borderRadius:12,marginTop:16,fontSize:14,fontWeight:600}}>{t.leave} 🚪</button>;
  const TopBar=()=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <span style={{color:"#FFD700",fontWeight:700}}>{room&&`🃏 ${room}`}</span>
    <button onClick={leaveRoom} style={{...B,background:"rgba(255,59,48,.15)",color:"#FF6B6B",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600}}>{t.leave}</button>
  </div>;

  const bg="linear-gradient(180deg,#0f0c29,#1a1a3e)";

  // ════════ HOME ════════
  if(!room&&page==="home")return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",padding:20}}>
    <style>{`@keyframes f{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button{font-family:inherit;border:none;cursor:pointer;transition:all .2s}button:hover{filter:brightness(1.1)}input{font-family:inherit}input:focus{outline:none;border-color:rgba(192,132,252,.5)!important}`}</style>
    <div style={{fontSize:100,marginBottom:8,filter:"drop-shadow(0 0 30px rgba(255,215,0,.3))",animation:"f 3s ease-in-out infinite"}}>🃏</div>
    <h1 style={{fontSize:56,fontWeight:900,margin:0,background:"linear-gradient(135deg,#FFD700,#FF6B6B,#C084FC)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.appName}</h1>
    <p style={{color:"rgba(255,255,255,.6)",fontSize:18,marginTop:4,marginBottom:32,fontStyle:"italic"}}>{t.tagline}</p>
    <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder={t.enterName} maxLength={12} style={{...I,width:260,textAlign:"center",fontSize:18,marginBottom:16}}/>
    <button onClick={createRoom} style={{...B,background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:18,fontWeight:800,padding:"16px 0",borderRadius:14,width:260,marginBottom:12,boxShadow:"0 8px 32px rgba(255,215,0,.3)",opacity:myName.trim()?1:.4}}>{t.createGame}</button>
    <button onClick={()=>setPage("join")} style={{...B,background:"rgba(255,255,255,.1)",color:"#C084FC",fontSize:16,fontWeight:700,padding:"14px 0",borderRadius:14,width:260}}>{t.joinGame}</button>
    <button onClick={()=>setShowHelp(true)} style={{...B,background:"transparent",color:"rgba(255,255,255,.5)",fontSize:14,fontWeight:600,padding:"12px 0",width:260,marginTop:8}}>❓ {t.howToPlay}</button>
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
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>{EMO[i]||"🎮"}</span><span style={{color:"#fff",fontWeight:600}}>{p.name}{id===uid?" (You)":""}</span>
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
    <TopBar/><RB/><div style={{textAlign:"center"}}><span style={{fontSize:40}}>👆</span>
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
      {(q?.flag_country||q?.flag_code)&&<FI c={q.flag_country} code={q.flag_code}/>}
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
  if(state==="reveal"&&rd?.options)return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    <div style={{...C,marginBottom:16,textAlign:"center",borderColor:"rgba(255,215,0,.2)"}}>
      {(rd.question?.flag_country||rd.question?.flag_code)&&<FI c={rd.question.flag_country} code={rd.question.flag_code}/>}
      <p style={{color:"#fff",fontSize:18,fontWeight:700,margin:0}}>{QT()}</p>
    </div>
    {!selected?(<div>
      <p style={{textAlign:"center",color:"#C084FC",fontSize:14,fontWeight:600,marginBottom:12}}>{t.choose}</p>
      {rd.options.map((o,i)=><button key={i} onClick={()=>selectOption(i)} style={{display:"block",width:"100%",padding:"16px 20px",marginBottom:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,textAlign:he?"right":"left",...B}}>
        <span style={{color:"#fff",fontSize:17,fontWeight:600}}>{o.text}</span>
      </button>)}
    </div>):(<div style={{...C,textAlign:"center"}}>
      <div style={{fontSize:48}}>⏳</div><p style={{color:"rgba(255,255,255,.5)",marginTop:8}}>{t.waiting}</p>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:12}}>
        {playerList.map(([id,p],i)=>{const d=rd?.selections?.[id]!==undefined;return<div key={id} style={{width:36,height:36,borderRadius:10,background:d?"rgba(74,222,128,.2)":"rgba(255,255,255,.05)",border:d?"1px solid rgba(74,222,128,.4)":"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:d?"#4ade80":"rgba(255,255,255,.4)"}}>{d?"✓":p.name[0]}</div>;})}
      </div>
    </div>)}
  </div></div>);

  // ════════ POST ROUND ════════
  if(state==="post"&&rd?.results){const sorted=[...playerList].sort((a,b)=>(b[1].score||0)-(a[1].score||0));return(<div style={{minHeight:"100vh",background:bg,padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <TopBar/><RB/>
    <div style={{...C,marginBottom:16,textAlign:"center",borderColor:"rgba(74,222,128,.3)",background:"rgba(74,222,128,.05)"}}>
      <span style={{fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2}}>{t.correct}</span>
      {(rd.question?.flag_country||rd.question?.flag_code)&&<FI c={rd.question.flag_country} code={rd.question.flag_code}/>}
      <p style={{color:"#4ade80",fontSize:24,fontWeight:800,margin:"8px 0"}}>{rd.correctAnswer}</p>
    </div>
    {playerList.map(([id,p],i)=>{const r=rd.results[id]||{};const oi=rd.selections?.[id];const pk=rd.options?.[oi];
      const pkIsSys=Array.isArray(pk?.ai)&&(pk.ai.length===0||(pk.ai.length===1&&pk.ai[0]==="sys"));
      const pkNames=Array.isArray(pk?.an)?pk.an.join(", "):"";
      return<div key={id} style={{...C,marginBottom:8,padding:"12px 16px",borderColor:r.e>0?"rgba(255,215,0,.2)":"rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
          <span style={{fontSize:22}}>{EMO[i]||"🎮"}</span>
          <div style={{minWidth:0}}>
            <p style={{color:"#fff",fontWeight:700,margin:0,fontSize:14}}>{p.name}</p>
            <p style={{color:pk?.ok?"#4ade80":"#f87171",fontSize:12,margin:"2px 0 0"}}>{pk?.ok?"✓ ":"✗ "}{pk?.text||"—"}{r.sf?<span style={{color:"#FFA500",marginInlineStart:6}}>({t.selfFool})</span>:""}</p>
            {!pk?.ok&&!pkIsSys&&pkNames&&<p style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{t.wroteBy} {pkNames}</p>}
            {r.fb?.length>0&&<p style={{color:"#C084FC",fontSize:11}}>{t.fooled} {r.fb.length}: {r.fb.join(", ")}</p>}
          </div>
        </div>
        <span style={{color:r.e>0?"#FFD700":"rgba(255,255,255,.3)",fontSize:22,fontWeight:900,minWidth:45,textAlign:"center"}}>+{r.e||0}</span>
      </div>
      {isHost&&id!==uid&&<button onClick={()=>kickPlayer(id)} style={{...B,background:"rgba(255,59,48,.1)",color:"#FF6B6B",padding:"3px 10px",borderRadius:6,fontSize:10,marginTop:6}}>{t.kick}</button>}
    </div>;})}
    <div style={{...C,margin:"12px 0 16px"}}>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:12,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{t.allAns}</p>
      {(rd.options||[]).map((o,i)=>{
        const isSys=Array.isArray(o.ai)&&(o.ai.length===0||(o.ai.length===1&&o.ai[0]==="sys"));
        const names=Array.isArray(o.an)?o.an.join(", "):"";
        return<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<rd.options.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <span style={{color:o.ok?"#4ade80":"#fff",fontWeight:o.ok?700:400,fontSize:13}}>{o.ok?"✓ ":""}{o.text}</span>
        <span style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{o.ok?t.correct:isSys?t.auto:names}</span>
      </div>;})}
    </div>
    <div style={{...C,marginBottom:20}}>
      <h3 style={{color:"#FFD700",margin:"0 0 10px",fontSize:15,textAlign:"center"}}>{t.scoreboard}</h3>
      {sorted.map(([id,p],i)=><div key={id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",background:i===0?"rgba(255,215,0,.08)":"transparent",borderRadius:10,marginBottom:3}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",fontWeight:800,fontSize:17}}>#{i+1}</span>
          <span style={{color:"#fff",fontWeight:600,fontSize:14}}>{p.name}</span>
        </div>
        <span style={{color:"#FFD700",fontWeight:800,fontSize:18}}>{p.score||0}</span>
      </div>)}
    </div>
    {isHost?<button onClick={nextRound} style={{...B,width:"100%",background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:18,fontWeight:800,padding:"16px 0",borderRadius:14}}>{(rd?.round||1)>=(rd?.settings?.rounds||10)?t.over:t.next}</button>
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
