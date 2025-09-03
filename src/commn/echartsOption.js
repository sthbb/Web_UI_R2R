import moment from 'moment'
const option = {
  tooltip: {},
  grid: [{
      top: 100,
      bottom: 80
    },
    {
      height: 71,
      bottom: 8
    }
  ],
  xAxis: [{
    type: 'category',
    data: [],
    gridIndex: 0,
    zlevel: 2
  }, {
    type: 'category',
    gridIndex: 1,
    axisTick: {
      length: 0,
    },
    zlevel: 1
  }],
  yAxis: [{
      type: 'value',
      gridIndex: 0,
    },
    {
      type: 'value',
      gridIndex: 1,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    }
  ],
  series: [{
    data: [],
    type: 'line',
    xAxisIndex: 0,
    yAxisIndex: 0
  }]
}

const secondLineData = {
  data: [{
    name: '',
    value: 1
  }],
  label: {
    show: true,
    position: 'inside',
    formatter: '{b}',
    offset: [0, 10],
    textStyle: {
      color: '#000'
    }
  },
  type: 'bar',
  barGap: 0,
  barWidth: '',
  itemStyle: {
    normal: {
      color: '#fff',
      borderColor: '#000',
      borderWidth: 0.5,
    },

  },
  xAxisIndex: 1,
  yAxisIndex: 1
}

const newOptions = {
  tooltip: {
    trigger: "axis",
  },
  legend: {
    top:'2%',
    data: [] // 展示在图形上面的分类提示
  },
  grid: {
    left: '3%',
    right: '3%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        formatter: function (value) {
          return moment(value).format("MM-DD HH:mm")
        }
      }
    }
  ],
  yAxis: [
    {
      type: "value",
      boundaryGap: false
    }
  ],
  series: [
    {
      name: "",//分类名称  需动态获取
      type: "line",
      // smooth: true,
      data: [] // 对应分类的数据  需动态获取
    },
    {
      name: "",
      type: "line",
      // smooth: true,
      data: []
    },
    {
      name: "",
      type: "line",
      // smooth: true,
      data: []
    },
    {
      name: "",
      type: "line",
      // smooth: true,
      data: []
    }
  ]
}

export {
  option,
  secondLineData,
  newOptions
}