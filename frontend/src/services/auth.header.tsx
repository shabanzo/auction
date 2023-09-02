import { User } from './interface';

export default function authHeader(): Record<string, string> {
  const userJson = localStorage.getItem('user');

  if (userJson) {
    const user: User = JSON.parse(userJson);
    if (user.token) {
      return { Authorization: 'Bearer ' + user.token };
    }
  }

  return {};
}
