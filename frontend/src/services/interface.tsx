export interface User {
  email: string;
  walletBalance: number;
  token: string;
  message?: string;
}

export interface ItemLite {
  name: string;
  startingPrice: number;
  timeWindowHours: number;
}
export interface Item extends ItemLite {
  id: number;
  currentPrice: number;
  publishedAt: string;
}
export interface BidItem {
  id: number;
  name: string;
  currentPrice: number;
  timeWindowHours: number;
  publishedAt: Date;
}

export interface PaginatedItems {
  totalPages: number;
  limit: number;
  page: number;
  items: Item[];
}
export interface PaginatedBidItems {
  totalPages: number;
  limit: number;
  page: number;
  items: BidItem[];
}
