import Mock from "mockjs";
import "./modules/user"; // 直接導入模組
import "./modules/workflow"; // 直接導入模組
import "./modules/analysis"; // 直接導入模組
import "./modules/project"; // 直接導入模組

// 設置全局延遲
Mock.setup({
  timeout: 0, // 取消延遲
});

// 設置是否啟用 mock
const enableMock = import.meta.env.VITE_ENABLE_MOCK === "true";

export function setupMock() {
  if (!enableMock) {
    console.log("Mock 服務未啟用");
    return;
  }

  console.log("Mock 服務初始化中...");
  console.log("環境變數：", import.meta.env);

  // 設置全局攔截器
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
  Mock.XHR.prototype.send = function () {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false;
    }
    // 添加上傳事件支援
    if (!this.upload) {
      this.upload = {
        addEventListener: function (type, handler) {
          this["on" + type] = handler;
        },
      };
    }
    console.log("Mock 發送請求：", this.custom.url, this.custom.body);
    this.proxy_send(...arguments);
  };

  // 設置全局攔截器
  Mock.XHR.prototype.proxy_open = Mock.XHR.prototype.open;
  Mock.XHR.prototype.open = function () {
    let args = [].slice.call(arguments);
    if (enableMock) {
      console.log("Mock 攔截請求：", args[1]);
    }
    return this.proxy_open(...arguments);
  };

  // 輸出已註冊的 mock 配置
  console.log(
    "已註冊的 Mock 配置：",
    Object.keys(Mock._mocked).map((key) => ({
      url: key,
      rtype: Mock._mocked[key].rtype,
    }))
  );

  console.log("Mock 服務已啟用");
}
