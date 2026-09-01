import { redirect } from "next/navigation";

export default function AddTaskRoute() {
  redirect("/tasks?action=add");
}
