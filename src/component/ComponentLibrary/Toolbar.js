import i18n from '../../commn/i18n'
import ColumnSetting from '../ColumnSetting'
export default {
  props: {
    toolbarConfig: { type: Object },
    columns: { type: Array },
    onlyMenu: { type: Boolean }
  },
  components:{ColumnSetting},
  methods:{
  },
  render() {
    const { toolbarConfig={},toolbarConfig:{buttons=[]},columns=[],onlyMenu=false } = this._props
    return (
      <vxe-toolbar
        ref="toolBar"
        export={false}
        import={false}
        print={false}
        zoom={false}
        refresh={false}
      >
        <div slot="buttons">
          {buttons.map(item=>(
            <el-button type={item.status} icon={item.icon} onclick={()=>{this.$emit('buttonClick',item)}}>{i18n.t(item.name)}</el-button>
          ))}
        </div>
        <div slot="tools" class="table-ope">
          <el-button onclick={()=>{this.$emit('handlePageChange',{PAGE_SIZE:10,PAGE_NUM:1})}} round slot="reference" icon="el-icon-refresh" title={i18n.t('com_refresh')} />
          {!onlyMenu && <ColumnSetting columns={columns}  oncolumnConfirm={(columns)=>{this.$emit('columnsSettins',columns)}} class="m-l-10 m-r-10"/>}
          {!onlyMenu && <el-button onclick={()=>{this.$emit('exportExcel')}} round slot="reference" icon="el-icon-download" title={i18n.t('com_export')} />}
        </div>
      </vxe-toolbar> 
    )
  }
}