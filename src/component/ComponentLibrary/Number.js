import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    return (
      <el-input-number
        v-model={row[item.COL_NAME]}
        clearable={(item.COL_TYPE.props && item.COL_TYPE.props.clearable) || true}
        placeholder={i18n.t('v_notice_placeholder_input') + i18n.t(item.LABEL_ID)}
        controls-position="right"
        max={item.NUM_UPPER_LIMIT || item.NUM_UPPER_LIMIT === 0 ? +item.NUM_UPPER_LIMIT : undefined}
        min={item.NUM_LOWER_LIMIT || item.NUM_LOWER_LIMIT === 0 ? +item.NUM_LOWER_LIMIT : undefined}
        onChange={(e)=>{this.$emit('change',e)}}
      />
    )
  }
}