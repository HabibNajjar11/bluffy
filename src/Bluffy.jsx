import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, set, get, onValue, off, update, remove } from "firebase/database";
import QRCode from "react-qr-code";

// ═══ FLAGS ═══
const FC={"Japan":"jp","France":"fr","South Korea":"kr","Mexico":"mx","Thailand":"th","Colombia":"co","Romania":"ro","Ivory Coast":"ci","Brazil":"br","Germany":"de","Italy":"it","Canada":"ca","Australia":"au","India":"in","China":"cn","Russia":"ru","United States":"us","United Kingdom":"gb","Spain":"es","Turkey":"tr","Egypt":"eg","Argentina":"ar","Sweden":"se","Norway":"no","Denmark":"dk","Poland":"pl","Hungary":"hu","Austria":"at","Belgium":"be","Netherlands":"nl","Portugal":"pt","Ireland":"ie","Iceland":"is","Greece":"gr","Switzerland":"ch","Finland":"fi","Czech Republic":"cz","Croatia":"hr","Ukraine":"ua","Israel":"il","Saudi Arabia":"sa","Nigeria":"ng","South Africa":"za","Kenya":"ke","Morocco":"ma","Nepal":"np","Mongolia":"mn","Chad":"td","Cuba":"cu","Peru":"pe","Chile":"cl","Jamaica":"jm","Ghana":"gh","Tanzania":"tz","New Zealand":"nz","Singapore":"sg","Malaysia":"my","Indonesia":"id","Philippines":"ph","Vietnam":"vn","Pakistan":"pk","Bangladesh":"bd","Iran":"ir","Jordan":"jo","Qatar":"qa","Kuwait":"kw","Bahrain":"bh","Oman":"om","Lebanon":"lb","Estonia":"ee","Latvia":"lv","Lithuania":"lt","Slovenia":"si","Slovakia":"sk","Albania":"al","Georgia":"ge","Kazakhstan":"kz","Costa Rica":"cr","Panama":"pa","Paraguay":"py","Uruguay":"uy","Bolivia":"bo","Ecuador":"ec","Venezuela":"ve","Haiti":"ht","Dominican Republic":"do","Trinidad and Tobago":"tt"};
const flagUrl=(c)=>{const x=FC[c];return x?`https://flagcdn.com/w160/${x}.png`:null;};

