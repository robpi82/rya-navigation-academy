import { useState } from "react";
import { AlertTriangle, CalendarDays, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/modules/calculators/fields";
import { buildPlan } from "@/lib/studyPlan";
import { cn } from "@/lib/utils";
import { usePlanStore } from "@/stores/planStore";
import type { CourseLevel } from "@/types/learning";
import { PlanItemRow } from "./PlanItemRow";
import { PlanStatusPanel } from "./PlanStatusPanel";
import { todayIso, usePlanView } from "./usePlan";

export const LEVEL_NAME: Record<CourseLevel, string> = {
  "day-skipper": "Day Skipper",
  "coastal-skipper": "Coastal Skipper",
  "yachtmaster-offshore": "Yachtmaster",
};

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

const inputClass =
  "h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function PlanSetup() {
  const setPlan = usePlanStore((s) => s.setPlan);
  const [level, setLevel] = useState<CourseLevel>("day-skipper");
  const [start, setStart] = useState(todayIso());
  const [exam, setExam] = useState(addDays(todayIso(), 56));
  const [sessions, setSessions] = useState(3);
  const valid = Boolean(start && exam && exam > start);
  const preview = valid
    ? buildPlan(level, new Date(start), new Date(exam), sessions)
    : null;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Lernplan anlegen</CardTitle>
        <CardDescription>
          Wähle Stufe, Zeitraum und wie oft du pro Woche lernen willst. Die
          Lektionen werden in empfohlener Reihenfolge verteilt; zum Schluss
          folgen Wiederholung und zwei Probeprüfungen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Toggle
          value={level}
          onChange={setLevel}
          label="Ausbildungsstufe"
          options={[
            { value: "day-skipper", label: "Day Skipper" },
            { value: "coastal-skipper", label: "Coastal" },
            { value: "yachtmaster-offshore", label: "Yachtmaster" },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm font-medium">
            Beginn
            <input
              type="date"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Prüfungstermin
            <input
              type="date"
              className={inputClass}
              value={exam}
              min={start}
              onChange={(e) => setExam(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            Lerneinheiten pro Woche
            <select
              className={inputClass}
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!valid && (
          <p className="text-sm text-destructive">
            Der Prüfungstermin muss nach dem Beginn liegen.
          </p>
        )}
        {preview && (
          <p className="text-sm text-muted-foreground">
            {preview.weeks.length}{" "}
            {preview.weeks.length === 1 ? "Woche" : "Wochen"},{" "}
            {preview.weeks.reduce((n, w) => n + w.items.length, 0)} Einheiten.
            {preview.tooDense && (
              <span className="text-destructive">
                {" "}
                In mindestens einer Woche sind mehr Einheiten nötig als geplant
                – mehr Zeit oder mehr Lerneinheiten pro Woche wählen.
              </span>
            )}
          </p>
        )}
        <Button
          disabled={!valid}
          onClick={() =>
            setPlan({ level, start, exam, sessionsPerWeek: sessions })
          }
        >
          <CalendarDays className="size-4" /> Plan erstellen
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudyPlanPage() {
  const view = usePlanView();
  const clear = usePlanStore((s) => s.clear);

  if (!view)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Lernplan"
          subtitle="Ein Wochenplan bis zu deinem Prüfungstermin – der Fortschritt wird automatisch aus Lektionen, Glossar und Prüfungen übernommen."
        />
        <PlanSetup />
      </div>
    );

  const { settings, plan, done, current, doneCount, total } = view;
  const before = settings.exclude?.length ?? 0;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lernplan"
        subtitle={`${LEVEL_NAME[settings.level]} · ${formatDate(settings.start)} bis Prüfung am ${formatDate(settings.exam)} · ${settings.sessionsPerWeek} Einheiten pro Woche`}
        actions={
          <>
            <PrintButton />
            <Button
              variant="outline"
              className="print:hidden"
              onClick={() =>
                window.confirm(
                  "Lernplan verwerfen? Der Lernfortschritt bleibt erhalten.",
                ) && clear()
              }
            >
              <RotateCcw className="size-4" /> Neu planen
            </Button>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-5 pt-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Gesamtfortschritt
                {before > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    (davon {before} vor dem Neuverteilen)
                  </span>
                )}
              </span>
              <span className="font-mono tabular-nums">
                {doneCount + before}/{total + before}
              </span>
            </div>
            <Progress
              value={((doneCount + before) / Math.max(1, total + before)) * 100}
            />
          </div>
          <PlanStatusPanel view={view} />
        </CardContent>
      </Card>
      {plan.tooDense && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>
            Der Plan ist dichter als {settings.sessionsPerWeek} Einheiten pro
            Woche. Plane mehr Lerneinheiten oder einen späteren Prüfungstermin
            ein.
          </span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.weeks.map((w) => {
          const open = w.items.filter((i) => !done(i)).length;
          const isCurrent = w.index === current;
          return (
            <Card
              key={w.index}
              className={cn(
                "break-inside-avoid",
                isCurrent && "ring-2 ring-primary",
              )}
              aria-current={isCurrent ? "date" : undefined}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Woche {w.index + 1}
                  </CardTitle>
                  {isCurrent ? (
                    <Badge>Diese Woche</Badge>
                  ) : open === 0 && w.items.length > 0 ? (
                    <Badge variant="success">Erledigt</Badge>
                  ) : null}
                </div>
                <CardDescription>ab {formatDate(w.start)}</CardDescription>
              </CardHeader>
              <CardContent>
                {w.items.length ? (
                  <ul className="space-y-0.5">
                    {w.items.map((i) => (
                      <PlanItemRow key={i.id} item={i} done={done(i)} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Puffer – Wiederholen nach Bedarf.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Erledigt-Status: Lektionen über „Lektion abgeschlossen“, Begriffe über
        „gelernt“ im Glossar, Wiederholung über einen Übungsdurchgang und
        Probeprüfungen der gewählten Stufe ab Planbeginn.
      </p>
    </div>
  );
}
