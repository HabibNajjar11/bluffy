import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// FLAG IMAGE HELPER (uses flagcdn.com)
// ═══════════════════════════════════════════════════════════
const FLAG_CODES = {
  "Japan":"jp","France":"fr","South Korea":"kr","Mexico":"mx","Thailand":"th",
  "Colombia":"co","Romania":"ro","Ivory Coast":"ci","Brazil":"br","Germany":"de",
  "Italy":"it","Canada":"ca","Australia":"au","India":"in","China":"cn",
  "Russia":"ru","United States":"us","United Kingdom":"gb","Spain":"es",
  "Turkey":"tr","Egypt":"eg","Argentina":"ar","Sweden":"se","Norway":"no",
  "Denmark":"dk","Poland":"pl","Hungary":"hu","Austria":"at","Belgium":"be",
  "Netherlands":"nl","Portugal":"pt","Ireland":"ie","Iceland":"is","Greece":"gr",
  "Switzerland":"ch","Finland":"fi","Czech Republic":"cz","Croatia":"hr",
  "Serbia":"rs","Ukraine":"ua","Israel":"il","Saudi Arabia":"sa","Iran":"ir",
  "Iraq":"iq","Pakistan":"pk","Bangladesh":"bd","Indonesia":"id","Philippines":"ph",
  "Vietnam":"vn","Malaysia":"my","Singapore":"sg","New Zealand":"nz","Chile":"cl",
  "Peru":"pe","Cuba":"cu","Jamaica":"jm","Nigeria":"ng","South Africa":"za",
  "Kenya":"ke","Morocco":"ma","Ethiopia":"et","Ghana":"gh","Tanzania":"tz",
  "Nepal":"np","Bhutan":"bt","Mongolia":"mn","North Korea":"kp","Taiwan":"tw",
  "Cambodia":"kh","Laos":"la","Myanmar":"mm","Sri Lanka":"lk","Maldives":"mv",
  "Qatar":"qa","Kuwait":"kw","Bahrain":"bh","Oman":"om","Jordan":"jo",
  "Lebanon":"lb","Chad":"td","Luxembourg":"lu","Monaco":"mc","Malta":"mt","Cyprus":"cy",
  "Estonia":"ee","Latvia":"lv","Lithuania":"lt","Slovenia":"si","Slovakia":"sk",
  "Albania":"al","Georgia":"ge","Armenia":"am","Azerbaijan":"az","Kazakhstan":"kz",
  "Costa Rica":"cr","Panama":"pa","Honduras":"hn","Guatemala":"gt",
  "Paraguay":"py","Uruguay":"uy","Bolivia":"bo","Ecuador":"ec","Venezuela":"ve",
  "Trinidad and Tobago":"tt","Bahamas":"bs","Haiti":"ht","Dominican Republic":"do",
};
const getFlagUrl = (country) => {
  const code = FLAG_CODES[country];
  return code ? `https://flagcdn.com/w160/${code}.png` : null;
};

