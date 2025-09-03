import Vue from 'vue'
import i18n from '../../commn/i18n'
export default {
  props: {
    row: { type: Object },
    item: { type: Object },
    actions: { type: Array },
  },
  render() {
    const { row = {}, item = {},actions = [] } = this._props
    const editActions = [{code:'save',title:i18n.t('btn_save'),icon:'fa fa-save'},{code:'cancel',title:i18n.t('btn_cancel'),icon:'fa fa-close'}]
    const filterAction = row.tableType === 'add' ? [{ code: "del", title: 'btn_cancel', icon: "fa fa-close"}] : (row.tableType === 'edit' ? editActions : actions)
    return (
      <div>
        {filterAction.map(action => (
          <el-button
            icon={action.icon}
            title={i18n.t(action.title)}
            round
            onclick={()=>{this.$emit('click',action)}}
          />
        ))}
      </div>
    )
  }
}