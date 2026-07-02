import { LucideIcon } from 'lucide-react';

export type MetricCardProps = {
  icon?: LucideIcon;
  textIcon?: string;
  title: string;
  value: string;
  subValue?: string;
};

type TopMetricCardProps = MetricCardProps & {
  icon: LucideIcon;
  subValue: string;
};

export function TopMetricCard({ icon: Icon, title, value, subValue }: TopMetricCardProps) {
  return (
    <div className="reward-card flex min-h-[104px] min-w-[178px] flex-col justify-between p-3">
      <div className="flex items-center gap-2 whitespace-nowrap text-[10px] uppercase text-brand-gray">
        <Icon size={14} className="shrink-0 text-white" />
        <span>{title}</span>
      </div>
      <div className="min-w-0">
        <div className="whitespace-nowrap font-title text-[2.1rem] leading-none text-brand-matcha">{value}</div>
        <div className="metric-description mt-1 text-[11px] leading-snug text-brand-gray">{subValue}</div>
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, textIcon, title, value, subValue }: MetricCardProps) {
  return (
    <div className="reward-card flex min-h-[132px] min-w-[180px] flex-col justify-between px-4 py-5">
      <div className="flex items-center gap-2 whitespace-nowrap text-[10px] uppercase text-brand-gray">
        {Icon ? (
          <Icon size={14} className="shrink-0 text-white" />
        ) : (
          <span className="grid h-[14px] w-[14px] shrink-0 place-items-center font-bold text-white">{textIcon}</span>
        )}
        <span>{title}</span>
      </div>
      <div className="min-w-0">
        <div className="whitespace-nowrap font-title text-[5.35rem] leading-[0.8] text-brand-matcha">{value}</div>
        {subValue ? (
          <div className="mt-2 whitespace-nowrap text-[12px] leading-relaxed text-brand-gray">{subValue}</div>
        ) : null}
      </div>
    </div>
  );
}
