import { useEffect, useState } from "react";

type NetworkStatus = "smooth" | "busy" | "congested" | "offline";

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>("smooth");
  const [responseTime, setResponseTime] = useState<number>(0);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const startTime = performance.now();

        // 使用一个轻量的 API 端点检测
        // 如果没有 health 端点，可以用任何 GET 端点
        const response = await fetch("/api/health", {
          method: "HEAD", // 只获取 headers，不要 body
          cache: "no-cache",
        });

        const endTime = performance.now();
        const time = endTime - startTime;
        setResponseTime(Math.round(time));

        if (!response.ok) {
          setStatus("offline");
          return;
        }

        // 根据响应时间判断状态
        if (time < 200) {
          setStatus("smooth");
        } else if (time < 500) {
          setStatus("busy");
        } else {
          setStatus("congested");
        }
      } catch (error) {
        // 网络错误或超时
        setStatus("offline");
        setResponseTime(0);
      }
    };

    // 立即检测一次
    checkNetworkStatus();

    // 每 30 秒检测一次
    const interval = setInterval(checkNetworkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { status, responseTime };
}
