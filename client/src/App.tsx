import { RouterProvider } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { router } from "./routes";
import { useThemeStore } from "./store/themeStore";

function App() {
  const { isDark } = useThemeStore();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
export default App;
