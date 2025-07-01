export interface Category {
  id: string;
  name: string;
}

export interface Locality {
  id: string;
  name: string;
  category: Category;
}

export interface Shelf {
  id: string;
  name: string;
  localityId: string;
  locality?: Locality;
  categoryId: string;
  category?: Category;
}