import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { User } from './interface';

const API_URL = 'http://localhost:3000/api/v1/user/';

interface authParams {
  email: string;
  password: string;
}
class UserService {
  signin(authParams: authParams): Promise<AxiosResponse<User>> {
    return axios.post<User>(API_URL + 'signin', authParams).then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response;
    });
  }

  signout(): void {
    localStorage.removeItem('user');
  }

  signup(authParams: authParams): Promise<AxiosResponse<User>> {
    return axios.post<User>(API_URL + 'signup', authParams);
  }

  getCurrentUser(): User | null {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  deposit(amount: number): Promise<AxiosResponse<User>> {
    const headers = authHeader();

    return axios
      .post<User>(API_URL + 'deposit', { amount }, { headers })
      .then((response) => {
        if (response.status === 200) {
          const user = this.getCurrentUser();
          if (user && response.data.walletBalance !== undefined) {
            user.walletBalance = response.data.walletBalance;
            localStorage.setItem('user', JSON.stringify(user));
          }

          return response;
        } else {
          return Promise.reject(response);
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }
}

export default new UserService();
