import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';

export default {
  routerJump(routerJumpVo: RouterJumpVo, proxy) {
    proxy.$tab.closePage(proxy.$route);
    console.log(routerJumpVo);
    proxy.$router.push({
      path: routerJumpVo.formPath,
      query: {
        id: routerJumpVo.businessId,
        type: routerJumpVo.type,
        taskId: routerJumpVo.taskId
      }
    });
  }
};
