import { DefinitionConfigVO } from '@/api/workflow/definitionConfig/types';
export interface FlowDefinitionQuery extends PageQuery {
  flowCode?: string;
  flowName?: string;
  categoryCode?: string;
  isPublish?: number;
}

export interface FlowDefinitionVo {
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