// ═══ QUESTIONS ═══
const QS=[
{id:"gk1",category:"general_knowledge",difficulty:"Easy",question_en:"The number of continents is ___",question_he:"מספר היבשות הוא ___",answer_en:"7",answer_he:"7"},
{id:"gk2",category:"general_knowledge",difficulty:"Easy",question_en:"The chemical symbol for water is ___",question_he:"הסימן הכימי של מים הוא ___",answer_en:"H2O",answer_he:"H2O"},
{id:"gk3",category:"general_knowledge",difficulty:"Medium",question_en:"A standard piano has ___ keys",question_he:"בפסנתר רגיל יש ___ קלידים",answer_en:"88",answer_he:"88"},
{id:"gk4",category:"general_knowledge",difficulty:"Hard",question_en:"The smallest country by area is ___",question_he:"המדינה הקטנה ביותר לפי שטח היא ___",answer_en:"Vatican City",answer_he:"הוותיקן"},
{id:"gk5",category:"general_knowledge",difficulty:"Very Hard",question_en:"The first email was sent in ___",question_he:"האימייל הראשון נשלח בשנת ___",answer_en:"1971",answer_he:"1971"},
{id:"gk6",category:"general_knowledge",difficulty:"Impossible",question_en:"The most common blood type is ___",question_he:"סוג הדם הנפוץ ביותר הוא ___",answer_en:"O positive",answer_he:"O חיובי"},
{id:"gk7",category:"general_knowledge",difficulty:"Medium",question_en:"Plants absorb ___ from the atmosphere",question_he:"צמחים סופגים ___ מהאטמוספירה",answer_en:"Carbon dioxide",answer_he:"פחמן דו חמצני"},
{id:"gk8",category:"general_knowledge",difficulty:"Hard",question_en:"The hardest natural substance is ___",question_he:"החומר הטבעי הקשה ביותר הוא ___",answer_en:"Diamond",answer_he:"יהלום"},
{id:"gk9",category:"general_knowledge",difficulty:"Easy",question_en:"Water boils at ___ degrees Celsius",question_he:"מים רותחים ב-___ מעלות צלזיוס",answer_en:"100",answer_he:"100"},
{id:"gk10",category:"general_knowledge",difficulty:"Easy",question_en:"The largest animal on Earth is the ___",question_he:"החיה הגדולה ביותר היא ___",answer_en:"Blue whale",answer_he:"לוויתן כחול"},
{id:"gk11",category:"general_knowledge",difficulty:"Medium",question_en:"An adult human has ___ teeth",question_he:"לאדם בוגר יש ___ שיניים",answer_en:"32",answer_he:"32"},
{id:"gk12",category:"general_knowledge",difficulty:"Hard",question_en:"Russia spans ___ time zones",question_he:"רוסיה משתרעת על ___ אזורי זמן",answer_en:"11",answer_he:"11"},
{id:"his1",category:"history",difficulty:"Easy",question_en:"World War II ended in ___",question_he:"מלחמת העולם השנייה הסתיימה בשנת ___",answer_en:"1945",answer_he:"1945"},
{id:"his2",category:"history",difficulty:"Medium",question_en:"The first moonwalker was ___ (full name)",question_he:"האדם הראשון על הירח היה ___ (שם מלא)",answer_en:"Neil Armstrong",answer_he:"ניל ארמסטרונג"},
{id:"his3",category:"history",difficulty:"Hard",question_en:"The ancient wonder in Alexandria was the ___",question_he:"פלא העולם העתיק באלכסנדריה היה ___",answer_en:"Lighthouse of Alexandria",answer_he:"המגדלור של אלכסנדריה"},
{id:"his4",category:"history",difficulty:"Very Hard",question_en:"The Magna Carta was signed in ___",question_he:"המגנא כרטא נחתמה בשנת ___",answer_en:"1215",answer_he:"1215"},
{id:"his5",category:"history",difficulty:"Impossible",question_en:"The last pharaoh was ___ (first name)",question_he:"הפרעון/ית האחרון/ה היה/תה ___",answer_en:"Cleopatra",answer_he:"קלאופטרה"},
{id:"his6",category:"history",difficulty:"Easy",question_en:"The Great Wall was built by ___",question_he:"החומה הגדולה נבנתה ע\"י ___",answer_en:"China",answer_he:"סין"},
{id:"his7",category:"history",difficulty:"Medium",question_en:"The ship that sank in 1912 was the ___",question_he:"האונייה שטבעה ב-1912 הייתה ___",answer_en:"Titanic",answer_he:"טיטאניק"},
{id:"his8",category:"history",difficulty:"Hard",question_en:"Genghis Khan ruled the ___",question_he:"ג'ינגיס חאן שלט ב___",answer_en:"Mongol Empire",answer_he:"האימפריה המונגולית"},
{id:"geo1",category:"geography",difficulty:"Easy",question_en:"The largest ocean is the ___",question_he:"האוקיינוס הגדול ביותר הוא ___",answer_en:"Pacific Ocean",answer_he:"האוקיינוס השקט"},
{id:"geo2",category:"geography",difficulty:"Medium",question_en:"The longest river is the ___",question_he:"הנהר הארוך ביותר הוא ___",answer_en:"Nile",answer_he:"הנילוס"},
{id:"geo3",category:"geography",difficulty:"Hard",question_en:"The capital of Mongolia is ___",question_he:"בירת מונגוליה היא ___",answer_en:"Ulaanbaatar",answer_he:"אולן בטור"},
{id:"geo4",category:"geography",difficulty:"Very Hard",question_en:"The country with most lakes is ___",question_he:"המדינה עם הכי הרבה אגמים היא ___",answer_en:"Canada",answer_he:"קנדה"},
{id:"geo5",category:"geography",difficulty:"Impossible",question_en:"The driest inhabited continent is ___",question_he:"היבשת המיושבת היבשה ביותר היא ___",answer_en:"Australia",answer_he:"אוסטרליה"},
{id:"geo6",category:"geography",difficulty:"Easy",question_en:"Brazil is on the continent of ___",question_he:"ברזיל ביבשת ___",answer_en:"South America",answer_he:"דרום אמריקה"},
{id:"geo7",category:"geography",difficulty:"Medium",question_en:"Australia's capital is ___",question_he:"בירת אוסטרליה היא ___",answer_en:"Canberra",answer_he:"קנברה"},
{id:"geo8",category:"geography",difficulty:"Hard",question_en:"Africa's most populous country is ___",question_he:"המדינה המאוכלסת באפריקה היא ___",answer_en:"Nigeria",answer_he:"ניגריה"},
{id:"fl1",category:"flags",difficulty:"Easy",answer_en:"Japan",answer_he:"יפן",flag_country:"Japan"},
{id:"fl2",category:"flags",difficulty:"Easy",answer_en:"France",answer_he:"צרפת",flag_country:"France"},
{id:"fl3",category:"flags",difficulty:"Medium",answer_en:"South Korea",answer_he:"דרום קוריאה",flag_country:"South Korea"},
{id:"fl4",category:"flags",difficulty:"Medium",answer_en:"Mexico",answer_he:"מקסיקו",flag_country:"Mexico"},
{id:"fl5",category:"flags",difficulty:"Hard",answer_en:"Thailand",answer_he:"תאילנד",flag_country:"Thailand"},
{id:"fl6",category:"flags",difficulty:"Hard",answer_en:"Colombia",answer_he:"קולומביה",flag_country:"Colombia"},
{id:"fl7",category:"flags",difficulty:"Very Hard",answer_en:"Romania",answer_he:"רומניה",flag_country:"Romania"},
{id:"fl8",category:"flags",difficulty:"Impossible",answer_en:"Ivory Coast",answer_he:"חוף השנהב",flag_country:"Ivory Coast"},
{id:"fl9",category:"flags",difficulty:"Easy",answer_en:"Brazil",answer_he:"ברזיל",flag_country:"Brazil"},
{id:"fl10",category:"flags",difficulty:"Easy",answer_en:"Germany",answer_he:"גרמניה",flag_country:"Germany"},
{id:"fl11",category:"flags",difficulty:"Medium",answer_en:"India",answer_he:"הודו",flag_country:"India"},
{id:"fl12",category:"flags",difficulty:"Medium",answer_en:"Canada",answer_he:"קנדה",flag_country:"Canada"},
{id:"fl13",category:"flags",difficulty:"Hard",answer_en:"Argentina",answer_he:"ארגנטינה",flag_country:"Argentina"},
{id:"fl14",category:"flags",difficulty:"Very Hard",answer_en:"Hungary",answer_he:"הונגריה",flag_country:"Hungary"},
{id:"fl15",category:"flags",difficulty:"Impossible",answer_en:"Chad",answer_he:"צ'אד",flag_country:"Chad"},
{id:"mov1",category:"movies",difficulty:"Easy",question_en:"The lion in Lion King is ___",question_he:"האריה במלך האריות הוא ___",answer_en:"Simba",answer_he:"סימבה"},
{id:"mov2",category:"movies",difficulty:"Medium",question_en:"Jaws was directed by ___ (full name)",question_he:"לסתות בוים ע\"י ___ (שם מלא)",answer_en:"Steven Spielberg",answer_he:"סטיבן שפילברג"},
{id:"mov3",category:"movies",difficulty:"Hard",question_en:"First Star Wars released in ___",question_he:"מלחמת הכוכבים הראשון יצא ב___",answer_en:"1977",answer_he:"1977"},
{id:"mov4",category:"movies",difficulty:"Very Hard",question_en:"Wolverine's metal is ___",question_he:"המתכת של וולברין היא ___",answer_en:"Adamantium",answer_he:"אדמנטיום"},
{id:"mov5",category:"movies",difficulty:"Impossible",question_en:"Avatar's (2009) planet is ___",question_he:"הכוכב באווטאר הוא ___",answer_en:"Pandora",answer_he:"פנדורה"},
{id:"mov6",category:"movies",difficulty:"Easy",question_en:"Shrek is ___ (color)",question_he:"שרק הוא ___ (צבע)",answer_en:"Green",answer_he:"ירוק"},
{id:"mov7",category:"movies",difficulty:"Medium",question_en:"Nemo is a ___ (fish type)",question_he:"נמו הוא ___ (סוג דג)",answer_en:"Clownfish",answer_he:"דג ליצן"},
{id:"mov8",category:"movies",difficulty:"Hard",question_en:"Dark Knight's Joker was ___ (full name)",question_he:"הג'וקר באביר האפל גולם ע\"י ___",answer_en:"Heath Ledger",answer_he:"הית' לדג'ר"},
{id:"car1",category:"cartoons",difficulty:"Easy",question_en:"SpongeBob's best friend is ___ (first name)",question_he:"החבר של בובספוג הוא ___",answer_en:"Patrick",answer_he:"פטריק"},
{id:"car2",category:"cartoons",difficulty:"Medium",question_en:"The Simpsons live in ___",question_he:"הסימפסונים גרים ב___",answer_en:"Springfield",answer_he:"ספרינגפילד"},
{id:"car3",category:"cartoons",difficulty:"Hard",question_en:"Dexter's sister is ___",question_he:"האחות של דקסטר היא ___",answer_en:"Dee Dee",answer_he:"די די"},
{id:"car4",category:"cartoons",difficulty:"Very Hard",question_en:"Aang's bison is ___",question_he:"הביזון של אאנג הוא ___",answer_en:"Appa",answer_he:"אפה"},
{id:"car5",category:"cartoons",difficulty:"Impossible",question_en:"Coraline's cat is called ___",question_he:"החתול בקורליין נקרא ___",answer_en:"Cat",answer_he:"חתול"},
{id:"car6",category:"cartoons",difficulty:"Easy",question_en:"Mickey's Pluto is a ___",question_he:"פלוטו של מיקי הוא ___",answer_en:"Dog",answer_he:"כלב"},
{id:"car7",category:"cartoons",difficulty:"Medium",question_en:"Powerpuff Girls villain: ___",question_he:"הנבל בפאוורפאף: ___",answer_en:"Mojo Jojo",answer_he:"מוג'ו ג'וג'ו"},
{id:"car8",category:"cartoons",difficulty:"Hard",question_en:"Phineas & Ferb's platypus: ___",question_he:"הברווזן של פיניאס ופרב: ___",answer_en:"Perry",answer_he:"פרי"},
{id:"fam1",category:"famous",difficulty:"Easy",question_en:"Mona Lisa painter: ___ (full name)",question_he:"צייר המונה ליזה: ___ (שם מלא)",answer_en:"Leonardo da Vinci",answer_he:"לאונרדו דה וינצ'י"},
{id:"fam2",category:"famous",difficulty:"Medium",question_en:"Romeo & Juliet author: ___ (full name)",question_he:"מחבר רומיאו ויוליה: ___ (שם מלא)",answer_en:"William Shakespeare",answer_he:"וויליאם שייקספיר"},
{id:"fam3",category:"famous",difficulty:"Hard",question_en:"Penicillin discoverer: ___ (full name)",question_he:"מגלה הפניצילין: ___ (שם מלא)",answer_en:"Alexander Fleming",answer_he:"אלכסנדר פלמינג"},
{id:"fam4",category:"famous",difficulty:"Very Hard",question_en:"First female Nobel winner: ___ (full name)",question_he:"הזוכה הראשונה בנובל: ___ (שם מלא)",answer_en:"Marie Curie",answer_he:"מארי קירי"},
{id:"fam5",category:"famous",difficulty:"Impossible",question_en:"WWW inventor: ___ (full name)",question_he:"ממציא הרשת: ___ (שם מלא)",answer_en:"Tim Berners-Lee",answer_he:"טים ברנרס-לי"},
{id:"fam6",category:"famous",difficulty:"Easy",question_en:"King of Pop: ___ (full name)",question_he:"מלך הפופ: ___ (שם מלא)",answer_en:"Michael Jackson",answer_he:"מייקל ג'קסון"},
{id:"fam7",category:"famous",difficulty:"Medium",question_en:"Relativity by: ___ (full name)",question_he:"תורת היחסות ע\"י: ___ (שם מלא)",answer_en:"Albert Einstein",answer_he:"אלברט איינשטיין"},
{id:"fam8",category:"famous",difficulty:"Hard",question_en:"First US president: ___ (full name)",question_he:"נשיא ארה\"ב הראשון: ___ (שם מלא)",answer_en:"George Washington",answer_he:"ג'ורג' וושינגטון"},
{id:"sp1",category:"sport",difficulty:"Easy",question_en:"Basketball: ___ players per side",question_he:"כדורסל: ___ שחקנים",answer_en:"5",answer_he:"5"},
{id:"sp2",category:"sport",difficulty:"Medium",question_en:"Shuttlecock sport: ___",question_he:"כדורנוצה: ___",answer_en:"Badminton",answer_he:"בדמינטון"},
{id:"sp3",category:"sport",difficulty:"Hard",question_en:"Marathon distance: ___ km",question_he:"מרתון: ___ ק\"מ",answer_en:"42.195",answer_he:"42.195"},
{id:"sp4",category:"sport",difficulty:"Very Hard",question_en:"First modern Olympics: ___",question_he:"אולימפיאדה מודרנית ראשונה: ___",answer_en:"1896",answer_he:"1896"},
{id:"sp5",category:"sport",difficulty:"Impossible",question_en:"Only country in every World Cup: ___",question_he:"המדינה היחידה בכל מונדיאל: ___",answer_en:"Brazil",answer_he:"ברזיל"},
{id:"sp6",category:"sport",difficulty:"Easy",question_en:"Wimbledon sport: ___",question_he:"ספורט בווימבלדון: ___",answer_en:"Tennis",answer_he:"טניס"},
{id:"sp7",category:"sport",difficulty:"Medium",question_en:"Olympic rings count: ___",question_he:"טבעות אולימפיות: ___",answer_en:"5",answer_he:"5"},
{id:"fb1",category:"football",difficulty:"Easy",question_en:"Football: ___ players per side",question_he:"כדורגל: ___ שחקנים",answer_en:"11",answer_he:"11"},
{id:"fb2",category:"football",difficulty:"Medium",question_en:"1930 World Cup winner: ___",question_he:"מנצחת מונדיאל 1930: ___",answer_en:"Uruguay",answer_he:"אורוגוואי"},
{id:"fb3",category:"football",difficulty:"Hard",question_en:"Brazil's team nickname: ___",question_he:"כינוי נבחרת ברזיל: ___",answer_en:"Selecao",answer_he:"סלסאו"},
{id:"fb4",category:"football",difficulty:"Very Hard",question_en:"'Theatre of Dreams': ___",question_he:"'תיאטרון החלומות': ___",answer_en:"Old Trafford",answer_he:"אולד טראפורד"},
{id:"fb5",category:"football",difficulty:"Impossible",question_en:"Most goals in a year: ___ (full name)",question_he:"שיאן שערים בשנה: ___ (שם מלא)",answer_en:"Lionel Messi",answer_he:"ליאונל מסי"},
{id:"fb6",category:"football",difficulty:"Easy",question_en:"Send-off card color: ___",question_he:"צבע כרטיס הרחקה: ___",answer_en:"Red",answer_he:"אדום"},
{id:"fb7",category:"football",difficulty:"Medium",question_en:"Most CL titles: ___",question_he:"הכי הרבה תארי צ'מפיונס: ___",answer_en:"Real Madrid",answer_he:"ריאל מדריד"},
{id:"fas1",category:"fashion",difficulty:"Easy",question_en:"'CC' logo brand: ___",question_he:"מותג לוגו CC: ___",answer_en:"Chanel",answer_he:"שאנל"},
{id:"fas2",category:"fashion",difficulty:"Medium",question_en:"Italian fashion capital: ___",question_he:"בירת האופנה באיטליה: ___",answer_en:"Milan",answer_he:"מילאנו"},
{id:"fas3",category:"fashion",difficulty:"Hard",question_en:"Little Black Dress creator: ___ (full name)",question_he:"יוצרת השמלה השחורה: ___ (שם מלא)",answer_en:"Coco Chanel",answer_he:"קוקו שאנל"},
{id:"fas4",category:"fashion",difficulty:"Very Hard",question_en:"Denim is made from ___",question_he:"דנים מיוצר מ___",answer_en:"Cotton",answer_he:"כותנה"},
{id:"fas5",category:"fashion",difficulty:"Impossible",question_en:"Kimono origin: ___",question_he:"מקור הקימונו: ___",answer_en:"Japan",answer_he:"יפן"},
{id:"fas6",category:"fashion",difficulty:"Easy",question_en:"Swoosh logo brand: ___",question_he:"מותג הסווש: ___",answer_en:"Nike",answer_he:"נייקי"},
{id:"str1",category:"strange_questions",difficulty:"Easy",question_en:"A slug has ___ noses",question_he:"לחילזון ___ אפים",answer_en:"4",answer_he:"4"},
{id:"str2",category:"strange_questions",difficulty:"Medium",question_en:"Sleeps 3 years: ___",question_he:"ישנה 3 שנים: ___",answer_en:"Snail",answer_he:"חילזון"},
{id:"str3",category:"strange_questions",difficulty:"Hard",question_en:"Hippo sweat color: ___",question_he:"צבע זיעת היפו: ___",answer_en:"Red",answer_he:"אדום"},
{id:"str4",category:"strange_questions",difficulty:"Impossible",question_en:"Octopus hearts: ___",question_he:"לבבות תמנון: ___",answer_en:"3",answer_he:"3"},
{id:"str5",category:"strange_questions",difficulty:"Easy",question_en:"92% water fruit: ___",question_he:"פרי 92% מים: ___",answer_en:"Watermelon",answer_he:"אבטיח"},
{id:"str6",category:"strange_questions",difficulty:"Medium",question_en:"Diamond rain planet: ___",question_he:"גשם יהלומים על: ___",answer_en:"Neptune",answer_he:"נפטון"},
{id:"str7",category:"strange_questions",difficulty:"Hard",question_en:"Can't jump: ___",question_he:"לא קופץ: ___",answer_en:"Elephant",answer_he:"פיל"},
{id:"sci1",category:"science",difficulty:"Easy",question_en:"The Red Planet: ___",question_he:"הכוכב האדום: ___",answer_en:"Mars",answer_he:"מאדים"},
{id:"sci2",category:"science",difficulty:"Medium",question_en:"Gold symbol: ___",question_he:"סימן זהב: ___",answer_en:"Au",answer_he:"Au"},
{id:"sci3",category:"science",difficulty:"Hard",question_en:"Speed of light ≈ ___ km/s",question_he:"מהירות האור ≈ ___ קמ\"ש",answer_en:"300000",answer_he:"300000"},
{id:"sci4",category:"science",difficulty:"Very Hard",question_en:"Highest melting point: ___",question_he:"נקודת היתוך גבוהה: ___",answer_en:"Tungsten",answer_he:"טונגסטן"},
{id:"sci5",category:"science",difficulty:"Impossible",question_en:"Most atmospheric gas: ___",question_he:"הגז השכיח באטמוספירה: ___",answer_en:"Nitrogen",answer_he:"חנקן"},
{id:"sci6",category:"science",difficulty:"Easy",question_en:"Keeps us grounded: ___",question_he:"הכוח שמחזיק אותנו: ___",answer_en:"Gravity",answer_he:"כוח הכבידה"},
{id:"sci7",category:"science",difficulty:"Medium",question_en:"Human bones: ___",question_he:"עצמות אדם: ___",answer_en:"206",answer_he:"206"},
{id:"sci8",category:"science",difficulty:"Hard",question_en:"Cell powerhouse: ___",question_he:"תחנת כוח התא: ___",answer_en:"Mitochondria",answer_he:"מיטוכונדריה"},
];

