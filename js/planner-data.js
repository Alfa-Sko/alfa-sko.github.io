// Kjente hoteller per by i territoriet — brukes til forslag per overnatting.
// chain-feltet matcher verdiene i Min profil sine hotellkjede-piller.
const HOTELS_BY_CITY = {
  'Trondheim':[{name:'Scandic Nidelven',chain:'scandic'},{name:'Scandic Lerkendal',chain:'scandic'},{name:'Thon Hotel Prinsen',chain:'thon'},{name:'Clarion Hotel Trondheim',chain:'clarion'},{name:'Quality Hotel Augustin',chain:'quality'},{name:'Radisson Blu Royal Garden',chain:'radisson'},{name:'Comfort Hotel Park',chain:'comfort'},{name:'Britannia Hotel',chain:'annet'}],
  'Steinkjer':[{name:'Quality Hotel Grand Steinkjer',chain:'quality'}],
  'Levanger':[{name:'Thon Hotel Backlund',chain:'thon'}],
  'Stjørdalshalsen':[{name:'Scandic Hell',chain:'scandic'},{name:'Quality Airport Hotel Værnes',chain:'quality'}],
  'Stjørdal':[{name:'Scandic Hell',chain:'scandic'},{name:'Quality Airport Hotel Værnes',chain:'quality'}],
  'Namsos':[{name:'Scandic Rock City',chain:'scandic'},{name:'Tino Hotell Namsos',chain:'annet'}],
  'Rørvik':[{name:'Kysthotellet Rørvik',chain:'annet'}],
  'Oppdal':[{name:'Quality Hotel Skifer',chain:'quality'},{name:'Oppdal Turisthotell',chain:'annet'}],
  'Røros':[{name:'Røros Hotell',chain:'annet'},{name:'Bergstadens Hotel',chain:'annet'}],
  'Mo i Rana':[{name:'Scandic Meyergården',chain:'scandic'},{name:'Fjordgården Hotel Mo i Rana',chain:'annet'}],
  'Mosjøen':[{name:'Fru Haugans Hotel',chain:'annet'}],
  'Sandnessjøen':[{name:'Scandic Syv Søstre',chain:'scandic'}],
  'Brønnøysund':[{name:'Thon Hotel Brønnøysund',chain:'thon'},{name:'Corner Hotel',chain:'annet'}],
  'Bodø':[{name:'Scandic Havet',chain:'scandic'},{name:'Thon Hotel Nordlys',chain:'thon'},{name:'Radisson Blu Bodø',chain:'radisson'},{name:'Quality Hotel Ramsalt',chain:'quality'},{name:'Clarion Collection Hotel Grand',chain:'clarion'}],
  'Fauske':[{name:'Scandic Fauske',chain:'scandic'}],
  'Narvik':[{name:'Scandic Narvik',chain:'scandic'},{name:'Thon Hotel Narvik',chain:'thon'},{name:'Quality Hotel Grand Royal',chain:'quality'}],
  'Harstad':[{name:'Scandic Harstad',chain:'scandic'},{name:'Thon Hotel Harstad',chain:'thon'},{name:'Clarion Collection Hotel Arcticus',chain:'clarion'}],
  'Sortland':[{name:'Scandic Sortland',chain:'scandic'},{name:'Sortland Hotell',chain:'annet'}],
  'Stokmarknes':[{name:'Vesterålen Kysthotell',chain:'annet'}],
  'Svolvær':[{name:'Scandic Svolvær',chain:'scandic'},{name:'Thon Hotel Lofoten',chain:'thon'}],
  'Leknes':[{name:'Scandic Leknes Lofoten',chain:'scandic'}],
  'Finnsnes':[{name:'Finnsnes Hotell',chain:'annet'}],
  'Bardufoss':[{name:'Bardufoss Hotell',chain:'annet'}],
  'Setermoen':[{name:'Bardu Hotell',chain:'annet'}],
  'Tromsø':[{name:'Scandic Ishavshotel',chain:'scandic'},{name:'Scandic Grand Tromsø',chain:'scandic'},{name:'Thon Hotel Polar',chain:'thon'},{name:'Thon Hotel Tromsø',chain:'thon'},{name:'Clarion Hotel The Edge',chain:'clarion'},{name:'Radisson Blu Hotel Tromsø',chain:'radisson'},{name:'Quality Hotel Saga',chain:'quality'},{name:'Comfort Hotel Xpress Tromsø',chain:'comfort'}],
  'Storslett':[{name:'Reisafjord Hotel',chain:'annet'}],
  'Skjervøy':[{name:'Hotel Maritim Skjervøy',chain:'annet'}],
  'Alta':[{name:'Scandic Alta',chain:'scandic'},{name:'Thon Hotel Alta',chain:'thon'},{name:'Canyon Hotell',chain:'annet'}],
  'Hammerfest':[{name:'Scandic Hammerfest',chain:'scandic'},{name:'Thon Hotel Hammerfest',chain:'thon'}],
  'Lakselv':[{name:'Lakselv Hotell',chain:'annet'}],
  'Honningsvåg':[{name:'Scandic Honningsvåg',chain:'scandic'},{name:'The View Hotel',chain:'annet'}],
  'Kirkenes':[{name:'Scandic Kirkenes',chain:'scandic'},{name:'Thon Hotel Kirkenes',chain:'thon'}],
  'Vadsø':[{name:'Scandic Vadsø',chain:'scandic'}],
  'Vardø':[{name:'Vardø Hotel',chain:'annet'}],
  'Longyearbyen':[{name:'Radisson Blu Polar Hotel',chain:'radisson'},{name:'Funken Lodge',chain:'annet'},{name:'Svalbard Hotell The Vault',chain:'annet'}],
};
// Strekninger: tid (min), distanse (km), evt. ferge (selskap + URL til ruteoppslag)
// Tider og avstander basert på faktiske kjøreruter (Google Maps / visithelgeland.com).
const ROUTE_DATA = {
  // Trøndelag interne
  'Trondheim-Steinkjer':{min:90,km:125},
  'Trondheim-Namsos':{min:150,km:215},
  'Trondheim-Stjørdalshalsen':{min:30,km:35},
  'Trondheim-Levanger':{min:75,km:90},
  'Trondheim-Verdalsøra':{min:85,km:105},
  'Trondheim-Orkanger':{min:35,km:40},
  'Trondheim-Røros':{min:160,km:160},
  'Steinkjer-Namsos':{min:60,km:80},
  'Steinkjer-Levanger':{min:30,km:50},
  'Steinkjer-Verdalsøra':{min:25,km:35},
  'Levanger-Verdalsøra':{min:15,km:15},
  'Namsos-Verdalsøra':{min:90,km:120},
  // Trøndelag ↔ Nordland
  'Trondheim-Mo i Rana':{min:400,km:475},
  'Trondheim-Bodø':{min:680,km:710},
  'Trondheim-Brønnøysund':{min:480,km:485},
  'Namsos-Brønnøysund':{min:200,km:200,ferry:{name:'Holm-Vennesund',op:'Torghatten Nord',url:'https://www.torghatten-nord.no/rute/holm-vennesund'}},
  // Nordland — Helgeland-aksen
  'Brønnøysund-Sandnessjøen':{min:180,km:140,ferry:{name:'Horn-Andalsvåg',op:'Torghatten Nord',url:'https://www.torghatten-nord.no'}},
  'Brønnøysund-Mosjøen':{min:180,km:155},
  'Brønnøysund-Mo i Rana':{min:210,km:243},
  'Sandnessjøen-Mosjøen':{min:75,km:75},
  'Sandnessjøen-Mo i Rana':{min:95,km:109},
  'Mosjøen-Mo i Rana':{min:75,km:87},
  // Nordland — Salten
  'Mo i Rana-Bodø':{min:200,km:229},
  'Mosjøen-Bodø':{min:270,km:317},
  'Sandnessjøen-Bodø':{min:290,km:340},
  'Brønnøysund-Bodø':{min:410,km:472},
  'Bodø-Fauske':{min:50,km:65},
  'Mo i Rana-Fauske':{min:160,km:170},
  // Nordland ↔ Lofoten/Vesterålen
  'Bodø-Svolvær':{min:240,km:170,ferry:{name:'Bodø-Moskenes (Lofoten)',op:'Torghatten Nord',url:'https://www.torghatten-nord.no/rute/bodo-moskenes'}},
  'Bodø-Leknes':{min:300,km:200,ferry:{name:'Bodø-Moskenes (Lofoten)',op:'Torghatten Nord',url:'https://www.torghatten-nord.no/rute/bodo-moskenes'}},
  'Svolvær-Leknes':{min:60,km:70},
  'Svolvær-Sortland':{min:80,km:95},
  'Sortland-Leknes':{min:130,km:140},
  // Nordland ↔ Narvik / Troms
  'Bodø-Narvik':{min:350,km:305,ferry:{name:'Bognes-Skarberget',op:'Torghatten Nord',url:'https://www.torghatten-nord.no/rute/bognes-skarberget'}},
  'Fauske-Narvik':{min:300,km:240,ferry:{name:'Bognes-Skarberget',op:'Torghatten Nord',url:'https://www.torghatten-nord.no/rute/bognes-skarberget'}},
  'Narvik-Sortland':{min:150,km:160},
  'Narvik-Svolvær':{min:200,km:235},
  'Narvik-Harstad':{min:90,km:118},
  'Narvik-Tromsø':{min:255,km:248},
  'Sortland-Harstad':{min:120,km:135},
  'Harstad-Tromsø':{min:200,km:230,ferry:{name:'Refsnes-Flesnes',op:'Torghatten Nord',url:'https://www.torghatten-nord.no'}},
  'Harstad-Finnsnes':{min:120,km:130,ferry:{name:'Refsnes-Flesnes',op:'Torghatten Nord',url:'https://www.torghatten-nord.no'}},
  'Finnsnes-Tromsø':{min:140,km:157},
  // Troms — nye tettsteder (verifiserte kjøreruter)
  'Bardufoss-Tromsø':{min:110,km:130},
  'Setermoen-Bardufoss':{min:20,km:25},
  'Setermoen-Narvik':{min:75,km:90},
  'Setermoen-Tromsø':{min:130,km:155},
  'Finnsnes-Bardufoss':{min:40,km:45},
  'Storslett-Tromsø':{min:160,km:136},
  'Skjervøy-Storslett':{min:50,km:55},
  'Skjervøy-Tromsø':{min:205,km:185},
  'Storslett-Alta':{min:170,km:220},
  // Nordland — nye tettsteder
  'Stokmarknes-Sortland':{min:25,km:28},
  'Stokmarknes-Svolvær':{min:70,km:80},
  // Trøndelag — nye tettsteder
  'Oppdal-Trondheim':{min:110,km:120},
  'Oppdal-Røros':{min:120,km:116},
  'Oppdal-Støren':{min:65,km:70},
  'Støren-Trondheim':{min:45,km:50},
  'Melhus-Trondheim':{min:20,km:20},
  'Melhus-Støren':{min:28,km:30},
  'Namsos-Rørvik':{min:85,km:93},
  'Grong-Namsos':{min:50,km:53},
  'Steinkjer-Grong':{min:60,km:75},
  'Grong-Mosjøen':{min:130,km:150},
  'Brekstad-Trondheim':{min:95,km:100,ferry:{name:'Flakk-Rørvik',op:'AtB / Fosenlinjen',url:'https://www.atb.no'}},
  'Åfjord-Trondheim':{min:100,km:105,ferry:{name:'Flakk-Rørvik',op:'AtB / Fosenlinjen',url:'https://www.atb.no'}},
  'Brekstad-Åfjord':{min:50,km:55},
  // Finnmark — nye tettsteder
  'Honningsvåg-Hammerfest':{min:140,km:180},
  'Lakselv-Alta':{min:110,km:140},
  'Lakselv-Honningsvåg':{min:80,km:105},
  'Lakselv-Hammerfest':{min:135,km:175},
  'Vardø-Vadsø':{min:60,km:75},
  'Båtsfjord-Vadsø':{min:120,km:130},
  // Troms ↔ Finnmark
  'Tromsø-Alta':{min:380,km:410},
  'Tromsø-Hammerfest':{min:430,km:470},
  'Alta-Hammerfest':{min:110,km:140},
  'Alta-Kirkenes':{min:480,km:480},
  'Alta-Vadsø':{min:340,km:340},
  'Hammerfest-Kirkenes':{min:500,km:495},
  'Vadsø-Kirkenes':{min:140,km:135},
  // Fra hjemmebase Kvaløya (Eidkjosen-området, postnummer 9105)
  // Tider basert på Google Maps med kjøring via Tromsø sentrum og videre på E6/E8
  'Kvaløya-Tromsø':{min:25,km:18},
  'Kvaløya-Tromsdalen':{min:30,km:21},
  'Kvaløya-Finnsnes':{min:160,km:165},
  'Kvaløya-Storslett':{min:170,km:155},
  'Kvaløya-Skjervøy':{min:215,km:200},
  'Kvaløya-Bardufoss':{min:130,km:148},
  'Kvaløya-Harstad':{min:250,km:270},
  'Kvaløya-Narvik':{min:285,km:285},
  'Kvaløya-Alta':{min:410,km:430},
  'Kvaløya-Hammerfest':{min:460,km:490},
};

