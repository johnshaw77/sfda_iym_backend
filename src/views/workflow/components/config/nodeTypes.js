import {
  Upload,
  FileInput,
  Settings2,
  LineChart,
  BarChart4,
  FileCheck2,
  CircleDot,
} from "lucide-vue-next";

export const NODE_TYPES = {
  INPUT: {
    type: "input",
    label: "數據輸入",
    icon: FileInput,
    color: "#60A5FA", // blue-400
    description: "用於數據導入和預處理",
    allowedInputs: 0,
    allowedOutputs: 1,
    defaultConfig: {
      dataSource: "",
      fileType: "csv",
      encoding: "utf-8",
      skipRows: 0,
      delimiter: ",",
    },
  },
  PROCESS: {
    type: "process",
    label: "數據處理",
    icon: Settings2,
    color: "#34D399", // green-400
    description: "用於數據清洗和轉換",
    allowedInputs: 1,
    allowedOutputs: 1,
    defaultConfig: {
      operations: [],
      filters: [],
      transformations: [],
    },
  },
  ANALYSIS: {
    type: "analysis",
    label: "數據分析",
    icon: LineChart,
    color: "#A78BFA", // purple-400
    description: "用於統計分析和建模",
    allowedInputs: 1,
    allowedOutputs: 1,
    defaultConfig: {
      analysisType: "",
      parameters: {},
      modelType: "",
    },
  },
  VISUALIZATION: {
    type: "visualization",
    label: "數據可視化",
    icon: BarChart4,
    color: "#F97316", // orange-500
    description: "用於圖表展示",
    allowedInputs: 1,
    allowedOutputs: 1,
    defaultConfig: {
      chartType: "line",
      xAxis: "",
      yAxis: "",
      groupBy: "",
    },
  },
  OUTPUT: {
    type: "output",
    label: "結果輸出",
    icon: FileCheck2,
    color: "#EF4444", // red-500
    description: "用於結果導出和報告生成",
    allowedInputs: 1,
    allowedOutputs: 0,
    defaultConfig: {
      outputType: "csv",
      filename: "",
      includeMetadata: true,
    },
  },
};

export const NODE_STATUS = {
  IDLE: {
    label: "未執行",
    color: "#9CA3AF", // gray-400
    icon: CircleDot,
  },
  RUNNING: {
    label: "執行中",
    color: "#60A5FA", // blue-400
    icon: CircleDot,
  },
  COMPLETED: {
    label: "已完成",
    color: "#34D399", // green-400
    icon: CircleDot,
  },
  ERROR: {
    label: "錯誤",
    color: "#EF4444", // red-500
    icon: CircleDot,
  },
  WAITING: {
    label: "等待中",
    color: "#F59E0B", // amber-500
    icon: CircleDot,
  },
};

export const getNodeConfig = (type) => {
  return NODE_TYPES[type.toUpperCase()] || NODE_TYPES.PROCESS;
};

export const getNodeStatus = (status) => {
  return NODE_STATUS[status.toUpperCase()] || NODE_STATUS.IDLE;
};
