import { Badge } from "@/components/ui/badge";
import { DocumentUploadBoard } from "@/components/cabinet/document-upload-board";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";

export default async function CabinetDocumentsPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet) {
    return null;
  }

  const { documents, payment, group } = cabinet;

  return (
    <div className="grid gap-6">
      <div className="shell-panel p-6">
        <Badge>Документы и валидация</Badge>
        <h2 className="mt-4 text-4xl">Файлы для визы и вылета</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Экран работает по live-сценарию v1: файл уходит в Supabase Storage, запись обновляется в таблице documents, а
          readiness пересчитывается через pilgrim_readiness_view.
        </p>
      </div>

      <DocumentUploadBoard
        initialDocuments={documents}
        paymentComplete={payment?.status === "paid"}
        hasGroup={Boolean(group)}
      />
    </div>
  );
}
