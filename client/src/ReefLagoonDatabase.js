//annoying that we have to import them, but directly using the url didn't work
import chelmon_rostratus_url from './assets/exhibits/reef_lagoon/gallery/butterflyfishes.jpg';
import acanthurus_triostegus_url from './assets/exhibits/reef_lagoon/gallery/surgeonfishes.jpg';
import monodactylus_argenteus_url from './assets/exhibits/reef_lagoon/gallery/moonyfishes.jpg';
import trachinotus_mookalee_url from './assets/exhibits/reef_lagoon/gallery/pompanos.jpg';

const database = [
  { 
    scientific_name: 'Chelmon rostratus',
    common_name: 'Copperband butterflyfish',
    status: 'Least concern',
    diet: 'Benthic invertebrates, which it finds in rock crevices with its elongated snout',
    reproduction: 'Oviparous',
    thumbnail_url: chelmon_rostratus_url,
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.in/summary/5483'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Chelmon'
      }
    ] 
  },
  { 
    scientific_name: 'Acanthurus triostegus',
    common_name: 'Convict surgeon',
    status: 'Least concern',
    diet: 'Benthic algae',
    reproduction: 'Oviparous broadcast spawners; found in large groups (up to several hundred) that exhibit mass spawning behavior',
    thumbnail_url: acanthurus_triostegus_url,
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.se/summary/1260'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Acanthurus_triostegus'
      }
    ] 
  },
  { 
    scientific_name: 'Monodactylus argenteus',
    common_name: 'Diamond fish (or Mono)',
    status: 'Not yet assessed',
    diet: 'Plankton and detritus',
    reproduction: 'Broadcast spawners; males and females shed gametes into the water, where fertilization occurs',
    thumbnail_url: monodactylus_argenteus_url,
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.de/summary/Monodactylus-argenteus.html'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Monodactylus_argenteus'
      }
    ] 
  },
  { 
    scientific_name: 'Trachinotus mookalee',
    common_name: 'Indian pompano',
    status: 'Not yet assessed',
    diet: 'Small fishes and crustaceans',
    reproduction: 'Broadcast spawners',
    thumbnail_url: trachinotus_mookalee_url,
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.de/summary/1964'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Pompano'
      }
    ] 
  }
]

export default database
