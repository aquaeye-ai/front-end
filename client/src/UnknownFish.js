//annoying that we have to import them, but directly using the url didn't work
import unknown_fish_url from './assets/exhibits/reef_lagoon/gallery/unknown.png';

const unknown_fish = { 
  scientific_name: 'N/A',
  common_name: 'N/A',
  common_group_name: 'N/A',
  status: 'N/A',
  diet: 'N/A',
  reproduction: 'N/A',
  thumbnail: {
    url: unknown_fish_url,
    credit: {
      owner: {
        name: '',
        url: ''
      },
      license: {
        name: 'CC BY',
        url: ''
      }
    }
  },
  info_urls: [] 
}

export default unknown_fish
