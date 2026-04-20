import { LoadingState } from "@/components/shell/fallback-state";

export default function AdminLoading() {
  return <LoadingState copy="Подтягиваем moderation, platform analytics и экспортные настройки." title="Открываем <em>admin</em>" />;
}
