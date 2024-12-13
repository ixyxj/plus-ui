import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';

export default {
  routerJump(routerJumpVo: RouterJumpVo, proxy) {
    proxy.$tab.closePage(proxy.$route);
    console.log(routerJumpVo);
    proxy.$router.push({
      path: `/workflow/leaveEdit/index`,
      query: {
        id: routerJumpVo.businessKey,
        type: routerJumpVo.type,
        taskId: routerJumpVo.taskId
      }
    });
  }
};
