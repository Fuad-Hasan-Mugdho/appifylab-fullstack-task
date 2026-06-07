import { redirect } from "next/navigation";
import FeedClient from "../../components/FeedClient";
import { getCurrentUser } from "../../lib/auth";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <FeedClient user={JSON.parse(JSON.stringify(user))} />;
}
