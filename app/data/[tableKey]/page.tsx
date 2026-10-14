import { UploadedDataPage } from "@/components/features/UploadedDataPage";

interface DataTableRouteProps {
  params: Promise<{ tableKey: string }>;
}

export default async function DataTableRoutePage({ params }: DataTableRouteProps) {
  const { tableKey } = await params;
  const title = tableKey.replaceAll("_", " ");
  return <UploadedDataPage tableKey={tableKey} title={title} description={`Browse rows currently stored in the ${title} table.`} />;
}
