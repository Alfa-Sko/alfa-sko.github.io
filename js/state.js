const DEFAULT_EVENTS = {};
const DEFAULT_VISITS = [];
const DEFAULT_FOLLOWUPS = [];




// ═══════════════════════════════════════════════════════════════════════════

let visits = loadData('alfa_visits', DEFAULT_VISITS);
let followups = loadData('alfa_followups', DEFAULT_FOLLOWUPS);

let calEvents = loadData('alfa_events', DEFAULT_EVENTS);
let freeNotes = loadData('alfa_free_notes', []);
let custPhotos = loadData('alfa_cust_photos', []);
let personalDays = loadData('alfa_personal_days', []); // ferie/fridager registrert av brukeren


// Brukerprofil — alle preferanser samlet på ett sted
const DEFAULT_USER_PROFILE = {
  // Personlig
  name: '',
  email: '',
  phone: '',
  // Hjem
  homeAddress: '',
  homeCity: '',
  // Bil
  carType: 'bensin', // bensin | diesel | elbil | hybrid
  carModel: '',
  evRange: 0,        // km på full lading (kun elbil)
  chargingPref: 'tesla', // tesla | ionity | circle-k | recharge | alle
  autopass: true,
  rentalPref: '',    // foretrukket leiebilselskap (avis | hertz | europcar | sixt | budget)
  // Fly
  airlinePref: 'sas', // sas | norwegian | wideroe | alle
  airlineLoyalty: '', // f.eks. "SAS Eurobonus Gold"
  homeAirport: 'TOS', // TOS = Tromsø Langnes
  // Hotell
  hotelChainPref: ['scandic','thon'], // foretrukne kjeder
  hotelLoyalty: '',   // f.eks. "Scandic Friends Gold"
  // Arbeidstider
  workStart: '08:00',
  workEnd: '17:00',
  lunchStart: '11:00',
  lunchDuration: 30,
  // Ferje
  preferredFerryOperator: 'torghatten', // torghatten | norled | fjord1 | alle
};
let userProfile = Object.assign({}, DEFAULT_USER_PROFILE, loadData('alfa_user_profile', {}));

const RENTAL_NAMES = {avis:'Avis', hertz:'Hertz', europcar:'Europcar', sixt:'Sixt', budget:'Budget', alle:''};
