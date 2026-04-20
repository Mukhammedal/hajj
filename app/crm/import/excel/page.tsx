import { CrmTopbar } from "@/components/crm/crm-topbar";
import { importPreviewRows, sheetsMappingRows } from "@/lib/design-crm";

export default function CrmImportExcelPage() {
  return (
    <>
      <CrmTopbar
        title={
          <>
            Импорт из <em>Excel.</em>
          </>
        }
        actions={
          <>
            <a className="btn btn-ghost btn-sm" href="#">
              Скачать шаблон ↓
            </a>
            <a className="btn btn-dark btn-sm" href="#">
              Импортировать 46 строк
            </a>
          </>
        }
      />

      <div className="imp-stepper">
        <div className="stp done"><div className="sn">01</div><div className="sw"><div className="st">Загрузка файла</div><div className="sd">47 строк</div></div></div>
        <div className="sep" />
        <div className="stp done"><div className="sn">02</div><div className="sw"><div className="st">Сопоставление колонок</div><div className="sd">6 полей распознано</div></div></div>
        <div className="sep" />
        <div className="stp on"><div className="sn">03</div><div className="sw"><div className="st">Проверка данных</div><div className="sd">46 готовы · 1 ошибка</div></div></div>
        <div className="sep" />
        <div className="stp"><div className="sn">04</div><div className="sw"><div className="st">Импорт</div><div className="sd">создать и обновить паломников</div></div></div>
      </div>

      <div className="imp-split">
        <div className="imp-drop done">
          <div className="ddh">
            <span className="xi">X</span>
            <div>
              <div className="fn">паломники-рамазан-2026.xlsx</div>
              <div className="fm">487 КБ · лист «Паломники» · 47 строк × 9 колонок</div>
            </div>
            <a className="rep" href="#">заменить файл →</a>
          </div>
          <div className="ddb">
            <div className="ddkv"><div className="k">Загружено</div><div className="v">14:28 · 20.04.2026</div></div>
            <div className="ddkv"><div className="k">Кодировка</div><div className="v">UTF-8</div></div>
            <div className="ddkv"><div className="k">Формат дат</div><div className="v">DD.MM.YYYY</div></div>
            <div className="ddkv"><div className="k">Строк с данными</div><div className="v">47 из 48</div></div>
          </div>
        </div>

        <div className="imp-summary">
          <div className="eyebrow">Результат проверки</div>
          <div className="res-num">46<span>/47</span></div>
          <div className="res-lbl">строк готовы к импорту</div>
          <div className="res-bar"><b style={{ width: "97.8%" }} /></div>
          <div className="res-list">
            <div><span className="d ok" />Будет создано <b>42</b></div>
            <div><span className="d up" />Будет обновлено <b>4</b></div>
            <div><span className="d er" />Ошибок <b style={{ color: "var(--danger)" }}>1</b></div>
          </div>
        </div>
      </div>

      <div className="gs-card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 4 }}>Сопоставление колонок</h3>
        <p className="desc">Проверьте, что каждая колонка сопоставлена с правильным полем CRM.</p>
        <table className="gs-mapping">
          <thead>
            <tr>
              <th>Колонка из файла</th>
              <th>Поле в системе</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {sheetsMappingRows.map((row) => (
              <tr key={row.header}>
                <td><b>{row.header}</b></td>
                <td><code>{row.crmField}</code></td>
                <td><span className={`tag ${row.tone}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="gs-card" style={{ marginTop: 24 }}>
        <div style={{ alignItems: "baseline", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>Превью данных</h3>
            <p className="desc" style={{ margin: "4px 0 0" }}>Первые строки и ошибки импорта.</p>
          </div>
        </div>
        <div className="imp-preview">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ФИО</th>
                <th>ИИН</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Группа</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {importPreviewRows.map((row) => (
                <tr key={row.row} className={row.type}>
                  <td>{row.row}</td>
                  <td>{row.name}</td>
                  <td className="license" style={row.type === "err" ? { color: "var(--danger)" } : undefined}>{row.iin}</td>
                  <td>{row.amount}</td>
                  <td><span className={`tag ${row.stateTone}`}>{row.state}</span></td>
                  <td>{row.group}</td>
                  <td><span className={`tag ${row.actionTone}`}>{row.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-grid" style={{ marginTop: 24 }}>
        <div className="rep-card">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Правила импорта</div>
          {[
            { enabled: true, label: "Обновлять существующих паломников по ИИН" },
            { enabled: true, label: "Создавать draft-платёж при наличии суммы" },
            { enabled: false, label: "Пропускать строки с ошибками и завершать импорт" },
          ].map(({ enabled, label }) => (
            <div
              key={label}
              style={{ alignItems: "center", borderTop: "1px solid var(--line-soft)", display: "flex", justifyContent: "space-between", padding: "12px 0" }}
            >
              <span>{label}</span>
              <span className={`tag ${enabled ? "success" : "warning"}`}>{enabled ? "вкл" : "выкл"}</span>
            </div>
          ))}
        </div>

        <div className="rep-card">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Обратный экспорт</div>
          {[
            { copy: "Шаблон для повторной загрузки и сверки с CRM", title: "XLSX шаблон" },
            { copy: "Универсальный экспорт для бухгалтерии и 1С", title: "CSV UTF-8" },
            { copy: "Отдельный файл по вылетам, отелям и рейсам", title: "Schedule sheet" },
          ].map(({ copy, title }) => (
            <div key={title} style={{ borderTop: "1px solid var(--line-soft)", padding: "12px 0" }}>
              <b style={{ display: "block", marginBottom: 4 }}>{title}</b>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{copy}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
