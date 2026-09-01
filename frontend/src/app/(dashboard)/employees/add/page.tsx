import { redirect } from "next/navigation";

export default function AddEmployeeRoute() {
  redirect("/employees?action=add");
}
