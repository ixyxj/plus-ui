import { FlowTaskVO } from '@/api/workflow/task/types';

export interface FlowInstanceQuery extends PageQuery {
  categoryCode?: string;
  nodeName?: string;
  flowCode?: string;
  flowName?: string;
  createByIds?: string[] | number[];
  businessId?: string;
}

export interface FlowInstanceVO extends BaseEntity {
  id: string | number;
  definitionId: string;
  flowName: string;
  flowCode: string;
  version: string;
  businessId: string;
  activityStatus?: any;
  tenantId: string;
  createTime: string;
  createBy: string;
  flowStatus: string;
  flowStatusName: string;
  flowTaskList: FlowTaskVO[];
}