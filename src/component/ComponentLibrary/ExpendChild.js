import i18n from '../../commn/i18n'
import { getShowType } from '@/commn/commonFn'
export default {
  props: {
    expandData: { type: Array },
    expandColumn: { type: Array }
  },
  render() {
    const { expandData = {}, expandColumn = {} } = this._props
    const scopedSlots = {
      default: ({row,column,$columnIndex}) => getShowType(expandColumn[$columnIndex],row,'switch') ? (
        <el-switch
          v-model={row[column.property]}
          disabled
        />) : <span>{row[column.property]}</span>
    } 
    return (
      <vxe-table data={expandData} border max-height="400px">  
      {
        expandColumn.map(item=>(
          <vxe-table-column field={item.COL_NAME} title={i18n.t(item.LABEL_ID)} scopedSlots={scopedSlots} />
        ))
      }
      </vxe-table>
    )
  }
}