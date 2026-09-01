import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewDepartmentRoute({ params }: Props) {
  const { id } = await params;
  redirect(`/departments?id=${id}`);
}
