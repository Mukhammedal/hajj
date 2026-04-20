import { ChatBoard } from "@/components/cabinet/chat-board";
import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { DesignIcon } from "@/components/shell/design-icons";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";

export default async function CabinetChatPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet) {
    return null;
  }

  return (
    <>
      <CabinetTopbar
        actions={
          <button className="ibtn" type="button">
            <DesignIcon name="bell" size={14} />
          </button>
        }
        title={
          <>
            Чат с <em>куратором.</em>
          </>
        }
      />

      <ChatBoard pilgrim={cabinet.pilgrim} />
    </>
  );
}
