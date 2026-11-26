# Kelukis (kelukis.lt): naujo tinklapio dizaino demo

Statinė HTML/CSS/JS demonstracinė versija naujai **UAB „Kelukis“** svetainei. Galutinė platforma: **WordPress + XStore** (Elementor). Demo skirtas parodyti dizainą ir judesį, turinio valdymo nėra: formos niekur nesiunčia, kalbų jungiklis ir teisiniai puslapiai rodo pranešimą.

Senoji svetainė kelukis.lt neveikia (interneto archyve nuo 2024 m. yra tik „Coming soon“ vaizdas su logotipu ir kontaktais), todėl turinys surinktas iš viešų šaltinių. Nuotraukos ir video: **Pexels** (sąrašas `docs/pexels-credits.md`).

## Peržiūra

- **Gyva versija:** <https://arvydastry.github.io/kelukis/> („GitHub Pages“ iš saugyklos <https://github.com/arvydastry/kelukis> `main` šakos šaknies; failas `.nojekyll` išjungia „Jekyll“). Tiesioginės nuorodos: [paslaugos](https://arvydastry.github.io/kelukis/paslaugos.html), [karjera](https://arvydastry.github.io/kelukis/karjera.html), [kontaktai](https://arvydastry.github.io/kelukis/kontaktai.html).
- Atnaujinimas: `python3 build.py`, tada `git add -A`, `git commit` ir `git push`. „Pages“ persigeneruoja maždaug per minutę.
- Vietoje: `python3 serve.py` ir atverti <http://localhost:8181/> (`.claude/launch.json` konfigūracija `kelukis`). Veikia ir tiesiog atidarius `index.html` iš disko.
- Po šablonų ar duomenų pakeitimų: `python3 build.py` (tik standartinė Python biblioteka).
- `?static=1` prie adreso išjungia judesį ir video (patogu ekrano nuotraukoms). Esant `prefers-reduced-motion` judesys išsijungia automatiškai.
- Puslapiai turi `noindex, nofollow`. Prieš tikrą paleidimą žymą išimti.

| Puslapis | Ką rodo |
|---|---|
| `index.html` | Pradžia: hero su video, skaičiai, apie įmonę, paslaugos, maršrutų žemėlapis, autoparkas, skaičių plytelės, procesas, karjera, užklausa |
| `paslaugos.html` | Keturios paslaugos su video, parametrais ir užklausos mygtukais (`#tentiniai-pervezimai` ir kt.), puspriekabių palyginimo lentelė |
| `karjera.html` | Vairuotojams ir biuro komandai, kadencijos, privalumai, darbo pasiūlymai (`#pozicijos`), anketos forma (`#forma`) |
| `kontaktai.html` | Kontaktų kortelės, užklausos forma, darbo laikas, rekvizitai su kopijavimo mygtukais, nuoroda į žemėlapį |

## Ką pavyko sužinoti apie įmonę

