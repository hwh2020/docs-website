## Models 模型

```python
from dotenv import load_dotenv, find_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate

_ = load_dotenv(find_dotenv())

DeepSeekModel = init_chat_model(
    model="deepseek-chat",
    model_provider="deepseek",
    base_url="https://api.deepseek.com")

template_string = """"请用简明的语言介绍一下{topic}。"""

prompt_template = PromptTemplate.from_template(template_string)

messages = prompt_template.format(topic="什么是ai?")

print(DeepSeekModel.invoke(messages).content)

# 流式输出
for chunk in DeepSeekModel.stream(messages):
    print(chunk.content, end="")

```

###  init_chat_model - 模型初始化

#### 参数详解

| 参数           | 类型    | 说明                                                         | 默认值     |
| -------------- | ------- | ------------------------------------------------------------ | ---------- |
| `model`        | `str`   | **必需**。格式为 `"provider:model_name"`，如 `"groq:llama-3.3-70b-versatile"` | 无         |
| `api_key`      | `str`   | API 密钥。如果不提供，会从环境变量中读取（如 `GROQ_API_KEY`） | `None`     |
| `temperature`  | `float` | 控制输出随机性。范围 0.0-2.0。 - `0.0`：最确定性 - `1.0`：默认，平衡 - `2.0`：最随机 | `1.0`      |
| `max_tokens`   | `int`   | 限制模型输出的最大 token 数量                                | 模型默认值 |
| `model_kwargs` | `dict`  | 传递给底层模型的额外参数                                     | `{}`       |

#### 示例

```python
from langchain.chat_models import init_chat_model
import os

# 方式 1：直接传递 API key
model = init_chat_model(
    "groq:llama-3.3-70b-versatile",
    api_key="your-groq-api-key"
)

# 方式 2：从环境变量读取（推荐）
model = init_chat_model(
    "groq:llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

# 方式 3：配置温度和 token 限制
model = init_chat_model(
    "groq:llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.0,    # 最确定性输出
    max_tokens=500      # 限制输出长度
)
```

### invoke 方法 - 调用模型

`invoke` 是 LangChain 中**最核心的方法**，用于同步调用 LLM 模型。

简单来说，`invoke` 方法的作用就是：

1. **接收你的输入**（问题、指令、对话历史等）
2. **发送给 LLM 模型**（如 GPT-4, Llama, Claude 等）
3. **返回模型的响应**（文本回复 + 元数据信息）

#### **参数详解**

| 参数     | 类型                                   | 说明                                 | 必需   | 默认值 |
| -------- | -------------------------------------- | ------------------------------------ | ------ | ------ |
| `input`  | `str` | `list[dict]` | `list[Message]` | 你要发送给模型的内容                 | ✅ 必需 | 无     |
| `config` | `dict`                                 | 高级配置（回调函数、元数据、标签等） | ❌ 可选 | `None` |

`invoke` 支持**三种不同的输入格式**

- #####  格式 1：纯字符串（最简单，适合单次问答）

  简单的一次性问答，不需要设置系统角色或对话历史

  ```python
  response = model.invoke("你的问题或指令")
  ```

- ##### 字典列表（推荐，最灵活）

  需要设置系统角色、多轮对话、精确控制对话流程

  ```python
  # 第一轮对话
  messages = [
      {"role": "system", "content": "你是一个友好的助手"},
      {"role": "user", "content": "我叫小明"}
  ]
  
  response1 = model.invoke(messages)
  print(response1.content)  # "你好，小明！很高兴认识你。"
  
  # 第二轮对话 - 添加历史
  messages.append({"role": "assistant", "content": response1.content})
  messages.append({"role": "user", "content": "我刚才说我叫什么？"})
  
  response2 = model.invoke(messages)
  print(response2.content)  # "你说你叫小明。"
  ```

  **角色说明：**

  | 角色        | 英文         | 作用                            | 示例                         |
  | ----------- | ------------ | ------------------------------- | ---------------------------- |
  | `system`    | System       | 设定 AI 的行为、角色、规则      | "你是一个专业的 Python 导师" |
  | `user`      | Human/User   | 用户的输入/问题                 | "什么是装饰器？"             |
  | `assistant` | AI/Assistant | AI 的历史回复（用于对话上下文） | "装饰器是一种设计模式..."    |

- ##### 消息对象列表（类型安全，但较繁琐）

  需要类型检查、IDE 自动补全的场景

  ```python
  from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
  
  messages = [
      SystemMessage(content="系统提示"),
      HumanMessage(content="用户消息"),
      AIMessage(content="AI回复")
  ]
  response = model.invoke(messages)
  ```

  **消息类型对照：**

  | 消息类          | 对应字典格式                 | 作用     |
  | --------------- | ---------------------------- | -------- |
  | `SystemMessage` | `{"role": "system", ...}`    | 系统提示 |
  | `HumanMessage`  | `{"role": "user", ...}`      | 用户输入 |
  | `AIMessage`     | `{"role": "assistant", ...}` | AI 回复  |

#### 返回值详解

```python
response = model.invoke("Hello")

# 1. 主要内容
response.content              # str - AI 的回复文本
response.response_metadata    # dict - 响应元数据
response.id                   # str - 消息唯一 ID
response.usage_metadata       # dict - Token 使用情况
response.additional_kwargs    # dict - 其他额外信息


response = model.invoke("用一句话解释什么是 AI")

# 1. 获取回复内容
print("AI 回复:", response.content)

# 2. 获取模型信息
metadata = response.response_metadata
print(f"使用的模型: {metadata['model_name']}")
print(f"结束原因: {metadata['finish_reason']}")

# 3. 获取 Token 使用情况
usage = metadata.get('token_usage', {})
print(f"提示 tokens: {usage.get('prompt_tokens')}")
print(f"完成 tokens: {usage.get('completion_tokens')}")
print(f"总计 tokens: {usage.get('total_tokens')}")

# 4. 获取消息 ID
print(f"消息 ID: {response.id}")
```

**response_metadata 完整结构：**

```python
{
    'model_name': 'llama-3.3-70b-versatile',      # 使用的模型
    'system_fingerprint': 'fp_4cfc2deea6',        # 系统指纹
    'finish_reason': 'stop',                      # 结束原因：stop/length/error
    'model_provider': 'groq',                     # 模型提供商
    'token_usage': {                              # Token 使用统计
        'prompt_tokens': 15,                      # 输入 tokens
        'completion_tokens': 25,                  # 输出 tokens
        'total_tokens': 40,                       # 总计 tokens
        'prompt_time': 0.002,                     # 输入处理时间（秒）
        'completion_time': 0.23                   # 输出生成时间（秒）
    }
}
```

####  config 参数（高级用法）

`config` 参数用于传递高级配置

**常用配置：**

```python
config = {
    "callbacks": [callback_handler],      # 回调函数
    "tags": ["test", "development"],      # 标签（用于追踪）
    "metadata": {"user_id": "123"},       # 元数据
    "run_name": "my_query"                # 运行名称
}

response = model.invoke(messages, config=config)
```

### 结构化输出

在 LangChain 1.0 中，使用 `with_structured_output()` 方法结合 Pydantic 模型，可以确保 LLM 返回符合预定义模式的数据。

```python
from pydantic import BaseModel, Field

class Person(BaseModel):
    """人物信息"""
    name: str = Field(description="姓名") # 使用 Field() 添加字段描述，帮助 LLM 理解：
    age: int = Field(description="年龄") # description 会传递给 LLM，帮助它正确填充字段。
    occupation: str = Field(description="职业")
```

使用 with_structured_output()

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("groq:llama-3.3-70b-versatile")

# 创建结构化输出的 LLM
structured_llm = model.with_structured_output(Person)

# 调用
result = structured_llm.invoke("张三是一名 30 岁的软件工程师")

# result 是 Person 实例
print(result.name)       # "张三"
print(result.age)        # 30
print(result.occupation) # "软件工程师"
```



### FAQ

##### temperature 参数如何选择？

根据使用场景选择：

- **0.0-0.3**：需要一致性、准确性的任务（数据提取、分类、代码生成）
- **0.5-0.7**：平衡创造性和一致性（聊天、问答）
- **0.8-1.5**：创造性任务（写作、头脑风暴）
- **1.5-2.0**：高度创造性（诗歌、故事创作）

#####  invoke 和 stream 有什么区别？

- `invoke`：同步调用，等待完整响应后返回
- `stream`：流式调用，实时返回响应片段（我们将在后续模块学习）

```python
# invoke - 等待完整响应
response = model.invoke("写一首诗")
print(response.content)  # 一次性输出完整诗歌

# stream - 实时流式输出（后续学习）
for chunk in model.stream("写一首诗"):
    print(chunk.content, end="", flush=True)  # 逐字输出
```

##### 为什么推荐使用字典格式而不是消息对象？

两种方式都可以，但字典格式有以下优势：

- 更简洁，代码量更少
- 与 OpenAI API 格式一致
- 更容易序列化和存储
- JSON 兼容，便于网络传输



## Promote 提示模板

### Message 消息对象

#### SystemMessage

用于启动 AI 行为的消息。

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant! Your name is Bob."
    ),
    HumanMessage(
        content="What is your name?"
    )
]

# Define a chat model and invoke it with the messages
print(model.invoke(messages))
```



#### HumanMessage

来自人类的消息。

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant! Your name is Bob."
    ),
    HumanMessage(
        content="What is your name?"
    )
]

# Instantiate a chat model and invoke it with the messages
model = ...
print(model.invoke(messages))
```

#### AIMessage 

表示模型调用的输出。它们可以包含多模态数据、工具调用和提供商特定的元数据

```python
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

# 手动创建 AI 消息（例如，用于对话历史）
ai_msg = AIMessage("I'd be happy to help you with that question!")

# 添加到对话历史
messages = [
    SystemMessage("You are a helpful assistant"),
    HumanMessage("Can you help me?"),
    ai_msg,  # 插入就像来自模型一样
    HumanMessage("Great! What's 2+2?")
]

response = model.invoke(messages)
```

属性

- **text** (`string`)
  消息的文本内容。
- **content** (`string | dict[]`)
  消息的原始内容。
- **content_blocks** (`ContentBlock[]`)
  消息的标准化[内容块](https://langchain-doc.cn/v1/python/langchain/messages.html#消息内容)。
- **tool_calls** (`dict[] | None`)
  模型进行的工具调用。如果没有调用工具，则为空。
- **id** (`string`)
  消息的唯一标识符（由 LangChain 自动生成或在提供商响应中返回）
- **usage_metadata** (`dict | None`)
  消息的使用元数据，可包含可用时的令牌计数。
- **response_metadata** (`ResponseMetadata | None`)
  消息的响应元数据。

#### ToolMessage

工具消息， 用于将工具执行结果返回模型的消息。

```python
# 手动处理工具调用
from langchain_core.messages import ToolMessage

# 定义一个工具
def get_weather(location: str) -> str:
    """Get the weather at a location."""
    ...
    
# 1. 用户提问
messages = [HumanMessage(content="北京现在多少度？")]

# 2. AI 响应（包含工具调用）
ai_response = model.invoke(messages)
""" AI决定调用什么工具
ai_message = AIMessage(
    content=[],
    tool_calls=[{
        "name": "get_weather",
        "args": {"location": "北京"},
        "id": "call_123"
    }]
)
"""

# 3. 执行工具调用
tool_call = ai_response.tool_calls[0]
tool_result = get_weather(tool_call["args"]["location"])

# 4. 创建 ToolMessage
tool_message = ToolMessage(
    content=tool_result,  # 工具返回的内容
    tool_call_id=tool_call["id"],     # 对应的工具调用ID
    # 可选的其他参数
    name="weather_tool",           # 工具名称
    additional_kwargs={}           # 额外参数
)

# 5. 将 ToolMessage 添加到消息历史
messages.extend([ai_response, tool_message])

# 6. AI 基于工具结果生成最终回答
final_response = model.invoke(messages)
```

### 基础模板

#### BasePromptTemplate

`BasePromptTemplate` 是 LangChain 中用于所有提示模板的基类，它定义了提示模板的基本结构和行为，为创建和格式化提示提供了统一的接口。

##### 模块继承树

![](./imgs/BasePromptTemplate 继承树.png)

##### 属性

- input_variables：一个字符串列表，包含了提示模板所需输入变量的名称。这些变量的值是格式化提示所必需的。

- optional_variables：一个字符串列表，包含了可选的变量名称，用于占位符或 MessagePlaceholder。这些变量会自动从提示中推断出来，用户不需要提供。

- input_types：一个字典，指定了提示模板期望的变量类型。如果未提供，则所有变量都被假定为字符串类型。

- output_parser：一个可选的 BaseOutputParser 对象，用于解析调用大语言模型（LLM）对格式化提示的输出。

- partial_variables：一个字典，包含了提示模板携带的部分变量。这些部分变量会填充模板，使得用户在每次调用提示时不需要传递它们。

- metadata：一个可选的字典，用于追踪提示的元数据。

- tags：一个可选的字符串列表，用于追踪提示的标签。

##### 主要方法

- 验证方法

  `validate_variable_names`：验证变量名不包含受限名称，如 "stop"，并检查输入变量和部分变量是否有重叠。

- 命名空间与序列化方法

  - `get_lc_namespace`：返回 LangChain 对象的命名空间，即 ["langchain", "schema", "prompt_template"]。

  - `is_lc_serializable`：返回该类是否可序列化，返回值为 True。

- 输入模式方法
  - `get_input_schema`：获取提示的输入模式，根据输入变量和可选变量创建一个 BaseModel 类型的输入模式。

- 输入验证与格式化方法

  - ``_validate_input`：验证输入是否为字典类型，并检查是否缺少必需的输入变量。

  - ``_format_prompt_with_error_handling`：处理输入验证并调用 `format_prompt` 方法创建提示值。

  - ``_aformat_prompt_with_error_handling`：异步处理输入验证并调用 `aformat_prompt` 方法创建提示值。

- 调用方法

  - `invoke`：同步调用提示，处理配置和元数据，并调用 `_format_prompt_with_error_handling` 方法。

  - `ainvoke`：异步调用提示，处理配置和元数据，并调用 `_aformat_prompt_with_error_handling` 方法。

- 抽象方法

  - `format_prompt`：创建提示值，需要在子类中实现。

  - `aformat_prompt`：异步创建提示值，默认调用 `format_prompt` 方法。

  - `format`：使用输入格式化提示，需要在子类中实现。

  - `aformat`：异步使用输入格式化提示，默认调用 `format` 方法。

  - `_prompt_type`：返回提示类型的键，需要在子类中实现。

