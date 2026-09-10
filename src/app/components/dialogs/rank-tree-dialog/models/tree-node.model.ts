
// Formato genérico para qualquer nó da árvore (rank, task ou quiz).
// O índice [key: string] permite anexar campos extras vindos do backend
// (descrição, ordem, status, etc.) sem precisar mexer nessa interface.
export type TreeNodeType = 'rank' | 'task' | 'quiz';

export interface TreeNode {
  id: string;
  type: TreeNodeType;
  name: string;
  children?: TreeNode[];
  [key: string]: unknown;
}

export type TreeNodeActionType = 'edit' | 'delete' | 'add';

// Evento emitido pela dialog sempre que o usuário confirma uma ação
export interface TreeNodeAction {
  action: TreeNodeActionType;
  // Nó alvo da ação. Null quando action = 'add' na raiz (novo rank)
  node: TreeNode | null;
  // Preenchido só em 'add': nó pai onde o novo item vai entrar
  parent?: TreeNode | null;
}

// Nó "achatado" usado internamente pelo MatTree
export interface FlatTreeNode {
  expandable: boolean;
  name: string;
  type: TreeNodeType;
  level: number;
  original: TreeNode;
}
