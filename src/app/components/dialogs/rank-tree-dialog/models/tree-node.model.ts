export type TreeNodeType = 'rank' | 'task' | 'quiz';
export type TreeNodeStatus = 'released' | 'beta';

export interface TreeNode {
  id: number;
  module: any;
  task: any;
  name: string;
  release_status: TreeNodeStatus;
  type: TreeNodeType;
  children?: TreeNode[];
  valid?: boolean;
  [key: string]: unknown;
}

export type TreeNodeActionType = 'edit' | 'delete' | 'add' | 'content';

export interface TreeNodeAction {
  action: TreeNodeActionType;
  node: TreeNode | null;
  parent?: TreeNode | null;
}

export interface FlatTreeNode {
  expandable: boolean;
  name: string;
  type: TreeNodeType;
  level: number;
  original: TreeNode;
}
