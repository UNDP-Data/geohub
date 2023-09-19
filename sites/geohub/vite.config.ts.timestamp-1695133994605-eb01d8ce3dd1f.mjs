// vite.config.ts
import { sveltekit } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/@sveltejs+kit@1.24.0_svelte@4.2.0_vite@4.4.9/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/vitest@0.33.0_jsdom@22.1.0_sass@1.66.1/node_modules/vitest/dist/config.js";
import { resolve } from "path";

// src/lib/server/webSocketUtils.ts
import { parse } from "url";
import { WebSocketServer } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/ws@8.14.1/node_modules/ws/wrapper.mjs";
import { nanoid } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/nanoid@5.0.1/node_modules/nanoid/index.js";
var GlobalThisWSS = Symbol.for("sveltekit.wss");
var onHttpServerUpgrade = (req, sock, head) => {
  const pathname = req.url ? parse(req.url).pathname : null;
  if (pathname !== "/websocket")
    return;
  const wss = globalThis[GlobalThisWSS];
  wss.handleUpgrade(req, sock, head, (ws) => {
    console.log("[handleUpgrade] creating new connecttion");
    wss.emit("connection", ws, req);
  });
};
var createWSSGlobalInstance = () => {
  const wss = new WebSocketServer({ noServer: true });
  globalThis[GlobalThisWSS] = wss;
  wss.on("connection", (ws) => {
    ws.socketId = nanoid();
    console.log(`[wss:global] client connected (${ws.socketId})`);
    ws.on("close", () => {
      console.log(`[wss:global] client disconnected (${ws.socketId})`);
    });
    ws.on("message", (data, isBinary) => {
      wss.clients.forEach((client) => {
        if (client.readyState !== 1)
          return;
        client.send(data, { binary: isBinary });
      });
    });
  });
  return wss;
};

