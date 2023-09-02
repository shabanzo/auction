import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { User } from './interface';

const API_URL = 'http://localhost:3000/api/v1/user/';

class UserService {
  signin(email: string, password: string): Promise<AxiosResponse<User>> {
    return axios
      .post<User>(API_URL + 'signin', {
        email,
        password,
      })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response;
      });
  }

  signout(): void {
    localStorage.removeItem('user');
  }

  register(email: string, password: string): Promise<AxiosResponse<User>> {
    return axios.post<User>(API_URL + 'signup', {
      email,
      password,
    });
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
