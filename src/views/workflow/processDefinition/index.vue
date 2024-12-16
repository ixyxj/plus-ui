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
                <el-form-item label="流程定义名称" prop="flowName">
                  <el-input v-model="queryParams.flowName" placeholder="请输入流程定义名称" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="流程定义KEY" prop="flowCode">
                  <el-input v-model="queryParams.flowCode" placeholder="请输入流程定义KEY" clearable @keyup.enter="handleQuery" />
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
              <el-col :span="1.5">
                <el-button type="primary" icon="Plus" @click="handleAdd()">添加</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="primary" icon="UploadFilled" @click="uploadDialog.visible = true">部署流程文件</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" icon="Download" :disabled="single" @click="handleExportDef">导出</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" border :data="processDefinitionList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column align="center" prop="id" label="主键" v-if="true" ></el-table-column>
            <el-table-column align="center" prop="flowName" label="流程定义名称" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column align="center" prop="flowCode" label="标识KEY" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column align="center" prop="version" label="版本号" width="80">
              <template #default="scope"> v{{ scope.row.version }}.0</template>
            </el-table-column>
            <el-table-column align="center" prop="isPublish" label="状态" width="130">
              <template #default="scope">
                <el-tag v-if="scope.row.activityStatus == 0" type="danger">挂起</el-tag>
                <el-tag v-else-if="scope.row.activityStatus == 1" type="success">激活</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="isPublish" label="发布状态" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.isPublish == 0" type="danger">未发布</el-tag>
                <el-tag v-else-if="scope.row.isPublish == 1" type="success">已发布</el-tag>
                <el-tag v-else type="danger">失效</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="245" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      :icon="scope.row.activityStatus == 0 ? 'Lock' : 'Unlock'"
                      @click="handleProcessDefState(scope.row)"
                    >
                      {{ scope.row.activityStatus == 0 ? '激活流程' : '挂起流程' }}
                    </el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      icon="Document"
                      @click="getProcessDefinitionHitoryList(scope.row.id, scope.row.flowCode)"
                    >
                      历史版本
                    </el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" size="small" icon="Delete" @click="handleDelete(scope.row)">删除流程</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button link type="primary" v-if="scope.row.isPublish === 0" icon="Pointer" size="small" @click="design(scope.row)"
                      >流程设计</el-button
                    >
                    <el-button link type="primary" v-else icon="View" size="small" @click="designView(scope.row)">查看流程</el-button>
                  </el-col>
                  <el-col v-if="scope.row.isPublish !== 1" :span="1.5">
                    <el-button link type="primary" size="small" icon="CircleCheck" @click="handlePublish(scope.row)">发布流程</el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" size="small" icon="CopyDocument" @click="handleCopyDef(scope.row)">复制流程</el-button>
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

    <!-- 部署文件 -->
    <el-dialog v-if="uploadDialog.visible" v-model="uploadDialog.visible" :title="uploadDialog.title" width="30%">
      <div v-loading="uploadDialogLoading">
        <div class="mb5">
          <el-text class="mx-1" size="large"><span class="text-danger">*</span>请选择部署流程分类：</el-text>
          <el-tree-select
            v-model="selectCategory"
            :data="categoryOptions"
            :props="{ value: 'id', label: 'categoryName', children: 'children' }"
            filterable
            value-key="id"
            :render-after-expand="false"
            check-strictly
            style="width: 240px"
          />
        </div>
        <el-upload
          class="upload-demo"
          drag
          multiple
          accept="application/zip,application/xml,.bpmn"
          :before-upload="handlerBeforeUpload"
          :http-request="handlerImportDefinition"
        >
          <el-icon class="UploadFilled"><upload-filled /></el-icon>
          <div class="el-upload__text"><em>点击上传，选择BPMN流程文件</em></div>
          <div class="el-upload__text">仅支持 .zip、.bpmn20.xml、bpmn 格式文件</div>
          <div class="el-upload__text">PS:如若部署请部署从本项目模型管理导出的数据</div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- 历史版本 -->
    <el-dialog v-if="processDefinitionDialog.visible" v-model="processDefinitionDialog.visible" :title="processDefinitionDialog.title" width="70%">
      <el-table v-loading="loading" border :data="processDefinitionHistoryList">
        <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
        <el-table-column align="center" prop="flowName" label="流程定义名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column align="center" prop="flowCode" label="标识KEY"></el-table-column>
        <el-table-column align="center" prop="version" label="版本号" width="90">
          <template #default="scope"> v{{ scope.row.version }}.0</template>
        </el-table-column>
        <el-table-column align="center" prop="isPublish" label="挂起/激活" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.activityStatus == 0" type="danger">挂起</el-tag>
            <el-tag v-else-if="scope.row.activityStatus == 1" type="success">激活</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="isPublish" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isPublish == 0" type="danger">未发布</el-tag>
            <el-tag v-else-if="scope.row.isPublish == 1" type="success">已发布</el-tag>
            <el-tag v-else type="danger">失效</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="245" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  link
                  type="primary"
                  size="small"
                  :icon="!scope.row.activityStatus ? 'Lock' : 'Unlock'"
                  @click="handleProcessDefState(scope.row)"
                >
                  {{ scope.row.activityStatus ? '挂起流程' : '激活流程' }}
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button link type="primary" icon="Delete" size="small" @click="handleDelete(scope.row)">删除流程</el-button>
              </el-col>
              <el-col v-if="scope.row.isPublish === 0" :span="1.5">
                <el-button link type="primary" icon="Pointer" size="small" @click="design(scope.row)">流程设计</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button link type="primary" size="small" icon="CopyDocument" @click="handleCopyDef(scope.row)">复制流程</el-button>
              </el-col>
              <el-col v-if="scope.row.isPublish !== 1" :span="1.5">
                <el-button link type="primary" size="small" icon="CircleCheck" @click="handlePublish(scope.row)">发布流程</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新增/编辑流程定义 -->
    <el-dialog v-model="modelDialog.visible" :title="modelDialog.title" width="650px" append-to-body :close-on-click-modal="false">
      <template #footer>
        <el-form ref="defFormRef" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="流程类别" prop="category">
            <el-tree-select
              v-model="form.category"
              :data="categoryOptions"
              :props="{ value: 'id', label: 'categoryName', children: 'children' }"
              filterable
              value-key="id"
              :render-after-expand="false"
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="流程编码" prop="flowCode">
            <el-input v-model="form.flowCode" placeholder="请输入流程编码" maxlength="40" show-word-limit />
          </el-form-item>
          <el-form-item label="流程名称" prop="flowName">
            <el-input v-model="form.flowName" placeholder="请输入流程名称" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="表单路径" prop="flowName">
            <el-input v-model="form.formPath" placeholder="请输入表单路径" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="modelDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="processDefinition">