- 其他方法

  - `partial`：返回提示模板的部分实例，设置部分变量并更新输入变量。

  - `_merge_partial_and_user_variables`：合并部分变量和用户提供的变量。

  - `dict`：返回提示的字典表示，包含提示类型（如果实现）。

  - `save`：将提示保存到指定的文件路径，支持 JSON 和 YAML 格式。

##### 相关子类

- **`StringPromptTemplate`**：用于处理字符串类型的提示模板，它继承了 `BasePromptTemplate` 的基本功能，并提供了同步和异步格式化提示的方法，支持使用不同的字符串格式化语法，如 f - 字符串、Jinja2、Mustache 等。

  `StringPromptTemplate` 的子类

  - `PromptTemplate`：最常用的提示模板类，它接受一个字符串模板和一组输入变量，通过格式化方法生成最终的提示字符串。支持 f - 字符串、Jinja2 和 Mustache 三种模板格式，但使用 Jinja2 时需要注意安全问题。

  - `FewShotPromptTemplate`：用于基于少量示例生成提示，通常用于需要提供示例来引导模型生成结果的场景。

  - `FewShotPromptWithTemplates`：与 FewShotPromptTemplate 类似，但支持使用模板来格式化示例。

- **`BaseChatPromptTemplate`** : 聊天提示模板的基类，派生出多个具体的聊天提示模板类

  - `AutoGPTPrompt`：用于 AutoGPT 场景的特定提示模板
  - `FewShotChatMessagePromptTemplate`：基于少样本学习的聊天提示模板
  - `ChatPromptTemplate`：通用的聊天提示模板类，可用于构建多轮对话的提示。
    - `AgentScratchPadChatPromptTemplate`：用于代理 scratch pad 场景的聊天提示模板。

##### BaseChatPromptTemplate

BaseChatPromptTemplate 是 LangChain 中用于处理聊天相关提示逻辑的基类。它为创建适用于聊天场景的提示模板提供了基础结构和通用方法，像处理对话历史、将模板变量填充到消息中等功能。该类定义了一些抽象方法，如 format_messages，要求子类实现具体的格式化逻辑，以生成符合聊天场景的消息列表。同时，它也提供了一些通用方法，如 format、aformat 等，用于将聊天模板格式化为字符串，方便与字符串型的语言模型交互或进行调试。



#### BaseMessagePromptTemplate

消息提示模板的基类，定义了格式化消息的抽象方法。

##### 模块继承树

![](./imgs/BaseMessagePromptTemplate 继承树.png)

##### 相关子类

- `MessagesPlaceholder`：用于占位符的消息提示模板。
- `BaseStringMessagePromptTemplate`：使用字符串提示模板的消息提示模板基类。
- `ChatMessagePromptTemplate`：通用的聊天消息提示模板。
- `HumanMessagePromptTemplate`：用于人类消息的提示模板。
- `AIMessagePromptTemplate`：用于 AI 消息的提示模板。
- `SystemMessagePromptTemplate`：用于系统消息的提示模板。

### 通用模板

#### PromptTemplate 

`PromptTemplate` 继承自 `StringPromptTemplate`，是一个通用的提示模板类。它可能提供了一些基本的模板变量替换功能，允许将用户指定的变量值插入到提示文本中。

```python
from langchain_core.prompts import PromptTemplate

# 方法 1：from_template（最简单，推荐）
template = PromptTemplate.from_template("你的模板文本 {variable_name}")
messages = template.format(variable_name="自定义文本")

# 方法 2：完整定义
template = PromptTemplate(
    input_variables=["variable_name_1", "variable_name_2"],
    template="你的模板文本 {variable_name_1} 和 {variable_name_2}"
)
messages = template.format(variable_name_1="自定义文本", variable_name_2="自定义文本")
```

##### 创建模板

###### 显式指定变量

```python
template = PromptTemplate(
    input_variables=["product", "feature"],
    template="为{product}写一句广告语，重点突出{feature}特点。"
)
```

###### from_template

| **参数名**          | **类型** | **描述**                                                     | **示例值**                          |
| ------------------- | -------- | ------------------------------------------------------------ | ----------------------------------- |
| `template`          | `str`    | **包含占位符的模板字符串**。这是 Prompt Template 的核心内容。 | `"请将 {text} 翻译成 {language}。"` |
| `template_format`   | `str`    | **模板格式** (可选，默认 `f-string`)。LangChain 支持不同的格式，如 `f-string` (最常见)、`jinja2` 或 `mustache`。 | `"f-string"`                        |
| `partial_variables` | `dict`   | **部分变量字典** (可选)。用于预先填充模板中的一些变量，使其在后续使用时不再需要传入。 | `{"language": "中文"}`              |
| `**kwargs`          | `Any`    | 传递给底层 `PromptTemplate` 构造函数的**其他参数**。         | -                                   |

```python
template = PromptTemplate.from_template(
    template="将以下文本翻译成{language}：\n{text}",
    partial_variables={"language": "中文"}
)
```

###### from_examples

```python
from langchain_core.prompts import PromptTemplate

# 1. 定义少样本示例
sentiment_examples = [
    "Text: 我爱这个产品！\nSentiment: 积极",
    "Text: 体验很差，再也不买了。\nSentiment: 消极",
]

# 2. 定义前缀 (指令)
sentiment_prefix = (
    "你是一个情感分析器。请根据提供的文本，将其情感分类为 '积极' 或 '消极'。\n"          
    "以下是几个示例："
)

# 3. 定义后缀 (用户输入模板)
# {review} 是用户将要提供的文本，因此它是 input_variables 之一
sentiment_suffix = "\nText: {review}\nSentiment:"

# 4. 使用 from_examples 创建 PromptTemplate
sentiment_prompt = PromptTemplate.from_examples(
    examples=sentiment_examples,
    suffix=sentiment_suffix,
    input_variables=["review"], # 对应 suffix 中的 {review}
    example_separator="\n---\n", # 例子之间的分割符号
    prefix=sentiment_prefix,
)

# 5. 打印最终的模板内容
print(sentiment_prompt.template)
```

```txt
你是一个情感分析器。请根据提供的文本，将其情感分类为 '积极' 或 '消极'。
以下是几个示例：
---
Text: 我爱这个产品！
Sentiment: 积极
---
Text: 体验很差，再也不买了。
Sentiment: 消极
---

Text: {review}
Sentiment:
```

###### from_file

从一个指定路径的文件中读取内容，并将该文件的内容作为 Prompt Template 的模板 (template)

`from_file` 方法非常适合管理较长或复杂的 Prompt Template，您可以将模板内容保存在单独的文件（如 `.txt` 或 `.yaml` 文件）中，而不是直接在 Python 代码中写很长的字符串。

```python
from langchain.prompts import PromptTemplate
from pathlib import Path

# 1. 确保模板文件存在
# 假设我们在这里创建这个文件
template_file_path = Path("./temp_translation_prompt.txt")
template_content = (
    "你是一位专业的翻译助手。请将以下文本从{source_lang}翻译成{target_lang}。\n\n"
    "输入: {text}\n"
    "翻译:"
)
template_file_path.write_text(template_content, encoding="utf-8")

# 2. 使用 from_file 创建 PromptTemplate
try:
    translation_prompt = PromptTemplate.from_file(
        template_file=template_file_path,
        encoding="utf-8",
        # 必须在这里指定 input_variables，它们对应文件内容中的占位符
        input_variables=["source_lang", "target_lang", "text"]
    )

    # 3. 验证 PromptTemplate
    print("✅ 成功加载 PromptTemplate。")
    print(f"Template Variables: {translation_prompt.input_variables}")

    # 4. 格式化并使用
    formatted_prompt = translation_prompt.format(
        source_lang="英文",
        target_lang="中文",
        text="Hello, how are you today?"
    )
    print("\n--- 格式化后的 Prompt ---\n")
    print(formatted_prompt)

finally:
    # 清理创建的临时文件
    template_file_path.unlink()
```



##### 使用模板

- format() -> str

  ```python
  template = PromptTemplate.from_template("你好 {name}")
  
  # 返回格式化后的字符串
  prompt_str = template.format(name="张三")
  print(prompt_str)  # "你好 张三"
  
  # 直接传递给模型
  response = model.invoke(prompt_str)
  ```

- invoke() -> PromptValue

  ```python
  template = PromptTemplate.from_template("你好 {name}")
  
  # 返回 PromptValue 对象
  prompt_value = template.invoke({"name": "张三"})
  ```

  `PromptValues` 可以转换为 LLM inputs 和 ChatModel inputs

  - `to_json` 
  - `to_string`
  - `to_messages`

  `PromptValue `这个中间类的存在的作用在于：**适配不同LLM的输入要求**，因为聊天模型需要输入消息，文本生成模型则需要输入字符串，PromptValue能够自由转换为字符串或消息，以适配不同 LLM 的输入要求，并且保持接口一致、逻辑清晰、易于维护。

  

- **`pretty_repr`** -> str

  获取提示模板的美观表示形式，可以选择是否以 HTML 格式返回。如果想使用html 格式，则需要配置`pretty_repr(html=true)。`

- **`pretty_print`**：打印提示模板的美观表示形式。



### 少样本学习模板

#### FewShotPromptTemplate

用于构造 **带有示例上下文（Few-Shot Examples）** 的提示模板系统。它的作用是：在正式提示之前，插入一组“**训练样例**”，让模型更好地理解输入模式，提高生成准确性，常用于分类、问答、意图识别等任务。

##### 基本用法

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
 
# 定义示例列表
examples = [
    {"question": "foo", "answer": "bar"},
    {"question": "baz", "answer": "foo"},
]
 
# 定义示例提示模板
example_prompt = PromptTemplate(
    input_variables=["question", "answer"],
    template="Question: {question}\nAnswer: {answer}"
)
 
# 创建 FewShotPromptTemplate 实例
few_shot_prompt = FewShotPromptTemplate(
    suffix="Now you try to answer the question: {input}", # 用户实际输入
    prefix="Here are some examples:", 
    input_variables=["input"], # 用户实际输入变量
    examples=examples, # 示例列表
    example_prompt=example_prompt, # 示例格式
    example_separator="\n\n", # 示例之间的分隔符
    template_format="f-string",
    validate_template=False # 是否验证模板 检查前缀、后缀和输入变量是否一致。
)
 
# 格式化提示
formatted_prompt = few_shot_prompt.format(input="What is the meaning of life?")
print(formatted_prompt)
```

##### 高级用法

当您的示例数量很多（比如几百个）时，一次性将所有示例都塞进 Prompt 是不可行的，因为这会超过 LLM 的上下文窗口限制。

在这种情况下，可以使用 **`ExampleSelector`** 代替固定的 `examples` 列表。它可以**动态地、智能地**从一个大型的示例集合中，根据当前的用户输入（即目标查询）**挑选出最相关、最有用的一小组示例**，并将这些示例提供给 `FewShotPromptTemplate`。

```python
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector
from langchain.prompts import FewShotPromptTemplate, PromptTemplate

# 1. 定义本地 embedding 模型
embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-large-zh-v1.5")


# 2. 定义示例
examples = [
    {"input": "狗", "output": "汪汪叫"},
    {"input": "苹果", "output": "水果"},
    {"input": "猫", "output": "喵喵叫"},
    {"input": "钢琴", "output": "乐器"},
]

# 3. 构建向量相似度选择器 selector
selector = SemanticSimilarityExampleSelector.from_examples(
    examples=examples,
    embeddings=embedding_model,
    vectorstore_cls=FAISS,
    k=2
)

# 4. 构建 Prompt 模板
example_prompt = PromptTemplate.from_template("输入：{input}\n输出：{output}")
prompt = FewShotPromptTemplate(
    example_selector=selector,
    example_prompt=example_prompt,
    suffix="输入：{input}\n输出：",
    input_variables=["input"]
)

# 5. 格式化并查看实际 Prompt
print(prompt.format(input="小提琴"))
```

详解请看`自定义示例选择器 ExampleSelector` 章节

#### FewShotPromptWithTemplates

与 FewShotPromptTemplate 类似，但支持使用模板来格式化示例。

在 FewShotPromptTemplate 中  suffix 与 prefix 都是 string 类型， 但是在 FewShotPromptWithTemplates

要求是 StringPromptTemplate 类型

```python
from langchain_core.prompts import FewShotPromptWithTemplates, PromptTemplate
 
# 定义示例列表
examples = [
    {"question": "foo", "answer": "bar"},
    {"question": "baz", "answer": "foo"},
]
 
# 定义示例提示模板
example_prompt = PromptTemplate(
    input_variables=["question", "answer"],
    template="Question: {question}\nAnswer: {answer}"
)
 
# 定义前缀和后缀模板
prefix = PromptTemplate(
    input_variables=["topic"],
    template="Here are some examples about {topic}:"
)
suffix = PromptTemplate(
    input_variables=["input"],
    template="Now you try to answer the question: {input}"
)
 
# 创建 FewShotPromptWithTemplates 实例
few_shot_prompt = FewShotPromptWithTemplates(
    suffix=suffix,
    prefix=prefix,
    input_variables=["topic", "input"],
    examples=examples,
    example_prompt=example_prompt,
    example_separator="\n\n",
    template_format="f-string",
    validate_template=False
)
 
# 格式化提示
formatted_prompt = few_shot_prompt.format(topic="general knowledge", input="What is the capital of France?")
print(formatted_prompt)
```

#### FewShotChatMessagePromptTemplate

基于少样本学习的聊天提示模板类

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
    SystemMessagePromptTemplate
)
 
# 定义示例列表
examples = [
    {
        "input": "北京有哪些著名的景点？",
        "output": "北京著名的景点有故宫、八达岭长城、颐和园等。"
    },
    {
        "input": "上海有什么特色美食？",
        "output": "上海的特色美食有生煎包、蟹壳黄、排骨年糕等。"
    } 
]
 
# 定义示例选择器（这里简单使用示例列表，未使用更复杂的选择器）
example_selector = None
 
# 定义示例提示模板
example_prompt = ChatPromptTemplate.from_messages([
    HumanMessagePromptTemplate.from_template("{input}"),
    AIMessagePromptTemplate.from_template("{output}")
])
 
# 定义系统消息模板
system_template = SystemMessagePromptTemplate.from_template(
    "你是一个知识丰富的旅游助手，能准确回答各种旅游相关的问题。"
)
 
# 创建 FewShotChatMessagePromptTemplate 实例
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_selector=example_selector,
    examples=examples,
    example_prompt=example_prompt,
    suffix=[
        HumanMessagePromptTemplate.from_template("{input}")
    ],
    input_variables=["input"]
)
 
# 定义最终的聊天提示模板，结合系统消息和少量示例提示
chat_prompt = ChatPromptTemplate.from_messages([
    system_template,
    few_shot_prompt
])
 
# 定义输入变量的值
input_values = {
    "input": "广州有哪些好玩的地方？"
}
 
# 格式化提示模板，生成消息列表
messages = chat_prompt.format_messages(**input_values)
 
# 打印生成的消息列表
for message in messages:
    print(f"{message.__class__.__name__}: {message.content}")
```



