import Link from "next/link";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { DocumentUploadBoard } from "@/components/cabinet/document-upload-board";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";

export default async function CabinetDocumentsPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet) {
    return null;
  }

  const docsCount = new Set(cabinet.documents.map((document) => document.type)).size;

  return (
    <>
      <CabinetTopbar
        actions={
          <Link className="btn btn-ghost btn-sm" href="/cabinet/contract">
            Скачать все ZIP
          </Link>
        }
        title={
          <>
            Документы — <em>{docsCount} из 5.</em>
          </>
        }
      />

      <div className="docs-hero">
        <span className="eyebrow">Готовность документов</span>
        <h1>
          Один документ <em>остался</em> — закройте пакет до вылета.
        </h1>
        <p>Все 5 типов документов нужны для визы КСА. Загруженные файлы сразу попадают в Storage, а статус проверки обновляется в кабинете.</p>
      </div>

      <DocumentUploadBoard
        hasGroup={Boolean(cabinet.group)}
        initialDocuments={cabinet.documents}
        notifications={cabinet.notifications}
        paymentComplete={cabinet.payment?.status === "paid"}
      />
    </>
  );
}
