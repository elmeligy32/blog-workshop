import client from "./client";

export async function fetchCategories() {
  const { data } = await client.get("/categories/");
  return data;
}