####  ExampleSelector

```python
class BaseExampleSelector(ABC):
    """Interface for selecting examples to include in prompts."""

    @abstractmethod
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the inputs."""
        
    @abstractmethod
    def add_example(self, example: Dict[str, str]) -> Any:
        """Add new example to store."""

```

add_example。目的是向selector中添加一个example。

select_examples，主要目的就是根据input，从examples中找出要select出来的内容。

##### LengthBasedExampleSelector

基于长度选择

```python
def add_example(self, example: Dict[str, str]) -> None:
    """Add new example to list."""
    self.examples.append(example)
    string_example = self.example_prompt.format(**example)
    self.example_text_lengths.append(self.get_text_length(string_example))
```

add_example的逻辑是先把example添加到examples这个list中。

然后使用example_prompt对example进行格式化，得到最终的输出。

最后再把最后输出的text长度添加到 example_text_lengths 数组中。

```python
def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
    """Select which examples to use based on the input lengths."""
    inputs = " ".join(input_variables.values())
    remaining_length = self.max_length - self.get_text_length(inputs)
    i = 0
    examples = []
    while remaining_length > 0 and i < len(self.examples):
        new_length = remaining_length - self.example_text_lengths[i]
        if new_length < 0:
            break
        else:
            examples.append(self.examples[i])
            remaining_length = new_length
        i += 1
    return examples
```

select_examples方法实际上就是用max_length减去输入text的长度，然后再去匹配example_text的长度，匹配一个减去一个，最终得到特定长度的examples。

这个selector的最主要作用就是防止耗尽context window。因为对于大多数大语言模型来说，用户的输入是有长度限制的。

如果超出了输入长度，会产生意想不到的结果。

示例

```python
examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
    {"input": "energetic", "output": "lethargic"},
    {"input": "sunny", "output": "gloomy"},
    {"input": "windy", "output": "calm"},

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="Input: {input}\nOutput: {output}",
)
example_selector = LengthBasedExampleSelector(
    examples=examples, 
    example_prompt=example_prompt, 
    max_length=25,
)
```

##### SemanticSimilarityExampleSelector

语义相似度选择

它使用**嵌入模型 (Embeddings)** 将所有示例和当前的输入查询都转换成向量，然后计算向量之间的**相似度**（通常是余弦相似度）。它会选择与当前输入在向量空间中最相似的 K 个示例。

需要一个 **嵌入模型** (`Embeddings`) 和一个 **向量存储** (`VectorStore`) 来存储和检索示例的向量。

```python
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings # 或者其他嵌入模型

# 1. 准备示例和嵌入模型（这里使用一个假设的例子）
examples = [
    {"input": "下雨天怎么办？", "output": "穿雨衣"},
    {"input": "今天天气真好！", "output": "积极"},
    {"input": "苹果公司的市值。", "output": "搜索财经信息"},
    # ... 更多示例
]

# 2. 初始化嵌入模型和向量存储
# 实际使用时需要配置API key等
embeddings = OpenAIEmbeddings() 
vectorstore = Chroma.from_examples(
    examples,
    embeddings,
    metadatas=[{"id": i} for i in range(len(examples))],
)

# 3. 创建 ExampleSelector
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2, # 每次选择最相似的 2 个示例
    input_keys=["input"], # 告诉选择器根据哪个键进行相似度比较
)

# 4. 在 FewShotPromptTemplate 中使用它
# ... (结合 FewShotPromptTemplate 使用)
```

##### MaxMarginalRelevanceExampleSelector

最大边际相关性选择

这是一个更高级的相似度选择器。它首先选择**与输入最相似**的示例（相关性），然后依次添加那些**与已选示例最不相似**的示例（多样性）。这确保了被选择的示例不仅相关，而且彼此之间具有较高的多样性。

与语义相似度选择器相同（嵌入模型 + 向量存储）。

**适用场景：** 当你希望 Prompt 中的示例能够覆盖更广泛的主题范围，防止模型只聚焦于一个狭窄的子领域时。



### 聊天对话模板

#### ChatPromptTemplate

`ChatPromptTemplate` 用于创建**聊天格式的消息**，支持多种角色（system、user、assistant）。

```python
from langchain_core.messages import ChatPromptTemplate

messages = [
    ("system", "你是一个编程助手"),
    ("human", "你好，请问怎么用{language}输出{text}?")
]

chat_template = ChatPromptTemplate.from_messages(messages)
prompt = chat_template.invoke({"language": "python", "text": "hello world"})
print(prompt.to_messages()) # 查看message的构成


if __name__ == '__main__':
    # 流式输出
    for chunk in DeepSeekModel.stream(prompt):
        print(chunk.content, end="")
```

##### 创建模板

###### from_messages

从各种消息格式创建聊天提示模板。

- 元组格式

  ```python
  from langchain_core.messages import ChatPromptTemplate
  
  template = ChatPromptTemplate.from_messages([
      ("human", "Hello, how are you?"),
      ("ai", "I'm doing well, thanks!"),
      ("human", "That's good to hear."),
  ])
  ```

- 消息对象格式

  ```python
  from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
  from langchain_core.messages import ChatPromptTemplate
  
  template = ChatPromptTemplate.from_messages([
      HumanMessage("human", "Hello, how are you?"),
      AIMessage("ai", "I'm doing well, thanks!"),
      HumanMessage("human", "That's good to hear."),
  ])
  ```

###### from_template

创建一个聊天模板，该模板包含假定来自人类的单个消息。

```python
from langchain_core.messages import ChatPromptTemplate

template_string = """把由三个反引号分隔的文本\
翻译成一种{style}风格。\
文本: ```{text}```
"""


customer_style = """正式普通话 \
用一个平静、尊敬的语气
"""

customer_text = """
嗯呐，我现在可是火冒三丈，我那个搅拌机盖子竟然飞了出去，把我厨房的墙壁都溅上了果汁！
更糟糕的是，保修条款可不包括清理我厨房的费用。
伙计，赶紧给我过来！
"""

chat_template = ChatPromptTemplate.from_template(template_string)

# 使用提示模版
customer_messages = chat_template.format_messages(style=customer_style,text=customer_text)

```



##### 使用模板

- format_messages -> list[BaseMessage]

  将聊天模板格式化为最终消息列表。

  ```python
  chat_template = ChatPromptTemplate.from_messages(
      [
          ("system", "You are a helpful AI bot. Your name is {name}."),
          ("human", "Hello, how are you doing?"),
          ("ai", "I'm doing well, thanks!"),
          ("human", "{user_input}"),
      ]
  )
  
  messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
  
  # 直接传递给模型
  response = model.invoke(messages)
  ```

- invoke -> ChatPromptValue

  ```python
  # 返回 ChatPromptValue 对象
  prompt_value = template.invoke({
      "role": "助手",
      "input": "你好"
  })
  
  # 获取消息列表
  messages = prompt_value.to_messages()
  
  # 直接传递给模型
  response = model.invoke(messages)
  ```

- format_prompt -> ChatPromptValue

  ```python
  chat_template = ChatPromptTemplate.from_messages(
      [
          ("system", "You are a helpful AI bot. Your name is {name}."),
          ("human", "Hello, how are you doing?"),
          ("ai", "I'm doing well, thanks!"),
          ("human", "{user_input}"),
      ]
  )
  
  prompt_value = chat_template.format_prompt(name="Bob", user_input="What is your name?")
  
  response = model.invoke(prompt_value.to_messages())
  ```

  





##### 高级特性

###### 部分变量（Partial Variables）

预填充某些固定不变的变量，创建模板的变体。

**使用场景：**

- 某些变量在所有调用中都相同
- 需要为不同用户/场景创建定制模板

**语法：**

```python
# 原始模板
template = ChatPromptTemplate.from_messages([
    ("system", "你是{role}，目标用户是{audience}"),
    ("user", "{task}")
])

# 部分填充
customer_support_template = template.partial(
    role="客服专员",
    audience="普通用户"
)

# 现在只需要提供 task
messages = customer_support_template.format_messages(
    task="解释退款政策"
)
```

**实用示例：**

```python
# 基础翻译模板
translator = ChatPromptTemplate.from_messages([
    ("system", "你是专业翻译，精通{source}和{target}"),
    ("user", "翻译：{text}")
])

# 创建英译中的专用模板
en_to_zh = translator.partial(source="英语", target="中文")

# 创建中译英的专用模板
zh_to_en = translator.partial(source="中文", target="英语")

# 使用
messages1 = en_to_zh.format_messages(text="Hello")
messages2 = zh_to_en.format_messages(text="你好")
```

###### 模板组合

```python
template1 = ChatPromptTemplate.from_messages([
    ("system", "你是助手")
])

template2 = ChatPromptTemplate.from_messages([
    ("user", "{input}")
])

# 组合（LangChain 1.0 支持）
combined = template1 + template2
```



#### MessagePromptTemplate

用于表示**尚未填充数据**的聊天消息的**模板**。

LangChain 提供了不同种类的 `MessagePromptTemplate`。

其中，最常用的模板包括 `AIMessagePromptTemplate`、`SystemMessagePromptTemplate` 和 `HumanMessagePromptTemplate`，它们分别用于生成 AI 消息、系统消息和面向人类的消息。

当聊天模型能够处理带有任意指定角色的消息时，你可以选用 `ChatMessagePromptTemplate`。这种模板使得用户能够自由定义角色名称。

```python
from langchain_core.prompts import ChatPromptTemplate, AIMessagePromptTemplate, HumanMessagePromptTemplate

messages = [
    SystemMessage(content="你是一个编程助手"),
    HumanMessagePromptTemplate.from_template("你好，请问怎么用{language}输出{text}?")
]

chat_prompt = ChatPromptTemplate.from_messages(messages)

chat_prompt_value = chat_prompt.format_prompt(language="python", text="hello world")

print(chat_prompt_value.to_messages())  # 查看message的构成

#################################################################
# 上面的写法其实很繁琐，最推荐使用元组形式

messages = [
    ("system", "你是一个编程助手"),
    ("human", "你好，请问怎么用{language}输出{text}?")
]

chat_prompt = ChatPromptTemplate.from_messages(messages)

chat_prompt_value = chat_prompt.format_prompt(language="python", text="hello world")

print(chat_prompt_value.to_messages())  # 查看message的构成

```



**ChatMessagePromptTemplate**

自定义角色

```python
from langchain_core.prompts import ChatPromptTemplate, ChatMessagePromptTemplate

# 1. 定义一个用于工具反馈的消息模板
# 角色被自定义为 "Tool_Output"
tool_output_template = ChatMessagePromptTemplate.from_template(
    template="工具 {tool_name} 返回以下结果：\n{result}",
    role="Tool_Output" 
)

# 2. 定义一个标准的人类消息模板
human_input_template = ChatMessagePromptTemplate.from_template(
    template="请根据上面的工具输出，回答我的问题：{question}",
    role="Human"
)

# 3. 将它们组合成一个 ChatPromptTemplate
prompt = ChatPromptTemplate.from_messages([
    tool_output_template,
    human_input_template
])

# 4. 传入变量并生成最终消息
final_prompt_value = prompt.invoke({
    "tool_name": "Calculator",
    "result": "2 + 2 = 4",
    "question": "2加2等于多少？"
})

print("--- 最终生成的 Chat 消息 ---")
print(final_prompt_value.to_messages())
```



#### MessagesPlaceholder

LangChain还为Message提供了占用符，我们可以使用`MessagesPlaceholder`来作为Message在占位符，这样我们可以根据实际的需要，在格式化prompt的时候动态地插入Message。

```python
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

messages = [
    HumanMessage(content="你好，我叫Mrhow，你叫什么？"),
    AIMessage(content="我叫小爱同学")
]
human_message = HumanMessage(content="你这个名字有什么含义吗？")

chat_prompt = ChatPromptTemplate.from_messages([MessagesPlaceholder(variable_name="Greeting"), human_message])

chat_prompt = chat_prompt.format_prompt(Greeting=messages)

print(chat_prompt.to_messages())  # 查看message的构成


if __name__ == '__main__':
    # 流式输出
    for chunk in DeepSeekModel.stream(chat_prompt):
        print(chunk.content, end="")
```

在上述代码中，在chat_prompt中定义了一个名为Greeting的Message占位符，然后当chat_prompt调用format_prompt方法的时候，动态地将messages插入到占位符位置，从而替换占位符。

### FAQ

####  FewShotPromptTemplate 与 PromptTemplate.form_example 有什么区别？

| **特性**         | **FewShotPromptTemplate**                                    | **PromptTemplate.from_examples**                             |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **底层类型**     | 一个独立的类，专为 Few-Shot 设计。                           | 是 `PromptTemplate` 类的一个静态方法。                       |
| **示例格式化**   | **高度灵活**。使用一个单独的 `example_prompt` (PromptTemplate 实例) 来格式化每个示例。 | **固定格式**。要求所有示例 (`examples: list[str]`) 已经是格式化好的字符串。 |
| **动态示例选择** | **支持**。可以通过 `example_selector` 参数实现动态地选择示例（如语义相似度）。 | **不支持**。只能使用传入的固定 `examples` 列表。             |
| **复杂度**       | 较高。需要定义 `example_prompt`、`examples` 或 `example_selector`。 | 较低。只需要传入格式化好的字符串列表和前缀/后缀。            |
| **设计目的**     | 结构化地管理和动态选择示例，适应大规模 Few-Shot 场景。       | 快速、简单地将少量固定示例组装到 Prompt 中。                 |

| **场景**          | **推荐使用**                       | **原因**                                                     |
| ----------------- | ---------------------------------- | ------------------------------------------------------------ |
| **简单/少量示例** | **`PromptTemplate.from_examples`** | 如果示例数量少、格式固定，且不需要动态选择，这是最快、最简洁的实现方式。 |
| **复杂/大量示例** | **`FewShotPromptTemplate`**        | 如果示例数量多、需要根据用户输入动态选择示例（使用 `example_selector`），或者你需要灵活控制每个示例的格式，那么它提供了必要的结构和能力。 |



#### PromptTemplate 和 ChatPromptTemplate 有什么区别?

| 特性     | PromptTemplate | ChatPromptTemplate    |
| -------- | -------------- | --------------------- |
| 输出     | 字符串         | 消息列表              |
| 角色     | 无             | system/user/assistant |
| 适用场景 | 简单提示       | 聊天、对话            |

