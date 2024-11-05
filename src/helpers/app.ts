import Cookies from "universal-cookie";

export function getCookie<T>(key: string) {
  const cookies = new Cookies(null, { path: "/" });
  return cookies.get<T>(`kp-${key}`);
}

export const setCookie = (key: string, value: any) => {
  const cookies = new Cookies(null, { path: "/" });
  cookies.set(`kp-${key}`, value);
};

export const removeCookie = (key: string) => {
  const cookies = new Cookies(null, { path: "/" });
  cookies.remove(`kp-${key}`);
};
