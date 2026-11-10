export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency === "KES" ? "KES" : "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
