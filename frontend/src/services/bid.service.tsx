import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { Bid } from './interface';

const API_URL = 'http://localhost:3000/api/v1/bids/';

class BidService {
  bid(itemId: number, amount: string): Promise<AxiosResponse<Bid>> {
    const headers = authHeader();

    return axios.post<Bid>(
      API_URL,
      {
        itemId,
        amount,
      },
      { headers },
    );
  }
}

export default new BidService();