// vite.config.ts
var vite_config_default = defineConfig({
  plugins: [
    sveltekit(),
    {
      name: "integratedWebsocketServer",
      configureServer(server) {
        var _a;
        createWSSGlobalInstance();
        (_a = server.httpServer) == null ? void 0 : _a.on("upgrade", onHttpServerUpgrade);
      },
      configurePreviewServer(server) {
        var _a;
        createWSSGlobalInstance();
        (_a = server.httpServer) == null ? void 0 : _a.on("upgrade", onHttpServerUpgrade);
      }
    }
  ],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, "vega-embed", "svelte-carousel", "simply-reactive"]
  },
  resolve: {
    alias: {
      $components: resolve("./src/components"),
      $stores: resolve("./src/stores/index.ts")
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["../.."]
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    threads: false,
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTest.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL2xpYi9zZXJ2ZXIvd2ViU29ja2V0VXRpbHMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMval9pZ2FyYXNoaS9Eb2N1bWVudHMvZ2l0L1VORFAtRGF0YS9nZW9odWIvc2l0ZXMvZ2VvaHViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMval9pZ2FyYXNoaS9Eb2N1bWVudHMvZ2l0L1VORFAtRGF0YS9nZW9odWIvc2l0ZXMvZ2VvaHViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qX2lnYXJhc2hpL0RvY3VtZW50cy9naXQvVU5EUC1EYXRhL2dlb2h1Yi9zaXRlcy9nZW9odWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjcmVhdGVXU1NHbG9iYWxJbnN0YW5jZSwgb25IdHRwU2VydmVyVXBncmFkZSB9IGZyb20gJy4vc3JjL2xpYi9zZXJ2ZXIvd2ViU29ja2V0VXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbXG5cdFx0c3ZlbHRla2l0KCksXG5cdFx0e1xuXHRcdFx0bmFtZTogJ2ludGVncmF0ZWRXZWJzb2NrZXRTZXJ2ZXInLFxuXHRcdFx0Y29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuXHRcdFx0XHRjcmVhdGVXU1NHbG9iYWxJbnN0YW5jZSgpO1xuXHRcdFx0XHRzZXJ2ZXIuaHR0cFNlcnZlcj8ub24oJ3VwZ3JhZGUnLCBvbkh0dHBTZXJ2ZXJVcGdyYWRlKTtcblx0XHRcdH0sXG5cdFx0XHRjb25maWd1cmVQcmV2aWV3U2VydmVyKHNlcnZlcikge1xuXHRcdFx0XHRjcmVhdGVXU1NHbG9iYWxJbnN0YW5jZSgpO1xuXHRcdFx0XHRzZXJ2ZXIuaHR0cFNlcnZlcj8ub24oJ3VwZ3JhZGUnLCBvbkh0dHBTZXJ2ZXJVcGdyYWRlKTtcblx0XHRcdH1cblx0XHR9XG5cdF0sXG5cdHNzcjoge1xuXHRcdG5vRXh0ZXJuYWw6IFsvXkBtYXRlcmlhbCg/Oi1leHRyYSk/XFwvLywgJ3ZlZ2EtZW1iZWQnLCAnc3ZlbHRlLWNhcm91c2VsJywgJ3NpbXBseS1yZWFjdGl2ZSddXG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0JGNvbXBvbmVudHM6IHJlc29sdmUoJy4vc3JjL2NvbXBvbmVudHMnKSxcblx0XHRcdCRzdG9yZXM6IHJlc29sdmUoJy4vc3JjL3N0b3Jlcy9pbmRleC50cycpXG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRmczoge1xuXHRcdFx0Ly8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIG9uZSBsZXZlbCB1cCB0byB0aGUgcHJvamVjdCByb290XG5cdFx0XHRhbGxvdzogWycuLi8uLiddXG5cdFx0fVxuXHR9LFxuXHR0ZXN0OiB7XG5cdFx0aW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57anMsdHN9J10sXG5cdFx0dGhyZWFkczogZmFsc2UsXG5cdFx0Z2xvYmFsczogdHJ1ZSxcblx0XHRlbnZpcm9ubWVudDogJ2pzZG9tJyxcblx0XHRzZXR1cEZpbGVzOiBbJy4vc2V0dXBUZXN0LnRzJ10sXG5cdFx0Y292ZXJhZ2U6IHtcblx0XHRcdHByb3ZpZGVyOiAnaXN0YW5idWwnLFxuXHRcdFx0cmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnXVxuXHRcdH1cblx0fVxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9qX2lnYXJhc2hpL0RvY3VtZW50cy9naXQvVU5EUC1EYXRhL2dlb2h1Yi9zaXRlcy9nZW9odWIvc3JjL2xpYi9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qX2lnYXJhc2hpL0RvY3VtZW50cy9naXQvVU5EUC1EYXRhL2dlb2h1Yi9zaXRlcy9nZW9odWIvc3JjL2xpYi9zZXJ2ZXIvd2ViU29ja2V0VXRpbHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pfaWdhcmFzaGkvRG9jdW1lbnRzL2dpdC9VTkRQLURhdGEvZ2VvaHViL3NpdGVzL2dlb2h1Yi9zcmMvbGliL3NlcnZlci93ZWJTb2NrZXRVdGlscy50c1wiO2ltcG9ydCB7IHBhcnNlIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IFdlYlNvY2tldFNlcnZlciB9IGZyb20gJ3dzJztcbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gJ25hbm9pZCc7XG5pbXBvcnQgdHlwZSB7IFNlcnZlciwgV2ViU29ja2V0IGFzIFdlYlNvY2tldEJhc2UgfSBmcm9tICd3cyc7XG5pbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHR5cGUgeyBEdXBsZXggfSBmcm9tICdzdHJlYW0nO1xuXG5leHBvcnQgY29uc3QgR2xvYmFsVGhpc1dTUyA9IFN5bWJvbC5mb3IoJ3N2ZWx0ZWtpdC53c3MnKTtcblxuZXhwb3J0IGludGVyZmFjZSBFeHRlbmRlZFdlYlNvY2tldCBleHRlbmRzIFdlYlNvY2tldEJhc2Uge1xuXHRzb2NrZXRJZDogc3RyaW5nO1xuXHQvLyB1c2VySWQ6IHN0cmluZztcbn1cblxuLy8gWW91IGNhbiBkZWZpbmUgc2VydmVyLXdpZGUgZnVuY3Rpb25zIG9yIGNsYXNzIGluc3RhbmNlcyBoZXJlXG4vLyBleHBvcnQgaW50ZXJmYWNlIEV4dGVuZGVkU2VydmVyIGV4dGVuZHMgU2VydmVyPEV4dGVuZGVkV2ViU29ja2V0PiB7fTtcblxuZXhwb3J0IHR5cGUgRXh0ZW5kZWRXZWJTb2NrZXRTZXJ2ZXIgPSBTZXJ2ZXI8RXh0ZW5kZWRXZWJTb2NrZXQ+O1xuXG5leHBvcnQgdHlwZSBFeHRlbmRlZEdsb2JhbCA9IHR5cGVvZiBnbG9iYWxUaGlzICYge1xuXHRbR2xvYmFsVGhpc1dTU106IEV4dGVuZGVkV2ViU29ja2V0U2VydmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IG9uSHR0cFNlcnZlclVwZ3JhZGUgPSAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHNvY2s6IER1cGxleCwgaGVhZDogQnVmZmVyKSA9PiB7XG5cdGNvbnN0IHBhdGhuYW1lID0gcmVxLnVybCA/IHBhcnNlKHJlcS51cmwpLnBhdGhuYW1lIDogbnVsbDtcblx0aWYgKHBhdGhuYW1lICE9PSAnL3dlYnNvY2tldCcpIHJldHVybjtcblxuXHRjb25zdCB3c3MgPSAoZ2xvYmFsVGhpcyBhcyBFeHRlbmRlZEdsb2JhbClbR2xvYmFsVGhpc1dTU107XG5cblx0d3NzLmhhbmRsZVVwZ3JhZGUocmVxLCBzb2NrLCBoZWFkLCAod3MpID0+IHtcblx0XHRjb25zb2xlLmxvZygnW2hhbmRsZVVwZ3JhZGVdIGNyZWF0aW5nIG5ldyBjb25uZWN0dGlvbicpO1xuXHRcdHdzcy5lbWl0KCdjb25uZWN0aW9uJywgd3MsIHJlcSk7XG5cdH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVdTU0dsb2JhbEluc3RhbmNlID0gKCkgPT4ge1xuXHRjb25zdCB3c3MgPSBuZXcgV2ViU29ja2V0U2VydmVyKHsgbm9TZXJ2ZXI6IHRydWUgfSkgYXMgRXh0ZW5kZWRXZWJTb2NrZXRTZXJ2ZXI7XG5cblx0KGdsb2JhbFRoaXMgYXMgRXh0ZW5kZWRHbG9iYWwpW0dsb2JhbFRoaXNXU1NdID0gd3NzO1xuXG5cdHdzcy5vbignY29ubmVjdGlvbicsICh3cykgPT4ge1xuXHRcdHdzLnNvY2tldElkID0gbmFub2lkKCk7XG5cdFx0Y29uc29sZS5sb2coYFt3c3M6Z2xvYmFsXSBjbGllbnQgY29ubmVjdGVkICgke3dzLnNvY2tldElkfSlgKTtcblxuXHRcdHdzLm9uKCdjbG9zZScsICgpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKGBbd3NzOmdsb2JhbF0gY2xpZW50IGRpc2Nvbm5lY3RlZCAoJHt3cy5zb2NrZXRJZH0pYCk7XG5cdFx0fSk7XG5cblx0XHR3cy5vbignbWVzc2FnZScsIChkYXRhLCBpc0JpbmFyeSkgPT4ge1xuXHRcdFx0d3NzLmNsaWVudHMuZm9yRWFjaCgoY2xpZW50KSA9PiB7XG5cdFx0XHRcdGlmIChjbGllbnQucmVhZHlTdGF0ZSAhPT0gMSkgcmV0dXJuO1xuXHRcdFx0XHRjbGllbnQuc2VuZChkYXRhLCB7IGJpbmFyeTogaXNCaW5hcnkgfSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHdzcztcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlXLFNBQVMsaUJBQWlCO0FBQ25ZLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTs7O0FDRm9ZLFNBQVMsYUFBYTtBQUNsYixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGNBQWM7QUFLaEIsSUFBTSxnQkFBZ0IsT0FBTyxJQUFJLGVBQWU7QUFnQmhELElBQU0sc0JBQXNCLENBQUMsS0FBc0IsTUFBYyxTQUFpQjtBQUN4RixRQUFNLFdBQVcsSUFBSSxNQUFNLE1BQU0sSUFBSSxHQUFHLEVBQUUsV0FBVztBQUNyRCxNQUFJLGFBQWE7QUFBYztBQUUvQixRQUFNLE1BQU8sV0FBOEIsYUFBYTtBQUV4RCxNQUFJLGNBQWMsS0FBSyxNQUFNLE1BQU0sQ0FBQyxPQUFPO0FBQzFDLFlBQVEsSUFBSSwwQ0FBMEM7QUFDdEQsUUFBSSxLQUFLLGNBQWMsSUFBSSxHQUFHO0FBQUEsRUFDL0IsQ0FBQztBQUNGO0FBRU8sSUFBTSwwQkFBMEIsTUFBTTtBQUM1QyxRQUFNLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRSxVQUFVLEtBQUssQ0FBQztBQUVsRCxFQUFDLFdBQThCLGFBQWEsSUFBSTtBQUVoRCxNQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU87QUFDNUIsT0FBRyxXQUFXLE9BQU87QUFDckIsWUFBUSxJQUFJLGtDQUFrQyxHQUFHLFFBQVEsR0FBRztBQUU1RCxPQUFHLEdBQUcsU0FBUyxNQUFNO0FBQ3BCLGNBQVEsSUFBSSxxQ0FBcUMsR0FBRyxRQUFRLEdBQUc7QUFBQSxJQUNoRSxDQUFDO0FBRUQsT0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLGFBQWE7QUFDcEMsVUFBSSxRQUFRLFFBQVEsQ0FBQyxXQUFXO0FBQy9CLFlBQUksT0FBTyxlQUFlO0FBQUc7QUFDN0IsZUFBTyxLQUFLLE1BQU0sRUFBRSxRQUFRLFNBQVMsQ0FBQztBQUFBLE1BQ3ZDLENBQUM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPO0FBQ1I7OztBRHBEQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVjtBQUFBLE1BQ0MsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFWM0I7QUFXSSxnQ0FBd0I7QUFDeEIscUJBQU8sZUFBUCxtQkFBbUIsR0FBRyxXQUFXO0FBQUEsTUFDbEM7QUFBQSxNQUNBLHVCQUF1QixRQUFRO0FBZGxDO0FBZUksZ0NBQXdCO0FBQ3hCLHFCQUFPLGVBQVAsbUJBQW1CLEdBQUcsV0FBVztBQUFBLE1BQ2xDO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNKLFlBQVksQ0FBQywyQkFBMkIsY0FBYyxtQkFBbUIsaUJBQWlCO0FBQUEsRUFDM0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLGFBQWEsUUFBUSxrQkFBa0I7QUFBQSxNQUN2QyxTQUFTLFFBQVEsdUJBQXVCO0FBQUEsSUFDekM7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxJQUFJO0FBQUE7QUFBQSxNQUVILE9BQU8sQ0FBQyxPQUFPO0FBQUEsSUFDaEI7QUFBQSxFQUNEO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDTCxTQUFTLENBQUMsOEJBQThCO0FBQUEsSUFDeEMsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLGdCQUFnQjtBQUFBLElBQzdCLFVBQVU7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLFFBQVEsTUFBTTtBQUFBLElBQ2xDO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
