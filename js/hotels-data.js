// js/hotels-data.js
// Kilde: OpenStreetMap (Overpass API) — tourism=hotel/guest_house/hostel i Norge
// Generert: 2026-06-15
// 1566 hoteller i 124 byer/steder
// Hoteller uten addr:city er tilordnet nærmeste by fra CITY_COORDS (haversine).

// Slå opp hoteller per by. Brukes av planleggeren for å foreslå overnatting og
// beregne kjøring fra hotell til første kundestopp neste dag.
const HOTELS_OSM = {
  "Horten": [
    {
      "name": "Gamlehorten Gjestegård",
      "lat": 59.4258,
      "lon": 10.491,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel Åsgårdstrand",
      "lat": 59.3499,
      "lon": 10.4699,
      "type": "hotel"
    },
    {
      "name": "Hotel Horten",
      "lat": 59.3997,
      "lon": 10.4641,
      "type": "hotel"
    },
    {
      "name": "scoala",
      "lat": 59.4256,
      "lon": 10.4844,
      "type": "guest_house"
    },
    {
      "name": "Sjømilitære samfund",
      "lat": 59.4225,
      "lon": 10.4917,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Horten",
      "lat": 59.4128,
      "lon": 10.4854,
      "type": "hotel"
    }
  ],
  "Bergen": [
    {
      "name": "Augustin Hotel",
      "lat": 60.396,
      "lon": 5.3178,
      "type": "hotel"
    },
    {
      "name": "Basic Hotel",
      "lat": 60.3903,
      "lon": 5.3201,
      "type": "hotel"
    },
    {
      "name": "Bergen Apartmens",
      "lat": 60.3947,
      "lon": 5.3188,
      "type": "guest_house"
    },
    {
      "name": "Bergen Børs Hotel",
      "lat": 60.3939,
      "lon": 5.3262,
      "type": "hotel"
    },
    {
      "name": "Bergen Harbour Hotel",
      "lat": 60.3964,
      "lon": 5.327,
      "type": "hotel"
    },
    {
      "name": "Bergen YMCA Hostel",
      "lat": 60.3945,
      "lon": 5.3267,
      "type": "hostel"
    },
    {
      "name": "Breeze Hotel Victoria",
      "lat": 60.3933,
      "lon": 5.3303,
      "type": "hotel"
    },
    {
      "name": "City Apartment hotel",
      "lat": 60.3896,
      "lon": 5.3239,
      "type": "hotel"
    },
    {
      "name": "Citybox",
      "lat": 60.3878,
      "lon": 5.3278,
      "type": "hotel"
    },
    {
      "name": "Citybox Danmarksplass",
      "lat": 60.3758,
      "lon": 5.3378,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Havnekontoret",
      "lat": 60.3981,
      "lon": 5.3214,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Admiral",
      "lat": 60.3958,
      "lon": 5.3196,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Admiral",
      "lat": 60.3955,
      "lon": 5.3201,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Bergen",
      "lat": 60.3965,
      "lon": 5.3261,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Bergen Airport",
      "lat": 60.2906,
      "lon": 5.2308,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Bergen Airport",
      "lat": 60.2862,
      "lon": 5.2354,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Holberg",
      "lat": 60.3961,
      "lon": 5.3156,
      "type": "hotel"
    },
    {
      "name": "Det Hanseatiske Hotel",
      "lat": 60.396,
      "lon": 5.3262,
      "type": "hotel"
    },
    {
      "name": "Det Lille Gjestehus",
      "lat": 60.3954,
      "lon": 5.3146,
      "type": "guest_house"
    },
    {
      "name": "Fjordslottet hotell",
      "lat": 60.5891,
      "lon": 5.5254,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel Terminus",
      "lat": 60.3907,
      "lon": 5.3344,
      "type": "hotel"
    },
    {
      "name": "Gullaksen Gjestehus",
      "lat": 60.3896,
      "lon": 5.3223,
      "type": "guest_house"
    },
    {
      "name": "Gullbotten leirsted",
      "lat": 60.4071,
      "lon": 5.6406,
      "type": "hotel"
    },
    {
      "name": "Haukeland hotell",
      "lat": 60.3745,
      "lon": 5.353,
      "type": "hotel"
    },
    {
      "name": "Hotel Heimen",
      "lat": 60.3958,
      "lon": 5.3183,
      "type": "hotel"
    },
    {
      "name": "Hotel Norge by Scandic",
      "lat": 60.3913,
      "lon": 5.3233,
      "type": "hotel"
    },
    {
      "name": "Hotel Oleana",
      "lat": 60.3924,
      "lon": 5.3219,
      "type": "hotel"
    },
    {
      "name": "Hotel Park",
      "lat": 60.3867,
      "lon": 5.3261,
      "type": "hotel"
    },
    {
      "name": "Hotel Park",
      "lat": 60.3864,
      "lon": 5.3257,
      "type": "hotel"
    },
    {
      "name": "Hotel Victoria Bergen",
      "lat": 60.3933,
      "lon": 5.3303,
      "type": "hotel"
    },
    {
      "name": "Hotell No.13",
      "lat": 60.3923,
      "lon": 5.3229,
      "type": "hotel"
    },
    {
      "name": "Intermission Hostel",
      "lat": 60.3902,
      "lon": 5.3378,
      "type": "hostel"
    },
    {
      "name": "Klosterhagen hotell",
      "lat": 60.395,
      "lon": 5.3141,
      "type": "hotel"
    },
    {
      "name": "Magic Hotel Kløverhuset",
      "lat": 60.3944,
      "lon": 5.3231,
      "type": "hotel"
    },
    {
      "name": "Magic Hotel Korskirken",
      "lat": 60.3944,
      "lon": 5.3274,
      "type": "hotel"
    },
    {
      "name": "Magic Hotel Xhibition",
      "lat": 60.3928,
      "lon": 5.3267,
      "type": "hotel"
    },
    {
      "name": "Marken Gjestehus",
      "lat": 60.3923,
      "lon": 5.3317,
      "type": "guest_house"
    },
    {
      "name": "Midttun Motel",
      "lat": 60.3202,
      "lon": 5.3654,
      "type": "hotel"
    },
    {
      "name": "Modern apartment in the center of Bergen",
      "lat": 60.3781,
      "lon": 5.3285,
      "type": "guest_house"
    },
    {
      "name": "Montana hostel",
      "lat": 60.3716,
      "lon": 5.3663,
      "type": "hostel"
    },
    {
      "name": "Moxy Bergen",
      "lat": 60.379,
      "lon": 5.3332,
      "type": "hotel"
    },
    {
      "name": "Ole Bull Hotel & Apartments",
      "lat": 60.3923,
      "lon": 5.3223,
      "type": "hotel"
    },
    {
      "name": "Opus XVI",
      "lat": 60.3939,
      "lon": 5.3272,
      "type": "hotel"
    },
    {
      "name": "P-Hotels Bergen",
      "lat": 60.3903,
      "lon": 5.3209,
      "type": "hotel"
    },
    {
      "name": "Piano Hostel",
      "lat": 60.3926,
      "lon": 5.3319,
      "type": "hostel"
    },
    {
      "name": "Prize by Radisson",
      "lat": 60.3761,
      "lon": 5.3348,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Edvard Grieg",
      "lat": 60.2926,
      "lon": 5.2929,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Royal Hotel Bergen",
      "lat": 60.3979,
      "lon": 5.3225,
      "type": "hotel"
    },
    {
      "name": "Scandic Bergen City",
      "lat": 60.3911,
      "lon": 5.3177,
      "type": "hotel"
    },
    {
      "name": "Scandic Byparken",
      "lat": 60.39,
      "lon": 5.3239,
      "type": "hotel"
    },
    {
      "name": "Scandic Flesland Airport",
      "lat": 60.283,
      "lon": 5.2364,
      "type": "hotel"
    },
    {
      "name": "Scandic Flesland Airport",
      "lat": 60.283,
      "lon": 5.2364,
      "type": "hotel"
    },
    {
      "name": "Scandic Kokstad",
      "lat": 60.29,
      "lon": 5.2583,
      "type": "hotel"
    },
    {
      "name": "Scandic Neptun",
      "lat": 60.3942,
      "lon": 5.3199,
      "type": "hotel"
    },
    {
      "name": "Scandic Torget Bergen",
      "lat": 60.3942,
      "lon": 5.324,
      "type": "hotel"
    },
    {
      "name": "Scandic Ørnen",
      "lat": 60.3883,
      "lon": 5.3317,
      "type": "hotel"
    },
    {
      "name": "Skostredet Hotel",
      "lat": 60.3938,
      "lon": 5.3293,
      "type": "hotel"
    },
    {
      "name": "Steens Hotel",
      "lat": 60.3864,
      "lon": 5.3251,
      "type": "hotel"
    },
    {
      "name": "The Bells",
      "lat": 60.4157,
      "lon": 5.4751,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Bergen Airport",
      "lat": 60.29,
      "lon": 5.2608,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Bristol",
      "lat": 60.3925,
      "lon": 5.3228,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Orion",
      "lat": 60.3994,
      "lon": 5.3203,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Rosenkrantz",
      "lat": 60.3971,
      "lon": 5.3256,
      "type": "hotel"
    },
    {
      "name": "Vander Altona",
      "lat": 60.3959,
      "lon": 5.3179,
      "type": "hotel"
    },
    {
      "name": "Villa Terminus",
      "lat": 60.391,
      "lon": 5.3338,
      "type": "hotel"
    },
    {
      "name": "Zander K Hotel",
      "lat": 60.3903,
      "lon": 5.335,
      "type": "hotel"
    }
  ],
  "Oslo": [
    {
      "name": "Amerikalinjen",
      "lat": 59.9107,
      "lon": 10.7496,
      "type": "hotel"
    },
    {
      "name": "Anker Hostel",
      "lat": 59.917,
      "lon": 10.7577,
      "type": "hostel"
    },
    {
      "name": "Anker Hotel",
      "lat": 59.9176,
      "lon": 10.758,
      "type": "hotel"
    },
    {
      "name": "Askeladdens Hus",
      "lat": 59.9765,
      "lon": 10.656,
      "type": "hotel"
    },
    {
      "name": "Att Kvadraturen",
      "lat": 59.9095,
      "lon": 10.7409,
      "type": "hotel"
    },
    {
      "name": "Bob W. ZSentralen",
      "lat": 59.9115,
      "lon": 10.7452,
      "type": "hotel"
    },
    {
      "name": "Bunks at Rode",
      "lat": 59.9273,
      "lon": 10.7669,
      "type": "hostel"
    },
    {
      "name": "Camillas hus",
      "lat": 59.9202,
      "lon": 10.727,
      "type": "guest_house"
    },
    {
      "name": "Citybox Oslo",
      "lat": 59.9103,
      "lon": 10.7472,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Savoy",
      "lat": 59.9166,
      "lon": 10.7383,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Oslo",
      "lat": 59.9077,
      "lon": 10.757,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel The Hub",
      "lat": 59.9125,
      "lon": 10.75,
      "type": "hotel"
    },
    {
      "name": "Cochs pensjonat",
      "lat": 59.9207,
      "lon": 10.7281,
      "type": "guest_house"
    },
    {
      "name": "Comfort Hotel Boersparken",
      "lat": 59.9094,
      "lon": 10.7474,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Grand Central",
      "lat": 59.9106,
      "lon": 10.7507,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Karl Johan",
      "lat": 59.9117,
      "lon": 10.7455,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Xpress",
      "lat": 59.9164,
      "lon": 10.7495,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Xpress Central Station",
      "lat": 59.9107,
      "lon": 10.7488,
      "type": "hotel"
    },
    {
      "name": "Ellingsens Pensjonat",
      "lat": 59.923,
      "lon": 10.7224,
      "type": "hotel"
    },
    {
      "name": "First Hotel Millennium",
      "lat": 59.9113,
      "lon": 10.7412,
      "type": "hotel"
    },
    {
      "name": "Frogner House Apartments",
      "lat": 59.9184,
      "lon": 10.7062,
      "type": "hotel"
    },
    {
      "name": "Gaustad Hotel",
      "lat": 59.9474,
      "lon": 10.7144,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel",
      "lat": 59.9137,
      "lon": 10.7395,
      "type": "hotel"
    },
    {
      "name": "Guldsmeden Hotel",
      "lat": 59.9123,
      "lon": 10.7191,
      "type": "hotel"
    },
    {
      "name": "Haraldsheim",
      "lat": 59.9409,
      "lon": 10.7886,
      "type": "hostel"
    },
    {
      "name": "Hobo Hotel",
      "lat": 59.9113,
      "lon": 10.747,
      "type": "hotel"
    },
    {
      "name": "Home Hotel Bastion",
      "lat": 59.9082,
      "lon": 10.7451,
      "type": "hotel"
    },
    {
      "name": "Home Hotel Folketeateret",
      "lat": 59.914,
      "lon": 10.7506,
      "type": "hotel"
    },
    {
      "name": "Home Hotel Gabelshus",
      "lat": 59.9137,
      "lon": 10.709,
      "type": "hotel"
    },
    {
      "name": "Hotel Bristol",
      "lat": 59.9152,
      "lon": 10.7397,
      "type": "hotel"
    },
    {
      "name": "Hotel Christiania Teater",
      "lat": 59.9135,
      "lon": 10.7359,
      "type": "hotel"
    },
    {
      "name": "Hotel Continental",
      "lat": 59.9141,
      "lon": 10.7335,
      "type": "hotel"
    },
    {
      "name": "Hotel Verdandi",
      "lat": 59.9124,
      "lon": 10.7362,
      "type": "hotel"
    },
    {
      "name": "Hotell Bondeheimen",
      "lat": 59.9147,
      "lon": 10.7404,
      "type": "hotel"
    },
    {
      "name": "K7 Hotel Oslo",
      "lat": 59.9099,
      "lon": 10.7414,
      "type": "hotel"
    },
    {
      "name": "Karl Johan hotell",
      "lat": 59.914,
      "lon": 10.7386,
      "type": "hotel"
    },
    {
      "name": "Lysebu",
      "lat": 59.9776,
      "lon": 10.6559,
      "type": "hotel"
    },
    {
      "name": "Lysebu",
      "lat": 59.9795,
      "lon": 10.6591,
      "type": "hotel"
    },
    {
      "name": "MediInn Hotel Oslo",
      "lat": 59.917,
      "lon": 10.7421,
      "type": "hotel"
    },
    {
      "name": "NH Kontrast",
      "lat": 59.923,
      "lon": 10.7511,
      "type": "guest_house"
    },
    {
      "name": "Numa Oslo Hotel",
      "lat": 59.9178,
      "lon": 10.7184,
      "type": "hotel"
    },
    {
      "name": "P-Hotels Oslo",
      "lat": 59.9144,
      "lon": 10.7419,
      "type": "hotel"
    },
    {
      "name": "Park Inn",
      "lat": 59.9111,
      "lon": 10.7407,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel 33",
      "lat": 59.9289,
      "lon": 10.8187,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Entry",
      "lat": 59.8252,
      "lon": 10.7797,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel™ Hasle Linie",
      "lat": 59.9277,
      "lon": 10.7969,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Hotel Nydalen",
      "lat": 59.949,
      "lon": 10.7661,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Plaza Hotel, Oslo",
      "lat": 59.9125,
      "lon": 10.7564,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Scandinavia Hotel, Oslo",
      "lat": 59.9184,
      "lon": 10.7341,
      "type": "hotel"
    },
    {
      "name": "Radisson RED Oslo Økern",
      "lat": 59.9304,
      "lon": 10.7993,
      "type": "hotel"
    },
    {
      "name": "Saga Apartments Oslo",
      "lat": 59.9247,
      "lon": 10.7204,
      "type": "hotel"
    },
    {
      "name": "Saga Hotel Oslo",
      "lat": 59.9228,
      "lon": 10.7203,
      "type": "hotel"
    },
    {
      "name": "Scandic Byporten",
      "lat": 59.9119,
      "lon": 10.7515,
      "type": "hotel"
    },
    {
      "name": "Scandic Grensen",
      "lat": 59.9144,
      "lon": 10.7413,
      "type": "hotel"
    },
    {
      "name": "Scandic Helsfyr",
      "lat": 59.9156,
      "lon": 10.805,
      "type": "hotel"
    },
    {
      "name": "Scandic Holberg",
      "lat": 59.9196,
      "lon": 10.7344,
      "type": "hotel"
    },
    {
      "name": "Scandic Holmenkollen Park",
      "lat": 59.963,
      "lon": 10.6632,
      "type": "hotel"
    },
    {
      "name": "Scandic Hotel",
      "lat": 59.9222,
      "lon": 10.751,
      "type": "hotel"
    },
    {
      "name": "Scandic Karl Johan",
      "lat": 59.9142,
      "lon": 10.7408,
      "type": "hotel"
    },
    {
      "name": "Scandic Oslo City",
      "lat": 59.9119,
      "lon": 10.7492,
      "type": "hotel"
    },
    {
      "name": "Scandic Sjølyst",
      "lat": 59.9202,
      "lon": 10.6828,
      "type": "hotel"
    },
    {
      "name": "Scandic Solli",
      "lat": 59.9138,
      "lon": 10.7214,
      "type": "hotel"
    },
    {
      "name": "Scandic St. Olavs plass",
      "lat": 59.9182,
      "lon": 10.7397,
      "type": "hotel"
    },
    {
      "name": "Scandic Victoria",
      "lat": 59.9126,
      "lon": 10.7369,
      "type": "hotel"
    },
    {
      "name": "Smarthotel Oslo",
      "lat": 59.9178,
      "lon": 10.7365,
      "type": "hotel"
    },
    {
      "name": "Sommerro",
      "lat": 59.9153,
      "lon": 10.7196,
      "type": "hotel"
    },
    {
      "name": "Soria Moria",
      "lat": 59.9753,
      "lon": 10.6553,
      "type": "hotel"
    },
    {
      "name": "Super Stay Hotel",
      "lat": 59.9139,
      "lon": 10.7774,
      "type": "hotel"
    },
    {
      "name": "The Sweet",
      "lat": 59.9222,
      "lon": 10.7246,
      "type": "hotel"
    },
    {
      "name": "THE THIEF",
      "lat": 59.9076,
      "lon": 10.721,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Astoria",
      "lat": 59.9112,
      "lon": 10.7468,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Cecil",
      "lat": 59.9128,
      "lon": 10.7374,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Europa",
      "lat": 59.9179,
      "lon": 10.7349,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Gyldenløve",
      "lat": 59.9253,
      "lon": 10.7226,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Opera",
      "lat": 59.9094,
      "lon": 10.7532,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Rosenkrantz",
      "lat": 59.9157,
      "lon": 10.7405,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Slottsparken",
      "lat": 59.9185,
      "lon": 10.7321,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Spectrum",
      "lat": 59.914,
      "lon": 10.7558,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Storo",
      "lat": 59.9471,
      "lon": 10.7725,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Terminus",
      "lat": 59.9134,
      "lon": 10.7528,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Ullevaal Stadion",
      "lat": 59.9496,
      "lon": 10.7362,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Vika Atrium",
      "lat": 59.9112,
      "lon": 10.7241,
      "type": "hotel"
    },
    {
      "name": "Thon Hotell Linne",
      "lat": 59.9395,
      "lon": 10.8292,
      "type": "hotel"
    },
    {
      "name": "Voksenåsen hotell",
      "lat": 59.9749,
      "lon": 10.6648,
      "type": "hotel"
    }
  ],
  "Halden": [
    {
      "name": "Clarion Collection Hotel Park Halden",
      "lat": 59.1249,
      "lon": 11.3749,
      "type": "hotel"
    },
    {
      "name": "Fredriksten hotell",
      "lat": 59.1161,
      "lon": 11.3945,
      "type": "hotel"
    },
    {
      "name": "Grand Hotell",
      "lat": 59.1203,
      "lon": 11.3854,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Halden",
      "lat": 59.1189,
      "lon": 11.3863,
      "type": "hotel"
    },
    {
      "name": "Villa Kornsjø",
      "lat": 58.9422,
      "lon": 11.6592,
      "type": "guest_house"
    },
    {
      "name": "Østgaard",
      "lat": 59.1422,
      "lon": 11.3438,
      "type": "guest_house"
    }
  ],
  "Stryn": [
    {
      "name": "Billingen Seterpensjonat",
      "lat": 62.01,
      "lon": 7.8666,
      "type": "guest_house"
    },
    {
      "name": "Brekkom Fjellpensjonat",
      "lat": 61.9116,
      "lon": 7.9093,
      "type": "guest_house"
    },
    {
      "name": "Djupvasshytta",
      "lat": 62.0304,
      "lon": 7.2768,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel Hellesylt",
      "lat": 62.087,
      "lon": 6.8697,
      "type": "hotel"
    },
    {
      "name": "Grande Fjord Hotel",
      "lat": 62.1162,
      "lon": 7.1843,
      "type": "hotel"
    },
    {
      "name": "Grotli Høyfjellshotel",
      "lat": 62.0139,
      "lon": 7.632,
      "type": "hotel"
    },
    {
      "name": "Hellesylt vandrerhjem",
      "lat": 62.0894,
      "lon": 6.8659,
      "type": "hostel"
    },
    {
      "name": "Hjelle hotel",
      "lat": 61.9147,
      "lon": 7.1132,
      "type": "hotel"
    },
    {
      "name": "Hotel Alexandra",
      "lat": 61.8731,
      "lon": 6.8455,
      "type": "hotel"
    },
    {
      "name": "Hotel Karistova",
      "lat": 61.7888,
      "lon": 6.5005,
      "type": "hotel"
    },
    {
      "name": "Hotel Loenfjord",
      "lat": 61.871,
      "lon": 6.8469,
      "type": "hotel"
    },
    {
      "name": "Hotel Union Geiranger",
      "lat": 62.097,
      "lon": 7.2105,
      "type": "hotel"
    },
    {
      "name": "Hotel Videseter",
      "lat": 61.9397,
      "lon": 7.2701,
      "type": "hotel"
    },
    {
      "name": "Hotell Geiranger",
      "lat": 62.1012,
      "lon": 7.2072,
      "type": "hotel"
    },
    {
      "name": "Hotell Utsikten",
      "lat": 62.0925,
      "lon": 7.2239,
      "type": "hotel"
    },
    {
      "name": "Innvik Fjordhotell",
      "lat": 61.8501,
      "lon": 6.6112,
      "type": "hotel"
    },
    {
      "name": "Jostedal hotell",
      "lat": 61.6315,
      "lon": 7.2643,
      "type": "hotel"
    },
    {
      "name": "Muri Feriehytter",
      "lat": 61.8357,
      "lon": 6.8127,
      "type": "guest_house"
    },
    {
      "name": "Mølla Gjestehus",
      "lat": 61.8424,
      "lon": 6.8107,
      "type": "guest_house"
    },
    {
      "name": "Nigardsbreen Lodge",
      "lat": 61.651,
      "lon": 7.2784,
      "type": "guest_house"
    },
    {
      "name": "Olden Fjordhotell",
      "lat": 61.8481,
      "lon": 6.8146,
      "type": "hotel"
    },
    {
      "name": "Pollfoss Gjestehus",
      "lat": 61.9599,
      "lon": 7.8975,
      "type": "guest_house"
    },
    {
      "name": "Stryn Hotel",
      "lat": 61.9013,
      "lon": 6.7157,
      "type": "hotel"
    },
    {
      "name": "Stryn House - Hotel & Apartments",
      "lat": 61.9051,
      "lon": 6.7255,
      "type": "hostel"
    },
    {
      "name": "Thon Hotel Jølster",
      "lat": 61.5719,
      "lon": 6.4811,
      "type": "hotel"
    },
    {
      "name": "Villa Norangdal",
      "lat": 62.1096,
      "lon": 6.7397,
      "type": "guest_house"
    },
    {
      "name": "Visnes Hotel",
      "lat": 61.8977,
      "lon": 6.7077,
      "type": "hotel"
    }
  ],
  "Bodø": [
    {
      "name": "Beiarn gjestegård",
      "lat": 67.0064,
      "lon": 14.5763,
      "type": "hotel"
    },
    {
      "name": "Bodo Motel",
      "lat": 67.2862,
      "lon": 14.3913,
      "type": "hostel"
    },
    {
      "name": "Bodø Hotell",
      "lat": 67.283,
      "lon": 14.3798,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Grand Bodø",
      "lat": 67.284,
      "lon": 14.3782,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Bodø",
      "lat": 67.2826,
      "lon": 14.3769,
      "type": "hotel"
    },
    {
      "name": "Fordypningsrommet - The Arctic Hideaway",
      "lat": 67.1614,
      "lon": 13.7673,
      "type": "hotel"
    },
    {
      "name": "Kjerringøy Bryggehotell",
      "lat": 67.5214,
      "lon": 14.7623,
      "type": "hotel"
    },
    {
      "name": "Opsahl Gjestegaard",
      "lat": 67.2839,
      "lon": 14.3939,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Ramsalt",
      "lat": 67.2859,
      "lon": 14.386,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Hotel Bodø",
      "lat": 67.2822,
      "lon": 14.3751,
      "type": "hotel"
    },
    {
      "name": "Saltstraume Brygge",
      "lat": 67.221,
      "lon": 14.6172,
      "type": "hotel"
    },
    {
      "name": "Saltstraumen Hotel",
      "lat": 67.2359,
      "lon": 14.6166,
      "type": "hotel"
    },
    {
      "name": "Scandic Bodø",
      "lat": 67.285,
      "lon": 14.3818,
      "type": "hotel"
    },
    {
      "name": "Scandic Havet",
      "lat": 67.2842,
      "lon": 14.3755,
      "type": "hotel"
    },
    {
      "name": "Skagen Hotel",
      "lat": 67.2809,
      "lon": 14.3777,
      "type": "hotel"
    },
    {
      "name": "Smarthotel Bodø",
      "lat": 67.2857,
      "lon": 14.3897,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Nordlys",
      "lat": 67.2808,
      "lon": 14.373,
      "type": "hotel"
    },
    {
      "name": "Wood Hotel Bodø",
      "lat": 67.3002,
      "lon": 14.4398,
      "type": "hotel"
    },
    {
      "name": "Zefyr hotell",
      "lat": 67.2825,
      "lon": 14.3945,
      "type": "hotel"
    }
  ],
  "Otta": [
    {
      "name": "Dovreskogen gjestegård",
      "lat": 61.9123,
      "lon": 9.3606,
      "type": "guest_house"
    },
    {
      "name": "Gammel-Kleppe",
      "lat": 61.8639,
      "lon": 9.1539,
      "type": "guest_house"
    },
    {
      "name": "Heartbreak Hotel",
      "lat": 61.715,
      "lon": 9.407,
      "type": "hotel"
    },
    {
      "name": "Hindsæter Fjellhotell",
      "lat": 61.6178,
      "lon": 8.968,
      "type": "hotel"
    },
    {
      "name": "Hotel Rondablikk",
      "lat": 61.7521,
      "lon": 9.7226,
      "type": "hotel"
    },
    {
      "name": "Høvringen Høgfjellshotell",
      "lat": 61.8911,
      "lon": 9.4769,
      "type": "hotel"
    },
    {
      "name": "Killi pensjonat",
      "lat": 61.772,
      "lon": 9.5249,
      "type": "guest_house"
    },
    {
      "name": "Kvebergsøya",
      "lat": 62.1317,
      "lon": 10.1586,
      "type": "guest_house"
    },
    {
      "name": "Lemonsjøen Fjellstue og hyttegrend",
      "lat": 61.759,
      "lon": 9.0745,
      "type": "guest_house"
    },
    {
      "name": "Mysusæter fjell-losji",
      "lat": 61.8081,
      "lon": 9.6837,
      "type": "hotel"
    },
    {
      "name": "Nordre Ekre Gård",
      "lat": 61.7319,
      "lon": 9.3697,
      "type": "hotel"
    },
    {
      "name": "Rondane Fjellstue",
      "lat": 61.8115,
      "lon": 9.6853,
      "type": "guest_house"
    },
    {
      "name": "Rondane Haukliseter Fjellhotell",
      "lat": 61.8885,
      "lon": 9.4875,
      "type": "hotel"
    },
    {
      "name": "Rondane Høyfjellshotell",
      "lat": 61.8084,
      "lon": 9.6732,
      "type": "hotel"
    },
    {
      "name": "Sjoa Gjestehus & Vandrerhjem",
      "lat": 61.6835,
      "lon": 9.522,
      "type": "guest_house"
    },
    {
      "name": "Sjoa kajakk camp (Riksanlegget)",
      "lat": 61.6851,
      "lon": 9.4856,
      "type": "hostel"
    },
    {
      "name": "Thon Hotel Otta",
      "lat": 61.7716,
      "lon": 9.5332,
      "type": "hotel"
    }
  ],
  "Dombås": [
    {
      "name": "Andvord Gard",
      "lat": 61.8352,
      "lon": 8.5519,
      "type": "hotel"
    },
    {
      "name": "Brimi Fjellstugu",
      "lat": 61.8083,
      "lon": 8.9121,
      "type": "guest_house"
    },
    {
      "name": "Brimibue",
      "lat": 61.8372,
      "lon": 8.5674,
      "type": "hotel"
    },
    {
      "name": "Dombås Gjestehus",
      "lat": 62.0751,
      "lon": 9.1362,
      "type": "guest_house"
    },
    {
      "name": "Dombås Hotel",
      "lat": 62.0732,
      "lon": 9.1212,
      "type": "hotel"
    },
    {
      "name": "Dovrefjell hotell",
      "lat": 62.0856,
      "lon": 9.1238,
      "type": "hotel"
    },
    {
      "name": "Dovregubbens Hall",
      "lat": 62.1746,
      "lon": 9.4294,
      "type": "hotel"
    },
    {
      "name": "Elveseter Hotell",
      "lat": 61.7043,
      "lon": 8.2873,
      "type": "hotel"
    },
    {
      "name": "Folldal Fjellhotell/Storhøseter",
      "lat": 62.1463,
      "lon": 10.0222,
      "type": "hotel"
    },
    {
      "name": "Fossberg hotel",
      "lat": 61.8376,
      "lon": 8.5695,
      "type": "hotel"
    },
    {
      "name": "Fossheim hotell",
      "lat": 61.8384,
      "lon": 8.5724,
      "type": "hotel"
    },
    {
      "name": "Nordigard Blessom",
      "lat": 61.8813,
      "lon": 9.0954,
      "type": "guest_house"
    },
    {
      "name": "Pilgrimsgården Busjord",
      "lat": 62.0159,
      "lon": 9.2237,
      "type": "guest_house"
    },
    {
      "name": "Røisheim hotell",
      "lat": 61.7495,
      "lon": 8.3845,
      "type": "hotel"
    },
    {
      "name": "Sletten Fjellgard",
      "lat": 62.1895,
      "lon": 9.7585,
      "type": "guest_house"
    },
    {
      "name": "Soleggen Fjellstugu",
      "lat": 61.8241,
      "lon": 8.6247,
      "type": "guest_house"
    },
    {
      "name": "SOV Lodge, Vågå",
      "lat": 61.8753,
      "lon": 9.0956,
      "type": "hotel"
    },
    {
      "name": "Sulheim Vertsgård",
      "lat": 61.7657,
      "lon": 8.404,
      "type": "guest_house"
    },
    {
      "name": "Tynnøl Backpackers Lodge",
      "lat": 62.1196,
      "lon": 8.8032,
      "type": "guest_house"
    },
    {
      "name": "Villa Vågå",
      "lat": 61.8777,
      "lon": 9.0983,
      "type": "hotel"
    }
  ],
  "Trondheim": [
    {
      "name": "Ankeret Brygge",
      "lat": 63.8863,
      "lon": 9.8676,
      "type": "guest_house"
    },
    {
      "name": "Astoria",
      "lat": 63.4342,
      "lon": 10.3969,
      "type": "hotel"
    },
    {
      "name": "Bakeriet",
      "lat": 63.4341,
      "lon": 10.4028,
      "type": "hotel"
    },
    {
      "name": "Britannia Hotel",
      "lat": 63.4317,
      "lon": 10.3987,
      "type": "hotel"
    },
    {
      "name": "Brygga",
      "lat": 64.1717,
      "lon": 9.4083,
      "type": "hostel"
    },
    {
      "name": "Chesterfield Hotel",
      "lat": 63.4344,
      "lon": 10.3999,
      "type": "hotel"
    },
    {
      "name": "City Living Schøller hotel",
      "lat": 63.4321,
      "lon": 10.3956,
      "type": "hotel"
    },
    {
      "name": "City Living Sentrum Hotel & Apartments",
      "lat": 63.4338,
      "lon": 10.3969,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Trondheim",
      "lat": 63.44,
      "lon": 10.402,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Park",
      "lat": 63.4276,
      "lon": 10.3925,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Trondheim",
      "lat": 63.433,
      "lon": 10.4023,
      "type": "hotel"
    },
    {
      "name": "Fiskarheimen",
      "lat": 63.7592,
      "lon": 10.0752,
      "type": "guest_house"
    },
    {
      "name": "Home Hotel Grand Olav",
      "lat": 63.4342,
      "lon": 10.4036,
      "type": "hotel"
    },
    {
      "name": "Hotell St. Olav",
      "lat": 63.4217,
      "lon": 10.3913,
      "type": "hotel"
    },
    {
      "name": "Knirkenheimen",
      "lat": 63.4343,
      "lon": 10.402,
      "type": "hotel"
    },
    {
      "name": "Nidaros Pilgrimsgård",
      "lat": 63.4266,
      "lon": 10.4,
      "type": "guest_house"
    },
    {
      "name": "P-Hotels Brattøra",
      "lat": 63.4359,
      "lon": 10.3955,
      "type": "hotel"
    },
    {
      "name": "Pensjonat Jarlen",
      "lat": 63.4307,
      "lon": 10.3892,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Augustin",
      "lat": 63.4308,
      "lon": 10.3926,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Panorama",
      "lat": 63.3592,
      "lon": 10.3749,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Prinsen",
      "lat": 63.4309,
      "lon": 10.3912,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Royal Garden Hotel",
      "lat": 63.4336,
      "lon": 10.4053,
      "type": "hotel"
    },
    {
      "name": "RUMI Hostel",
      "lat": 63.4337,
      "lon": 10.4245,
      "type": "hostel"
    },
    {
      "name": "Scandic Bakklandet",
      "lat": 63.4322,
      "lon": 10.4065,
      "type": "hotel"
    },
    {
      "name": "Scandic Lerkendal",
      "lat": 63.4116,
      "lon": 10.4025,
      "type": "hotel"
    },
    {
      "name": "Scandic Lerkendal",
      "lat": 63.4115,
      "lon": 10.4038,
      "type": "hotel"
    },
    {
      "name": "Scandic Nidelven",
      "lat": 63.4358,
      "lon": 10.4066,
      "type": "hotel"
    },
    {
      "name": "Scandic Solsiden",
      "lat": 63.4348,
      "lon": 10.4143,
      "type": "hotel"
    },
    {
      "name": "Singsaker Sommerhotell",
      "lat": 63.4241,
      "lon": 10.4129,
      "type": "hotel"
    },
    {
      "name": "Sjøsenteret",
      "lat": 64.0544,
      "lon": 9.9535,
      "type": "hotel"
    },
    {
      "name": "Skanklåna",
      "lat": 64.1715,
      "lon": 9.409,
      "type": "hostel"
    },
    {
      "name": "Thon Hotel Nidaros",
      "lat": 63.434,
      "lon": 10.3998,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Trondheim",
      "lat": 63.4303,
      "lon": 10.3929,
      "type": "hotel"
    }
  ],
  "Elverum": [
    {
      "name": "Elverum Folkehøgskule",
      "lat": 60.8974,
      "lon": 11.563,
      "type": "hostel"
    },
    {
      "name": "Holiday house- Elvdalsvegen 18, nybergsund, Norway",
      "lat": 61.2581,
      "lon": 12.3261,
      "type": "guest_house"
    },
    {
      "name": "Kjølen Hotell",
      "lat": 61.2542,
      "lon": 12.5342,
      "type": "hotel"
    },
    {
      "name": "Knoll &Tott's Kosekrok",
      "lat": 61.1956,
      "lon": 11.497,
      "type": "guest_house"
    },
    {
      "name": "Osensjøens Adventure",
      "lat": 61.301,
      "lon": 11.7612,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Resort Trysil",
      "lat": 61.3079,
      "lon": 12.2444,
      "type": "hotel"
    },
    {
      "name": "SkiStar Lodge Trysil",
      "lat": 61.3284,
      "lon": 12.1646,
      "type": "hotel"
    },
    {
      "name": "Syvsætre gard",
      "lat": 60.6165,
      "lon": 12.0414,
      "type": "guest_house"
    },
    {
      "name": "Thon Partner Elgstua Hotel",
      "lat": 60.8836,
      "lon": 11.5407,
      "type": "hotel"
    },
    {
      "name": "Thon Partner Hotel Central",
      "lat": 60.8806,
      "lon": 11.5638,
      "type": "hotel"
    },
    {
      "name": "Trysil Hotel",
      "lat": 61.3127,
      "lon": 12.2668,
      "type": "hotel"
    },
    {
      "name": "Trysil Hotell",
      "lat": 61.3133,
      "lon": 12.2651,
      "type": "hotel"
    },
    {
      "name": "Victoria Hotell Flisa",
      "lat": 60.6108,
      "lon": 12.0119,
      "type": "hotel"
    },
    {
      "name": "Østerdalen hotell",
      "lat": 61.1674,
      "lon": 11.3438,
      "type": "hotel"
    }
  ],
  "Sogndal": [
    {
      "name": "Alm Gard",
      "lat": 61.1277,
      "lon": 6.7492,
      "type": "guest_house"
    },
    {
      "name": "Avdalen gard",
      "lat": 61.3563,
      "lon": 7.8804,
      "type": "guest_house"
    },
    {
      "name": "Balestrand Hotel",
      "lat": 61.2069,
      "lon": 6.5331,
      "type": "hotel"
    },
    {
      "name": "Balestrand Vandrerhjem",
      "lat": 61.2094,
      "lon": 6.5331,
      "type": "hostel"
    },
    {
      "name": "Best Western Lægreid Hotell",
      "lat": 61.2302,
      "lon": 7.1007,
      "type": "hotel"
    },
    {
      "name": "Bjorgo Gard",
      "lat": 60.9128,
      "lon": 7.2265,
      "type": "guest_house"
    },
    {
      "name": "Blix hotell",
      "lat": 61.0872,
      "lon": 6.5809,
      "type": "hotel"
    },
    {
      "name": "Borlaug Vandrerhjem",
      "lat": 61.0733,
      "lon": 7.9537,
      "type": "hostel"
    },
    {
      "name": "Brekke Gard Hostel",
      "lat": 60.8571,
      "lon": 7.1052,
      "type": "hotel"
    },
    {
      "name": "Dragsvik Fjordhotell",
      "lat": 61.2168,
      "lon": 6.5604,
      "type": "hotel"
    },
    {
      "name": "Eikum Hotel",
      "lat": 61.3154,
      "lon": 7.2034,
      "type": "hotel"
    },
    {
      "name": "Eplet",
      "lat": 61.3018,
      "lon": 7.2436,
      "type": "hostel"
    },
    {
      "name": "Fjærland Fjordstove Hotel",
      "lat": 61.4064,
      "lon": 6.7423,
      "type": "hotel"
    },
    {
      "name": "Flåm Marina",
      "lat": 60.8607,
      "lon": 7.1196,
      "type": "guest_house"
    },
    {
      "name": "Flåmsbrygga Hotell",
      "lat": 60.8638,
      "lon": 7.1177,
      "type": "hotel"
    },
    {
      "name": "Fretheim Hotel",
      "lat": 60.862,
      "lon": 7.1121,
      "type": "hotel"
    },
    {
      "name": "Gaupnetunet",
      "lat": 61.4026,
      "lon": 7.2991,
      "type": "hotel"
    },
    {
      "name": "Hafslo gjestehus",
      "lat": 61.3219,
      "lon": 7.2232,
      "type": "guest_house"
    },
    {
      "name": "Heimly pensjonat",
      "lat": 60.86,
      "lon": 7.1212,
      "type": "guest_house"
    },
    {
      "name": "Hofslund Fjordhotell",
      "lat": 61.232,
      "lon": 7.1076,
      "type": "hotel"
    },
    {
      "name": "Hotel Aurlandsfjord",
      "lat": 60.9071,
      "lon": 7.1893,
      "type": "hotel"
    },
    {
      "name": "Hotel Grandane",
      "lat": 61.099,
      "lon": 7.4801,
      "type": "hotel"
    },
    {
      "name": "Hotel Mundal",
      "lat": 61.4044,
      "lon": 6.7397,
      "type": "hotel"
    },
    {
      "name": "Klingenberg Hotell",
      "lat": 61.2355,
      "lon": 7.7007,
      "type": "hotel"
    },
    {
      "name": "Kringsjå hotel",
      "lat": 61.2095,
      "lon": 6.5334,
      "type": "hotel"
    },
    {
      "name": "Kvam Stegastein",
      "lat": 60.9218,
      "lon": 7.2035,
      "type": "hotel"
    },
    {
      "name": "Kviknes Hotel",
      "lat": 61.2091,
      "lon": 6.5383,
      "type": "hotel"
    },
    {
      "name": "Kyrkjestølen",
      "lat": 61.1796,
      "lon": 8.1183,
      "type": "guest_house"
    },
    {
      "name": "Leikanger Fjord Hotel",
      "lat": 61.1836,
      "lon": 6.7984,
      "type": "hotel"
    },
    {
      "name": "Lindstrøm Hotell",
      "lat": 61.0975,
      "lon": 7.4812,
      "type": "hotel"
    },
    {
      "name": "Lunden Ferie",
      "lat": 61.1596,
      "lon": 6.9362,
      "type": "hotel"
    },
    {
      "name": "Luster fjordhytter",
      "lat": 61.4,
      "lon": 7.3967,
      "type": "guest_house"
    },
    {
      "name": "Lærdal hotell",
      "lat": 61.1008,
      "lon": 7.4654,
      "type": "hotel"
    },
    {
      "name": "Lærdalsøren Hotell",
      "lat": 61.0978,
      "lon": 7.4795,
      "type": "hotel"
    },
    {
      "name": "Maristova",
      "lat": 61.1104,
      "lon": 8.0343,
      "type": "hotel"
    },
    {
      "name": "Midtnes Hotel",
      "lat": 61.2074,
      "lon": 6.5337,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Sogndal",
      "lat": 61.2297,
      "lon": 7.0989,
      "type": "hotel"
    },
    {
      "name": "Sanden pensjonat",
      "lat": 61.0982,
      "lon": 7.4791,
      "type": "hotel"
    },
    {
      "name": "Sitla Hotel & Apartments",
      "lat": 61.3089,
      "lon": 7.8168,
      "type": "hotel"
    },
    {
      "name": "Skahjem Gard",
      "lat": 60.8923,
      "lon": 7.2341,
      "type": "guest_house"
    },
    {
      "name": "Skjolden hotel",
      "lat": 61.4907,
      "lon": 7.5996,
      "type": "hotel"
    },
    {
      "name": "Skjolden Hotel",
      "lat": 61.4909,
      "lon": 7.5988,
      "type": "hotel"
    },
    {
      "name": "Skjolden Vandrerhjem",
      "lat": 61.4857,
      "lon": 7.6486,
      "type": "hostel"
    },
    {
      "name": "Sogndal Vandrerhjem",
      "lat": 61.232,
      "lon": 7.117,
      "type": "hostel"
    },
    {
      "name": "Sognefjord Gjestehotell",
      "lat": 61.1747,
      "lon": 6.6377,
      "type": "guest_house"
    },
    {
      "name": "Sognefjord Hotel",
      "lat": 61.1791,
      "lon": 6.8546,
      "type": "hotel"
    },
    {
      "name": "Tangen pensjonat",
      "lat": 61.2353,
      "lon": 7.702,
      "type": "guest_house"
    },
    {
      "name": "Turtagrø Hotel",
      "lat": 61.5044,
      "lon": 7.8016,
      "type": "hotel"
    },
    {
      "name": "Tyinholmen Høyfjellsstuer",
      "lat": 61.3546,
      "lon": 8.2584,
      "type": "hotel"
    },
    {
      "name": "Tørvis Hotel",
      "lat": 61.3809,
      "lon": 7.3072,
      "type": "hotel"
    },
    {
      "name": "Vangsgaarden Gjestgiveri",
      "lat": 60.9069,
      "lon": 7.1874,
      "type": "hotel"
    },
    {
      "name": "Vetti",
      "lat": 61.3746,
      "lon": 7.9263,
      "type": "guest_house"
    },
    {
      "name": "Walaker Hotell",
      "lat": 61.3019,
      "lon": 7.2479,
      "type": "hotel"
    },
    {
      "name": "Øren Hotel",
      "lat": 61.2172,
      "lon": 6.0744,
      "type": "hotel"
    }
  ],
  "Grimstad": [
    {
      "name": "Clarion Collection Grimstad",
      "lat": 58.3426,
      "lon": 8.5932,
      "type": "hotel"
    },
    {
      "name": "Grimstad Vertshus",
      "lat": 58.3462,
      "lon": 8.5831,
      "type": "guest_house"
    },
    {
      "name": "Hotel Norge",
      "lat": 58.2481,
      "lon": 8.3767,
      "type": "hotel"
    },
    {
      "name": "Strand Hotel Fevik",
      "lat": 58.3722,
      "lon": 8.6679,
      "type": "hotel"
    }
  ],
  "Eidsvoll": [
    {
      "name": "Best Western Leto Arena",
      "lat": 60.2501,
      "lon": 11.1807,
      "type": "hotel"
    },
    {
      "name": "Hurdalsenteret",
      "lat": 60.3971,
      "lon": 11.0774,
      "type": "guest_house"
    },
    {
      "name": "Hurdalsjøen Hotell & Spa",
      "lat": 60.4024,
      "lon": 11.0524,
      "type": "hotel"
    },
    {
      "name": "Lygnasæter hotell",
      "lat": 60.4551,
      "lon": 10.6445,
      "type": "hotel"
    },
    {
      "name": "Malungen Gjestegård",
      "lat": 60.5778,
      "lon": 11.5004,
      "type": "hotel"
    },
    {
      "name": "Milepelen vertshus",
      "lat": 60.3917,
      "lon": 11.5405,
      "type": "guest_house"
    },
    {
      "name": "Rolstad gård",
      "lat": 60.2325,
      "lon": 11.3643,
      "type": "guest_house"
    }
  ],
  "Moss": [
    {
      "name": "Hotel Riviera",
      "lat": 59.4393,
      "lon": 10.6629,
      "type": "hotel"
    },
    {
      "name": "Hotell Jeløy Radio",
      "lat": 59.4366,
      "lon": 10.596,
      "type": "hotel"
    },
    {
      "name": "Hotell Refsnes gods",
      "lat": 59.4437,
      "lon": 10.6163,
      "type": "hotel"
    },
    {
      "name": "Moss hotell",
      "lat": 59.4356,
      "lon": 10.6616,
      "type": "hotel"
    },
    {
      "name": "Rygge arbeidshotell",
      "lat": 59.3779,
      "lon": 10.7583,
      "type": "hotel"
    },
    {
      "name": "Son Spa",
      "lat": 59.5164,
      "lon": 10.6814,
      "type": "hotel"
    },
    {
      "name": "Støtvig Hotel",
      "lat": 59.3289,
      "lon": 10.6681,
      "type": "hotel"
    },
    {
      "name": "Vestre Kjærnes gård",
      "lat": 59.4175,
      "lon": 10.8212,
      "type": "guest_house"
    },
    {
      "name": "Viken Hotell",
      "lat": 59.4399,
      "lon": 10.7811,
      "type": "hotel"
    }
  ],
  "Voss": [
    {
      "name": "Bergslien Turistheim",
      "lat": 60.4663,
      "lon": 7.0731,
      "type": "guest_house"
    },
    {
      "name": "Brakanes Hotel",
      "lat": 60.5665,
      "lon": 6.9142,
      "type": "hotel"
    },
    {
      "name": "Brandseth Fjellstove",
      "lat": 60.7953,
      "lon": 6.6886,
      "type": "hotel"
    },
    {
      "name": "Dyrkolbotn Fjellstove",
      "lat": 60.8009,
      "lon": 5.6365,
      "type": "guest_house"
    },
    {
      "name": "Eenstunet",
      "lat": 60.6693,
      "lon": 6.4421,
      "type": "guest_house"
    },
    {
      "name": "Eidfjord Hotel",
      "lat": 60.4652,
      "lon": 7.0704,
      "type": "hotel"
    },
    {
      "name": "Finse",
      "lat": 60.5979,
      "lon": 7.507,
      "type": "hostel"
    },
    {
      "name": "Finse 1222 Apartment",
      "lat": 60.6021,
      "lon": 7.5024,
      "type": "hotel"
    },
    {
      "name": "Finse 1222 Hotel",
      "lat": 60.6019,
      "lon": 7.5032,
      "type": "hotel"
    },
    {
      "name": "Fleischer's Hotel",
      "lat": 60.6287,
      "lon": 6.4087,
      "type": "hotel"
    },
    {
      "name": "Fossli Hotel",
      "lat": 60.4274,
      "lon": 7.255,
      "type": "hotel"
    },
    {
      "name": "Hardanger Guesthouse",
      "lat": 60.5649,
      "lon": 6.9067,
      "type": "guest_house"
    },
    {
      "name": "Haugastøl Turistsenter",
      "lat": 60.5124,
      "lon": 7.853,
      "type": "hotel"
    },
    {
      "name": "Haugo Utleige",
      "lat": 60.6244,
      "lon": 6.4397,
      "type": "guest_house"
    },
    {
      "name": "Helgatun Fjellpensjonat",
      "lat": 60.8617,
      "lon": 6.4955,
      "type": "guest_house"
    },
    {
      "name": "Indre Bjotveit Gard",
      "lat": 60.4502,
      "lon": 6.806,
      "type": "guest_house"
    },
    {
      "name": "Jaunsen Gjestgjevarstad",
      "lat": 60.5255,
      "lon": 6.7201,
      "type": "guest_house"
    },
    {
      "name": "Liseth pensjonat",
      "lat": 60.4229,
      "lon": 7.2731,
      "type": "guest_house"
    },
    {
      "name": "Lægreid Høyfjellsseter",
      "lat": 60.4217,
      "lon": 7.717,
      "type": "hotel"
    },
    {
      "name": "Mjølfjell Ungdomsherberge",
      "lat": 60.7022,
      "lon": 6.9382,
      "type": "hostel"
    },
    {
      "name": "Myrkdalen Hotel",
      "lat": 60.8567,
      "lon": 6.4908,
      "type": "hotel"
    },
    {
      "name": "Oppheim Resort",
      "lat": 60.7936,
      "lon": 6.577,
      "type": "hotel"
    },
    {
      "name": "Park Hotel",
      "lat": 60.6285,
      "lon": 6.4143,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Vøringfoss",
      "lat": 60.4679,
      "lon": 7.0681,
      "type": "hotel"
    },
    {
      "name": "Scandic Voss",
      "lat": 60.6292,
      "lon": 6.4125,
      "type": "hotel"
    },
    {
      "name": "Skjelde gard",
      "lat": 60.627,
      "lon": 6.2802,
      "type": "guest_house"
    },
    {
      "name": "Stalheim Hotel",
      "lat": 60.8352,
      "lon": 6.6814,
      "type": "hotel"
    },
    {
      "name": "Store Ringheim",
      "lat": 60.6383,
      "lon": 6.4276,
      "type": "guest_house"
    },
    {
      "name": "Strand Fjordhotel",
      "lat": 60.5709,
      "lon": 6.9243,
      "type": "hotel"
    },
    {
      "name": "Ulvik Bed and Breakfast",
      "lat": 60.5725,
      "lon": 6.9298,
      "type": "guest_house"
    },
    {
      "name": "Ulvik Hotel",
      "lat": 60.5689,
      "lon": 6.9199,
      "type": "hotel"
    },
    {
      "name": "Utne Hotel",
      "lat": 60.4236,
      "lon": 6.6216,
      "type": "hotel"
    },
    {
      "name": "Vatnahalsen Høyfjellshotell",
      "lat": 60.7435,
      "lon": 7.1316,
      "type": "hotel"
    },
    {
      "name": "Vik Pensjonat og Hytter",
      "lat": 60.467,
      "lon": 7.0705,
      "type": "guest_house"
    },
    {
      "name": "Vinje Turisthotel",
      "lat": 60.7927,
      "lon": 6.5183,
      "type": "hotel"
    },
    {
      "name": "Voss Vandrerhjem",
      "lat": 60.6255,
      "lon": 6.3959,
      "type": "hostel"
    }
  ],
  "Støren": [
    {
      "name": "Nørgar Voll",
      "lat": 62.8719,
      "lon": 9.8432,
      "type": "hostel"
    },
    {
      "name": "Ry Herberge",
      "lat": 62.9228,
      "lon": 9.7909,
      "type": "guest_house"
    },
    {
      "name": "Soknatun",
      "lat": 62.949,
      "lon": 10.1899,
      "type": "hotel"
    }
  ],
  "Røros": [
    {
      "name": "Bergstadens Hotel",
      "lat": 62.5743,
      "lon": 11.3841,
      "type": "hotel"
    },
    {
      "name": "Erzscheidergården hotell",
      "lat": 62.578,
      "lon": 11.3884,
      "type": "hotel"
    },
    {
      "name": "Femund Lodge",
      "lat": 62.1671,
      "lon": 11.944,
      "type": "guest_house"
    },
    {
      "name": "Femund Nasjonalparkhotell",
      "lat": 62.1666,
      "lon": 11.9402,
      "type": "hotel"
    },
    {
      "name": "Frich's Hotel og Spiseri Alvdal",
      "lat": 62.1144,
      "lon": 10.6168,
      "type": "hotel"
    },
    {
      "name": "Haugland Kafe",
      "lat": 61.831,
      "lon": 11.7231,
      "type": "hotel"
    },
    {
      "name": "Hodalen fjellstue",
      "lat": 62.3625,
      "lon": 11.2012,
      "type": "guest_house"
    },
    {
      "name": "Langen Gjestegård",
      "lat": 62.4343,
      "lon": 11.8518,
      "type": "guest_house"
    },
    {
      "name": "Nissetorget",
      "lat": 62.3108,
      "lon": 10.5284,
      "type": "hotel"
    },
    {
      "name": "Røros hotell",
      "lat": 62.5793,
      "lon": 11.3791,
      "type": "hotel"
    },
    {
      "name": "Rørosvidda hotell",
      "lat": 62.5708,
      "lon": 11.3811,
      "type": "hotel"
    },
    {
      "name": "Smedberget Pilegrimstun",
      "lat": 61.9004,
      "lon": 11.0666,
      "type": "hostel"
    },
    {
      "name": "Solheim pensjonat",
      "lat": 62.5723,
      "lon": 11.3879,
      "type": "guest_house"
    },
    {
      "name": "Spellmovollen",
      "lat": 62.6268,
      "lon": 10.8483,
      "type": "hostel"
    },
    {
      "name": "Telstad gård",
      "lat": 62.3457,
      "lon": 10.8916,
      "type": "guest_house"
    },
    {
      "name": "Tronsvangen (tidligere hotell)",
      "lat": 62.1408,
      "lon": 10.6632,
      "type": "hotel"
    },
    {
      "name": "Tronsvangen (tidligere seterhotell)",
      "lat": 62.1408,
      "lon": 10.6631,
      "type": "hotel"
    },
    {
      "name": "Valdalen gård",
      "lat": 62.0759,
      "lon": 12.1716,
      "type": "guest_house"
    },
    {
      "name": "Vauldalen fjellhotell",
      "lat": 62.6406,
      "lon": 12.032,
      "type": "hotel"
    },
    {
      "name": "Vertshuset Røros",
      "lat": 62.5763,
      "lon": 11.3867,
      "type": "hotel"
    },
    {
      "name": "Væktarstua hotell",
      "lat": 62.9087,
      "lon": 11.8932,
      "type": "hotel"
    }
  ],
  "Kristiansund": [
    {
      "name": "Aure Gjestegård",
      "lat": 63.2642,
      "lon": 8.53,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Fosna",
      "lat": 63.1122,
      "lon": 7.7311,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Fosna",
      "lat": 63.1121,
      "lon": 7.7306,
      "type": "hotel"
    },
    {
      "name": "Eco Camp",
      "lat": 63.3276,
      "lon": 8.0529,
      "type": "hostel"
    },
    {
      "name": "Havkroa Hotell",
      "lat": 63.5188,
      "lon": 7.954,
      "type": "hotel"
    },
    {
      "name": "Hopen Sjøhotell",
      "lat": 63.466,
      "lon": 8.0083,
      "type": "hotel"
    },
    {
      "name": "Håholmen Havstuer",
      "lat": 63.029,
      "lon": 7.3965,
      "type": "hotel"
    },
    {
      "name": "Korsholmen",
      "lat": 63.03,
      "lon": 7.4027,
      "type": "hotel"
    },
    {
      "name": "Kronborg Marina",
      "lat": 63.1013,
      "lon": 7.5954,
      "type": "hotel"
    },
    {
      "name": "Olsens pensjonat",
      "lat": 63.5189,
      "lon": 7.9532,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Grand",
      "lat": 63.1099,
      "lon": 7.731,
      "type": "hotel"
    },
    {
      "name": "Ringholmen Sjøhus",
      "lat": 63.2037,
      "lon": 7.959,
      "type": "hotel"
    },
    {
      "name": "Scandic Kristiansund",
      "lat": 63.1085,
      "lon": 7.7284,
      "type": "hotel"
    },
    {
      "name": "Smøla havstuer",
      "lat": 63.417,
      "lon": 7.8155,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Kristiansund",
      "lat": 63.1071,
      "lon": 7.7349,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Storgata",
      "lat": 63.1093,
      "lon": 7.7312,
      "type": "hotel"
    },
    {
      "name": "Titran fiskerheim",
      "lat": 63.668,
      "lon": 8.3056,
      "type": "hotel"
    }
  ],
  "Jessheim": [
    {
      "name": "Best Western Plus Oslo Airport",
      "lat": 60.1872,
      "lon": 11.0659,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel & Congress Oslo Airport",
      "lat": 60.1926,
      "lon": 11.0696,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel RunWay",
      "lat": 60.1931,
      "lon": 11.0718,
      "type": "hotel"
    },
    {
      "name": "Fagerli Pensjonat",
      "lat": 60.157,
      "lon": 11.0314,
      "type": "guest_house"
    },
    {
      "name": "Garder kurs- og konferansesenter",
      "lat": 60.1917,
      "lon": 11.0631,
      "type": "hotel"
    },
    {
      "name": "Gardermoen Hotel Bed & Breakfast",
      "lat": 60.2112,
      "lon": 11.0764,
      "type": "hotel"
    },
    {
      "name": "Huser",
      "lat": 60.2083,
      "lon": 11.3691,
      "type": "guest_house"
    },
    {
      "name": "Kringler gjestegård",
      "lat": 60.2348,
      "lon": 10.9909,
      "type": "guest_house"
    },
    {
      "name": "Lily country club",
      "lat": 60.0768,
      "lon": 11.1586,
      "type": "hotel"
    },
    {
      "name": "Park Inn Oslo Airport West",
      "lat": 60.1881,
      "lon": 11.0678,
      "type": "hotel"
    },
    {
      "name": "Quality Airport Hotel Gardermoen",
      "lat": 60.1636,
      "lon": 11.1618,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Airport Hotel, Oslo Gardermoen",
      "lat": 60.1924,
      "lon": 11.0951,
      "type": "hotel"
    },
    {
      "name": "Radisson RED Oslo Airport",
      "lat": 60.1898,
      "lon": 11.1025,
      "type": "hotel"
    },
    {
      "name": "Scandic Gardermoen",
      "lat": 60.1667,
      "lon": 11.1575,
      "type": "hotel"
    },
    {
      "name": "Scandic Oslo Airport",
      "lat": 60.1855,
      "lon": 11.0646,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Gardermoen",
      "lat": 60.1676,
      "lon": 11.1461,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Oslo Airport",
      "lat": 60.1645,
      "lon": 11.1541,
      "type": "hotel"
    },
    {
      "name": "Vormsund Golf Hotell",
      "lat": 60.1513,
      "lon": 11.4109,
      "type": "hotel"
    }
  ],
  "Fagernes": [
    {
      "name": "Bardøla Høyfjellshotell",
      "lat": 60.5416,
      "lon": 8.2238,
      "type": "hotel"
    },
    {
      "name": "Bergo Hotel",
      "lat": 61.2481,
      "lon": 8.9068,
      "type": "hotel"
    },
    {
      "name": "Dagali Hotel",
      "lat": 60.4173,
      "lon": 8.4556,
      "type": "hotel"
    },
    {
      "name": "Danebu Kongsgaard",
      "lat": 60.9432,
      "lon": 9.4375,
      "type": "hotel"
    },
    {
      "name": "Dr. Holms Hotel",
      "lat": 60.536,
      "lon": 8.2078,
      "type": "hotel"
    },
    {
      "name": "Eidsbugarden hotell",
      "lat": 61.3756,
      "lon": 8.2998,
      "type": "hotel"
    },
    {
      "name": "Eikre Fjellgård",
      "lat": 60.8062,
      "lon": 8.7377,
      "type": "hotel"
    },
    {
      "name": "Fagerlund Hotell",
      "lat": 60.9861,
      "lon": 9.2336,
      "type": "hotel"
    },
    {
      "name": "Fanitullen",
      "lat": 60.8628,
      "lon": 8.5526,
      "type": "hotel"
    },
    {
      "name": "Fossheim Hotell",
      "lat": 60.8504,
      "lon": 8.616,
      "type": "hotel"
    },
    {
      "name": "Furulund Pensjonat",
      "lat": 61.0334,
      "lon": 9.0572,
      "type": "guest_house"
    },
    {
      "name": "Fyri Resort Hemsedal",
      "lat": 60.8611,
      "lon": 8.535,
      "type": "hotel"
    },
    {
      "name": "Geilo Apartment",
      "lat": 60.5325,
      "lon": 8.2102,
      "type": "hotel"
    },
    {
      "name": "Geilo Hotel",
      "lat": 60.5328,
      "lon": 8.1988,
      "type": "hotel"
    },
    {
      "name": "Golsfjell fjellstue",
      "lat": 60.8502,
      "lon": 8.8896,
      "type": "hotel"
    },
    {
      "name": "Haglebu Fjellstue",
      "lat": 60.3444,
      "lon": 9.1859,
      "type": "guest_house"
    },
    {
      "name": "Hallingskarvet fjellstue",
      "lat": 60.6556,
      "lon": 8.0313,
      "type": "hotel"
    },
    {
      "name": "Harahorn",
      "lat": 60.934,
      "lon": 8.4526,
      "type": "hotel"
    },
    {
      "name": "Herangtunet Boutique Hotel Norway",
      "lat": 61.1302,
      "lon": 9.0818,
      "type": "hotel"
    },
    {
      "name": "Hermon Høyfjellssenter",
      "lat": 60.6541,
      "lon": 8.0206,
      "type": "hotel"
    },
    {
      "name": "Highland Lodge",
      "lat": 60.5343,
      "lon": 8.2125,
      "type": "hotel"
    },
    {
      "name": "Holiday Home",
      "lat": 60.681,
      "lon": 8.8302,
      "type": "guest_house"
    },
    {
      "name": "Hotell Nesbyen",
      "lat": 60.5701,
      "lon": 9.0967,
      "type": "hotel"
    },
    {
      "name": "Hovda Fjellhotell",
      "lat": 60.8687,
      "lon": 9.2135,
      "type": "hotel"
    },
    {
      "name": "Kamben Høyfjellshotell",
      "lat": 60.8022,
      "lon": 8.9793,
      "type": "hotel"
    },
    {
      "name": "Kvithøvd turisthotell",
      "lat": 61.119,
      "lon": 9.0085,
      "type": "hotel"
    },
    {
      "name": "Langedrag Naturpark",
      "lat": 60.4472,
      "lon": 8.8807,
      "type": "hotel"
    },
    {
      "name": "Lia Fjellhotell",
      "lat": 60.4631,
      "lon": 8.3642,
      "type": "hotel"
    },
    {
      "name": "Nordre Brostrud",
      "lat": 60.3084,
      "lon": 8.5413,
      "type": "hotel"
    },
    {
      "name": "Nythun",
      "lat": 61.035,
      "lon": 9.3574,
      "type": "hotel"
    },
    {
      "name": "Nøsen Yoga og Fjellhotell",
      "lat": 60.9388,
      "lon": 8.8495,
      "type": "hotel"
    },
    {
      "name": "Oiygardsgrend",
      "lat": 60.3219,
      "lon": 8.9224,
      "type": "hostel"
    },
    {
      "name": "Oset Høyfjellshotell",
      "lat": 60.834,
      "lon": 8.996,
      "type": "hotel"
    },
    {
      "name": "Pers Hotel",
      "lat": 60.7006,
      "lon": 8.9479,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Resort Beitostølen",
      "lat": 61.2491,
      "lon": 8.9019,
      "type": "hotel"
    },
    {
      "name": "Ranten Hotell",
      "lat": 60.5348,
      "lon": 8.784,
      "type": "hotel"
    },
    {
      "name": "Rødungstøl Høyfjellshotell",
      "lat": 60.709,
      "lon": 8.2573,
      "type": "hotel"
    },
    {
      "name": "Sanderstølen",
      "lat": 60.8274,
      "lon": 9.1389,
      "type": "hotel"
    },
    {
      "name": "Scandic Valdres",
      "lat": 60.9849,
      "lon": 9.2383,
      "type": "hotel"
    },
    {
      "name": "Skarslia Hotellet",
      "lat": 60.6821,
      "lon": 8.2881,
      "type": "hotel"
    },
    {
      "name": "Skarsnuten Mountain Resort & Spa",
      "lat": 60.8614,
      "lon": 8.4905,
      "type": "hotel"
    },
    {
      "name": "Skogstad Hotell",
      "lat": 60.8634,
      "lon": 8.5519,
      "type": "hotel"
    },
    {
      "name": "Skogstad Hotell & Fjellresort",
      "lat": 60.8635,
      "lon": 8.552,
      "type": "hotel"
    },
    {
      "name": "Smedsgården Hotel",
      "lat": 60.6134,
      "lon": 9.0634,
      "type": "hotel"
    },
    {
      "name": "Solstad hotell",
      "lat": 60.7026,
      "lon": 8.9375,
      "type": "hotel"
    },
    {
      "name": "Sommerhotellet Grindaheim",
      "lat": 61.1254,
      "lon": 8.5668,
      "type": "hotel"
    },
    {
      "name": "Storefjell Resort Hotel",
      "lat": 60.8046,
      "lon": 8.9562,
      "type": "hotel"
    },
    {
      "name": "Sørre Hemsing",
      "lat": 61.1637,
      "lon": 8.6699,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Hallingdal",
      "lat": 60.6297,
      "lon": 8.5597,
      "type": "hotel"
    },
    {
      "name": "Thon Hotell Bjørneparken",
      "lat": 60.431,
      "lon": 9.4574,
      "type": "hotel"
    },
    {
      "name": "Ustaoset hotel",
      "lat": 60.4994,
      "lon": 8.0389,
      "type": "hotel"
    },
    {
      "name": "Ustedalen Hotell Geilo",
      "lat": 60.5318,
      "lon": 8.1902,
      "type": "hotel"
    },
    {
      "name": "Vesle Skaugum",
      "lat": 60.8327,
      "lon": 9.0034,
      "type": "guest_house"
    },
    {
      "name": "Vestlia Hotel",
      "lat": 60.5224,
      "lon": 8.1968,
      "type": "hotel"
    },
    {
      "name": "Aal pensjonat B&B",
      "lat": 60.6306,
      "lon": 8.56,
      "type": "guest_house"
    },
    {
      "name": "Åsgardane Gjestegard",
      "lat": 60.7156,
      "lon": 8.9486,
      "type": "guest_house"
    }
  ],
  "Vinstra": [
    {
      "name": "Bjøntegaard Leirskole og Leirsted",
      "lat": 61.8379,
      "lon": 10.8811,
      "type": "hostel"
    },
    {
      "name": "Bjøråneskoia",
      "lat": 61.6574,
      "lon": 10.8996,
      "type": "hostel"
    },
    {
      "name": "Dale-Gudbrands gard",
      "lat": 61.5485,
      "lon": 9.9667,
      "type": "hotel"
    },
    {
      "name": "Dalseter Høyfjellshotell",
      "lat": 61.4682,
      "lon": 9.4599,
      "type": "hotel"
    },
    {
      "name": "Espedalen Sportell",
      "lat": 61.4394,
      "lon": 9.4921,
      "type": "hotel"
    },
    {
      "name": "Fefor Høifjellshotell",
      "lat": 61.5352,
      "lon": 9.6543,
      "type": "hotel"
    },
    {
      "name": "Fjellstuen Storfjellseter",
      "lat": 61.6735,
      "lon": 10.5362,
      "type": "guest_house"
    },
    {
      "name": "Gildesvollen",
      "lat": 61.5092,
      "lon": 10.1702,
      "type": "hostel"
    },
    {
      "name": "Gudbrandsgard Hotell",
      "lat": 61.4709,
      "lon": 10.1367,
      "type": "hotel"
    },
    {
      "name": "Gålå Høgfjellshotell",
      "lat": 61.5085,
      "lon": 9.7841,
      "type": "hotel"
    },
    {
      "name": "Harpefoss hotell",
      "lat": 61.5743,
      "lon": 9.8591,
      "type": "hotel"
    },
    {
      "name": "Jonsgård Bed & Breakfast",
      "lat": 61.5309,
      "lon": 10.1388,
      "type": "guest_house"
    },
    {
      "name": "Jønnhalt Gjesteseter",
      "lat": 61.6038,
      "lon": 10.1573,
      "type": "guest_house"
    },
    {
      "name": "Kvitfjell Hotel",
      "lat": 61.4705,
      "lon": 10.1386,
      "type": "hotel"
    },
    {
      "name": "Rondane River Lodge",
      "lat": 61.7884,
      "lon": 10.2246,
      "type": "hotel"
    },
    {
      "name": "Rudi gard",
      "lat": 61.5755,
      "lon": 9.9081,
      "type": "hotel"
    },
    {
      "name": "Sikkilsdalsseter",
      "lat": 61.4869,
      "lon": 9.0361,
      "type": "guest_house"
    },
    {
      "name": "Skjerdingen Høyfjellshotell",
      "lat": 61.7085,
      "lon": 10.569,
      "type": "hotel"
    },
    {
      "name": "Skåbu Fjellhotell",
      "lat": 61.5246,
      "lon": 9.4067,
      "type": "hotel"
    },
    {
      "name": "Slangen Seter",
      "lat": 61.4785,
      "lon": 9.35,
      "type": "hotel"
    },
    {
      "name": "Spidsbergseter Resort Rondane",
      "lat": 61.6717,
      "lon": 10.1023,
      "type": "hotel"
    },
    {
      "name": "Sulseter Fjellstugu",
      "lat": 61.6422,
      "lon": 9.8341,
      "type": "guest_house"
    },
    {
      "name": "Sygard Grytting",
      "lat": 61.5757,
      "lon": 9.8922,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Skeikampen",
      "lat": 61.3378,
      "lon": 10.0853,
      "type": "hotel"
    },
    {
      "name": "Valseter hotell",
      "lat": 61.4916,
      "lon": 9.756,
      "type": "hotel"
    },
    {
      "name": "Venabu Fjellhotell",
      "lat": 61.65,
      "lon": 10.1082,
      "type": "hotel"
    },
    {
      "name": "Vinstra Hostel",
      "lat": 61.5981,
      "lon": 9.7448,
      "type": "hostel"
    }
  ],
  "Sandnes": [
    {
      "name": "Byrkjedalstunet hotell",
      "lat": 58.7796,
      "lon": 6.3164,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Air",
      "lat": 58.8882,
      "lon": 5.621,
      "type": "hotel"
    },
    {
      "name": "GamlaVærket",
      "lat": 58.8519,
      "lon": 5.7353,
      "type": "hotel"
    },
    {
      "name": "Gjesdal Gjestgiveri",
      "lat": 58.7785,
      "lon": 5.8353,
      "type": "hotel"
    },
    {
      "name": "Hotel Sverre",
      "lat": 58.8525,
      "lon": 5.734,
      "type": "hotel"
    },
    {
      "name": "Kronen Gaard Hotel",
      "lat": 58.8555,
      "lon": 5.7837,
      "type": "hotel"
    },
    {
      "name": "Quality Airport Hotel Stavanger",
      "lat": 58.8932,
      "lon": 5.6288,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Pond",
      "lat": 58.8893,
      "lon": 5.7023,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Residence",
      "lat": 58.8509,
      "lon": 5.7377,
      "type": "hotel"
    },
    {
      "name": "Sandnes Vandrerhjem",
      "lat": 58.8524,
      "lon": 5.7339,
      "type": "hostel"
    },
    {
      "name": "Scandic Stavanger Airport",
      "lat": 58.8838,
      "lon": 5.6274,
      "type": "hotel"
    },
    {
      "name": "Scandic Stavanger Forus",
      "lat": 58.8916,
      "lon": 5.7304,
      "type": "hotel"
    },
    {
      "name": "Sirdal Resort",
      "lat": 58.9093,
      "lon": 6.8363,
      "type": "hotel"
    },
    {
      "name": "Smarthotel Forus",
      "lat": 58.8788,
      "lon": 5.7224,
      "type": "hotel"
    },
    {
      "name": "Sola Strand Hotel",
      "lat": 58.8854,
      "lon": 5.6049,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Sandnes",
      "lat": 58.8703,
      "lon": 5.7416,
      "type": "hotel"
    }
  ],
  "Steinkjer": [
    {
      "name": "Best Western Tingvold Park Hotel",
      "lat": 64.0238,
      "lon": 11.4912,
      "type": "hotel"
    },
    {
      "name": "Holsingseteren",
      "lat": 64.0661,
      "lon": 12.1849,
      "type": "guest_house"
    },
    {
      "name": "Mokk Gård",
      "lat": 63.9597,
      "lon": 12.106,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Grand Steinkjer",
      "lat": 64.0135,
      "lon": 11.4965,
      "type": "hotel"
    },
    {
      "name": "Yttervik gard",
      "lat": 64.1097,
      "lon": 11.4021,
      "type": "guest_house"
    }
  ],
  "Svolvær": [
    {
      "name": "Anker Brygge",
      "lat": 68.2338,
      "lon": 14.5722,
      "type": "hotel"
    },
    {
      "name": "Fast Hotel Svolvær",
      "lat": 68.2311,
      "lon": 14.5629,
      "type": "hotel"
    },
    {
      "name": "Finnholmen brygge hotel",
      "lat": 68.1554,
      "lon": 14.2111,
      "type": "hotel"
    },
    {
      "name": "Henningsvær Bryggehotell",
      "lat": 68.1559,
      "lon": 14.2085,
      "type": "hotel"
    },
    {
      "name": "Henningsvær Rorbuer AS",
      "lat": 68.1521,
      "lon": 14.2097,
      "type": "hotel"
    },
    {
      "name": "Henningsvær Villa Bryggekanten",
      "lat": 68.1553,
      "lon": 14.2066,
      "type": "hotel"
    },
    {
      "name": "Kabelvåg Camping og Feriehus",
      "lat": 68.2171,
      "lon": 14.445,
      "type": "hotel"
    },
    {
      "name": "Kabelvåg Hotell",
      "lat": 68.2112,
      "lon": 14.4808,
      "type": "hotel"
    },
    {
      "name": "Kabelvåg Vandrerhjem",
      "lat": 68.2122,
      "lon": 14.4863,
      "type": "hostel"
    },
    {
      "name": "Lofoten Arctic Henningsvær Vertshus",
      "lat": 68.1548,
      "lon": 14.2031,
      "type": "guest_house"
    },
    {
      "name": "Lofoten Sommerhotell",
      "lat": 68.2121,
      "lon": 14.4853,
      "type": "hotel"
    },
    {
      "name": "Lofotferie",
      "lat": 68.2105,
      "lon": 14.4768,
      "type": "hotel"
    },
    {
      "name": "Marina Hotel",
      "lat": 68.2391,
      "lon": 14.5647,
      "type": "hotel"
    },
    {
      "name": "Naustholmen Adventure Island",
      "lat": 67.8379,
      "lon": 14.7744,
      "type": "guest_house"
    },
    {
      "name": "Nordis Apartments",
      "lat": 68.2325,
      "lon": 14.5662,
      "type": "hotel"
    },
    {
      "name": "Nordis Hotel Lofoten",
      "lat": 68.2367,
      "lon": 14.5694,
      "type": "hotel"
    },
    {
      "name": "Nyvågar Rorbuhotell",
      "lat": 68.2084,
      "lon": 14.4493,
      "type": "hotel"
    },
    {
      "name": "Nøtnes Midnattsol Guesthouse",
      "lat": 68.1654,
      "lon": 14.6649,
      "type": "guest_house"
    },
    {
      "name": "Scandic Svolvær",
      "lat": 68.2328,
      "lon": 14.5709,
      "type": "hotel"
    },
    {
      "name": "Scandic Vestfjord Lofoten",
      "lat": 68.2294,
      "lon": 14.5655,
      "type": "hotel"
    },
    {
      "name": "Skata Boutique Hotel",
      "lat": 68.1603,
      "lon": 14.2165,
      "type": "hotel"
    },
    {
      "name": "Svinøya Rorbuer",
      "lat": 68.2344,
      "lon": 14.5797,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Lofoten",
      "lat": 68.2316,
      "lon": 14.5654,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Svolvær",
      "lat": 68.2301,
      "lon": 14.5642,
      "type": "hotel"
    },
    {
      "name": "Trevarefabrikken",
      "lat": 68.153,
      "lon": 14.1994,
      "type": "guest_house"
    },
    {
      "name": "Tyskhella - Rorbuferie",
      "lat": 68.2108,
      "lon": 14.4806,
      "type": "hotel"
    },
    {
      "name": "Villa Haugen Boutique Hotel",
      "lat": 67.8385,
      "lon": 14.7683,
      "type": "guest_house"
    }
  ],
  "Lillestrøm": [
    {
      "name": "Eidsverket gods",
      "lat": 59.8852,
      "lon": 11.5851,
      "type": "hotel"
    },
    {
      "name": "Lux",
      "lat": 59.9563,
      "lon": 11.0552,
      "type": "hotel"
    },
    {
      "name": "MOXY Oslo X",
      "lat": 59.984,
      "lon": 10.9754,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Olavsgaard",
      "lat": 59.9794,
      "lon": 10.9983,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Olavsgaard",
      "lat": 59.9794,
      "lon": 10.9993,
      "type": "hotel"
    },
    {
      "name": "Scandic Lillestrøm",
      "lat": 59.9525,
      "lon": 11.0464,
      "type": "hotel"
    },
    {
      "name": "Smakfulle Rom konferansegård",
      "lat": 60.0352,
      "lon": 11.1875,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Arena",
      "lat": 59.9509,
      "lon": 11.0488,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Lillestrøm",
      "lat": 59.9573,
      "lon": 11.0487,
      "type": "hotel"
    },
    {
      "name": "Ullereng gård pilegrimsherberge",
      "lat": 59.9992,
      "lon": 11.0822,
      "type": "guest_house"
    },
    {
      "name": "Aaraastunet",
      "lat": 59.9893,
      "lon": 10.9768,
      "type": "guest_house"
    }
  ],
  "Ålesund": [
    {
      "name": "AirBnB",
      "lat": 62.4653,
      "lon": 5.9831,
      "type": "guest_house"
    },
    {
      "name": "Annecy Sommerpensjonat",
      "lat": 62.4711,
      "lon": 6.1504,
      "type": "hostel"
    },
    {
      "name": "Aursnes hotell AS",
      "lat": 62.4092,
      "lon": 6.5531,
      "type": "hotel"
    },
    {
      "name": "Borg Sommerhotell",
      "lat": 62.4332,
      "lon": 6.3934,
      "type": "guest_house"
    },
    {
      "name": "Brattvåg Fjordhotell",
      "lat": 62.5964,
      "lon": 6.4463,
      "type": "hotel"
    },
    {
      "name": "Brosundet",
      "lat": 62.4725,
      "lon": 6.1522,
      "type": "hotel"
    },
    {
      "name": "Fiskarstrand",
      "lat": 62.4355,
      "lon": 6.2873,
      "type": "guest_house"
    },
    {
      "name": "Fiskarstrand 40",
      "lat": 62.4359,
      "lon": 6.2876,
      "type": "guest_house"
    },
    {
      "name": "Gunnarbuda",
      "lat": 62.6634,
      "lon": 6.274,
      "type": "hotel"
    },
    {
      "name": "Hotel 1904",
      "lat": 62.4728,
      "lon": 6.1585,
      "type": "hotel"
    },
    {
      "name": "Hotel Brosundet",
      "lat": 62.4721,
      "lon": 6.1521,
      "type": "hotel"
    },
    {
      "name": "Hotel Noreg",
      "lat": 62.4754,
      "lon": 6.156,
      "type": "hotel"
    },
    {
      "name": "Jervell Gjestehus",
      "lat": 62.469,
      "lon": 6.2401,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Ulstein",
      "lat": 62.3407,
      "lon": 5.849,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Waterfront",
      "lat": 62.4699,
      "lon": 6.1461,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Ålesund",
      "lat": 62.4757,
      "lon": 6.1552,
      "type": "hotel"
    },
    {
      "name": "Scandic parken",
      "lat": 62.4737,
      "lon": 6.1587,
      "type": "hotel"
    },
    {
      "name": "Scandic Parken",
      "lat": 62.4737,
      "lon": 6.1587,
      "type": "hotel"
    },
    {
      "name": "Storfjord Hotel",
      "lat": 62.4695,
      "lon": 6.6249,
      "type": "hotel"
    },
    {
      "name": "Sunde Fjord Hotel",
      "lat": 62.4146,
      "lon": 6.3275,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Baronen",
      "lat": 62.4621,
      "lon": 6.3634,
      "type": "hotel"
    },
    {
      "name": "THON Ålesund (former: Scandic Ålesund)",
      "lat": 62.4733,
      "lon": 6.1514,
      "type": "hotel"
    },
    {
      "name": "Vanderheim",
      "lat": 62.4725,
      "lon": 6.1622,
      "type": "hostel"
    },
    {
      "name": "Vigra fjordhotell",
      "lat": 62.5367,
      "lon": 6.0266,
      "type": "hotel"
    },
    {
      "name": "Åse Hotell",
      "lat": 62.4631,
      "lon": 6.3139,
      "type": "hotel"
    }
  ],
  "Longyearbyen": [
    {
      "name": "Barentsburg Hotel",
      "lat": 78.0617,
      "lon": 14.2191,
      "type": "hotel"
    },
    {
      "name": "Basecamp",
      "lat": 78.2171,
      "lon": 15.6361,
      "type": "hotel"
    },
    {
      "name": "Coal Miners' Cabin Bar & Grill",
      "lat": 78.2023,
      "lon": 15.5896,
      "type": "hotel"
    },
    {
      "name": "Coal Miners' Cabins",
      "lat": 78.2022,
      "lon": 15.589,
      "type": "hotel"
    },
    {
      "name": "Funken Lodge (formerly Spitsbergen Hotel)",
      "lat": 78.2114,
      "lon": 15.624,
      "type": "hotel"
    },
    {
      "name": "Guesthouse 102",
      "lat": 78.2013,
      "lon": 15.5888,
      "type": "guest_house"
    },
    {
      "name": "Haugen Pensjonat",
      "lat": 78.2113,
      "lon": 15.6196,
      "type": "guest_house"
    },
    {
      "name": "Hotel Pyramiden",
      "lat": 78.6552,
      "lon": 16.3284,
      "type": "hotel"
    },
    {
      "name": "Isfjord Radio Adventure Hotel",
      "lat": 78.0619,
      "lon": 13.6159,
      "type": "hotel"
    },
    {
      "name": "Mary-Ann's Polarrigg",
      "lat": 78.2222,
      "lon": 15.6332,
      "type": "hotel"
    },
    {
      "name": "Nordpolhotellet",
      "lat": 78.9245,
      "lon": 11.9279,
      "type": "hotel"
    },
    {
      "name": "Polfereren",
      "lat": 78.2174,
      "lon": 15.6371,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Polar",
      "lat": 78.221,
      "lon": 15.6469,
      "type": "hotel"
    },
    {
      "name": "Russkii Dom",
      "lat": 78.2234,
      "lon": 15.6582,
      "type": "hostel"
    },
    {
      "name": "Svabard Hotell The Vault",
      "lat": 78.2186,
      "lon": 15.6335,
      "type": "hotel"
    },
    {
      "name": "Svalbard Hotell Polfareren",
      "lat": 78.2171,
      "lon": 15.6336,
      "type": "hotel"
    },
    {
      "name": "Svalbard Hotell Polfareren",
      "lat": 78.2167,
      "lon": 15.635,
      "type": "hotel"
    },
    {
      "name": "UNIS Guest House",
      "lat": 78.2212,
      "lon": 15.6446,
      "type": "guest_house"
    },
    {
      "name": "Помор",
      "lat": 78.0629,
      "lon": 14.2186,
      "type": "hostel"
    }
  ],
  "Skien": [
    {
      "name": "Auen Urtegård",
      "lat": 59.228,
      "lon": 9.8529,
      "type": "guest_house"
    },
    {
      "name": "Clarion Collection Hotel Bryggeparken",
      "lat": 59.2052,
      "lon": 9.6125,
      "type": "hotel"
    },
    {
      "name": "Henriks Hotell",
      "lat": 59.2083,
      "lon": 9.6064,
      "type": "hotel"
    },
    {
      "name": "Hotell Fritidsparken",
      "lat": 59.186,
      "lon": 9.5989,
      "type": "hotel"
    },
    {
      "name": "Hotell Fritidsparken",
      "lat": 59.1856,
      "lon": 9.5986,
      "type": "hotel"
    },
    {
      "name": "Lunde Vandrerhjem",
      "lat": 59.2937,
      "lon": 9.1081,
      "type": "hostel"
    },
    {
      "name": "Osdalen",
      "lat": 59.302,
      "lon": 9.3562,
      "type": "guest_house"
    },
    {
      "name": "Ski Lodge Gautefall",
      "lat": 59.06,
      "lon": 8.7201,
      "type": "hotel"
    },
    {
      "name": "Skien Vandrerhjem",
      "lat": 59.1853,
      "lon": 9.5984,
      "type": "hostel"
    },
    {
      "name": "Thon Hotel Høyers",
      "lat": 59.2072,
      "lon": 9.6115,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Høyers",
      "lat": 59.207,
      "lon": 9.612,
      "type": "hotel"
    },
    {
      "name": "Vindfjelltunet gjestegård",
      "lat": 59.2997,
      "lon": 9.8254,
      "type": "hotel"
    }
  ],
  "Tingvoll": [
    {
      "name": "Angvik Gamle Handelssted",
      "lat": 62.8931,
      "lon": 8.0914,
      "type": "hotel"
    },
    {
      "name": "Rasteplassen Kro & Overnatting",
      "lat": 63.1192,
      "lon": 8.3085,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Surnadal",
      "lat": 62.9729,
      "lon": 8.7256,
      "type": "hotel"
    },
    {
      "name": "Tingvoll Næringsbygg AS",
      "lat": 62.91,
      "lon": 8.2045,
      "type": "hotel"
    }
  ],
  "Mosjøen": [
    {
      "name": "Fru Haugans Hotel",
      "lat": 65.8356,
      "lon": 13.1905,
      "type": "hotel"
    },
    {
      "name": "Gjestehusene i Sjøgata",
      "lat": 65.8371,
      "lon": 13.1886,
      "type": "guest_house"
    },
    {
      "name": "Grannes",
      "lat": 65.4863,
      "lon": 14.3157,
      "type": "guest_house"
    },
    {
      "name": "Korgenfjellet Fjellstue",
      "lat": 66.0542,
      "lon": 13.7007,
      "type": "hotel"
    },
    {
      "name": "Milano",
      "lat": 65.8453,
      "lon": 13.2005,
      "type": "hotel"
    },
    {
      "name": "Mosjøen Hotell",
      "lat": 65.8463,
      "lon": 13.1994,
      "type": "hotel"
    }
  ],
  "Porsgrunn": [
    {
      "name": "Canvas Telemark",
      "lat": 58.9848,
      "lon": 8.6789,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel",
      "lat": 59.0879,
      "lon": 9.8224,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Grenlandsporten",
      "lat": 59.0889,
      "lon": 9.8186,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Porsgrunn",
      "lat": 59.1404,
      "lon": 9.6573,
      "type": "hotel"
    },
    {
      "name": "Hotel Vic",
      "lat": 59.139,
      "lon": 9.6531,
      "type": "hotel"
    },
    {
      "name": "Kragerø Resort",
      "lat": 58.8482,
      "lon": 9.3999,
      "type": "hotel"
    },
    {
      "name": "Kragerø Sportell & Appartements",
      "lat": 58.8794,
      "lon": 9.3959,
      "type": "hotel"
    },
    {
      "name": "Langesund Bad",
      "lat": 58.9986,
      "lon": 9.7429,
      "type": "hotel"
    },
    {
      "name": "Lovisenberg Familiecamping",
      "lat": 58.9015,
      "lon": 9.4091,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Skjærgården",
      "lat": 59.0141,
      "lon": 9.745,
      "type": "hotel"
    },
    {
      "name": "Sjøloftet",
      "lat": 59.0549,
      "lon": 9.7008,
      "type": "guest_house"
    },
    {
      "name": "Tollboden hotell",
      "lat": 58.8691,
      "lon": 9.4138,
      "type": "hotel"
    },
    {
      "name": "Victoria Hotel",
      "lat": 58.8678,
      "lon": 9.4117,
      "type": "hotel"
    }
  ],
  "Båtsfjord": [
    {
      "name": "Berlevåg Gjestehus",
      "lat": 70.8571,
      "lon": 29.099,
      "type": "guest_house"
    },
    {
      "name": "Berlevåg Motell & Camping",
      "lat": 70.8564,
      "lon": 29.1002,
      "type": "hotel"
    },
    {
      "name": "Berlevåg Motell & Camping",
      "lat": 70.8568,
      "lon": 29.1,
      "type": "hotel"
    },
    {
      "name": "Båtsfjord brygge Arctic Resort",
      "lat": 70.6355,
      "lon": 29.7243,
      "type": "hotel"
    },
    {
      "name": "Båtsfjord hotell AS",
      "lat": 70.6303,
      "lon": 29.7169,
      "type": "hotel"
    },
    {
      "name": "Båtsfjord Royall Hotel",
      "lat": 70.6301,
      "lon": 29.7071,
      "type": "hotel"
    },
    {
      "name": "End of the World Guest Housse",
      "lat": 71.0643,
      "lon": 28.2482,
      "type": "guest_house"
    },
    {
      "name": "Havly",
      "lat": 70.6384,
      "lon": 29.7317,
      "type": "hotel"
    },
    {
      "name": "Ildtoppen",
      "lat": 70.4425,
      "lon": 28.4864,
      "type": "hotel"
    },
    {
      "name": "Kongsfjord Gjestehus",
      "lat": 70.7244,
      "lon": 29.3532,
      "type": "guest_house"
    },
    {
      "name": "Polar Hotel",
      "lat": 70.6304,
      "lon": 29.7068,
      "type": "hotel"
    },
    {
      "name": "Tana Vertshus",
      "lat": 70.3989,
      "lon": 28.1943,
      "type": "hotel"
    }
  ],
  "Kongsberg": [
    {
      "name": "Best Western Gyldenløve",
      "lat": 59.6712,
      "lon": 9.6504,
      "type": "hotel"
    },
    {
      "name": "Ble fjellstue",
      "lat": 59.7522,
      "lon": 9.3687,
      "type": "hotel"
    },
    {
      "name": "Blåberg",
      "lat": 59.8598,
      "lon": 9.3213,
      "type": "hotel"
    },
    {
      "name": "Fredheim Helsesenter",
      "lat": 59.6399,
      "lon": 9.5957,
      "type": "hotel"
    },
    {
      "name": "Fulsebakke",
      "lat": 59.7004,
      "lon": 9.5473,
      "type": "hotel"
    },
    {
      "name": "Home Hotel 1624",
      "lat": 59.6696,
      "lon": 9.6537,
      "type": "hotel"
    },
    {
      "name": "Knutehytta",
      "lat": 59.6726,
      "lon": 9.5395,
      "type": "hostel"
    },
    {
      "name": "Kongsberg Vandrerhjem Bergmannen",
      "lat": 59.6676,
      "lon": 9.6425,
      "type": "hostel"
    },
    {
      "name": "Lampeland Hotell",
      "lat": 59.8346,
      "lon": 9.5781,
      "type": "hotel"
    },
    {
      "name": "Norefjell Ski & Spa",
      "lat": 60.2269,
      "lon": 9.5191,
      "type": "hotel"
    },
    {
      "name": "NorefjellHytta",
      "lat": 60.2181,
      "lon": 9.5737,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Grand Kongsberg",
      "lat": 59.6692,
      "lon": 9.6496,
      "type": "hotel"
    },
    {
      "name": "Rajesetra",
      "lat": 59.5378,
      "lon": 9.5694,
      "type": "hotel"
    },
    {
      "name": "Rødberg Hotell",
      "lat": 60.2678,
      "lon": 8.9426,
      "type": "hotel"
    },
    {
      "name": "Sole Hotell",
      "lat": 60.1754,
      "lon": 9.631,
      "type": "hotel"
    },
    {
      "name": "Søstrene Storaas",
      "lat": 59.7293,
      "lon": 9.3518,
      "type": "hotel"
    },
    {
      "name": "Teknopark Suites",
      "lat": 59.6572,
      "lon": 9.6441,
      "type": "guest_house"
    },
    {
      "name": "Tempelseter høyfjellshotell",
      "lat": 60.2704,
      "lon": 9.4084,
      "type": "hotel"
    },
    {
      "name": "Uvdal Vandrerhjem",
      "lat": 60.2656,
      "lon": 8.7961,
      "type": "hostel"
    },
    {
      "name": "Veggli vertshus",
      "lat": 60.0421,
      "lon": 9.1556,
      "type": "hotel"
    }
  ],
  "Sarpsborg": [
    {
      "name": "Hafslund Hovedgård & Konferansesenter",
      "lat": 59.2732,
      "lon": 11.1367,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Sarpsborg",
      "lat": 59.2962,
      "lon": 11.0646,
      "type": "hotel"
    },
    {
      "name": "Scandic Sarpsborg",
      "lat": 59.2833,
      "lon": 11.1089,
      "type": "hotel"
    },
    {
      "name": "Stenbekk",
      "lat": 59.3219,
      "lon": 11.0898,
      "type": "guest_house"
    },
    {
      "name": "Tuneheimen",
      "lat": 59.2919,
      "lon": 11.0906,
      "type": "hostel"
    },
    {
      "name": "Tuneheimen",
      "lat": 59.2919,
      "lon": 11.0905,
      "type": "guest_house"
    }
  ],
  "Fredrikstad": [
    {
      "name": "Gamlebyen hotell",
      "lat": 59.2036,
      "lon": 10.9549,
      "type": "hotel"
    },
    {
      "name": "Hankø Hotell & Spa",
      "lat": 59.2079,
      "lon": 10.7767,
      "type": "hotel"
    },
    {
      "name": "Hotel Fredrikstad",
      "lat": 59.209,
      "lon": 10.9407,
      "type": "hotel"
    },
    {
      "name": "Hotell Valhalla",
      "lat": 59.2153,
      "lon": 10.9344,
      "type": "hotel"
    },
    {
      "name": "Hotell Viktoria",
      "lat": 59.2076,
      "lon": 10.9422,
      "type": "hotel"
    },
    {
      "name": "Magasinet Isegran B&B",
      "lat": 59.2029,
      "lon": 10.9452,
      "type": "guest_house"
    },
    {
      "name": "Quality Hotel Fredrikstad",
      "lat": 59.2113,
      "lon": 10.9398,
      "type": "hotel"
    },
    {
      "name": "Sandbrekke Gjestegård",
      "lat": 59.0527,
      "lon": 11.0289,
      "type": "guest_house"
    },
    {
      "name": "Scandic City",
      "lat": 59.2131,
      "lon": 10.9389,
      "type": "hotel"
    }
  ],
  "Levanger": [
    {
      "name": "Fosen Fjordhotel",
      "lat": 63.9592,
      "lon": 10.2241,
      "type": "hotel"
    },
    {
      "name": "Jegtvolden Fjordhotell",
      "lat": 63.8648,
      "lon": 11.2571,
      "type": "hotel"
    },
    {
      "name": "Jektvolden Fjordhotell",
      "lat": 63.8651,
      "lon": 11.2572,
      "type": "hotel"
    },
    {
      "name": "Kuringen Bryggehotell",
      "lat": 64.0391,
      "lon": 10.0621,
      "type": "hotel"
    },
    {
      "name": "Laberget leirsted",
      "lat": 63.7063,
      "lon": 11.1365,
      "type": "guest_house"
    },
    {
      "name": "Munkeby Herberge",
      "lat": 63.724,
      "lon": 11.3837,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Backlund",
      "lat": 63.7465,
      "lon": 11.2982,
      "type": "hotel"
    }
  ],
  "Asker": [
    {
      "name": "Furuholmen",
      "lat": 59.8819,
      "lon": 10.4085,
      "type": "hotel"
    },
    {
      "name": "Holmen Fjordhotell",
      "lat": 59.8513,
      "lon": 10.4948,
      "type": "hotel"
    },
    {
      "name": "Quaity Hotel Leangkollen",
      "lat": 59.8316,
      "lon": 10.4655,
      "type": "hotel"
    },
    {
      "name": "Scandic Asker",
      "lat": 59.8346,
      "lon": 10.4413,
      "type": "hotel"
    },
    {
      "name": "Sem Gjestegård",
      "lat": 59.8558,
      "lon": 10.4333,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Vettre",
      "lat": 59.8297,
      "lon": 10.4709,
      "type": "hotel"
    }
  ],
  "Tromsø": [
    {
      "name": "Amalie hotel",
      "lat": 69.6486,
      "lon": 18.9598,
      "type": "hotel"
    },
    {
      "name": "AMI Bed & Breakfast",
      "lat": 69.6506,
      "lon": 18.95,
      "type": "hotel"
    },
    {
      "name": "AMI hotel",
      "lat": 69.6506,
      "lon": 18.9502,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Aurora",
      "lat": 69.6501,
      "lon": 18.9594,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel With",
      "lat": 69.6505,
      "lon": 18.9597,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel The Edge",
      "lat": 69.6474,
      "lon": 18.9569,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Xpress Tromsø",
      "lat": 69.6474,
      "lon": 18.9524,
      "type": "hotel"
    },
    {
      "name": "Enter Backpack Hotel",
      "lat": 69.6488,
      "lon": 18.9497,
      "type": "hotel"
    },
    {
      "name": "Enter City Hotel",
      "lat": 69.6483,
      "lon": 18.9525,
      "type": "hotel"
    },
    {
      "name": "Lauklines Kystferie",
      "lat": 69.6207,
      "lon": 18.2859,
      "type": "hotel"
    },
    {
      "name": "Moxy Tromsø",
      "lat": 69.6703,
      "lon": 18.9213,
      "type": "hotel"
    },
    {
      "name": "Pingvin Hotel",
      "lat": 69.6831,
      "lon": 18.9807,
      "type": "hotel"
    },
    {
      "name": "Pingvinhotellet",
      "lat": 69.6827,
      "lon": 18.9801,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Saga",
      "lat": 69.6481,
      "lon": 18.9577,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Hotel Tromsø",
      "lat": 69.649,
      "lon": 18.9606,
      "type": "hotel"
    },
    {
      "name": "Scandic Grand Tromsø",
      "lat": 69.6481,
      "lon": 18.9537,
      "type": "hotel"
    },
    {
      "name": "Scandic Ishavshotel Tromsø",
      "lat": 69.6496,
      "lon": 18.9623,
      "type": "hotel"
    },
    {
      "name": "Skansen Hotell",
      "lat": 69.6534,
      "lon": 18.9605,
      "type": "hotel"
    },
    {
      "name": "Skaret by Vander",
      "lat": 69.6461,
      "lon": 18.9522,
      "type": "hotel"
    },
    {
      "name": "Smarthotel Tromsø",
      "lat": 69.6489,
      "lon": 18.9514,
      "type": "hotel"
    },
    {
      "name": "Sommarøy Arctic Hotel",
      "lat": 69.6356,
      "lon": 17.9914,
      "type": "hotel"
    },
    {
      "name": "St. Elisabeth hotel",
      "lat": 69.6437,
      "lon": 18.9391,
      "type": "hotel"
    },
    {
      "name": "Sydspissen Hotell",
      "lat": 69.6293,
      "lon": 18.9135,
      "type": "guest_house"
    },
    {
      "name": "The Dock 69°39",
      "lat": 69.6535,
      "lon": 18.9669,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Polar",
      "lat": 69.6484,
      "lon": 18.9534,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Tromsø",
      "lat": 69.6485,
      "lon": 18.9527,
      "type": "hotel"
    },
    {
      "name": "TotalApartments",
      "lat": 69.6841,
      "lon": 19.0008,
      "type": "hotel"
    },
    {
      "name": "Tromso Activities Hostel 4569",
      "lat": 69.6537,
      "lon": 18.9607,
      "type": "hostel"
    },
    {
      "name": "Tromso Coco Apartments",
      "lat": 69.6487,
      "lon": 18.9511,
      "type": "hostel"
    },
    {
      "name": "Tromsø Bed and Books",
      "lat": 69.6418,
      "lon": 18.941,
      "type": "guest_house"
    },
    {
      "name": "Viking Hotel",
      "lat": 69.6468,
      "lon": 18.9506,
      "type": "hotel"
    },
    {
      "name": "Yggdrasil Farmhotel Retreat spa & Yoga",
      "lat": 69.528,
      "lon": 18.2729,
      "type": "guest_house"
    }
  ],
  "Stjørdal": [
    {
      "name": "Folden Gård",
      "lat": 63.3691,
      "lon": 10.7827,
      "type": "guest_house"
    },
    {
      "name": "Fonnfjell hotell",
      "lat": 63.4186,
      "lon": 11.7368,
      "type": "hotel"
    },
    {
      "name": "Frosta Brygge",
      "lat": 63.6252,
      "lon": 10.75,
      "type": "hotel"
    },
    {
      "name": "Hellberg herberge",
      "lat": 63.6323,
      "lon": 10.8117,
      "type": "hostel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 1",
      "lat": 63.4904,
      "lon": 10.8719,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 2",
      "lat": 63.4904,
      "lon": 10.8722,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 3",
      "lat": 63.4905,
      "lon": 10.8725,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 4",
      "lat": 63.4905,
      "lon": 10.8728,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 5",
      "lat": 63.4905,
      "lon": 10.8732,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 6",
      "lat": 63.4906,
      "lon": 10.8735,
      "type": "hotel"
    },
    {
      "name": "Hæhre Entreprenør Construction hotel no 7",
      "lat": 63.4902,
      "lon": 10.8744,
      "type": "hotel"
    },
    {
      "name": "Klostergården",
      "lat": 63.5839,
      "lon": 10.6242,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Airport Vaernes",
      "lat": 63.4679,
      "lon": 10.92,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Hotel Trondheim Airport",
      "lat": 63.454,
      "lon": 10.9149,
      "type": "hotel"
    },
    {
      "name": "Scandic Hell",
      "lat": 63.4491,
      "lon": 10.9126,
      "type": "hotel"
    },
    {
      "name": "Selbusjøen Hotel & Gjestegård",
      "lat": 63.2326,
      "lon": 11.0293,
      "type": "hotel"
    },
    {
      "name": "Stav Hotel",
      "lat": 63.4246,
      "lon": 10.7287,
      "type": "hotel"
    },
    {
      "name": "Sure Hotel Trondheim Airport",
      "lat": 63.4711,
      "lon": 10.9031,
      "type": "hotel"
    }
  ],
  "Orkanger": [
    {
      "name": "Aunemo Gård Overnatting",
      "lat": 63.2719,
      "lon": 9.8266,
      "type": "hotel"
    },
    {
      "name": "Bergmannskroa",
      "lat": 63.1243,
      "lon": 9.7047,
      "type": "guest_house"
    },
    {
      "name": "Bolme pensjonat",
      "lat": 63.0507,
      "lon": 9.1707,
      "type": "guest_house"
    },
    {
      "name": "Bårdshaug herregård",
      "lat": 63.299,
      "lon": 9.846,
      "type": "hotel"
    },
    {
      "name": "Dolmsundet hotell",
      "lat": 63.637,
      "lon": 8.8196,
      "type": "hotel"
    },
    {
      "name": "Fannarheimr",
      "lat": 63.2657,
      "lon": 9.8148,
      "type": "hotel"
    },
    {
      "name": "Gumdal Farm",
      "lat": 63.1765,
      "lon": 9.7727,
      "type": "hostel"
    },
    {
      "name": "Gumdal Farm",
      "lat": 63.1765,
      "lon": 9.7727,
      "type": "hostel"
    },
    {
      "name": "Hjorten hotell Hitra",
      "lat": 63.6014,
      "lon": 8.9773,
      "type": "hotel"
    },
    {
      "name": "Hotell Frøya",
      "lat": 63.7294,
      "lon": 8.8292,
      "type": "hotel"
    },
    {
      "name": "Hotell Hemne",
      "lat": 63.2881,
      "lon": 9.0867,
      "type": "hotel"
    },
    {
      "name": "Orkla Gjestebolig",
      "lat": 63.1248,
      "lon": 9.7038,
      "type": "guest_house"
    },
    {
      "name": "Saga Trollheimen Hotel",
      "lat": 63.0492,
      "lon": 9.1965,
      "type": "hotel"
    },
    {
      "name": "Sjøblomsten",
      "lat": 63.8686,
      "lon": 8.6668,
      "type": "guest_house"
    },
    {
      "name": "Ørland Kysthotell",
      "lat": 63.6858,
      "lon": 9.6669,
      "type": "hotel"
    }
  ],
  "Evje": [
    {
      "name": "Bergtun Hotell",
      "lat": 59.2115,
      "lon": 7.535,
      "type": "hotel"
    },
    {
      "name": "Brokkestøylen",
      "lat": 59.0969,
      "lon": 7.4372,
      "type": "guest_house"
    },
    {
      "name": "Dølen Hotel",
      "lat": 58.5874,
      "lon": 7.8053,
      "type": "hotel"
    },
    {
      "name": "Fredheim Leirsted",
      "lat": 58.4342,
      "lon": 8.0917,
      "type": "guest_house"
    },
    {
      "name": "Fyresdal B&B",
      "lat": 59.1837,
      "lon": 8.093,
      "type": "guest_house"
    },
    {
      "name": "Fyresdal kurs- og leirsted",
      "lat": 59.1803,
      "lon": 8.0879,
      "type": "hotel"
    },
    {
      "name": "Hallbjønn Høyfjellsenter",
      "lat": 59.3539,
      "lon": 7.7471,
      "type": "guest_house"
    },
    {
      "name": "Kvipt Gjestegard",
      "lat": 59.0633,
      "lon": 7.9225,
      "type": "guest_house"
    },
    {
      "name": "Ljosland Fjellstove",
      "lat": 58.7892,
      "lon": 7.3558,
      "type": "hotel"
    },
    {
      "name": "Ogge Gjestheim",
      "lat": 58.4328,
      "lon": 8.0854,
      "type": "guest_house"
    },
    {
      "name": "Ose Turistheim",
      "lat": 58.9503,
      "lon": 7.6781,
      "type": "guest_house"
    },
    {
      "name": "Pan Garden",
      "lat": 58.7472,
      "lon": 8.509,
      "type": "hotel"
    },
    {
      "name": "Prestegården Gjesterom B & B",
      "lat": 58.5266,
      "lon": 8.3518,
      "type": "guest_house"
    },
    {
      "name": "Revsnes hotel",
      "lat": 58.6737,
      "lon": 7.8076,
      "type": "hotel"
    },
    {
      "name": "Røyland Gård",
      "lat": 58.5297,
      "lon": 8.0497,
      "type": "guest_house"
    },
    {
      "name": "Sølvgarden Hotell & Feriesenter",
      "lat": 59.0911,
      "lon": 7.541,
      "type": "hotel"
    }
  ],
  "Storslett": [
    {
      "name": "Arctic Panorama Lodge",
      "lat": 69.8816,
      "lon": 20.6949,
      "type": "hotel"
    },
    {
      "name": "Gildetun",
      "lat": 69.898,
      "lon": 21.6055,
      "type": "hotel"
    },
    {
      "name": "Henriksen Gjestestue",
      "lat": 69.7873,
      "lon": 20.947,
      "type": "guest_house"
    },
    {
      "name": "Lyngen Lodge",
      "lat": 69.7399,
      "lon": 20.515,
      "type": "hotel"
    },
    {
      "name": "Ravelsnes gård",
      "lat": 69.8697,
      "lon": 21.9417,
      "type": "guest_house"
    },
    {
      "name": "Reisa Lodge",
      "lat": 69.5321,
      "lon": 21.3627,
      "type": "guest_house"
    },
    {
      "name": "Reisafjord hotel",
      "lat": 69.7927,
      "lon": 20.9412,
      "type": "hotel"
    },
    {
      "name": "Sappen Leirskole",
      "lat": 69.5595,
      "lon": 21.3022,
      "type": "hostel"
    }
  ],
  "Mo i Rana": [
    {
      "name": "Comfort Hotel Ole Tobias",
      "lat": 66.3129,
      "lon": 14.134,
      "type": "hotel"
    },
    {
      "name": "Hotel Svartisen",
      "lat": 66.3079,
      "lon": 14.1358,
      "type": "hotel"
    },
    {
      "name": "Mo Hotell og Gjestegaard",
      "lat": 66.3086,
      "lon": 14.1424,
      "type": "hotel"
    },
    {
      "name": "Scandic Meyergården",
      "lat": 66.3123,
      "lon": 14.1354,
      "type": "hotel"
    },
    {
      "name": "Thon Partner hotel Mo I Rana",
      "lat": 66.3084,
      "lon": 14.1315,
      "type": "hotel"
    },
    {
      "name": "Til Elise",
      "lat": 66.2914,
      "lon": 13.612,
      "type": "guest_house"
    },
    {
      "name": "Toranes Overnatting",
      "lat": 66.3162,
      "lon": 14.1313,
      "type": "guest_house"
    },
    {
      "name": "Umbukta Fjellstue",
      "lat": 66.164,
      "lon": 14.5871,
      "type": "guest_house"
    }
  ],
  "Lillehammer": [
    {
      "name": "Aksjemøllen - by Classic Norway Hotels",
      "lat": 61.1171,
      "lon": 10.4623,
      "type": "hotel"
    },
    {
      "name": "Birkebeineren Hotel & Apartments",
      "lat": 61.1205,
      "lon": 10.4783,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Lillehammer",
      "lat": 61.1194,
      "lon": 10.4628,
      "type": "hotel"
    },
    {
      "name": "First Hotel Breiseth",
      "lat": 61.1145,
      "lon": 10.4635,
      "type": "hotel"
    },
    {
      "name": "Gammelstu",
      "lat": 61.4706,
      "lon": 11.0284,
      "type": "guest_house"
    },
    {
      "name": "Gardsjord",
      "lat": 61.1271,
      "lon": 10.4938,
      "type": "guest_house"
    },
    {
      "name": "Hafjell hotell",
      "lat": 61.2397,
      "lon": 10.4383,
      "type": "hotel"
    },
    {
      "name": "Hafjell Ski Resort",
      "lat": 61.2532,
      "lon": 10.5107,
      "type": "hotel"
    },
    {
      "name": "Hunderfossen Hotell & Resort",
      "lat": 61.2203,
      "lon": 10.437,
      "type": "hotel"
    },
    {
      "name": "Ilsetra",
      "lat": 61.222,
      "lon": 10.5251,
      "type": "hotel"
    },
    {
      "name": "Lia Gård Pilegrimssenter",
      "lat": 61.556,
      "lon": 11.1806,
      "type": "guest_house"
    },
    {
      "name": "Lia Gård Retreatsenter",
      "lat": 61.5661,
      "lon": 11.1784,
      "type": "guest_house"
    },
    {
      "name": "Lillehammer Vandrerhjem",
      "lat": 61.1145,
      "lon": 10.4615,
      "type": "hostel"
    },
    {
      "name": "Låven",
      "lat": 61.244,
      "lon": 10.4568,
      "type": "hotel"
    },
    {
      "name": "MIstra hotell og kafé",
      "lat": 61.6952,
      "lon": 11.2091,
      "type": "hotel"
    },
    {
      "name": "Nedre Berg Gård",
      "lat": 61.0335,
      "lon": 10.5177,
      "type": "hotel"
    },
    {
      "name": "Nermo hotell",
      "lat": 61.2446,
      "lon": 10.4567,
      "type": "hotel"
    },
    {
      "name": "Nermo hotell",
      "lat": 61.2639,
      "lon": 10.4987,
      "type": "hotel"
    },
    {
      "name": "Nordseter Flellstue",
      "lat": 61.1813,
      "lon": 10.6161,
      "type": "hotel"
    },
    {
      "name": "Pellestova",
      "lat": 61.2262,
      "lon": 10.5447,
      "type": "hotel"
    },
    {
      "name": "Pilegrimsloftet Borkerud",
      "lat": 61.3248,
      "lon": 10.3321,
      "type": "hostel"
    },
    {
      "name": "Rustad Hotell og Fjellstue",
      "lat": 61.1508,
      "lon": 10.7002,
      "type": "hotel"
    },
    {
      "name": "Scandic Hafjell",
      "lat": 61.2419,
      "lon": 10.4381,
      "type": "hotel"
    },
    {
      "name": "Scandic Lillehammer Hotel",
      "lat": 61.1173,
      "lon": 10.4767,
      "type": "hotel"
    },
    {
      "name": "Scandic Victoria Lillehammer",
      "lat": 61.1171,
      "lon": 10.4643,
      "type": "hotel"
    },
    {
      "name": "Skarsmoen gård",
      "lat": 61.2764,
      "lon": 10.3172,
      "type": "guest_house"
    },
    {
      "name": "Skolla leirsted",
      "lat": 61.2432,
      "lon": 10.817,
      "type": "hostel"
    },
    {
      "name": "Skåden Gard",
      "lat": 61.284,
      "lon": 10.4081,
      "type": "guest_house"
    },
    {
      "name": "Spåtind Sport Hotel",
      "lat": 61.1292,
      "lon": 9.8717,
      "type": "hotel"
    },
    {
      "name": "Stasjonen hotell Lillehammer",
      "lat": 61.1146,
      "lon": 10.4615,
      "type": "hotel"
    },
    {
      "name": "Suttestad gård",
      "lat": 61.1038,
      "lon": 10.4678,
      "type": "guest_house"
    },
    {
      "name": "Sylli",
      "lat": 61.4837,
      "lon": 11.3017,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Skeikampen",
      "lat": 61.3374,
      "lon": 10.0941,
      "type": "hotel"
    },
    {
      "name": "Veisten Landhotel",
      "lat": 61.205,
      "lon": 10.1397,
      "type": "hotel"
    },
    {
      "name": "Øvergaard",
      "lat": 61.116,
      "lon": 10.471,
      "type": "guest_house"
    },
    {
      "name": "Åkersetra leirsted",
      "lat": 61.1553,
      "lon": 10.9164,
      "type": "hostel"
    },
    {
      "name": "Aasletten Pensjonat og Hytter",
      "lat": 61.2356,
      "lon": 10.4463,
      "type": "guest_house"
    }
  ],
  "Stavanger": [
    {
      "name": "Apartment 11",
      "lat": 59.0139,
      "lon": 6.4255,
      "type": "guest_house"
    },
    {
      "name": "Apartment 9",
      "lat": 59.0142,
      "lon": 6.426,
      "type": "guest_house"
    },
    {
      "name": "Best Western Havly hotell",
      "lat": 58.9726,
      "lon": 5.731,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Energy",
      "lat": 58.9533,
      "lon": 5.6884,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Stavanger",
      "lat": 58.9675,
      "lon": 5.7287,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Square",
      "lat": 58.9693,
      "lon": 5.7271,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Stavanger",
      "lat": 58.9701,
      "lon": 5.7353,
      "type": "hotel"
    },
    {
      "name": "Eilert Smith Hotel",
      "lat": 58.9741,
      "lon": 5.7308,
      "type": "hotel"
    },
    {
      "name": "Fjordbris hotell",
      "lat": 59.0915,
      "lon": 5.7777,
      "type": "hotel"
    },
    {
      "name": "Flørli Historic Hostel",
      "lat": 59.0129,
      "lon": 6.4258,
      "type": "hostel"
    },
    {
      "name": "Frikvarteret",
      "lat": 59.0217,
      "lon": 6.9263,
      "type": "guest_house"
    },
    {
      "name": "Furutangen Vandrerhjem",
      "lat": 59.2007,
      "lon": 6.0042,
      "type": "hostel"
    },
    {
      "name": "Guesthouse - Møllegata 39",
      "lat": 58.9673,
      "lon": 5.7259,
      "type": "guest_house"
    },
    {
      "name": "Gullingen leirskole",
      "lat": 59.4211,
      "lon": 6.4558,
      "type": "guest_house"
    },
    {
      "name": "Hauane B&B",
      "lat": 59.061,
      "lon": 6.6709,
      "type": "guest_house"
    },
    {
      "name": "Home Hotel Skagen Brygge",
      "lat": 58.9721,
      "lon": 5.7302,
      "type": "hotel"
    },
    {
      "name": "Hummeren hotell",
      "lat": 58.9337,
      "lon": 5.5751,
      "type": "hotel"
    },
    {
      "name": "Høiland Gard Gardshotellet",
      "lat": 59.1581,
      "lon": 6.214,
      "type": "guest_house"
    },
    {
      "name": "Lilland Bryggerihotell",
      "lat": 59.0661,
      "lon": 5.9143,
      "type": "hotel"
    },
    {
      "name": "Lilland Vandrerhjem Vaulali",
      "lat": 59.0657,
      "lon": 6.0246,
      "type": "hostel"
    },
    {
      "name": "Lysefjorden turisthytte",
      "lat": 59.0549,
      "lon": 6.6487,
      "type": "guest_house"
    },
    {
      "name": "Mosvangen vandrerhjem",
      "lat": 58.9527,
      "lon": 5.7129,
      "type": "hostel"
    },
    {
      "name": "Myhregaarden Hotel",
      "lat": 58.9711,
      "lon": 5.7356,
      "type": "hotel"
    },
    {
      "name": "Preikestolen Fjellstue",
      "lat": 58.991,
      "lon": 6.1374,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Atlantic Hotel",
      "lat": 58.9681,
      "lon": 5.7305,
      "type": "hotel"
    },
    {
      "name": "Radisson Park Inn",
      "lat": 58.9603,
      "lon": 5.7378,
      "type": "hotel"
    },
    {
      "name": "Rogalandsheimen gjestgiveri AS",
      "lat": 58.964,
      "lon": 5.7332,
      "type": "guest_house"
    },
    {
      "name": "Scandic Royal Stavanger",
      "lat": 58.9677,
      "lon": 5.7273,
      "type": "hotel"
    },
    {
      "name": "Scandic Stavanger City",
      "lat": 58.9708,
      "lon": 5.7449,
      "type": "hotel"
    },
    {
      "name": "Scandic Stavanger Park",
      "lat": 58.9657,
      "lon": 5.731,
      "type": "hotel"
    },
    {
      "name": "Sirdal Høyfjellshotell",
      "lat": 58.9579,
      "lon": 6.9474,
      "type": "hotel"
    },
    {
      "name": "Sjøberg Ferie",
      "lat": 59.0926,
      "lon": 5.7786,
      "type": "guest_house"
    },
    {
      "name": "Sleepy Head B & B Kjerag - Lysebotn",
      "lat": 59.0557,
      "lon": 6.6512,
      "type": "guest_house"
    },
    {
      "name": "Smaken av Ryfylke",
      "lat": 59.2336,
      "lon": 6.1739,
      "type": "hotel"
    },
    {
      "name": "St. Svithun hotell",
      "lat": 58.9521,
      "lon": 5.7323,
      "type": "hotel"
    },
    {
      "name": "Stavanger B&B",
      "lat": 58.966,
      "lon": 5.7387,
      "type": "guest_house"
    },
    {
      "name": "Stavanger Lille Hotel",
      "lat": 58.9639,
      "lon": 5.727,
      "type": "hotel"
    },
    {
      "name": "The White House Hostel B & B",
      "lat": 59.054,
      "lon": 6.6489,
      "type": "hostel"
    },
    {
      "name": "Thon Hotel Maritim",
      "lat": 58.9689,
      "lon": 5.7357,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Stavanger",
      "lat": 58.9706,
      "lon": 5.7351,
      "type": "hotel"
    },
    {
      "name": "Thon partner Stavanger Forum Hotel",
      "lat": 58.9549,
      "lon": 5.6998,
      "type": "hotel"
    },
    {
      "name": "Utstein Kloster Hotell",
      "lat": 59.098,
      "lon": 5.6087,
      "type": "hotel"
    },
    {
      "name": "Vatnegården",
      "lat": 58.9904,
      "lon": 6.1379,
      "type": "guest_house"
    },
    {
      "name": "Verkshotellet",
      "lat": 59.0195,
      "lon": 6.04,
      "type": "hotel"
    },
    {
      "name": "Victoria Hotel",
      "lat": 58.9731,
      "lon": 5.7304,
      "type": "hotel"
    },
    {
      "name": "Villa Eckhoff",
      "lat": 58.9649,
      "lon": 5.7265,
      "type": "hotel"
    },
    {
      "name": "Viste Strandhotell",
      "lat": 58.9862,
      "lon": 5.6077,
      "type": "hotel"
    },
    {
      "name": "Ydalir Hotel",
      "lat": 58.9356,
      "lon": 5.701,
      "type": "hotel"
    }
  ],
  "Bærum": [
    {
      "name": "Gjestehus",
      "lat": 59.9072,
      "lon": 10.5401,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel Honefoss",
      "lat": 60.1669,
      "lon": 10.2539,
      "type": "hotel"
    },
    {
      "name": "Granly barnehjem",
      "lat": 59.8966,
      "lon": 10.589,
      "type": "guest_house"
    },
    {
      "name": "Hostel Oslofjord",
      "lat": 59.9037,
      "lon": 10.6047,
      "type": "hostel"
    },
    {
      "name": "Kleivstua",
      "lat": 60.0468,
      "lon": 10.3214,
      "type": "hotel"
    },
    {
      "name": "Klækken Hotell",
      "lat": 60.1677,
      "lon": 10.3252,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Expo",
      "lat": 59.9025,
      "lon": 10.6291,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Park Hotel",
      "lat": 59.9037,
      "lon": 10.6318,
      "type": "hotel"
    },
    {
      "name": "Ringerike gjestegård",
      "lat": 60.1475,
      "lon": 10.2521,
      "type": "hotel"
    },
    {
      "name": "Ringnes Gard",
      "lat": 60.2603,
      "lon": 9.6255,
      "type": "hotel"
    },
    {
      "name": "Scandic Hønefoss",
      "lat": 60.1663,
      "lon": 10.2575,
      "type": "hotel"
    },
    {
      "name": "Sollihøgda Bed & Breakfast",
      "lat": 59.9701,
      "lon": 10.3599,
      "type": "guest_house"
    },
    {
      "name": "Sundvolden hotell",
      "lat": 60.0625,
      "lon": 10.3116,
      "type": "hotel"
    }
  ],
  "Hammerfest": [
    {
      "name": "Akkarfjord Hostel",
      "lat": 70.7903,
      "lon": 23.4163,
      "type": "hostel"
    },
    {
      "name": "Arctic Sea Hotel",
      "lat": 70.6727,
      "lon": 23.657,
      "type": "hotel"
    },
    {
      "name": "Big Fish Adventure – Hasvik Hotel & Housing",
      "lat": 70.4869,
      "lon": 22.1575,
      "type": "hotel"
    },
    {
      "name": "Hotell Skytterhuset",
      "lat": 70.6571,
      "lon": 23.6974,
      "type": "hotel"
    },
    {
      "name": "Lille Pernille",
      "lat": 70.7801,
      "lon": 23.3835,
      "type": "hostel"
    },
    {
      "name": "Repparfjord Camping og Misjonssenter",
      "lat": 70.4479,
      "lon": 24.3884,
      "type": "hostel"
    },
    {
      "name": "Scandic Hammerfest",
      "lat": 70.663,
      "lon": 23.6768,
      "type": "hotel"
    },
    {
      "name": "Skaidi Hotel",
      "lat": 70.4339,
      "lon": 24.5012,
      "type": "hotel"
    },
    {
      "name": "Smart Hotel Hammerfest",
      "lat": 70.6645,
      "lon": 23.6904,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Hammerfest",
      "lat": 70.6628,
      "lon": 23.6849,
      "type": "hotel"
    }
  ],
  "Norheimsund": [
    {
      "name": "@Hardanger Vandrerhjem",
      "lat": 60.3727,
      "lon": 6.7173,
      "type": "hostel"
    },
    {
      "name": "Hardangerfjord Hotel",
      "lat": 60.386,
      "lon": 6.2011,
      "type": "hotel"
    },
    {
      "name": "Hotel Ullensvang",
      "lat": 60.3284,
      "lon": 6.6567,
      "type": "hotel"
    },
    {
      "name": "Huse Gjestegard",
      "lat": 60.3726,
      "lon": 6.7329,
      "type": "guest_house"
    },
    {
      "name": "Jondal Gjestgjevarstad",
      "lat": 60.2758,
      "lon": 6.2528,
      "type": "hotel"
    },
    {
      "name": "Kinsarvik Fjordhotel",
      "lat": 60.3755,
      "lon": 6.7215,
      "type": "hotel"
    },
    {
      "name": "Kramsjø B&B",
      "lat": 60.343,
      "lon": 6.3754,
      "type": "guest_house"
    },
    {
      "name": "Kvamseter Lodge",
      "lat": 60.3922,
      "lon": 5.925,
      "type": "guest_house"
    },
    {
      "name": "Large apartment in Herand",
      "lat": 60.3426,
      "lon": 6.3776,
      "type": "hostel"
    },
    {
      "name": "Nordnestunet",
      "lat": 60.3868,
      "lon": 5.9734,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Sandven",
      "lat": 60.3706,
      "lon": 6.1467,
      "type": "hotel"
    },
    {
      "name": "Ullensvang Gjesteheim",
      "lat": 60.3206,
      "lon": 6.6548,
      "type": "guest_house"
    },
    {
      "name": "Vassel Gård",
      "lat": 60.3496,
      "lon": 6.3876,
      "type": "guest_house"
    }
  ],
  "Hamar": [
    {
      "name": "Faarlund B&B",
      "lat": 60.6772,
      "lon": 10.9149,
      "type": "guest_house"
    },
    {
      "name": "Hamar Vandrerhjem Vikingskipet",
      "lat": 60.7948,
      "lon": 11.099,
      "type": "hostel"
    },
    {
      "name": "Hoel gård",
      "lat": 60.7658,
      "lon": 10.9038,
      "type": "guest_house"
    },
    {
      "name": "Home Hotel Astoria",
      "lat": 60.7933,
      "lon": 11.0749,
      "type": "hotel"
    },
    {
      "name": "Hotel Norge Høsbjør",
      "lat": 60.8868,
      "lon": 10.9989,
      "type": "hotel"
    },
    {
      "name": "KONGSVEGEN PILEGRIMSHERBERGE",
      "lat": 60.8695,
      "lon": 10.958,
      "type": "hostel"
    },
    {
      "name": "Lier gård",
      "lat": 60.9208,
      "lon": 10.9353,
      "type": "guest_house"
    },
    {
      "name": "Scandic Hamar",
      "lat": 60.7962,
      "lon": 11.086,
      "type": "hotel"
    },
    {
      "name": "Scandic Ringsaker",
      "lat": 60.8296,
      "lon": 11.0679,
      "type": "hotel"
    },
    {
      "name": "Staur gård",
      "lat": 60.7263,
      "lon": 11.1069,
      "type": "guest_house"
    },
    {
      "name": "Thon Partner Hotel Victoria Hamar",
      "lat": 60.7926,
      "lon": 11.0744,
      "type": "hotel"
    },
    {
      "name": "Wood hotel",
      "lat": 60.8774,
      "lon": 10.93,
      "type": "hotel"
    }
  ],
  "Haugesund": [
    {
      "name": "Banken Hotel",
      "lat": 59.4137,
      "lon": 5.2673,
      "type": "hotel"
    },
    {
      "name": "Clarion Collection Hotel Amanda",
      "lat": 59.4132,
      "lon": 5.2668,
      "type": "hotel"
    },
    {
      "name": "Hotel Neptun",
      "lat": 59.416,
      "lon": 5.2654,
      "type": "hotel"
    },
    {
      "name": "Magasingården",
      "lat": 59.3524,
      "lon": 5.223,
      "type": "hostel"
    },
    {
      "name": "Nesheimstunet",
      "lat": 59.5078,
      "lon": 5.7122,
      "type": "guest_house"
    },
    {
      "name": "Scandic Hotel Haugesund",
      "lat": 59.4152,
      "lon": 5.2694,
      "type": "hotel"
    },
    {
      "name": "Scandic Maritim",
      "lat": 59.4097,
      "lon": 5.2723,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Saga",
      "lat": 59.4124,
      "lon": 5.2718,
      "type": "hotel"
    },
    {
      "name": "Tysvær motell",
      "lat": 59.4193,
      "lon": 5.4469,
      "type": "hotel"
    }
  ],
  "Mandal": [
    {
      "name": "Hald Pensjonat",
      "lat": 58.0357,
      "lon": 7.4489,
      "type": "guest_house"
    },
    {
      "name": "HI Mandal Vandrerhjem",
      "lat": 58.0253,
      "lon": 7.4502,
      "type": "hostel"
    },
    {
      "name": "Kjøbmandsgården",
      "lat": 58.0291,
      "lon": 7.4593,
      "type": "hotel"
    },
    {
      "name": "Mandal Hotel",
      "lat": 58.0249,
      "lon": 7.4555,
      "type": "hotel"
    }
  ],
  "Andenes": [
    {
      "name": "Andrikken hotell",
      "lat": 69.3164,
      "lon": 16.1207,
      "type": "hotel"
    },
    {
      "name": "Havhusene Bleik",
      "lat": 69.2735,
      "lon": 15.9565,
      "type": "hotel"
    },
    {
      "name": "Hotell Marena",
      "lat": 69.3204,
      "lon": 16.1239,
      "type": "hotel"
    },
    {
      "name": "Sirena Guest House",
      "lat": 69.2377,
      "lon": 16.0393,
      "type": "guest_house"
    }
  ],
  "Tønsberg": [
    {
      "name": "Active Hotel",
      "lat": 59.265,
      "lon": 10.391,
      "type": "hotel"
    },
    {
      "name": "Hotel Borge",
      "lat": 59.239,
      "lon": 10.4684,
      "type": "hotel"
    },
    {
      "name": "Hotell Klubben",
      "lat": 59.2681,
      "lon": 10.4045,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Tønsberg",
      "lat": 59.2647,
      "lon": 10.4078,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Tønsberg Brygge",
      "lat": 59.2674,
      "lon": 10.4043,
      "type": "hotel"
    },
    {
      "name": "Tønsberg Vandrehjem",
      "lat": 59.273,
      "lon": 10.4054,
      "type": "hostel"
    }
  ],
  "Grong": [
    {
      "name": "Børstad gård",
      "lat": 64.6319,
      "lon": 12.2932,
      "type": "guest_house"
    },
    {
      "name": "Grana Bryggeri",
      "lat": 64.2332,
      "lon": 12.3232,
      "type": "guest_house"
    },
    {
      "name": "Grong Gård",
      "lat": 64.4666,
      "lon": 12.2927,
      "type": "hotel"
    },
    {
      "name": "Grong Vertshus",
      "lat": 64.4652,
      "lon": 12.3144,
      "type": "hotel"
    },
    {
      "name": "Heia Gjestegård",
      "lat": 64.3585,
      "lon": 12.3297,
      "type": "hotel"
    },
    {
      "name": "Hotel Overhalla",
      "lat": 64.4962,
      "lon": 11.952,
      "type": "hotel"
    },
    {
      "name": "Høylandet skysstasjon",
      "lat": 64.6286,
      "lon": 12.3044,
      "type": "guest_house"
    },
    {
      "name": "Lierne gjestegård",
      "lat": 64.4457,
      "lon": 13.7172,
      "type": "guest_house"
    },
    {
      "name": "Limingen Gjestegård",
      "lat": 64.887,
      "lon": 13.5575,
      "type": "guest_house"
    },
    {
      "name": "Nams-Inn",
      "lat": 64.9264,
      "lon": 13.1569,
      "type": "guest_house"
    },
    {
      "name": "Namsen Salmon & Train Experience",
      "lat": 64.4672,
      "lon": 12.0496,
      "type": "hotel"
    },
    {
      "name": "Namsentunet",
      "lat": 64.4868,
      "lon": 12.3469,
      "type": "guest_house"
    }
  ],
  "Arendal": [
    {
      "name": "Arendal Herregaard Spa & Resort",
      "lat": 58.4463,
      "lon": 8.8495,
      "type": "hotel"
    },
    {
      "name": "Bokhotellet Lyngørporten",
      "lat": 58.6449,
      "lon": 9.1259,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Tyholmen",
      "lat": 58.458,
      "lon": 8.7677,
      "type": "hotel"
    },
    {
      "name": "Fengselshotellet",
      "lat": 58.4668,
      "lon": 8.7606,
      "type": "hotel"
    },
    {
      "name": "Grand Hotel Arendal",
      "lat": 58.4615,
      "lon": 8.7631,
      "type": "hotel"
    },
    {
      "name": "Heimat Brokelandsheia",
      "lat": 58.8202,
      "lon": 9.0729,
      "type": "hotel"
    },
    {
      "name": "Hotell Arendal",
      "lat": 58.4612,
      "lon": 8.7652,
      "type": "hotel"
    },
    {
      "name": "Kokkeplassen Familieferie",
      "lat": 58.4382,
      "lon": 8.7384,
      "type": "guest_house"
    },
    {
      "name": "Krøgeneslåven",
      "lat": 58.472,
      "lon": 8.8141,
      "type": "guest_house"
    },
    {
      "name": "Lille Hotell",
      "lat": 58.4617,
      "lon": 8.7649,
      "type": "hotel"
    },
    {
      "name": "Risør Hotel",
      "lat": 58.7183,
      "lon": 9.2397,
      "type": "hotel"
    },
    {
      "name": "Risør Hotel",
      "lat": 58.7183,
      "lon": 9.2393,
      "type": "hotel"
    },
    {
      "name": "Risør Pensjonat",
      "lat": 58.7186,
      "lon": 9.2141,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Arendal",
      "lat": 58.4588,
      "lon": 8.7667,
      "type": "hotel"
    },
    {
      "name": "Tollboden - Det Lille Hotel",
      "lat": 58.7204,
      "lon": 9.2377,
      "type": "hotel"
    },
    {
      "name": "Tvedestrand fjordhotell",
      "lat": 58.6221,
      "lon": 8.9311,
      "type": "hotel"
    },
    {
      "name": "Utnes Champagneslottet",
      "lat": 58.4176,
      "lon": 8.7441,
      "type": "guest_house"
    },
    {
      "name": "Værkshuset Froland",
      "lat": 58.499,
      "lon": 8.5994,
      "type": "hostel"
    }
  ],
  "Rørvik": [
    {
      "name": "Abelvær gård",
      "lat": 64.7314,
      "lon": 11.1835,
      "type": "guest_house"
    },
    {
      "name": "Bakkalandet hotell",
      "lat": 64.8651,
      "lon": 11.6059,
      "type": "hotel"
    },
    {
      "name": "Foldereid Gjestehus",
      "lat": 64.9607,
      "lon": 12.1808,
      "type": "guest_house"
    },
    {
      "name": "Kysthotellet Rørvik",
      "lat": 64.8625,
      "lon": 11.2366,
      "type": "hotel"
    },
    {
      "name": "Leka Motel & Camping",
      "lat": 65.081,
      "lon": 11.6976,
      "type": "hotel"
    },
    {
      "name": "Nergård Brygge",
      "lat": 64.8749,
      "lon": 11.2701,
      "type": "guest_house"
    },
    {
      "name": "Nærøysund Rorbuer",
      "lat": 64.8513,
      "lon": 11.2526,
      "type": "guest_house"
    },
    {
      "name": "Setran Opplevelsesgård",
      "lat": 64.8049,
      "lon": 11.7811,
      "type": "guest_house"
    },
    {
      "name": "Sørensen brygge",
      "lat": 64.7986,
      "lon": 11.2768,
      "type": "guest_house"
    }
  ],
  "Verdal": [
    {
      "name": "Husfrua Gårdshotell",
      "lat": 63.8786,
      "lon": 11.2632,
      "type": "guest_house"
    },
    {
      "name": "Scandic Stiklestad",
      "lat": 63.7957,
      "lon": 11.5628,
      "type": "hotel"
    },
    {
      "name": "Strømnes",
      "lat": 63.8678,
      "lon": 11.2936,
      "type": "guest_house"
    },
    {
      "name": "Sund Folkehøgskole Sommerhotell",
      "lat": 63.8578,
      "lon": 11.3154,
      "type": "hostel"
    },
    {
      "name": "Verdal Hotell",
      "lat": 63.7926,
      "lon": 11.4847,
      "type": "hotel"
    }
  ],
  "Gjøvik": [
    {
      "name": "Annexstad gård",
      "lat": 60.7505,
      "lon": 10.7482,
      "type": "guest_house"
    },
    {
      "name": "Badeland gjestegård",
      "lat": 60.7218,
      "lon": 10.5917,
      "type": "hotel"
    },
    {
      "name": "Brusveen gård",
      "lat": 60.7915,
      "lon": 10.6768,
      "type": "guest_house"
    },
    {
      "name": "Clarion Collection Hotel Grand",
      "lat": 60.7967,
      "lon": 10.6912,
      "type": "hotel"
    },
    {
      "name": "Gjøvik Vandrerhjem Hovdetun",
      "lat": 60.7977,
      "lon": 10.6717,
      "type": "hostel"
    },
    {
      "name": "Granum gård",
      "lat": 60.7748,
      "lon": 10.2686,
      "type": "guest_house"
    },
    {
      "name": "Hoff Gjestgiveri",
      "lat": 60.6828,
      "lon": 10.843,
      "type": "guest_house"
    },
    {
      "name": "Honne hotell og konferansesenter",
      "lat": 60.946,
      "lon": 10.6362,
      "type": "hotel"
    },
    {
      "name": "Kløverhotellet",
      "lat": 60.8051,
      "lon": 10.6783,
      "type": "hotel"
    },
    {
      "name": "Kvarstad gård",
      "lat": 60.8738,
      "lon": 10.8548,
      "type": "guest_house"
    },
    {
      "name": "Pilgrimsstuggua",
      "lat": 60.9025,
      "lon": 10.7239,
      "type": "hostel"
    },
    {
      "name": "Quality Hotel Strand",
      "lat": 60.7945,
      "lon": 10.6941,
      "type": "hotel"
    },
    {
      "name": "Sillongen Toten Hotel",
      "lat": 60.6996,
      "lon": 10.7351,
      "type": "hotel"
    },
    {
      "name": "Solvik",
      "lat": 60.5244,
      "lon": 10.3694,
      "type": "guest_house"
    },
    {
      "name": "Vertshuset V-E6",
      "lat": 60.9573,
      "lon": 10.6226,
      "type": "guest_house"
    }
  ],
  "Florø": [
    {
      "name": "Askvoll Fjordhotell",
      "lat": 61.3465,
      "lon": 5.0619,
      "type": "hotel"
    },
    {
      "name": "Birdbox Fauske",
      "lat": 61.453,
      "lon": 5.5967,
      "type": "guest_house"
    },
    {
      "name": "Brekkestranda",
      "lat": 61.0256,
      "lon": 5.4458,
      "type": "hotel"
    },
    {
      "name": "Bremanger Fjordhotell",
      "lat": 61.769,
      "lon": 5.2901,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Victoria Florø",
      "lat": 61.5998,
      "lon": 5.0356,
      "type": "hotel"
    },
    {
      "name": "Dinge appartments",
      "lat": 61.0248,
      "lon": 5.0498,
      "type": "guest_house"
    },
    {
      "name": "Florbu fureholmen 1",
      "lat": 61.5928,
      "lon": 5.0662,
      "type": "hotel"
    },
    {
      "name": "Førde Pensjonat",
      "lat": 61.4536,
      "lon": 5.8396,
      "type": "hostel"
    },
    {
      "name": "Førde Sommarhotell",
      "lat": 61.4612,
      "lon": 5.8875,
      "type": "hostel"
    },
    {
      "name": "Havly Bed & Breakfast",
      "lat": 61.8387,
      "lon": 4.9425,
      "type": "guest_house"
    },
    {
      "name": "Jibben Hotell Måløy",
      "lat": 61.9338,
      "lon": 5.1116,
      "type": "hotel"
    },
    {
      "name": "Kinn Hotell",
      "lat": 61.595,
      "lon": 5.0143,
      "type": "hotel"
    },
    {
      "name": "Knutholmen",
      "lat": 61.7656,
      "lon": 4.8769,
      "type": "hotel"
    },
    {
      "name": "Lavik Fjord Hotell",
      "lat": 61.1042,
      "lon": 5.5095,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Florø",
      "lat": 61.6008,
      "lon": 5.0291,
      "type": "hotel"
    },
    {
      "name": "Sande Kro & Hotell",
      "lat": 61.3252,
      "lon": 5.7951,
      "type": "hotel"
    },
    {
      "name": "Scandic Sunnfjord Hotel & Spa",
      "lat": 61.4532,
      "lon": 5.8558,
      "type": "hotel"
    },
    {
      "name": "Sognhostel",
      "lat": 61.2228,
      "lon": 5.2024,
      "type": "hostel"
    },
    {
      "name": "Sognhostel",
      "lat": 61.1372,
      "lon": 5.3473,
      "type": "hotel"
    },
    {
      "name": "Solund Leileghetshotell",
      "lat": 61.0733,
      "lon": 4.8414,
      "type": "hotel"
    },
    {
      "name": "Svanøy hovudgård",
      "lat": 61.4934,
      "lon": 5.1318,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Førde",
      "lat": 61.4499,
      "lon": 5.8508,
      "type": "hotel"
    },
    {
      "name": "Vadheim Hotell",
      "lat": 61.2086,
      "lon": 5.8225,
      "type": "hotel"
    },
    {
      "name": "Værlandet Gjesteheim",
      "lat": 61.3111,
      "lon": 4.7279,
      "type": "guest_house"
    },
    {
      "name": "Værlandet Havhotell",
      "lat": 61.3174,
      "lon": 4.7298,
      "type": "guest_house"
    },
    {
      "name": "Åmot",
      "lat": 61.3638,
      "lon": 5.7297,
      "type": "hotel"
    }
  ],
  "Lyngdal": [
    {
      "name": "Eiken hotell & feriesenter",
      "lat": 58.4717,
      "lon": 7.2264,
      "type": "hotel"
    },
    {
      "name": "Hausvik Maritime",
      "lat": 58.0424,
      "lon": 6.9864,
      "type": "hotel"
    },
    {
      "name": "Heddan gård",
      "lat": 58.427,
      "lon": 7.1645,
      "type": "guest_house"
    },
    {
      "name": "Hesteskoen",
      "lat": 58.0425,
      "lon": 6.9874,
      "type": "hotel"
    },
    {
      "name": "Lindesnes Havhotell",
      "lat": 58.0398,
      "lon": 7.1516,
      "type": "hotel"
    },
    {
      "name": "Paulsens Hotell & Cafe",
      "lat": 58.1391,
      "lon": 7.0663,
      "type": "hotel"
    },
    {
      "name": "Rosfjord Strandhotell",
      "lat": 58.1216,
      "lon": 7.0582,
      "type": "hotel"
    }
  ],
  "Ski": [
    {
      "name": "Gjedsjø gaard B&B",
      "lat": 59.7393,
      "lon": 10.9512,
      "type": "guest_house"
    },
    {
      "name": "Sørmarka kurs- og konferansesenter",
      "lat": 59.8066,
      "lon": 10.9086,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Ski",
      "lat": 59.7184,
      "lon": 10.8365,
      "type": "hotel"
    }
  ],
  "Bryne": [
    {
      "name": "Boretunet",
      "lat": 58.7992,
      "lon": 5.5573,
      "type": "guest_house"
    },
    {
      "name": "Bryne Kro & Hotell",
      "lat": 58.7401,
      "lon": 5.641,
      "type": "hotel"
    },
    {
      "name": "Holmavatn Ungdoms- og Misjonssenter",
      "lat": 58.6255,
      "lon": 5.7748,
      "type": "guest_house"
    },
    {
      "name": "Jæren hotell",
      "lat": 58.7366,
      "lon": 5.6457,
      "type": "hotel"
    }
  ],
  "Holmestrand": [
    {
      "name": "Badehotellet",
      "lat": 59.5594,
      "lon": 10.4248,
      "type": "hotel"
    },
    {
      "name": "Gavelstad Gjestegård",
      "lat": 59.3854,
      "lon": 9.9735,
      "type": "hotel"
    },
    {
      "name": "Holmestrand Fjordhotell",
      "lat": 59.4934,
      "lon": 10.3124,
      "type": "hotel"
    },
    {
      "name": "Holmsbu Resort",
      "lat": 59.5412,
      "lon": 10.4139,
      "type": "hotel"
    }
  ],
  "Egersund": [
    {
      "name": "Grand hotell Egersund",
      "lat": 58.451,
      "lon": 5.9999,
      "type": "hotel"
    },
    {
      "name": "Justein house",
      "lat": 58.4329,
      "lon": 5.9689,
      "type": "guest_house"
    },
    {
      "name": "Ognatun leirsted",
      "lat": 58.53,
      "lon": 5.7981,
      "type": "guest_house"
    },
    {
      "name": "Sirevåg Konferansesenter",
      "lat": 58.5033,
      "lon": 5.7919,
      "type": "hotel"
    },
    {
      "name": "Songdalstrand Kulturhotell",
      "lat": 58.3227,
      "lon": 6.2842,
      "type": "hotel"
    }
  ],
  "Odda": [
    {
      "name": "Baroniet Rosendal Avlsgård",
      "lat": 59.9872,
      "lon": 6.0232,
      "type": "guest_house"
    },
    {
      "name": "Bykle Hotel",
      "lat": 59.3548,
      "lon": 7.3565,
      "type": "hotel"
    },
    {
      "name": "Dyranut Fjellstova",
      "lat": 60.368,
      "lon": 7.5029,
      "type": "hotel"
    },
    {
      "name": "Energihotellet",
      "lat": 59.6503,
      "lon": 6.8181,
      "type": "hotel"
    },
    {
      "name": "Hardanger Hostel B&B",
      "lat": 60.3184,
      "lon": 6.6576,
      "type": "hostel"
    },
    {
      "name": "Hardanger Hotel",
      "lat": 60.069,
      "lon": 6.5447,
      "type": "hotel"
    },
    {
      "name": "Haukeli Turistheim",
      "lat": 59.7353,
      "lon": 7.5514,
      "type": "guest_house"
    },
    {
      "name": "Hordatun Hotel",
      "lat": 59.8124,
      "lon": 6.7712,
      "type": "hotel"
    },
    {
      "name": "Hostellet",
      "lat": 59.5676,
      "lon": 7.3641,
      "type": "hostel"
    },
    {
      "name": "Hotel Sundal",
      "lat": 60.1182,
      "lon": 6.2664,
      "type": "hotel"
    },
    {
      "name": "Hovden Apartments",
      "lat": 59.5744,
      "lon": 7.3917,
      "type": "hotel"
    },
    {
      "name": "Hovdestøylen",
      "lat": 59.5552,
      "lon": 7.3592,
      "type": "hotel"
    },
    {
      "name": "Kløver Hotel",
      "lat": 59.649,
      "lon": 6.3541,
      "type": "hotel"
    },
    {
      "name": "Mettes Lille Hotell",
      "lat": 59.6492,
      "lon": 6.3533,
      "type": "hotel"
    },
    {
      "name": "Mårbu Seter og Fjellstue",
      "lat": 60.1894,
      "lon": 8.1659,
      "type": "guest_house"
    },
    {
      "name": "Odda Hytte & Gjestegård",
      "lat": 60.0547,
      "lon": 6.5498,
      "type": "guest_house"
    },
    {
      "name": "Osa-Bu",
      "lat": 59.4952,
      "lon": 6.5269,
      "type": "guest_house"
    },
    {
      "name": "Rosendal Fjordhotel",
      "lat": 59.9816,
      "lon": 6.01,
      "type": "hotel"
    },
    {
      "name": "Rosendal turisthotell",
      "lat": 59.9872,
      "lon": 6.0072,
      "type": "hotel"
    },
    {
      "name": "Røldal Booking",
      "lat": 59.8171,
      "lon": 6.7512,
      "type": "guest_house"
    },
    {
      "name": "Røldal Overnatting",
      "lat": 59.8355,
      "lon": 6.822,
      "type": "hotel"
    },
    {
      "name": "Trolltunga Guesthouse",
      "lat": 60.1173,
      "lon": 6.5643,
      "type": "hotel"
    },
    {
      "name": "Trolltunga Hotel",
      "lat": 60.0538,
      "lon": 6.5561,
      "type": "hotel"
    },
    {
      "name": "Trolltunga Studios",
      "lat": 60.0725,
      "lon": 6.5524,
      "type": "hostel"
    },
    {
      "name": "Tyssedal Hotel",
      "lat": 60.1161,
      "lon": 6.5566,
      "type": "hotel"
    },
    {
      "name": "Vågslidtun Hotell",
      "lat": 59.7694,
      "lon": 7.3883,
      "type": "hotel"
    },
    {
      "name": "Åkrafjorden Nature B&B",
      "lat": 59.8753,
      "lon": 6.4014,
      "type": "guest_house"
    }
  ],
  "Sandefjord": [
    {
      "name": "Clarion Collection Hotel Atlantic",
      "lat": 59.1331,
      "lon": 10.2243,
      "type": "hotel"
    },
    {
      "name": "Engø Gård",
      "lat": 59.1267,
      "lon": 10.4208,
      "type": "hotel"
    },
    {
      "name": "Havna Tjøme hotel",
      "lat": 59.0853,
      "lon": 10.4172,
      "type": "hotel"
    },
    {
      "name": "Hotel Kong Carl",
      "lat": 59.1306,
      "lon": 10.222,
      "type": "hotel"
    },
    {
      "name": "Scandic Park Sandefjord",
      "lat": 59.1275,
      "lon": 10.2208,
      "type": "hotel"
    }
  ],
  "Honningsvåg": [
    {
      "name": "Arctic Hotel Nordkapp",
      "lat": 70.9813,
      "lon": 25.9758,
      "type": "hotel"
    },
    {
      "name": "Claudines Gjestehus",
      "lat": 70.9962,
      "lon": 24.6651,
      "type": "guest_house"
    },
    {
      "name": "Havøysund Hotell",
      "lat": 70.9951,
      "lon": 24.6707,
      "type": "hotel"
    },
    {
      "name": "Hotel Árran Nordkapp",
      "lat": 71.0479,
      "lon": 25.9076,
      "type": "hotel"
    },
    {
      "name": "Hotel Nordkyn",
      "lat": 70.9458,
      "lon": 27.3559,
      "type": "hotel"
    },
    {
      "name": "Hotel Repvåg",
      "lat": 70.7463,
      "lon": 25.6717,
      "type": "hotel"
    },
    {
      "name": "Lorden Kro",
      "lat": 71.0403,
      "lon": 27.8505,
      "type": "hostel"
    },
    {
      "name": "Mehamn Arctic hotell",
      "lat": 71.0376,
      "lon": 27.8517,
      "type": "hotel"
    },
    {
      "name": "Mehamn Artic Hotell",
      "lat": 71.0391,
      "lon": 27.8527,
      "type": "hotel"
    },
    {
      "name": "Nordic safari, rorbu og vandrehjem",
      "lat": 71.038,
      "lon": 27.8356,
      "type": "hostel"
    },
    {
      "name": "Scandic Bryggen",
      "lat": 70.9794,
      "lon": 25.9726,
      "type": "hotel"
    },
    {
      "name": "Scandic Honningsvåg",
      "lat": 70.9827,
      "lon": 25.9691,
      "type": "hotel"
    },
    {
      "name": "Scandic Nordkapp",
      "lat": 71.0288,
      "lon": 25.8914,
      "type": "hotel"
    },
    {
      "name": "The View Hotel North Cape",
      "lat": 70.9966,
      "lon": 25.9773,
      "type": "hotel"
    }
  ],
  "Narvik": [
    {
      "name": "Bogen",
      "lat": 68.5136,
      "lon": 17.0113,
      "type": "hostel"
    },
    {
      "name": "Breidablikk Gjestehus",
      "lat": 68.4381,
      "lon": 17.4328,
      "type": "guest_house"
    },
    {
      "name": "Enter Hotell",
      "lat": 68.4359,
      "lon": 17.4262,
      "type": "hotel"
    },
    {
      "name": "Evenes Fjord Hotel",
      "lat": 68.5249,
      "lon": 16.987,
      "type": "hotel"
    },
    {
      "name": "Feriehjemmet Malm",
      "lat": 68.4825,
      "lon": 17.1087,
      "type": "guest_house"
    },
    {
      "name": "Narvik hotel Wivel",
      "lat": 68.437,
      "lon": 17.4269,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Grand Royal",
      "lat": 68.4404,
      "lon": 17.4333,
      "type": "hotel"
    },
    {
      "name": "Scandic Narvik",
      "lat": 68.4364,
      "lon": 17.4253,
      "type": "hotel"
    },
    {
      "name": "Sjømannskirka",
      "lat": 68.4331,
      "lon": 17.4237,
      "type": "hostel"
    },
    {
      "name": "Spor 1 Gjestegård",
      "lat": 68.4392,
      "lon": 17.4248,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Narvik",
      "lat": 68.4377,
      "lon": 17.4459,
      "type": "hotel"
    }
  ],
  "Kopervik": [
    {
      "name": "Dugneberg B&B",
      "lat": 59.2376,
      "lon": 5.1989,
      "type": "guest_house"
    },
    {
      "name": "Furrehytter",
      "lat": 59.2596,
      "lon": 5.8476,
      "type": "guest_house"
    },
    {
      "name": "Furrehytter",
      "lat": 59.2594,
      "lon": 5.8475,
      "type": "guest_house"
    },
    {
      "name": "Karmøy Vandrerhjem",
      "lat": 59.2813,
      "lon": 5.2841,
      "type": "hostel"
    },
    {
      "name": "Nesheim-Hauge Eiendom",
      "lat": 59.3453,
      "lon": 5.8572,
      "type": "guest_house"
    },
    {
      "name": "Park Inn Haugesund Airport",
      "lat": 59.3416,
      "lon": 5.2745,
      "type": "hotel"
    }
  ],
  "Vardø": [
    {
      "name": "Gjestegården",
      "lat": 70.377,
      "lon": 31.1155,
      "type": "hotel"
    },
    {
      "name": "Meieriet",
      "lat": 70.3711,
      "lon": 31.1102,
      "type": "hotel"
    },
    {
      "name": "Vardø Hotell",
      "lat": 70.3726,
      "lon": 31.1029,
      "type": "hotel"
    }
  ],
  "Karasjok": [
    {
      "name": "Engholm's Husky",
      "lat": 69.4488,
      "lon": 25.3588,
      "type": "hostel"
    },
    {
      "name": "Karasjok gjestehus",
      "lat": 69.4726,
      "lon": 25.5072,
      "type": "guest_house"
    },
    {
      "name": "Scandic Karasjok",
      "lat": 69.4736,
      "lon": 25.5098,
      "type": "hotel"
    }
  ],
  "Sandnessjøen": [
    {
      "name": "Dønna Rorbuer Bøteriet",
      "lat": 66.1671,
      "lon": 12.5724,
      "type": "guest_house"
    },
    {
      "name": "Dønnes gård",
      "lat": 66.2046,
      "lon": 12.5856,
      "type": "guest_house"
    },
    {
      "name": "Flostad rorbuer",
      "lat": 65.967,
      "lon": 12.2866,
      "type": "guest_house"
    },
    {
      "name": "Herøy Brygge",
      "lat": 65.9803,
      "lon": 12.2838,
      "type": "guest_house"
    },
    {
      "name": "Lovund hotell",
      "lat": 66.3698,
      "lon": 12.3553,
      "type": "hotel"
    },
    {
      "name": "Napoli Hotell",
      "lat": 66.0172,
      "lon": 12.6401,
      "type": "hotel"
    },
    {
      "name": "Rorbu",
      "lat": 65.9954,
      "lon": 12.2749,
      "type": "guest_house"
    },
    {
      "name": "Sandnessjøen Overnatting",
      "lat": 66.0202,
      "lon": 12.6266,
      "type": "guest_house"
    },
    {
      "name": "Scandic Syv Søstre",
      "lat": 66.0229,
      "lon": 12.6374,
      "type": "hotel"
    },
    {
      "name": "SKOLO",
      "lat": 66.0262,
      "lon": 12.2385,
      "type": "guest_house"
    },
    {
      "name": "Træna Gjestegård",
      "lat": 66.5037,
      "lon": 12.0944,
      "type": "guest_house"
    },
    {
      "name": "Træna Overnatting",
      "lat": 66.5016,
      "lon": 12.0964,
      "type": "guest_house"
    },
    {
      "name": "Træna Rorbuferie",
      "lat": 66.4946,
      "lon": 12.0864,
      "type": "guest_house"
    }
  ],
  "Larvik": [
    {
      "name": "Brathagen",
      "lat": 59.1584,
      "lon": 10.0132,
      "type": "guest_house"
    },
    {
      "name": "Farris Bad",
      "lat": 59.0495,
      "lon": 10.02,
      "type": "hotel"
    },
    {
      "name": "Hotel Wassilioff",
      "lat": 58.9975,
      "lon": 10.0392,
      "type": "hotel"
    },
    {
      "name": "Larvik Pensjonat",
      "lat": 59.0556,
      "lon": 10.0312,
      "type": "guest_house"
    },
    {
      "name": "Nevlunghavn Gjestgiveri",
      "lat": 58.9673,
      "lon": 9.8678,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Grand Farris",
      "lat": 59.051,
      "lon": 10.0295,
      "type": "hotel"
    },
    {
      "name": "Tollgaarden Gjestegaard",
      "lat": 59.0481,
      "lon": 10.0348,
      "type": "hotel"
    },
    {
      "name": "Trudvang Gjestegaard",
      "lat": 59.0548,
      "lon": 10.0144,
      "type": "hotel"
    }
  ],
  "Bardufoss": [
    {
      "name": "Bardufoss hotell",
      "lat": 69.0653,
      "lon": 18.5132,
      "type": "hotel"
    },
    {
      "name": "Rundhaug gjestegård",
      "lat": 69.0202,
      "lon": 18.9006,
      "type": "hotel"
    },
    {
      "name": "Vollan Gjestestue",
      "lat": 69.2183,
      "lon": 19.5596,
      "type": "hotel"
    }
  ],
  "Ballangen": [
    {
      "name": "Aiden by Best Western Harstad Narvik Airport",
      "lat": 68.4978,
      "lon": 16.7033,
      "type": "hotel"
    },
    {
      "name": "Stetind Hotel",
      "lat": 68.0947,
      "lon": 16.3663,
      "type": "hotel"
    }
  ],
  "Finnsnes": [
    {
      "name": "Camp Steinfjord",
      "lat": 69.4633,
      "lon": 17.3446,
      "type": "hotel"
    },
    {
      "name": "Finnsnes Hotel",
      "lat": 69.2296,
      "lon": 17.9794,
      "type": "hotel"
    },
    {
      "name": "Senja hotell",
      "lat": 69.2294,
      "lon": 17.9798,
      "type": "hotel"
    },
    {
      "name": "Senjagården",
      "lat": 69.3533,
      "lon": 18.043,
      "type": "hotel"
    },
    {
      "name": "Senjahuset Gibostad",
      "lat": 69.3543,
      "lon": 18.0766,
      "type": "hostel"
    },
    {
      "name": "Torsken Brygge",
      "lat": 69.3381,
      "lon": 17.1039,
      "type": "guest_house"
    }
  ],
  "Leirvik": [
    {
      "name": "Almaas Hotell Stord",
      "lat": 59.7745,
      "lon": 5.4966,
      "type": "hotel"
    },
    {
      "name": "Bømlo hotell",
      "lat": 59.8154,
      "lon": 5.2696,
      "type": "hotel"
    },
    {
      "name": "Fitjar Fjordhotell",
      "lat": 59.9195,
      "lon": 5.3199,
      "type": "hotel"
    },
    {
      "name": "Fugl Fønix Hotel",
      "lat": 59.6644,
      "lon": 5.9339,
      "type": "hotel"
    },
    {
      "name": "Gamle Fengselet Kulturhotell",
      "lat": 59.782,
      "lon": 5.5005,
      "type": "hotel"
    },
    {
      "name": "Husnes Sentrum Hotell",
      "lat": 59.8592,
      "lon": 5.7542,
      "type": "hotel"
    },
    {
      "name": "Lundseter fjellstove",
      "lat": 59.839,
      "lon": 5.4773,
      "type": "guest_house"
    },
    {
      "name": "Ryfylke Fjordhotel",
      "lat": 59.4824,
      "lon": 6.2496,
      "type": "hotel"
    },
    {
      "name": "Sauda Fjordhotell",
      "lat": 59.6438,
      "lon": 6.3118,
      "type": "hotel"
    },
    {
      "name": "Skånevik Fjordhotel",
      "lat": 59.7326,
      "lon": 5.9314,
      "type": "hotel"
    },
    {
      "name": "Solheim Turiststasjon",
      "lat": 59.9344,
      "lon": 5.8659,
      "type": "guest_house"
    },
    {
      "name": "Stord hotell",
      "lat": 59.7742,
      "lon": 5.495,
      "type": "hotel"
    },
    {
      "name": "Suldal Hotell",
      "lat": 59.4846,
      "lon": 6.2517,
      "type": "hotel"
    },
    {
      "name": "Tore Christensen",
      "lat": 59.7025,
      "lon": 5.3711,
      "type": "guest_house"
    },
    {
      "name": "Ølen gjestegård",
      "lat": 59.6048,
      "lon": 5.8124,
      "type": "guest_house"
    }
  ],
  "Vennesla": [
    {
      "name": "Boen Gård",
      "lat": 58.2402,
      "lon": 8.1356,
      "type": "hotel"
    },
    {
      "name": "Camp Flakksvann",
      "lat": 58.335,
      "lon": 8.2138,
      "type": "guest_house"
    },
    {
      "name": "Flakk Gård",
      "lat": 58.3334,
      "lon": 8.2062,
      "type": "guest_house"
    },
    {
      "name": "Iveland Tree Top Panorama",
      "lat": 58.4301,
      "lon": 7.866,
      "type": "hotel"
    },
    {
      "name": "Kile Bed and Breakfast",
      "lat": 58.4113,
      "lon": 7.7688,
      "type": "hotel"
    }
  ],
  "Molde": [
    {
      "name": "Akura Hotel",
      "lat": 62.8047,
      "lon": 6.8866,
      "type": "hotel"
    },
    {
      "name": "Bjørnsund Leirskole",
      "lat": 62.8927,
      "lon": 6.8301,
      "type": "guest_house"
    },
    {
      "name": "Finnøy Havstuer",
      "lat": 62.8035,
      "lon": 6.5098,
      "type": "hotel"
    },
    {
      "name": "Fiskesenter Birkeland",
      "lat": 62.6446,
      "lon": 6.7228,
      "type": "guest_house"
    },
    {
      "name": "Flatflesa Fyr",
      "lat": 62.8385,
      "lon": 6.6889,
      "type": "hotel"
    },
    {
      "name": "Flatflesa Fyr",
      "lat": 62.8384,
      "lon": 6.689,
      "type": "hotel"
    },
    {
      "name": "Hotell Molde",
      "lat": 62.7366,
      "lon": 7.1568,
      "type": "hotel"
    },
    {
      "name": "Hustadvika Havhotell",
      "lat": 62.9859,
      "lon": 7.1168,
      "type": "hotel"
    },
    {
      "name": "Kjørsvik Øvre",
      "lat": 62.862,
      "lon": 7.0098,
      "type": "guest_house"
    },
    {
      "name": "Molde Fjordhotell",
      "lat": 62.7339,
      "lon": 7.1515,
      "type": "hotel"
    },
    {
      "name": "Molde vandrerhjem",
      "lat": 62.7367,
      "lon": 7.1239,
      "type": "hostel"
    },
    {
      "name": "Ona Havstuer",
      "lat": 62.8639,
      "lon": 6.5457,
      "type": "guest_house"
    },
    {
      "name": "Scandic Alexandra Molde",
      "lat": 62.735,
      "lon": 7.1546,
      "type": "hotel"
    },
    {
      "name": "Scandic Seilet Hotel",
      "lat": 62.7331,
      "lon": 7.1439,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Moldefjord",
      "lat": 62.7353,
      "lon": 7.1565,
      "type": "hotel"
    },
    {
      "name": "Vestnes Fjordhotell",
      "lat": 62.6236,
      "lon": 7.0927,
      "type": "hotel"
    }
  ],
  "Ørsta": [
    {
      "name": "Hotel Ivar Aasen",
      "lat": 62.1984,
      "lon": 6.129,
      "type": "hotel"
    },
    {
      "name": "Hotel Union Øye",
      "lat": 62.1931,
      "lon": 6.6597,
      "type": "hotel"
    },
    {
      "name": "Sagafjord Hotel",
      "lat": 62.2071,
      "lon": 6.4781,
      "type": "hotel"
    },
    {
      "name": "Stranda Hotel",
      "lat": 62.3074,
      "lon": 6.9469,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Fosnavåg",
      "lat": 62.3412,
      "lon": 5.6367,
      "type": "hotel"
    }
  ],
  "Ås": [
    {
      "name": "Bilitt gård",
      "lat": 59.6075,
      "lon": 10.9161,
      "type": "guest_house"
    },
    {
      "name": "Oscarsborg Hotel & Resort",
      "lat": 59.6756,
      "lon": 10.6058,
      "type": "hotel"
    },
    {
      "name": "Reenskaug Hotel",
      "lat": 59.6598,
      "lon": 10.6305,
      "type": "hotel"
    },
    {
      "name": "Skiphelle",
      "lat": 59.6385,
      "lon": 10.6438,
      "type": "hotel"
    },
    {
      "name": "Vilma Sjøbad",
      "lat": 59.5711,
      "lon": 10.6173,
      "type": "hotel"
    }
  ],
  "Lakselv": [
    {
      "name": "Karalaks",
      "lat": 69.9987,
      "lon": 24.9905,
      "type": "hostel"
    },
    {
      "name": "Lakselv Hotell",
      "lat": 70.0372,
      "lon": 24.9715,
      "type": "hotel"
    },
    {
      "name": "Lazzy",
      "lat": 70.0511,
      "lon": 24.9678,
      "type": "guest_house"
    },
    {
      "name": "Russenes Hotell",
      "lat": 70.478,
      "lon": 25.0657,
      "type": "hotel"
    },
    {
      "name": "Trailing Tellervo @Bungalåven",
      "lat": 70.3174,
      "lon": 25.5593,
      "type": "hostel"
    }
  ],
  "Alta": [
    {
      "name": "Bårstua Gjestehus",
      "lat": 69.9746,
      "lon": 23.2889,
      "type": "guest_house"
    },
    {
      "name": "Canyon Hotell Alta",
      "lat": 69.9668,
      "lon": 23.2744,
      "type": "hotel"
    },
    {
      "name": "Hotel Kvenvikmoen og Alta Vandrerhjem",
      "lat": 69.9224,
      "lon": 23.0913,
      "type": "hotel"
    },
    {
      "name": "Scandic Alta",
      "lat": 69.9661,
      "lon": 23.2692,
      "type": "hotel"
    },
    {
      "name": "Sorrisniva Igloo Hotel",
      "lat": 69.8652,
      "lon": 23.3182,
      "type": "hotel"
    },
    {
      "name": "Storekorsnes Ferie & Fritid",
      "lat": 70.2147,
      "lon": 23.1889,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Alta",
      "lat": 69.9651,
      "lon": 23.2709,
      "type": "hotel"
    },
    {
      "name": "Trasti & Trine Stengelsengården",
      "lat": 69.8843,
      "lon": 23.2513,
      "type": "guest_house"
    },
    {
      "name": "Øksfjord Hotell",
      "lat": 70.2379,
      "lon": 22.3509,
      "type": "hotel"
    }
  ],
  "Kongsvinger": [
    {
      "name": "Festningen Hotel & Resort",
      "lat": 60.1997,
      "lon": 12.0115,
      "type": "hotel"
    },
    {
      "name": "Ingelsrud Gård",
      "lat": 59.9364,
      "lon": 12.0738,
      "type": "guest_house"
    },
    {
      "name": "Kongsvinger Budget Hotel",
      "lat": 60.2086,
      "lon": 11.9646,
      "type": "hotel"
    },
    {
      "name": "Maarud gård",
      "lat": 60.1181,
      "lon": 11.7696,
      "type": "guest_house"
    },
    {
      "name": "Nes Villmarksforum",
      "lat": 60.1162,
      "lon": 11.6313,
      "type": "guest_house"
    },
    {
      "name": "Nordfjeld gjestegård",
      "lat": 60.0295,
      "lon": 12.0433,
      "type": "guest_house"
    },
    {
      "name": "Skaslien Gjestgiveri",
      "lat": 60.4628,
      "lon": 12.0611,
      "type": "hotel"
    },
    {
      "name": "Slobrua gjestehus",
      "lat": 60.2483,
      "lon": 11.743,
      "type": "hotel"
    },
    {
      "name": "Svanberg pensjonat",
      "lat": 60.5827,
      "lon": 12.0949,
      "type": "guest_house"
    },
    {
      "name": "Søstun Gård",
      "lat": 59.9831,
      "lon": 12.0442,
      "type": "guest_house"
    },
    {
      "name": "Tysken Gjestegård",
      "lat": 60.4607,
      "lon": 12.4987,
      "type": "guest_house"
    },
    {
      "name": "Vinger hotell",
      "lat": 60.1866,
      "lon": 12.0142,
      "type": "hotel"
    }
  ],
  "Lørenskog": [
    {
      "name": "Losby gods",
      "lat": 59.8906,
      "lon": 10.9835,
      "type": "hotel"
    },
    {
      "name": "Losby Gods",
      "lat": 59.8869,
      "lon": 10.9832,
      "type": "hotel"
    },
    {
      "name": "NKS Sykehotell",
      "lat": 59.9352,
      "lon": 10.9938,
      "type": "hotel"
    },
    {
      "name": "Radisson Blue Hotel & Conference Center, Oslo Alna",
      "lat": 59.9301,
      "lon": 10.8684,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Snø",
      "lat": 59.9477,
      "lon": 10.9539,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Triaden",
      "lat": 59.9186,
      "lon": 10.9537,
      "type": "hotel"
    }
  ],
  "Harstad": [
    {
      "name": "Brygga Gjestehus",
      "lat": 68.8042,
      "lon": 16.5455,
      "type": "guest_house"
    },
    {
      "name": "Clarion Collection Hotel Arcticus",
      "lat": 68.8043,
      "lon": 16.5494,
      "type": "hotel"
    },
    {
      "name": "Clarion Harstad",
      "lat": 68.8009,
      "lon": 16.5423,
      "type": "hotel"
    },
    {
      "name": "F2 Hotel",
      "lat": 68.7989,
      "lon": 16.5447,
      "type": "hotel"
    },
    {
      "name": "Midnattsol Pensjonat",
      "lat": 68.8048,
      "lon": 16.5413,
      "type": "hostel"
    },
    {
      "name": "Quality Hotel",
      "lat": 68.7973,
      "lon": 16.5449,
      "type": "hotel"
    },
    {
      "name": "Røkenes gård",
      "lat": 68.8334,
      "lon": 16.4857,
      "type": "guest_house"
    },
    {
      "name": "Sandtorgholmen Hotel",
      "lat": 68.5691,
      "lon": 16.5187,
      "type": "hotel"
    },
    {
      "name": "Sandtorgholmen Hotel (Guest House)",
      "lat": 68.5687,
      "lon": 16.5181,
      "type": "hotel"
    },
    {
      "name": "Scandic Harstad",
      "lat": 68.8009,
      "lon": 16.5422,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Harstad",
      "lat": 68.8015,
      "lon": 16.5435,
      "type": "hotel"
    },
    {
      "name": "Tjeldsundbrua Hotel",
      "lat": 68.6252,
      "lon": 16.5898,
      "type": "hotel"
    },
    {
      "name": "Tjeldsundbrua Hotell",
      "lat": 68.6254,
      "lon": 16.59,
      "type": "hotel"
    }
  ],
  "Oppdal": [
    {
      "name": "Bjerkeløkkja",
      "lat": 62.5937,
      "lon": 9.5583,
      "type": "guest_house"
    },
    {
      "name": "Gjesteheim Havdal",
      "lat": 62.7641,
      "lon": 9.9697,
      "type": "guest_house"
    },
    {
      "name": "Hæverstølen",
      "lat": 62.7432,
      "lon": 9.9541,
      "type": "guest_house"
    },
    {
      "name": "IMI Stølen",
      "lat": 62.6117,
      "lon": 9.7376,
      "type": "guest_house"
    },
    {
      "name": "Oppdal Gjestetun",
      "lat": 62.5925,
      "lon": 9.6876,
      "type": "hotel"
    },
    {
      "name": "Oppdal Turisthotell",
      "lat": 62.5931,
      "lon": 9.6928,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel Skifer",
      "lat": 62.5932,
      "lon": 9.6888,
      "type": "hotel"
    },
    {
      "name": "Savalen Fjellhotell & Spa",
      "lat": 62.3108,
      "lon": 10.5219,
      "type": "hotel"
    }
  ],
  "Flekkefjord": [
    {
      "name": "Alfarheim",
      "lat": 58.5066,
      "lon": 6.8629,
      "type": "hotel"
    },
    {
      "name": "Brufjell Hostel & Parking",
      "lat": 58.2854,
      "lon": 6.4234,
      "type": "hostel"
    },
    {
      "name": "Grand hotell Flekkefjord",
      "lat": 58.2973,
      "lon": 6.6618,
      "type": "hotel"
    },
    {
      "name": "Knaben leirskole",
      "lat": 58.6649,
      "lon": 7.0654,
      "type": "hostel"
    },
    {
      "name": "Maritim Fjordhotell",
      "lat": 58.2957,
      "lon": 6.6636,
      "type": "hotel"
    },
    {
      "name": "Moi hotell",
      "lat": 58.4496,
      "lon": 6.5639,
      "type": "hotel"
    },
    {
      "name": "Rafoss hotell",
      "lat": 58.3167,
      "lon": 6.9605,
      "type": "guest_house"
    },
    {
      "name": "Skipperhuset seng og mat",
      "lat": 58.2151,
      "lon": 6.5831,
      "type": "guest_house"
    },
    {
      "name": "Solli Jaktgaard",
      "lat": 58.5726,
      "lon": 6.9121,
      "type": "guest_house"
    },
    {
      "name": "Tonstadli Ferie, Kurs og Misjonssenter",
      "lat": 58.6672,
      "lon": 6.7309,
      "type": "guest_house"
    },
    {
      "name": "Utsikten Hotell",
      "lat": 58.3063,
      "lon": 6.9702,
      "type": "hotel"
    },
    {
      "name": "Vanderheim",
      "lat": 58.7599,
      "lon": 6.7423,
      "type": "guest_house"
    }
  ],
  "Bø i Vesterålen": [
    {
      "name": "Bø Hotell",
      "lat": 68.6881,
      "lon": 14.4777,
      "type": "hotel"
    },
    {
      "name": "Finvåg",
      "lat": 68.8052,
      "lon": 14.7752,
      "type": "guest_house"
    },
    {
      "name": "Skagakaia",
      "lat": 68.6078,
      "lon": 14.4459,
      "type": "guest_house"
    },
    {
      "name": "Vesterålen Rorbuer",
      "lat": 68.6983,
      "lon": 14.4674,
      "type": "hotel"
    }
  ],
  "Farsund": [
    {
      "name": "Brynehytta",
      "lat": 58.095,
      "lon": 6.6985,
      "type": "guest_house"
    },
    {
      "name": "Farsund Fjordhotell",
      "lat": 58.0876,
      "lon": 6.7963,
      "type": "hotel"
    },
    {
      "name": "HI Åpta",
      "lat": 58.1868,
      "lon": 6.795,
      "type": "hostel"
    },
    {
      "name": "Lista Flypark Hotell & Appartements",
      "lat": 58.1153,
      "lon": 6.6175,
      "type": "hotel"
    },
    {
      "name": "Lista fyr",
      "lat": 58.1092,
      "lon": 6.5675,
      "type": "guest_house"
    },
    {
      "name": "Lista Vandrerhjem",
      "lat": 58.1152,
      "lon": 6.6176,
      "type": "hostel"
    },
    {
      "name": "Rederiet Hotell",
      "lat": 58.0956,
      "lon": 6.8048,
      "type": "hotel"
    }
  ],
  "Notodden": [
    {
      "name": "Austbø hotell",
      "lat": 59.6902,
      "lon": 8.0948,
      "type": "hotel"
    },
    {
      "name": "Birdbox Tokke",
      "lat": 59.3858,
      "lon": 8.0075,
      "type": "guest_house"
    },
    {
      "name": "Brattrein hotell",
      "lat": 59.5534,
      "lon": 9.2791,
      "type": "hotel"
    },
    {
      "name": "Bø hotell",
      "lat": 59.4116,
      "lon": 9.0623,
      "type": "hotel"
    },
    {
      "name": "Bø Vertshus",
      "lat": 59.4135,
      "lon": 9.0649,
      "type": "hotel"
    },
    {
      "name": "Dalen Bed & Breakfast",
      "lat": 59.4451,
      "lon": 8.0092,
      "type": "hotel"
    },
    {
      "name": "Dalen Hotel",
      "lat": 59.4438,
      "lon": 8.0113,
      "type": "hotel"
    },
    {
      "name": "Gaustasyn",
      "lat": 59.9242,
      "lon": 8.7373,
      "type": "guest_house"
    },
    {
      "name": "Hagabrekka Wanderland",
      "lat": 59.566,
      "lon": 8.5488,
      "type": "hotel"
    },
    {
      "name": "Hovstø Hytter & Rom",
      "lat": 59.4767,
      "lon": 8.6071,
      "type": "hotel"
    },
    {
      "name": "Kvitåvatn Fjellstoge",
      "lat": 59.8795,
      "lon": 8.738,
      "type": "guest_house"
    },
    {
      "name": "Morgedal Gjestehus",
      "lat": 59.4768,
      "lon": 8.4195,
      "type": "hotel"
    },
    {
      "name": "Morgedal hotell",
      "lat": 59.4761,
      "lon": 8.4215,
      "type": "hotel"
    },
    {
      "name": "Norsjø hotell",
      "lat": 59.3944,
      "lon": 9.2533,
      "type": "hotel"
    },
    {
      "name": "Norsjøtunet",
      "lat": 59.3824,
      "lon": 9.2419,
      "type": "guest_house"
    },
    {
      "name": "Notodden Hotel",
      "lat": 59.5596,
      "lon": 9.2605,
      "type": "hotel"
    },
    {
      "name": "Nutheim gjestgiveri",
      "lat": 59.5706,
      "lon": 8.5485,
      "type": "hotel"
    },
    {
      "name": "Rauland Høgfjellshotell",
      "lat": 59.7388,
      "lon": 8.1347,
      "type": "hotel"
    },
    {
      "name": "Rjukan Admini Hotel",
      "lat": 59.8794,
      "lon": 8.5837,
      "type": "hotel"
    },
    {
      "name": "Rjukan Gjestegård",
      "lat": 59.8777,
      "lon": 8.5888,
      "type": "guest_house"
    },
    {
      "name": "Rjukan Gjestehus",
      "lat": 59.8772,
      "lon": 8.5946,
      "type": "hotel"
    },
    {
      "name": "Seljord Hotel",
      "lat": 59.4837,
      "lon": 8.6253,
      "type": "hotel"
    },
    {
      "name": "Skinnarbu Nasjonalparkhotell",
      "lat": 59.8148,
      "lon": 8.311,
      "type": "hotel"
    },
    {
      "name": "Solheim Accomodation",
      "lat": 59.4366,
      "lon": 8.8637,
      "type": "guest_house"
    },
    {
      "name": "Solstua",
      "lat": 59.4742,
      "lon": 9.0196,
      "type": "guest_house"
    },
    {
      "name": "Straand Hotel",
      "lat": 59.3244,
      "lon": 8.4967,
      "type": "hotel"
    },
    {
      "name": "Tjønnås Økogard",
      "lat": 59.6394,
      "lon": 8.9714,
      "type": "guest_house"
    },
    {
      "name": "Tuddal Høyfjellshotell",
      "lat": 59.7939,
      "lon": 8.7477,
      "type": "hotel"
    },
    {
      "name": "Uppigard Natadal",
      "lat": 59.5663,
      "lon": 8.588,
      "type": "guest_house"
    },
    {
      "name": "Vidsyn Midjås",
      "lat": 59.4504,
      "lon": 7.9222,
      "type": "guest_house"
    }
  ],
  "Rognan": [
    {
      "name": "Rognan hotell",
      "lat": 67.1035,
      "lon": 15.3916,
      "type": "hotel"
    },
    {
      "name": "Saltfjellet Hotell Polarsirkelen",
      "lat": 66.7372,
      "lon": 15.4637,
      "type": "hotel"
    },
    {
      "name": "Sulitjelma hotell",
      "lat": 67.143,
      "lon": 16.0195,
      "type": "hotel"
    },
    {
      "name": "Torgkroa",
      "lat": 66.9893,
      "lon": 14.7595,
      "type": "hotel"
    }
  ],
  "Bjerkvik": [
    {
      "name": "Bjerkvik hotell",
      "lat": 68.5505,
      "lon": 17.5525,
      "type": "hotel"
    },
    {
      "name": "Gratangen Fjellhotell",
      "lat": 68.6625,
      "lon": 17.7646,
      "type": "hotel"
    }
  ],
  "Lyngseidet": [
    {
      "name": "Helligskogen",
      "lat": 69.1998,
      "lon": 20.709,
      "type": "hostel"
    },
    {
      "name": "Hotel Lyngskroa",
      "lat": 69.2574,
      "lon": 19.8848,
      "type": "hotel"
    },
    {
      "name": "Håkon Gjestehus",
      "lat": 69.6044,
      "lon": 20.5326,
      "type": "guest_house"
    },
    {
      "name": "Lyngseidet gjestegård",
      "lat": 69.5764,
      "lon": 20.2148,
      "type": "hotel"
    },
    {
      "name": "Magic Mountain Lodge",
      "lat": 69.5791,
      "lon": 20.2326,
      "type": "hotel"
    },
    {
      "name": "Northern Lights",
      "lat": 69.4234,
      "lon": 19.6625,
      "type": "guest_house"
    },
    {
      "name": "Solhov",
      "lat": 69.5598,
      "lon": 20.2177,
      "type": "guest_house"
    },
    {
      "name": "Trollkafe",
      "lat": 69.397,
      "lon": 20.2686,
      "type": "hotel"
    }
  ],
  "Nordfjordeid": [
    {
      "name": "Doktorgarden",
      "lat": 62.044,
      "lon": 5.3507,
      "type": "guest_house"
    },
    {
      "name": "Gloppen Hotell",
      "lat": 61.7752,
      "lon": 6.2165,
      "type": "hotel"
    },
    {
      "name": "Jetmund Gjesteheim",
      "lat": 62.0388,
      "lon": 5.5222,
      "type": "hotel"
    },
    {
      "name": "Nesholmen",
      "lat": 61.6554,
      "lon": 5.7856,
      "type": "hostel"
    },
    {
      "name": "Nordfjord hotell",
      "lat": 61.9042,
      "lon": 5.9958,
      "type": "hotel"
    },
    {
      "name": "Rundereim hytter",
      "lat": 61.9997,
      "lon": 5.3315,
      "type": "guest_house"
    },
    {
      "name": "Scandic Nordfjord",
      "lat": 61.9044,
      "lon": 5.9891,
      "type": "hotel"
    },
    {
      "name": "Sentrum Hotell",
      "lat": 61.9067,
      "lon": 5.9948,
      "type": "hotel"
    },
    {
      "name": "Skipenes Gard",
      "lat": 61.9046,
      "lon": 6.0057,
      "type": "guest_house"
    }
  ],
  "Setermoen": [
    {
      "name": "Bardu Hotel",
      "lat": 68.8595,
      "lon": 18.3488,
      "type": "hotel"
    }
  ],
  "Leknes": [
    {
      "name": "Am Havern",
      "lat": 68.2977,
      "lon": 13.8686,
      "type": "guest_house"
    },
    {
      "name": "Eliassen Rorbuer and Hostel",
      "lat": 67.9475,
      "lon": 13.1315,
      "type": "hostel"
    },
    {
      "name": "Fagmek Resorts",
      "lat": 67.6624,
      "lon": 12.6903,
      "type": "hotel"
    },
    {
      "name": "Fiskarheimen",
      "lat": 67.6576,
      "lon": 12.7177,
      "type": "hotel"
    },
    {
      "name": "Fiskarheimen Havly Røst",
      "lat": 67.5061,
      "lon": 12.0753,
      "type": "hostel"
    },
    {
      "name": "FURU Hostel",
      "lat": 68.2827,
      "lon": 13.9116,
      "type": "hostel"
    },
    {
      "name": "FURU Private Rooms",
      "lat": 68.2828,
      "lon": 13.9115,
      "type": "guest_house"
    },
    {
      "name": "Hagstua",
      "lat": 68.157,
      "lon": 13.7035,
      "type": "hotel"
    },
    {
      "name": "Kræmmervika Rorbuer",
      "lat": 68.0691,
      "lon": 13.5343,
      "type": "hostel"
    },
    {
      "name": "Live Lofoten Hotel",
      "lat": 68.1237,
      "lon": 13.8442,
      "type": "hotel"
    },
    {
      "name": "Lofoten Bed & Breakfast",
      "lat": 67.9322,
      "lon": 13.089,
      "type": "hotel"
    },
    {
      "name": "Lofoten Bed and Boat",
      "lat": 67.8832,
      "lon": 12.9828,
      "type": "hotel"
    },
    {
      "name": "Lofoten Væroy Brygge Hotell",
      "lat": 67.6547,
      "lon": 12.7087,
      "type": "hotel"
    },
    {
      "name": "Nusfjord Arctic Resort Resepsjon",
      "lat": 68.0353,
      "lon": 13.3484,
      "type": "hotel"
    },
    {
      "name": "Reine Rorbuer",
      "lat": 67.9354,
      "lon": 13.0886,
      "type": "hotel"
    },
    {
      "name": "Reinebua",
      "lat": 67.9313,
      "lon": 13.0884,
      "type": "hotel"
    },
    {
      "name": "Rorbuer Olenilsøy",
      "lat": 67.9412,
      "lon": 13.1162,
      "type": "hotel"
    },
    {
      "name": "Røst Bryggehotell",
      "lat": 67.5058,
      "lon": 12.0773,
      "type": "hotel"
    },
    {
      "name": "Sakrisøy Gjestegård",
      "lat": 67.941,
      "lon": 13.1101,
      "type": "guest_house"
    },
    {
      "name": "Sakrisøy Rorbuer",
      "lat": 67.9415,
      "lon": 13.1117,
      "type": "hotel"
    },
    {
      "name": "Scandic Leknes Lofoten",
      "lat": 68.1459,
      "lon": 13.6126,
      "type": "hotel"
    },
    {
      "name": "Scandic Leknes Lofoten",
      "lat": 68.1459,
      "lon": 13.6127,
      "type": "hotel"
    },
    {
      "name": "Stamsund Vandrerhjem",
      "lat": 68.1305,
      "lon": 13.8543,
      "type": "hostel"
    },
    {
      "name": "Statles Rorbusenter AS",
      "lat": 68.0837,
      "lon": 13.6361,
      "type": "hotel"
    },
    {
      "name": "Steine Rorbu",
      "lat": 68.1181,
      "lon": 13.788,
      "type": "hostel"
    },
    {
      "name": "The Tide",
      "lat": 67.8893,
      "lon": 13.0207,
      "type": "hotel"
    },
    {
      "name": "Unstad Arctic Surf",
      "lat": 68.2652,
      "lon": 13.5913,
      "type": "hotel"
    },
    {
      "name": "Å Hamna Rorbuer",
      "lat": 67.8815,
      "lon": 12.9828,
      "type": "hostel"
    }
  ],
  "Fauske": [
    {
      "name": "Kobbelv Vertshus",
      "lat": 67.5797,
      "lon": 15.8904,
      "type": "hotel"
    },
    {
      "name": "Scandic Fauske",
      "lat": 67.259,
      "lon": 15.3975,
      "type": "hotel"
    }
  ],
  "Kristiansand": [
    {
      "name": "17",
      "lat": 58.1871,
      "lon": 8.1405,
      "type": "guest_house"
    },
    {
      "name": "20",
      "lat": 58.1874,
      "lon": 8.1405,
      "type": "guest_house"
    },
    {
      "name": "21",
      "lat": 58.1875,
      "lon": 8.1405,
      "type": "guest_house"
    },
    {
      "name": "26",
      "lat": 58.1875,
      "lon": 8.1398,
      "type": "guest_house"
    },
    {
      "name": "28",
      "lat": 58.1874,
      "lon": 8.1398,
      "type": "guest_house"
    },
    {
      "name": "29",
      "lat": 58.1873,
      "lon": 8.1398,
      "type": "guest_house"
    },
    {
      "name": "30",
      "lat": 58.1872,
      "lon": 8.1398,
      "type": "guest_house"
    },
    {
      "name": "4",
      "lat": 58.1873,
      "lon": 8.14,
      "type": "guest_house"
    },
    {
      "name": "Abra Havn",
      "lat": 58.1883,
      "lon": 8.1513,
      "type": "hotel"
    },
    {
      "name": "Citybox",
      "lat": 58.1469,
      "lon": 7.988,
      "type": "hotel"
    },
    {
      "name": "Clarion Hotel Ernst",
      "lat": 58.1443,
      "lon": 7.9929,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Kristiansand",
      "lat": 58.1458,
      "lon": 7.9907,
      "type": "hotel"
    },
    {
      "name": "Dronningen Hotel",
      "lat": 58.1429,
      "lon": 7.994,
      "type": "hotel"
    },
    {
      "name": "Dyreparken Hotel",
      "lat": 58.1849,
      "lon": 8.1483,
      "type": "hotel"
    },
    {
      "name": "Hamresanden Resort",
      "lat": 58.1932,
      "lon": 8.0802,
      "type": "guest_house"
    },
    {
      "name": "Hotel Q42",
      "lat": 58.1487,
      "lon": 8.0031,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Caledonien",
      "lat": 58.1425,
      "lon": 7.9947,
      "type": "hotel"
    },
    {
      "name": "Radisson Blu Caledonien Hotel",
      "lat": 58.1425,
      "lon": 7.9947,
      "type": "hotel"
    },
    {
      "name": "Rogligheten",
      "lat": 58.1574,
      "lon": 8.0277,
      "type": "guest_house"
    },
    {
      "name": "Scandic Kristiansand Bystranda",
      "lat": 58.1472,
      "lon": 8.0055,
      "type": "hotel"
    },
    {
      "name": "Scandic Sørlandet",
      "lat": 58.1799,
      "lon": 8.1447,
      "type": "hotel"
    },
    {
      "name": "Sjøgløtt Hotell",
      "lat": 58.1447,
      "lon": 7.9998,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Kristiansand",
      "lat": 58.1468,
      "lon": 7.9898,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Parken",
      "lat": 58.1457,
      "lon": 7.9958,
      "type": "hotel"
    }
  ],
  "Sortland": [
    {
      "name": "B&B Nyksund",
      "lat": 68.9949,
      "lon": 15.0145,
      "type": "guest_house"
    },
    {
      "name": "Holmvik Brygge",
      "lat": 68.995,
      "lon": 15.0134,
      "type": "guest_house"
    },
    {
      "name": "Marmelkroken",
      "lat": 69.0411,
      "lon": 15.515,
      "type": "guest_house"
    },
    {
      "name": "Myre Kysthotell",
      "lat": 68.9152,
      "lon": 15.094,
      "type": "hotel"
    },
    {
      "name": "Myre Overnatting",
      "lat": 68.9153,
      "lon": 15.09,
      "type": "hotel"
    },
    {
      "name": "Nyksund Kurs og Retreatgård",
      "lat": 68.9955,
      "lon": 15.0091,
      "type": "guest_house"
    },
    {
      "name": "Scandic Sortland",
      "lat": 68.6974,
      "lon": 15.4191,
      "type": "hotel"
    },
    {
      "name": "Sortland hotell",
      "lat": 68.6952,
      "lon": 15.4123,
      "type": "hotel"
    }
  ],
  "Nittedal": [
    {
      "name": "Granavolden Gjæstgiveri",
      "lat": 60.3665,
      "lon": 10.5281,
      "type": "hotel"
    },
    {
      "name": "Hotell Hadeland",
      "lat": 60.3713,
      "lon": 10.5328,
      "type": "hotel"
    },
    {
      "name": "Raumergården Hotel",
      "lat": 60.0727,
      "lon": 11.0362,
      "type": "hotel"
    },
    {
      "name": "Sanner Hotell",
      "lat": 60.3657,
      "lon": 10.5384,
      "type": "hotel"
    },
    {
      "name": "Thorbjørnrud Hotel",
      "lat": 60.2417,
      "lon": 10.4014,
      "type": "hotel"
    }
  ],
  "Kirkenes": [
    {
      "name": "Barents Frokosthotell",
      "lat": 69.7279,
      "lon": 30.0464,
      "type": "hotel"
    },
    {
      "name": "Kirkenes Hotell",
      "lat": 69.7279,
      "lon": 30.0392,
      "type": "hotel"
    },
    {
      "name": "Kirkenes Overnatting",
      "lat": 69.7195,
      "lon": 30.0665,
      "type": "hotel"
    },
    {
      "name": "Kirkenes Snowhotel",
      "lat": 69.6768,
      "lon": 29.9046,
      "type": "hotel"
    },
    {
      "name": "Neiden",
      "lat": 69.6875,
      "lon": 29.3818,
      "type": "hotel"
    },
    {
      "name": "Scandic Kirkenes",
      "lat": 69.7265,
      "lon": 30.0446,
      "type": "hotel"
    },
    {
      "name": "Sollia Gjestegaard",
      "lat": 69.6647,
      "lon": 30.1966,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Kirkenes",
      "lat": 69.7294,
      "lon": 30.0458,
      "type": "hotel"
    }
  ],
  "Vadsø": [
    {
      "name": "Elsa",
      "lat": 69.9721,
      "lon": 29.6322,
      "type": "hostel"
    },
    {
      "name": "Polmakmoen Gjestegård",
      "lat": 70.068,
      "lon": 28.0215,
      "type": "guest_house"
    },
    {
      "name": "Scandic Vadsø",
      "lat": 70.0746,
      "lon": 29.7498,
      "type": "hotel"
    },
    {
      "name": "Tana Hotel og Camping",
      "lat": 70.1995,
      "lon": 28.1925,
      "type": "hotel"
    },
    {
      "name": "Vadsø fjordhotell",
      "lat": 70.0676,
      "lon": 29.7481,
      "type": "hotel"
    },
    {
      "name": "Vestre Jakobselv Camping og Misjonssenter",
      "lat": 70.1202,
      "lon": 29.3307,
      "type": "hostel"
    }
  ],
  "Namsos": [
    {
      "name": "Efri Halfa",
      "lat": 64.3706,
      "lon": 11.8364,
      "type": "guest_house"
    },
    {
      "name": "Eian Fjordsenter",
      "lat": 64.5138,
      "lon": 10.9098,
      "type": "guest_house"
    },
    {
      "name": "Scandic Rock City",
      "lat": 64.4684,
      "lon": 11.4877,
      "type": "hotel"
    },
    {
      "name": "Tinos hotell",
      "lat": 64.4678,
      "lon": 11.4927,
      "type": "hotel"
    }
  ],
  "Drammen": [
    {
      "name": "Clarion Collection Hotel Tollboden",
      "lat": 59.737,
      "lon": 10.2104,
      "type": "hotel"
    },
    {
      "name": "Comfort Hotel Union Brygge",
      "lat": 59.7439,
      "lon": 10.1919,
      "type": "hotel"
    },
    {
      "name": "Globus Hotel",
      "lat": 59.7396,
      "lon": 10.2003,
      "type": "hotel"
    },
    {
      "name": "Høvik overnatting B&B",
      "lat": 59.7359,
      "lon": 10.1878,
      "type": "guest_house"
    },
    {
      "name": "Origo Leilighetshotell",
      "lat": 59.7471,
      "lon": 10.1922,
      "type": "hotel"
    },
    {
      "name": "Quality Hotel River Station",
      "lat": 59.7391,
      "lon": 10.2067,
      "type": "hotel"
    },
    {
      "name": "Sanden Hotell",
      "lat": 59.7747,
      "lon": 9.9116,
      "type": "hotel"
    },
    {
      "name": "Scandic Ambassadeur Drammen",
      "lat": 59.7401,
      "lon": 10.2005,
      "type": "hotel"
    },
    {
      "name": "Tyrifjord hotell",
      "lat": 59.9678,
      "lon": 10.009,
      "type": "hotel"
    }
  ],
  "Askim": [
    {
      "name": "Blixland ridesenter",
      "lat": 59.6552,
      "lon": 11.0187,
      "type": "guest_house"
    }
  ],
  "Åndalsnes": [
    {
      "name": "Bjorliheimen hotel",
      "lat": 62.252,
      "lon": 8.2162,
      "type": "hotel"
    },
    {
      "name": "Blåtind",
      "lat": 62.3358,
      "lon": 7.0957,
      "type": "hotel"
    },
    {
      "name": "Framgarden",
      "lat": 62.3713,
      "lon": 7.1036,
      "type": "guest_house"
    },
    {
      "name": "Grand Hotel Bellevue",
      "lat": 62.5656,
      "lon": 7.6888,
      "type": "hotel"
    },
    {
      "name": "Hotel Aak",
      "lat": 62.5367,
      "lon": 7.7304,
      "type": "hotel"
    },
    {
      "name": "Juvet Landskapshotell",
      "lat": 62.333,
      "lon": 7.4705,
      "type": "hotel"
    },
    {
      "name": "Kavli Moen gård",
      "lat": 62.6433,
      "lon": 8.1045,
      "type": "guest_house"
    },
    {
      "name": "Petrines Gjestegiveri",
      "lat": 62.2526,
      "lon": 7.2349,
      "type": "guest_house"
    },
    {
      "name": "Rosvang Gaard",
      "lat": 62.6301,
      "lon": 7.5344,
      "type": "guest_house"
    },
    {
      "name": "Valldal Fjord Lodge",
      "lat": 62.3,
      "lon": 7.264,
      "type": "hotel"
    },
    {
      "name": "Valldal fjordhotell",
      "lat": 62.297,
      "lon": 7.258,
      "type": "hotel"
    },
    {
      "name": "Villa Åndalsnes",
      "lat": 62.5651,
      "lon": 7.69,
      "type": "guest_house"
    },
    {
      "name": "Åndalsnes vandrerhjem",
      "lat": 62.5542,
      "lon": 7.6817,
      "type": "hostel"
    }
  ],
  "Lødingen": [
    {
      "name": "Dampskipsbrygga",
      "lat": 68.4144,
      "lon": 15.997,
      "type": "guest_house"
    },
    {
      "name": "Hamarøy Hotel",
      "lat": 67.9627,
      "lon": 15.9302,
      "type": "hotel"
    },
    {
      "name": "Tysfjord Turisthotell",
      "lat": 68.1933,
      "lon": 16.026,
      "type": "hotel"
    },
    {
      "name": "Ulvsvåg Gjestgiveri",
      "lat": 68.1158,
      "lon": 15.8649,
      "type": "guest_house"
    }
  ],
  "Brønnøysund": [
    {
      "name": "Handelsstedet Forvik",
      "lat": 65.7145,
      "lon": 12.4619,
      "type": "guest_house"
    },
    {
      "name": "Heilhornet Seaside Lodge",
      "lat": 65.0776,
      "lon": 12.0666,
      "type": "hotel"
    },
    {
      "name": "Sømna Kro & Gjestegård",
      "lat": 65.3101,
      "lon": 12.1667,
      "type": "guest_house"
    },
    {
      "name": "Terråk Gjestegård",
      "lat": 65.0876,
      "lon": 12.3754,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Brønnøysund",
      "lat": 65.476,
      "lon": 12.2144,
      "type": "hotel"
    },
    {
      "name": "Torgarhaugen Gjestehus",
      "lat": 65.395,
      "lon": 12.0988,
      "type": "guest_house"
    },
    {
      "name": "Vega Havhotell",
      "lat": 65.7016,
      "lon": 11.8738,
      "type": "hotel"
    },
    {
      "name": "Vevelstad Gjestegård",
      "lat": 65.7028,
      "lon": 12.4434,
      "type": "guest_house"
    }
  ],
  "Askøy": [
    {
      "name": "Alver Hotel",
      "lat": 60.5687,
      "lon": 5.2408,
      "type": "hotel"
    },
    {
      "name": "Blomvåg Fjordhotell",
      "lat": 60.5295,
      "lon": 4.8761,
      "type": "hotel"
    },
    {
      "name": "Hella skulestove",
      "lat": 60.6692,
      "lon": 4.9701,
      "type": "guest_house"
    },
    {
      "name": "House of Bergen II",
      "lat": 60.381,
      "lon": 5.225,
      "type": "guest_house"
    },
    {
      "name": "Magnusgården",
      "lat": 60.6927,
      "lon": 5.1093,
      "type": "guest_house"
    },
    {
      "name": "VÅGSEIDESTRANDA FERIESENTER",
      "lat": 60.7245,
      "lon": 5.214,
      "type": "hostel"
    },
    {
      "name": "Westland Hotel",
      "lat": 60.7377,
      "lon": 5.156,
      "type": "hotel"
    },
    {
      "name": "Ågotnes hotell",
      "lat": 60.4052,
      "lon": 5.0013,
      "type": "hotel"
    }
  ],
  "Stokmarknes": [
    {
      "name": "Hurtigrutens Hus",
      "lat": 68.5689,
      "lon": 14.9108,
      "type": "hotel"
    },
    {
      "name": "Melbu Hotell",
      "lat": 68.4984,
      "lon": 14.7978,
      "type": "hotel"
    },
    {
      "name": "Vesterålen Kysthotell",
      "lat": 68.5708,
      "lon": 14.9248,
      "type": "hotel"
    }
  ],
  "Melhus": [
    {
      "name": "Brøttem gård",
      "lat": 63.2527,
      "lon": 10.5043,
      "type": "guest_house"
    },
    {
      "name": "Daniel's Hjem",
      "lat": 63.285,
      "lon": 10.2846,
      "type": "hostel"
    },
    {
      "name": "Daniel's Hjem",
      "lat": 63.2855,
      "lon": 10.286,
      "type": "hostel"
    },
    {
      "name": "Karivollen",
      "lat": 63.2958,
      "lon": 10.2959,
      "type": "hotel"
    },
    {
      "name": "Sandmoen Bed and Breakfast",
      "lat": 63.3311,
      "lon": 10.3567,
      "type": "guest_house"
    },
    {
      "name": "Solstad Pensjonat",
      "lat": 63.2034,
      "lon": 10.3078,
      "type": "guest_house"
    },
    {
      "name": "Sundet gård",
      "lat": 63.3437,
      "lon": 10.2384,
      "type": "hotel"
    }
  ],
  "Sunndalsøra": [
    {
      "name": "Bortistu Gjestegard",
      "lat": 62.6933,
      "lon": 9.0983,
      "type": "guest_house"
    },
    {
      "name": "Phillipshaugen Lodge",
      "lat": 62.6831,
      "lon": 8.4118,
      "type": "guest_house"
    },
    {
      "name": "Storli Gard",
      "lat": 62.6934,
      "lon": 9.0932,
      "type": "guest_house"
    },
    {
      "name": "Sunndalsøra Hotell",
      "lat": 62.6745,
      "lon": 8.5644,
      "type": "hotel"
    },
    {
      "name": "Trædal hotell & Turistsenter",
      "lat": 62.6598,
      "lon": 8.5344,
      "type": "hotel"
    }
  ],
  "Sjøvegan": [
    {
      "name": "Fjellkysten gjestehus",
      "lat": 68.7818,
      "lon": 17.7948,
      "type": "hotel"
    },
    {
      "name": "Garsnes Brygge",
      "lat": 68.8694,
      "lon": 17.768,
      "type": "hotel"
    }
  ],
  "Volda": [
    {
      "name": "Hoddevika Surf Camp",
      "lat": 62.1258,
      "lon": 5.1676,
      "type": "hostel"
    },
    {
      "name": "Lapoint Surfeleir Norge - Hoddevik",
      "lat": 62.1185,
      "lon": 5.1747,
      "type": "hostel"
    }
  ],
  "Bardu": [
    {
      "name": "Soltun soldatheim og ungdomssenter",
      "lat": 68.8699,
      "lon": 18.3501,
      "type": "guest_house"
    }
  ],
  "Os": [
    {
      "name": "Bekkjarvik Gjestgiveri",
      "lat": 60.007,
      "lon": 5.2035,
      "type": "guest_house"
    },
    {
      "name": "Bekkjerviken Lodgement",
      "lat": 60.0076,
      "lon": 5.2052,
      "type": "hotel"
    },
    {
      "name": "Herskaphuset",
      "lat": 60.0066,
      "lon": 5.2037,
      "type": "guest_house"
    },
    {
      "name": "Hestavika",
      "lat": 60.0714,
      "lon": 5.9703,
      "type": "guest_house"
    },
    {
      "name": "Haaheim Gaard",
      "lat": 60.0165,
      "lon": 5.536,
      "type": "guest_house"
    },
    {
      "name": "Haaheim Gaard",
      "lat": 60.0164,
      "lon": 5.5362,
      "type": "guest_house"
    },
    {
      "name": "Panorama Hotell & Resort",
      "lat": 60.1824,
      "lon": 5.0916,
      "type": "hotel"
    },
    {
      "name": "Skjelbreid Poirée",
      "lat": 60.2507,
      "lon": 5.7969,
      "type": "guest_house"
    },
    {
      "name": "Solstrand Hotel & Bad",
      "lat": 60.1891,
      "lon": 5.4876,
      "type": "hotel"
    },
    {
      "name": "Solstrand Hotel & Bad",
      "lat": 60.1888,
      "lon": 5.4877,
      "type": "hotel"
    },
    {
      "name": "Tysnes Sjø & fritid",
      "lat": 59.9965,
      "lon": 5.4914,
      "type": "guest_house"
    },
    {
      "name": "Villa Charlotte",
      "lat": 60.246,
      "lon": 5.2696,
      "type": "guest_house"
    },
    {
      "name": "Ølve Gjestehus",
      "lat": 60.0115,
      "lon": 5.8103,
      "type": "guest_house"
    }
  ],
  "Sørreisa": [
    {
      "name": "Malangen Resort",
      "lat": 69.3511,
      "lon": 18.7109,
      "type": "hotel"
    },
    {
      "name": "Sørreisa hotell",
      "lat": 69.1452,
      "lon": 18.1517,
      "type": "hotel"
    },
    {
      "name": "Tømmerneset Leirsted",
      "lat": 69.2178,
      "lon": 18.2864,
      "type": "hostel"
    }
  ],
  "Kautokeino": [
    {
      "name": "Kautokeino Villmarkssenter AS",
      "lat": 69.0115,
      "lon": 23.0393,
      "type": "guest_house"
    },
    {
      "name": "Thon Hotel Kautokeino",
      "lat": 69.0168,
      "lon": 23.0424,
      "type": "hotel"
    }
  ],
  "Follo": [
    {
      "name": "Fuglesang feriehjem",
      "lat": 59.7426,
      "lon": 10.7151,
      "type": "guest_house"
    }
  ],
  "Skjervøy": [
    {
      "name": "Hotel Maritim Skjervøy",
      "lat": 70.0365,
      "lon": 20.9814,
      "type": "hotel"
    },
    {
      "name": "Isbreen The Glacier",
      "lat": 70.0719,
      "lon": 21.9913,
      "type": "guest_house"
    },
    {
      "name": "Lauksletta Overnatting",
      "lat": 70.1263,
      "lon": 20.7538,
      "type": "guest_house"
    }
  ],
  "Ørnes": [
    {
      "name": "Glomfjord hotell",
      "lat": 66.8167,
      "lon": 13.9449,
      "type": "hotel"
    },
    {
      "name": "Glomfjord Overnatting",
      "lat": 66.8084,
      "lon": 13.9758,
      "type": "guest_house"
    },
    {
      "name": "Heimsjyen",
      "lat": 67.0348,
      "lon": 14.0265,
      "type": "guest_house"
    },
    {
      "name": "Kvitbrygga",
      "lat": 66.7406,
      "lon": 13.4989,
      "type": "guest_house"
    },
    {
      "name": "Myken B&B",
      "lat": 66.7584,
      "lon": 12.4776,
      "type": "guest_house"
    },
    {
      "name": "Tjongsfjord Gjestegård",
      "lat": 66.6983,
      "lon": 13.4226,
      "type": "hotel"
    },
    {
      "name": "Ørnes Hotell",
      "lat": 66.8682,
      "lon": 13.7057,
      "type": "hotel"
    }
  ],
  "Mysen": [
    {
      "name": "Bye Kro & Vertshus",
      "lat": 59.4267,
      "lon": 11.3404,
      "type": "guest_house"
    },
    {
      "name": "Gabestad Økogård",
      "lat": 59.4414,
      "lon": 11.246,
      "type": "guest_house"
    },
    {
      "name": "Rømskog Hotell Spa & Resort",
      "lat": 59.7326,
      "lon": 11.7429,
      "type": "hotel"
    },
    {
      "name": "Scandic Brennemoen",
      "lat": 59.5745,
      "lon": 11.2798,
      "type": "hotel"
    },
    {
      "name": "Sjøglimt leirsted",
      "lat": 59.5031,
      "lon": 11.6278,
      "type": "hostel"
    },
    {
      "name": "Solstrand Terrasse",
      "lat": 59.4672,
      "lon": 11.66,
      "type": "guest_house"
    }
  ],
  "Sandvika": [
    {
      "name": "Emma Gjestehus",
      "lat": 59.8947,
      "lon": 10.4917,
      "type": "guest_house"
    },
    {
      "name": "Scandic Fornebu",
      "lat": 59.8937,
      "lon": 10.6299,
      "type": "hotel"
    },
    {
      "name": "Thon Hotel Oslofjord",
      "lat": 59.8858,
      "lon": 10.5192,
      "type": "hotel"
    }
  ]
};