import { listDefinition, deleteDefinition, active, importDef, getHisListByKey, publish, add, edit, getInfo, copy } from '@/api/workflow/definition';
import { listCategory } from '@/api/workflow/category';
import { CategoryVO } from '@/api/workflow/category/types';
import { FlowDefinitionQuery, FlowDefinitionVo, FlowDefinitionForm } from '@/api/workflow/definition/types';
import { UploadRequestOptions } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref<ElTreeInstance>();

type CategoryOption = {
  id: string;
  categoryName: string;
  children?: CategoryOption[];
};

const loading = ref(true);
const ids = ref<Array<any>>([]);
const flowCodeList = ref<Array<any>>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const uploadDialogLoading = ref(false);
const processDefinitionList = ref<FlowDefinitionVo[]>([]);
const processDefinitionHistoryList = ref<FlowDefinitionVo[]>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');
/** 部署文件分类选择 */
const selectCategory = ref();
const defFormRef = ref<ElFormInstance>();

const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: '部署流程文件'
});

const processDefinitionDialog = reactive<DialogOption>({
  visible: false,
  title: '历史版本'
});

const modelDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 查询参数
const queryParams = ref<FlowDefinitionQuery>({
  pageNum: 1,
  pageSize: 10,
  flowName: undefined,
  flowCode: undefined,
  category: undefined
});
const rules = {
  category: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  flowName: [{ required: true, message: '流程定义名称不能为空', trigger: 'blur' }],
  flowCode: [{ required: true, message: '流程定义编码不能为空', trigger: 'blur' }]
};
const initFormData: FlowDefinitionForm = {
  id: '',
  flowName: '',
  flowCode: '',
  category: '',
  formPath: ''
};
//流程定义参数
const form = ref<FlowDefinitionForm>({
  id: '',
  flowName: '',
  flowCode: '',
  category: '',
  formPath: ''
});
onMounted(() => {
  getList();
  getTreeselect();
});

