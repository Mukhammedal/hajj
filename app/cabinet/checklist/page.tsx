import { Badge } from "@/components/ui/badge";
import { ChecklistBoard } from "@/components/cabinet/checklist-board";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";

export default async function CabinetChecklistPage() {
  const cabinet = await loadCabinetBundle();
  const items = cabinet?.checklist ?? [];

  return (
    <div className="grid gap-6">
      <div className="shell-panel p-6">
        <Badge>Подготовка к поездке</Badge>
        <h2 className="mt-4 text-4xl">Чек-лист паломника</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Категории разбиты на документы, здоровье, одежду, финансы и духовную подготовку. Отметки сохраняются моментально и
          подходят для мобильного использования.
        </p>
      </div>

      <ChecklistBoard initialItems={items} />
    </div>
  );
}