**建议：**

- 简单场景 → `PromptTemplate`
- 聊天场景 → `ChatPromptTemplate`（推荐）

#### 如何在模板中使用换行和特殊字符？

使用三引号字符串：

```python
template = PromptTemplate.from_template("""
你是一个{role}。

请完成以下任务：
1. {task1}
2. {task2}

注意事项：
- {note1}
- {note2}
""")
```



#### MessagePromptTemplate 与 消息对象 的区别是什么？

**`Message` 对象** 是 **`MessagePromptTemplate`** 被 **实例化 (Instantiated)** 后的结果。当所有的 `{}` 变量都被真实数据替换掉，模板对象就**解析 (Resolve)** 成一个具体的 `Message` 对象。

$$\text{MessagePromptTemplate} \xrightarrow{\text{输入变量}} \text{Message}$$

## Tools 工具

工具封装了一个可调用函数及其输入模式。这些可以传递给兼容[的聊天模型 ](https://docs.langchain.com/oss/python/langchain/models)，使模型决定是否调用某个工具以及使用何种参数。

### 创建工具

创建工具最简单的方法是使用 `@tool` 装饰器。默认情况下，函数的文档字符串会成为工具的描述，帮助模型了解何时使用：

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """
    获取指定城市的天气信息

    参数:
        city: 城市名称，如"北京"、"上海"

    返回:
        天气信息字符串
    """
    # 你的实现
    return "晴天，温度 15°C"
```

**类型提示是必需**的，因为它们定义了工具的输入模式。文档字符串应信息丰富且简洁，帮助模型理解工具的目的。

#### 工具属性

创建工具后，可以查看其属性：

```python
@tool
def my_tool(param: str) -> str:
    """工具描述"""
    ...

print(my_tool.name)         # "my_tool"
print(my_tool.description)  # "工具描述"
print(my_tool.args)         # 参数模式
```



#### 自定义信息

##### 自定义工具名称

默认情况下，工具名称来源于函数名。需要更具体的描述时可以覆盖它：

```python
@tool("web_search")  # Custom name
def search(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

print(search.name)  # web_search
```

##### 自定义工具描述

```python
@tool("calculator", description="Performs arithmetic calculations. Use this for any math problems.")
def calc(expression: str) -> str:
    """Evaluate mathematical expressions.""" # ai就不会读取该描述
    return str(eval(expression))
```

##### 自定义输入信息

```python
from pydantic import BaseModel, Field
from typing import Literal

class WeatherInput(BaseModel):
    """Input for weather queries."""
    location: str = Field(description="City name or coordinates")
    units: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="Temperature unit preference"
    )
    include_forecast: bool = Field(
        default=False,
        description="Include 5-day forecast"
    )

@tool(args_schema=WeatherInput)
def get_weather(location: str, units: str = "celsius", include_forecast: bool = False) -> str:
    """Get current weather and optional forecast."""
    temp = 22 if units == "celsius" else 72
    result = f"Current weather in {location}: {temp} degrees {units[0].upper()}"
    if include_forecast:
        result += "\nNext 5 days: Sunny"
    return result
```



### 使用工具

#### 直接调用

==测试使用==

```python
# 使用 .invoke() 方法
result = get_weather.invoke({"city": "北京"})
print(result)  # "晴天，温度 15°C"
```

#### 绑定到模型

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("groq:llama-3.3-70b-versatile")

# 绑定工具
model_with_tools = model.bind_tools([get_weather])

# AI 可以决定是否调用工具
response = model_with_tools.invoke("北京天气如何？")

# 检查 AI 是否要调用工具
if response.tool_calls:
    print("AI 想调用工具：", response.tool_calls)
else:
    print("AI 直接回答：", response.content)
```



### 访问上下文

工具可以通过 `ToolRuntime` 参数访问运行时信息，这些参数对于模型是隐藏的。

`runtime: ToolRuntime` 对于模型来说不是一个需要传递的变量，它是自动注入的，即不会暴露给模型。

```python
from langchain_core.tools import tool
from langchain.tools import ToolRuntime

@tool
def my_tool(x: int, runtime: ToolRuntime) -> str:
    """Tool that accesses runtime context."""
    # Access state
    messages = runtime.state["messages"]

    # Access tool_call_id
    print(f"Tool call ID: {runtime.tool_call_id}")

    # Access config
    print(f"Run ID: {runtime.config.get('run_id')}")

    # Access runtime context
    user_id = runtime.context.get("user_id")

    # Access store
    runtime.store.put(("metrics",), "count", 1)

    # Stream output
    runtime.stream_writer.write("Processing...")

    return f"Processed {x}"
```

`ToolRuntime` 参数 为工具提供状态、上下文、存储、流式传输、配置和工具调用 ID 访问。

运行时会自动为工具函数提供这些功能，无需你显式传递或使用全局状态

#### ToolRuntime 参数

- state

  在执行过程中流动的可变数据（例如，消息、计数器、自定义字段）

  ```python
  from langchain.tools import tool, ToolRuntime
  
  # 访问当前对话状态
  @tool
  def summarize_conversation(
      runtime: ToolRuntime
  ) -> str:
      """Summarize the conversation so far."""
      messages = runtime.state["messages"]
  
      human_msgs = sum(1 for m in messages if m.__class__.__name__ == "HumanMessage")
      ai_msgs = sum(1 for m in messages if m.__class__.__name__ == "AIMessage")
      tool_msgs = sum(1 for m in messages if m.__class__.__name__ == "ToolMessage")
  
      return f"Conversation has {human_msgs} user messages, {ai_msgs} AI responses, and {tool_msgs} tool results"
  
  ```

- tool_call_id

  当前工具调用的 ID

- config

  当前运行着的 `RunnableConfig`

- context

  运行时上下文，不可变配置，如用户 ID、会话详情或应用特定配置

  ```python
  from dataclasses import dataclass
  from langchain_openai import ChatOpenAI
  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  
  
  USER_DATABASE = {
      "user123": {
          "name": "Alice Johnson",
          "account_type": "Premium",
          "balance": 5000,
          "email": "alice@example.com"
      },
      "user456": {
          "name": "Bob Smith",
          "account_type": "Standard",
          "balance": 1200,
          "email": "bob@example.com"
      }
  }
  
  @dataclass
  class UserContext:
      user_id: str
  
  @tool
  def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
      """Get the current user's account information."""
      user_id = runtime.context.user_id
  
      if user_id in USER_DATABASE:
          user = USER_DATABASE[user_id]
          return f"Account holder: {user['name']}\nType: {user['account_type']}\nBalance: ${user['balance']}"
      return "User not found"
  
  model = ChatOpenAI(model="gpt-4o")
  agent = create_agent(
      model,
      tools=[get_account_info],
      context_schema=UserContext,
      system_prompt="You are a financial assistant."
  )
  
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "What's my current balance?"}]},
      context=UserContext(user_id="user123")
  )
  ```

- store

  跨对话的持久长期记忆

  ```python
  from typing import Any
  from langgraph.store.memory import InMemoryStore
  from langchain.agents import create_agent
  from langchain.tools import tool, ToolRuntime
  
  
  # Access memory
  @tool
  def get_user_info(user_id: str, runtime: ToolRuntime) -> str:
      """Look up user info."""
      store = runtime.store
      user_info = store.get(("users",), user_id)
      return str(user_info.value) if user_info else "Unknown user"
  
  # Update memory
  @tool
  def save_user_info(user_id: str, user_info: dict[str, Any], runtime: ToolRuntime) -> str:
      """Save user info."""
      store = runtime.store
      store.put(("users",), user_id, user_info)
      return "Successfully saved user info."
  
  store = InMemoryStore()
  agent = create_agent(
      model,
      tools=[get_user_info, save_user_info],
      store=store
  )
  
  # First session: save user info
  agent.invoke({
      "messages": [{"role": "user", "content": "Save the following user: userid: abc123, name: Foo, age: 25, email: foo@langchain.dev"}]
  })
  
  # Second session: get user info
  agent.invoke({
      "messages": [{"role": "user", "content": "Get user info for user with id 'abc123'"}]
  })
  # Here is the user info for user with ID "abc123":
  # - Name: Foo
  # - Age: 25
  # - Email: foo@langchain.dev
  ```

- stream_writer

  在工具`runtime.stream_writer`执行时，流式传输自定义更新。这有助于向用户实时反馈工具的工作。

  ```python
  from langchain.tools import tool, ToolRuntime
  
  @tool
  def get_weather(city: str, runtime: ToolRuntime) -> str:
      """Get weather for a given city."""
      writer = runtime.stream_writer
  
      # Stream custom updates as the tool executes
      writer(f"Looking up data for city: {city}")
      writer(f"Acquired data for city: {city}")
  
      return f"It's always sunny in {city}!"
  
  # 如果你在工具内部使用 runtime.stream_writer，必须在 LangGraph 执行上下文中调用该工具。详情请参见langGraph 的 流媒体 章节。
  ```




## Agents 代理

**Agent = 模型 + 工具 + 自动决策**

智能体将语言模型与[工具](https://docs.langchain.com/oss/python/langchain/tools)结合起来，创建能够推理任务、决定使用哪些工具并迭代寻找解决方案的系统。

Agent 的关键能力：

- 理解用户问题
- 自动判断是否需要工具
- 选择合适的工具
- 基于工具结果生成回答

![](./imgs/agent 内部运行流程.png)

### 创建

#### create_agent

```python
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

agent = create_agent(
    model=init_chat_model("groq:llama-3.3-70b-versatile"),
    tools=[tool1, tool2],
    system_prompt="Agent 的行为指令"  # 可选
)

response = agent.invoke({
    "messages": [{"role": "user", "content": "问题"}]
})
```

- model

  - 静态模型

    静态模型在创建代理时配置一次，执行过程中保持不变。这是最常见且最直接的方法。

    ```python
    from langchain.chat_models import init_chat_model
    
    DeepSeekModel = init_chat_model(
        model="deepseek-chat",
        model_provider="deepseek",
        api_key=os.environ["API_KEY"],
        base_url="https://api.deepseek.com")
    
    agent = create_agent(
        model=DeepSeekModel,
        tools=[tool1, tool2],
        system_prompt="Agent 的行为指令"  # 可选
    )
    ```

  - 动态模型

    要使用动态模型, 需要使用 `@wrap_model_call` 装饰器创建中间件

    ```python
    from langchain.agents import create_agent
    from langchain_openai import ChatOpenAI
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    
    DeepSeekModel = init_chat_model(
        model="deepseek-chat",
        model_provider="deepseek",
        api_key=os.environ["API_KEY"],
        base_url="https://api.deepseek.com")
    
    OpenAIModel = ChatOpenAI(
        model="gpt-5",
        temperature=0.1,
        max_tokens=1000,
        timeout=30
        # ... (other params)
    )
    
    @wrap_model_call
    def dynamic_model_selection(request: ModelRequest, handler) -> ModelResponse:
        """Choose model based on conversation complexity."""
        message_count = len(request.state["messages"])
    
        if message_count > 10:
            # Use an advanced model for longer conversations
            model = advanced_model
        else:
            model = basic_model
    
        return handler(request.override(model=model))
    
    agent = create_agent(
        model=basic_model,  # Default model
        tools=tools,
        middleware=[dynamic_model_selection]
    )
    ```

    详情请见 `中间件- 包裹式钩子`

- tools

  工具即可以是普通的python 函数 也可以是 协程函数。

  如果提供空工具列表，代理将由一个没有工具调用功能的 LLM 节点组成。

  ```python
  from langchain.tools import tool
  from langchain.agents import create_agent
  
  
  @tool
  def search(query: str) -> str:
      """Search for information."""
      return f"Results for: {query}"
  
  @tool
  def get_weather(location: str) -> str:
      """Get weather information for a location."""
      return f"Weather in {location}: Sunny, 72°F"
  
  agent = create_agent(model, tools=[search, get_weather])
  ```

  自定义处理工具异常。 使用 `@wrap_tool_call` 构建中间件

  ```python
  from langchain.agents import create_agent
  from langchain.agents.middleware import wrap_tool_call
  from langchain.messages import ToolMessage
  
  
  @wrap_tool_call
  def handle_tool_errors(request, handler):
      """Handle tool execution errors with custom messages."""
      try:
          return handler(request)
      except Exception as e:
          # Return a custom error message to the model
          return ToolMessage(
              content=f"Tool error: Please check your input and try again. ({str(e)})",
              tool_call_id=request.tool_call["id"]
          )
  
  agent = create_agent(
      model="gpt-4o",
      tools=[search, get_weather],
      middleware=[handle_tool_errors]
  )
  ```

- system_prompt

  当没有提供 system_prompt 时，代理会直接从消息推断出任务

  该字段 类型 即可以是 str， 也可以是  `SystemMessage` 类型

  

  动态系统提示

  对于需要根据运行时上下文或代理状态修改系统提示符的高级用例，可以使用中间件

  @dynamic_prompt 装饰器创建中间件，根据模型请求生成系统提示：

  ```python
  from typing import TypedDict
  
  from langchain.agents import create_agent
  from langchain.agents.middleware import dynamic_prompt, ModelRequest
  
  
  class Context(TypedDict):
      user_role: str
  
  @dynamic_prompt
  def user_role_prompt(request: ModelRequest) -> str:
      """Generate system prompt based on user role."""
      user_role = request.runtime.context.get("user_role", "user")
      base_prompt = "You are a helpful assistant."
  
      if user_role == "expert":
          return f"{base_prompt} Provide detailed technical responses."
      elif user_role == "beginner":
          return f"{base_prompt} Explain concepts simply and avoid jargon."
  
      return base_prompt
  
  agent = create_agent(
      model="gpt-4o",
      tools=[web_search],
      middleware=[user_role_prompt],
      context_schema=Context
  )
  
  # The system prompt will be set dynamically based on context
  result = agent.invoke(
      {"messages": [{"role": "user", "content": "Explain machine learning"}]},
      context={"user_role": "expert"}
  )
  ```

### 调用

#### invoke

```python
result = agent.invoke(
    {"messages": [{"role": "user", "content": "What's the weather in San Francisco?"}]}
)
```

Agent Loop

**Agent 执行循环 = 自动化的"思考-行动-观察"过程**

Agent 不是一次性调用，而是一个循环：

```
用户问题 → AI 思考 → 调用工具 → 观察结果 → 继续思考 → 最终答案
```

#### 查看执行过程

1. 查看完整历史

```python
response = agent.invoke({"messages": [...]})

for msg in response['messages']:
    print(f"{msg.__class__.__name__}: {msg.content}")
```

2. 获取最终答案

```python
# 最后一条消息就是最终答案
final_answer = response['messages'][-1].content
```

3. 查看使用的工具

```python
used_tools = []
for msg in response['messages']:
    if hasattr(msg, 'tool_calls') and msg.tool_calls:
        for tc in msg.tool_calls:
            used_tools.append(tc['name'])

print(f"使用的工具: {used_tools}")
```



#### 流式输出（Streaming）

**用于实时显示 Agent 的进度**

基本用法

```python
agent = create_agent(model=model, tools=tools)

# 使用 .stream() 方法
for chunk in agent.stream({"messages": [...]}):
    # chunk 是状态更新
    if 'messages' in chunk:
        latest_msg = chunk['messages'][-1]
        # 处理最新消息
        print(latest_msg.content)
        
for token, metadata in agent.stream(  
    {"messages": [{"role": "user", "content": "What is the weather in SF?"}]},
    stream_mode="messages",
):
    print(f"node: {metadata['langgraph_node']}")
    print(f"content: {token.content_blocks}")
    print("\n")
```

实时显示最终答案

```python
for chunk in agent.stream(input):
    if 'messages' in chunk:
        latest = chunk['messages'][-1]

        # 只显示最终答案（不包含 tool_calls）
        if hasattr(latest, 'content') and latest.content:
            if not hasattr(latest, 'tool_calls') or not latest.tool_calls:
                print(latest.content)
```

#### 消息类型

##### HumanMessage

用户的输入

```python
HumanMessage(content="北京天气如何？")
```

##### AIMessage（两种情况）

**情况1：调用工具**

```python
AIMessage(
    content="",
    tool_calls=[{
        'name': 'get_weather',
        'args': {'city': '北京'},
        'id': 'call_xxx'
    }]
)
```

**情况2：最终答案**

```python
AIMessage(content="北京今天晴天，温度 15°C")
```

##### ToolMessage

工具执行的结果

```python
ToolMessage(
    content="晴天，温度 15°C",
    name="get_weather"
)
```

##### SystemMessage

系统指令（通过 `system_prompt` 设置）

```python
agent = create_agent(
    model=model,
    tools=tools,
    system_prompt="你是一个helpful assistant"
)
```

#### 调试技巧

##### 1. 打印所有消息

```python
for i, msg in enumerate(response['messages'], 1):
    print(f"\n--- 消息 {i}: {msg.__class__.__name__} ---")

    if hasattr(msg, 'content'):
        print(f"内容: {msg.content}")

    if hasattr(msg, 'tool_calls') and msg.tool_calls:
        for tc in msg.tool_calls:
            print(f"工具: {tc['name']}, 参数: {tc['args']}")
```

##### 2. 使用 stream 查看步骤

```python
step = 0
for chunk in agent.stream(input):
    step += 1
    print(f"步骤 {step}:")
    if 'messages' in chunk:
        latest = chunk['messages'][-1]
        print(f"  类型: {latest.__class__.__name__}")
```

##### 3. 检查是否使用工具

```python
has_tool_calls = any(
    hasattr(msg, 'tool_calls') and msg.tool_calls
    for msg in response['messages']
)

if has_tool_calls:
    print("Agent 使用了工具")
else:
    print("Agent 直接回答")
```



### 结构化输出

LangChain Agent 通过 `create_agent` 函数的 `response_format` 参数来启用结构化输出。由于 LangChain 1.0 版本后的改进，您必须**显式**选择一种底层策略。

```python
def create_agent(
    ...
    response_format: Union[
        ToolStrategy[StructuredResponseT],
        ProviderStrategy[StructuredResponseT],
        type[StructuredResponseT],
    ]
```



- ToolStrategy

  使用 **工具调用（tool calling）** 实现结构化输出。

  ```python
  # Pydantic Model 示例
  from pydantic import BaseModel, Field
  from typing import Literal
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy
  
  
  class ProductReview(BaseModel):
      """对产品评论的分析。"""
      rating: int | None = Field(description="产品的评分", ge=1, le=5)
      sentiment: Literal["positive", "negative"] = Field(description="评论的情感倾向")
      key_points: list[str] = Field(description="评论的要点。小写，每条 1-3 个词。")
  
  agent = create_agent(
      model="openai:gpt-5",
      tools=tools,
      response_format=ToolStrategy(ProductReview)
  )
  
  result = agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })
  result["structured_response"]
  # ProductReview(rating=5, sentiment='positive', key_points=['fast shipping', 'expensive'])
  ```

  原理：

  当使用 `ToolStrategy(Schema)` 时，LangChain 框架在内部执行以下步骤：

  1. **创建虚拟工具：** 框架不会将您的 `ProductReview` Pydantic 模型当作一个普通的 Agent 工具，而是将其转化为一个**伪造的、仅用于数据捕获的工具**。
  2. **Schema 转换：** 您的 Pydantic 模型（如 `ProductReview`）被转换为 LLM API 可识别的 **JSON Schema**。这个 Schema 定义了 LLM 必须返回的字段 (`rating`, `sentiment`, `key_points`)。
  3. **强制 LLM 调用：** 框架指令 LLM：为了完成用户任务（例如分析评论），你**必须**调用这个伪造的工具。
  4. **数据填充：** LLM 根据用户输入，将提取到的数据填充到伪造工具的参数中（例如，将 "5 out of 5 stars" 填充到 `rating` 参数）。
  5. **提取结果：** Agent Executor 接收到 LLM 返回的**结构化工具调用对象**后，**不会真正执行**这个伪造工具。它会直接从调用对象中提取出填充好的参数字典，并将其反序列化为您的 `ProductReview` Pydantic 实例。

  

  自定义工具消息内容  `tool_message_content`

  该参数允许自定义生成结构化输出时，对话历史中显示的消息：

  ```python
  from pydantic import BaseModel, Field
  from typing import Literal
  from langchain.agents import create_agent
  from langchain.agents.structured_output import ToolStrategy
  
  
  class MeetingAction(BaseModel):
      """从会议记录中提取的行动事项。"""
      task: str = Field(description="需要完成的具体任务")
      assignee: str = Field(description="负责该任务的人员")
      priority: Literal["low", "medium", "high"] = Field(description="优先级")
  
  agent = create_agent(
      model="openai:gpt-5",
      tools=[],
      response_format=ToolStrategy(
          schema=MeetingAction,
          tool_message_content="行动事项已捕获并添加到会议记录中！"
      )
  )
  
  agent.invoke({
      "messages": [{"role": "user", "content": "From our meeting: Sarah needs to update the project timeline as soon as possible"}]
  })
  ```

  在上述示例中，最终的工具消息将是：

  

  ```
  ================================= Tool Message =================================
  Name: MeetingAction
  
  Action item captured and added to meeting notes!
  ```

  如果没有 `tool_message_content`，最终的 [`ToolMessage`](https://langchain-doc.cn/v1/python/langchain/[https:/reference.langchain.com/python/langchain/messages/#langchain.messages.ToolMessage](https://reference.langchain.com/python/langchain/messages/#langchain.messages.ToolMessage)) 将是：

  

  ```
  ================================= Tool Message =================================
  Name: MeetingAction
  
  Returning structured response: {'task': 'update the project timeline', 'assignee': 'Sarah', 'priority': 'high'}
  ```

  ### 为什么需要自定义？

  在结构化输出场景中，**LLM 的最终目标就是将数据填充到结构中**。

  1. **避免冗余：** 如果结构化数据非常复杂和冗长，将整个 JSON 结构作为 Tool Message 返回给 LLM 会浪费上下文 Token，并使 Agent 历史记录难以阅读。
  2. **流程确认：** 自定义消息如 `"数据已成功提取"` 或 `"联系信息已更新"` 是对 LLM 更清晰的**“成功信号”**。这个信号足以让 LLM 确认 Action 成功，并从“思考下一步 Action”模式切换到“生成 Final Answer”模式。

  

- ProviderStrategy

   使用 **提供商原生（provider-native）** 的结构化输出功能。

  现在的 大模型 都有自带的 结构化输出 设置（原生）。

  例如 DeepSeek 提供了 JSON Output 功能，来确保模型输出合法的 JSON 字符串。设置 `response_format` 参数为 `{'type': 'json_object'}`。

  当将模式类型直接传递给 `create_agent.response_format` 并且模型支持原生结构化输出时，LangChain 会自动使用 `ProviderStrategy`

  ```python
  from langchain.agents.structured_output import ProviderStrategy
  
  agent = create_agent(
      model="gpt-4o",
      response_format=ProviderStrategy(ContactInfo)
  )
  ```

  ### 优势：

  - **最高可靠性：** 模型的原生支持意味着格式偏离的可能性极小。
  - **效率：** 通常比依赖工具调用的通用方法更高效。
  
- AutoStrategy 自动选择最佳策略





### FAQ

#### Agent 不调用工具？

**原因：**

- 工具的 文档描述 不清晰
- 问题表述不明确
- 模型认为不需要工具

**解决：**

```python
# ❌ 不好
@tool
def tool1(x: str) -> str:
    """做一些事情"""  # 太模糊

# ✅ 好
@tool
def get_weather(city: str) -> str:
    """
    获取指定城市的实时天气信息

    参数:
        city: 城市名称，如"北京"、"上海"
    """
```

#### Agent 选错工具？

**原因：**

- 多个工具的功能描述相似
- 工具太多导致混淆

**解决：**

- 只给必要的工具
- 工具描述要有明确区分
- 在 system_prompt 中说明工具使用场景

#### Agent 返回什么？

```python
response = agent.invoke({"messages": [...]})

# response 是字典
{
    "messages": [
        HumanMessage(...),      # 用户问题
        AIMessage(...),          # AI 工具调用
        ToolMessage(...),        # 工具结果
        AIMessage(...)           # 最终回答 ← 通常取这个
    ]
}

# 获取最终回答
final_answer = response['messages'][-1].content
```

#### 如何知道 Agent 何时完成？

**当 AIMessage 不包含 tool_calls 时**

```python
for msg in response['messages']:
    if isinstance(msg, AIMessage):
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            print("还在调用工具...")
        else:
            print("完成！最终答案：", msg.content)
```

#### 如何限制工具调用次数？

LangChain 1.0 的 `create_agent` 默认使用 LangGraph，可以通过配置限制：

```python
# 注意：这是高级用法，后续会详细学习
config = {
    "recursion_limit": 5  # 最多 5 步
}

response = agent.invoke(input, config=config)
```



#### Agent的结构化输出 与 Model 的结构化输出的区别，能否在agent结构化输出直接用model的结构化输出？

**流程 vs. 格式**

**Agent 的结构化输出 (`ToolStrategy`/`ProviderStrategy`)** 是一种**顶层流程配置**。

- 它决定了 **Agent 流程如何结束**：是继续思考、调用工具，还是直接返回一个结构化的数据作为最终答案。
- 它利用了 LLM 的**函数调用能力**来**提取**数据，是 Agent 执行器层面的设计。

**模型的结构化输出 (`with_structured_output()`)** 是一种**底层组件能力**。

- 它仅仅是一个**数据格式化工具**，可以被 Agent 流程中的**任何一步**调用。
- 它只确保**单个 LLM 调用**的返回文本是结构化的，与 Agent 的多步循环逻辑无关。





## Memory 记忆

默认情况下，每次调用 `agent.invoke()` 都是全新的开始，不记得之前的对话。

### 短期记忆

短期记忆 通过在会话中保持消息历史来跟踪正在进行的对话。

LangGraph 将短期记忆作为 agent 的 state 一部分进行管理。状态通过 checkpoint 持久化到数据库，因此线程可以随时恢复。当图被调用或步骤完成时，短期记忆会更新，并在每步开始时读取状态。



#### AgentState

agent 可以通过 AgentState 自动维护对话历史， 使agent 可以记住额外信息。

定义自定义状态有两种方式：

- 通过中间件

  ```python
  from langchain.agents import AgentState
  from langchain.agents.middleware import AgentMiddleware
  from typing import Any
  
  
  class CustomState(AgentState):
      user_preferences: dict
  
  class CustomMiddleware(AgentMiddleware):
      state_schema = CustomState
      tools = [tool1, tool2]
  
      def before_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
          ...
  
  agent = create_agent(
      model,
      tools=tools,
      middleware=[CustomMiddleware()]
  )
  
  # The agent can now track additional state beyond messages
  result = agent.invoke({
      "messages": [{"role": "user", "content": "I prefer technical explanations"}],
      "user_preferences": {"style": "technical", "verbosity": "detailed"},
  })
  ```

  **`AgentState` 的作用:** 这是存储所有 Agent 运行时数据的容器，它通常包含：

  - **输入/输出：** 用户的最新输入和 Agent 的最新回复。
  - **会话历史：** 过去所有的对话记录。
  - **中间步骤：** Agent 之前的思考、行动和观察。
  - **自定义数据：** 任何你需要 Agent 记住的额外信息（例如：用户的偏好设置、数据库连接 ID 等）。

  **`AgentMiddleware` 的作用:**

  - **拦截 (Intercept):** 中间件允许您在 Agent 执行的**不同阶段**（例如，在 LLM 决定行动之前、在工具执行之后）插入自定义逻辑。
  - **修改状态:** 你可以在中间件中读取当前的 `AgentState`，并根据需要修改或更新它，然后将更新后的状态传递给下一步。

- 通过 `create_agent ` 的  `state_schema` 属性

  ```python
  from langchain.agents import AgentState
  
  
  class CustomState(AgentState):
      user_id: str
      user_preferences: dict
  
  agent = create_agent(
      model,
      tools=[tool1, tool2],
      state_schema=CustomState
  )
  # The agent can now track additional state beyond messages
  result = agent.invoke({
      "messages": [{"role": "user", "content": "I prefer technical explanations"}],
      "user_id": "user_123"
      "user_preferences": {"style": "technical", "verbosity": "detailed"},
  })
  ```



#### checkpoint

##### InMemorySaver 使用内存

保存在内存中，进程结束就丢失

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver  


agent = create_agent(
    "gpt-5",
    tools=[get_user_info],
    checkpointer=InMemorySaver(),  
)

config = {"configurable": {"thread_id": "1"}}

# 第一轮
agent.invoke(
    {"messages": [{"role": "user", "content": "我叫张三"}]},
    config=config,  
)

# 第二轮
agent.invoke(
    {"messages": [{"role": "user", "content": "我叫什么？"}]},
    config=config,  
)
```

内存保存了什么？

```python
agent.invoke({"messages": [{"role": "user", "content": "你好"}]}, config)
# InMemorySaver 保存：
# {
#     "thread_id": "xxx",
#     "messages": [
#         HumanMessage("你好"),
#         AIMessage("你好！有什么可以帮助你的吗？")
#     ]
# }

agent.invoke({"messages": [{"role": "user", "content": "天气"}]}, config)
# InMemorySaver 更新：
# {
#     "thread_id": "xxx",
#     "messages": [
#         HumanMessage("你好"),
#         AIMessage("你好！有什么可以帮助你的吗？"),
#         HumanMessage("天气"),
#         AIMessage("...")
#     ]
# }
```

自动追加历史

```python
# 你只需要传新消息
agent.invoke(
    {"messages": [{"role": "user", "content": "新问题"}]},
    config
)

# checkpointer 自动：
# 1. 读取之前的历史
# 2. 追加新消息
# 3. 调用模型（传入完整历史）
# 4. 保存新的历史
```



#### 上下文管理

启用短期记忆时，长时间对话可以超过 LLM 的上下文窗口。

解决方案：

##### Trim messages 修剪消息

**中间件方式：**

```python
from langchain.messages import RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime
from langchain_core.runnables import RunnableConfig
from typing import Any


@before_model
def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """Keep only the last few messages to fit context window."""
    messages = state["messages"]

    if len(messages) <= 3:
        return None  # No changes needed

    first_msg = messages[0]
    recent_messages = messages[-3:] if len(messages) % 2 == 0 else messages[-4:]
    new_messages = [first_msg] + recent_messages

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            *new_messages
        ]
    }

agent = create_agent(
    your_model_here,
    tools=your_tools_here,
    middleware=[trim_messages],
    checkpointer=InMemorySaver(),
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}

agent.invoke({"messages": "hi, my name is bob"}, config)
agent.invoke({"messages": "write a short poem about cats"}, config)
agent.invoke({"messages": "now do the same but for dogs"}, config)
final_response = agent.invoke({"messages": "what's my name?"}, config)

final_response["messages"][-1].pretty_print()
"""
================================== Ai Message ==================================

Your name is Bob. You told me that earlier.
If you'd like me to call you a nickname or use a different name, just say the word.
"""
```

**`@before_model` 装饰器：** 确保这个函数在每一次 Agent 决定下一步行动（调用 LLM）之前运行。

**`state: AgentState`：** 接收当前的 Agent 状态，其中包含了整个会话的历史记录，即 `state["messages"]`。

**`return None` 的含义：** 在 LangChain 的中间件中，返回 `None` 表示**不对状态进行任何修改**，Agent 将使用原始的 `state` 继续执行。



**函数方式：**

```python
from langchain_core.messages import trim_messages

trimmed = trim_messages(
    messages,
    max_count=5,  # 严格保留最后 5 条消息
    # max_tokens=100,  # 或使用 token 数限制
    strategy="last",  # 保留最后的消息
    token_counter=len  # 简单计数器（实际应该用 token 计数）这里其实不会被用到，因为 max_count 优先
)

```



##### Delete messages  删除消息



要删除特定信息

```python
from langchain.messages import RemoveMessage  

def delete_messages(state: AgentState):
    messages = state["messages"]
    if len(messages) > 2:
        # remove the earliest two messages
        return {"messages": [RemoveMessage(id=m.id) for m in messages[:2]]}
```

删除所有消息：

```python
from langgraph.graph.message import REMOVE_ALL_MESSAGES

def delete_messages(state):
    return {"messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES)]}
```



##### Summarize messages  摘要信息

使用中间件

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model=model,
    tools=[],
    checkpointer=InMemorySaver(),
    middleware=[
        SummarizationMiddleware(
            model="groq:llama-3.3-70b-versatile",
            max_tokens_before_summary=500  # 超过 500 tokens 触发摘要
        )
    ]
)
```



#### 访问记忆

##### tools 工具

工具可以通过 `tool_runtime:ToolRuntime ` 访问短期记忆（内存）

```python
from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime


class CustomState(AgentState):
    user_id: str

@tool
def get_user_info(
    runtime: ToolRuntime
) -> str:
    """Look up user info."""
    user_id = runtime.state["user_id"]
    return "User is John Smith" if user_id == "user_123" else "Unknown user"

agent = create_agent(
    model="gpt-5-nano",
    tools=[get_user_info],
    state_schema=CustomState,
)

result = agent.invoke({
    "messages": "look up user information",
    "user_id": "user_123"
})
print(result["messages"][-1].content)
# > User is John Smith.
```









### 长期记忆

LangChain 代理使用 **LangGraph** 持久化来实现长期记忆。这是一个更高级的话题，需要懂 LangGraph 才能使用。

LangGraph 将长期记忆以 JSON 文档的形式存储在 `store`中

#### postgres 数据库

`pip install langgraph-checkpoint-postgres`

```python
from langchain.agents import create_agent

from langgraph.checkpoint.postgres import PostgresSaver  


DB_URI = "postgresql://postgres:postgres@localhost:5442/postgres?sslmode=disable"
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup() # auto create tables in PostgresSql
    agent = create_agent(
        "gpt-5",
        tools=[get_user_info],
        checkpointer=checkpointer,  
    )
```

#### SQLite 数据库

`pip install langgraph-checkpoint-sqlite`

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# 创建持久化 checkpointer（使用 with 语句）
with SqliteSaver.from_conn_string("checkpoints.sqlite") as checkpointer:
    agent = create_agent(
        model=model,
        tools=[],
        checkpointer=checkpointer  # 使用 SQLite
    )

    config = {"configurable": {"thread_id": "user_123"}}

    # 第一次运行
    agent.invoke({"messages": [...]}, config)

# 程序重启后，对话仍然保留！
with SqliteSaver.from_conn_string("sqlite:///checkpoints.sqlite") as checkpointer:
    agent = create_agent(model=model, checkpointer=checkpointer)
    agent.invoke({"messages": [...]}, config)
```

#### 跨进程访问

```python
# 进程 A（Web 服务器）
with SqliteSaver.from_conn_string("shared.sqlite") as checkpointer:
    agent_a = create_agent(model=model, checkpointer=checkpointer)
    agent_a.invoke({...}, config={"configurable": {"thread_id": "user_1"}})

# 进程 B（后台任务）
with SqliteSaver.from_conn_string("shared.sqlite") as checkpointer:
    agent_b = create_agent(model=model, checkpointer=checkpointer)
    # 可以访问进程 A 创建的对话
    agent_b.invoke({...}, config={"configurable": {"thread_id": "user_1"}})
```



### FAQ



## Middleware 中间件

### 基本定义

```python
from langchain.agents.middleware import AgentMiddleware

class MyMiddleware(AgentMiddleware):
    def before_model(self, state, runtime):
        """模型调用前执行"""
        print("准备调用模型")
        return None  # 返回 None 表示继续正常流程

    def after_model(self, state, runtime):
        """模型响应后执行"""
        print("模型已响应")
        return None  # 返回 None 表示不修改状态

# 使用中间件
agent = create_agent(
    model=model,
    tools=[],
    middleware=[MyMiddleware()]
)
```

#### agent_loop

![](./imgs/agent 内部运行流程.png)

中间件在每一步 之前 和 之后 都使用了钩子函数

![](./imgs/中间件钩子流程.png)



### 内置中间件

#### SummarizationMiddleware 对话记录摘要总结

```python
SummarizationMiddleware(
    model: str | BaseChatModel,
    *,
    trigger: ContextSize | list[ContextSize] | None = None,
    keep: ContextSize = ("messages", _DEFAULT_MESSAGES_TO_KEEP),
    token_counter: TokenCounter = count_tokens_approximately,
    summary_prompt: str = DEFAULT_SUMMARY_PROMPT,
    trim_tokens_to_summarize: int | None = _DEFAULT_TRIM_TOKEN_LIMIT,
    **deprecated_kwargs: Any,
)
```

作用：当接近token 限制时，总结对话历史。

- model

  用于生成摘要的语言模型。

- trigger

  一个或多个触发摘要的阈值。

  ```python
  # 当 消息 达到50条时触发
  ("messages", 50)
  
  # 当 token 达到 3000 时触发
  ("tokens", 3000)
  
  # 当模型的最大输入token数达到80%或消息数量达到100条时（以先到者为准），触发摘要
  [("fraction", 0.8), ("messages", 100)]
  ```

- keep

  触发摘要后，保留多少上下文

  ```python
  # 保留最近的20条消息
  ("messages", 20)
  
  # 保留最近的3000个token
  ("tokens", 3000)
  
  # 保留模型最大输入token的最近30%
  ("fraction", 0.3)
  ```

- token_counter

  用于统计消息中的令牌数。

- summary_prompt

  生成摘要的提示模板。



#### HumanInTheLoopMiddleware 人工审核

HITL： Human-in-the-loop  人工审核

为 agent 调用工具的流程中 添加 人工监督审核。当模型提出可能需要审查的动作时——例如写入文件或执行 SQL——中间件可以暂停执行并等待决策。

通过将每个工具调用与可配置的策略进行对照来实现。如果需要干预，中间件会发出中断， 停止执行。图状态通过 LangGraph 的持久层保存，因此执行可以安全地暂停并稍后继续。

随后由人工决策决定下一步发生：动作可以按原样批准（ 批准 ）、执行前修改（ 编辑 ），或带反馈拒绝（ 拒绝 ）。

==要使用 HITL ,必须有checkpoint==

![](./imgs/HITI 流程图.png)

```python
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver


def read_email_tool(email_id: str) -> str:
    """Mock function to read an email by its ID."""
    return f"Email content for ID: {email_id}"

def send_email_tool(recipient: str, subject: str, body: str) -> str:
    """Mock function to send an email."""
    return f"Email sent to {recipient} with subject '{subject}'"

agent = create_agent(
    model="gpt-4o",
    tools=[your_read_email_tool, your_send_email_tool],
    checkpointer=InMemorySaver(),
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "your_send_email_tool": {
                    "allowed_decisions": ["approve", "reject"],
                },
                "your_read_email_tool": False, # False 表示该工具是自动批准； True 表示表示所有决策都被允许：批准、编辑和拒绝。
            },
            description_prefix= "输入您的决策"
        ),
    ],
)
```

人类响应中断的方式：

- approve

  批准，该行动按现状批准并执行，无需更改。

- edit

  编辑，工具调用执行时经过修改。

- reject

  拒绝，工具调用被拒绝，并在对话中添加解释

注意：

必须配置一个checkpoint，以在中断间持久化图状态。在生产环境中，可以使用像 AsyncPostgresSaver 这样的持久检查点。测试或原型制作时，可以使用 InMemorySaver。

##### 响应中断

当工具调用与你 interrupt_on 配置的策略匹配时，会触发中断。在这种情况下，调用结果会包含一个 `__interrupt__` 字段，显示需要复核的动作。然后你可以向审核员展示这些作，并在决定给出后继续执行。

```python
from langgraph.types import Command

