import axios from "@/lib/axiosInstance";

export interface Category {
  id: string;
  name: string;
}

export interface Shelf {
  id: string;
  name: string;
  category: Category;
  localityId: string;
}

export interface Locality {
  id: string;
  name: string;
  shelves?: Shelf[];
}

// Localities
export const getLocalities = async (): Promise<Locality[]> => {
  const res = await axios.get("/localities", { withCredentials: true });
  return res.data;
};

export const createLocality = async (locality: {
  name: string;
}): Promise<Locality> => {
  const res = await axios.post("/localities", locality, {
    withCredentials: true,
  });
  return res.data;
};

export const updateLocality = async (
  id: string,
  locality: { name: string }
): Promise<Locality> => {
  const res = await axios.patch(`/localities/${id}`, locality, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteLocality = async (id: string): Promise<null> => {
  const res = await axios.delete(`/localities/${id}`, {
    withCredentials: true,
  });
  return res.status === 204 ? null : res.data;
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get("/categories", { withCredentials: true });
  return res.data;
};

// Shelves
export const getShelves = async (search?: string): Promise<Shelf[]> => {
  const res = await axios.get("/shelves", {
    params: search ? { search } : {},
    withCredentials: true,
  });
  return res.data;
};

export const createShelf = async (shelf: {
  name: string;
  localityId: string;
  categoryId: string;
}): Promise<Shelf> => {
  const res = await axios.post("/shelves", shelf, { withCredentials: true });
  return res.data;
};

export const updateShelf = async (
  id: string,
  shelf: { name: string; localityId: string; categoryId: string }
): Promise<Shelf> => {
  const res = await axios.patch(`/shelves/${id}`, shelf, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteShelf = async (id: string): Promise<null> => {
  const res = await axios.delete(`/shelves/${id}`, { withCredentials: true });
  return res.status === 204 ? null : res.data;
};

export const getShelvesByLocality = async (
  localityId: string
): Promise<Shelf[]> => {
  const res = await axios.get(`/shelves/by-locality/${localityId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getShelvesByCategory = async (
  categoryId: string
): Promise<Shelf[]> => {
  const res = await axios.get(`/shelves/by-category/${categoryId}`, {
    withCredentials: true,
  });
  return res.data;
};
