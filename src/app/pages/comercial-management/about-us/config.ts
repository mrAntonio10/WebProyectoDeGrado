export interface ISocialContactLink {
  id: string;
  label: string;
  sublabel: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp';
  cityTag: string;
  url: string;
  color: string;
  bgGradient: string;
}

export const REKIDS_SOCIAL_LINKS: ISocialContactLink[] = [
  {
    id: 'fb-oficial',
    label: 'Facebook',
    sublabel: 'RE KIDS Oficial',
    platform: 'facebook',
    cityTag: 'Bolivia',
    url: 'https://www.facebook.com/share/14wUNGDWkXu/?mibextid=wwXIfr',
    color: '#1877F2',
    bgGradient: 'linear-gradient(135deg, #1877F2 0%, #0C5DC7 100%)'
  },
  {
    id: 'ig-bolivia',
    label: 'Instagram Oficial Bolivia',
    sublabel: '@rekids_bo',
    platform: 'instagram',
    cityTag: 'Bolivia',
    url: 'https://www.instagram.com/rekids_bo?jplx=MXBndnE3N2M4MDJ0Ng==',
    color: '#E1306C',
    bgGradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)'
  },
  {
    id: 'ig-lapaz',
    label: 'Instagram La Paz',
    sublabel: '@rekids.la.paz_bo',
    platform: 'instagram',
    cityTag: 'La Paz',
    url: 'https://www.instagram.com/rekids.la.paz_bo?fqnt=MWJndTQ4cnBzNWR6NQ==',
    color: '#C13584',
    bgGradient: 'linear-gradient(135deg, #E1306C 0%, #C13584 55%, #F56040 100%)'
  },
  {
    id: 'tt-oficial',
    label: 'TikTok Oficial',
    sublabel: '@rekidsbolivia',
    platform: 'tiktok',
    cityTag: 'Bolivia',
    url: 'https://www.tiktok.com/@rekidsbolivia?_r=1&_t=ZS-9Beak4SUnQq',
    color: '#111827',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 65%, #fe2c55 100%)'
  },
  {
    id: 'tt-lapaz',
    label: 'TikTok La Paz',
    sublabel: '@rekids.lapaz',
    platform: 'tiktok',
    cityTag: 'La Paz',
    url: 'https://www.tiktok.com/@rekids.lapaz?_r=1&_t=ZS-9BeazG5sh2D',
    color: '#111827',
    bgGradient: 'linear-gradient(135deg, #111827 0%, #0f172a 65%, #25f4ee 100%)'
  },
  {
    id: 'wa-scz',
    label: 'Sucursal Santa Cruz',
    sublabel: 'WhatsApp Santa Cruz',
    platform: 'whatsapp',
    cityTag: 'Santa Cruz',
    url: 'https://wa.me/message/2UHXR66ZCHJBE1',
    color: '#25D366',
    bgGradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
  },
  {
    id: 'wa-lpz',
    label: 'Sucursal La Paz',
    sublabel: 'WhatsApp La Paz',
    platform: 'whatsapp',
    cityTag: 'La Paz',
    url: 'https://wa.me/message/4KLDW2VLWSJCE1',
    color: '#128C7E',
    bgGradient: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)'
  }
];

export const REKIDS_LANDING_CONFIG = {
  brandName: 'RE KIDS',
  slogan: 'EL SEGUNDO ESTRENO',
  representative: 'Camila Aguirre',
  storyParagraphs: [
    'Re Kids nace de una idea emprendedora y sutil, en la residencia de la representante legal Camila Aguirre, ella observa que contaban con una cantidad considerable de prendas de sus hermanos guardadas, algunas prendas se estaban deteriorando por el tiempo de guardado. Pero esto no termina ahí, Camila también observa que no solo su familia realizaba esas acciones, sino que otras familias también la realizan, de esa manera surge la idea de abrir una tienda de “Ropa Circular”.',
    'La tienda se encarga de seleccionar todos los artículos y productos que se encuentren en buen estado, como ser; prendas, calzados, juguetes y muebles como cunas. Exponiendo los productos de manera ordenada, en un ambiente agradable y cómodo para toda la familia.',
    'Re kids es una marca que está en crecimiento, actualmente cuenta con dos sucursales en Santa Cruz de la Sierra y una en La Paz, teniendo ideas planificadas para llegar a todas las áreas pobladas de Bolivia y próximamente extenderse en partes de América Latina.'
  ],
  mission:
    'Brindar a las familias una alternativa accesible, sostenible y confiable para vestir a sus hijos, promoviendo la reutilización responsable de prendas infantiles y generando oportunidades de ingreso para madres mediante un modelo de economía circular.',
  vision:
    'Convertirnos en la marca líder de economía circular infantil en Bolivia y Latinoamérica, impactando positivamente en las familias, la economía de las madres y el cuidado del medio ambiente a través del consumo consciente.',
  categories: [
    {
      title: 'Prendas Infantiles',
      description: 'Ropa seleccionada en excelente estado para bebés, niños y niñas en todas las etapas.',
      icon: 'pi pi-heart-fill',
      color: '#E30613',
      bg: '#FFE4E6'
    },
    {
      title: 'Calzados',
      description: 'Zapatos, zapatillas y botines infantiles cómodos, limpios y listos para un segundo estreno.',
      icon: 'pi pi-star-fill',
      color: '#009FE3',
      bg: '#E0F2FE'
    },
    {
      title: 'Juguetes',
      description: 'Juguetes seguros, didácticos y verificados para seguir llevando alegría a más hogares.',
      icon: 'pi pi-gift',
      color: '#F39200',
      bg: '#FEF3C7'
    },
    {
      title: 'Muebles y Cunas',
      description: 'Cunas, cochecitos y mobiliario infantil expuesto de manera ordenada en un ambiente familiar.',
      icon: 'pi pi-home',
      color: '#76B82A',
      bg: '#ECFCCB'
    }
  ],
  branches: [
    {
      city: 'Santa Cruz de la Sierra',
      countLabel: '2 Sucursales Activas',
      description: 'Ambientes cómodos, ordenados y agradables para toda la familia cruceña.',
      whatsappLabel: 'Sucursal Santa Cruz',
      whatsappUrl: 'https://wa.me/message/2UHXR66ZCHJBE1',
      instagramUrl: 'https://www.instagram.com/rekids_bo?jplx=MXBndnE3N2M4MDJ0Ng==',
      color: '#F39200',
      regionCode: 'SANTA_CRUZ'
    },
    {
      city: 'Nuestra Señora de La Paz',
      countLabel: '1 Sucursal Activa',
      description: 'Ropa circular infantil seleccionada con amor para las familias paceñas.',
      whatsappLabel: 'Sucursal La Paz',
      whatsappUrl: 'https://wa.me/message/4KLDW2VLWSJCE1',
      instagramUrl: 'https://www.instagram.com/rekids.la.paz_bo?fqnt=MWJndTQ4cnBzNWR6NQ==',
      color: '#009FE3',
      regionCode: 'LA_PAZ'
    }
  ]
};
