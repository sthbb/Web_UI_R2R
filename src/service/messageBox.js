/**
 * Created by DingLiangLiang on 2020/4/9.
 */
'use strict'
import i18n from '../commn/i18n'
import el from 'element-ui'

export default {
    saveSuccess: () => el.Notification.success(i18n.t('v_notice_save_success')),
    savefailed: () => el.Notification.error(i18n.t('v_notice_save_fail')),
    delSuccess:() => el.Notification.success(i18n.t('v_notice_del_success')),
    delFailed:() => el.Notification.success(i18n.t('v_notice_del_fali')),
    execSuccess: () => el.Notification.success(i18n.t('v_notice_exec_success')),
    execfailed: () => el.Notification.success(i18n.t('v_notice_exec_fail')),
    not_find_data: () => el.Notification.success(i18n.t('v_notice_not_find_data')),
    openSuccess: (msg) => el.Notification.success(msg),
    openFailed: (msg) => el.Notification.error(msg),
    openInfo: (msg) => el.Notification.info(msg),
    openWarning: (msg) => el.Notification.warning(msg),
    success: (msg) => el.Notification.success(msg),
}