// ═══════════════════════════════════════════════════════════
// QUESTION DATABASE (complete the sentence format, Hebrew answers for Hebrew mode)
// ═══════════════════════════════════════════════════════════
const QUESTIONS = [
  // GENERAL KNOWLEDGE
  {id:"gk1",category:"general_knowledge",difficulty:"Easy",question_en:"The number of continents in the world is ___",question_he:"מספר היבשות בעולם הוא ___",answer_en:"7",answer_he:"7"},
  {id:"gk2",category:"general_knowledge",difficulty:"Easy",question_en:"The chemical symbol for water is ___",question_he:"הסימן הכימי של מים הוא ___",answer_en:"H2O",answer_he:"H2O"},
  {id:"gk3",category:"general_knowledge",difficulty:"Medium",question_en:"A standard piano has ___ keys",question_he:"בפסנתר רגיל יש ___ קלידים",answer_en:"88",answer_he:"88"},
  {id:"gk4",category:"general_knowledge",difficulty:"Hard",question_en:"The smallest country in the world by area is ___",question_he:"המדינה הקטנה בעולם לפי שטח היא ___",answer_en:"Vatican City",answer_he:"הוותיקן",explanation_en:"Vatican City is only about 44 hectares.",explanation_he:"הוותיקן משתרע על כ-44 הקטרים בלבד."},
  {id:"gk5",category:"general_knowledge",difficulty:"Very Hard",question_en:"The first email was sent in the year ___",question_he:"האימייל הראשון נשלח בשנת ___",answer_en:"1971",answer_he:"1971"},
  {id:"gk6",category:"general_knowledge",difficulty:"Impossible",question_en:"The most common blood type in the world is ___",question_he:"סוג הדם הנפוץ ביותר בעולם הוא ___",answer_en:"O positive",answer_he:"O חיובי"},
  {id:"gk7",category:"general_knowledge",difficulty:"Medium",question_en:"The gas that plants absorb from the atmosphere is ___",question_he:"הגז שצמחים סופגים מהאטמוספירה הוא ___",answer_en:"Carbon dioxide",answer_he:"פחמן דו חמצני"},
  {id:"gk8",category:"general_knowledge",difficulty:"Hard",question_en:"The hardest natural substance on Earth is ___",question_he:"החומר הטבעי הקשה ביותר בכדור הארץ הוא ___",answer_en:"Diamond",answer_he:"יהלום"},
  {id:"gk9",category:"general_knowledge",difficulty:"Easy",question_en:"The boiling point of water in Celsius is ___",question_he:"נקודת הרתיחה של מים בצלזיוס היא ___",answer_en:"100",answer_he:"100"},
  {id:"gk10",category:"general_knowledge",difficulty:"Easy",question_en:"The largest animal on Earth is the ___",question_he:"החיה הגדולה ביותר בכדור הארץ היא ___",answer_en:"Blue whale",answer_he:"לוויתן כחול"},
  {id:"gk11",category:"general_knowledge",difficulty:"Medium",question_en:"An adult human has ___ teeth",question_he:"לאדם בוגר יש ___ שיניים",answer_en:"32",answer_he:"32"},
  {id:"gk12",category:"general_knowledge",difficulty:"Hard",question_en:"Russia spans ___ time zones",question_he:"רוסיה משתרעת על פני ___ אזורי זמן",answer_en:"11",answer_he:"11"},

  // HISTORY
  {id:"his1",category:"history",difficulty:"Easy",question_en:"World War II ended in the year ___",question_he:"מלחמת העולם השנייה הסתיימה בשנת ___",answer_en:"1945",answer_he:"1945"},
  {id:"his2",category:"history",difficulty:"Medium",question_en:"The first person to walk on the Moon was ___ (full name)",question_he:"האדם הראשון שהלך על הירח היה ___ (שם מלא)",answer_en:"Neil Armstrong",answer_he:"ניל ארמסטרונג"},
  {id:"his3",category:"history",difficulty:"Hard",question_en:"The ancient wonder in Alexandria, Egypt was the ___",question_he:"פלא העולם העתיק באלכסנדריה, מצרים היה ___",answer_en:"Lighthouse of Alexandria",answer_he:"המגדלור של אלכסנדריה"},
  {id:"his4",category:"history",difficulty:"Very Hard",question_en:"The Magna Carta was signed in the year ___",question_he:"המגנא כרטא נחתמה בשנת ___",answer_en:"1215",answer_he:"1215"},
  {id:"his5",category:"history",difficulty:"Impossible",question_en:"The last pharaoh of ancient Egypt was ___ (first name)",question_he:"הפרעון/ית האחרון/ה של מצרים העתיקה היה/תה ___ (שם פרטי)",answer_en:"Cleopatra",answer_he:"קלאופטרה"},
  {id:"his6",category:"history",difficulty:"Easy",question_en:"The country that built the Great Wall is ___",question_he:"המדינה שבנתה את החומה הגדולה היא ___",answer_en:"China",answer_he:"סין"},
  {id:"his7",category:"history",difficulty:"Medium",question_en:"The ship that sank in 1912 on its maiden voyage was the ___",question_he:"האונייה שטבעה ב-1912 בהפלגת הבכורה שלה הייתה ___",answer_en:"Titanic",answer_he:"טיטאניק"},
  {id:"his8",category:"history",difficulty:"Hard",question_en:"The empire ruled by Genghis Khan was the ___",question_he:"האימפריה שנשלטה ע\"י ג'ינגיס חאן הייתה ___",answer_en:"Mongol Empire",answer_he:"האימפריה המונגולית"},

  // GEOGRAPHY
  {id:"geo1",category:"geography",difficulty:"Easy",question_en:"The largest ocean on Earth is the ___",question_he:"האוקיינוס הגדול ביותר בכדור הארץ הוא ___",answer_en:"Pacific Ocean",answer_he:"האוקיינוס השקט"},
  {id:"geo2",category:"geography",difficulty:"Medium",question_en:"The longest river in the world is the ___",question_he:"הנהר הארוך ביותר בעולם הוא ___",answer_en:"Nile",answer_he:"הנילוס"},
  {id:"geo3",category:"geography",difficulty:"Hard",question_en:"The capital of Mongolia is ___",question_he:"בירת מונגוליה היא ___",answer_en:"Ulaanbaatar",answer_he:"אולן בטור"},
  {id:"geo4",category:"geography",difficulty:"Very Hard",question_en:"The country with the most natural lakes is ___",question_he:"המדינה עם הכי הרבה אגמים טבעיים היא ___",answer_en:"Canada",answer_he:"קנדה"},
  {id:"geo5",category:"geography",difficulty:"Impossible",question_en:"The driest inhabited continent is ___",question_he:"היבשת המיושבת היבשה ביותר היא ___",answer_en:"Australia",answer_he:"אוסטרליה"},
  {id:"geo6",category:"geography",difficulty:"Easy",question_en:"Brazil is located on the continent of ___",question_he:"ברזיל ממוקמת ביבשת ___",answer_en:"South America",answer_he:"דרום אמריקה"},
  {id:"geo7",category:"geography",difficulty:"Medium",question_en:"The capital of Australia is ___",question_he:"בירת אוסטרליה היא ___",answer_en:"Canberra",answer_he:"קנברה"},
  {id:"geo8",category:"geography",difficulty:"Hard",question_en:"The African country with the largest population is ___",question_he:"המדינה באפריקה עם האוכלוסייה הגדולה ביותר היא ___",answer_en:"Nigeria",answer_he:"ניגריה"},

  // FLAGS (using actual flag images)
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
  {id:"fl13",category:"flags",difficulty:"Hard",answer_en:"Finland",answer_he:"פינלנד",flag_country:"Finland"},
  {id:"fl14",category:"flags",difficulty:"Hard",answer_en:"Argentina",answer_he:"ארגנטינה",flag_country:"Argentina"},
  {id:"fl15",category:"flags",difficulty:"Very Hard",answer_en:"Hungary",answer_he:"הונגריה",flag_country:"Hungary"},
  {id:"fl16",category:"flags",difficulty:"Impossible",answer_en:"Chad",answer_he:"צ'אד",flag_country:"Chad"},

  // MOVIES
  {id:"mov1",category:"movies",difficulty:"Easy",question_en:"The name of the lion in 'The Lion King' is ___",question_he:"שם האריה ב'מלך האריות' הוא ___",answer_en:"Simba",answer_he:"סימבה"},
  {id:"mov2",category:"movies",difficulty:"Medium",question_en:"The director of 'Jaws' is ___ (full name)",question_he:"הבמאי של 'לסתות' הוא ___ (שם מלא)",answer_en:"Steven Spielberg",answer_he:"סטיבן שפילברג"},
  {id:"mov3",category:"movies",difficulty:"Hard",question_en:"The first 'Star Wars' movie was released in ___",question_he:"סרט 'מלחמת הכוכבים' הראשון יצא בשנת ___",answer_en:"1977",answer_he:"1977"},
  {id:"mov4",category:"movies",difficulty:"Very Hard",question_en:"Wolverine's skeleton is coated with a fictional metal called ___",question_he:"השלד של וולברין מצופה במתכת בדיונית בשם ___",answer_en:"Adamantium",answer_he:"אדמנטיום"},
  {id:"mov5",category:"movies",difficulty:"Impossible",question_en:"The planet in 'Avatar' (2009) is called ___",question_he:"שם הכוכב בסרט 'אווטאר' (2009) הוא ___",answer_en:"Pandora",answer_he:"פנדורה"},
  {id:"mov6",category:"movies",difficulty:"Easy",question_en:"Shrek's color is ___",question_he:"הצבע של שרק הוא ___",answer_en:"Green",answer_he:"ירוק"},
  {id:"mov7",category:"movies",difficulty:"Medium",question_en:"In 'Finding Nemo', Nemo is a ___ (type of fish)",question_he:"ב'לחפש את נמו', נמו הוא ___ (סוג דג)",answer_en:"Clownfish",answer_he:"דג ליצן"},
  {id:"mov8",category:"movies",difficulty:"Hard",question_en:"The Joker in 'The Dark Knight' was played by ___ (full name)",question_he:"הג'וקר ב'האביר האפל' גולם ע\"י ___ (שם מלא)",answer_en:"Heath Ledger",answer_he:"הית' לדג'ר"},

  // CARTOONS
  {id:"car1",category:"cartoons",difficulty:"Easy",question_en:"SpongeBob's best friend is ___ (first name)",question_he:"החבר הכי טוב של בובספוג הוא ___ (שם פרטי)",answer_en:"Patrick",answer_he:"פטריק"},
  {id:"car2",category:"cartoons",difficulty:"Medium",question_en:"The Simpsons live in a city called ___",question_he:"הסימפסונים גרים בעיר ___",answer_en:"Springfield",answer_he:"ספרינגפילד"},
  {id:"car3",category:"cartoons",difficulty:"Hard",question_en:"Dexter's sister in 'Dexter's Laboratory' is called ___",question_he:"האחות של דקסטר ב'המעבדה של דקסטר' נקראת ___",answer_en:"Dee Dee",answer_he:"די די"},
  {id:"car4",category:"cartoons",difficulty:"Very Hard",question_en:"Aang's flying bison in 'Avatar: The Last Airbender' is named ___",question_he:"הביזון המעופף של אאנג ב'אווטאר' נקרא ___",answer_en:"Appa",answer_he:"אפה"},
  {id:"car5",category:"cartoons",difficulty:"Impossible",question_en:"The cat in 'Coraline' is simply called ___",question_he:"החתול ב'קורליין' פשוט נקרא ___",answer_en:"Cat",answer_he:"חתול"},
  {id:"car6",category:"cartoons",difficulty:"Easy",question_en:"Mickey Mouse's pet Pluto is a ___",question_he:"פלוטו של מיקי מאוס הוא ___",answer_en:"Dog",answer_he:"כלב"},
  {id:"car7",category:"cartoons",difficulty:"Medium",question_en:"The main villain in 'Powerpuff Girls' is ___",question_he:"הנבל הראשי ב'בנות הפאוורפאף' הוא ___",answer_en:"Mojo Jojo",answer_he:"מוג'ו ג'וג'ו"},
  {id:"car8",category:"cartoons",difficulty:"Hard",question_en:"The pet platypus in 'Phineas and Ferb' is named ___",question_he:"חיית המחמד ב'פיניאס ופרב' נקראת ___",answer_en:"Perry",answer_he:"פרי"},

  // FAMOUS PEOPLE
  {id:"fam1",category:"famous",difficulty:"Easy",question_en:"The Mona Lisa was painted by ___ (full name)",question_he:"המונה ליזה צוירה ע\"י ___ (שם מלא)",answer_en:"Leonardo da Vinci",answer_he:"לאונרדו דה וינצ'י"},
  {id:"fam2",category:"famous",difficulty:"Medium",question_en:"'Romeo and Juliet' was written by ___ (full name)",question_he:"'רומיאו ויוליה' נכתב ע\"י ___ (שם מלא)",answer_en:"William Shakespeare",answer_he:"וויליאם שייקספיר"},
  {id:"fam3",category:"famous",difficulty:"Hard",question_en:"Penicillin was discovered by ___ (full name)",question_he:"הפניצילין התגלה ע\"י ___ (שם מלא)",answer_en:"Alexander Fleming",answer_he:"אלכסנדר פלמינג"},
  {id:"fam4",category:"famous",difficulty:"Very Hard",question_en:"The first woman to win a Nobel Prize was ___ (full name)",question_he:"האישה הראשונה שזכתה בנובל הייתה ___ (שם מלא)",answer_en:"Marie Curie",answer_he:"מארי קירי"},
  {id:"fam5",category:"famous",difficulty:"Impossible",question_en:"The World Wide Web was invented by ___ (full name)",question_he:"הרשת העולמית הומצאה ע\"י ___ (שם מלא)",answer_en:"Tim Berners-Lee",answer_he:"טים ברנרס-לי"},
  {id:"fam6",category:"famous",difficulty:"Easy",question_en:"The 'King of Pop' is ___ (full name)",question_he:"'מלך הפופ' הוא ___ (שם מלא)",answer_en:"Michael Jackson",answer_he:"מייקל ג'קסון"},
  {id:"fam7",category:"famous",difficulty:"Medium",question_en:"The theory of relativity was developed by ___ (full name)",question_he:"תורת היחסות פותחה ע\"י ___ (שם מלא)",answer_en:"Albert Einstein",answer_he:"אלברט איינשטיין"},
  {id:"fam8",category:"famous",difficulty:"Hard",question_en:"The first US president was ___ (full name)",question_he:"הנשיא הראשון של ארה\"ב היה ___ (שם מלא)",answer_en:"George Washington",answer_he:"ג'ורג' וושינגטון"},

  // SPORT
  {id:"sp1",category:"sport",difficulty:"Easy",question_en:"A basketball team has ___ players on the court",question_he:"בקבוצת כדורסל יש ___ שחקנים על המגרש",answer_en:"5",answer_he:"5"},
  {id:"sp2",category:"sport",difficulty:"Medium",question_en:"A shuttlecock is used in ___",question_he:"כדורנוצה משמשת בענף ___",answer_en:"Badminton",answer_he:"בדמינטון"},
  {id:"sp3",category:"sport",difficulty:"Hard",question_en:"A marathon is ___ kilometers long",question_he:"מרתון הוא ___ קילומטרים",answer_en:"42.195",answer_he:"42.195"},
  {id:"sp4",category:"sport",difficulty:"Very Hard",question_en:"The first modern Olympic Games were held in ___",question_he:"האולימפיאדה המודרנית הראשונה נערכה בשנת ___",answer_en:"1896",answer_he:"1896"},
  {id:"sp5",category:"sport",difficulty:"Impossible",question_en:"The only country in every FIFA World Cup is ___",question_he:"המדינה היחידה בכל מונדיאל היא ___",answer_en:"Brazil",answer_he:"ברזיל"},
  {id:"sp6",category:"sport",difficulty:"Easy",question_en:"Wimbledon features the sport of ___",question_he:"בווימבלדון משחקים ___",answer_en:"Tennis",answer_he:"טניס"},
  {id:"sp7",category:"sport",difficulty:"Medium",question_en:"The Olympic flag has ___ rings",question_he:"בדגל האולימפי יש ___ טבעות",answer_en:"5",answer_he:"5"},
  {id:"sp8",category:"sport",difficulty:"Hard",question_en:"A 'slam dunk' is performed in ___",question_he:"'סלאם דאנק' מבוצע ב___",answer_en:"Basketball",answer_he:"כדורסל"},

  // FOOTBALL
  {id:"fb1",category:"football",difficulty:"Easy",question_en:"A football team has ___ players on the field",question_he:"בקבוצת כדורגל יש ___ שחקנים על המגרש",answer_en:"11",answer_he:"11"},
  {id:"fb2",category:"football",difficulty:"Medium",question_en:"The first World Cup in 1930 was won by ___",question_he:"המונדיאל הראשון ב-1930 נוצח ע\"י ___",answer_en:"Uruguay",answer_he:"אורוגוואי"},
  {id:"fb3",category:"football",difficulty:"Hard",question_en:"The Brazilian national team's nickname is ___",question_he:"הכינוי של נבחרת ברזיל הוא ___",answer_en:"Selecao",answer_he:"סלסאו"},
  {id:"fb4",category:"football",difficulty:"Very Hard",question_en:"'The Theatre of Dreams' is the nickname of ___",question_he:"'תיאטרון החלומות' הוא הכינוי של ___",answer_en:"Old Trafford",answer_he:"אולד טראפורד"},
  {id:"fb5",category:"football",difficulty:"Impossible",question_en:"The record holder for most goals in a calendar year is ___ (full name)",question_he:"שיאן השערים בשנה קלנדרית הוא ___ (שם מלא)",answer_en:"Lionel Messi",answer_he:"ליאונל מסי"},
  {id:"fb6",category:"football",difficulty:"Easy",question_en:"A player is sent off with a ___ card",question_he:"שחקן מורחק עם כרטיס ___",answer_en:"Red",answer_he:"אדום"},
  {id:"fb7",category:"football",difficulty:"Medium",question_en:"The club with the most Champions League titles is ___",question_he:"המועדון עם הכי הרבה תארי ליגת אלופות הוא ___",answer_en:"Real Madrid",answer_he:"ריאל מדריד"},
  {id:"fb8",category:"football",difficulty:"Hard",question_en:"Football originated in ___",question_he:"הכדורגל נולד ב___",answer_en:"England",answer_he:"אנגליה"},

  // FASHION
  {id:"fas1",category:"fashion",difficulty:"Easy",question_en:"The luxury brand with an interlocking 'CC' logo is ___",question_he:"מותג היוקרה עם לוגו CC שלוב הוא ___",answer_en:"Chanel",answer_he:"שאנל"},
  {id:"fas2",category:"fashion",difficulty:"Medium",question_en:"Milan Fashion Week is held in ___",question_he:"שבוע האופנה של מילאנו מתקיים ב___",answer_en:"Milan",answer_he:"מילאנו"},
  {id:"fas3",category:"fashion",difficulty:"Hard",question_en:"The 'Little Black Dress' was created by ___ (full name)",question_he:"'השמלה השחורה הקטנה' נוצרה ע\"י ___ (שם מלא)",answer_en:"Coco Chanel",answer_he:"קוקו שאנל"},
  {id:"fas4",category:"fashion",difficulty:"Very Hard",question_en:"Denim is traditionally made from ___",question_he:"דנים מיוצר באופן מסורתי מ___",answer_en:"Cotton",answer_he:"כותנה"},
  {id:"fas5",category:"fashion",difficulty:"Impossible",question_en:"The kimono originated in ___",question_he:"הקימונו מקורו ב___",answer_en:"Japan",answer_he:"יפן"},
  {id:"fas6",category:"fashion",difficulty:"Easy",question_en:"The brand with the swoosh logo is ___",question_he:"המותג עם לוגו הסווש הוא ___",answer_en:"Nike",answer_he:"נייקי"},
  {id:"fas7",category:"fashion",difficulty:"Medium",question_en:"The color associated with Tiffany & Co. is ___",question_he:"הצבע המזוהה עם טיפאני הוא ___",answer_en:"Blue",answer_he:"כחול"},
  {id:"fas8",category:"fashion",difficulty:"Hard",question_en:"The Italian fashion capital of the world is ___",question_he:"בירת האופנה העולמית באיטליה היא ___",answer_en:"Milan",answer_he:"מילאנו"},

  // STRANGE QUESTIONS
  {id:"str1",category:"strange_questions",difficulty:"Easy",question_en:"A slug has ___ noses",question_he:"לחילזון יש ___ אפים",answer_en:"4",answer_he:"4"},
  {id:"str2",category:"strange_questions",difficulty:"Medium",question_en:"The animal that can sleep for 3 years is the ___",question_he:"החיה שיכולה לישון 3 שנים היא ___",answer_en:"Snail",answer_he:"חילזון"},
  {id:"str3",category:"strange_questions",difficulty:"Hard",question_en:"A hippo's sweat is ___ colored",question_he:"צבע הזיעה של היפופוטם הוא ___",answer_en:"Red",answer_he:"אדום"},
  {id:"str4",category:"strange_questions",difficulty:"Very Hard",question_en:"The fear of long words is called ___",question_he:"הפחד ממילים ארוכות נקרא ___",answer_en:"Hippopotomonstrosesquippedaliophobia",answer_he:"היפופוטומונסטרוססקוויפדליופוביה"},
  {id:"str5",category:"strange_questions",difficulty:"Impossible",question_en:"An octopus has ___ hearts",question_he:"לתמנון יש ___ לבבות",answer_en:"3",answer_he:"3"},
  {id:"str6",category:"strange_questions",difficulty:"Easy",question_en:"The fruit that is 92% water is ___",question_he:"הפרי שמכיל 92% מים הוא ___",answer_en:"Watermelon",answer_he:"אבטיח"},
  {id:"str7",category:"strange_questions",difficulty:"Medium",question_en:"The planet where it rains diamonds is ___",question_he:"כוכב הלכת שעליו יורד גשם של יהלומים הוא ___",answer_en:"Neptune",answer_he:"נפטון"},
  {id:"str8",category:"strange_questions",difficulty:"Hard",question_en:"The animal that cannot jump is the ___",question_he:"החיה שלא יכולה לקפוץ היא ___",answer_en:"Elephant",answer_he:"פיל"},

  // SCIENCE
  {id:"sci1",category:"science",difficulty:"Easy",question_en:"The planet known as the Red Planet is ___",question_he:"כוכב הלכת הידוע ככוכב האדום הוא ___",answer_en:"Mars",answer_he:"מאדים"},
  {id:"sci2",category:"science",difficulty:"Medium",question_en:"The chemical symbol for gold is ___",question_he:"הסימן הכימי של זהב הוא ___",answer_en:"Au",answer_he:"Au"},
  {id:"sci3",category:"science",difficulty:"Hard",question_en:"The speed of light is approximately ___ km/s",question_he:"מהירות האור היא כ-___ קמ\"ש",answer_en:"300000",answer_he:"300000"},
  {id:"sci4",category:"science",difficulty:"Very Hard",question_en:"The element with the highest melting point is ___",question_he:"היסוד עם נקודת ההיתוך הגבוהה ביותר הוא ___",answer_en:"Tungsten",answer_he:"טונגסטן"},
  {id:"sci5",category:"science",difficulty:"Impossible",question_en:"The most abundant gas in Earth's atmosphere is ___",question_he:"הגז השכיח ביותר באטמוספירה הוא ___",answer_en:"Nitrogen",answer_he:"חנקן"},
  {id:"sci6",category:"science",difficulty:"Easy",question_en:"The force that keeps us on the ground is ___",question_he:"הכוח שמחזיק אותנו על הקרקע הוא ___",answer_en:"Gravity",answer_he:"כוח הכבידה"},
  {id:"sci7",category:"science",difficulty:"Medium",question_en:"The adult human body has ___ bones",question_he:"בגוף האדם הבוגר יש ___ עצמות",answer_en:"206",answer_he:"206"},
  {id:"sci8",category:"science",difficulty:"Hard",question_en:"The powerhouse of the cell is the ___",question_he:"תחנת הכוח של התא היא ___",answer_en:"Mitochondria",answer_he:"מיטוכונדריה"},
];

