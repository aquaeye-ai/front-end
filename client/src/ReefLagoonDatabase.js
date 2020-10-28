//annoying that we have to import them, but directly using the url didn't work
import chelmon_rostratus_url from './assets/exhibits/reef_lagoon/gallery/chelmon_rostratus.jpg';
import acanthurus_triostegus_url from './assets/exhibits/reef_lagoon/gallery/acanthurus_triostegus.jpg';
import monodactylus_argenteus_url from './assets/exhibits/reef_lagoon/gallery/monodactylus_argenteus.jpg';
import trachinotus_mookalee_url from './assets/exhibits/reef_lagoon/gallery/trachinotus_mookalee.jpg';
import rhinoptera_javanica_url from './assets/exhibits/reef_lagoon/gallery/rhinoptera_javanica.jpg';
import taeniura_lymma_url from './assets/exhibits/reef_lagoon/gallery/taeniura_lymma.jpg';
import himantura_uarnak_url from './assets/exhibits/reef_lagoon/gallery/himantura_uarnak.jpg';
import neotrygon_kuhlii_url from './assets/exhibits/reef_lagoon/gallery/neotrygon_kuhlii.jpg';

const database = {
  chelmon_rostratus: { 
    scientific_name: 'Chelmon rostratus',
    common_name: 'Copperband butterflyfish',
    common_group_name: 'butterflyfishes',
    status: 'Least concern',
    diet: 'Benthic invertebrates, which it finds in rock crevices with its elongated snout',
    reproduction: 'Oviparous',
    thumbnail: {
      url: chelmon_rostratus_url,
      credit: {
        owner: {
          name: 'Ruben Undheim',
          url: 'https://www.flickr.com/photos/rubund/6337847312/in/photolist-aE48cw'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
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
  acanthurus_triostegus: { 
    scientific_name: 'Acanthurus triostegus',
    common_name: 'Convict surgeon',
    common_group_name: 'surgeonfishes',
    status: 'Least concern',
    diet: 'Benthic algae',
    reproduction: 'Oviparous broadcast spawners; found in large groups (up to several hundred) that exhibit mass spawning behavior',
    thumbnail: {
      url: acanthurus_triostegus_url,
      credit: {
        owner: {
          name: 'briangratwicke',
          url: 'https://www.flickr.com/photos/briangratwicke/7108170629/in/photolist-bQ8eu2'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
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
  monodactylus_argenteus: { 
    scientific_name: 'Monodactylus argenteus',
    common_name: 'Diamond fish (or Mono)',
    common_group_name: 'moonyfishes',
    status: 'Not yet assessed',
    diet: 'Plankton and detritus',
    reproduction: 'Broadcast spawners; males and females shed gametes into the water, where fertilization occurs',
    thumbnail: {
      url: monodactylus_argenteus_url,
      credit: {
        owner: {
          name: 'Richard Liang',
          url: 'https://www.flickr.com/photos/rling/4003598139/in/photolist-EH4Zf-mnnjz1-5ATWpR-5u3WqN-5u3WGQ-ArR1od-76Muf8-Dc8J7J-DJSYjR'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
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
  trachinotus_mookalee: { 
    scientific_name: 'Trachinotus mookalee',
    common_name: 'Indian pompano',
    common_group_name: 'pompanos',
    status: 'Not yet assessed',
    diet: 'Small fishes and crustaceans',
    reproduction: 'Broadcast spawners',
    thumbnail: {
      url: trachinotus_mookalee_url,
      credit: {
        owner: {
          name: '',
          url: ''
        },
        license: {
          name: '',
          url: ''
        }
      }
    },
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
  },
  rhinoptera_javanica: { 
    scientific_name: 'Rhinoptera javanica',
    common_name: 'Cownose ray',
    common_group_name: 'stingrays',
    status: 'Near threatened',
    diet: 'Clams, oysters, other invertebrates',
    reproduction: 'Ovoviviparous—rays produce eggs that remain inside the mother’s body until they hatch, resulting in a live birth',
    thumbnail: {
      url: rhinoptera_javanica_url,
      credit: {
        owner: {
          name: '',
          url: ''
        },
        license: {
          name: '',
          url: ''
        }
      }
    },
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.se/summary/7971'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Flapnose_ray'
      }
    ] 
  },
  taeniura_lymma: { 
    scientific_name: 'Taeniura lymma',
    common_name: 'Blue-spotted ribbontail ray',
    common_group_name: 'stingrays',
    status: 'Near threatened',
    diet: 'Mollusks, worms, shrimp, clams',
    reproduction: 'Ovoviviparous',
    thumbnail: {
      url: taeniura_lymma_url,
      credit: {
        owner: {
          name: 'Jens Petersen',
          url: 'https://commons.wikimedia.org/wiki/File:Taeniura_lymma2a.jpg'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/bluespotted-ribbontail-ray'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.se/summary/5399'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Bluespotted_ribbontail_ray'
      }
    ] 
  },
  himantura_uarnak: { 
    scientific_name: 'Himantura uarnak',
    common_name: 'Honeycomb ray',
    common_group_name: 'stingrays',
    status: 'Vulnerable',
    diet: 'Crabs, shrimps, bivalves, gastropods, worms, jellyfish, bony fishes',
    reproduction: 'Viviparous',
    thumbnail: {
      url: himantura_uarnak_url,
      credit: {
        owner: {
          name: 'Steven Walling',
          url: 'https://commons.wikimedia.org/wiki/File:Ray_at_California_Academy_of_Sciences.jpg'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.se/summary/Himantura-uarnak'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Reticulate_whipray'
      }
    ] 
  },
  neotrygon_kuhlii: { 
    scientific_name: 'Neotrygon kuhlii',
    common_name: 'Bluespotted stingray',
    common_group_name: 'stingrays',
    status: 'Data deficien',
    diet: 'Shrimp, crabs',
    reproduction: 'Ovoviviparous',
    thumbnail: {
      url: neotrygon_kuhlii_url,
      credit: {
        owner: {
          name: 'Bernard Dupont',
          url: 'https://commons.wikimedia.org/wiki/File:Blue-spotted_Stingray_(Neotrygon_kuhlii)_(8465011759).jpg'
        },
        license: {
          name: 'CC BY',
          url: 'http://creativecommons.org/licenses/by/2.0/'
        }
      }
    },
    info_urls: [
      {
        name: 'CalAcademy',
        url: 'https://www.calacademy.org/explore-science/reef-lagoon-field-guide?mpweb=1018-12008-18033'
      },
      {	
        name: 'FishBase',
        url: 'https://www.fishbase.se/summary/4508'
      },
      {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Kuhl%27s_maskray'
      }
    ] 
  }
}

export default database
