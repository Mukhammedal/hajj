"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { DesignIcon } from "@/components/shell/design-icons";
import { buildChatMessages, chatThreads } from "@/lib/design-cabinet";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PilgrimProfile } from "@/types/domain";

export function ChatBoard({ pilgrim }: { pilgrim: PilgrimProfile }) {
  const [activeThreadId, setActiveThreadId] = useState("curator");
  const messages = useMemo(() => buildChatMessages(pilgrim), [pilgrim]);
  const curatorInitials = initials("Бауыржан Темирханов");

  return (
    <div className="chat-wrap">
      <div className="chat-list">
        <div className="chat-list-h">
          <h3>Чаты</h3>
          <div className="search">
            <DesignIcon name="search" size={12} />
            Поиск по сообщениям…
          </div>
        </div>
        {chatThreads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={cn("clc-item w-full border-0 bg-transparent text-left", activeThreadId === thread.id && "on", thread.unread && "unread")}
            onClick={() => setActiveThreadId(thread.id)}
          >
            <div className={cn("av", thread.tone === "gold" && "g", thread.tone === "ink" && "i")}>{thread.initials}</div>
            <div className="cm">
              <div className="tr">
                <span className="nm">{thread.name}</span>
                <span className="tm">{thread.time}</span>
              </div>
              <div className="pr">{thread.preview}</div>
            </div>
            {thread.unread ? <span className="unr">{thread.unread}</span> : null}
          </button>
        ))}
      </div>

      <div className="chat-main">
        <div className="chat-h">
          <div className="av">{curatorInitials}</div>
          <div>
            <h3>Бауыржан Темирханов</h3>
            <div className="st">онлайн · куратор группы A</div>
          </div>
          <div className="actions">
            <button className="ibtn" title="Позвонить" type="button">
              ☎
            </button>
            <button className="ibtn" title="Инфо" type="button">
              ⓘ
            </button>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-day">Вторник, 15 апреля</div>
          {messages.map((message, index) =>
            message.type === "hotel-card" ? (
              <div key={`msg-${index}`} className="cmsg in card">
                <div className="c-img" style={{ backgroundImage: `url('${message.hotelImage}')` }} />
                <div className="c-body">
                  <b>{message.hotelTitle}</b>
                  <div style={{ color: "var(--muted)", marginBottom: 6 }}>{message.detail}</div>
                  <Link href={message.hotelLink ?? "/hotels/hilton-suites-makkah"}>Смотреть отель →</Link>
                </div>
              </div>
            ) : (
              <div key={`msg-${index}`} className={cn("cmsg", message.direction)}>
                {message.body}
                <span className="tm">{message.time}</span>
              </div>
            ),
          )}
        </div>

        <div className="chat-input">
          <button className="attach" type="button">
            ＋
          </button>
          <input placeholder="Написать сообщение…" />
          <button className="send" type="button">
            <DesignIcon name="arrow" size={14} />
          </button>
        </div>
      </div>

      <div className="chat-info">
        <div className="ci-h">
          <div className="av">{curatorInitials}</div>
          <div className="nm">Бауыржан Темирханов</div>
          <div className="rl">Куратор группы A</div>
        </div>

        <div className="ci-sec">
          <h6>Быстрые действия</h6>
          <div className="ci-quick">
            <button type="button">📞 Позвонить +7 747 123-45-67</button>
            <button type="button">✉ Отправить документ</button>
            <button type="button">📍 Поделиться локацией</button>
            <button type="button">🔔 Отключить уведомления</button>
          </div>
        </div>

        <div className="ci-sec">
          <h6>Информация</h6>
          <div className="ci-kv">
            <span className="k">Компания</span>
            <span className="v">Al-Safa Travel</span>
          </div>
          <div className="ci-kv">
            <span className="k">Опыт</span>
            <span className="v">12 лет</span>
          </div>
          <div className="ci-kv">
            <span className="k">Языки</span>
            <span className="v">KZ · RU · AR</span>
          </div>
          <div className="ci-kv">
            <span className="k">Рабочие часы</span>
            <span className="v">08:00–22:00</span>
          </div>
          <div className="ci-kv">
            <span className="k">Ответ в среднем</span>
            <span className="v">12 мин</span>
          </div>
        </div>

        <div className="ci-sec">
          <h6>Общий файл</h6>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["Программа-хадж.pdf", "Контакты-отеля.pdf"].map((file) => (
              <a
                key={file}
                href="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 8,
                  background: "var(--cream-2)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 11,
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                <DesignIcon name="doc" size={12} className="text-[var(--emerald)]" />
                {file}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