# Human-in-the-loop leverages LangGraph's persistence layer.
# You must provide a thread ID to associate the execution with a conversation thread,
# so the conversation can be paused and resumed (as is needed for human review).
config = {"configurable": {"thread_id": "some_id"}} 
# Run the graph until the interrupt is hit.
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "Delete old records from the database",
            }
        ]
    },
    config=config 
)

# The interrupt contains the full HITL request with action_requests and review_configs
print(result['__interrupt__'])
# > [
# >    Interrupt(
# >       value={
# >          'action_requests': [
# >             {
# >                'name': 'execute_sql',
# >                'arguments': {'query': 'DELETE FROM records WHERE created_at < NOW() - INTERVAL \'30 days\';'},
# >                'description': 'Tool execution pending approval\n\nTool: execute_sql\nArgs: {...}'
# >             }
# >          ],
# >          'review_configs': [
# >             {
# >                'action_name': 'execute_sql',
# >                'allowed_decisions': ['approve', 'reject']
# >             }
# >          ]
# >       }
# >    )
# > ]


# Resume with approval decision
agent.invoke(
    Command( 
        resume={"decisions": [{"type": "approve"}]}  # or "edit", "reject"
    ), 
    config=config # Same thread ID to resume the paused conversation
)
```



#### ModelCallLimitMiddleware 模型限制

限制模型调用次数，以防止无限循环或过高成本。

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[],
    middleware=[
        ModelCallLimitMiddleware(
            thread_limit=10, # 每个线程允许的最大模型调用数。
            run_limit=5, # 每次运行允许的最大模型调用次数。
            exit_behavior="end", # 达到限制后， 跳转到agent 执行结束阶段，提示已超过限制
        ),
    ],
)
```



