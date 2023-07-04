type Luxon = import('luxon').DateTime & import('luxon').DurationLike;
type DataViewFilter<T> = (item: T) => boolean;
type Moment = import('moment').Moment;

declare interface DataViewTask {
  completed: boolean;
  path: string;
  completion: Luxon;
  [key: string]: any;
  outlinks: DataViewPage['file'][];
}

declare interface DataViewList {
  parent?: DataViewList;
  text: string;
  [key: string]: any;
}

declare interface DataViewFile {
  lists: {
    children: Record<string, any>[];
  }[] & {
    where: (filterArg: DataViewFilter<DataViewList>) => DataViewList[];
  };
  day: Luxon;
  path: string;
  tasks: DataViewTask[] & {
    where: (filterArg: DataViewFilter<DataViewTask>) => DataViewTask[];
  };
  parent?: DataViewFile;
  frontmatter: Record<string, any>;
}
type HTMLElementMap = HTMLElementTagNameMap & SVGElementTagNameMap;
type El = {
  createEl: <T extends keyof HTMLElementMap>(el: T) => HTMLElementMap[T] & El;
};
type IterableData<T> = T[] & {
  where: (filterArg: DataViewFilter<T>) => T[];
};

declare interface DataViewPage {
  file: DataViewFile;
  [key: string]: any;
}

declare interface DataView {
  current: () => DataViewPage;
  paragraph: (content: string) => HTMLDivElement;
  container: HTMLDivElement & El;
  header: (level: number, content: string) => HTMLHeadElement;
  el: <T extends keyof HTMLElementTagNameMap>(
    key: T,
    content: string
  ) => HTMLElement;
  pages: (filePath?: string) => IterableData<DataViewPage> & {
    file: IterableData<DataViewFile>;
  };
  taskList: (tasks: DataViewTask[], groupByFile: boolean) => HTMLDivElement;
}
declare var dv: DataView;
// @ts-ignore
declare var moment: Moment;
