import i18n from '../../commn/i18n'
import IconPicker from '../IconPicker/IconPicker'

export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    return (
      <icon-picker 
        placeholder={i18n.t('v_notice_placeholder_select') + i18n.t(item.LABEL_ID)}
        v-model={row[item.COL_NAME]}
        disabled={!row.tableType}
        onChange={(e)=>{this.$emit('change',e)}}
      />
    )
  }
}