const DRIVE_TIMES = {};
Object.keys(ROUTE_DATA).forEach(k=>{ DRIVE_TIMES[k]=ROUTE_DATA[k].min; });
// Koordinater for byer i mitt distrikt (lat, lon). Brukes til å estimere
// kjøreavstand når strekningen ikke er i ROUTE_DATA.
const CITY_COORDS = {
  // Tettsteder lagt til for korrekt kjøretid (manglet koordinater)
  'Kolvereid':[64.8669,11.6033],'Kongsmoen':[64.8897,12.4097],'Overhalla':[64.4869,11.9692],'Fannrem':[63.2858,9.8253],'Tiller':[63.3547,10.3789],'Leinstrand':[63.3344,10.3242],'Rissa':[63.5867,9.9889],'Bjugn':[63.7572,9.8089],'Hitra':[63.5572,8.7958],'Sistranda':[63.7233,8.8347],'Kyrksæterøra':[63.2889,9.095],'Løkken Verk':[63.1142,9.7106],'Selbu':[63.2208,11.0331],'Haltdalen':[62.9472,11.2436],'Meråker':[63.3578,11.7472],'Ekne':[63.6447,11.0247],'Verdal':[63.7917,11.4814],'Åfjord':[63.9636,10.2089],'Ballangen':[68.3439,16.8389],'Rognan':[67.1017,15.3919],'Ørnes':[66.8678,13.7106],'Bjerkvik':[68.5408,17.5536],'Lødingen':[68.4097,15.9986],'Bø I Vesterålen':[68.6731,14.5089],'Andenes':[69.3247,16.1197],'Bardu':[68.8625,18.3536],'Bardufoss':[69.0658,18.5119],'Lyngseidet':[69.5806,20.2197],'Sjøvegan':[68.8758,17.8247],'Sørreisa':[69.1539,18.1556],'Tromø':[69.6492,18.9553],'Tana':[70.198,28.1894],'Rypefjord':[70.6275,23.6789],'Hesseng':[69.7264,30.0361],'Kjøllefjord':[70.9428,27.3417],'Karasjok':[69.472,25.5108],'Kautokeino':[69.0125,23.0361],'Honningsvåg':[70.9821,25.97],'Lakselv':[70.0521,24.9728],'Mo I Rana':[66.3128,14.1428],'Stjørdal':[63.4683,10.9197],'Skjervøy':[70.0331,20.9758],
  // Hjemmebase: Kvaløya (Eidkjosen-området, sør på Kvaløya, postnummer 9105)
  'Kvaløya':[69.5717,18.6534],'Eidkjosen':[69.5717,18.6534],
  'Trondheim':[63.4305,10.3951],'Stjørdalshalsen':[63.4683,10.9197],'Orkanger':[63.3079,9.8463],
  'Oppdal':[62.5949,9.6913],'Støren':[63.0427,10.2884],'Melhus':[63.2876,10.2766],
  'Stjørdal':[63.4683,10.9197],'Brekstad':[63.6857,9.6695],'Åfjord':[63.9647,10.2227],
  'Rørvik':[64.8625,11.2369],'Grong':[64.4631,12.3107],
  'Steinkjer':[64.0145,11.4954],'Levanger':[63.7461,11.2999],'Verdalsøra':[63.7894,11.4767],
  'Namsos':[64.4664,11.5005],'Røros':[62.5747,11.3845],
  'Bodø':[67.2804,14.4050],'Fauske':[67.2596,15.3917],'Mo i Rana':[66.3128,14.1428],
  'Mosjøen':[65.8378,13.1907],'Sandnessjøen':[66.0228,12.6300],'Brønnøysund':[65.4744,12.2107],
  'Narvik':[68.4385,17.4272],'Sortland':[68.6986,15.4117],'Stokmarknes':[68.5664,14.9112],
  'Svolvær':[68.2342,14.5662],'Leknes':[68.1462,13.6105],
  'Harstad':[68.7989,16.5419],'Finnsnes':[69.2300,17.9707],'Tromsø':[69.6492,18.9553],
  'Setermoen':[68.8607,18.3430],'Bardufoss':[69.0566,18.5126],
  'Tromsdalen':[69.6492,19.0050],'Kvaløysletta':[69.7095,18.8400],
  'Storslett':[69.7677,21.0353],'Skjervøy':[70.0314,20.9709],
  'Alta':[69.9689,23.2716],'Hammerfest':[70.6634,23.6821],'Honningsvåg':[70.9821,25.9704],
  'Lakselv':[70.0506,24.9730],'Kirkenes':[69.7273,30.0455],'Vadsø':[70.0739,29.7497],
  'Vardø':[70.3705,31.1107],'Båtsfjord':[70.6346,29.7185],
  'Longyearbyen':[78.2232,15.6267],
  // Andre relevante norske byer (for kompletthet)
  'Oslo':[59.9139,10.7522],'Bergen':[60.3913,5.3221],'Stavanger':[58.9700,5.7331],
  'Kristiansand':[58.1599,8.0182],'Ålesund':[62.4722,6.1495],'Molde':[62.7375,7.1591],
  'Kristiansund':[63.1115,7.7282],
};
const BIG_CITIES = ['Tromsø','Trondheim','Bodø','Alta','Harstad','Oslo','Bergen','Stavanger','Kristiansand','Drammen','Fredrikstad/Sarpsborg'];
// Naboregioner — styrer hvilke bolker som vises under den valgte regionen.
const REGION_NEIGHBORS = {
  'Trøndelag':['Nordland','Møre og Romsdal','Innlandet'],
  'Nordland':['Troms','Trøndelag'],
  'Troms':['Finnmark','Nordland'],
  'Finnmark':['Troms'],
  'Svalbard':[],
  'Møre og Romsdal':['Trøndelag','Vestland','Innlandet'],
  'Vestland':['Møre og Romsdal','Rogaland','Innlandet'],
  'Rogaland':['Vestland','Agder'],
  'Agder':['Rogaland','Telemark','Vestfold'],
  'Telemark':['Agder','Vestfold','Buskerud'],
  'Vestfold':['Telemark','Buskerud','Østfold'],
  'Buskerud':['Telemark','Vestfold','Akershus','Innlandet'],
  'Innlandet':['Trøndelag','Møre og Romsdal','Akershus','Buskerud'],
  'Oslo':['Akershus'],
  'Akershus':['Oslo','Østfold','Buskerud','Innlandet'],
  'Østfold':['Akershus','Vestfold']
};
// Regionens hovedby (dit man flyr) — leiebil hentes her.
const REGION_HUB = {
  'Trøndelag':'Trondheim','Nordland':'Bodø','Troms':'Tromsø','Finnmark':'Alta','Svalbard':'Longyearbyen',
  'Møre og Romsdal':'Ålesund','Vestland':'Bergen','Rogaland':'Stavanger/Sandnes','Agder':'Kristiansand',
  'Telemark':'Skien','Vestfold':'Sandefjord','Buskerud':'Drammen','Innlandet':'Hamar','Oslo':'Oslo',
  'Akershus':'Oslo','Østfold':'Fredrikstad/Sarpsborg'
};