const T={en:{appName:"Bluffy",tagline:"The Bluffing Party Game",createGame:"Create Game",enterName:"Enter your name",addPlayer:"Add Player",startGame:"Start Game!",players:"Players",settings:"Settings",timePerQ:"Time per question",seconds:"sec",numRounds:"Rounds",categories:"Categories",selectAll:"All",deselectAll:"None",pickCategory:"Pick a Category!",yourTurn:"'s turn to pick",typeAnswer:"Type your answer...",submit:"Submit",passTo:"Pass phone to",tapToReveal:"Tap to answer",correctBluff:"Correct! Now type a plausible WRONG answer to fool others.",typeBluff:"Type a fake answer...",submitBluff:"Submit Bluff",chooseAnswer:"Which answer is correct?",round:"Round",of:"of",points:"pts",correct:"Correct answer",fooled:"fooled",player:"player(s)",scoreboard:"Scoreboard",nextRound:"Next Round",gameOver:"Game Over!",winner:"Winner",playAgain:"Play Again",backToMenu:"Menu",kick:"Kick",leave:"Leave",admin:"Host",noCategories:"Pick at least 1 category",minPlayers:"Min 2 players",general_knowledge:"General Knowledge",history:"History",geography:"Geography",flags:"Flags",movies:"Movies",cartoons:"Cartoons",famous:"Famous People",sport:"Sport",football:"Football",fashion:"Fashion",strange_questions:"Strange Questions",science:"Science",remove:"Remove",skip:"Skip",wroteBy:"by",nobody:"nobody",selfFool:"picked own bluff!",whichCountry:"Which country does this flag belong to?",allAnswers:"All Answers",auto:"Auto",exitGame:"Exit"},
he:{appName:"בלאפי",tagline:"משחק הבלאפים למסיבות",createGame:"צור משחק",enterName:"הכנס את שמך",addPlayer:"הוסף שחקן",startGame:"!התחל משחק",players:"שחקנים",settings:"הגדרות",timePerQ:"זמן לשאלה",seconds:"שנ׳",numRounds:"סיבובים",categories:"קטגוריות",selectAll:"הכל",deselectAll:"כלום",pickCategory:"!בחר קטגוריה",yourTurn:" תורו/ה לבחור",typeAnswer:"...הקלד תשובה",submit:"שלח",passTo:"תעביר/י ל",tapToReveal:"לחץ לענות",correctBluff:"!נכון! הקלד תשובה שגויה משכנעת כדי לרמות",typeBluff:"...תשובה מזויפת",submitBluff:"שלח בלאף",chooseAnswer:"?איזו תשובה נכונה",round:"סיבוב",of:"מתוך",points:"נק׳",correct:"תשובה נכונה",fooled:"רימה",player:"שחקנים",scoreboard:"טבלת ניקוד",nextRound:"סיבוב הבא",gameOver:"!נגמר",winner:"מנצח",playAgain:"שוב",backToMenu:"תפריט",kick:"הסר",leave:"עזוב",admin:"מארח",noCategories:"בחר קטגוריה",minPlayers:"מינימום 2",general_knowledge:"ידע כללי",history:"היסטוריה",geography:"גיאוגרפיה",flags:"דגלים",movies:"סרטים",cartoons:"קריקטורות",famous:"מפורסמים",sport:"ספורט",football:"כדורגל",fashion:"אופנה",strange_questions:"שאלות מוזרות",science:"מדע",remove:"הסר",skip:"דלג",wroteBy:"ע\"י",nobody:"אף אחד",selfFool:"!בחר בלאף עצמי",whichCountry:"לאיזו מדינה שייך הדגל?",allAnswers:"כל התשובות",auto:"אוטו",exitGame:"יציאה"}};

