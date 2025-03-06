const nodeDefinitions = [
  {
    definitionKey: "complaint-selector",
    nodeType: "custom-input",
    category: "business-input",
    name: "客訴選擇器",
    description: "用於選擇要分析的客訴案件",
    componentName: "ComplaintSelector",
    version: "1.0.0",
    apiEndpoint: "/api/complaints",
    apiMethod: "GET",
    config: JSON.stringify({
      multiple: false,
      dateRange: true,
      filters: {
        status: ["open", "closed"],
        priority: ["high", "medium", "low"],
      },
    }),
    uiConfig: JSON.stringify({
      style: {
        backgroundColor: "#ffffff",
        borderColor: "#64748b",
      },
    }),
    validation: JSON.stringify({
      required: true,
    }),
    handles: JSON.stringify({
      inputs: [],
      outputs: ["data"],
    }),
  },
  {
    definitionKey: "defect-item-selector",
    nodeType: "custom-input",
    category: "business-input",
    name: "不良品項選擇器",
    description: "用於選擇不良品項",
    componentName: "DefectItemSelector",
    version: "1.0.0",
    apiEndpoint: "/api/defects",
    apiMethod: "GET",
    config: JSON.stringify({
      multiple: true,
      searchable: true,
    }),
    uiConfig: JSON.stringify({
      style: {
        backgroundColor: "#ffffff",
        borderColor: "#64748b",
      },
    }),
    validation: JSON.stringify({
      required: true,
    }),
    handles: JSON.stringify({
      inputs: [],
      outputs: ["data"],
    }),
  },
  {
    definitionKey: "basic-statistics",
    nodeType: "statistic-process",
    category: "statistical-analysis",
    name: "基礎統計分析",
    description: "進行基礎的統計分析，包括平均值、中位數、標準差等",
    componentName: "BasicStatistics",
    version: "1.0.0",
    apiEndpoint: "/api/statistics/basic",
    apiMethod: "POST",
    config: JSON.stringify({
      metrics: ["mean", "median", "std", "min", "max"],
    }),
    uiConfig: JSON.stringify({
      style: {
        backgroundColor: "#ffffff",
        borderColor: "#64748b",
      },
    }),
    validation: JSON.stringify({
      required: true,
    }),
    handles: JSON.stringify({
      inputs: ["data"],
      outputs: ["result"],
    }),
  },
  {
    definitionKey: "data-filter",
    nodeType: "custom-process",
    category: "business-process",
    name: "資料過濾器",
    description: "根據條件過濾資料",
    componentName: "DataFilter",
    version: "1.0.0",
    apiEndpoint: "/api/data/filter",
    apiMethod: "POST",
    config: JSON.stringify({
      conditions: [],
    }),
    uiConfig: JSON.stringify({
      style: {
        backgroundColor: "#ffffff",
        borderColor: "#64748b",
      },
    }),
    validation: JSON.stringify({
      required: true,
    }),
    handles: JSON.stringify({
      inputs: ["data"],
      outputs: ["filtered"],
    }),
  },
];

module.exports = nodeDefinitions;
