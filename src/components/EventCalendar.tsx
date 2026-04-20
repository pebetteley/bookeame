import { useMemo } from "react";
import { useEventResponses, useToggleWeekendBlock } from "@/hooks/useEventResponses";
import { format, eachDayOfInterval, getDay, startOfMonth, endOfMonth, addMonths, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventCalendarProps {
  currentUser: string;
}

const MONTHS = Array.from({ length: 6 }, (_, i) => addMonths(new Date(2026, 5, 1), i));

function isWeekend(date: Date) {
  const day = getDay(date);
  return day === 5 || day === 6 || day === 0;
}

/** Given any Fri/Sat/Sun, return the [Fri, Sat, Sun] block as yyyy-MM-dd strings */
function getWeekendBlock(date: Date): string[] {
  const day = getDay(date);
  let friday: Date;
  if (day === 5) friday = date;
  else if (day === 6) friday = subDays(date, 1);
  else friday = subDays(date, 2); // Sunday
  const sat = addDays(friday, 1);
  const sun = addDays(friday, 2);
  return [format(friday, "yyyy-MM-dd"), format(sat, "yyyy-MM-dd"), format(sun, "yyyy-MM-dd")];
}

export function EventCalendar({ currentUser }: EventCalendarProps) {
  const { data: responses = [] } = useEventResponses();
  const toggleBlock = useToggleWeekendBlock();

  const myUnavailable = useMemo(
    () => new Set(responses.filter((r) => r.person_name === currentUser).map((r) => r.unavailable_date)),
    [responses, currentUser]
  );

  const handleClick = (date: Date) => {
    if (!isWeekend(date)) return;
    const block = getWeekendBlock(date);
    // If ANY day in block is marked, we consider the block as unavailable → remove all
    const blockIsUnavailable = block.some((d) => myUnavailable.has(d));
    toggleBlock.mutate({ name: currentUser, dates: block, isUnavailable: blockIsUnavailable });
  };

  const unavailableCount = (dateStr: string) =>
    responses.filter((r) => r.unavailable_date === dateStr).length;

  const dayNames = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MONTHS.map((month) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({ start, end });
        const firstDayOffset = (getDay(start) + 6) % 7;

        return (
          <div key={month.toISOString()} className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-center text-sm font-semibold capitalize">
              {format(month, "MMMM yyyy", { locale: es })}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {dayNames.map((d) => (
                <div key={d} className="py-1 font-medium text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const weekend = isWeekend(date);
                const isMyUnavailable = myUnavailable.has(dateStr);
                const count = weekend ? unavailableCount(dateStr) : 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleClick(date)}
                    disabled={!weekend || toggleBlock.isPending}
                    className={cn(
                      "relative flex h-9 w-full items-center justify-center rounded-md text-xs transition-all",
                      !weekend && "text-muted-foreground/40 cursor-default",
                      weekend && !isMyUnavailable && "bg-weekend-available hover:bg-weekend-hover cursor-pointer font-medium",
                      weekend && isMyUnavailable && "bg-destructive text-destructive-foreground cursor-pointer font-bold",
                    )}
                  >
                    {date.getDate()}
                    {weekend && count > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