const ICONS={general_knowledge:"🧠",history:"📜",geography:"🌍",flags:"🏳️",movies:"🎬",cartoons:"📺",famous:"⭐",sport:"🏆",football:"⚽",fashion:"👗",strange_questions:"🤯",science:"🔬"};
const CATS=Object.keys(ICONS);
const EMO=["😎","🤩","🥳","😏","🤓"];
const DECOYS={geography:["Paris","London","Tokyo","Beijing","Moscow","Cairo"],history:["1066","1492","1776","1812","1939","1969"],science:["Hydrogen","Helium","Carbon","Iron","Oxygen"],flags:["Sweden","Norway","Denmark","Poland","Austria","Belgium"],movies:["Tom Hanks","Brad Pitt","1985","1992","Gotham"],cartoons:["Blossom","Bubbles","Tommy","Squidward","Sandy"],famous:["Tesla","Edison","Newton","Darwin","Galileo"],sport:["100","200","42","1900","1936"],football:["Barcelona","Liverpool","Bayern","Juventus","Ajax"],fashion:["Gucci","Prada","Versace","Armani","Dior"],strange_questions:["2","4","6","8","Blue","Green"],general_knowledge:["8","12","24","48","100","Jupiter"]};

function norm(s){return s.toLowerCase().trim().replace(/[^\w\s\u0590-\u05FF]/g,"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");}
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));return d[m][n];}
function fuzz(i,c){const a=norm(i),b=norm(c);if(a===b)return true;if(a.includes(b)||b.includes(a))return true;return lev(a,b)<=(b.length<=8?2:3);}
function genDecoy(q,ex){const bk=DECOYS[q.category]||DECOYS.general_knowledge;const ne=ex.map(norm);const av=bk.filter(d=>!ne.some(e=>fuzz(d,e)));return av.length?av[Math.floor(Math.random()*av.length)]:"I don't know";}

