import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    return (
      <el-cascader
        v-model={row[item.COL_NAME]}
        clearable={(item.COL_TYPE.props && item.COL_TYPE.props.clearable) || true}
        placeholder={i18n.t('v_notice_placeholder_select') + $t(item.LABEL_ID)}
        options={item.COL_TYPE.options}
        onChange={(e)=>{this.$emit('change',e)}}
      />
    )
  }
}