import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    return (
      <el-input
        type="textarea"
        v-model={row[item.COL_NAME]}
        clearable={(item.COL_TYPE.props && item.COL_TYPE.props.clearable) || true}
        placeholder={i18n.t('v_notice_placeholder_input') + i18n.t(item.LABEL_ID)}
        rows={(item.COL_TYPE.props && item.COL_TYPE.props.rows) || 8}
        onChange={(e)=>{this.$emit('change',e)}}
      />
    )
  }
}