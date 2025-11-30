import api from "../utils/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  items?: Product[];
}

const getAll = async (): Promise<Product[]> => {
  const res = await api.get<{ items: Product[] }>("/products");
  return res.data.items;
};

const getById = async (id: string): Promise<Product> => {
  const res = await api.get<Product>(`/products/${id}`);
  return res.data;
};

const create = async (data: Omit<Product, "id">): Promise<Product> => {
  const res = await api.post<Product>("/products", data);
  return res.data;
};

const update = async (id: string, data: Partial<Product>): Promise<Product> => {
  const res = await api.put<Product>(`/products/${id}`, data);
  return res.data;
};

const remove = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
