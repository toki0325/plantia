export type ProductSummary = {
  id: string;
  name: string;
  price: number;
  image: string;
  freeShipping?: boolean;
  badge?: string;
  isNew?: boolean;
};

export type ProductOption = {
  label: string;
  value: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
};

export type ProductDetail = ProductSummary & {
  images: string[];
  categorySlug: string;
  subCategorySlug?: string;
  parentCategorySlug?: string;
  description: string;
  features: string[];
  sizes?: ProductOption[];
  colors?: ProductOption[];
  conditionTags?: string[];
  createdAt: string;
  reviews: ProductReview[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  parentSlug?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

export type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  paymentMethod: "credit_card" | "konbini" | "bank_transfer";
};
