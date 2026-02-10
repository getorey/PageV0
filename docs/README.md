# AI Work Automation Agent - Documentation

## 📖 Documentation Overview

This directory contains comprehensive documentation for the AI Work Automation Agent, covering architecture, implementation details, and usage guides.

## 📋 Document Structure

### 🏗️ Architecture & Flow
- **[message-processing-flow.md](./message-processing-flow.md)** - Complete message processing pipeline documentation
- **[message-processing-diagrams.md](./message-processing-diagrams.md)** - Visual diagrams and sequence charts
- **[developer-quick-reference.md](./developer-quick-reference.md)** - Essential developer reference guide

### 📋 Original Design Documents
- **[ai_업무_자동화_에이전트_prd.md](./ai_업무_자동화_에이전트_prd.md)** - Product Requirements Document
- **[아키텍처_설계서.md](./아키텍처_설계서.md)** - System Architecture Design
- **[보안_승인_감사_정책_설계서.md](./보안_승인_감사_정책_설계서.md)** - Security, Approval & Audit Policy Design
- **[시퀀스_워크플로우_설계서.md](./시퀀스_워크플로우_설계서.md)** - Sequence and Workflow Design

## 🚀 Quick Navigation

### For Developers
1. **Start Here**: [Developer Quick Reference](./developer-quick-reference.md)
2. **Understanding Flow**: [Message Processing Flow](./message-processing-flow.md)
3. **Visual Understanding**: [Processing Diagrams](./message-processing-diagrams.md)

### For System Architects
1. **High-Level Design**: [Architecture Design](./아키텍처_설계서.md)
2. **Security Framework**: [Security & Policy Design](./보안_승인_감사_정책_설계서.md)
3. **Workflow Design**: [Sequence & Workflow](./시퀀스_워크플로우_설계서.md)

### For Product Managers
1. **Product Vision**: [PRD](./ai_업무_자동화_에이전트_prd.md)
2. **Technical Implementation**: [Message Processing Flow](./message-processing-flow.md)

## 🏗️ System Architecture Overview

```
User Input → Message Hook → Work Request → Task Creation → Tool Execution → Audit Logging
                ↓                    ↓                    ↓
         Policy Injection     Context Collection    Approval System
                ↓                    ↓                    ↓
         System Prompt       Project Summary      Risk Analysis
```

## 🔧 Key Components

### Core Processing Pipeline
1. **Message Intake Layer** - Captures user input through OpenCode hooks
2. **Analysis Layer** - Detects work requests and extracts intent
3. **Task Management** - Creates and manages automation tasks
4. **Policy Engine** - Enforces security and compliance rules
5. **Tool System** - Executes specific automation actions
6. **Context Collection** - Gathers project intelligence
7. **Approval System** - Handles high-risk action approvals
8. **Audit Logging** - Comprehensive compliance tracking

### Hook Integration Points
- `message.part.updated` - Real-time text capture
- `message.created` - Message creation handling
- `chat.message` - Chat message processing
- `experimental.chat.messages.transform` - System prompt injection
- `tool.execute.before/after` - Tool execution control
- `permission.asked` - Permission request handling
- `file.written` - File operation monitoring
- `session.created/deleted` - Session lifecycle management

## 🛠️ Available Automation Tools

### Built-in Tools
1. **create_meeting_minutes** - Generate structured meeting minutes
2. **draft_email** - Create professional email drafts
3. **summarize_discussion** - Produce discussion summaries

### Tool Execution Flow
```typescript
const task = await taskManager.createTask(workRequest);
const result = await taskManager.executeTask(
  task.id, 
  'create_meeting_minutes',
  { meetingType: 'weekly', attendees: ['Team'] }
);
```

## 🔒 Security Features

### Multi-Layer Security
1. **Input Validation** - All inputs validated and sanitized
2. **Policy Enforcement** - Security policies applied consistently
3. **Approval Gates** - High-risk actions require explicit approval
4. **Audit Trail** - Complete audit trail for compliance
5. **PII Protection** - Automatic detection and masking of personal information

### Risk Assessment
- **High-Risk Tools**: `send_email`, `share_file`, `publish`, `deploy`
- **Approval Required**: External communications and file operations
- **Auto-Approved**: Low-risk internal operations

## 📊 Context Intelligence

### Project Context Collection
- **File Scanning**: Intelligent project file analysis
- **Type Detection**: Automatic project type identification
- **Content Analysis**: Key information extraction
- **Summary Generation**: Project overview creation

