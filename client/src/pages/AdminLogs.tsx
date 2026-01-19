import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { logsApi } from '@/services/api';
import { LogEntry, LogSeverity, LogStatus } from '@/types';
import type { LogAction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const statusStyles: Record<LogStatus, string> = {
  success: 'bg-success/10 text-success border-success/20',
  failure: 'bg-destructive/10 text-destructive border-destructive/20',
};

const severityStyles: Record<LogSeverity, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive text-destructive-foreground border-destructive',
};

const ACTION_OPTIONS: LogAction[] = ['login', 'logout', 'create', 'update', 'delete', 'approve'];
const SEVERITY_OPTIONS: LogSeverity[] = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS: LogStatus[] = ['success', 'failure'];

const PAGE_SIZE = 25;

function buildPaginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: Array<number | 'ellipsis'> = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) {
      items.push('ellipsis');
    }
    items.push(page);
    previous = page;
  }

  return items;
}

export default function AdminLogs() {
  const { hasRole } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingFilters, setPendingFilters] = useState<{
    actions: LogAction[];
    severities: LogSeverity[];
    statuses: LogStatus[];
  }>({
    actions: [],
    severities: [],
    statuses: [],
  });
  const [appliedFilters, setAppliedFilters] = useState<{
    actions: LogAction[];
    severities: LogSeverity[];
    statuses: LogStatus[];
  }>({
    actions: [],
    severities: [],
    statuses: [],
  });

  if (!hasRole('admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleFilterValue = <T extends string>(values: T[], value: T): T[] =>
    values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

  const applyFilters = () => {
    setAppliedFilters({
      actions: [...pendingFilters.actions],
      severities: [...pendingFilters.severities],
      statuses: [...pendingFilters.statuses],
    });
    setPage(1);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await logsApi.getPage(page, PAGE_SIZE, appliedFilters);
        setLogs(response.items);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setLogs([]);
        setTotalPages(0);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, appliedFilters]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginationItems = useMemo(() => buildPaginationItems(page, totalPages), [page, totalPages]);

  return (
    <MainLayout title="System Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Review system activity logs with pagination for performance
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Action</DropdownMenuLabel>
                {ACTION_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={`action-${option}`}
                    checked={pendingFilters.actions.includes(option)}
                    onCheckedChange={() => {
                      setPendingFilters((current) => ({
                        ...current,
                        actions: toggleFilterValue(current.actions, option),
                      }));
                    }}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Severity</DropdownMenuLabel>
                {SEVERITY_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={`severity-${option}`}
                    checked={pendingFilters.severities.includes(option)}
                    onCheckedChange={() => {
                      setPendingFilters((current) => ({
                        ...current,
                        severities: toggleFilterValue(current.severities, option),
                      }));
                    }}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={`status-${option}`}
                    checked={pendingFilters.statuses.includes(option)}
                    onCheckedChange={() => {
                      setPendingFilters((current) => ({
                        ...current,
                        statuses: toggleFilterValue(current.statuses, option),
                      }));
                    }}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <Button className="w-full" size="sm" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="secondary">
              {totalCount} log(s)
            </Badge>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Showing page {totalPages === 0 ? 0 : page} of {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No logs found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={log.aiAlert ? 'bg-destructive/10 border-l-4 border-destructive/40' : undefined}
                    >
                      <TableCell className="text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell className="break-all">
                        {log.userId || 'System'}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize break-words">
                        {log.userRole ? log.userRole.replace('_', ' ') : 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize break-words">{log.action}</TableCell>
                      <TableCell className="capitalize break-words">{log.resource}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[log.status]}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={severityStyles[log.severity]}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground break-words">
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-normal break-words">
                        {log.description || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (page > 1) {
                            setPage(page - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    {paginationItems.map((item, index) => (
                      <PaginationItem key={`${item}-${index}`}>
                        {item === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={item === page}
                            onClick={(event) => {
                              event.preventDefault();
                              if (item !== page) {
                                setPage(item);
                              }
                            }}
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (page < totalPages) {
                            setPage(page + 1);
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
