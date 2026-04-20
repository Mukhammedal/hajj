"use client";

import { useMemo, useState } from "react";
import { Check, Circle } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ChecklistItem, ChecklistCategory } from "@/types/domain";

const labels: Record<ChecklistCategory, string> = {
  documents: "Документы",
  health: "Здоровье",
  clothing: "Одежда",
  finance: "Финансы",
  spiritual: "Духовная подготовка",
};

export function ChecklistBoard({ initialItems }: { initialItems: ChecklistItem[] }) {
  const [items, setItems] = useState(initialItems);
  const completion = useMemo(() => {
    if (!items.length) {
      return 0;
    }

    return Math.round((items.filter((item) => item.isChecked).length / items.length) * 100);
  }, [items]);

  const grouped = Object.entries(labels).map(([category, label]) => ({
    category,
    label,
    items: items.filter((item) => item.category === category),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
      <div className="shell-panel p-6">
        <p className="text-2xl font-semibold">Общий прогресс</p>
        <p className="mt-2 text-sm text-muted-foreground">Чек-лист помогает закрыть не только документы, но и подготовку к поездке.</p>
        <div className="mt-6 flex h-32 w-32 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-4xl text-primary">
          {completion}%
        </div>
        <Progress className="mt-6" value={completion} />
      </div>

      <div className="grid gap-4">
        {grouped.map((group) => (
          <div key={group.category} className="shell-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xl font-semibold">{group.label}</p>
              <span className="text-sm text-muted-foreground">{group.items.filter((item) => item.isChecked).length}/{group.items.length}</span>
            </div>
            <div className="grid gap-3">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isChecked: !entry.isChecked } : entry)))
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                    item.isChecked ? "border-success/25 bg-success/10" : "border-white/10 bg-white/5",
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15">
                    {item.isChecked ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                  </span>
                  <span className="text-sm">{item.itemName}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
