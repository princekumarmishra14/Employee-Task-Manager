import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeeRoute({ params }: Props) {
  const { id } = await params;
  redirect(`/employees?id=${id}&action=edit`);
}
