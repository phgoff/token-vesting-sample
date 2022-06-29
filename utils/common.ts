export const formatNumber = (value: number | string, decimals = 5) => {
  let val = typeof value === "string" ? Number(value) : value;
  return val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
};

export const truncateAddress = (address?: string, length: number = 4) => {
  if (address) {
    const left = address.slice(0, length);
    const right = address.slice(address.length - length, address.length);
    return `${left}...${right}`;
  }
  return "";
};
