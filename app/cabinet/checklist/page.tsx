import Link from "next/link";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { ChecklistBoard } from "@/components/cabinet/checklist-board";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";

export default async function CabinetChecklistPage() {
  const cabinet = await loadCabinetBundle();
  const items = cabinet?.checklist ?? [];
  const completed = items.filter((item) => item.isChecked).length;

  return (
    <>
      <CabinetTopbar
        actions={
          <Link className="btn btn-ghost btn-sm" href="/cabinet/group">
            Распечатать
          </Link>
        }
        title={
          <>
            Чек-лист — <em>{completed} из {items.length}</em> пунктов.
          </>
        }
      />

      <div className="cl-hero">
        <span className="eyebrow">Сборы в хадж</span>
        <h1>
          Собираем <em>вместе</em> — по 5 категориям.
        </h1>
        <p>Каждый пункт открывает подсказку: зачем нужен, где взять, какие есть альтернативы. Куратор отдельно смотрит health-категорию.</p>
      </div>

      <ChecklistBoard initialItems={items} />
    </>
  );
}
