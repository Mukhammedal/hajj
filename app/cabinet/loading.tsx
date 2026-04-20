import { LoadingState } from "@/components/shell/fallback-state";

export default function CabinetLoading() {
  return <LoadingState copy="Подтягиваем документы, платежи и readiness паломника." title="Открываем <em>кабинет</em>" />;
}