### Context Types
- **Documentation**: README files, markdown documents
- **Configuration**: JSON, YAML, configuration files
- **Source Code**: JavaScript, TypeScript, Python, etc.
- **Project Type**: Node.js, Python, Java, Rust, etc.

## 📝 Audit & Compliance

### Logging Categories
- **Task Creation**: All task creation events
- **Tool Execution**: Tool usage and results
- **Policy Violations**: Security policy breaches
- **Approval Requests**: High-risk action approvals
- **System Events**: Plugin lifecycle events

### Log Storage
- **Location**: `~/.opencode/logs/ai-work-agent/`
- **Format**: JSON Lines (structured logging)
- **Rotation**: Automatic at 10MB limit
- **Retention**: Configurable retention periods

## 🧪 Testing & Validation

### Test Coverage
1. **Unit Tests**: Individual component functionality
2. **Integration Tests**: End-to-end workflow testing
3. **Security Tests**: Policy and approval validation
4. **Performance Tests**: Load and stress testing

### Test Execution
```bash
cd plugin
npm run build
node dist/test/run-tests.js
```

## ⚙️ Configuration

### Plugin Configuration
```typescript
config.aiWorkAgent = {
  enabled: true,
  autoApproveLowRisk: false,
  requireApprovalFor: ["external_email", "file_share", "schedule_create"],
  auditLogEnabled: true,
  maxRetries: 3,
};
```

### Environment Setup
- **OpenCode Plugin**: Installed via opencode.json
- **Dependencies**: Node.js, TypeScript, UUID
- **Permissions**: File system access, logging permissions

## 🔄 Integration Points

### OpenCode Integration
- **Hook System**: Leverages OpenCode's plugin architecture
- **Session Management**: Integrates with OpenCode sessions
- **Client Interface**: Uses OpenCode client for user interactions
- **Project Context**: Accesses OpenCode project information

### External Systems
- **File System**: Reads/writes project files
- **Logging System**: Writes structured log files
- **Configuration**: Reads OpenCode configuration

## 📈 Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components loaded on-demand
2. **Caching**: Policy contexts and project summaries cached
3. **Async Processing**: Non-blocking operations throughout
4. **Resource Limits**: File size and scan depth limits

### Monitoring Metrics
- **Message Processing Latency**
- **Task Execution Time**
- **Memory Usage**
- **Log File Growth**
- **Error Rates**

## 🚨 Error Handling

### Error Categories
1. **Input Errors**: Invalid message format or content
2. **Processing Errors**: Task creation or execution failures
3. **System Errors**: File system or resource issues
4. **Security Errors**: Policy violations or approval denials

### Recovery Strategies
- **Graceful Degradation**: Continue with reduced functionality
- **Retry Logic**: Exponential backoff for transient failures
- **User Feedback**: Clear error messages and alternatives
- **Fallback Defaults**: Sensible defaults for configuration failures

## 🔮 Future Enhancements

### Planned Features
1. **Machine Learning**: Intelligent task type prediction
2. **NLP Integration**: Enhanced natural language understanding
3. **Workflow Templates**: Pre-built automation templates
4. **Multi-language Support**: Internationalization capabilities
5. **Advanced Analytics**: Usage insights and optimization

### Extension Points
- **Custom Tools**: Easy addition of new automation tools
- **Policy Rules**: Flexible security policy system
- **Context Providers**: Pluggable context collection
- **Approval Workflows**: Customizable approval processes

## 📞 Support & Contributing

### Getting Help
1. **Documentation**: Check this docs folder first
2. **Code Comments**: Comprehensive inline documentation
3. **Debug Logs**: Enable debug logging for troubleshooting
4. **Test Suite**: Run tests to verify functionality

### Contributing Guidelines
1. **Code Style**: Follow existing TypeScript conventions
2. **Testing**: Add tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Security**: Consider security implications of changes

---

## 📚 Additional Resources

### OpenCode Documentation
- [OpenCode Plugin Development Guide](https://docs.opencode.ai)
- [Hook System Reference](https://docs.opencode.ai/hooks)
- [Plugin Configuration](https://docs.opencode.ai/config)

### Related Technologies
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js File System](https://nodejs.org/api/fs.html)
- [UUID Generation](https://github.com/uuidjs/uuid)

### Security & Compliance
- [OWASP Security Guidelines](https://owasp.org/)
- [GDPR Compliance](https://gdpr.eu/)
- [Audit Logging Best Practices](https://nist.gov/)

---

This documentation provides comprehensive coverage of the AI Work Automation Agent system. For specific implementation details, refer to the individual documents listed above.