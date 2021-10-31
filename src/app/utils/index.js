export const formatNumber = (number) => {
  if (!number || typeof number !== "number") {
    return number;
  }

  return number.toLocaleString("en-US", { minimumFractionDigits: 4 });
};
