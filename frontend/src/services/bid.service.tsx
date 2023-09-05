import axios, { AxiosResponse } from 'axios';

import { Bid } from './interface';

const API_URL = 'http://localhost:4000/api/v1/bids/';

class BidService {
  bid(itemId: number, amount: string): Promise<AxiosResponse<Bid>> {

    return axios.post<Bid>(
      API_URL,
      {
        itemId,
        amount,
      },
      { withCredentials: true },
    );
  }
}

export default new BidService();
