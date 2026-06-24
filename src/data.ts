import { Product } from './types';

export const products: Product[] = [
  // MOST WANTED SECTION
  {
    id: 'mw-1',
    name: 'Vibex Graphic Tee',
    price: 36.00,
    category: 'Tees',
    gender: 'Unisex',
    image: '/src/assets/images/vibex_tee_1782333588785.jpg',
    rating: 4.9,
    reviews: 142,
    desc: 'Heavyweight black streetwear graphic t-shirt featuring custom red, orange, and white stylized artwork of "F T T PRE - HOLD THE FUTURE". Made from 100% premium 240GSM combed cotton with a relaxed, boxy fit and durable ribbed collar.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage Black', hex: '#1a1a1a' },
      { name: 'Off-White', hex: '#f4f4f0' }
    ],
    isNew: true
  },
  {
    id: 'mw-2',
    name: 'Pattered Denim Jacket',
    price: 36.00,
    category: 'Jackets',
    gender: 'Unisex',
    image: '/src/assets/images/vibex_jacket_1782333608042.jpg',
    rating: 4.8,
    reviews: 89,
    desc: 'Stunning medium-wash indigo denim jacket featuring a custom all-over abstract blue pattern with dark charcoal overlays. Features custom heavy metal zipper, double chest pockets, and button-adjustable waist tabs.',
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Patterned Blue', hex: '#415a77' }
    ],
    isNew: true
  },
  {
    id: 'mw-3',
    name: 'Stylised Utility Pant',
    price: 23.00,
    category: 'Pants',
    gender: 'Unisex',
    image: '/src/assets/images/vibex_pants_1782333627846.jpg',
    rating: 4.7,
    reviews: 215,
    desc: 'Heavyweight black cotton twill utility pants featuring dual side cargo pockets, custom white drawstrings, and striking contrast-white triple needle stitching. Relaxed fit with adjustable ankle cuffs.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Stitch Black', hex: '#121212' },
      { name: 'Stitch Green', hex: '#2b3a2f' }
    ],
    isNew: false
  },
  {
    id: 'mw-4',
    name: 'Unique Accessory',
    price: 26.00,
    category: 'Accessories',
    gender: 'Unisex',
    image: '/src/assets/images/vibex_accessory_1782333647902.jpg',
    rating: 4.6,
    reviews: 64,
    desc: 'Durable 1000D Cordura nylon modular belt bag in matte black, finished with custom metallic details and a unique olive-green functional accessory flask secured via matte-black tactical carabiners.',
    sizes: ['One Size'],
    colors: [
      { name: 'Black/Olive', hex: '#222521' }
    ],
    isNew: true
  },

  // KIDS COLLECTION
  {
    id: 'kd-1',
    name: 'Vibes Thooliotom Flannel Hoodie',
    price: 36.00,
    category: 'Kids',
    gender: 'Kids',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews: 28,
    desc: 'Kids comfortable vintage-brown pullover hoodie with cozy waffle-lined fleece and a screenprinted Vibex graffiti-style front graphic.',
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    colors: [
      { name: 'Vintage Brown', hex: '#5c4d42' }
    ],
    isNew: true
  },
  {
    id: 'kd-2',
    name: 'Olb Racked Convention Pullover',
    price: 70.00,
    category: 'Kids',
    gender: 'Kids',
    image: 'https://images.unsplash.com/photo-1611601679655-7c8bc197f0c6?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews: 15,
    desc: 'Premium clouds-dyed pastel blue and white soft cotton pullover hoodie for kids, featuring high-build embroidery and a drop-shoulder design.',
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    colors: [
      { name: 'Cloud Dye', hex: '#a8dadc' }
    ],
    isNew: true
  },
  {
    id: 'kd-3',
    name: 'Vibes Doohfs Collection Tee',
    price: 13.00,
    category: 'Kids',
    gender: 'Kids',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    reviews: 42,
    desc: 'Minimalist kids t-shirt in vintage wash black with premium orange block logo print at center chest. Highly breathable combed cotton.',
    sizes: ['4Y', '6Y', '8Y', '10Y'],
    colors: [
      { name: 'Coal Black', hex: '#262626' }
    ],
    isNew: false
  },
  {
    id: 'kd-4',
    name: 'Elon Ket Kat Hoodie',
    price: 15.00,
    category: 'Kids',
    gender: 'Kids',
    image: 'https://images.unsplash.com/photo-1622324228944-2522e3d3eb0a?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviews: 19,
    desc: 'Heavyweight kids hoodie in solid coal charcoal, featuring ribbed wrist guards and safety reflective hood drawstring detail.',
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    colors: [
      { name: 'Charcoal', hex: '#3d3d3d' }
    ],
    isNew: false
  },

  // EXTRA ITEMS FOR RICH BROWSE DYNAMICS
  {
    id: 'ex-1',
    name: 'Urban Beat Washed Tee',
    price: 34.00,
    category: 'Tees',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviews: 43,
    desc: 'Washed-out charcoal gray cotton tee with oversized fit, vintage aesthetic, and premium heavy shoulder stitching.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Gray', hex: '#4a4a4a' }
    ],
    isNew: false
  },
  {
    id: 'ex-2',
    name: 'Retro Athletics Bomber',
    price: 85.00,
    category: 'Jackets',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews: 77,
    desc: 'Varsity baseball collar bomber jacket featuring custom embroidered letters, ribbed athletic trims, and heavy snap buttons.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Crimson Black', hex: '#1c1c1c' }
    ],
    isNew: true
  },
  {
    id: 'ex-3',
    name: 'Loose Fit Cargo Pant',
    price: 48.00,
    category: 'Pants',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    reviews: 110,
    desc: 'Relaxed loose fit canvas cargo pants in warm sand olive, with reinforced knee panels and dual flat flap cargo pockets.',
    sizes: ['30', '32', '34'],
    colors: [
      { name: 'Sand Olive', hex: '#8d99ae' }
    ],
    isNew: false
  },
  {
    id: 'ex-4',
    name: 'Vibex Tactical Chest Rig',
    price: 45.00,
    category: 'Accessories',
    gender: 'Unisex',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews: 32,
    desc: 'Streetwear tactical body chest rig with adjustable heavy webbed harness and dual front zipper storage compartments.',
    sizes: ['One Size'],
    colors: [
      { name: 'Stealth Black', hex: '#0a0a0a' }
    ],
    isNew: false
  }
];

export const staticUnisexGallery = [
  {
    id: 'gal-1',
    title: 'Hold The Future Hoodie',
    img: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=800&q=80',
    desc: 'Rooftop golden hour fit'
  },
  {
    id: 'gal-2',
    title: 'City Beats Custom Tee',
    img: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    desc: 'Distressed heavy-wash graphics'
  },
  {
    id: 'gal-3',
    title: 'Tactical Contrast Overcoat',
    img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80',
    desc: 'Unisex streetwear styling'
  },
  {
    id: 'gal-4',
    title: 'Vibex Crew On Location',
    img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    desc: 'City Beats collection vibe'
  }
];