export default function Bluffy(){
  const[lang,setLang]=useState("en");const[scr,setScr]=useState("home");const[pls,setPls]=useState([]);const[nn,setNn]=useState("");
  const[cfg,setCfg]=useState({time:30,rounds:10,cats:[...CATS]});const[gs,setGs]=useState(null);
  const[cpi,setCpi]=useState(0);const[vis,setVis]=useState(false);const[ci,setCi]=useState("");
  const[ans,setAns]=useState({});const[bi,setBi]=useState("");const[bpi,setBpi]=useState(null);
  const[pub,setPub]=useState({});const[opts,setOpts]=useState([]);const[rpi,setRpi]=useState(0);
  const[sel,setSel]=useState({});const[rr,setRr]=useState(null);const[used,setUsed]=useState(new Set());
  const[catOps,setCatOps]=useState([]);
  const t=T[lang];const he=lang==="he";

  const addP=()=>{if(nn.trim()&&pls.length<5){setPls([...pls,{name:nn.trim(),score:0,isAdmin:pls.length===0}]);setNn("");}};
  const remP=(i)=>{const n=pls.filter((_,j)=>j!==i);if(n.length>0&&!n.some(p=>p.isAdmin))n[0].isAdmin=true;setPls(n);};
  const togCat=(c)=>setCfg(s=>({...s,cats:s.cats.includes(c)?s.cats.filter(x=>x!==c):[...s.cats,c]}));
  const startG=()=>{if(pls.length<2||cfg.cats.length===0)return;setGs({round:1,turn:0});setUsed(new Set());setPls(p=>p.map(x=>({...x,score:0})));setScr("catSel");};

  useEffect(()=>{if(scr==="catSel"){const s=[...cfg.cats].sort(()=>Math.random()-0.5);setCatOps(s.slice(0,Math.min(8,s.length)));}},[scr,gs?.round]);

  const selCat=(cat)=>{const av=QUESTIONS.filter(q=>q.category===cat&&!used.has(q.id));const pool=av.length?av:QUESTIONS.filter(q=>q.category===cat);const q=pool[Math.floor(Math.random()*pool.length)];setUsed(p=>new Set([...p,q.id]));setGs(g=>({...g,q,cat}));setAns({});setPub({});setSel({});setCpi(0);setVis(false);setCi("");setBpi(null);setScr("q");};

  const subAns=()=>{if(!ci.trim())return;const q=gs.q;const ok=fuzz(ci,q.answer_en)||fuzz(ci,q.answer_he);const na={...ans,[cpi]:{text:ci.trim(),ok}};setAns(na);setCi("");setVis(false);if(ok){setBpi(cpi);setBi("");setScr("bluff");}else{const np={...pub,[cpi]:ci.trim()};setPub(np);nxt(na,np);}};
  const subBluff=()=>{if(!bi.trim())return;const q=gs.q;if(fuzz(bi,q.answer_en)||fuzz(bi,q.answer_he))return;const np={...pub,[bpi]:bi.trim()};setPub(np);setBpi(null);setScr("q");nxt(ans,np);};
  const autoBluff=()=>{const q=gs.q;const d=genDecoy(q,[...Object.values(pub),q.answer_en]);const np={...pub,[bpi]:d};setPub(np);setBpi(null);setScr("q");nxt(ans,np);};
  const nxt=(ca,cp)=>{const n=Object.keys(ca).length;if(n>=pls.length)prepReveal(ca,cp);else setCpi(n);};

  const prepReveal=(aa,ap)=>{const q=gs.q;const ca=he?q.answer_he:q.answer_en;const os=[{text:ca,ok:true,ai:-1,an:null}];const seen=new Set([norm(ca)]);
  Object.entries(ap).forEach(([i,txt])=>{const n=norm(txt);if(!seen.has(n)&&!fuzz(txt,q.answer_en)&&!fuzz(txt,q.answer_he)){os.push({text:txt,ok:false,ai:parseInt(i),an:pls[parseInt(i)]?.name});seen.add(n);}});
  while(os.length<3){const ex=os.map(o=>o.text);const d=genDecoy(q,ex);if(!seen.has(norm(d))){os.push({text:d,ok:false,ai:-2,an:t.auto});seen.add(norm(d));}else break;}
  setOpts(os.sort(()=>Math.random()-0.5));setRpi(0);setSel({});setVis(false);setScr("reveal");};

  const revSel=(oi)=>{const ns={...sel,[rpi]:oi};setSel(ns);if(Object.keys(ns).length>=pls.length)setTimeout(()=>calc(ns),500);else setTimeout(()=>{setRpi(Object.keys(ns).length);setVis(false);},300);};

  const calc=(as)=>{const q=gs.q;const ca=he?q.answer_he:q.answer_en;const res={};const np=[...pls];
  pls.forEach((_,i)=>{res[i]={e:0,sel:opts[as[i]],fb:[],sf:false};});
  pls.forEach((_,i)=>{if(opts[as[i]]?.ok){res[i].e+=2;np[i]={...np[i],score:np[i].score+2};}});
  pls.forEach((_,i)=>{const s=opts[as[i]];if(!s?.ok&&s?.ai>=0){if(s.ai===i){res[i].sf=true;}else{res[s.ai].e+=1;res[s.ai].fb.push(i);np[s.ai]={...np[s.ai],score:np[s.ai].score+1};}}});
  setPls(np);setRr({res,ca,q});setScr("post");};

  const nxtRound=()=>{if(gs.round>=cfg.rounds){setScr("over");return;}setGs(g=>({...g,round:g.round+1,turn:(g.turn+1)%pls.length}));setScr("catSel");};

  const FI=({c})=>{const u=getFlagUrl(c);return u?<img src={u} alt={c} style={{width:160,height:100,objectFit:"cover",borderRadius:8,border:"2px solid rgba(255,255,255,0.2)",margin:"12px auto",display:"block"}} onError={e=>{e.target.style.display="none"}}/>:null;};
  const RB=()=><div style={{textAlign:"center",marginBottom:16}}><span style={{background:"rgba(255,215,0,0.1)",color:"#FFD700",padding:"6px 20px",borderRadius:20,fontSize:13,fontWeight:700,border:"1px solid rgba(255,215,0,0.2)"}}>{t.round} {gs?.round} {t.of} {cfg.rounds}</span></div>;
  const QT=()=>{const q=gs?.q;if(!q)return"";if(q.flag_country)return he?t.whichCountry:t.whichCountry;return he?q.question_he:q.question_en;};

  const S={b:{border:"none",cursor:"pointer",transition:"all 0.2s"},i:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 16px",color:"#fff",fontSize:16,outline:"none"},c:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px 20px"},st:{width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}};

  // ════════ HOME ════════
  if(scr==="home")return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",padding:20}}>
    <style>{`@keyframes f{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button{font-family:inherit;border:none;cursor:pointer;transition:all .2s}button:hover{filter:brightness(1.1)}input{font-family:inherit}input:focus{outline:none;border-color:rgba(192,132,252,.5)!important}`}</style>
    <div style={{fontSize:100,marginBottom:8,filter:"drop-shadow(0 0 30px rgba(255,215,0,.3))",animation:"f 3s ease-in-out infinite"}}>🃏</div>
    <h1 style={{fontSize:64,fontWeight:900,margin:0,background:"linear-gradient(135deg,#FFD700,#FF6B6B,#C084FC)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Trebuchet MS',sans-serif"}}>{t.appName}</h1>
    <p style={{color:"rgba(255,255,255,.6)",fontSize:18,marginTop:4,marginBottom:40,fontStyle:"italic"}}>{t.tagline}</p>
    <button onClick={()=>setScr("lobby")} style={{...S.b,background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:20,fontWeight:800,padding:"18px 60px",borderRadius:16,width:280,boxShadow:"0 8px 32px rgba(255,215,0,.3)"}}>{t.createGame}</button>
    <div style={{display:"flex",gap:12,marginTop:24,background:"rgba(255,255,255,.08)",borderRadius:12,padding:6}}>
      {[["en","EN"],["he","עב"]].map(([l,lb])=><button key={l} onClick={()=>setLang(l)} style={{...S.b,padding:"8px 16px",borderRadius:8,fontSize:14,fontWeight:700,background:lang===l?"rgba(255,215,0,.3)":"transparent",color:lang===l?"#FFD700":"rgba(255,255,255,.5)"}}>{lb}</button>)}
    </div>
  </div>);

  // ════════ LOBBY ════════
  if(scr==="lobby")return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1a3e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:24}}><span style={{fontSize:48}}>🃏</span><h2 style={{color:"#FFD700",fontSize:28,margin:"8px 0 0"}}>{t.appName}</h2></div>
    <div style={{...S.c,marginBottom:16}}>
      <h3 style={{color:"#C084FC",margin:"0 0 12px",fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.players} ({pls.length}/5)</h3>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={nn} onChange={e=>setNn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addP()} placeholder={t.enterName} maxLength={15} style={{...S.i,flex:1}}/>
        <button onClick={addP} disabled={!nn.trim()||pls.length>=5} style={{...S.b,background:nn.trim()?"linear-gradient(135deg,#C084FC,#818CF8)":"#333",color:"#fff",padding:"10px 16px",borderRadius:10,fontSize:14,fontWeight:600,opacity:nn.trim()?1:.4}}>{t.addPlayer}</button>
      </div>
      {pls.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(255,255,255,.05)",borderRadius:10,marginBottom:6,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>{EMO[i]}</span><span style={{color:"#fff",fontWeight:600}}>{p.name}</span>
          {p.isAdmin&&<span style={{background:"rgba(255,215,0,.2)",color:"#FFD700",fontSize:10,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{t.admin}</span>}
        </div>
        <div style={{display:"flex",gap:4}}>
          {pls[0]?.isAdmin&&!p.isAdmin&&<button onClick={()=>remP(i)} style={{...S.b,background:"rgba(255,59,48,.2)",color:"#FF3B30",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600}}>{t.kick}</button>}
          {!p.isAdmin&&<button onClick={()=>remP(i)} style={{...S.b,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",borderRadius:8,padding:"4px 10px",fontSize:11}}>{t.leave}</button>}
        </div>
      </div>)}
    </div>
    <div style={{...S.c,marginBottom:16}}>
      <h3 style={{color:"#C084FC",margin:"0 0 12px",fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.settings}</h3>
      {[[t.timePerQ,"time",10,120,10,t.seconds],[t.numRounds,"rounds",1,20,1,""]].map(([label,key,min,max,step,suffix])=>
        <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{color:"rgba(255,255,255,.7)",fontSize:14}}>{label}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setCfg(s=>({...s,[key]:Math.max(min,s[key]-step)}))} style={S.st}>−</button>
            <span style={{color:"#FFD700",fontWeight:800,fontSize:20,minWidth:40,textAlign:"center"}}>{cfg[key]}</span>
            <button onClick={()=>setCfg(s=>({...s,[key]:Math.min(max,s[key]+step)}))} style={S.st}>+</button>
            {suffix&&<span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>{suffix}</span>}
          </div>
        </div>
      )}
    </div>
    <div style={{...S.c,marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{color:"#C084FC",margin:0,fontSize:14,textTransform:"uppercase",letterSpacing:2}}>{t.categories}</h3>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setCfg(s=>({...s,cats:[...CATS]}))} style={{...S.b,background:"none",color:"#4ade80",fontSize:12,padding:"2px 8px",fontWeight:600}}>{t.selectAll}</button>
          <button onClick={()=>setCfg(s=>({...s,cats:[]}))} style={{...S.b,background:"none",color:"#f87171",fontSize:12,padding:"2px 8px",fontWeight:600}}>{t.deselectAll}</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {CATS.map(c=>{const a=cfg.cats.includes(c);return<button key={c} onClick={()=>togCat(c)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:a?"rgba(192,132,252,.15)":"rgba(255,255,255,.03)",border:a?"1px solid rgba(192,132,252,.4)":"1px solid rgba(255,255,255,.06)",borderRadius:10,...S.b}}>
          <span style={{fontSize:18}}>{ICONS[c]}</span><span style={{color:a?"#C084FC":"rgba(255,255,255,.4)",fontSize:13,fontWeight:a?600:400}}>{t[c]}</span>
        </button>;})}
      </div>
    </div>
    <button onClick={startG} disabled={pls.length<2||cfg.cats.length===0} style={{...S.b,width:"100%",background:pls.length>=2&&cfg.cats.length>0?"linear-gradient(135deg,#FFD700,#FFA500)":"#333",color:"#1a1a2e",fontSize:20,fontWeight:800,padding:"18px 0",borderRadius:16,opacity:pls.length>=2&&cfg.cats.length>0?1:.4}}>
      {pls.length<2?t.minPlayers:cfg.cats.length===0?t.noCategories:t.startGame}
    </button>
  </div></div>);

  // ════════ CATEGORY SELECT ════════
  if(scr==="catSel"){const tp=pls[gs?.turn||0];return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1a3e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
    <RB/><span style={{fontSize:40}}>👆</span>
    <p style={{color:"#FFD700",fontSize:20,fontWeight:700,margin:"8px 0"}}>{tp?.name}{t.yourTurn}</p>
    <p style={{color:"rgba(255,255,255,.5)",fontSize:14,marginBottom:20}}>{t.pickCategory}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {catOps.map(c=><button key={c} onClick={()=>selCat(c)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:"24px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,...S.b}}>
        <span style={{fontSize:36}}>{ICONS[c]}</span><span style={{color:"#fff",fontSize:14,fontWeight:600}}>{t[c]}</span>
      </button>)}
    </div>
  </div></div>);}

  // ════════ QUESTION ════════
  if(scr==="q"){const q=gs?.q;const cp=pls[cpi];const done=Object.keys(ans).length>=pls.length;return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1a3e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <RB/>
    <div style={{...S.c,marginBottom:20,textAlign:"center",borderColor:"rgba(255,215,0,.2)"}}>
      <span style={{fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2}}>{t[q?.category]} • {q?.difficulty}</span>
      {q?.flag_country&&<FI c={q.flag_country}/>}
      <p style={{color:"#fff",fontSize:20,fontWeight:700,margin:"12px 0 0",lineHeight:1.4}}>{QT()}</p>
    </div>
    {!done&&<div style={{...S.c,textAlign:"center"}}>
      {!vis?<><div style={{fontSize:48,marginBottom:8}}>{EMO[cpi]}</div>
        <p style={{color:"#FFD700",fontSize:18,fontWeight:700,margin:"0 0 4px"}}>{t.passTo}</p>
        <p style={{color:"#fff",fontSize:24,fontWeight:800,margin:"0 0 16px"}}>{cp?.name}</p>
        <button onClick={()=>setVis(true)} style={{...S.b,background:"linear-gradient(135deg,#C084FC,#818CF8)",color:"#fff",padding:"14px 40px",borderRadius:12,fontSize:16,fontWeight:700}}>{t.tapToReveal}</button>
      </>:<>
        <p style={{color:"#C084FC",fontSize:14,fontWeight:600,margin:"0 0 12px"}}>{cp?.name}</p>
        <input value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&subAns()} placeholder={t.typeAnswer} style={{...S.i,width:"100%",textAlign:"center",fontSize:18,marginBottom:12}} autoFocus/>
        <button onClick={subAns} disabled={!ci.trim()} style={{...S.b,background:ci.trim()?"linear-gradient(135deg,#4ade80,#22c55e)":"#333",color:"#fff",padding:"12px 40px",borderRadius:12,fontSize:16,fontWeight:700,opacity:ci.trim()?1:.4}}>{t.submit}</button>
      </>}
    </div>}
    <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
      {pls.map((p,i)=><div key={i} style={{width:40,height:40,borderRadius:12,background:ans[i]?"rgba(74,222,128,.2)":"rgba(255,255,255,.05)",border:ans[i]?"1px solid rgba(74,222,128,.4)":"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{ans[i]?"✓":EMO[i]}</div>)}
    </div>
  </div></div>);}

  // ════════ BLUFF ════════
  if(scr==="bluff"){const cp=pls[bpi];return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#1a0a2e,#2d1b4e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto",textAlign:"center"}}>
    <div style={{fontSize:64,marginBottom:8}}>🎭</div>
    <div style={{...S.c,borderColor:"rgba(255,215,0,.3)",background:"rgba(255,215,0,.05)"}}>
      <p style={{color:"#FFD700",fontSize:14,fontWeight:600,margin:"0 0 4px"}}>{cp?.name}</p>
      <p style={{color:"#fff",fontSize:16,lineHeight:1.5,margin:"0 0 16px"}}>{t.correctBluff}</p>
      <input value={bi} onChange={e=>setBi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&subBluff()} placeholder={t.typeBluff} style={{...S.i,width:"100%",textAlign:"center",fontSize:18,marginBottom:12}} autoFocus/>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button onClick={subBluff} disabled={!bi.trim()} style={{...S.b,background:bi.trim()?"linear-gradient(135deg,#FFD700,#FFA500)":"#333",color:"#1a1a2e",padding:"12px 32px",borderRadius:12,fontSize:16,fontWeight:700,opacity:bi.trim()?1:.4}}>{t.submitBluff}</button>
        <button onClick={autoBluff} style={{...S.b,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",padding:"12px 24px",borderRadius:12,fontSize:14}}>{t.skip}</button>
      </div>
    </div>
  </div></div>);}

  // ════════ REVEAL ════════
  if(scr==="reveal"){const q=gs?.q;const cp=pls[rpi];const done=Object.keys(sel).length>=pls.length;return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1a3e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <RB/>
    <div style={{...S.c,marginBottom:16,textAlign:"center",borderColor:"rgba(255,215,0,.2)"}}>
      {q?.flag_country&&<FI c={q.flag_country}/>}
      <p style={{color:"#fff",fontSize:18,fontWeight:700,margin:0,lineHeight:1.4}}>{QT()}</p>
    </div>
    {!done&&!vis?<div style={{...S.c,textAlign:"center"}}>
      <p style={{color:"#FFD700",fontSize:16,margin:"0 0 4px"}}>{t.passTo}</p>
      <p style={{color:"#fff",fontSize:22,fontWeight:800,margin:"0 0 12px"}}>{cp?.name}</p>
      <button onClick={()=>setVis(true)} style={{...S.b,background:"linear-gradient(135deg,#C084FC,#818CF8)",color:"#fff",padding:"12px 36px",borderRadius:12,fontSize:16,fontWeight:700}}>{t.chooseAnswer}</button>
    </div>:!done?<div>
      <p style={{textAlign:"center",color:"#C084FC",fontSize:14,fontWeight:600,marginBottom:12}}>{cp?.name} — {t.chooseAnswer}</p>
      {opts.map((o,i)=><button key={i} onClick={()=>revSel(i)} style={{display:"block",width:"100%",padding:"16px 20px",marginBottom:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,textAlign:he?"right":"left",...S.b}}>
        <span style={{color:"#fff",fontSize:17,fontWeight:600}}>{o.text}</span>
      </button>)}
    </div>:null}
  </div></div>);}

  // ════════ POST ROUND ════════
  if(scr==="post"){const sorted=[...pls].sort((a,b)=>b.score-a.score);return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#1a1a3e)",padding:20,direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,margin:"0 auto"}}>
    <RB/>
    <div style={{...S.c,marginBottom:16,textAlign:"center",borderColor:"rgba(74,222,128,.3)",background:"rgba(74,222,128,.05)"}}>
      <span style={{fontSize:12,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:2}}>{t.correct}</span>
      {rr?.q?.flag_country&&<FI c={rr.q.flag_country}/>}
      <p style={{color:"#4ade80",fontSize:24,fontWeight:800,margin:"8px 0"}}>{rr?.ca}</p>
    </div>
    {/* Player results */}
    {pls.map((p,i)=>{const r=rr?.res[i];const pk=r?.sel;return<div key={i} style={{...S.c,marginBottom:8,padding:"12px 16px",borderColor:r?.e>0?"rgba(255,215,0,.2)":"rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
          <span style={{fontSize:24}}>{EMO[i]}</span>
          <div style={{minWidth:0}}>
            <p style={{color:"#fff",fontWeight:700,margin:0,fontSize:15}}>{p.name}</p>
            <p style={{color:pk?.ok?"#4ade80":"#f87171",fontSize:12,margin:"2px 0 0"}}>
              {pk?.ok?"✓ ":"✗ "}{pk?.text}
              {r?.sf&&<span style={{color:"#FFA500",marginInlineStart:6}}>({t.selfFool})</span>}
            </p>
            {!pk?.ok&&pk?.ai>=0&&pk?.an&&<p style={{color:"rgba(255,255,255,.3)",fontSize:11,margin:"1px 0 0"}}>{t.wroteBy} {pk.an}</p>}
            {r?.fb.length>0&&<p style={{color:"#C084FC",fontSize:11,margin:"2px 0 0"}}>{t.fooled} {r.fb.length}: {r.fb.map(fi=>pls[fi]?.name).join(", ")}</p>}
          </div>
        </div>
        <span style={{color:r?.e>0?"#FFD700":"rgba(255,255,255,.3)",fontSize:24,fontWeight:900,minWidth:50,textAlign:"center"}}>+{r?.e||0}</span>
      </div>
    </div>;})}
    {/* All answers table */}
    <div style={{...S.c,marginTop:12,marginBottom:16}}>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:12,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>{t.allAnswers}</p>
      {opts.map((o,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<opts.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <span style={{color:o.ok?"#4ade80":"#fff",fontWeight:o.ok?700:400,fontSize:14}}>{o.ok?"✓ ":""}{o.text}</span>
        <span style={{color:"rgba(255,255,255,.3)",fontSize:11}}>{o.ok?t.correct:o.ai>=0?o.an:o.ai===-2?t.auto:""}</span>
      </div>)}
    </div>
    {/* Scoreboard */}
    <div style={{...S.c,marginBottom:20}}>
      <h3 style={{color:"#FFD700",margin:"0 0 12px",fontSize:16,textAlign:"center"}}>{t.scoreboard}</h3>
      {sorted.map((p,i)=><div key={p.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:i===0?"rgba(255,215,0,.08)":"transparent",borderRadius:10,marginBottom:4}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:i===0?"#FFD700":i===1?"#C0C0C0":"#CD7F32",fontWeight:800,fontSize:18,minWidth:24}}>#{i+1}</span>
          <span style={{color:"#fff",fontWeight:600}}>{p.name}</span>
        </div>
        <span style={{color:"#FFD700",fontWeight:800,fontSize:20}}>{p.score}</span>
      </div>)}
    </div>
    <button onClick={nxtRound} style={{...S.b,width:"100%",background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:18,fontWeight:800,padding:"16px 0",borderRadius:14,boxShadow:"0 8px 32px rgba(255,215,0,.3)"}}>
      {gs.round>=cfg.rounds?t.gameOver:t.nextRound}
    </button>
  </div></div>);}

  // ════════ GAME OVER ════════
  if(scr==="over"){const sorted=[...pls].sort((a,b)=>b.score-a.score);const w=sorted[0];return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0f0c29,#302b63,#24243e)",padding:20,display:"flex",alignItems:"center",justifyContent:"center",direction:he?"rtl":"ltr"}}><div style={{maxWidth:500,width:"100%",textAlign:"center"}}>
    <div style={{fontSize:80,marginBottom:8,animation:"f 2s ease-in-out infinite"}}>🏆</div>
    <h1 style={{color:"#FFD700",fontSize:36,fontWeight:900,margin:"0 0 4px"}}>{t.gameOver}</h1>
    <div style={{...S.c,margin:"20px 0",borderColor:"rgba(255,215,0,.3)",background:"rgba(255,215,0,.05)",padding:24}}>
      <div style={{fontSize:56}}>👑</div>
      <p style={{color:"#FFD700",fontSize:28,fontWeight:900,margin:"0 0 4px"}}>{w?.name}</p>
      <p style={{color:"#fff",fontSize:36,fontWeight:900}}>{w?.score} {t.points}</p>
    </div>
    {sorted.slice(1).map((p,i)=><div key={p.name} style={{...S.c,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:i===0?"#C0C0C0":"#CD7F32",fontWeight:800,fontSize:20}}>#{i+2}</span>
        <span style={{color:"#fff",fontWeight:600}}>{p.name}</span>
      </div>
      <span style={{color:"rgba(255,255,255,.7)",fontWeight:800,fontSize:20}}>{p.score} {t.points}</span>
    </div>)}
    <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"center"}}>
      <button onClick={()=>{setScr("lobby");setPls(p=>p.map(x=>({...x,score:0})));}} style={{...S.b,background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#1a1a2e",fontSize:16,fontWeight:700,padding:"14px 32px",borderRadius:14}}>{t.playAgain}</button>
      <button onClick={()=>{setScr("home");setPls([]);}} style={{...S.b,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:16,padding:"14px 32px",borderRadius:14}}>{t.backToMenu}</button>
    </div>
  </div></div>);}
  return null;
}