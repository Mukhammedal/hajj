import Link from "next/link";

import { DesignIcon } from "@/components/shell/design-icons";

export function Footer() {
  return (
    <footer className="footer">
      <div className="cols">
        <div>
          <div className="logo" style={{ color: "#ede6d4", marginBottom: "14px" }}>
            <span className="logo-mark em">h</span>HajjCRM
          </div>
          <p className="footer-note">
            Платформа для казахстанских операторов хаджа и умры. Лицензия туроператорской деятельности РК №94-V.
          </p>
          <div className="footer-cities">Алматы · Астана · Шымкент</div>
        </div>
        <div>
          <h5>Паломникам</h5>
          <ul>
            <li>
              <Link href="/operators">Каталог операторов</Link>
            </li>
            <li>
              <a href="#">Как проверить лицензию</a>
            </li>
            <li>
              <Link href="/cabinet/checklist">Чек-лист</Link>
            </li>
            <li>
              <Link href="/cabinet/faq">FAQ</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Операторам</h5>
          <ul>
            <li>
              <Link href="/register">Подать заявку</Link>
            </li>
            <li>
              <a href="#">Тарифы CRM</a>
            </li>
            <li>
              <a href="#">API</a>
            </li>
            <li>
              <a href="#">Документация</a>
            </li>
          </ul>
        </div>
        <div>
          <h5>Контакты</h5>
          <ul>
            <li>+7 727 355 00 00</li>
            <li>hello@hajjcrm.kz</li>
            <li>Алматы, пр. Достык 180</li>
          </ul>
          <div className="footer-socials">
            <a aria-label="Instagram" className="footer-social" href="#" title="Instagram">
              <svg fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
                <rect height="20" rx="5" width="20" x="2" y="2" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.5" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a aria-label="WhatsApp" className="footer-social" href="#" title="WhatsApp">
              <DesignIcon name="wa" size={14} />
            </a>
            <a aria-label="YouTube" className="footer-social" href="#" title="YouTube">
              <svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
              </svg>
            </a>
            <a aria-label="Telegram" className="footer-social" href="#" title="Telegram">
              <svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.9 8.2-2 9.3c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5c.2-.2-.1-.3-.3-.2l-7 4.4-3-.9c-.6-.2-.7-.6.1-.9l11.9-4.6c.6-.2 1 .1.8 1z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="prayer-widget">
            <div className="ph">
              <span className="pname">Времена намаза</span>
              <span className="pcity">Алматы · сегодня</span>
            </div>
            <div className="prayer-grid">
              <div>
                <b>05:12</b>
                <span className="lbl">Фаджр</span>
              </div>
              <div>
                <b>06:41</b>
                <span className="lbl">Шурук</span>
              </div>
              <div>
                <b>13:06</b>
                <span className="lbl">Зухр</span>
              </div>
              <div>
                <b>17:48</b>
                <span className="lbl">Аср</span>
              </div>
              <div>
                <b>19:32</b>
                <span className="lbl">Магриб</span>
              </div>
              <div>
                <b>21:00</b>
                <span className="lbl">Иша</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© 2026 HajjCRM · Все права защищены</div>
        <div>Закон РК №94-V · Оферта · Политика конфиденциальности</div>
      </div>
    </footer>
  );
}
