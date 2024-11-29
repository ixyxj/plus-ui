import request from '@/utils/request';
import { FlowDefinitionQuery, FlowDefinitionVo, definitionXmlVO, FlowDefinitionForm } from '@/api/workflow/definition/types';
import { AxiosPromise } from 'axios';

/**
 * 获取流程定义列表
 * @param query 流程实例id
 * @returns
 */
export const listDefinition = (query: FlowDefinitionQuery): AxiosPromise<FlowDefinitionQuery[]> => {
  return request({
    url: `/workflow/definition/list`,
    method: 'get',
    params: query
  });
};
/**
 * 按照流程定义key获取流程定义
 * @param flowCode 流程编码
 * @returns
 */
export const getHisListByKey = (flowCode: string) => {
  return request({
    url: `/workflow/definition/getHisListByKey/${flowCode}`,
    method: 'get'
  });
};

/**
 * 通过流程定义id获取xml
 * @param definitionId 流程定义id
 * @returns
 */
export const definitionXml = (definitionId: string): AxiosPromise<definitionXmlVO> => {
  return request({
    url: `/workflow/definition/definitionXml/${definitionId}`,
    method: 'get'
  });
};

/**
 * 删除流程定义
 * @param id 流程定义id
 * @returns
 */
export const deleteDefinition = (id: string | string[]) => {
  return request({
    url: `/workflow/definition/${id}`,
    method: 'delete'
  });
};

/**
 * 挂起/激活
 * @param definitionId 流程定义id
 * @returns
 */
export const updateDefinitionState = (definitionId: string, activityStatus: boolean) => {
  return request({
    url: `/workflow/definition/updateDefinitionState/${definitionId}/${activityStatus}`,
    method: 'put'
  });
};

/**
 * 通过zip或xml部署流程定义
 * @returns
 */
export function importDefinition(data: any) {
  return request({
    url: '/workflow/definition/importDefinition',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
}

/**
 * 发布流程定义
 * @param id 流程定义id
 * @returns
 */
export const publish = (id: string) => {
  return request({
    url: `/workflow/definition/publish/${id}`,
    method: 'put'
  });
};

/**
 * 取消发布流程定义
 * @param id 流程定义id
 * @returns
 */
export const unPublish = (id: string) => {
  return request({
    url: `/workflow/definition/unPublish/${id}`,
    method: 'put'
  });
};

/**
 * 获取流程定义xml字符串
 * @param id 流程定义id
 * @returns
 */
export const xmlString = (id: string) => {
  return request({
    url: `/workflow/definition/xmlString/${id}`,
    method: 'get'
  });
};

/**
 * 新增
 * @param data 参数
 * @returns
 */
export const add = (data: FlowDefinitionForm) => {
  return request({
    url: `/workflow/definition`,
    method: 'post',
    data: data
  });
};

/**
 * 复制流程定义
 * @param id 流程定义id
 * @returns
 */
export const copyDef = (id: string) => {
  return request({
    url: `/workflow/definition/copyDef/${id}`,
    method: 'post'
  });
};