// Møtelengde per kundeklasse (minutter)
const VISIT_LEN = {'A':60,'B':45,'C':30};
// Mapping fra by/sted til fylke (for fall-back matching)
const CITY_TO_REGION = {
  // Mitt territorium
  'Trondheim':'Trøndelag','Stjørdalshalsen':'Trøndelag','Orkanger':'Trøndelag','Steinkjer':'Trøndelag',
  'Levanger':'Trøndelag','Verdalsøra':'Trøndelag','Namsos':'Trøndelag','Røros':'Trøndelag',
  'Bodø':'Nordland','Mo i Rana':'Nordland','Mosjøen':'Nordland','Sandnessjøen':'Nordland',
  'Brønnøysund':'Nordland','Fauske':'Nordland','Narvik':'Nordland','Sortland':'Nordland',
  'Svolvær':'Nordland','Leknes':'Nordland',
  'Harstad':'Troms','Finnsnes':'Troms','Tromsø':'Troms','Tromsdalen':'Troms','Kvaløysletta':'Troms',
  'Alta':'Finnmark','Hammerfest':'Finnmark','Kirkenes':'Finnmark','Vadsø':'Finnmark',
  'Longyearbyen':'Svalbard',
  // Trøndelag (utvidet)
  'Oppdal':'Trøndelag','Støren':'Trøndelag','Fannrem':'Trøndelag','Stjørdal':'Trøndelag','Selbu':'Trøndelag',
  'Kyrksæterøra':'Trøndelag','Åfjord':'Trøndelag','Grong':'Trøndelag','Løkken Verk':'Trøndelag','Tiller':'Trøndelag',
  'Verdal':'Trøndelag','Melhus':'Trøndelag','Rissa':'Trøndelag','Leinstrand':'Trøndelag','Brekstad':'Trøndelag',
  'Bjugn':'Trøndelag','Hitra':'Trøndelag','Sistranda':'Trøndelag','Haltdalen':'Trøndelag','Meråker':'Trøndelag',
  'Ekne':'Trøndelag','Rørvik':'Trøndelag','Kolvereid':'Trøndelag','Kongsmoen':'Trøndelag','Overhalla':'Trøndelag','Mo I Rana':'Nordland',
  // Nordland (utvidet)
  'Ballangen':'Nordland','Rognan':'Nordland','Stokmarknes':'Nordland','Ørnes':'Nordland','Bjerkvik':'Nordland',
  'Lødingen':'Nordland','Bø I Vesterålen':'Nordland','Andenes':'Nordland',
  // Troms (utvidet)
  'Storslett':'Troms','Bardu':'Troms','Bardufoss':'Troms','Lyngseidet':'Troms','Skjervøy':'Troms',
  'Sjøvegan':'Troms','Sørreisa':'Troms','Tromø':'Troms',
  // Finnmark (utvidet)
  'Tana':'Finnmark','Rypefjord':'Finnmark','Hesseng':'Finnmark','Kjøllefjord':'Finnmark','Karasjok':'Finnmark',
  'Lakselv':'Finnmark','Kautokeino':'Finnmark','Honningsvåg':'Finnmark',
  // Sør-/Øst-Norge
  'Oslo':'Oslo','Lillestrøm':'Akershus','Sandvika':'Akershus','Asker':'Akershus','Jessheim':'Akershus',
  'Ski':'Akershus','Ås':'Akershus','Lørenskog':'Akershus','Kolbotn':'Akershus','Drøbak':'Akershus',
  'Fredrikstad/Sarpsborg':'Østfold','Moss':'Østfold','Halden':'Østfold','Askim':'Østfold','Mysen':'Østfold',
  'Drammen':'Buskerud','Kongsberg':'Buskerud','Mjøndalen':'Buskerud',
  'Tønsberg':'Vestfold','Sandefjord':'Vestfold','Larvik':'Vestfold','Horten':'Vestfold',
  'Porsgrunn/Skien':'Telemark','Notodden':'Telemark','Porsgrunn':'Telemark','Skien':'Telemark','Seljord':'Telemark',
  'Hamar':'Innlandet','Gjøvik':'Innlandet','Lillehammer':'Innlandet','Elverum':'Innlandet','Kongsvinger':'Innlandet','Brumunddal':'Innlandet',
  'Kristiansand':'Agder','Arendal':'Agder','Grimstad':'Agder','Mandal':'Agder','Lillesand':'Agder','Søgne':'Agder','Farsund':'Agder','Evje':'Agder',
  'Stavanger/Sandnes':'Rogaland','Haugesund':'Rogaland','Bryne':'Rogaland','Egersund':'Rogaland','Kopervik':'Rogaland','Stavanger':'Rogaland','Sandnes':'Rogaland',
  'Bergen':'Vestland','Askøy':'Vestland','Knarrevik/Straume':'Vestland','Førde':'Vestland','Florø':'Vestland','Voss':'Vestland','Os':'Vestland','Leirvik':'Vestland','Sogndal':'Vestland','Sunnfjord':'Vestland','Nordfjordeid':'Vestland','Norheimsund':'Vestland',
  'Ålesund':'Møre og Romsdal','Molde':'Møre og Romsdal','Kristiansund':'Møre og Romsdal','Ulsteinvik':'Møre og Romsdal','Ørsta':'Møre og Romsdal','Volda':'Møre og Romsdal','Brattvåg':'Møre og Romsdal'
};

