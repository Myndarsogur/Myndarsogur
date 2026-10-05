// Gagnagrunnur Myndarsagna. Allar sögur sem birtast í hillunni (carousel-inu) á forsíðunni og opnast í lesaranum (/lesa/).
// Röðin hér er röðin í hillunni. Ný saga = ný færsla hér; enginn annar kóði þarf að breytast.
//
// HVAR SKRÁRNAR ERU GEYMDAR
//   Nýjar sögur:  sogur/<id>/<mál>/1.avif, 2.avif, 3.avif …   (t.d. sogur/hafid/is/1.avif)
//                 sogur/<id>/forsida.avif                      (valfrjálst, sjá „forsíða“)
//   Eldri sögur liggja áfram þar sem þær voru; „myndir“ vísar á þær svo ekkert þurfi að flytja.
//
// HVER SAGA
//   id          – stutt nafn án bila, notað í slóðinni: myndarsogur.is/lesa/?saga=<id>
//   titill      – nafnið. Má vera eftir tungumálum: {is:'Hafið', en:'The Sea'}
//   blaðsíður   – fjöldi blaðsíðna. Má vera eftir tungumálum: {is:44, en:42}
//   mál         – (valfrjálst) tungumál sögunnar, t.d. ['is','en']. Sjálfgefið ['is'].
//                 Ef þau eru fleiri en eitt birtist málval í horninu á lesaranum.
//   myndir      – (valfrjálst) hvar blaðsíðurnar eru. {id}, {mál} og {n} (blaðsíðunúmer) fyllast út.
//                 Sjálfgefið 'sogur/{id}/{mál}/{n}.avif'.
//   forsíða     – (valfrjálst) myndin í hillunni. Sjálfgefið blaðsíða 1 á fyrsta málinu.
//                 Hillan sýnir hana í hlutföllunum 3:4. Best: AVIF, a.m.k. 900×1200 px.
//   bakgrunnur  – litur skjásins í kringum blaðsíðuna á meðan lesið er.
//   litir       – (valfrjálst) annar litur á einstökum blaðsíðum: {is:{1:'#ff1900'}, en:{1:'#ffffff'}}
//   læst        – (valfrjálst) blaðsíður sem eru opnar; eftir það þarf lykilorð. Slepptu til að hafa allt opið.
//   tenglar     – (valfrjálst) hlekkir sem birtast þegar sögunni lýkur, t.d. á höfundasíðu eða leik.
//                 Textinn má vera eftir tungumálum: {texti:{is:'Höfundar', en:'Authors'}, slóð:'…'}
//   falin       – (valfrjálst) true felur söguna úr hillunni, t.d. á meðan hún er í vinnslu.

window.MYNDARSOGUR = {
 lykilorð: 'banani',
 netfang: 'myndarsogur@gmail.com',

 sögur: [
  {
   id: 'myndar',
   titill: 'Myndar',
   blaðsíður: 32,
   myndir: 'myndar/Adal/mynd{n}.avif',
   bakgrunnur: '#f61978',
   læst: 6,
   tenglar: [{texti: 'Höfundar', slóð: 'myndar/hofundar/'}],
  },
  {
   id: 'omyndar',
   titill: 'Ómyndar',
   blaðsíður: 36,
   myndir: 'omyndar/Adal/mynd{n}.avif',
   bakgrunnur: '#252424',
   læst: 6,
   tenglar: [{texti: 'Höfundar', slóð: 'omyndar/hofundar/'}],
  },
  {
   id: 'jola',
   titill: 'Jóla',
   blaðsíður: 28,
   myndir: 'jola/Adal/mynd{n}.avif',
   bakgrunnur: '#0e2433',
   læst: 6,
   tenglar: [{texti: 'Höfundar', slóð: 'jola/hofundar/'}],
  },
  {
   id: 'stora',
   titill: 'Stóra',
   blaðsíður: 196,
   myndir: 'stora/Adal/mynd{n}.avif',
   forsíða: 'stora/forsida.avif',
   bakgrunnur: '#d5cc1a',
   læst: 12,
   tenglar: [{texti: 'Höfundar', slóð: 'stora/hofundar/'}],
  },
  {
   id: 'iskoinn',
   titill: 'Í skóinn',
   blaðsíður: 60,
   myndir: 'iskoinn/lesa/is/Bls{n}.avif',
   bakgrunnur: '#16dcf2',
   læst: 5,
   tenglar: [{texti: 'Höfundar', slóð: 'hofundar/'}, {texti: 'Jólaleikurinn', slóð: 'Jolaleikur/'}],
  },
  {
   id: 'meindarsogur',
   titill: 'Meindarsögur',
   mál: ['is', 'en'],
   blaðsíður: 44,
   myndir: 'Meindarsogur/lesa/{mál}/mynd{n}.avif',
   bakgrunnur: '#0b0b0b',
   litir: {is: {1: '#ec2c23'}, en: {1: '#ffffff', 44: '#ff1900'}},
   læst: 5,
   tenglar: [{texti: {is: 'Höfundar', en: 'Authors'}, slóð: 'Meindarsogur/hofundar/'}],
  },
 ],
};

// ---------- Hér fyrir neðan þarf ekki að breyta neinu ----------
(function(db){
 const eftirMáli=db.eftirMáli=(gildi,mál)=>gildi&&typeof gildi==='object'?(gildi[mál]??Object.values(gildi)[0]):gildi;
 db.hilla=()=>db.sögur.filter(s=>!s.falin);
 db.saga=id=>db.sögur.find(s=>s.id===id);
 db.málSögu=s=>s.mál?.length?s.mál:['is'];
 db.titill=(s,mál)=>eftirMáli(s.titill,mál);
 db.fjöldi=(s,mál)=>eftirMáli(s.blaðsíður,mál);
 db.slóð=(s,mál,n)=>(s.myndir||'sogur/{id}/{mál}/{n}.avif').replaceAll('{id}',s.id).replaceAll('{mál}',mál).replaceAll('{n}',n);
 db.forsíða=s=>s.forsíða||db.slóð(s,db.málSögu(s)[0],1);
 db.litur=(s,mál,n)=>s.litir?.[mál]?.[n]||s.bakgrunnur||'#1b1b1b';
})(window.MYNDARSOGUR);
