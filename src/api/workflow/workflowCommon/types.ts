export interface RouterJumpVo {
  businessKey: string;
  taskId: string | number;
  type: string;
  formCustom: string;
  formPath: string;
}

export interface StartProcessBo {
  businessKey: string | number;
  flowCode: string;
  variables: any;
}
