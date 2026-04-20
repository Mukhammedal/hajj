import Link from "next/link";

import { FaqBoard } from "@/components/cabinet/faq-board";
import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";

export default function CabinetFaqPage() {
  return (
    <>
      <CabinetTopbar
        actions={
          <Link className="btn btn-ghost btn-sm" href="/cabinet/chat">
            Не нашёл ответ →
          </Link>
        }
        title={
          <>
            Часто задаваемые <em>вопросы.</em>
          </>
        }
      />

      <FaqBoard />
    </>
  );
}
