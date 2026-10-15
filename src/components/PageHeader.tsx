import Link from "next/link";

type PageHeaderProps = {
  breadcrumb: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  breadcrumb,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">{breadcrumb}</p>
        <h1 className="text-2xl font-semibold text-[#1B2430]">{title}</h1>
        {description && <p className="text-[#5B6675] text-sm mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
