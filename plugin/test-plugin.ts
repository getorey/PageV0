// 테스트 스크립트 - 플러그인 작동 여부 확인
import { AIWorkAgentPlugin } from "./src/index";

// Mock OpenCode Client
const mockClient = {
  session: {
    prompt: async (options: any) => {
      console.log("[Session Prompt]", options);
      return "test-response";
    },
    confirm: async (options: any) => {
      console.log("[Session Confirm]", options.message);
      return true;
    },
    select: async (options: any) => {
      console.log("[Session Select]", options.message);
      return options.options[0]?.value;
    },
  },
};

// Mock Project
const mockProject = {
  root: process.cwd(),
  config: {},
};

// Mock utilities
const mock$ = {};
const mockDirectory = process.cwd();

// 테스트 실행
async function runTests() {
  console.log("🧪 OpenCode Plugin Test Suite\n");
  console.log("=" .repeat(50));

  try {
    // 플러그인 초기화
    console.log("\n📦 1. Plugin Initialization");
    const hooks = await AIWorkAgentPlugin({
      client: mockClient as any,
      project: mockProject as any,
      $: mock$,
      directory: mockDirectory,
    });
    console.log("✅ Plugin initialized successfully");
    console.log("   Available hooks:", Object.keys(hooks).join(", "));

    // chat.message hook 테스트
    console.log("\n💬 2. Testing chat.message hook");
    const chatInput = {
      message: "회의록 작성해줘",
      history: [],
    };
    const chatOutput: any = {};
    
    if (hooks["chat.message"]) {
      await hooks["chat.message"](chatInput, chatOutput);
      console.log("✅ chat.message hook executed");
      if (chatOutput.systemPrompt) {
        console.log("   System prompt injected: YES");
        console.log("   Context:", chatOutput.systemPrompt.substring(0, 100) + "...");
      } else {
        console.log("   System prompt injected: NO (not a work request)");
      }
    }

    // tool.execute.before hook 테스트
    console.log("\n🔧 3. Testing tool.execute.before hook");
    const toolInput = {
      tool: "send_email",
      params: { to: "test@example.com", subject: "Test" },
    };
    const toolOutput: any = {};
    
    if (hooks["tool.execute.before"]) {
      await hooks["tool.execute.before"](toolInput, toolOutput);
      console.log("✅ tool.execute.before hook executed");
      console.log("   Tool:", toolInput.tool);
      console.log("   Blocked:", toolOutput.blocked ? "YES" : "NO");
      if (toolOutput.params) {
        console.log("   Modified params:", JSON.stringify(toolOutput.params, null, 2));
      }
    }

    // permission.ask hook 테스트
    console.log("\n🔐 4. Testing permission.ask hook");
    const permInput = {
      permission: "write",
      resource: "/sensitive/file.txt",
    };
    const permOutput: any = {};
    
    if (hooks["permission.ask"]) {
      await hooks["permission.ask"](permInput, permOutput);
      console.log("✅ permission.ask hook executed");
      if (permOutput.context) {
        console.log("   Risk level:", permOutput.context.riskLevel);
        console.log("   Justification:", permOutput.context.justification);
        console.log("   Alternatives:", permOutput.context.alternatives?.join(", "));
      }
    }

    // file.save hook 테스트
    console.log("\n💾 5. Testing file.save hook");
    const fileInput = {
      path: "/test/document.md",
      content: "주민등록번호 123456-1234567 포함된 내용",
    };
    const fileOutput: any = {};
    
    if (hooks["file.save"]) {
      await hooks["file.save"](fileInput, fileOutput);
      console.log("✅ file.save hook executed");
      console.log("   Cancelled:", fileOutput.cancelled ? "YES" : "NO");
    }

    // config hook 테스트
    console.log("\n⚙️  6. Testing config hook");
    const config: any = {};
    
    if (hooks["config"]) {
      await hooks["config"](config);
      console.log("✅ config hook executed");
      console.log("   Config added:", JSON.stringify(config.aiWorkAgent, null, 2));
    }

    // session hooks 테스트
    console.log("\n🚀 7. Testing session.start hook");
    if (hooks["session.start"]) {
      await hooks["session.start"]();
      console.log("✅ session.start hook executed");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✨ All tests completed successfully!");
    console.log("=".repeat(50));

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// 테스트 실행
runTests();
