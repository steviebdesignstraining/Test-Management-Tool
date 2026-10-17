type PageHeaderProps = {
  breadcrumb: React.ReactNode;
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
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">{breadcrumb}</p>
        <h1 className="text-xl font-semibold text-[#1B2430] mt-2">{title}</h1>
        {description && <p className="text-sm text-[#5B6675] mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}