import { useMemo, useState } from "react";
import { useEventResponses, useDeleteUserResponses, useToggleDate } from "@/hooks/useEventResponses";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Shield, Trash2, UserX, CalendarPlus, CalendarMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const START = new Date(2026, 5, 1);
const END = new Date(2026, 10, 30);

function isWeekend(date: Date) {
  const day = getDay(date);
  return day === 5 || day === 6 || day === 0;
}

const weekendDates = eachDayOfInterval({ start: START, end: END }).filter(isWeekend);

export function AdminPanel() {
  const { data: responses = [] } = useEventResponses();
  const deleteUser = useDeleteUserResponses();
  const toggleDate = useToggleDate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const people = useMemo(
    () => [...new Set(responses.map((r) => r.person_name))].sort(),
    [responses]
  );

  const unavailableSet = useMemo(
    () => new Set(responses.map((r) => `${r.person_name}|${r.unavailable_date}`)),
    [responses]
  );

  const handleDelete = (name: string) => {
    deleteUser.mutate(name, {
      onSuccess: () => {
        toast.success(`Respuestas de "${name}" eliminadas`);
        setConfirmDelete(null);
      },
    });
  };

  const handleToggleDate = () => {
    if (!selectedUser || !selectedDate) return;
    const isUnavailable = unavailableSet.has(`${selectedUser}|${selectedDate}`);
    toggleDate.mutate(
      { name: selectedUser, date: selectedDate, isUnavailable },
      {
        onSuccess: () => {
          toast.success(
            isUnavailable
              ? `Se desbloqueó ${selectedDate} para ${selectedUser}`
              : `Se bloqueó ${selectedDate} para ${selectedUser}`
          );
        },
      }
    );
  };

  const isDateUnavailable = selectedUser && selectedDate
    ? unavailableSet.has(`${selectedUser}|${selectedDate}`)
    : false;

  return (
    <div className="space-y-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Panel de Administrador</h2>
      </div>

      {/* Delete users section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Eliminar respuestas de usuario</h3>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {people.map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(name)}
              >
                <UserX className="h-3.5 w-3.5" />
                {name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Toggle dates section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Bloquear / Desbloquear fecha para un usuario</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Usuario</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Seleccionar...</option>
              {people.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Fecha (fin de semana)</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Seleccionar...</option>
              {weekendDates.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                return (
                  <option key={dateStr} value={dateStr}>
                    {format(d, "EEE d MMM", { locale: es })}
                  </option>
                );
              })}
            </select>
          </div>
          <Button
            size="sm"
            disabled={!selectedUser || !selectedDate || toggleDate.isPending}
            onClick={handleToggleDate}
            variant={isDateUnavailable ? "default" : "destructive"}
            className="gap-1.5"
          >
            {isDateUnavailable ? (
              <><CalendarPlus className="h-3.5 w-3.5" /> Desbloquear</>
            ) : (
              <><CalendarMinus className="h-3.5 w-3.5" /> Bloquear</>
            )}
          </Button>
        </div>
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar respuestas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará todas las respuestas de <strong>"{confirmDelete}"</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
