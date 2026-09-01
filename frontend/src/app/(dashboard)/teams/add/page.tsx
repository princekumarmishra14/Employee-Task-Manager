import { redirect } from "next/navigation";

export default function AddTeamRoute() {
  redirect("/teams?action=add");
}
