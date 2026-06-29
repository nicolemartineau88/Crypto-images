# Crypto Auto Publisher - Desktop Application (PySide6 / Qt)

Professional cross-platform desktop suite for automated cryptocurrency market analysis, kline trading chart generation, AI article drafting, and Blurt.blog publishing.

## Features
- **Fluent / Acrylic UI**: Built with PySide6 (Qt) featuring rounded corners, dark/light theme, and smooth page transitions.
- **Live Gate.io & CMC APIs**: Automated real-time market ticker and kline candlestick data collection.
- **AI Article & Image Drafting**: Integrates Google Gemini, OpenAI, and Grok with structured prompt templates.
- **Kline Chart Generator**: Renders high-resolution trading candlestick charts directly from Gate.io market data.
- **Blurt.blog Publisher**: Automated broadcasting to Steem/Hive/Blurt compatible blockchains.
- **Background Scheduler**: Automated 12-hour or custom countdown publishing loop with SQLite history logs.

## Setup & Run (Windows, Linux, macOS)

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Launch the application:
```bash
python main.py
```

## Modular Architecture
- `main.py`: Qt PySide6 Main Window, Navigation Sidebar, QStackedWidget Views
- `database.py`: SQLite Database Manager (Accounts, Prompts, History, Schedules)
- `gateio_client.py`: Gate.io & CoinMarketCap API REST Clients
- `ai_engine.py`: Multi-Provider AI Generator (Gemini, OpenAI, Grok)
- `blurt_publisher.py`: Blockchain RPC & Markdown Post Assembler
- `scheduler.py`: Background Thread Scheduler & Countdown Timer

## Compiling the Executable (PyInstaller)

To package the application into a standalone executable (e.g., a `.exe` on Windows), use PyInstaller. Since the blockchain library (`beem`) and its underlying cryptography library (`secp256k1`) utilize native C-bindings, standard packaging might miss the compiled dynamic library files (`.dll`), resulting in unhandled exceptions like:
`Failed to load dynlib/dll` / `FileNotFoundError: Could not find module`.

To bundle everything correctly, run the following commands in your terminal:

1. Install PyInstaller in your virtual environment:
```bash
pip install pyinstaller
```

2. Package the application by explicitly collecting all dependencies and binaries:
```bash
pyinstaller --name "CryptoPublisherPro" --noconsole --collect-all "beem" --collect-all "secp256k1" main.py
```

3. The compiled standalone folder will be available inside the `dist/CryptoPublisherPro` directory. Open and run `CryptoPublisherPro.exe` inside it.

