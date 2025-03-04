# Sovereign GPT

This VS Code extension allows you to chat with **DeepSeek-R1** and other models locally, leveraging **Ollama** for AI-powered responses. 

## Features
- **Local AI Chat**: Interact with DeepSeek-R1 directly in VS Code.
- **Multiple Models**: Choose between DeepSeek-R1, Qwen 2.5, and LLaMA 3.2.
- **Real-time Streaming**: Responses are streamed dynamically.
- **Integrated UI**: Clean and responsive chat interface.

## Available Models
| Model Name         | Description               |
|--------------------|--------------------------|
| `deepseek-r1:1.5b` | DeepSeek R1 (1.5B params) |
| `qwen2.5:1.5b`    | Qwen 2.5 (1.5B params)    |
| `llama3.2:1b`     | LLaMA 3.2 (1B params)     |

## Installation
### Prerequisites
- Install [Ollama](https://ollama.ai/) to run DeepSeek-R1 and other models locally.

### Manual Installation (via `.vsix`)
1. Build the extension by running:
   ```sh
   npm install
   npm run compile
   ```
2. Package the extension:
   ```sh
    vsce package
   ```
3. Install the .vsix file in VS Code:
   ```md
    * Open Extensions (Cmd+Shift+X).
    * Click ... (top-right) → Install from VSIX...
    * Select the generated .vsix file.
    ```
### **Usage Instructions**
```md
1. Open **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run `"Start DeepSeek Chat"`.
3. Type your query and receive AI-generated responses.
```

## Development
### Build and Run Locally
```sh
npm install
npm run watch
```

### To test in VS Code:
```sh
code --extensionDevelopmentPath=.
```

### **Linting**
```md
npm run lint
```

### **Running Tests**
```sh
npm test
```

### **License**
```md
This project is licensed under the **MIT License**.
```