#### ToolCallLimitMiddleware 工具限制

通过限制工具调用次数来控制代理执行，无论是全局调用所有工具还是针对特定工具。

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ToolCallLimitMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[search_tool, database_tool],
    middleware=[
        # Global limit
        ToolCallLimitMiddleware(thread_limit=20, run_limit=10),
        # Tool-specific limit
        ToolCallLimitMiddleware(
            tool_name="search",
            thread_limit=5,
            run_limit=3,
            exit_behavior="end"
        ),
    ],
)
```

#### ModelFallbackMiddleware 模型主备切换

当主模型失败时，自动回退到其他模型。重复尝试后，使用其他模型顺序调用失败，直到成功或所有模型耗尽为止。

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ModelFallbackMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[],
    middleware=[
        ModelFallbackMiddleware(
            "gpt-4o-mini",
            "claude-3-5-sonnet-20241022",
        ),
    ],
)
```

#### PIIMiddleware 个人隐私脱敏

个人信息脱敏，自动检测对话中的个人隐私敏感信息，进行处理

```python
PIIMiddleware(
    pii_type: Literal["email", "credit_card", "ip", "mac_address", "url"] | str,
    *,
    strategy: Literal["block", "redact", "mask", "hash"] = "redact",
    detector: Callable[[str], list[PIIMatch]] | str | None = None,
    apply_to_input: bool = True,
    apply_to_output: bool = False,
    apply_to_tool_results: bool = False,
)
```

```python
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[],
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        PIIMiddleware("credit_card", strategy="mask", apply_to_input=True),
    ],
)
```

内置个人信息类型:

- email 电子邮件地址
- credit_card 信用卡号码
- ip IP地址
- mac_address MAC 地址
- url： 包括 `http`/`https` 和 `base_url`

策略：

- block 检测到后抛出异常
- redact 用 `[REDACTED_TYPE]` 占位符替换个人信息
- mask 进行部分掩码处理
- hash 进行hash处理

detector: 自定义检测函数或正则表达式模式

apply_to_input: 是否在模型调用前进行检查

apply_to_output：是否检查模型调用后所生成的ai信息

apply_to_tool_results：是否检查工具执行后的工具结果信息

例子：

