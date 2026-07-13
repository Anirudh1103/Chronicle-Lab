export interface HeadingNode {
  id: string;
  text: string;
  level: number;
  index: number;
  parentId?: string;
  type: string;
  children: HeadingNode[];
}
