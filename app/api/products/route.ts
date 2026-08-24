import { handleListProducts } from "@/lib/api/product-list";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleListProducts(request);
}
