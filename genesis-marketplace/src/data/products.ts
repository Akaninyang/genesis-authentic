import type { Product } from '../types.ts'
import watch from '../assets/watch-unsplash.jpg'
import lambo from '../assets/aventador-unsplash.jpg'
import vangogh from '../assets/vangogh-unsplash.jpg'
import gt from '../assets/pgt-unsplash.jpg'
import f1 from '../assets/f1-unsplash.jpg'
import boat from '../assets/boat-unsplash.jpg'

export const products: Product[] = [
  {
    id: 0,
    name: 'Porsche 911 Turbo S',
    manufacturer: 'Porsche AG',
    image: gt,
    price: '45,000',
    pastOwners: '0',
    description: 'Limited first-edition performance coupe — blockchain proof of authenticity.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 1,
    name: 'Moon Watch',
    manufacturer: 'Cartier',
    image: watch,
    price: '12,000',
    pastOwners: '0',
    description: 'Flawless luxury wrist watch, handmade and serial attested on-chain.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 2,
    name: 'Van Gogh: Reproduction',
    manufacturer: 'Van Gogh Museum',
    image: vangogh,
    price: '323,000',
    pastOwners: '0',
    description: 'Museum-grade reproduction with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 3,
    name: "Lamborgini Aventador SVJ",
    manufacturer: "Lamborgini",
    image: lambo,
    price: "350,000",
    pastOwners: '0',
    description: 'A V12 Lambo with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
    {
    id: 4,
    name: "V10 F1 car",
    manufacturer: "Porsche AG",
    image: f1,
    price: "120,000",
    pastOwners: '0',
    description: 'A Formula 1 race car with info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
    },
    {
    id: 5,
    name: "Sabrina - Luxury Yacht",
    manufacturer: "Brabus",
    image: boat,
    price: "1,000,000",
    pastOwners: '0',
    description: 'A luxury yacht with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 6,
    name: "Gulf-stream 9",
    manufacturer: "Gulf Stream Jets",
    image: "https://unsplash.com/photos/xG-pV6Eu-bE/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fGx1eHVyeXxlbnwwfHx8fDE3NjIyODgwMTV8MA&force=true",
    price: "3,000,000",
    pastOwners: '0',
    description: 'A business jet with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 7,
    name: "Zion Hills Home",
    manufacturer: "Becky Real Estate",
    image: "https://unsplash.com/photos/kUdbEEMcRwE/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Nnx8bHV4dXJ5JTIwaG9tZXxlbnwwfHx8fDE3NjIzNDA3NTd8MA&force=true",
    price: "7,000,000",
    pastOwners: '0',
    description: 'A luxury home in LA with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
  {
    id: 8,
    name: "Pristine Emeralds",
    manufacturer: "Cartier",
    image: "https://plus.unsplash.com/premium_photo-1681276170610-8d9264aaccd8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
    price: "90,000",
    pastOwners: '0',
    description: 'A pair of emerald earrings with provenance info in metadata.',
    purchased: false,
    onSale: true,
    isRedeemed: false,
    owner: ""
  },
]