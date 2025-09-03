
let CommonUtils ={
    ManualMessageName:{
        AreYouThere : ["AreYouThere","S1F1"],//
        SelectedEquipmentStatusData : ["SelectedEquipmentStatusData","S1F3_SelectedEquipmentStatusData"],//
        StatusVariableNameListRequest : ["StatusVariableNameListRequest","S1F11_StatusVariableNameListRequest"],//
        ResetInitializeEQP : ["ResetInitializeEQP","S1F13_EstablishCommunicationRequest"],//
        StatusVariableNameList : ["StatusVariableNameList","S1F11_StatusVariableNameList"],//
        EstablishCommunicationRequest : ["EstablishCommunicationRequest","S1F13_EstablishCommunicationRequest"],//
        RequestONLINE : ["RequestONLINE","S1F17_OnlineRequest"],//
        EquipmentConstantRequest : ["EquipmentConstantRequest","S2F13_EquipmentConstantRequest"],//
        EquipmentConstantSend : ["EquipmentConstantSend","S2F15_EquipmentConstantSend"],//
        RemoteCommandSend : ["RemoteCommandSend","S2F21_RemoteCommandSend"],//
        EquipmentConstantNameList : ["EquipmentConstantNameList","S2F29_EquipmentConstantNameList"],//
        EquipmentConstantNameListRequest : ["EquipmentConstantNameListRequest","S2F29_ResetorInitializeSend"],//
        DefineReportRequest : ["DefineReportRequest","S2F33_DefineReportRequest"],//
        LinkDefineReportRequest : ["LinkDefineReportRequest","S2F35_LinkDefineReportRequest"],//
        EnableEventRequest : ["EnableEventRequest","S2F37_EnableEvent"],//
        HostCommandSend : ["HostCommandSend","S2F41_HostCommandSend"],//
        EventReportRequest : ["EventReportRequest","S6F15_EventReportRequest"],//
        ReportDataRequest : ["ReportDataRequest","S6F19_ReportDataRequest"],//
        ProcessProgramRequest : ["ProcessProgramRequest","S7F5_ProcessProgramRequest"],//
        DeleteProcessProgramSend : ["DeleteProcessProgramSend","S7F17_DeleteProcessProgramSend"],//
        CurrentEppdRequest : ["CurrentEppdRequest","S7F19_CurrentEppdRequest"],//
        TerminalDisplaySingle : ["TerminalDisplaySingle","S10F3_TerminalDisplaySingle"],//
    },
    SECSDataFormat :
    {
        A : "A",
        BOOLEAN : "BOOLEAN",
        B : "B",
        I1 : "I1",
        I2 : "I2",
        I4 : "I4",
        I8 : "I8",
        U1 : "U1",
        U2 : "U2",
        U4 : "U4",
        U8 : "U8",
        F4 : "F4",
        F8 : "F8",
    },
    Models:{
        YPM1180:'YPM1180',
        Y1R1060:'Y1R1060'
    },
    EqpType:{
        BackGrind:'BackGrind',
        LaserSaw:'LaserSaw',
        WaferSaw:'WaferSaw'
    },
    facInfo:[
        {
        value:"FAC_1",
        label:"A1"
    },{
        value:"FAC_2",
        label:"A2"
    },{
        value:"FAC_1_1",
        label:"A1-1"
    },{
        value:"FAC_1_2",
        label:"A1-2"
    },{
        value:"FAC_2_1",
        label:"A2-1"
    },{
        value:"FAC_2_2",
        label:"A2-2"
    },{
        value:"FAC_2_3",
        label:"A2-3"
    }]
}
export default {
    install: function (Vue) {
        Vue.prototype.$CommonUtils= CommonUtils
    },
}