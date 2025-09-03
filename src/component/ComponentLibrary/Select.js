import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    const options = (item?.COL_DATA_COND?.COL_CONTROL_YN === 'y' || item?.COL_DATA_COND?.COL_CONTROL_YN === 'Y' ? row[item.COL_NAME+'_LIST'] : item.COL_TYPE.options) || []
    const selectTip = item.BIND_DISP_COLS && item.BIND_DISP_COLS.split(',').length > 1 && item.BIND_DISP_COLS.split(',')[1]
    return (
      <el-select
        v-model={row[item.COL_NAME]}
        clearable={(item.COL_TYPE.props && item.COL_TYPE.props.clearable) || true}
        collapse-tags={(item.COL_TYPE.props && item.COL_TYPE.props.isMutil) || true}
        placeholder={i18n.t('v_notice_placeholder_select') + i18n.t(item.LABEL_ID)}
        transfer="true"
        multiple={(item.COL_TYPE.props && item.COL_TYPE.props.multiple) || false}
        filterable={(item.COL_TYPE.props && item.COL_TYPE.props.filterable) || true}
        onChange={(e)=>{this.$emit('change',e)}}
      >
       {options.map(child=>(
          <el-option label={child.label} value={child.value}>
            <span class="option-contain">
              <span class="option-item one-line" title={child.label}>{ child.label }</span>
              <span class="option-item option-des one-line" title={selectTip}>{ selectTip }</span>
            </span >
          </el-option>
        ))}
      </el-select >
    )
  }
}