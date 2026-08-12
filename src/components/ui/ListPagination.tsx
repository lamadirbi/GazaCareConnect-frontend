"use client";

import { useLang } from "@/lib/i18n";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function ListPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  label,
}: Props) {
  const { t } = useLang();
  const itemLabel = label ?? t("paginationItemConsultation");

  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="gc-list-pagination" role="navigation" aria-label={t("paginationNavLabel")}>
      <p className="gc-list-pagination-meta">
        {from}–{to} {t("paginationOf")} {total} {itemLabel}
      </p>
      <div className="gc-list-pagination-actions">
        <button
          type="button"
          className="gc-list-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("paginationPrev")}
        </button>
        <span className="gc-list-pagination-page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="gc-list-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("paginationNext")}
        </button>
      </div>
    </div>
  );
}
