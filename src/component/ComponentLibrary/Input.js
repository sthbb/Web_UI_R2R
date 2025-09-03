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
        v-model={row[item.COL_NAME]}
        clearable={(item.COL_TYPE.props && item.COL_TYPE.props.clearable) || true}
        placeholder={i18n.t('v_notice_placeholder_input') + i18n.t(item.LABEL_ID)}
        type={(item.COL_TYPE.attrs && item.COL_TYPE.attrs.type) || 'text'}
        onChange={(e)=>{this.$emit('change',e)}}
      />
    )
  }
}