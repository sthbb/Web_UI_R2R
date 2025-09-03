const baseTableProps =  {
  border: true, //是否带有边框
  round: true, //是否带有圆角
  keepSource: true, //某一些操作 查看是否带有原始数据
  stripe: false, //是否展示斑马线
  // showOverflow: true, //一行显示文本  超出显示省略号
  autoResize: true, //table自适应
  resizable: true, //所有的列是否允许拖动列宽调整大小
  highlightHoverRow: true, //鼠标移到行是否要高亮显示
  highlightCurrentRow: false, //是否要高亮当前行,
  align: "center",
  ref: "xTable",
  id:'id',
  exportTitle:'',
  showTableOpe:true,
  seqConfig: { //序号配置
    startIndex: 0,
  },
  tooltipConfig: { //tooltip 配置项
    enterable: true, // 鼠标是否可进入到 tooltip 中
    showAll: false, //所有单元格开启 tooltip 显示
  },
  expandConfig:{ //展开控制
    accordion: true // 每次只展开一个
  },
  editConfig: { //编辑配置
    trigger: "manual", //触发编辑类型
    mode: "row", //什么方式来触发编辑
    showStatus: true, //编辑是否保留之前的状态
    autoClear: false, //是否可以清除编辑
    showUpdateStatus: true, //是否显示单元格修改状态  只对 keep-source有效
    showAsterisk: true, //是否显示必填字段的红色星号
  },
  checkboxConfig: { //checkbox配置
    checkRowKeys: [], //默认勾选指定行的id
    showHeader: true, //是否显示全选按钮
    checkMethod: () => {
      //是否允许勾选的方法
      return true
    },
    checkField: "id", //复选框显示的字段名，可以直接显示在复选框中
    reserve: true, //是否保留勾选状态 与 row-id 搭配使用
    highlight: false, //高亮勾选行
    range: true, //开启复选框范围选择功能（启用后通过鼠标在复选框的列内滑动选中或取消指定行）
    strict: true,
  },
  radioConfig: {}, //radio 配置
  printConfig: {}, //打印配置,
  exportConfig: { //导出配置
    remote: false, //是否服务端导出
    exportMethod: () => {}, //导出方法
    types: ["csv", "html", "xml", "txt"], //导出文件方式设定
    modes: ["current", "selected", "all"], //导出文件方式
  },
  importConfig: { //导入配置
    remote: false, //是否服务端导入
    importMethod: () => {}, //导入方法
    types: ["xlsx"], //导入文件方式设定
    modes: ["insert"], //导入文件方式
  },
  toolbarConfig: { //table上面的操作
    import: false, //导入 设置对象 可自定义图标
    export: false, //导出
    print: false, //打印
    zoom: true, //全屏  不支持全屏功能
    custom: false, //自定义搜索,
    buttons: [ //自定义button
      { code: "add", name: 'btn_add', icon: "fa fa-plus", status: "primary"},
      { code: "delete", name: 'btn_delete', icon: "fa fa-trash-o" },
      { code: "save", name: 'btn_save', icon: "fa fa-save" },
    ],
    refresh:false,
    // refresh: { //刷新
    //   query: ()=> { this.handlePageChange({PAGE_SIZE:10,PAGE_NUM:1})}
    // },
  },
  sortConfig: { //排序配置
    trigger: "cell", //触发方式
    // sortMethod: (column,sortBy) => {this.toSort(column.COL_NAME,sortBy)}, //排序方法，
    iconAsc: "", //自定义升序的图标
    iconDesc: "", //自定义降序的图标
  },
  pagerConfig: { //筛选配置项
    TOTAL: 0,
    PAGE_NUM: 1,
    PAGE_SIZE: 10,
    align: "right",
    pageSizes: [10, 20, 30, 40, 50,100],
    layout: 'total, sizes, prev, pager, next, jumper',
    PAGINATION:false
  }
}
export default baseTableProps