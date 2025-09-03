import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object }
  },
  render() {
    const { row = {}, item = {} } = this._props
    return (
      <el-switch
        v-model={row[item.COL_NAME]}
        disabled={!row.tableType}
      />
    )
  }
}