export interface Tree {
  tree: TreeNode
}

export interface TreeNode {
  label?: string
  children?: Array<TreeNode>
  path?: string
  prefix?: string
  url?: string
  isRaster?: boolean
}
