import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { queryClient } from "@/queryClient";
import { theme } from "@/theme";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import ErrorComponent from "./components/ErrorComponent";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0,
  // defaultPreload: "intent",
  defaultErrorComponent: ErrorComponent,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={true} />
        </QueryClientProvider>
      </ChakraProvider>
    </StrictMode>,
  );
}
