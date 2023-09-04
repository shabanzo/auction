export default function authHeader(): Record<string, string> {
  if (typeof document !== 'undefined' && document) {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token'))
      ?.split('=')[1];

    if (token) {
      return { Authorization: 'Bearer ' + token };
    }
  }

  return {};
}