```python
from langchain.agents.middleware import PIIMiddleware
from langchain.agents import create_agent

# Redact all emails in user input
agent = create_agent(
    "openai:gpt-5",
    middleware=[
        PIIMiddleware("email", strategy="redact"),
    ],
)

# Use different strategies for different PII types
agent = create_agent(
    "openai:gpt-4o",
    middleware=[
        PIIMiddleware("credit_card", strategy="mask"),
        PIIMiddleware("url", strategy="redact"),
        PIIMiddleware("ip", strategy="hash"),
    ],
)

# Custom PII type with regex
agent = create_agent(
    "openai:gpt-5",
    middleware=[
        PIIMiddleware("api_key", detector=r"sk-[a-zA-Z0-9]{32}", strategy="block"),
    ],
)
```

#### TodoListMiddleware 代办事项

待办事项中间件， 为 agent 提供复杂多步骤任务的任务规划和跟踪能力。

```python
TodoListMiddleware(
    *,
    system_prompt: str = WRITE_TODOS_SYSTEM_PROMPT,
    tool_description: str = WRITE_TODOS_TOOL_DESCRIPTION,
)
```

该中间件增加了一个 `write_todos` 工具，允许agent创建和管理结构化任务列表，以应对复杂的多步作。它旨在帮助代理跟踪进度、组织复杂任务，并向用户提供任务完成状态的可视化。

中间件会自动注入系统提示，指导代理何时以及如何有效使用待办项功能。

system_prompt : 自定义系统提示，指导代理使用待办工具

tool_description: `write_todos` 工具的自定义描述。

```python
from langchain.agents.middleware.todo import TodoListMiddleware
from langchain.agents import create_agent

agent = create_agent("openai:gpt-4o", middleware=[TodoListMiddleware()])

# Agent now has access to write_todos tool and todo state tracking
result = await agent.invoke({"messages": [HumanMessage("Help me refactor my codebase")]})

print(result["todos"])  # Array of todo items with status tracking
```

#### LLMToolSelectorMiddleware 工具选择

在构建 agent 的时候，我们可能会传入很多 工具 提供 agent使用，但是并不是每一个工具都是与当前问答有关，所以为了提高模型的准确性和聚焦到确切的工具中。需要使用该中间件来筛选与此处问答相关的工具。

```python
LLMToolSelectorMiddleware(
    *,
    model: str | BaseChatModel | None = None,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
    max_tools: int | None = None,
    always_include: list[str] | None = None,
)
```

- model 用于筛选工具的模型，如果未提供，则使用 agent的主模型。
- system_prompt 选择工具的提示模板
- max_tools 最大可选择的工具数量。
- always_include 无论选择如何，都必须包含工具名称。这些不计入 `max_tools` 限制。

```python
from langchain.agents import create_agent
from langchain.agents.middleware import LLMToolSelectorMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[tool1, tool2, tool3, tool4, tool5, ...],
    middleware=[
        LLMToolSelectorMiddleware(
            model="gpt-4o-mini",
            max_tools=3,
            always_include=["search"],
        ),
    ],
)
```

#### ToolRetryMiddleware 失败工具重试

自动重试 失败的工具 调用，并可配置指数退回。

```python
ToolRetryMiddleware(
    *,
    max_retries: int = 2,
    tools: list[BaseTool | str] | None = None,
    retry_on: RetryOn = (Exception,),
    on_failure: OnFailure = "continue",
    backoff_factor: float = 2.0,
    initial_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: bool = True,
)
```

- max_retries 最大重试次数

- tools 哪些工具可进行重试，如果为 None， 则适用于所有工具。

- retry_on 

  用于判断对哪些异常进行重试，类型可以是异常类型，也可以是可调用函数。

  如果是可调用函数，若是需要进行重试，需要返回True

  ```python
  # 对特定异常进行重试
  
  from requests.exceptions import RequestException, Timeout
  
  retry = ToolRetryMiddleware(
      max_retries=4,
      retry_on=(RequestException, Timeout),
      backoff_factor=1.5,
  )
  
  # 自定义异常过滤
  
  def should_retry(exc: Exception) -> bool:
      # Only retry on 5xx errors
      if isinstance(exc, HTTPError):
          return 500 <= exc.status_code < 600
      return False
  
  retry = ToolRetryMiddleware(
      max_retries=3,
      retry_on=should_retry,
  )
  ```

- on_failure

  所有重试次数都重试完后的处理

  - `continue` 返回包含错误细节的`ToolMessage`，允许大型语言模型处理故障并可能恢复。
  - `error` 重新抛出异常，结束agent 执行。
  - 自定义异常处理函数，处理异常并返回 `ToolMessage` 内容的字符串

  ```python
  def format_error(exc: Exception) -> str:
      return "Database temporarily unavailable. Please try again later."
  
  
  retry = ToolRetryMiddleware(
      max_retries=4,
      tools=["search_database"],
      on_failure=format_error,
  )
  ```

- backoff_factor 。指数退避算法的底数， 即 `initial_delay * (backoff_factor ** retry_number)` 

- initial_delay 第一次重试前几秒钟的初始延迟。

- max_delay 重试之间最大延迟为几秒。

- jitter 是否要为延迟添加随机抖动(`±25%`)

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ToolRetryMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[search_tool, database_tool],
    middleware=[
        ToolRetryMiddleware(
            max_retries=3,
            backoff_factor=2.0,
            initial_delay=1.0,
        ),
    ],
)
```

#### ModelRetryMiddleware 失败模型重试

自动重试失败的模型调用，并可配置指数退回

与 `ToolRetryMiddleware` 类似

#### LLMToolEmulator 工具仿真

当我们进行开发的时候，一些外部工具暂时不可用或成本高昂时， 可以使用该中间件

使用 LLM 模型来 模拟工具调用，用 AI 生成的响应替代实际工具调用。不使用真正的工具。

一般用于测试使用。

```python
LLMToolEmulator(
    *,
    tools: list[str | BaseTool] | None = None,
    model: str | BaseChatModel | None = None,
)
```

- tools 

  可模拟的工具名称（`str`）或 `BaseTool` 实例列表。如果为None，则所有工具都会被模拟。

  如果为空列表，则不会模拟任何工具

- model

  用于实现 模拟工具 的 LLM 模型。

```python
# 模拟所有工具（默认行为
from langchain.agents.middleware import LLMToolEmulator

middleware = LLMToolEmulator()

agent = create_agent(
    model="openai:gpt-4o",
    tools=[get_weather, get_user_location, calculator],
    middleware=[middleware],
)

# 按名称模拟特定工具
middleware = LLMToolEmulator(tools=["get_weather", "get_user_location"])
```



#### FilesystemFileSearchMiddleware 文件搜索

在文件系统文件上提供 Glob 和 Grep 搜索工具。可以进行代码查找与分析，按名称查找文件， 使用正则表达式搜索代码内容

```python
FilesystemFileSearchMiddleware(
    *, root_path: str, use_ripgrep: bool = True, max_file_size_mb: int = 10
)
```

- root_path 查找文件的根目录
- use_ripgrep 是否使用 `Ripgrep` 进行搜索。如果 `ripgrep` 不可用，就回退到 Python。
- max_file_size_mb 最大搜索文件大小（MB）

该中间件增加了两个工具，用于本地文件系统搜索：

- Glob：通过文件路径快速匹配文件模式
- Grep：使用 ripgrep 或 Python 备份快速搜索内容



```python
from langchain.agents import create_agent
from langchain.agents.middleware import (
    FilesystemFileSearchMiddleware,
)

agent = create_agent(
    model=model,
    tools=[],  # Add tools as needed
    middleware=[
        FilesystemFileSearchMiddleware(root_path="/workspace"),
    ],
)
```







### 钩子方法

#### 节点式钩子

- before_agent	agent 启动前 每次调用一次

- before_model       每次模型调用前

- after_model          每次模型响应后

- after_agent           agent 完成后 每次调用一次



##### 参数

上面的钩子方法的参数都是：

- func

  要装饰的func 函数， 它的形参必须是 `(state: StateT, runtime: Runtime[ContextT])`

- state_schema

  可选自定义状态模式类型。如果未提供，则使用默认`的 AgentState` 模式。

  可以使中间件能够：

  **跨执行跟踪状态** ：维护计数器、标志或其他在整个执行生命周期中持续存在的值

  在**钩子之间共享数据** 将信息从 `before_model` 传递到 `after_model` 或不同中间件实例之间传递

  **实现跨领域关注点** ：添加速率限制、使用跟踪、用户上下文或审计日志等功能，而无需修改核心代理逻辑

  **做出有条件决策** ：利用累积状态决定是否继续执行、跳转到不同节点或动态修改行为

  ```python
  from langchain.agents import create_agent
  from langchain.messages import HumanMessage
  from langchain.agents.middleware import AgentState, before_model, after_model
  from typing_extensions import NotRequired
  from typing import Any
  from langgraph.runtime import Runtime
  
  
  class CustomState(AgentState):
      model_call_count: NotRequired[int]
      user_id: NotRequired[str]
  
  
  @before_model(state_schema=CustomState, can_jump_to=["end"])
  def check_call_limit(state: CustomState, runtime: Runtime) -> dict[str, Any] | None:
      count = state.get("model_call_count", 0)
      if count > 10:
          return {"jump_to": "end"}
      return None
  
  
  @after_model(state_schema=CustomState)
  def increment_counter(state: CustomState, runtime: Runtime) -> dict[str, Any] | None:
      return {"model_call_count": state.get("model_call_count", 0) + 1}
  
  
  agent = create_agent(
      model="gpt-4o",
      middleware=[check_call_limit, increment_counter],
      tools=[],
  )
  
  # Invoke with custom state
  result = agent.invoke({
      "messages": [HumanMessage("Hello")],
      "model_call_count": 0,
      "user_id": "user-123",
  })
  ```

  

- tools

  中间件注册的附加工具列表。可选

- can_jump_to

  有效值：`tools`, `model`, `end`

  该中间件的所允许的控制流程列表

- name 

  生成的中间件类的可选名称。如果没有提供，则使用装饰函数的名称。

例子：

```python
@before_agent
def log_before_agent(state: AgentState, runtime: Runtime) -> None:
    print(f"Starting agent with {len(state['messages'])} messages")
    
# 带条件跳跃
@before_agent(can_jump_to=["end"])
def conditional_before_agent(
    state: AgentState, runtime: Runtime
) -> dict[str, Any] | None:
    if some_condition(state):
        return {"jump_to": "end"}
    return None


@after_model
def log_latest_message(state: AgentState, runtime: Runtime) -> None:
    print(state["messages"][-1].content)
    return None
```



##### 返回值的作用

- 返回 None

  ```python
  @after_model
  def log_latest_message(state: AgentState, runtime: Runtime) -> None:
      print(state["messages"][-1].content)
      return None
  ```

  不做任何修改, 继续流程

- 返回字典（更新状态

  ```python
  @after_model
  def after_model(self, state, runtime):
      count = state.get("count", 0)
      return {"count": count + 1}  # 更新状态中的 count
  ```

- 返回 jump_to（控制流程）

  ```python
  @before_model(can_jump_to=["end"])
  def before_model(self, state, runtime):
      if state.get("count", 0) > 10:
          return {"jump_to": "end"}  # 跳过模型，直接结束
      return None
  ```

  - end, 跳转到代理执行的结尾 (或第一个 `after_agent` 钩子）
  - tools, 跳转到工具节点
  - model 跳转到模型节点（或第一个 `before_model` 钩子)



#### 包裹式钩子

- wrap_model_call

  每次模型调用前后

  主要作用是拦截模型调用过程，进行拦截、修改或增强，例如实现重试逻辑、请求 / 响应改写、错误处理等。它允许开发者在不修改核心模型调用逻辑的前提下，灵活扩展模型交互的行为。

  ```python
  wrap_model_call(
      func: _CallableReturningModelResponse[StateT, ContextT] | None = None,
      *,
      state_schema: type[StateT] | None = None,
      tools: list[BaseTool] | None = None,
      name: str | None = None,
  ) -> (
      Callable[
          [_CallableReturningModelResponse[StateT, ContextT]],
          AgentMiddleware[StateT, ContextT],
      ]
      | AgentMiddleware[StateT, ContextT]
  )
  ```

  例子：

  ```python
  from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
  from typing import Callable
  
  # 重试模型
  @wrap_model_call
  def retry_model(
      request: ModelRequest,
      handler: Callable[[ModelRequest], ModelResponse],
  ) -> ModelResponse:
      for attempt in range(3):
          try:
              return handler(request) # 实际模型调用
          except Exception as e:
              if attempt == 2:
                  raise
              print(f"Retry {attempt + 1}/3 after error: {e}")
  
  # 动态模型
  @wrap_model_call
  def dynamic_model_selection(request: ModelRequest, handler) -> ModelResponse:
      """Choose model based on conversation complexity."""
      message_count = len(request.state["messages"])
  
      if message_count > 10:
          # Use an advanced model for longer conversations
          model = advanced_model
      else:
          model = basic_model
  
      return handler(request.override(model=model))
  ```

  

- wrap_tool_call

  ```python
  wrap_tool_call(
      func: _CallableReturningToolResponse | None = None,
      *,
      tools: list[BaseTool] | None = None,
      name: str | None = None,
  ) -> Callable[[_CallableReturningToolResponse], AgentMiddleware] | AgentMiddleware
  ```

  ```python
  # 重试
  @wrap_tool_call
  def retry_on_error(request, handler):
      max_retries = 3
      for attempt in range(max_retries):
          try:
              return handler(request)
          except Exception:
              if attempt == max_retries - 1:
                  raise
  
  # 异步重试
  @wrap_tool_call
  async def async_retry(request, handler):
      for attempt in range(3):
          try:
              return await handler(request)
          except Exception:
              if attempt == 2:
                  raise
                  
  ```

  



### 创建中间件

#### 基于装饰器的中间件

单个钩子的中间件，可以使用装饰器来实现

即 

```python
@before_agent
@before_model
@after_model
@after_agent
@wrap_model_call
@wrap_tool_call 
```

```python
from langchain.agents.middleware import (
    before_model,
    wrap_model_call,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langchain.agents import create_agent
from langgraph.runtime import Runtime
from typing import Any, Callable


@before_model
def log_before_model(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    print(f"About to call model with {len(state['messages'])} messages")
    return None

@wrap_model_call
def retry_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    for attempt in range(3):
        try:
            return handler(request)
        except Exception as e:
            if attempt == 2:
                raise
            print(f"Retry {attempt + 1}/3 after error: {e}")

agent = create_agent(
    model="gpt-4o",
    middleware=[log_before_model, retry_model],
    tools=[...],
)
```

**何时使用装饰器方式**

- 需要单钩
- 无复杂配置
- 快速实现



#### 基于类的中间件

对于需要多个钩子的或者复杂配置的，又或者是需要为同一个钩子实现同步和非同步实现和想在单一中间件中合并多个钩子时，可以使用类。

```python
from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langgraph.runtime import Runtime
from typing import Any, Callable

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"About to call model with {len(state['messages'])} messages")
        return None

    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"Model returned: {state['messages'][-1].content}")
        return None