| Faktas | Šaltinis |
|---|---|
| UAB „Kelukis“, įm. kodas 300089863, PVM LT100001492712, įregistruota 2005-02-21, vadovas Valerijus Asejevas | [rekvizitai.vz.lt](https://rekvizitai.vz.lt/imone/kelukis/), [imoniurekvizitai.lt](https://imoniurekvizitai.lt/imone/kelukis-300089863/) |
| Veikla: tarptautinis krovinių pervežimas ir ekspedijavimas Europoje (EVRK 49.41) | [cvbankas.lt](https://www.cvbankas.lt/kelukis-siulo-darba/4-28354), [lursoft.lv](https://www.lursoft.lv/en/companies/lt/company/uab-kelukis/300089863) |
| Bazė: Senasis Ukmergės kel. 4, Užubalių k., Vilniaus r.; registracijos adresas Laisvės pr. 117-58, Vilnius; darbo laikas I–V 8.00–17.00 | rekvizitai.vz.lt, [fsaskaita.lt](https://fsaskaita.lt/imone/uab-kelukis-300089863) |
| Tel. +370 5 273 6827, mob. +370 686 82093, kelukis@kelukis.lt | senojo kelukis.lt „Coming soon“ vaizdas (web.archive.org, 2026-04) |
| road@kelukis.lt krovinių užklausoms | [fretador.com](https://www.fretador.com/c/7331/UAB-Kelukis) |
| 249 darbuotojai (2026 m. lapkritis), 74 darbuotojai 2018 m. pabaigoje | rekvizitai.vz.lt, imoniurekvizitai.lt („Sodra“) |
| Pajamos: 2,6 mln. € (2015) → 18,9 mln. € (2025), grynasis pelnas 2025 m. 750 tūkst. € | imoniurekvizitai.lt, fsaskaita.lt (Registrų centras) |
| 162 transporto priemonės ir 145 priekabos; 153 N3 klasės vilkikai; per 12 mėn. parkas padidėjo 36 vnt.; markės DAF, „Volvo“, „Mercedes-Benz“, MAN, „Schmitz Cargobull“, „Kögel“ | rekvizitai.vz.lt (transportas), imoniurekvizitai.lt („Regitra“) |
| Vairuotojai dirba Vakarų Europoje (Vokietija, Prancūzija, Belgija) su tentinėmis puspriekabėmis, šaldytuvais ir jūriniais konteineriais, tik „Euro 6“ vilkikais, kadencijos 4/6/8 sav. | [dirba.lt](https://www.dirba.lt/paieska/kelukis) darbo skelbimai (2021–2023 m.) |
| Atvira pozicija: transporto priežiūros vadybininkas (-ė), 1 700–2 500 €/mėn. į rankas; privalumai biure | cvbankas.lt, dirba.lt (2026 m. lapkritis) |
| Kredito rizika žemiausia, skolų VMI ir „Sodrai“ nėra | rekvizitai.vz.lt, fsaskaita.lt (2026-11-25) |

Autovežių (automobilių pervežimo) veikla, kurią mini keli seni katalogai, nepasitvirtino: tokio turinio demo nėra.

## Kryptis

**Dizaino perskaitymas:** tarptautinis vežėjas, kurio svetainę skaito dvi auditorijos: krovinių užsakovai bei ekspeditoriai ir būsimi vairuotojai. Todėl pradžioje iš karto matomas veiksmas (užklausa), o karjera turi atskirą, lygiavertį puslapį. Pasitikėjimą kuria ne šūkiai, o vieši skaičiai.

| | Demo |
|---|---|
| Spalvos | iš tikro logotipo: tamsiai mėlyna `#2B2767` (tekstui ir tamsioms sekcijoms `#16143A`) ir raudona `#E42024`, naudojama tik akcentams. Fonai pasteliniai: `#F4F5FB`, `#E8EAF6`, `#D7DAF3`, `#FBE6E4`. Fonuose nėra tekstūrų |
| Šriftas | **Archivo** (kintamas storis ir plotis, statmenas ir kursyvas, po vieną `woff2` failą, lietuviški rašmenys viename faile). Antraštės platesnės (`font-stretch` 113–125 %), akcentiniai žodžiai kursyvu, kaip logotipo raidės |
| Logotipas | žodinis ženklas surinktas „Archivo Italic“ ir paverstas kreivėmis su horizontaliais „greičio“ pjūviais, raudonas smaigalys su keliu perpieštas pagal senojo puslapio vaizdą (`tools/brand.py`). **Prieš paleidimą reikia originalaus vektorinio logotipo.** |
| Forma | dideli apvalinti kampai (22–44 px), piliulės mygtukai su besisukančia rodykle, stiklo kortelės ant video |
| Hero | pilno ekrano video (autostrada prieblandoje iš drono), permatoma antraštė, greitos užklausos kortelė |

### Judesys ir gylis (GSAP 3.13 + ScrollTrigger + SplitText, Lenis sklandus slinkimas)

- **Įžanga ir perėjimai:** logotipo įžanga su eigos juosta (tik pirmą kartą per sesiją), tarp puslapių pakyla tamsiai mėlyna užuolaida.
- **Hero:** video, antraštė iškyla eilutėmis, sluoksniai juda pagal pelę (video, tekstas ir stiklo kortelė skirtingu greičiu, kortelė pasvyra 3D), slenkant video priartėja ir lėčiau nuslenka, o turinio lapas užslenka ant viršaus. Video stabdymo mygtukas.
- **Skaičiai:** prasisuka nuo nulio.
- **Kinetinė juosta:** žodžiai lėtai bėga pastoviu greičiu, nuo slinkimo nepriklauso (keičiamas tik `transform`, išdėstymas neperskaičiuojamas).
- **Apie:** žodžiai paryškėja slenkant, video ir nuotrauka juda skirtingu greičiu, besisukantis ženklas „Kelyje nuo 2005“.
- **Paslaugos:** keturi skydai, užvedus skydas išsiplečia ir paleidžia savo video.
- **Maršrutai:** taškinis Europos žemėlapis (canvas, 3,7 tūkst. taškų iš „Natural Earth“ duomenų) atsiskleidžia banga nuo Vilniaus, taškai reaguoja į pelę, užvedus ant šalies ji paryškėja; maršrutais teka brūkšniai ir juda taškai.
- **Autoparkas:** nupieštas vilkikas įvažiuoja slenkant, sukasi ratai, nusipiešia matmenų linijos; skirtukai keičia puspriekabę (tentinė, šaldytuvas, konteinerinė) ir perskaičiuoja parametrus.
- **Skaičių plytelės:** 3D pakreipimas su blizgesiu, auganti stulpelinė diagrama, darbuotojų kreivė, video plytelė.
- **Procesas:** kelias vingiuoja per sekciją, vilkikas važiuoja juo pagal slinkimą ir „uždega“ žingsnius. Vilkiką ekrane laiko `position: sticky` bėgis, JS nustato tik poslinkį į šoną ir pasukimą, todėl jis nedreba slenkant klaviatūra ar pirštu.
- **Karjera, užklausa:** video juostos su paralaksu, blokai priartėja slenkant, darbo skelbimo kortelė pasvyra.
- **Poraštė:** atsidengia iš po turinio, didelis žodinis ženklas iškyla paraidžiui.
- **Bendri:** permatoma antraštė virsta plaukiojančia stiklo juosta ir slepiasi slenkant žemyn, mega meniu su nuotraukomis, užklausos skydelis iš dešinės (greita forma perduoda duomenis), magnetiniai mygtukai, žymeklis su užrašu ant video, pranešimai.
- Video pradedami krauti maždaug per ekraną iki jų ir groja tik matomi; plakatas yra tikslus pirmasis kadras. Telefone skydai virsta akordeonu, kelias eina kairėje, žemėlapyje lieka pagrindiniai užrašai.

### Taisyklės, kad slenkant niekas netrūkčiotų

Šios taisyklės atsirado pataisius slinkimo trikdžius; perkeliant į XStore jų verta laikytis ir child temos kode.

- **Stiklo elementai (`backdrop-filter`) negali turėti tėvo su `opacity` < 1, `filter`, `clip-path` ar `mask`:** toks tėvas atkerta juos nuo fono ir suliejimas staiga dingsta. Todėl konteinerio, kuriame yra stiklo elementų, blukinti negalima.
- **Tekstas slenkant neanimuojamas kas kadrą** (nei poslinkis trupmeniniais pikseliais, nei skaidrumas): naršyklė raides tada perpiešia vis kitaip ir jos mirga. Hero tekstas tiesiog nuslenka kartu su puslapiu, o gylį kuria fonas (video juda lėčiau ir artėja). Slenkant nejudinami ir sluoksniai pagal pelę.
- **Užvedimo efektai, kuriuos valdo JS, reaguoja tik į tikrą pelės judesį** (`pointermove` ir `KL.realMove()`), ne į `pointerenter` ar `:hover`: slenkant puslapį po nejudančia pele naršyklė vis tiek siunčia „užvedimo“ įvykius, ir skydai, meniu ar žemėlapis keistųsi patys.
- **Elementas, kurio `transform` kas kadrą rašo GSAP, negali turėti CSS `transition` ant `transform`.**
- **Antraščių eilučių kaukės neturi `padding` ir neigiamų paraščių** (kirpimo riba praplečiama per `overflow-clip-margin`): kitaip suskaidyta antraštė būna kito aukščio ir turinys žemiau šokteli. Eilutės po animacijos lieka savo sluoksnyje (`force3D`), o paprastas tekstas grąžinamas tik pasikeitus lango pločiui.
- **Hero įžanga daroma per CSS `transition`, ne per `@keyframes` animaciją**, o stiklo elementų vienu metu ekrane kuo mažiau: bandymuose su animacija ir papildomais `backdrop-filter` sluoksniais antraštė retkarčiais mirktelėdavo.
- **Kas turi stovėti ekrane vietoje, laikoma per `position: sticky`, ne perstumiama skriptu prieš slinkimą.**

## Failai

```
build.py                 src/pages + src/partials -> *.html (į puslapį įdedamos tik panaudotos ikonos)
serve.py                 peržiūros serveris (8181)
src/pages/*.html         puslapių turinys (meta antraštėje)
src/partials/*.html      layout, header (mega meniu), footer, perdangos, formos, užklausos blokas
src/partials/truck.svg   vilkiko brėžinys su trimis puspriekabėmis
src/data/site.json       kontaktai, paslaugos, pajamų ir darbuotojų eilutės diagramoms
src/data/media.json      Pexels nuotraukų ir video sąrašas su autoriais
tools/media.py           medijos paruošimas: photos | videos | posters | credits
tools/map.py             taškinio žemėlapio generavimas -> assets/js/mapdata.js
tools/brand.py           logotipas kreivėmis ir ikonų rinkinys (Phosphor, MIT)
assets/css/style.css     dizaino sistema
assets/js/main.js        bendri komponentai; home.js pradžios puslapio sekcijoms
assets/js/vendor/        gsap, ScrollTrigger, SplitText, lenis (vietinės kopijos)
docs/pexels-credits.md   Pexels autoriai
```

Medija: video 19 MB (14 klipų, hero 2,5 MB kompiuteriui ir 0,55 MB telefonui), nuotraukos 1,4 MB (WebP), šriftai 0,28 MB. Visas projektas 21 MB.

## Perkėlimas į WordPress XStore

Kiekviena sekcija šablonuose turi komentarą su XStore arba Elementor atitikmeniu. Atitikmenys nurodyti pagal bendras XStore ir Elementor galimybes; konkrečių valdiklių pavadinimus reikia sutikrinti su įdiegta XStore Core versija.

| Demo blokas | XStore / Elementor | Pastabos |
|---|---|---|
| Antraštė (permatoma, lipni, slepiasi) | Header Builder: transparent + sticky | Stiklo juosta ir slėpimas slenkant: child temos CSS ir kelios JS eilutės |
| Mega meniu su nuotraukomis | XStore Mega Menu (Static Block) | Keturios paslaugos su miniatiūromis |
| Kalbos LT / EN / DE / RU | WPML arba Polylang | Demo tik lietuviškai |
| Hero su video ir greita užklausa | Elementor sekcija su fono video, Heading, Contact Form 7 | Gylis pagal pelę ir paralaksas: child temos GSAP |
| Skaičiai | Animated Counter / Elementor Counter | Savaime |
| Kinetinė juosta | XStore Marquee (Scrolling Text) | Savaime |
| Apie įmonę | Text Editor, Image, Video su Motion Effects | Žodžių paryškinimas slenkant: child temos GSAP |
| Paslaugų skydai | Banner arba Image Accordion tipo blokas | Išsiplėtimas ir video paleidimas: child temos CSS ir JS |
| Maršrutų žemėlapis | nėra standartinio | Child temos modulis (canvas + SVG). Paprastesnis variantas: XStore Hotspot ant žemėlapio paveikslėlio |
| Vilkiko brėžinys su skirtukais | Elementor Tabs + SVG | Įvažiavimas ir ratai: child temos GSAP ScrollTrigger |
| Skaičių plytelės | Elementor konteineriai (CSS Grid), Icon Box, Counter, fono video | Diagrama: paprastas HTML sąrašas su CSS; pakreipimas: child temos JS |
| Procesas (kelias) | XStore Vertical Timeline | Važiuojantis vilkikas: child temos JS |
| Karjeros juosta, užklausos blokas | Sekcija su fono video, Icon List, Call to Action, Contact Form 7 | Savaime |
| Užklausos skydelis | XStore Off-Canvas arba Modal Popup + Contact Form 7 | Greitos formos reikšmės perduodamos JS |
| Darbo pasiūlymai | Toggle (Accordion); pozicijos kaip atskiras įrašų tipas | Kad klientas galėtų pats pridėti skelbimą |
| Paslaugų puslapis | Elementor šablonas su lipnia medijos kolona ir lentele | Lipni vidinė navigacija: Nav Menu su sticky |
| Poraštė | Footer Builder / Static Block | Atsidengimas iš po turinio: `position: sticky` child temoje |
| Perėjimai tarp puslapių, įžanga | nėra standartinio | Child temos JS, galima išjungti |

## Ką reikia patvirtinti su klientu

- **Logotipas:** gauti originalų vektorinį failą. Demo ženklas perpieštas iš mažos raiškos vaizdo.
- **Paslaugų sąrašas:** tentai, šaldytuvai ir konteineriai paimti iš 2021–2023 m. darbo skelbimų, ekspedijavimas iš įmonės aprašymo. Ar visos keturios kryptys aktualios šiandien ir ar yra kitų (daliniai kroviniai, ADR, negabaritai)?
- **Šalys ir maršrutai:** patvirtintos Vokietija, Prancūzija, Belgija. Miestai žemėlapyje parinkti iliustracijai.
- **Puspriekabių parametrai:** įrašyti tipiniai (13,6 m, 24 t, 33 europaletės ir t. t.), reikia tikrų.
- **Skaičiai:** ar klientas nori viešinti pajamas, darbuotojų skaičių ir kredito rizikos įvertinimą. Vilkikų skaičius (153) paimtas iš „Regitros“ N3 klasės duomenų, „visi Euro 6“ iš darbo skelbimo.
- **Bendrijos licencija iki 2035 m.:** paimta iš „Okredo“ santraukos, tiesiogiai nepatikrinta.
- **Karjera:** kadencijos, „į kadenciją veža įmonės transportas“ ir vairuotojų bei logistikos pozicijos paimtos iš senesnių skelbimų; „+58 nauji kolegos per 2026 m.“ apskaičiuota iš „Sodros“ duomenų. Aktuali tik transporto priežiūros vadybininko pozicija.
- **Kontaktai:** kuris el. paštas kam skirtas, ar rodyti vadovo pavardę, ar reikia skyrių kontaktų (ekspedijavimas, personalas, buhalterija).
- **Tekstai, kuriuos parašiau pats:** šūkis „Jūsų kroviniai. Visi Europos keliai.“, „Apie įmonę“ pastraipa, trijų ramsčių ir proceso žingsnių aprašymai, paslaugų aprašymai.
- **Medija:** visos nuotraukos ir video yra iš Pexels. Tikri „Kelukio“ vilkikai, bazė ir žmonės atrodytų daug stipriau.

## Prieš tikrą paleidimą

- Išimti `noindex`, pridėti privatumo politiką ir slapukų pranešimą.
- Prijungti formas (Contact Form 7 arba WPForms) ir SMTP.
- Paruošti EN, DE ir RU versijas.
- Pakeisti Pexels mediją tikra, kur įmanoma.
