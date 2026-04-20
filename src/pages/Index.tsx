import { useState } from "react";
import { NameEntry } from "@/components/NameEntry";
import { EventCalendar } from "@/components/EventCalendar";
import { ResponsesTable } from "@/components/ResponsesTable";
import { WeekendRanking } from "@/components/WeekendRanking";
import { AdminPanel } from "@/components/AdminPanel";
import { CalendarDays, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [name, setName] = useState<string | null>(() => {
    return localStorage.getItem("event_planner_name");
  });

  const handleSubmit = (n: string) => {
    localStorage.setItem("event_planner_name", n);
    setName(n);
  };

  const handleLogout = () => {
    localStorage.removeItem("event_planner_name");
    setName(null);
  };

  if (!name) return <NameEntry onSubmit={handleSubmit} />;

  const isAdmin = name === "admin123";
  const displayName = isAdmin ? "Admin" : name;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="font-semibold">DDS Chorlitos</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <Shield className="h-4 w-4 text-primary" />}
            <span className="text-sm text-muted-foreground">
              Hola, <strong className="text-foreground">{displayName}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container animate-fade-in space-y-8 py-8">
        <div>
          <h1 className="text-2xl font-bold">Disponibilidad Jun–Nov 2026</h1>
          <p className="text-muted-foreground">
            Marca los <strong>fines de semana</strong> (viernes a domingo) que <strong>no puedes</strong> asistir. El número indica cuántos no pueden ese día.
          </p>
        </div>

        {isAdmin && <AdminPanel />}

        <EventCalendar currentUser={name} />

        <WeekendRanking />

        <ResponsesTable />
      </main>
    </div>
  );
}
