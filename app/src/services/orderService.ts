// src/services/orderService.ts
import axios from "axios";
import { Order } from "../types";

const BASE = "/api/orders";

export const orderService = {
  async create(order: Partial<Order>): Promise<Order> {
    const { data } = await axios.post<Order>(BASE, order);
    return data;
  },
};
