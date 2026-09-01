import { redirect } from "next/navigation";

export default function AddDepartmentRoute() {
  redirect("/departments?action=add");
}
