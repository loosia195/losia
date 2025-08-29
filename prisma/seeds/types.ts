// prisma/seeds/types.ts

export type SeedImage = {
  id: string;
  alt: string;
  main: string;
  thumb: string;
  features?: Array<'360' | 'tape' | 'mannequin'>;
};

export type SeedProduct = {
  sku: string;
  title: string;
  brand?: string | null;
  productTypeName: string; // ví dụ "Dress", "Casual Dress"
  conditionValue: 'excellent' | 'very good' | 'good' | 'flawed gem';
  sizeLabel: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color?: string | null;
  material?: string | null;
  style?: string | null;
  ecoImpactGroup: string;
  oldPrice: number;
  newPrice: number;
  inventory: number;
  images: SeedImage[];
  description?: string | null;
  estimatedRetailInfo?: {
    estimatedOriginalPrice: number;
    source?: string;
  } | null;
};
