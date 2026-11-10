import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VOLTEDGE Electronics database seed...');

  // Clean existing data
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.newsletterSubscription.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Seed Categories
  const categoriesData = [
    {
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High-performance workstations, ultrabooks, and desktop powerhouses.',
      icon: 'Laptop',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 1,
    },
    {
      name: 'Smartphones & Tablets',
      slug: 'smartphones-tablets',
      description: 'Cutting-edge flagship mobile devices with pro cameras and OLED screens.',
      icon: 'Smartphone',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 2,
    },
    {
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      description: 'Audiophile-grade studio headphones, wireless earbuds, and soundbars.',
      icon: 'Headphones',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 3,
    },
    {
      name: 'Smartwatches & Wearables',
      slug: 'smartwatches-wearables',
      description: 'Advanced fitness trackers, health monitors, and luxury smart chronographs.',
      icon: 'Watch',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 4,
    },
    {
      name: 'Gaming & Consoles',
      slug: 'gaming-consoles',
      description: 'Next-gen gaming rigs, responsive mechanical keyboards, and displays.',
      icon: 'Gamepad2',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 5,
    },
    {
      name: 'Smart Home & Living',
      slug: 'smart-home',
      description: 'Intelligent automation, smart lighting, security systems, and assistants.',
      icon: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 6,
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created;
  }
  console.log(`✅ Seeded ${categoriesData.length} categories.`);

  // 2. Seed Brands
  const brandsData = [
    {
      name: 'Apple',
      slug: 'apple',
      logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
      description: 'Pioneering design and seamless ecosystem integration.',
      featured: true,
    },
    {
      name: 'Sony',
      slug: 'sony',
      logoUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80',
      description: 'Master of high-fidelity sound, sensory cameras, and gaming.',
      featured: true,
    },
    {
      name: 'Samsung',
      slug: 'samsung',
      logoUrl: 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?auto=format&fit=crop&w=200&q=80',
      description: 'Industry-leading Dynamic AMOLED displays and mobile hardware.',
      featured: true,
    },
    {
      name: 'Dell Technologies',
      slug: 'dell',
      logoUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80',
      description: 'Engineered performance for creators, architects, and power users.',
      featured: true,
    },
    {
      name: 'ASUS ROG',
      slug: 'asus-rog',
      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80',
      description: 'Republic of Gamers – elite gaming hardware pushed to the edge.',
      featured: true,
    },
    {
      name: 'Bose',
      slug: 'bose',
      logoUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=200&q=80',
      description: 'Legendary acoustic noise cancellation and spatial sound.',
      featured: true,
    },
    {
      name: 'Logitech G',
      slug: 'logitech-g',
      logoUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80',
      description: 'Precision mechanical keyboards, Lightspeed mice, and pro gear.',
      featured: true,
    },
    {
      name: 'Keychron',
      slug: 'keychron',
      logoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80',
      description: 'Custom mechanical keyboards for enthusiasts and professionals.',
      featured: true,
    },
  ];

  const createdBrands: Record<string, any> = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    createdBrands[b.slug] = created;
  }
  console.log(`✅ Seeded ${brandsData.length} brands.`);

  // 3. Seed Products
  const productsData = [
    // Laptops
    {
      name: 'MacBook Pro 16" M3 Max Liquid Retina XDR',
      slug: 'macbook-pro-16-m3-max',
      sku: 'APL-MBP16-M3M-01',
      brandSlug: 'apple',
      categorySlug: 'laptops-computers',
      description: 'Built for extreme workflows with a 16-core CPU, 40-core GPU, up to 128GB unified memory, and a dazzling 1600 nits peak brightness Liquid Retina XDR display.',
      shortDescription: '16.2" Liquid Retina XDR, M3 Max 16-Core, 36GB RAM, 1TB SSD',
      sellingPrice: 3499.00,
      originalPrice: 3899.00,
      discountPercentage: 10,
      rating: 4.9,
      reviewCount: 142,
      stockStatus: 'IN_STOCK',
      stockQuantity: 18,
      primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'laptop, apple, m3, pro, creator, bestseller',
      specifications: JSON.stringify({
        Processor: 'Apple M3 Max (16-core CPU, 40-core GPU)',
        Display: '16.2-inch Liquid Retina XDR (3456 x 2234), 120Hz ProMotion',
        Memory: '36GB Unified Memory',
        Storage: '1TB Ultra-Fast NVMe SSD',
        Battery: 'Up to 22 hours battery life',
        Weight: '2.14 kg',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: false,
    },
    {
      name: 'Dell XPS 15 9530 InfinityEdge OLED',
      slug: 'dell-xps-15-oled',
      sku: 'DEL-XPS15-9530-02',
      brandSlug: 'dell',
      categorySlug: 'laptops-computers',
      description: 'Stunning 3.5K OLED touch display encased in CNC machined aluminum with carbon fiber palm rests. Powered by 13th Gen Intel Core i9 and NVIDIA GeForce RTX 4070.',
      shortDescription: '15.6" 3.5K OLED Touch, Intel i9-13900H, RTX 4070, 32GB RAM, 1TB SSD',
      sellingPrice: 2249.00,
      originalPrice: 2599.00,
      discountPercentage: 13,
      rating: 4.8,
      reviewCount: 98,
      stockStatus: 'IN_STOCK',
      stockQuantity: 12,
      primaryImage: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'laptop, dell, xps, oled, intel, rtx4070',
      specifications: JSON.stringify({
        Processor: 'Intel Core i9-13900H (14 cores, up to 5.4 GHz)',
        Graphics: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
        Display: '15.6" 3.5K (3456 x 2160) OLED Touchscreen',
        Memory: '32GB DDR5 4800MHz',
        Storage: '1TB PCIe 4.0 NVMe SSD',
      }),
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: true,
    },
    {
      name: 'ASUS ROG Zephyrus G16 Gaming Laptop',
      slug: 'asus-rog-zephyrus-g16',
      sku: 'ASU-ROG-G16-03',
      brandSlug: 'asus-rog',
      categorySlug: 'gaming-consoles',
      description: 'Precision CNC aluminum chassis with Slash Lighting array. 240Hz ROG Nebula OLED display paired with Intel Core Ultra 9 and NVIDIA RTX 4080.',
      shortDescription: '16" 240Hz OLED, Intel Core Ultra 9, RTX 4080, 32GB LPDDR5X',
      sellingPrice: 2699.00,
      originalPrice: 2999.00,
      discountPercentage: 10,
      rating: 4.9,
      reviewCount: 74,
      stockStatus: 'IN_STOCK',
      stockQuantity: 8,
      primaryImage: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'gaming, laptop, rog, rtx4080, oled, featured',
      specifications: JSON.stringify({
        Processor: 'Intel Core Ultra 9 185H',
        Graphics: 'NVIDIA GeForce RTX 4080 12GB',
        Display: '16" 2.5K (2560x1600) 240Hz OLED 0.2ms',
        Memory: '32GB LPDDR5X 7467MHz',
        Cooling: 'ROG Intelligent Cooling with Vapor Chamber',
      }),
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: false,
    },

    // Audio & Headphones
    {
      name: 'Sony WH-1000XM5 Noise-Canceling Headphones',
      slug: 'sony-wh-1000xm5',
      sku: 'SNY-WH1000XM5-04',
      brandSlug: 'sony',
      categorySlug: 'audio-headphones',
      description: 'Industry-leading noise cancellation powered by two processors and 8 microphones. Hi-Res Audio wireless support with LDAC and 30-hour battery life.',
      shortDescription: 'Wireless Industry-Leading Noise Cancelling with Auto NC Optimizer',
      sellingPrice: 348.00,
      originalPrice: 399.00,
      discountPercentage: 13,
      rating: 4.8,
      reviewCount: 312,
      stockStatus: 'IN_STOCK',
      stockQuantity: 35,
      primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'audio, headphones, sony, anc, wireless, bestseller',
      specifications: JSON.stringify({
        Driver: '30mm carbon fiber composite dome',
        Battery: '30 hours with ANC on (40 hours ANC off)',
        Charging: '3 min quick charge for 3 hours playback',
        Connectivity: 'Bluetooth 5.2, Multipoint, 3.5mm jack',
        Weight: '250 grams',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: true,
    },
    {
      name: 'Bose QuietComfort Ultra Wireless Headphones',
      slug: 'bose-quietcomfort-ultra',
      sku: 'BOS-QCU-05',
      brandSlug: 'bose',
      categorySlug: 'audio-headphones',
      description: 'Breakthrough spatial audio with Bose Immersive Audio technology, custom sound calibration via CustomTune, and world-class quiet mode.',
      shortDescription: 'Bose Immersive Spatial Audio with World-Class Active Noise Cancellation',
      sellingPrice: 379.00,
      originalPrice: 429.00,
      discountPercentage: 12,
      rating: 4.7,
      reviewCount: 189,
      stockStatus: 'IN_STOCK',
      stockQuantity: 22,
      primaryImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'audio, bose, anc, spatial, headphones',
      specifications: JSON.stringify({
        AudioTech: 'Bose Immersive Audio with Spatial Rendering',
        NoiseCancelling: 'Active CustomTune ANC & Aware Mode',
        Battery: 'Up to 24 hours (18 hours with Immersive Audio)',
        Microphones: '12-microphone beamforming array',
      }),
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: true,
    },
    {
      name: 'Apple AirPods Pro 2nd Gen USB-C',
      slug: 'apple-airpods-pro-2-usb-c',
      sku: 'APL-APP2-USBC-06',
      brandSlug: 'apple',
      categorySlug: 'audio-headphones',
      description: 'Re-engineered with the H2 chip. Up to 2x more active noise cancellation, Adaptive Audio that tailors sound control to your environment, and MagSafe USB-C case.',
      shortDescription: 'Active Noise Cancellation, Adaptive Audio, Transparancy Mode, USB-C',
      sellingPrice: 199.00,
      originalPrice: 249.00,
      discountPercentage: 20,
      rating: 4.9,
      reviewCount: 520,
      stockStatus: 'IN_STOCK',
      stockQuantity: 45,
      primaryImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'apple, earbuds, airpods, anc, audio, bestseller',
      specifications: JSON.stringify({
        Chip: 'Apple H2 headphone chip, Apple U1 chip in case',
        NoiseCancelling: 'Active Noise Cancellation, Adaptive Audio',
        Battery: 'Up to 6 hours listening (30 hours total with case)',
        Resistance: 'Dust, sweat, and water resistant (IP54)',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: true,
    },

    // Smartphones & Tablets
    {
      name: 'Samsung Galaxy S24 Ultra 5G AI Flagship',
      slug: 'samsung-galaxy-s24-ultra',
      sku: 'SAM-S24U-512-07',
      brandSlug: 'samsung',
      categorySlug: 'smartphones-tablets',
      description: 'Titanium exterior with Galaxy AI live translation and note assist. Flat 6.8" Dynamic AMOLED 2X 120Hz display with integrated S-Pen and 200MP Quad Tele camera.',
      shortDescription: '6.8" 120Hz AMOLED, Snapdragon 8 Gen 3, Galaxy AI, 200MP Pro Camera',
      sellingPrice: 1199.00,
      originalPrice: 1419.00,
      discountPercentage: 15,
      rating: 4.8,
      reviewCount: 245,
      stockStatus: 'IN_STOCK',
      stockQuantity: 20,
      primaryImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'samsung, galaxy, s24, ai, flagship, 5g, phone',
      specifications: JSON.stringify({
        Display: '6.8" Quad HD+ Dynamic AMOLED 2X, 1-120Hz, 2600 nits',
        Processor: 'Snapdragon 8 Gen 3 for Galaxy',
        Camera: '200MP Wide + 50MP Periscope + 12MP Ultra-Wide + 10MP Telephoto',
        Battery: '5000 mAh with 45W Fast Charging',
        Body: 'Titanium Frame with Corning Gorilla Armor',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: true,
      isSpecialOffer: false,
    },
    {
      name: 'Apple iPhone 15 Pro Max Titanium',
      slug: 'apple-iphone-15-pro-max',
      sku: 'APL-IP15PM-256-08',
      brandSlug: 'apple',
      categorySlug: 'smartphones-tablets',
      description: 'Forged in titanium with industry-leading A17 Pro 3nm chip. 5x optical zoom telephoto camera, customizable Action button, and Super Retina XDR with Dynamic Island.',
      shortDescription: '6.7" Super Retina XDR, A17 Pro, 48MP Camera with 5x Telephoto, 256GB',
      sellingPrice: 1149.00,
      originalPrice: 1299.00,
      discountPercentage: 11,
      rating: 4.9,
      reviewCount: 410,
      stockStatus: 'IN_STOCK',
      stockQuantity: 15,
      primaryImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'apple, iphone, 15promax, titanium, flagship, phone, bestseller',
      specifications: JSON.stringify({
        Chip: 'A17 Pro chip with 6-core GPU and hardware ray tracing',
        Display: '6.7-inch Super Retina XDR with ProMotion 120Hz',
        Camera: 'Pro camera system (48MP Main, 12MP Ultra Wide, 12MP 5x Telephoto)',
        Connector: 'USB-C supporting USB 3 up to 10Gb/s',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: false,
    },
    {
      name: 'Apple iPad Pro 13" M4 Ultra Retina Tandem OLED',
      slug: 'apple-ipad-pro-13-m4',
      sku: 'APL-IPD13-M4-09',
      brandSlug: 'apple',
      categorySlug: 'smartphones-tablets',
      description: 'Impossibly thin at 5.1mm with the groundbreaking Ultra Retina XDR display powered by Tandem OLED technology and blazing fast M4 silicon.',
      shortDescription: '13" Tandem OLED XDR 120Hz, Apple M4 Chip, 256GB Wi-Fi',
      sellingPrice: 1249.00,
      originalPrice: 1399.00,
      discountPercentage: 11,
      rating: 4.9,
      reviewCount: 88,
      stockStatus: 'IN_STOCK',
      stockQuantity: 14,
      primaryImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'apple, ipad, m4, oled, tablet, creative, latest',
      specifications: JSON.stringify({
        Chip: 'Apple M4 chip (9-core CPU, 10-core GPU, 16-core Neural Engine)',
        Display: '13-inch Ultra Retina XDR Tandem OLED, 1000 nits full screen',
        Thickness: '5.1 mm thin profile',
        Support: 'Apple Pencil Pro and Magic Keyboard',
      }),
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: false,
    },

    // Smartwatches & Wearables
    {
      name: 'Apple Watch Ultra 2 GPS + Cellular Titanium',
      slug: 'apple-watch-ultra-2',
      sku: 'APL-AWU2-49-10',
      brandSlug: 'apple',
      categorySlug: 'smartwatches-wearables',
      description: 'The ultimate sports and adventure watch. 49mm corrosion-resistant titanium case, precision dual-frequency GPS, 3000-nit display, and up to 72 hours of battery in Low Power Mode.',
      shortDescription: '49mm Titanium, 3000 Nits Display, Precision Dual-GPS, 100m Water Resistance',
      sellingPrice: 749.00,
      originalPrice: 799.00,
      discountPercentage: 6,
      rating: 4.9,
      reviewCount: 167,
      stockStatus: 'IN_STOCK',
      stockQuantity: 16,
      primaryImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'smartwatch, apple, watch, ultra, titanium, fitness',
      specifications: JSON.stringify({
        Case: '49mm Aerospace-grade Titanium',
        Display: 'Always-On Retina display, 3000 nits peak',
        WaterResistance: '100m water resistance, EN13319 dive computer rated',
        Sensors: 'ECG, Blood Oxygen, Temperature sensing, Depth gauge',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: false,
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic LTE 47mm',
      slug: 'samsung-galaxy-watch-6-classic',
      sku: 'SAM-GW6C-47-11',
      brandSlug: 'samsung',
      categorySlug: 'smartwatches-wearables',
      description: 'Refined rotating physical bezel with a 20% larger Sapphire Crystal AMOLED display. Advanced sleep coaching, body composition analysis, and ECG tracking.',
      shortDescription: '47mm Rotating Bezel, Sapphire Crystal AMOLED, BIA Body Composition',
      sellingPrice: 329.00,
      originalPrice: 429.00,
      discountPercentage: 23,
      rating: 4.7,
      reviewCount: 114,
      stockStatus: 'IN_STOCK',
      stockQuantity: 24,
      primaryImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'smartwatch, samsung, galaxywatch, rotatingbezel, specialoffer',
      specifications: JSON.stringify({
        Bezel: 'Stainless steel physical rotating bezel',
        Glass: 'Sapphire Crystal Glass',
        Battery: '425 mAh with WPC wireless charging',
        OS: 'Wear OS Powered by Samsung',
      }),
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: false,
      isSpecialOffer: true,
    },

    // Gaming & Peripherals
    {
      name: 'Sony PlayStation 5 Slim Console Digital Edition',
      slug: 'sony-playstation-5-slim',
      sku: 'SNY-PS5-SLIM-12',
      brandSlug: 'sony',
      categorySlug: 'gaming-consoles',
      description: 'Experience lightning fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
      shortDescription: '1TB Custom SSD, 4K 120Hz Gaming, Ray Tracing, Tempest 3D AudioTech',
      sellingPrice: 449.00,
      originalPrice: 499.00,
      discountPercentage: 10,
      rating: 4.9,
      reviewCount: 680,
      stockStatus: 'LOW_STOCK',
      stockQuantity: 4,
      primaryImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'gaming, console, sony, ps5, 4k, bestseller',
      specifications: JSON.stringify({
        Storage: '1TB Ultra-High Speed NVMe SSD',
        Output: '4K 120Hz, 8K support, HDR technology',
        Audio: 'Tempest 3D AudioTech',
        Controller: 'DualSense Wireless Controller with Haptic Feedback',
      }),
      isFeatured: true,
      isBestSeller: true,
      isLatestArrival: true,
      isSpecialOffer: false,
    },
    {
      name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
      slug: 'logitech-g-pro-x-superlight-2',
      sku: 'LOG-GPX2-BLK-13',
      brandSlug: 'logitech-g',
      categorySlug: 'gaming-consoles',
      description: 'Iconic 60-gram esports gaming mouse with LIGHTFORCE hybrid optical-mechanical switches, HERO 2 sensor with 32,000 DPI, and true 2000Hz polling rate.',
      shortDescription: '60g Ultra-Lightweight, HERO 2 32K DPI Sensor, LIGHTFORCE Switches',
      sellingPrice: 149.00,
      originalPrice: 169.00,
      discountPercentage: 12,
      rating: 4.8,
      reviewCount: 195,
      stockStatus: 'IN_STOCK',
      stockQuantity: 28,
      primaryImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'gaming, mouse, logitech, wireless, esports',
      specifications: JSON.stringify({
        Weight: '60 grams',
        Sensor: 'HERO 2 (100 - 32,000 DPI, >500 IPS, 40G)',
        Switches: 'LIGHTFORCE Hybrid Optical-Mechanical',
        Battery: 'Up to 95 hours constant motion',
      }),
      isFeatured: false,
      isBestSeller: true,
      isLatestArrival: false,
      isSpecialOffer: false,
    },
    {
      name: 'Keychron Q1 Pro Custom Wireless Mechanical Keyboard',
      slug: 'keychron-q1-pro-wireless',
      sku: 'KCH-Q1PRO-GATERON-14',
      brandSlug: 'keychron',
      categorySlug: 'gaming-consoles',
      description: 'Full CNC aluminum body 75% layout custom wireless mechanical keyboard with double-gasket mount design, hot-swappable sockets, and programmable rotary knob.',
      shortDescription: '75% Layout, Full CNC Machined Aluminum, QMK/VIA Programmable, Bluetooth 5.1',
      sellingPrice: 189.00,
      originalPrice: 219.00,
      discountPercentage: 14,
      rating: 4.9,
      reviewCount: 132,
      stockStatus: 'IN_STOCK',
      stockQuantity: 19,
      primaryImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'keyboard, keychron, mechanical, wireless, typing, custom',
      specifications: JSON.stringify({
        Structure: 'Double-Gasket Mount Design',
        Body: 'Full CNC 6063 Aluminum Frame',
        Switches: 'K Pro Red (Linear Hot-Swappable)',
        Keycaps: 'KSA Double-Shot PBT Keycaps',
        Connectivity: 'Bluetooth 5.1 & Type-C Wired',
      }),
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: true,
    },

    // Smart Home & Living
    {
      name: 'Sony Bravia XR 65" Class OLED 4K HDR Google TV',
      slug: 'sony-bravia-xr-65-oled',
      sku: 'SNY-XR65-A80L-15',
      brandSlug: 'sony',
      categorySlug: 'smart-home',
      description: 'Cognitive Processor XR delivers pure OLED blacks and lifelike brightness. Acoustic Surface Audio+ turns the entire screen into an immersive multi-channel speaker.',
      shortDescription: '65" 4K OLED, 120Hz Cognitive Processor XR, Acoustic Surface Audio+',
      sellingPrice: 1798.00,
      originalPrice: 2199.00,
      discountPercentage: 18,
      rating: 4.9,
      reviewCount: 92,
      stockStatus: 'IN_STOCK',
      stockQuantity: 7,
      primaryImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'tv, oled, sony, 4k, home-theater, specialoffer',
      specifications: JSON.stringify({
        Display: '65" 4K (3840 x 2160) OLED 120Hz VRR/ALLM',
        Processor: 'Cognitive Processor XR',
        Audio: 'Acoustic Surface Audio+ (32W Output)',
        SmartTV: 'Google TV with hands-free Google Assistant & AirPlay 2',
      }),
      isFeatured: true,
      isBestSeller: false,
      isLatestArrival: false,
      isSpecialOffer: true,
    },
    {
      name: 'Samsung The Frame 55" QLED 4K Smart Art TV',
      slug: 'samsung-the-frame-55-qled',
      sku: 'SAM-FRAME-55-16',
      brandSlug: 'samsung',
      categorySlug: 'smart-home',
      description: 'Transform your living space into a gallery. Anti-reflective Matte Display with 100% Color Volume with Quantum Dot and customizable bezel frame.',
      shortDescription: '55" Matte Display QLED 4K, Art Mode, Slim Fit Wall Mount included',
      sellingPrice: 1297.00,
      originalPrice: 1499.00,
      discountPercentage: 13,
      rating: 4.7,
      reviewCount: 165,
      stockStatus: 'IN_STOCK',
      stockQuantity: 11,
      primaryImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      ]),
      tags: 'tv, samsung, theframe, art, smarthome, qled',
      specifications: JSON.stringify({
        Display: '55" QLED 4K with Matte Anti-Glare Finish',
        ArtStore: 'Access to 2000+ works of museum art',
        Mount: 'Included Slim-Fit Wall Mount',
        Sound: 'Object Tracking Sound with Q-Symphony',
      }),
      isFeatured: false,
      isBestSeller: false,
      isLatestArrival: true,
      isSpecialOffer: false,
    },
  ];

  for (const prod of productsData) {
    const brand = createdBrands[prod.brandSlug];
    const category = createdCategories[prod.categorySlug];

    if (!brand || !category) {
      console.warn(`Skipping ${prod.name}: brand or category missing.`);
      continue;
    }

    const { brandSlug, categorySlug, ...rest } = prod;
    await prisma.product.create({
      data: {
        ...rest,
        brandId: brand.id,
        categoryId: category.id,
      },
    });
  }
  console.log(`✅ Seeded ${productsData.length} products.`);

  // 4. Seed Banners
  const bannersData = [
    {
      title: 'Powering Your Digital World.',
      subtitle: 'Experience the cutting-edge in consumer electronics, premium computing, and immersive acoustics at the VOLTEDGE flagship showroom.',
      badge: 'NEW GENERATION 2026',
      ctaText: 'Explore Showroom Catalog',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
      bgGradient: 'from-slate-950/90 via-slate-900/80 to-transparent',
      active: true,
      displayOrder: 1,
    },
    {
      title: 'Acoustic Precision: Up to 35% Off Hi-Fi Audio',
      subtitle: 'Immerse yourself in studio master sound with flagship wireless noise-cancelling headphones from Sony, Bose, and Apple.',
      badge: 'LIMITED TIME DEAL',
      ctaText: 'View Special Offers',
      ctaLink: '/shop?specialOffer=true',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
      bgGradient: 'from-blue-950/90 via-slate-900/80 to-transparent',
      active: true,
      displayOrder: 2,
    },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log(`✅ Seeded ${bannersData.length} banners.`);

  // 5. Seed Testimonials
  const testimonialsData = [
    {
      name: 'Alexander Mitchell',
      role: 'Creative Director & Tech Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'VOLTEDGE has completely redefined tech retail. The showroom experience and curated selection of laptops and studio monitors is genuinely unmatched. Flawless next-day delivery.',
      verifiedPurchase: true,
    },
    {
      name: 'Elena Rostova',
      role: 'Software Architect',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'Ordered my M3 Max MacBook Pro through VOLTEDGE. Transparent pricing, authentic manufacturer warranty, and ultra-responsive customer support. My go-to electronics platform.',
      verifiedPurchase: true,
    },
    {
      name: 'Marcus Chen',
      role: 'Competitive Esports Player',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: 'The gaming gear department is top tier. Picked up the ROG Zephyrus G16 and Keychron mechanical keyboard. Every detail is dialed in. Highly recommended!',
      verifiedPurchase: true,
    },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ Seeded ${testimonialsData.length} testimonials.`);

  console.log('🎉 VOLTEDGE Electronics database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
