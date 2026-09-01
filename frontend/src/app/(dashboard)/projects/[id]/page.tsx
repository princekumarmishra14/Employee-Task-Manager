import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewProjectRoute({ params }: Props) {
  const { id } = await params;
  redirect(`/projects?id=${id}`);
}
