import axios, { AxiosResponse } from 'axios';

import authHeader from './auth.header';
import { User } from './interface';

const API_URL = 'http://localhost:4000/api/v1/user/';

interface authParams {
  email: string;
  password: string;
}
class UserService {
  signin(authParams: authParams): Promise<AxiosResponse<User>> {
    return axios.post<User>(API_URL + 'signin', authParams).then((response) => {
      if (response.data.token) {
        const { token, ...userData } = response.data;
        document.cookie = `token=${token}`;
        localStorage.setItem('user', JSON.stringify(userData));
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

  updateUserData() {
    const headers = authHeader();
    axios
      .get<User>(API_URL + 'myProfile', { headers })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.walletBalance !== undefined) {
            localStorage.setItem('user', JSON.stringify(response.data));
            return response;
          }
        } else {
          return Promise.reject(response);
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  deposit(amount: number): Promise<AxiosResponse<User>> {
    const headers = authHeader();

    return axios
      .post<User>(API_URL + 'deposit', { amount }, { headers })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.walletBalance !== undefined) {
            localStorage.setItem('user', JSON.stringify(response.data));
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
