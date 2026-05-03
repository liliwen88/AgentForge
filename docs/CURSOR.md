# Cursor AI助手配置

AgentForge项目的Cursor AI助手专用配置文件和规则。

## 项目规则文件

在项目根目录创建 `.cursor/rules/agentforge-rules.mdc`：

```markdown
# AgentForge项目开发规则

## 核心原则

遵循Andrej Karpathy的四原则：
1. 思考先于编码 - 明确假设，暴露权衡
2. 简洁优先 - 最小代码解决实际问题  
3. 精确修改 - 只修改必要部分
4. 目标驱动 - 定义成功标准并验证

## Agent开发规范

### 基础要求
- 使用TypeScript严格模式
- 继承BaseAgent类而不是重新实现
- 使用内置工具和记忆系统
- 避免过度抽象和复杂配置

### 代码风格
- 使用ESLint和Prettier格式化
- 函数使用camelCase命名
- 类使用PascalCase命名
- 常量使用UPPER_SNAKE_CASE命名
- 所有导出都需要JSDoc注释

### 文件组织
```
src/
├── agents/          # Agent定义
├── tools/           # 自定义工具  
├── components/      # UI组件
└── utils/           # 工具函数
```

## 禁止模式

❌ 不要为单一用途创建抽象
❌ 不要添加未要求的功能
❌ 不要过度配置Agent
❌ 不要重构正常工作的代码
❌ 不要创建复杂的继承层次

## 推荐模式

✅ 使用BaseAgent作为基类
✅ 使用内置工具和记忆
✅ 保持配置简单直接
✅ 编写可测试的代码
✅ 优先考虑业务价值

## 测试要求

- 每个Agent都需要集成测试
- 自定义工具需要单元测试
- 测试覆盖主要用户场景
- 使用模拟数据避免真实API调用
```

## Cursor设置

### 推荐配置

在 `.vscode/settings.json` 中添加：

```json
{
  "cursor.rules.enabled": true,
  "cursor.rules.files": [
    ".cursor/rules/agentforge-rules.mdc"
  ],
  "cursor.completion.enabled": true,
  "cursor.completion.model": "gpt-4",
  "cursor.chat.model": "gpt-4",
  "typescript.preferences.strict": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 快捷键配置

```json
{
  "key": "ctrl+shift+a",
  "command": "cursor.chat",
  "args": {
    "prompt": "根据AgentForge原则审查这段代码"
  }
}
```

## 使用指南

### 1. 创建新Agent

使用命令：
```
创建一个新的聊天Agent，使用BaseAgent类，包含基本的消息处理功能
```

Cursor会生成：
- 继承BaseAgent的Agent类
- 基本配置对象
- 事件处理方法
- JSDoc文档

### 2. 添加自定义工具

使用命令：
```
创建一个数据处理工具，包含输入验证和错误处理
```

Cursor会生成：
- 继承BaseTool的工具类
- Zod schema定义
- 执行方法实现
- 错误处理逻辑

### 3. 代码审查

使用命令：
```
根据AgentForge四原则审查这个文件，指出需要改进的地方
```

Cursor会检查：
- 是否过度抽象
- 是否添加了未要求的功能
- 是否匹配代码风格
- 是否有可测试性

### 4. 重构建议

使用命令：
```
简化这个Agent的实现，移除不必要的抽象，保持核心功能
```

Cursor会：
- 移除过度复杂的部分
- 简化配置结构
- 保持核心功能不变
- 提高代码可读性

## 常用提示词模板

### Agent开发
```
创建一个{type}Agent，使用以下配置：
- 名称: {name}
- 功能: {description}
- 工具: {tools}
- 记忆类型: {memory}

遵循AgentForge开发原则，保持代码简洁。
```

### 工具开发
```
创建一个{toolName}工具：
- 功能: {description}
- 输入参数: {inputs}
- 输出: {output}
- 错误处理: {errorHandling}

使用BaseTool类和Zod验证。
```

### 代码优化
```
审查并优化这段代码：
{code}

检查点：
1. 是否违反简洁原则
2. 是否有过度抽象
3. 是否可以简化
4. 是否保持核心功能
```

### 测试编写
```
为这个{component}编写测试：
{code}

要求：
- 覆盖主要功能
- 包含边界情况
- 使用模拟数据
- 遵循AAA模式
```

## 最佳实践

### 1. 日常开发
- 始终从简单实现开始
- 只在确实需要时添加复杂性
- 定期使用Cursor审查代码
- 保持配置文件最新

### 2. 团队协作
- 共享Cursor规则文件
- 使用统一的提示词模板
- 定期更新开发指南
- 建立代码审查流程

### 3. 项目维护
- 定期检查规则文件有效性
- 更新提示词模板
- 收集团队反馈
- 持续优化开发流程

## 故障排除

### 常见问题

**Q: Cursor没有遵循AgentForge规则**
A: 检查 `.cursor/rules/agentforge-rules.mdc` 文件是否存在且格式正确

**Q: 生成的代码过于复杂**
A: 在提示词中明确要求"保持简洁，避免过度抽象"

**Q: TypeScript类型错误**
A: 确保启用了严格模式并正确配置了路径别名

**Q: 测试生成不完整**
A: 在提示词中明确指定测试要求和覆盖范围

### 调试技巧

1. **检查规则文件**
   ```bash
   cat .cursor/rules/agentforge-rules.mdc
   ```

2. **验证Cursor配置**
   ```bash
   code --list-extensions | grep cursor
   ```

3. **测试提示词效果**
   - 使用简单任务测试
   - 逐步增加复杂度
   - 记录有效模式

## 进阶配置

### 自定义规则

创建特定项目的规则文件：

```markdown
# 项目特定规则

## 业务逻辑
- 所有Agent必须处理错误状态
- 用户输入必须验证
- 敏感数据必须加密

## 性能要求  
- 响应时间 < 2秒
- 内存使用 < 100MB
- 并发处理 > 10个请求

## 安全约束
- 不暴露内部API
- 验证所有输入
- 记录关键操作
```

### 集成工作流

结合CI/CD流程：
1. 提交前Cursor审查
2. 自动化测试检查
3. 代码质量验证
4. 部署前最终检查

---

**记住：Cursor是工具，最终代码质量取决于开发者的判断和原则遵循。**
