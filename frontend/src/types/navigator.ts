export interface HeadingNode {
  id: string;
  text: string;
  level: number;
  index: number; // Global index in flat array
  children: HeadingNode[];
  parentId?: string;
}

export interface ReadingStats {
  activeId: string | null;
  progress: number; // 0 to 100
  completedIds: Set<string>;
}
