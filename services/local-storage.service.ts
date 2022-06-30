const getItem = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return;
};

const setItem = <T>(
  key: string,
  value: Object | Array<T> | string | Number
) => {
  const data = JSON.stringify(value);
  localStorage.setItem(key, data);
};

const removeItem = (key: string) => {
  localStorage.removeItem(key);
};

const clearItem = () => {
  localStorage.clear();
};

const localStorageService = { getItem, setItem, removeItem, clearItem };

export default localStorageService;
