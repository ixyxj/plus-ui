export interface CategoryTreeVO {
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
  children: CategoryTreeVO[];
}

export interface CategoryVO {
  /**
   * 主键
   */
  categoryId: string | number;

  /**
   * 父级id
   */
  parentId: string | number;

  /**
   * 父类别名称
   */
  parentName: string;

  /**
   * 祖级列表
   */
  ancestors: string;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 显示顺序
   */
  orderNum: number;

  /**
   * 流程分类状态（0正常 1停用）
   */
  status: number;

  children: CategoryVO[];

}

export interface CategoryForm extends BaseEntity {
  /**
   * 主键
   */
  categoryId?: string | number;

  /**
   * 父级id
   */
  parentId: string | number;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 排序
   */
  orderNum?: number;

  /**
   * 流程分类状态（0正常 1停用）
   */
  status: number;

}

export interface CategoryQuery extends PageQuery {
  /**
   * 分类名称
   */
  categoryName?: string;
}
