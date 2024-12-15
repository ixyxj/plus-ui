export interface FlowDefinitionQuery extends PageQuery {
  flowCode?: string;
  flowName?: string;
  category: string;
  isPublish?: number;
}

export interface FlowDefinitionVo {
  id: string;
  flowName: string;
  flowCode: string;
  version: string;
  isPublish: number;
  activityStatus: number;
  createTime: Date;
  updateTime: Date;
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
