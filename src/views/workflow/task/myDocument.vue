<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 流程分类树 -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="categoryName" placeholder="请输入流程分类名" prefix-icon="Search" clearable />
          <el-tree
            ref="categoryTreeRef"
            class="mt-2"
            node-key="id"
            :data="categoryOptions"
            :props="{ label: 'categoryName', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          ></el-tree>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="120px">
                <el-form-item label="流程定义编码" prop="flowCode">
                  <el-input v-model="queryParams.flowCode" placeholder="请输入流程定义编码" @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>
        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10" class="mb8">
              <right-toolbar v-model:show-search="showSearch" @query-table="handleQuery"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" border :data="processInstanceList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
            <el-table-column v-if="false" align="center" prop="id" label="id"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="flowName" align="center" label="流程定义名称"> </el-table-column>
            <el-table-column align="center" prop="flowCode" label="流程定义KEY"></el-table-column>
            <el-table-column align="center" prop="version" label="版本号" width="90">
              <template #default="scope"> v{{ scope.row.version }}.0</template>
            </el-table-column>
            <el-table-column v-if="tab === 'running'" align="center" prop="isSuspended" label="状态" min-width="70">
              <template #default="scope">
                <el-tag v-if="!scope.row.isSuspended" type="success">激活</el-tag>
                <el-tag v-else type="danger">挂起</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="流程状态" min-width="70">
              <template #default="scope">
                <dict-tag :options="wf_business_status" :value="scope.row.flowStatus"></dict-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="createTime" label="启动时间" width="160"></el-table-column>
            <el-table-column label="操作" align="center" width="162">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'draft' || scope.row.flowStatus === 'cancel' || scope.row.flowStatus === 'back'">
                    <el-button type="primary" size="small" icon="Edit" @click="handleOpen(scope.row, 'update')">编辑</el-button>
                  </el-col>
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'draft' || scope.row.flowStatus === 'cancel' || scope.row.flowStatus === 'back'">
                    <el-button type="primary" size="small" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button type="primary" size="small" icon="View" @click="handleOpen(scope.row, 'view')">查看</el-button>
                  </el-col>
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'waiting'">
                    <el-button type="primary" size="small" icon="Notification" @click="handleCancelProcessApply(scope.row.businessId)"
                      >撤销</el-button
                    >
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" @submit-callback="getList" />
  </div>
</template>

<script lang="ts" setup>
import { getPageByCurrent, deleteByInstanceIds, cancelProcessApply } from '@/api/workflow/processInstance';
import { listCategory } from '@/api/workflow/category';
import { CategoryVO } from '@/api/workflow/category/types';
import { ProcessInstanceQuery, FlowInstanceVO } from '@/api/workflow/processInstance/types';
import workflowCommon from '@/api/workflow/workflowCommon';
import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const queryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref<ElTreeInstance>();

// 遮罩层
const loading = ref(true);
// 选中数组
const businessIds = ref<Array<number | string>>([]);
const instanceIds = ref<Array<number | string>>([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 模型定义表格数据
const processInstanceList = ref<FlowInstanceVO[]>([]);

const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');

interface CategoryOption {
  categoryCode: string;
  categoryName: string;
  children?: CategoryOption[];
}

const tab = ref('running');
// 查询参数
const queryParams = ref<ProcessInstanceQuery>({
  pageNum: 1,
  pageSize: 10,
  flowCode: undefined,
  categoryCode: undefined
});

onMounted(() => {
  getList();
  getTreeselect();
});

/** 节点单击事件 */
const handleNodeClick = (data: CategoryVO) => {
  queryParams.value.categoryCode = data.categoryCode;
  if (data.categoryCode === 'ALL') {
    queryParams.value.categoryCode = '';
  }
  handleQuery();
};
/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.categoryName.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watchEffect(
  () => {
    categoryTreeRef.value.filter(categoryName.value);
  },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/** 查询流程分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listCategory();
  categoryOptions.value = [];
  const data: CategoryOption = { categoryCode: 'ALL', categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryOption>(res.data, 'id', 'parentId');
  categoryOptions.value.push(data);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.categoryCode = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};
// 多选框选中数据
const handleSelectionChange = (selection: FlowInstanceVO[]) => {
  businessIds.value = selection.map((item: any) => item.businessId);
  instanceIds.value = selection.map((item: FlowInstanceVO) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//分页
const getList = () => {
  loading.value = true;
  getPageByCurrent(queryParams.value).then((resp) => {
    processInstanceList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};

/** 删除按钮操作 */
const handleDelete = async (row: FlowInstanceVO) => {
  const instanceIdList = row.id || instanceIds.value;
  await proxy?.$modal.confirm('是否确认删除？');
  loading.value = true;
  if ('running' === tab.value) {
    await deleteByInstanceIds(instanceIdList).finally(() => (loading.value = false));
    getList();
  }
  proxy?.$modal.msgSuccess('删除成功');
};

/** 撤销按钮操作 */
const handleCancelProcessApply = async (businessId: string) => {
  await proxy?.$modal.confirm('是否确认撤销当前单据？');
  loading.value = true;
  if ('running' === tab.value) {
    let data = {
      businessId: businessId,
      message: '撤销流程！'
    };
    await cancelProcessApply(data).finally(() => (loading.value = false));
    getList();
  }
  proxy?.$modal.msgSuccess('撤销成功');
};

//办理
const handleOpen = async (row, type) => {
  const routerJumpVo = reactive<RouterJumpVo>({
    wfDefinitionConfigVo: row.wfDefinitionConfigVo,
    wfNodeConfigVo: row.wfNodeConfigVo,
    businessKey: row.businessId,
    taskId: row.id,
    type: type
  });
  workflowCommon.routerJump(routerJumpVo, proxy);
};
</script>
