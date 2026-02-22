import OrganizeClient from "./OrganizeClient";
import { getTagSummaries } from "@/lib/actions/tags";

export default async function OrganizePage() {
  let tags = [];
  try {
    tags = await getTagSummaries();
  } catch {
    tags = [];
  }
  return <OrganizeClient initialTags={tags} />;
}
