import axios, { AxiosResponse } from 'axios';

import { Item, ItemLite, PaginatedItems } from './interface';

const API_URL = 'http://localhost:4000/api/v1/items/';

class ItemService {
  getMine(currentPage: number): Promise<AxiosResponse<PaginatedItems>> {
    return axios.get<PaginatedItems>(`${API_URL}mine?page=${currentPage + 1}`, {
      withCredentials: true,
    });
  }

  getBidItems(
    currentPage: number,
    completed: boolean,
  ): Promise<AxiosResponse<PaginatedItems>> {
    return axios.get(
      `${API_URL}auction?page=${currentPage + 1}&completed=${completed}`,
      { withCredentials: true },
    );
  }

  create(item: ItemLite): Promise<AxiosResponse<Item>> {
    return axios.post<Item>(API_URL, item);
  }

  publish(id: number): Promise<AxiosResponse<Item>> {
    return axios.post<Item>(
      `${API_URL}${id}/publish`,
      { publishedAt: new Date() },
      { withCredentials: true },
    );
  }
}

export default new ItemService();