// Geografisk rekkefølge sør→nord — brukes til flerdagsplaner som ekspanderer naturlig
const AREA_CORRIDOR = [
  // Sørvest-/Vestlandet sør→nord
  'Stavanger/Sandnes','Bryne','Egersund','Haugesund','Kopervik','Leirvik',
  'Bergen','Os','Askøy','Knarrevik/Straume','Voss','Norheimsund',
  'Sogndal','Førde','Florø','Nordfjordeid','Sunnfjord',
  'Volda','Ørsta','Ulsteinvik','Ålesund','Molde','Brattvåg','Kristiansund',
  // Trøndelag sør→nord
  'Røros','Orkanger','Trondheim','Stjørdalshalsen','Levanger','Verdalsøra','Steinkjer','Namsos',
  // Nordland sør→nord
  'Brønnøysund','Sandnessjøen','Mosjøen','Mo i Rana','Bodø','Fauske',
  'Leknes','Svolvær','Sortland','Narvik',
  // Troms / Finnmark
  'Harstad','Finnsnes','Tromsø','Tromsdalen','Kvaløysletta',
  'Alta','Hammerfest','Vadsø','Kirkenes',
  // Øst-/Sør-Norge (separat rute — egne korridor-segmenter)
  'Kristiansand','Mandal','Søgne','Lillesand','Grimstad','Arendal','Farsund','Evje',
  'Porsgrunn/Skien','Notodden','Seljord','Larvik','Sandefjord','Tønsberg','Horten',
  'Drammen','Kongsberg','Mjøndalen','Oslo','Lørenskog','Sandvika','Asker','Kolbotn','Ski','Ås','Drøbak','Lillestrøm','Jessheim',
  'Moss','Fredrikstad/Sarpsborg','Halden','Askim','Mysen',
  'Hamar','Brumunddal','Lillehammer','Gjøvik','Elverum','Kongsvinger',
];
// ─── TIDSBLOKKER (adm, møter, lunsj, trening osv.) ─────────────────────────

const TIME_BLOCK_TYPES = [
  {key:'adm',      label:'Adm/forberedelse', emoji:'💻'},
  {key:'teams',    label:'Teamsmøte',        emoji:'👥'},
  {key:'phone',    label:'Telefonsamtale',   emoji:'📞'},
  {key:'lunch',    label:'Lunsj',            emoji:'🍽️'},
  {key:'dinner',   label:'Middag',           emoji:'🍽️'},
  {key:'training', label:'Trening',          emoji:'🏃'},
  {key:'leisure',  label:'Fritid',           emoji:'🌿'},
];