const ICONS={general_knowledge:"🧠",history:"📜",geography:"🌍",flags:"🏳️",movies:"🎬",cartoons:"📺",famous:"⭐",sport:"🏆",football:"⚽",fashion:"👗",strange_questions:"🤯",science:"🔬"};
const CATS=Object.keys(ICONS);
const EMO=["😎","🤩","🥳","😏","🤓"];
const DECOYS={geography:["Paris","London","Tokyo","Beijing","Moscow"],history:["1066","1492","1776","1939","1969"],science:["Hydrogen","Helium","Carbon","Iron"],flags:["Sweden","Norway","Denmark","Poland","Austria"],movies:["Tom Hanks","Brad Pitt","1985","Gotham"],cartoons:["Blossom","Tommy","Squidward","Sandy"],famous:["Tesla","Edison","Newton","Darwin"],sport:["100","200","42","1936"],football:["Barcelona","Liverpool","Bayern","Ajax"],fashion:["Gucci","Prada","Versace","Dior"],strange_questions:["2","4","6","8","Blue"],general_knowledge:["8","12","24","100","Jupiter"]};

const T={en:{appName:"Bluffy",tagline:"The Bluffing Party Game",createGame:"Create Game",joinGame:"Join Game",enterName:"Your name",enterCode:"Room code",join:"Join",start:"Start Game!",players:"Players",settings:"Settings",time:"Time/question",sec:"sec",rounds:"Rounds",cats:"Categories",all:"All",none:"None",pickCat:"Pick a Category!",turn:"'s turn",typeAns:"Type answer...",submit:"Submit",waiting:"Waiting for others...",bluffMsg:"Correct! Type a plausible WRONG answer.",typeBluff:"Fake answer...",sendBluff:"Submit Bluff",skip:"Skip",choose:"Pick the correct answer",round:"Round",of:"of",pts:"pts",correct:"Correct",fooled:"fooled",scoreboard:"Scoreboard",next:"Next Round",over:"Game Over!",winner:"Winner!",again:"Play Again",menu:"Menu",kick:"Kick",leave:"Leave",host:"Host",wroteBy:"by",selfFool:"picked own bluff!",flag:"Which country's flag?",allAns:"All Answers",auto:"Auto",share:"Share code:",or:"or scan QR:",copied:"Copied!",copy:"Copy Link",waitHost:"Waiting for host...",youAnswered:"Answer submitted!",general_knowledge:"General Knowledge",history:"History",geography:"Geography",flags:"Flags",movies:"Movies",cartoons:"Cartoons",famous:"Famous People",sport:"Sport",football:"Football",fashion:"Fashion",strange_questions:"Strange Q's",science:"Science",timerLabel:"sec left",back:"Back"},
he:{appName:"בלאפי",tagline:"משחק הבלאפים",createGame:"צור משחק",joinGame:"הצטרף",enterName:"השם שלך",enterCode:"קוד חדר",join:"הצטרף",start:"!התחל",players:"שחקנים",settings:"הגדרות",time:"זמן/שאלה",sec:"שנ׳",rounds:"סיבובים",cats:"קטגוריות",all:"הכל",none:"כלום",pickCat:"!בחר קטגוריה",turn:" בוחר/ת",typeAns:"...הקלד תשובה",submit:"שלח",waiting:"...ממתינים",bluffMsg:"!נכון! הקלד תשובה שגויה משכנעת",typeBluff:"...מזויפת",sendBluff:"שלח בלאף",skip:"דלג",choose:"?מה נכון",round:"סיבוב",of:"מתוך",pts:"נק׳",correct:"נכון",fooled:"רימה",scoreboard:"ניקוד",next:"הבא",over:"!נגמר",winner:"!מנצח",again:"שוב",menu:"תפריט",kick:"הסר",leave:"עזוב",host:"מארח",wroteBy:"ע\"י",selfFool:"!בלאף עצמי",flag:"לאיזו מדינה שייך הדגל?",allAns:"כל התשובות",auto:"אוטו",share:"שתפו:",or:"או QR:",copied:"!הועתק",copy:"העתק",waitHost:"...ממתינים למארח",youAnswered:"!נשלח",general_knowledge:"ידע כללי",history:"היסטוריה",geography:"גיאוגרפיה",flags:"דגלים",movies:"סרטים",cartoons:"קריקטורות",famous:"מפורסמים",sport:"ספורט",football:"כדורגל",fashion:"אופנה",strange_questions:"שאלות מוזרות",science:"מדע",timerLabel:"שנ׳ נותרו",back:"חזרה"}};

