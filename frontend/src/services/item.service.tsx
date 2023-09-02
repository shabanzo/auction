import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { ItemLite, PaginatedItems } from './interface';

const API_URL = 'http://localhost:3000/api/v1/items/';

class ItemService {

  async getMine(currentPage: number): Promise<PaginatedItems> {
    const headers = authHeader();
    const response: AxiosResponse<PaginatedItems> = await axios.get(`${API_URL}mine?page=${currentPage + 1}`, { headers });
    return response.data;
  }

  async getBidItems(currentPage: number): Promise<PaginatedItems> {
    const headers = authHeader();
    const response: AxiosResponse<PaginatedItems> = await axios.get(`${API_URL}auction?page=${currentPage + 1}`, { headers });
    return response.data;
  }

  async create(item: ItemLite): Promise<void> {
    const headers = authHeader();

    await axios.post(API_URL, item, { headers })
  }

  async publish(id: number): Promise<void> {
    const headers = authHeader();

    await axios.put(`${API_URL}${id}`, { publishedAt: new Date }, { headers })
  }

}

export default new ItemService();
