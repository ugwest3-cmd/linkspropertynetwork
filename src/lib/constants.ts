export const UGANDA_LOCATIONS = [
  "Kampala - Central",
  "Kampala - Kawempe",
  "Kampala - Makindye",
  "Kampala - Nakawa",
  "Kampala - Rubaga",
  "Wakiso - Kira",
  "Wakiso - Nansana",
  "Wakiso - Entebbe",
  "Wakiso - Kajjansi",
  "Wakiso - Kasangati",
  "Wakiso - Kyengera",
  "Wakiso - Matugga",
  "Wakiso - Buloba",
  "Mukono",
  "Jinja",
  "Mbarara",
  "Gulu",
  "Lira",
  "Masaka",
  "Mbale",
  "Arua",
  "Fort Portal",
  "Kabale",
  "Soroti",
  "Tororo",
  "Hoima",
  "Mityana",
  "Luwero",
  "Iganga",
  "Busia",
  "Kasese",
  "Bushenyi",
  "Mubende",
  "Kayunga",
  "Rukungiri",
  "Nebbi",
  "Kisoro",
  "Kitgum",
  "Moroto"
] as const;

export function formatPrice(priceStr: string | number): string {
  if (!priceStr) return "0";
  const cleanStr = String(priceStr).replace(/\D/g, "");
  if (!cleanStr) return String(priceStr);
  const num = parseInt(cleanStr, 10);
  return num.toLocaleString("en-US");
}