function norm(s){return s.toLowerCase().trim().replace(/[^\w\s\u0590-\u05FF]/g,"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");}
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));return d[m][n];}
function fuzz(i,c){const a=norm(i),b=norm(c);if(!a||!b)return false;if(a===b)return true;if(a.includes(b)||b.includes(a))return true;return lev(a,b)<=(b.length<=8?2:3);}
function genDecoy(q,ex){const bk=DECOYS[q.category]||DECOYS.general_knowledge;const ne=ex.map(norm);const av=bk.filter(d=>!ne.some(e=>fuzz(d,e)));return av.length?av[Math.floor(Math.random()*av.length)]:"Unknown";}
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
    const q=rd.question;const ok=fuzz(ci,q.answer_en)||fuzz(ci,q.answer_he);
    update(ref(db,`rooms/${room}/answers/${uid}`),{text:ci.trim(),ok});
    if(!ok)set(ref(db,`rooms/${room}/publicAnswers/${uid}`),ci.trim());
    setCi("");
  };

  const submitBluff=()=>{
    if(!bi.trim()||!room||!rd?.question)return;
    const q=rd.question;if(fuzz(bi,q.answer_en)||fuzz(bi,q.answer_he))return;
    set(ref(db,`rooms/${room}/publicAnswers/${uid}`),bi.trim());setBi("");
  };

  const skipBluff=()=>{
    if(!room||!rd?.question)return;
    const q=rd.question;const ex=[...Object.values(rd.publicAnswers||{}),q.answer_en];
    set(ref(db,`rooms/${room}/publicAnswers/${uid}`),genDecoy(q,ex));
  };

  const hostAutoProgress=()=>{
    if(!isHost||!room)return;
    const u={};
    playerList.forEach(([id])=>{
      if(!rd?.answers?.[id])u[`answers/${id}`]={text:"—",ok:false};
      if(!rd?.publicAnswers?.[id]){
        const a=rd?.answers?.[id];
        if(a?.ok){const q=rd.question;u[`publicAnswers/${id}`]=genDecoy(q,[...Object.values(rd.publicAnswers||{}),q.answer_en]);}
        else u[`publicAnswers/${id}`]="—";
      }
    });
    if(Object.keys(u).length)update(ref(db,`rooms/${room}`),u);
  };

  const hostMoveToReveal=()=>{
    if(!isHost||!rd?.question)return;
    const q=rd.question;const ln=rd.lang||lang;const ca=ln==="he"?q.answer_he:q.answer_en;
    const os=[{text:ca,ok:true,ai:"",an:""}];const seen=new Set([norm(ca)]);
    Object.entries(rd.publicAnswers||{}).forEach(([id,txt])=>{
      if(txt==="—")return;const n=norm(txt);
      if(!seen.has(n)&&!fuzz(txt,q.answer_en)&&!fuzz(txt,q.answer_he)){
        os.push({text:txt,ok:false,ai:id,an:rd.players?.[id]?.name||"?"});seen.add(n);}
    });
    while(os.length<3){const ex=os.map(o=>o.text);const d=genDecoy(q,ex);if(!seen.has(norm(d))){os.push({text:d,ok:false,ai:"sys",an:"Auto"});seen.add(norm(d));}else break;}
    for(let i=os.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[os[i],os[j]]=[os[j],os[i]];}
    update(ref(db,`rooms/${room}`),{state:"reveal",options:os,correctAnswer:ca,selections:null});
  };

  const selectOption=(idx)=>{if(!room||selected)return;set(ref(db,`rooms/${room}/selections/${uid}`),idx);};

  const hostCalcScores=()=>{
    if(!isHost||!rd?.options)return;
    const opts=rd.options;const res={};const su={};
    playerList.forEach(([id])=>{res[id]={e:0,fb:[],sf:false};});
    Object.entries(rd.selections||{}).forEach(([id,oi])=>{if(opts[oi]?.ok){res[id].e+=2;su[`players/${id}/score`]=(rd.players[id]?.score||0)+2;}});
    Object.entries(rd.selections||{}).forEach(([id,oi])=>{
      const s=opts[oi];
      if(!s?.ok&&s?.ai&&s.ai!=="sys"){
        if(s.ai===id)res[id].sf=true;
        else{res[s.ai].e+=1;res[s.ai].fb.push(rd.players[id]?.name||"?");su[`players/${s.ai}/score`]=(su[`players/${s.ai}/score`]??rd.players[s.ai]?.score??0)+1;}
      }
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
  const FI=({c})=>{const u=flagUrl(c);return u?<img src={u} alt="" style={{width:160,height:100,objectFit:"cover",borderRadius:8,border:"2px solid rgba(255,255,255,.2)",margin:"12px auto",display:"block"}}/>:null;};
  const QT=()=>{const q=rd?.question;if(!q)return"";if(q.flag_country)return he?t.flag:t.flag;return he?q.question_he:q.question_en;};
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
      {q?.flag_country&&<FI c={q.flag_country}/>}
      <p style={{color:"#fff",fontSize:20,fontWeight:700,margin:"10px 0 0",lineHeight:1.4}}>{QT()}</p>
    </div>
    {!answered?(<div style={{...C,textAlign:"center"}}>
      <input value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitAnswer()} placeholder={t.typeAns} style={{...I,width:"100%",textAlign:"center",fontSize:18,marginBottom:12}} autoFocus/>
      <button onClick={submitAnswer} disabled={!ci.trim()} style={{...B,background:ci.trim()?"linear-gradient(135deg,#4ade80,#22c55e)":"#333",color:"#fff",padding:"12px 40px",borderRadius:12,fontSize:16,fontWeight:700,opacity:ci.trim()?1:.4}}>{t.submit}</button>
    </div>):needBluff?(<div style={{...C,textAlign:"center",borderColor:"rgba(255,215,0,.3)",background:"rgba(255,215,0,.05)"}}>
      <div style={{fontSize:48,marginBottom:8}}>🎭</div>
      <p style={{color:"#fff",fontSize:16,lineHeight:1.5,margin:"0 0 12px"}}>{t.bluffMsg}</p>
      <input value={bi} onChange={e=>setBi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitBluff()} placeholder={t.typeBluff} style={{...I,width:"100%",textAlign:"center",fontSize:18,marginBottom:12}} autoFocus/>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
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
      {rd.question?.flag_country&&<FI c={rd.question.flag_country}/>}
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
      {rd.question?.flag_country&&<FI c={rd.question.flag_country}/>}
      <p style={{color:"#4ade80",fontSize:24,fontWeight:800,margin:"8px 0"}}>{rd.correctAnswer}</p>
    </div>
    {playerList.map(([id,p],i)=>{const r=rd.results[id]||{};const oi=rd.selections?.[id];const pk=rd.options?.[oi];return<div key={id} style={{...C,marginBottom:8,padding:"12px 16px",borderColor:r.e>0?"rgba(255,215,0,.2)":"rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
          <span style={{fontSize:22}}>{EMO[i]||"🎮"}</span>
          <div style={{minWidth:0}}>
            <p style={{color:"#fff",fontWeight:700,margin:0,fontSize:14}}>{p.name}</p>
            <p style={{color:pk?.ok?"#4ade80":"#f87171",fontSize:12,margin:"2px 0 0"}}>{pk?.ok?"✓ ":"✗ "}{pk?.text||"—"}{r.sf?<span style={{color:"#FFA500",marginInlineStart:6}}>({t.selfFool})</span>:""}</p>
            {!pk?.ok&&pk?.ai&&pk.ai!=="sys"&&<p style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{t.wroteBy} {pk.an}</p>}
            {r.fb?.length>0&&<p style={{color:"#C084FC",fontSize:11}}>{t.fooled} {r.fb.length}: {r.fb.join(", ")}</p>}
          </div>
        </div>
        <span style={{color:r.e>0?"#FFD700":"rgba(255,255,255,.3)",fontSize:22,fontWeight:900,minWidth:45,textAlign:"center"}}>+{r.e||0}</span>
      </div>
      {isHost&&id!==uid&&<button onClick={()=>kickPlayer(id)} style={{...B,background:"rgba(255,59,48,.1)",color:"#FF6B6B",padding:"3px 10px",borderRadius:6,fontSize:10,marginTop:6}}>{t.kick}</button>}
    </div>;})}
    <div style={{...C,margin:"12px 0 16px"}}>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:12,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{t.allAns}</p>
      {(rd.options||[]).map((o,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<rd.options.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <span style={{color:o.ok?"#4ade80":"#fff",fontWeight:o.ok?700:400,fontSize:13}}>{o.ok?"✓ ":""}{o.text}</span>
        <span style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{o.ok?t.correct:o.an||""}</span>
      </div>)}
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