import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { priorityLabels, priorityStyles, statusIcons, statusLabels, statusStyles } from "@/features/chamados/chamados-format";
import type { TicketPriority, TicketStatus } from "@/types/api";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const Icon = statusIcons[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5", statusStyles[status])}>
      <Icon className="size-3.5" />
      {statusLabels[status]}
    </Badge>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5", priorityStyles[priority])}>
      {priorityLabels[priority]}
    </Badge>
  );
}
