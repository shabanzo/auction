import axios, { AxiosResponse } from 'axios';

import { User } from './interface';

const API_URL = 'http://localhost:4000/api/v1/user/';

interface authParams {
  email: string;
  password: string;
}
class UserService {
  signin(authParams: authParams): Promise<AxiosResponse<User>> {
    return axios
      .post<User>(API_URL + 'signin', authParams, { withCredentials: true })
      .then((response) => {
        if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response;
      });
  }

  signout(): Promise<AxiosResponse<User>> {
    return axios
      .post<User>(API_URL + 'signout', {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('user');
        }

        return response;
      });
  }

  signup(authParams: authParams): Promise<AxiosResponse<User>> {
    return axios.post<User>(API_URL + 'signup', authParams);
  }

  getCurrentUser(): User | null {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  updateCurrentUser() {
    axios
      .get<User>(API_URL + 'myProfile', { withCredentials: true })
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
    return axios
      .post<User>(API_URL + 'deposit', { amount }, { withCredentials: true })
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