agent = create_agent(
    model="gpt-4o",
    middleware=[LoggingMiddleware()],
    tools=[...],
)
```







### 执行顺序

```python
agent = create_agent(
    model=model,
    middleware=[Middleware1(), Middleware2(), Middleware3()]
)

"""
1. Middleware1.before_model   ↓ 正序
2. Middleware2.before_model   ↓
3. Middleware3.before_model   ↓

   [模型调用]

6. Middleware3.after_model    ↑ 逆序
5. Middleware2.after_model    ↑
4. Middleware1.after_model    ↑

"""
```

### 实际应用

#### 1. 日志中间件

```python
class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state, runtime):
        print(f"[日志] 消息数: {len(state.get('messages', []))}")
        return None

    def after_model(self, state, runtime):
        last_msg = state.get('messages', [])[-1]
        print(f"[日志] 响应类型: {last_msg.__class__.__name__}")
        return None
```

#### 2. 计数中间件

```python
class CallCounterMiddleware(AgentMiddleware):
    def after_model(self, state, runtime):
        count = state.get("model_call_count", 0)
        return {"model_call_count": count + 1}

# 需要 checkpointer 来保存自定义状态
agent = create_agent(
    model=model,
    middleware=[CallCounterMiddleware()],
    checkpointer=InMemorySaver()
)
```

#### 3. 消息修剪中间件

```python
class MessageTrimmerMiddleware(AgentMiddleware):
    def __init__(self, max_messages=5):
        super().__init__()
        self.max_messages = max_messages

    def before_model(self, state, runtime):
        messages = state.get('messages', [])
        if len(messages) > self.max_messages:
            # 只保留最近的 N 条消息
            return {"messages": messages[-self.max_messages:]}
        return None
```

#### 4. 输出验证中间件

```python
class OutputValidationMiddleware(AgentMiddleware):
    def after_model(self, state, runtime):
        last_msg = state.get('messages', [])[-1]
        content = getattr(last_msg, 'content', '')

        if len(content) > 1000:
            print("[警告] 响应过长")

        return None
```

#### 5. 限流中间件

```python
class MaxCallsMiddleware(AgentMiddleware):
    def __init__(self, max_calls=10):
        super().__init__()
        self.max_calls = max_calls

    def before_model(self, state, runtime):
        count = state.get("call_count", 0)
        if count >= self.max_calls:
            return {"jump_to": "__end__"}  # 达到限制，直接结束
        return None

    def after_model(self, state, runtime):
        count = state.get("call_count", 0)
        return {"call_count": count + 1}
```



## Loader 文档加载器

### 文本文件加载器

```python
from langchain_community.document_loaders import TextLoader

# 加载文本文件
loader = TextLoader("document.txt", encoding="utf-8")
documents = loader.load()

# documents 是 Document 对象列表
# Document 包含：page_content (文本) 和 metadata (元数据)
```

### CSV加载器

```python
from langchain_community.document_loaders import CSVLoader
 
 
loader = CSVLoader(file_path='./example_data/mlb_teams_2012.csv')
data = loader.load()
 
print(data)
```

定制CSV解析和加载

```python
loader = CSVLoader(file_path='./example_data/mlb_teams_2012.csv', csv_args={
    # 定界符：用于分隔字段的单字符字符串。它默认为','
    'delimiter': ',',
    # 引号字符：用于引用包含特殊字符的字段的单字符字符串，如定界符或者quotechar，或者包含换行符。它默认为'"'.
    'quotechar': '"',
    # 字段名称：如果在创建对象时没有作为参数传递，则在第一次访问或从文件中读取第一条记录时初始化该属性。
    'fieldnames': ['MLB Team', 'Payroll in millions', 'Wins']
})
 
data = loader.load()
 
print(data)
```

指定一个列来标识文档源

使用 `source_column `参数为从每一行创建的文档指定一个源。否则 `file_path `将用作从CSV文件创建的所有文档的源。

当将从CSV文件加载的文档用于使用源回答问题的链时，这很有用。

```python
loader = CSVLoader(file_path='./example_data/mlb_teams_2012.csv', source_column="Team")
 
data = loader.load()
 
print(data)
```



### 文件目录加载器

 默认情况下，它使用[非结构化加载程序](https://python.langchain.com/docs/integrations/document_loaders/unstructured_file).

可以使用 **`glob `**参数来控制要加载的文件。请注意，这里它不加载 `**.rst** `文件或 **`.html `**文件。

```python
from langchain_community.document_loaders import DirectoryLoader
loader = DirectoryLoader('../', glob="**/*.md")
 
docs = loader.load()
 
```

显示进度条：

默认情况下，不会显示进度条。要显示进度条，请安装 `tqdm library`（例如），并设置`show_progress `参数到 `True`

```python
loader = DirectoryLoader('../', glob="**/*.md", show_progress=True)
docs = loader.load()
```

使用多进程：

默认情况下，加载发生在一个线程中。为了利用几个线程，请将 `use_multithreading `标志为 true。

```python
loader = DirectoryLoader('../', glob="**/*.md", use_multithreading=True)
docs = loader.load()
```

更改加载程序类：

默认情况下，使用 `UnstructuredLoader 类`。然而，您可以非常容易地改变加载程序的类型。只需要指定参数 loader_cls 的类型。

```python
from langchain_community.document_loaders import TextLoader
 
# 加载文本文件
loader = DirectoryLoader('../', glob="**/*.md", loader_cls=TextLoader)
 
docs = loader.load()
 
len(docs)

##########################
# 加载 Python源代码文件
from langchain_community.document_loaders import PythonLoader
loader = DirectoryLoader('../', glob="**/*.py", loader_cls=PythonLoader)

```

使用文本加载器自动检测文件编码

- 默认行为

  ```python
  path = '../../../../../tests/integration_tests/examples'
  loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader)
  loader.load()
  ```

  文件`example-non-utf8.txt`使用不同的编码，因此`load()`函数会失败，并显示一个有帮助的消息，指示哪个文件无法解码。

  `TextLoader`的默认行为是，如果在加载任何文档时失败，整个加载过程都会失败，且不会加载任何文档。

- 无声失败

  我们可以将`silent_errors`参数传递给`DirectoryLoader`，以跳过无法加载的文件并继续加载过程。

  ```python
  loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader, silent_errors=True)
  docs = loader.load()
  ```

- 自动检测编码

  我们还可以让`TextLoader`在失败之前自动检测文件编码，将`autodetect_encoding`传递给加载器类。

  ```python
  text_loader_kwargs = {'autodetect_encoding': True}
  loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs)
  docs = loader.load()
  doc_sources = [doc.metadata['source']  for doc in docs]
  print(doc_sources)
  ```

---

### HTML加载器

```python
from langchain_community.document_loaders import UnstructuredHTMLLoader
 
loader = UnstructuredHTMLLoader("example_data/fake-content.html")
 
data = loader.load()
 
print(data)
```

用BeautifulSoup4加载HTML

我们还可以使用`BeautifulSoup4`和`BSHTMLLoader`加载HTML文档。这将提取HTML中的文本到`page_content`中，并将页面标题作为`title`加载到`metadata`中。

```python
from langchain_community.document_loaders import BSHTMLLoader

loader = BSHTMLLoader("example_data/fake-content.html")
data = loader.load()
data
```

---

### JSON加载器

> `JSONLoader` 使用指定的 [jq schema](https://stedolan.github.io/jq/manual/) 来解析 JSON 文件。它使用 `jq` Python 包。 查看这个 [手册](https://stedolan.github.io/jq/manual/) 以获取有关 `jq` 语法的详细文档。

```python
#pip install jq
import json

from langchain_community.document_loaders import JSONLoader
from pathlib import Path
from pprint import pprint

file_path = './example_data/facebook_chat.json'
data = json.loads(Path(file_path).read_text())

pprint(data)

loader = JSONLoader(
    file_path='./example_data/facebook_chat.json',
    jq_schema='.messages[].content', # 假设我们想要从 JSON 数据的 messages 键下的 content 字段中提取值。
    text_content=False)
 
data = loader.load()
 
print(data)
```

更多细节：[JSONLoader](https://langchain114.com/docs/modules/data_connection/document_loaders/json)

---

### Markdown加载器

```python
from langchain_community.document_loaders import UnstructuredMarkdownLoader

markdown_path ="../../../../../README.md"
loader = UnstructuredMarkdownLoader(markdown_path)

data = loader.load()
```

保留元素

Unstructured会为文本的不同块创建不同的“元素”。默认情况下，我们将它们组合在一起，但您可以通过指定`mode="elements"`轻松保留该分离。

```python
loader = UnstructuredMarkdownLoader(markdown_path, mode="elements")

data = loader.load()

data[0]
```

---

### PDF加载器

使用 PyPDF
PyPDF是一个功能全面的库，它允许用户进行PDF的读取、分割、合并以及转换等操作。这个库的优点在于其轻量且纯Python编写，没有庞大的依赖，因此安装和使用相对简单。此外，PyPDF跨平台性好，能够在Windows、macOS和Linux上良好运行。然而，它可能不支持PDF 1.7及以上版本的某些特性，对于处理带有复杂特性的最新PDF文件可能会存在限制。



加载PDF使用pypdf文档数组，其中每个文档都包含页面内容和元数据page号码。

```python
# pip install pypdf
from langchain_community.document_loaders import PyPDFLoader
loader = PyPDFLoader("example_data/layout-parser-paper.pdf")
# pages = loader.load_and_split()
pages = loader.load()  
print(pages[0])
```

> [!NOTE]
>
> pages的类型是list ，每个元素代表着一个文档，即pdf的一页
>
> 元素的类型是`langchain.schema.Document`. `langchain.schema.Document`类型包含两个属性:`page_content`：包含该文档页面的内容,`meta_data`：为文档页面相关的描述性数据。



这种方法的一个优点是可以通过页码检索文档。

例子：

```python
import os
import getpass
 
os.environ['OPENAI_API_KEY'] = getpass.getpass('OpenAI API Key:')
 
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
 
faiss_index = FAISS.from_documents(pages, OpenAIEmbeddings())
docs = faiss_index.similarity_search("How will the community be engaged?", k=2)
for doc in docs:
    print(str(doc.metadata["page"]) + ":", doc.page_content[:300])
```

提取图片：

使用 `rapidocr-onnxruntime` 包，我们可以将图像作为文本提取：

```python
# pip install rapidocr-onnxruntime
loader = PyPDFLoader("example_data/layout-parser-paper.pdf", extract_images=True)
pages = loader.load()
pages[4].page_content
```

更多细节：[PDF加载器](https://langchain114.com/docs/modules/data_connection/document_loaders/pdf)

---

### Word加载器

含`.doc` 和 `.docx`

```python
# pip install unstructured
 
# pip install python-doc
 
# pip install python-docx


from langchain_community.document_loaders import UnstructuredWordDocumentLoader
 
loader = UnstructuredWordDocumentLoader("example_data/layout-parser-paper.doc")
 
data = loader.load()
```

----

### bilibili 音频加载器

此加载器利用 `bilibili-api` 从 `Bilibili` 获取文本转录。 通过这个 BiliBiliLoader，用户可以轻松获取所需视频内容的转录。

```python
# pip install bilibili-api-python
from langchain.document_loaders import BiliBiliLoader

loader = BiliBiliLoader(["https://www.bilibili.com/video/BV1xt411o7Xu/"])

loader.load()
```

---

### 网页文档加载器

构建一个`WebBaseLoader`实例来对网页进行加载。

```python
from langchain_community.document_loaders import WebBaseLoader


# 创建一个 WebBaseLoader Class 实例
url = "https://github.com/datawhalechina/d2l-ai-solutions-manual/blob/master/docs/README.md"
header = {'User-Agent': 'python-requests/2.27.1', 
          'Accept-Encoding': 'gzip, deflate, br', 
          'Accept': '*/*',
          'Connection': 'keep-alive'}
loader = WebBaseLoader(web_path=url,header_template=header)

# 调用 WebBaseLoader Class 的函数 load对文件进行加载
pages = loader.load()


import json
convert_to_json = json.loads(page.page_content)
extracted_markdow = convert_to_json['payload']['blob']['richText']
print(extracted_markdow)

```



## TextSpliter 文本分割器

**为什么要分割？**

- LLM 有 token 限制
- 小块检索更精准
- 降低成本

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 每块最大字符数
    chunk_overlap=50,      # 块之间的重叠
    separators=["\n\n", "\n", "。", " ", ""]  # 分割优先级
)

chunks = splitter.split_documents(documents)
```

ChineseRecursiveTextSplitter

SpacyTextSplitter



RecursiveCharacterTextSplitter



TokenTextSplitter

MarkdownHeaderTextSplitter



## LCEL

处理流程：

```txt
输入 -> 提示模板 -> 模型 -> 输出解析器
```

简单示例

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a short joke about {topic}")
model = ChatOpenAI(model="gpt-4")
output_parser = StrOutputParser()

chain = prompt | model | output_parser

chain.invoke({"topic": "ice cream"})
```

`|` 符号类似于 [unix 管道操作符](https://en.wikipedia.org/wiki/Pipeline_(Unix))，它将不同的组件链接在一起，将一个组件的输出作为下一个组件的输入。

####  ["Runnable"](https://api.python.langchain.com/en/stable/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable) 协议

标准接口包括：

- [`stream`](https://python.langchain.com.cn/docs/expression_language/interface#stream): 流式返回响应的块
- [`invoke`](https://python.langchain.com.cn/docs/expression_language/interface#invoke): 在输入上调用链
- [`batch`](https://python.langchain.com.cn/docs/expression_language/interface#batch): 在输入列表上调用链

这些方法也有对应的异步方法:

- [`astream`](https://python.langchain.com.cn/docs/expression_language/interface#async-stream): 异步流式返回响应的块
- [`ainvoke`](https://python.langchain.com.cn/docs/expression_language/interface#async-invoke): 异步在输入上调用链
- [`abatch`](https://python.langchain.com.cn/docs/expression_language/interface#async-batch): 异步在输入列表上调用链
- [`astream_log`](https://python.langchain.com.cn/docs/expression_language/interface#async-stream-intermediate-steps): 异步流式返回中间步骤，以及最终响应
- [`astream_events`](https://python.langchain.com.cn/docs/expression_language/interface#async-stream-events): **beta** 异步流式返回链中发生的事件（在 `langchain-core` 0.1.14 中引入）





