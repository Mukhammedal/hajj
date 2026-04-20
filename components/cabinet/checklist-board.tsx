"use client";

import { useMemo, useState } from "react";

import { DesignIcon } from "@/components/shell/design-icons";
import { buildChecklistByCategory, getChecklistLabel } from "@/lib/design-cabinet";
import { cn } from "@/lib/utils";
import type { ChecklistCategory, ChecklistItem } from "@/types/domain";

const categoryIcons: Record<ChecklistCategory, { label: string; tone?: string }> = {
  clothing: { label: "▣" },
  documents: { label: "", tone: "default" },
  finance: { label: "₸" },
  health: { label: "+", tone: "danger" },
  spiritual: { label: "◈", tone: "emerald" },
};

export function ChecklistBoard({ initialItems }: { initialItems: ChecklistItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [openCategories, setOpenCategories] = useState<Record<ChecklistCategory, boolean>>({
    clothing: false,
    documents: true,
    finance: false,
    health: true,
    spiritual: false,
  });

  const grouped = useMemo(() => buildChecklistByCategory(items), [items]);

  return (
    <div className="cl-categories">
      {grouped.map((group) => {
        const completed = group.items.filter((item) => item.isChecked).length;
        const total = group.items.length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const icon = categoryIcons[group.category];

        return (
          <div key={group.category} className={cn("cl-cat", openCategories[group.category] && "open")}>
            <button
              type="button"
              className="head w-full border-0 bg-transparent text-left"
              onClick={() => setOpenCategories((prev) => ({ ...prev, [group.category]: !prev[group.category] }))}
            >
              <div
                className="ic"
                style={
                  icon.tone === "danger"
                    ? { background: "var(--danger-bg)", color: "var(--danger)" }
                    : icon.tone === "emerald"
                      ? { background: "rgba(30,74,53,.1)", color: "var(--emerald)" }
                      : undefined
                }
              >
                {group.category === "documents" ? <DesignIcon name="doc" size={16} /> : icon.label}
              </div>
              <h4>
                {getChecklistLabel(group.category)} · <em>{group.category}</em>
              </h4>
              <div style={{ textAlign: "right" }}>
                <div className="meta">
                  {completed} из {total}
                </div>
                <div className={cn("mini-bar bar", group.category === "health" ? "warn" : "em")} style={{ marginTop: 6 }}>
                  <i style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="chev">{openCategories[group.category] ? "свернуть ›" : "развернуть ›"}</div>
            </button>

            <div className="items">
              {group.items.map((item) => (
                <div key={item.id} className="cl-item">
                  <button
                    type="button"
                    className={cn("cb border-0", item.isChecked && "on")}
                    onClick={() =>
                      setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isChecked: !entry.isChecked } : entry)))
                    }
                  >
                    {item.isChecked ? <DesignIcon name="check" size={11} /> : null}
                  </button>
                  <div>
                    <div className="t">{item.itemName}</div>
                    <div className="tip">{getChecklistHint(group.category, item.itemName)}</div>
                  </div>
                  <div className="more">подсказка</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getChecklistHint(category: ChecklistCategory, itemName: string) {
  const defaultHints: Record<ChecklistCategory, string> = {
    clothing: "Удобная, дышащая одежда и обувь важнее объёма багажа.",
    documents: "Держите оригинал и скан отдельно, чтобы не потерять доступ в дороге.",
    finance: "Наличные SAR и одна резервная карта обычно перекрывают весь путь.",
    health: "Куратор просит закрыть health-блок минимум за 10 дней до вылета.",
    spiritual: "Короткий список дуа и заметок помогает не забыть главное в дни хаджа.",
  };

  if (/паспорт/i.test(itemName)) {
    return "Проверьте срок действия и минимум две чистые страницы для визы.";
  }

  if (/ACWY|привив/i.test(itemName)) {
    return "Сертификат с печатью Минздрава и английским переводом нужен до вылета.";
  }

  if (/ихрам/i.test(itemName)) {
    return "Лучше примерить комплект заранее и сложить в ручную кладь.";
  }

  return defaultHints[category];
}
