<template>
  <div>
    <vxe-grid
      ref="xGrid"
      v-bind="gridOptions"
      @toolbar-button-click="toolbarButtonClickEvent"
      @page-change="handlePageChange"
      @checkbox-change="selectCheckBoxChange"
      @radio-config="selectRadioChange"
      @checkbox-all="selectCheckBoxAllChange"
    >
      <!-- <template v-slot:toolbar_buttons>
        <el-button @click="allAlign = 'left'">居左</el-button>
        <el-button @click="allAlign = 'center'">居中</el-button>
        <el-button @click="allAlign = 'right'">居右</el-button>
      </template> -->
      <template v-slot:operate="{ row }">
        <template v-if="$refs.xGrid && $refs.xGrid.isActiveByRow(row)">
          <el-button
            icon="fa fa-save"
            status="primary"
            title="保存"
            round
            @click="saveRowEvent(row)"
          ></el-button>
        </template>
        <template v-else>
          <el-button
            icon="fa fa-edit"
            title="编辑"
            round
            @click="editRowEvent(row)"
          ></el-button>
        </template>
        <el-button
          icon="fa fa-trash"
          title="删除"
          round
          @click="removeRowEvent([row])"
        ></el-button>
      </template>
    </vxe-grid>
  </div>
</template>
<script>
export default {
  props:{
    tableOptions:{
      type:Object,
      default:()=>{ return {} },
    }
  },
  data() {
    return {
      gridOptions: {
        border: true, //是否带有边框
        keepSource: true, // 某一些操作 查看是否带有原始数据
        stripe: false, //是否展示斑马线
        showOverflow: true, //一行显示文本  超出显示省略号
        resizable: true, //所有的列是否允许拖动列宽调整大小
        autoResize: true, //table自适应
        highlightHoverRow: true, //鼠标移到行是否要高亮显示
        highlightcurrentRow: true, //是否要高亮当前行
        editLoading:false,
        align: "center", //居中显示
        id: "id",
        printConfig: {}, //打印配置
        sortConfig: {
          //排序配置
          orders: [["asc", "desc", "null"]], //排序规则设置
          trigger: "cell", //触发方式
          remote: false, //是否采用服务端排序，
          sortMethod: () => {}, //排序方法，
          iconAsc: "", //自定义升序的图标
          iconDesc: "", //自定义降序的图标
        },
        filterConfig: {
          //筛选配置项
          remote: true, //是否服务端配置，
          filterMethod: () => {}, //配置方法
          showIcon: true, //是否显示列头筛选图标,
          iconNone: "", //自定义无条件时显示的图标
          iconMatch: "", //自定义带条件时显示的图标
        },
        pagerConfig: {
          total: 0,
          currentPage: 1,
          pageSize: 10,
          align: "right",
          pageSizes: [10, 20, 30, 40, 50],
          layouts: [
            "Sizes",
            "PrevJump",
            "PrevPage",
            "Number",
            "NextPage",
            "NextJump",
            "FullJump",
            "Total",
          ],
          perfect: true,
        },
        seqConfig: {
          startIndex: 0
        },
        formConfig: {}, //表上面搜索条件设置
        tooltipConfig: {
          //tooltip 配置项
          enterable: true, // 鼠标是否可进入到 tooltip 中
          showAll: true, //所有单元格开启 tooltip 显示
        },
        toolbarConfig: {
          // table上面的操作
          buttons: [
            //自定义button
            {
              code: "add",
              name: "新增",
              icon: "fa fa-plus",
              status: "primary",
            },
            { code: "delete", name: "直接删除", icon: "fa fa-trash-o" },
          ],
          refresh: {
            query:function(){
              this.handlePageChange({pageSize:10,currentPage:1})
            }
          }, //刷新
          import: false, //导入 设置对象 可自定义图标
          export: true, //导出
          print: false, //打印
          zoom: true, //全屏
          custom: true, //自定义搜索
        },
        // toolbarConfig:{ 自定义button
        //   slots: {buttons: 'toolbar_buttons'},
        //   refresh: true, //刷新
        //   import: false, //导入 设置对象 可自定义图标
        //   export: true, //导出
        //   print: false, //打印
        //   zoom: true, //全屏
        //   custom: true, //自定义搜索
        // },
        columns: [], //表头
        data: [],//数据
        importConfig: {
          remote: false, //是否服务端导入
          importMethod: () => {}, //导入方法
          types: ["xlsx"], //导入文件方式设定
          modes: ["insert"], //导入文件方式
        },
        exportConfig: {
          remote: false, //是否服务端导出
          exportMethod: () => {}, //导出方法
          types: ["csv", "html", "xml", "txt"], //导出文件方式设定
          modes: ["current", "selected", "all"], //导出文件方式
        },
        checkboxConfig: {
          checkRowKeys: [], //默认勾选指定行
          showHeader: true, //是否显示全选按钮
          checkMethod: () => {
            return true
          }, //是否允许勾选的方法
          labelField: "ID", //复选框显示的字段名，可以直接显示在复选框中
          reserve: true, //是否保留勾选状态 与 row-id 搭配使用
          highlight: true, //高亮勾选行
          range: true, //开启复选框范围选择功能（启用后通过鼠标在复选框的列内滑动选中或取消指定行）
        },
        radioConfig: {}, //radio 配置
        editConfig: {
          //编辑配置
          trigger: "manual",
          mode: "row",
          showStatus: true, //切换行的时候  是否保留数据 只对 keep-source有效
          autoClear: false, //点击其他区域  编辑框是否消失
          showUpdateStatus:true, // 是否显示单元格修改状态  只对 keep-source有效
          showAsterisk:true, // 是否显示必填字段的红色星号
        },
        // customConfig: { //自定义列配置项
        //   storage: true,
        //   checkMethod: ()=>{},//配置方法
        // },
        // treeConfig: {}, //树状结构配置
        // proxyConfig: {}, //代理配置
        // editRules: {
        //   //编辑配置规则
        //   name: [
        //     { required: true, message: "app.body.valid.rName" },
        //     { min: 3, max: 50, message: "名称长度在 3 到 50 个字符" },
        //   ],
        //   email: [{ required: true, message: "邮件必须填写" }],
        //   role: [{ required: true, message: "角色必须填写" }],
        // },
      },
    }
  },
  computed: {},
  created() {
  },
  watch:{
    tableOptions:{
      deep:true,
      immediate: true,
      handler(newParam){
        this.deepAssign( this.gridOptions,newParam)
      }
    },
  },
  methods: {
    // 全选
    selectCheckBoxAllChange({records}){
      this.$emit("handleTableChange", { type: "checkbox",data:records.map(v=>v.id)})
    },
    // checkbox 多选
    selectCheckBoxChange({ checked, records=[] }){
     this.$emit("handleTableChange", { type: "checkbox",data:records.map(v=>v.id)})
    },
    // radio单选
    selectRadioChange(checked, records={}){
      this.$emit("handleTableChange", { type: "delete",data:[records]})
    },
    // 编辑保存
    saveRowEvent(row) {
      this.$refs.xGrid.clearActived().then(() => {
        this.loading = true
        setTimeout(() => {
          this.loading = false
           this.$emit("handleTableChange", { type: "edit", data:row })
        }, 300)
      })
     
    },
    //编辑
    editRowEvent(row) {
      this.$refs.xGrid.setActiveRow(row)
    },
    // 删除
    removeRowEvent(row=[]) {
      this.$emit("handleTableChange", { type: "delete", data: row })
    },
    // 新增 批量删除
    toolbarButtonClickEvent({ code }) {
      this.$emit("handleTableChange", { type: code })
    },
    // 分页
    handlePageChange(e) {
      this.$emit("handleTableChange", {
        type: "page",
        data: {
          pageSize: e.pageSize,
          currentPage: e?.$event.type === "current" ? e.currentPage : 1,
        },
      })
    },
    // 对象深度合并
    deepAssign(oldObj={},newObj={}){
      for(let key in newObj){
        if (typeof newObj[key] === 'object' && newObj[key]) {
          oldObj[key] = Object.prototype.toString.call(newObj[key]) === '[object Object]' ? {...oldObj[key],...newObj[key]} : newObj[key]
        }else{
          oldObj[key] = newObj[key]
        }
      }
      return oldObj
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
