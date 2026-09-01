import { redirect } from "next/navigation";

export default function AddProjectRoute() {
  redirect("/projects?action=add");
}
