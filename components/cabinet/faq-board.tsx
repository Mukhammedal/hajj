"use client";

import { useState } from "react";
import Link from "next/link";

import { DesignIcon } from "@/components/shell/design-icons";
import { faqCategories, faqSections } from "@/lib/design-cabinet";
import { cn } from "@/lib/utils";

export function FaqBoard() {
  const [activeCategory, setActiveCategory] = useState(faqSections[0]?.title ?? "");
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({
    "Документы и виза::0": true,
    "Оплата и рассрочка::0": true,
    "Прививки и здоровье::0": true,
    "Что взять с собой::0": true,
    "Обряды хаджа::0": true,
  });

  return (
    <>
      <div className="faq-hero">
        <div>
          <h2>
            Всё о хадже <em>в одном месте.</em>
          </h2>
          <p>156 вопросов и ответов, собранных из опыта 500+ паломников хаджа 1446. Если не найдёте ответ — куратор ответит в течение 12 минут.</p>
          <div className="search-big">
            <DesignIcon name="search" size={14} />
            Найти ответ на вопрос…
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: "var(--f-serif)", fontStyle: "italic", color: "var(--emerald)", fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ fontFamily: "var(--f-arabic)", direction: "rtl", fontSize: 24, color: "var(--ink)", marginBottom: 10 }}>﴿ وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ ﴾</div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--f-display)", fontStyle: "normal" }}>{"Аль-'Имран · 3:97"}</div>
        </div>
      </div>

      <div className="faq-split">
        <nav className="faq-nav">
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>
            Категории
          </div>
          {faqCategories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={cn("block w-full border-0 bg-transparent p-0 text-left", activeCategory === category.label && "on")}
              onClick={() => setActiveCategory(category.label)}
            >
              <span className={cn("flex justify-between rounded-[var(--radius-sm)] px-3 py-[10px]", activeCategory === category.label && "bg-[var(--cream-2)] text-[var(--ink)]")}>
                {category.label}
                <span className="c">{category.count}</span>
              </span>
            </button>
          ))}
        </nav>

        <div>
          {faqSections.map((section) => (
            <div key={section.title}>
              <div className="faq-cat-title">
                {section.title} · {section.count} {section.count === 1 ? "вопрос" : "вопросов"}
              </div>
              {section.questions.map((question, index) => {
                const key = `${section.title}::${index}`;
                const isOpen = Boolean(question.answer) && (openQuestions[key] ?? false);

                return (
                  <div key={key} className={cn("faq-q", isOpen && "open")}>
                    <div className="qh" onClick={() => setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }))}>
                      <h4>{question.question}</h4>
                      <span className="ch">›</span>
                    </div>
                    {isOpen ? (
                      <div className="qb">
                        {question.answer?.length ? <p>{question.answer[0]}</p> : null}
                        {question.answer && question.answer.length > 1 ? (
                          <ul>
                            {question.answer.slice(1).map((paragraph, paragraphIndex) => (
                              <li key={`${key}-${paragraphIndex}`}>{paragraph}</li>
                            ))}
                          </ul>
                        ) : null}
                        {question.updated || question.helpful ? (
                          <div className="mta">
                            {question.updated ? (
                              <span>
                                <b>Обновлено</b> · {question.updated}
                              </span>
                            ) : null}
                            {question.helpful ? (
                              <span>
                                <b>Полезно?</b> {question.helpful}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="faq-help">
            <div>
              <h4>Не нашли ответа?</h4>
              <p>Куратор Бауыржан отвечает в среднем за 12 минут с 08:00 до 22:00 алматинского времени.</p>
            </div>
            <Link className="btn" href="/cabinet/chat" style={{ background: "var(--gold-soft)", color: "var(--ink)", borderColor: "var(--gold-soft)" }}>
              <DesignIcon name="wa" size={12} />
              Написать куратору
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
