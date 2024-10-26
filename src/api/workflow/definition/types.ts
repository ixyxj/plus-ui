import { DefinitionConfigVO } from '@/api/workflow/definitionConfig/types';
export interface FlowDefinitionQuery extends PageQuery {
  key?: string;
  name?: string;
  categoryCode?: string;
  isPublish?: number;
}

export interface FlowDefinitionVo extends BaseEntity {
  id: string;
  flowName: string;
  flowCode: string;
  version: string;
  isPublish: number;
  activityStatus: boolean;
  createTime: Date;
  updateTime: Date;
  wfDefinitionConfigVo: DefinitionConfigVO;
}

export interface FlowDefinitionForm {
  flowName: string;
  flowCode: string;
  category: string;
}

export interface definitionXmlVO {
  xml: string[];
  xmlStr: string;
}