/** 节点单击事件 */
const handleNodeClick = (data: CategoryVO) => {
  queryParams.value.category = data.id;
  if (data.id === '0') {
    queryParams.value.category = '';
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
  const data: CategoryOption = { id: '0', categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryOption>(res.data, 'id', 'parentId');
  categoryOptions.value.push(data);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.category = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};
// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  flowCodeList.value = selection.map((item: any) => item.flowCode);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//分页
const getList = async () => {
  loading.value = true;
  const resp = await listDefinition(queryParams.value);
  processDefinitionList.value = resp.rows;
  total.value = resp.total;
  loading.value = false;
};
//获取历史流程定义
const getProcessDefinitionHitoryList = async (id: string, key: string) => {
  processDefinitionDialog.visible = true;
  loading.value = true;
  const resp = await getHisListByKey(key);
  if (resp.data && resp.data.length > 0) {
    processDefinitionHistoryList.value = resp.data.filter((item: any) => item.id !== id);
  }
  loading.value = false;
};

/** 删除按钮操作 */
const handleDelete = async (row?: FlowDefinitionVo) => {
  const id = row?.id || ids.value;
  const defList = processDefinitionList.value.filter((x) => id.indexOf(x.id) != -1).map((x) => x.flowCode)
  await proxy?.$modal.confirm('是否确认删除流程定义KEY为【' + defList + '】的数据项？');
  loading.value = true;
  await deleteDefinition(id).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 发布流程定义 */
const handlePublish = async (row?: FlowDefinitionVo) => {
  await proxy?.$modal.confirm(
    '是否确认发布流程定义KEY为【' + row.flowCode + '】版本为【' + row.version + '】的数据项？，发布后会将已发布流程定义改为失效！'
  );
  loading.value = true;
  await publish(row.id).finally(() => (loading.value = false));
  processDefinitionDialog.visible = false;
  await getList();
  proxy?.$modal.msgSuccess('发布成功');
};
/** 挂起/激活 */
const handleProcessDefState = async (row: FlowDefinitionVo) => {
  let msg: string;
  if (row.activityStatus == 1) {
    msg = `暂停后，此流程下的所有任务都不允许往后流转，您确定挂起【${row.flowName || row.flowCode}】吗？`;
  } else {
    msg = `启动后，此流程下的所有任务都允许往后流转，您确定激活【${row.flowName || row.flowCode}】吗？`;
  }
  await proxy?.$modal.confirm(msg);
  loading.value = true;
  await active(row.id, row.activityStatus == 0).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('操作成功');
};

//上传文件前的钩子
const handlerBeforeUpload = () => {
  if (selectCategory.value === 'ALL') {
    proxy?.$modal.msgError('顶级节点不可作为分类！');
    return false;
  }
  if (!selectCategory.value) {
    proxy?.$modal.msgError('请选择左侧要上传的分类！');
    return false;
  }
};
//部署文件
const handlerImportDefinition = (data: UploadRequestOptions): XMLHttpRequest => {
  let formData = new FormData();
  uploadDialogLoading.value = true;
  formData.append('file', data.file);
  formData.append('category', selectCategory.value);
  importDef(formData)
    .then(() => {
      uploadDialog.visible = false;
      proxy?.$modal.msgSuccess('部署成功');
      handleQuery();
    })
    .finally(() => {
      uploadDialogLoading.value = false;
    });
  return;
};
/**
 * 设计流程
 * @param row
 */
const design = async (row: FlowDefinitionVo) => {
  proxy.$router.push({
    path: `/workflow/design/index`,
    query: {
      definitionId: row.id,
      disabled: false
    }
  });
};

/**
 * 查看流程
 * @param row
 */
const designView = async (row: FlowDefinitionVo) => {
  proxy.$router.push({
    path: `/workflow/design/index`,
    query: {
      definitionId: row.id,
      disabled: true
    }
  });
};
/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  defFormRef.value?.resetFields();
};
/**
 * 新增
 */
const handleAdd = async () => {
  reset();
  modelDialog.visible = true;
  modelDialog.title = '新增流程';
};
/** 修改按钮操作 */
const handleUpdate = async (row?: FlowDefinitionVo) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getInfo(id);
  Object.assign(form.value, res.data);
  modelDialog.visible = true;
  modelDialog.title = '修改流程';
};

const handleSubmit = async () => {
  defFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      form.value.id ? await edit(form.value) : await add(form.value);
      proxy?.$modal.msgSuccess('操作成功');
      modelDialog.visible = false;
      getList();
    }
  });
};
//复制
const handleCopyDef = async (row: FlowDefinitionVo) => {
  ElMessageBox.confirm(`是否确认复制【${row.flowCode}】版本为${row.version}】的流程定义！`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    copy(row.id).then((resp) => {
      if (resp.code === 200) {
        proxy?.$modal.msgSuccess('操作成功');
        getList();
      }
    });
  });
};

/** 导出按钮操作 */
const handleExportDef = () => {
  proxy?.download(`/workflow/definition/exportDef/${ids.value[0]}`, {}, `${flowCodeList.value[0]}.xml`);
};
</script>
