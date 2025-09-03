import ModelPara from '@/views/Parameter/ModelPara';
import EqpPara from '@/views/Parameter/EqpPara';
import FormulaSpec from '@/views/Formula/FormulaSpec';
import UseState from '@/views/Formula/UseState';
import R2RSpec from '@/views/R2RSpec/R2RSpec';
import DcolMap from '@/views/R2RSpec/DcolMap';
import RefSpecMulti from '@/views/R2RSpec/RefSpecMulti';
import R2RHistory from '@/views/Histrory/R2RHistory';
import AlarmHistory from '@/views/Histrory/AlarmHistory';
import ReferenceFilter from '@/views/Context/ReferenceFilter';
import R2RParaTrend from '@/views/Report/R2RParaTrend';
import R2RResultTrend from '@/views/Report/R2RResultTrend';
import Menu from '@/views/Admin/Menu';
import EQP from '@/views/Admin/EQP';
import Function from '@/views/Admin/Function';
import User from '@/views/Admin/User';
import PrivilegeManager from '@/views/Admin/PrivilegeManager';
import Enum from '@/views/System/Enum';
import Code from '@/views/System/Code';
import ColMap from '@/views/System/ColMap';
import IDRule from '@/views/System/IDRule';
import Label from '@/views/System/Label';
import SystemObject from '@/views/System/SystemObject';
import SystemQuery from '@/views/System/SystemQuery';
import Home from '@/views/Home';
const devRoutes = [
  {
    PATH: 'home',
    VIEW_URL: 'Home',
    LABEL_ID: '模板参数',
    icon: '',
    i18n:'device-parameters',
    component: Home
  },
  {
    PATH: 'modelPara',
    VIEW_URL: 'Parameter/ModelPara',
    LABEL_ID: '模板参数',
    icon: '',
    i18n:'device-parameters',
    component: ModelPara
  },
  {
    PATH: 'eqpPara',
    VIEW_URL: 'Parameter/EqpPara',
    LABEL_ID: '设置参数',
    icon: '',
    i18n:'device-parameters',
    component: EqpPara
  },
  {
    PATH: 'formulaSpec',
    VIEW_URL: 'Formula/FormulaSpec',
    LABEL_ID: '算法',
    icon: '',
    i18n:'device-parameters',
    component: FormulaSpec
  },
  {
    PATH: 'useState',
    VIEW_URL: 'Formula/UseState',
    LABEL_ID: '算法使用',
    icon: '',
    i18n:'device-parameters',
    component:UseState
  },
  {
    PATH: 'R2RSpec',
    VIEW_URL: 'R2RSpec/R2RSpec',
    LABEL_ID: 'modelSpec',
    icon: '',
    i18n:'device-parameters',
    component: R2RSpec
  },
  {
    PATH: 'dcolMap',
    VIEW_URL: 'R2RSpec/DcolMap',
    LABEL_ID: 'dcolMap',
    icon: '',
    i18n:'device-parameters',
    component: DcolMap
  },
  {
    PATH: 'refSpecMulti',
    VIEW_URL: 'R2RSpec/RefSpecMulti',
    LABEL_ID: 'refSpecMulti',
    icon: '',
    i18n:'device-parameters',
    component: RefSpecMulti
  },
  {
    PATH: 'R2RHistory',
    VIEW_URL: 'Histrory/R2RHistory',
    LABEL_ID: 'r2rHistory',
    icon: '',
    i18n:'device-parameters',
    component: R2RHistory
  },
  {
    PATH: 'alarmHistory',
    VIEW_URL: 'Histrory/AlarmHistory',
    LABEL_ID: 'alarmHistory',
    icon: '',
    i18n:'device-parameters',
    component: AlarmHistory
  },
  {
    PATH: 'referenceFilter',
    VIEW_URL: 'Context/ReferenceFilter',
    LABEL_ID: 'refFilter',
    icon: '',
    i18n:'device-parameters',
    component: ReferenceFilter
  },
  {
    PATH: 'R2RParaTrend',
    VIEW_URL: 'Report/R2RParaTrend',
    LABEL_ID: 'r2rParaTrend',
    icon: '',
    i18n:'device-parameters',
    component: R2RParaTrend
  },
  {
    PATH: 'R2RResultTrend',
    VIEW_URL: 'Report/R2RResultTrend',
    LABEL_ID: 'r2rResultTrend',
    icon: '',
    i18n:'device-parameters',
    component: R2RResultTrend
  },
  {
    PATH: 'menu',
    VIEW_URL: 'Admin/Menu',
    LABEL_ID: 'menuManagement',
    icon: '',
    i18n:'device-parameters',
    component: Menu
  },
  {
    PATH: 'eqp',
    VIEW_URL: 'Admin/EQP',
    LABEL_ID: 'eqpManager',
    icon: '',
    i18n:'device-parameters',
    component: EQP
  },
  {
    PATH: 'function',
    VIEW_URL: 'Admin/Function',
    LABEL_ID: 'functionManager',
    icon: '',
    i18n:'device-parameters',
    component: Function
  },
  {
    PATH: 'user',
    VIEW_URL: 'Admin/User',
    LABEL_ID: 'functionManager',
    icon: '',
    i18n:'device-parameters',
    component: User
  },
  {
    PATH: 'privilege',
    VIEW_URL: 'Admin/PrivilegeManager',
    LABEL_ID: 'functionManager',
    icon: '',
    i18n:'device-parameters',
    component: PrivilegeManager
  },
  {
    PATH: 'enum',
    VIEW_URL: 'System/Enum',
    LABEL_ID: 'enumManager',
    icon: '',
    i18n:'device-parameters',
    component: Enum
  },
  {
    PATH: 'code',
    VIEW_URL: 'System/Code',
    LABEL_ID: 'codeManager',
    icon: '',
    i18n:'device-parameters',
    component: Code
  },
  {
    PATH: 'colMap',
    VIEW_URL: 'System/ColMap',
    LABEL_ID: 'codeManager',
    icon: '',
    i18n:'device-parameters',
    component: ColMap
  },
  {
    PATH: 'idRule',
    VIEW_URL: 'System/IDRule',
    LABEL_ID: 'idRuleManager',
    icon: '',
    i18n:'device-parameters',
    component: IDRule
  },
  {
    PATH: 'label',
    VIEW_URL: 'System/Label',
    LABEL_ID: 'idRuleManager',
    icon: '',
    i18n:'device-parameters',
    component: Label
  },
  {
    PATH: 'systemObject',
    VIEW_URL: 'System/SystemObject',
    LABEL_ID: 'idRuleManager',
    icon: '',
    i18n:'device-parameters',
    component: SystemObject
  },
  {
    PATH: 'systemQuery',
    VIEW_URL: 'System/SystemQuery',
    LABEL_ID: 'idRuleManager',
    icon: '',
    i18n:'device-parameters',
    component: SystemQuery
  }
]

export default devRoutes;
