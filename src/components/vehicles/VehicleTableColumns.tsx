'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Vehicle } from '@prisma/client';
import { AlertTriangle, Fuel, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VehicleWithAlerts extends Vehicle {
  inspectionAlert?: boolean;
  insuranceAlert?: boolean;
  _count: {
    usageHistory: number;
  };
}

interface VehicleTableColumnsProps {
  selectedVehicleIds: Set<string>;
  onSelectVehicle: (vehicleId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allVehicles: VehicleWithAlerts[];
}

export function createVehicleTableColumns({
  selectedVehicleIds,
  onSelectVehicle,
  onSelectAll,
  allVehicles,
}: VehicleTableColumnsProps): ColumnDef<VehicleWithAlerts>[] {

  const formatFuelType = (fuelType: string) => {
    const fuelTypeMap = {
      gasoline: 'ガソリン',
      diesel: 'ディーゼル',
      electric: '電気',
      hybrid: 'ハイブリッド',
    };
    return fuelTypeMap[fuelType as keyof typeof fuelTypeMap] || fuelType;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ja-JP');
  };

  const getDaysUntilExpiry = (date: Date | string | null) => {
    if (!date) return null;
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            onSelectAll(!!value);
          }}
          aria-label="すべて選択"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedVehicleIds.has(row.original.id)}
          onCheckedChange={(value) => {
            onSelectVehicle(row.original.id, !!value);
          }}
          aria-label="行を選択"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: '車両名',
      cell: ({ row }) => {
        const vehicle = row.original;
        const hasAlerts = vehicle.inspectionAlert || vehicle.insuranceAlert;
        
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{vehicle.name}</div>
            {hasAlerts && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    {vehicle.inspectionAlert && <div>車検期限が近づいています</div>}
                    {vehicle.insuranceAlert && <div>保険期限が近づいています</div>}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'licensePlate',
      header: 'ナンバープレート',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium bg-gray-100 px-2 py-1 rounded">
          {row.getValue('licensePlate')}
        </div>
      ),
    },
    {
      accessorKey: 'model',
      header: '車種',
      cell: ({ row }) => {
        const model = row.getValue('model') as string;
        const manufacturer = row.original.manufacturer;
        
        return (
          <div className="text-sm">
            {manufacturer && <div className="text-gray-500">{manufacturer}</div>}
            <div>{model || '-'}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'fuelType',
      header: '燃料',
      cell: ({ row }) => {
        const fuelType = row.getValue('fuelType') as string;
        const fuelIcon = {
          gasoline: <Fuel className="h-3 w-3" />,
          diesel: <Fuel className="h-3 w-3" />,
          electric: '⚡',
          hybrid: '🔋',
        };
        
        return (
          <div className="flex items-center gap-1">
            {fuelIcon[fuelType as keyof typeof fuelIcon]}
            <span className="text-sm">{formatFuelType(fuelType)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'capacity',
      header: '定員',
      cell: ({ row }) => {
        const capacity = row.getValue('capacity') as number;
        return capacity ? (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{capacity}人</span>
          </div>
        ) : '-';
      },
    },
    {
      accessorKey: 'inspectionDate',
      header: '車検満了日',
      cell: ({ row }) => {
        const inspectionDate = row.getValue('inspectionDate') as Date | null;
        const daysUntil = getDaysUntilExpiry(inspectionDate);
        
        if (!inspectionDate) return '-';
        
        let badgeVariant: 'default' | 'destructive' | 'secondary' = 'default';
        let badgeText = '';
        
        if (daysUntil !== null) {
          if (daysUntil < 0) {
            badgeVariant = 'destructive';
            badgeText = '期限切れ';
          } else if (daysUntil <= 30) {
            badgeVariant = 'destructive';
            badgeText = `${daysUntil}日後`;
          } else if (daysUntil <= 90) {
            badgeVariant = 'secondary';
            badgeText = `${daysUntil}日後`;
          }
        }
        
        return (
          <div className="space-y-1">
            <div className="text-sm">{formatDate(inspectionDate)}</div>
            {badgeText && (
              <Badge variant={badgeVariant} className="text-xs">
                {badgeText}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'usageCount',
      header: '使用回数',
      cell: ({ row }) => {
        const count = row.original._count.usageHistory;
        return (
          <div className="text-sm text-center">
            {count}回
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'ステータス',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'アクティブ' : '非アクティブ'}
          </Badge>
        );
      },
    },
  ];
}