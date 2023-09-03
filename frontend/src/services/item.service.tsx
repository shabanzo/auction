import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { Item, ItemLite, PaginatedItems } from './interface';

const API_URL = 'http://localhost:4000/api/v1/items/';

class ItemService {
  getMine(currentPage: number): Promise<AxiosResponse<PaginatedItems>> {
    const headers = authHeader();
    return axios.get<PaginatedItems>(`${API_URL}mine?page=${currentPage + 1}`, {
      headers,
    });
  }

  getBidItems(
    currentPage: number,
    completed: boolean,
  ): Promise<AxiosResponse<PaginatedItems>> {
    const headers = authHeader();
    return axios.get(
      `${API_URL}auction?page=${currentPage + 1}&completed=${completed}`,
      { headers },
    );
  }

  create(item: ItemLite): Promise<AxiosResponse<Item>> {
    const headers = authHeader();

    return axios.post<Item>(API_URL, item, { headers });
  }

  publish(id: number): Promise<AxiosResponse<Item>> {
    const headers = authHeader();

    return axios.put<Item>(
      `${API_URL}${id}`,
      { publishedAt: new Date() },
      { headers },
    );
  }
}

export default new ItemService();
