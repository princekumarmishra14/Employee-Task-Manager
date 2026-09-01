import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewTeamRoute({ params }: Props) {
  const { id } = await params;
  redirect(`/teams?id=${id}`);
}
