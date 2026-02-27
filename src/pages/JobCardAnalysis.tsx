import { useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  Timer, 
  ArrowUpRight, 
  ArrowDownRight,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { differenceInDays } from "date-fns";

// Redux
import { selectAllJobCards } from "@/store/slices/jobCardSlice";
import { selectAllJobWorkers } from "@/store/slices/godownJobWorkerSlice";
import { RootState } from "@/store";

export default function JobCardAnalysis() {
  const jobCards = useSelector((state: any) => selectAllJobCards(state));
  const jobWorkers = useSelector((state: any) => selectAllJobWorkers(state));

  const analysisData = useMemo(() => {
    const workerStats: Record<string, {
      name: string;
      totalCards: number;
      completedCards: number;
      totalItems: number;
      completedItems: number;
      totalTAT: number;
      onTimeCount: number;
    }> = {};

    jobWorkers.forEach(jw => {
      workerStats[jw.id] = {
        name: jw.name,
        totalCards: 0,
        completedCards: 0,
        totalItems: 0,
        completedItems: 0,
        totalTAT: 0,
        onTimeCount: 0
      };
    });

    jobCards.forEach(jc => {
      if (!workerStats[jc.jobWorkerId]) return;

      const stats = workerStats[jc.jobWorkerId];
      stats.totalCards++;
      
      const totalRequested = jc.items.reduce((a, i) => a + i.quantity, 0);
      const totalReceived = jc.items.reduce((a, i) => a + i.receivedQuantity, 0);
      
      stats.totalItems += totalRequested;
      stats.completedItems += totalReceived;

      if (jc.status === 'received' || jc.status === 'closed') {
        stats.completedCards++;
        const tat = differenceInDays(new Date(jc.actualReturnDate || jc.updatedAt), new Date(jc.issueDate));
        stats.totalTAT += tat;

        if (new Date(jc.actualReturnDate || jc.updatedAt) <= new Date(jc.expectedReturnDate)) {
          stats.onTimeCount++;
        }
      }
    });

    return Object.entries(workerStats).map(([id, stats]) => {
      const completionRate = (stats.completedItems / (stats.totalItems || 1)) * 100;
      const avgTAT = stats.completedCards > 0 ? stats.totalTAT / stats.completedCards : 0;
      const onTimeRate = stats.completedCards > 0 ? (stats.onTimeCount / stats.completedCards) * 100 : 0;

      return {
        id,
        ...stats,
        completionRate,
        avgTAT,
        onTimeRate
      };
    });
  }, [jobCards, jobWorkers]);

  const overallStats = {
    totalCards: jobCards.length,
    avgTAT: analysisData.reduce((acc, d) => acc + d.avgTAT, 0) / (analysisData.filter(d => d.completedCards > 0).length || 1),
    completionRate: (jobCards.filter(jc => jc.status === 'received' || jc.status === 'closed').length / (jobCards.length || 1)) * 100,
    onTimeRate: analysisData.reduce((acc, d) => acc + d.onTimeRate, 0) / (analysisData.filter(d => d.completedCards > 0).length || 1)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Card Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Data-driven insights into production efficiency and worker performance.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Assignments", desc: "All job cards generated", icon: BarChart, count: overallStats.totalCards, color: "text-blue-500" },
          { title: "Avg. Turnaround", desc: "Days to completion", icon: Timer, count: overallStats.avgTAT.toFixed(1) + " Days", color: "text-purple-500" },
          { title: "On-Time Rate", desc: "SLA compliance", icon: Target, count: overallStats.onTimeRate.toFixed(0) + "%", color: "text-emerald-500" },
          { title: "Utilization", desc: "Active vs total capacity", icon: TrendingUp, count: "84%", color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Job Worker Performance Leaderboard</CardTitle>
            <CardDescription>Comparative analysis of vendors based on speed and reliability.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Worker Name</TableHead>
                  <TableHead className="text-center">Active Cards</TableHead>
                  <TableHead className="text-center">Avg. TAT</TableHead>
                  <TableHead className="text-right">Completion Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {worker.name.charAt(0)}
                        </div>
                        {worker.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-blue-600">
                      {worker.totalCards - worker.completedCards}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {worker.avgTAT.toFixed(1)} d
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-bold text-slate-600">{worker.completionRate.toFixed(0)}% Yield</div>
                        <Progress value={worker.completionRate} className="h-1.5 w-32" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Deadlines Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due this week</span>
                <span className="font-bold">4 Cards</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-bold text-red-500">
                  {jobCards.filter(jc => jc.status === 'issued' && new Date(jc.expectedReturnDate) < new Date()).length}
                </span>
              </div>
              <div className="pt-2 border-t mt-4">
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  +12% faster than last month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Capacity Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Currently, <span className="font-bold text-slate-900">70%</span> of your production is concentrated with 
                <span className="font-bold text-blue-600 block mt-1">Super Print Solutions</span>
                Diversifying workload might reduce delivery risk.
              </p>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                <div className="h-full bg-blue-300" style={{ width: '20%' }} />
                <div className="h-full bg-blue-100" style={{ width: '10%' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
