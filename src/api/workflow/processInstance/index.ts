import request from '@/utils/request';
import { ProcessInstanceQuery, ProcessInstanceVO } from '@/api/workflow/processInstance/types';
import { AxiosPromise } from 'axios';

/**
 * 查询运行中实例列表
 * @param query
 * @returns {*}
 */
export const getPageByRunning = (query: ProcessInstanceQuery): AxiosPromise<ProcessInstanceVO[]> => {
  return request({
    url: '/workflow/processInstance/getPageByRunning',
    method: 'get',
    params: query
  });
};

/**
 * 查询已完成实例列表
 * @param query
 * @returns {*}
 */
export const getPageByFinish = (query: ProcessInstanceQuery): AxiosPromise<ProcessInstanceVO[]> => {
  return request({
    url: '/workflow/processInstance/getPageByFinish',
    method: 'get',
    params: query
  });
};

/**
 * 通过业务id获取历史流程图
 */
export const getFlowImage = (businessKey: string | number) => {
  return request({
    url: `/workflow/processInstance/getFlowImage/${businessKey}` + '?t' + Math.random(),
    method: 'get'
  });
};

/**
 * 分页查询当前登录人单据
 * @param query
 * @returns {*}
 */
export const getPageByCurrent = (query: ProcessInstanceQuery): AxiosPromise<ProcessInstanceVO[]> => {
  return request({
    url: '/workflow/processInstance/getPageByCurrent',
    method: 'get',
    params: query
  });
};

/**
 * 撤销流程
 * @param data 参数
 * @returns
 */
export const cancelProcessApply = (data: any) => {
  return request({
    url: `/workflow/processInstance/cancelProcessApply`,
    method: 'put',
    data: data
  });
};

/**
 * 获取流程变量
 * @param businessKey 业务id
 * @returns
 */
export const getInstanceVariable = (instanceId: string) => {
  return request({
    url: `/workflow/processInstance/getInstanceVariable/${instanceId}`,
    method: 'get'
  });
};

/**
 * 删除
 * @param instanceIds 流程实例id
 * @returns
 */
export const deleteByInstanceIds = (instanceIds: Array<string | number> | string | number) => {
  return request({
    url: `/workflow/processInstance/deleteByInstanceIds/${instanceIds}`,
    method: 'delete'
  });
};

export default {
  getPageByRunning,
  getPageByFinish,
  getFlowImage,
  getPageByCurrent,
  cancelProcessApply
};
