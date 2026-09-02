export const fmtINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const fmtNumber = (n) => Number(n || 0).toLocaleString("en-IN");
export const fmtCompact = (n) => {
  const v = Number(n) || 0;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
};
