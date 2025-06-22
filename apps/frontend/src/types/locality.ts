export interface Category {
  id: string;
  name: string;
}

export interface Locality {
  id: string;
  name: string;
  category: Category;
}
