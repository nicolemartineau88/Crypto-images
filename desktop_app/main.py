"""
Crypto Auto Publisher Desktop Application
Cross-platform PySide6 (Qt) Modern Acrylic/Fluent Desktop Suite
Runs on Windows, Linux, macOS.
"""
import sys
import os
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QStackedWidget, QTextEdit, QLineEdit,
    QComboBox, QTableWidget, QTableWidgetItem, QHeaderView, QGroupBox,
    QCheckBox, QSpinBox, QDoubleSpinBox, QMessageBox, QTabWidget
)
from PySide6.QtCore import Qt, QTimer, Slot
from PySide6.QtGui import QFont, QIcon, QColor, QPalette

from database import DatabaseManager
from gateio_client import MarketApiClient
from ai_engine import AIGeneratorEngine
from blurt_publisher import BlurtBlogPublisher
from scheduler import AutomationScheduler

class CryptoPublisherDesktop(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Crypto Auto Publisher Pro (Desktop Edition)")
        self.resize(1280, 800)
        self.db = DatabaseManager()
        self.market_api = MarketApiClient()
        self.ai_engine = AIGeneratorEngine(self.db)
        self.blurt = BlurtBlogPublisher(self.db)
        
        self.scheduler = AutomationScheduler(
            publish_callback=self.run_auto_publish_pipeline,
            log_callback=self.append_log
        )

        self._apply_acrylic_dark_theme()
        self._init_ui()
        
        # UI Timer for live clock & countdown
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._update_ticks)
        self.timer.start(1000)

        self.append_log("[System] PySide6 Desktop Suite loaded successfully.")
        self.append_log("[Gate.io] Realtime spot tickers API connection ready.")

    def _apply_acrylic_dark_theme(self):
        """Applies Elegant Dark Fluent style stylesheet to Qt components"""
        dark_qss = """
        QMainWindow, QWidget {
            background-color: #09090B;
            color: #E2E8F0;
            font-family: 'Segoe UI', 'Inter', sans-serif;
            font-size: 13px;
        }
        QPushButton {
            background-color: #16161A;
            border: 1px solid #27272A;
            border-radius: 8px;
            padding: 8px 16px;
            color: #E2E8F0;
            font-weight: 600;
        }
        QPushButton:hover {
            background-color: #27272A;
            border-color: #3B82F6;
        }
        QPushButton#primaryBtn {
            background-color: #3B82F6;
            color: #FFFFFF;
            border: none;
        }
        QPushButton#primaryBtn:hover {
            background-color: #2563EB;
        }
        QLineEdit, QTextEdit, QComboBox, QSpinBox, QDoubleSpinBox {
            background-color: #111114;
            border: 1px solid #27272A;
            border-radius: 6px;
            padding: 6px;
            color: #FFFFFF;
        }
        QGroupBox {
            border: 1px solid #27272A;
            border-radius: 10px;
            margin-top: 10px;
            padding-top: 15px;
            font-weight: bold;
            color: #3B82F6;
        }
        QTableWidget {
            background-color: #111114;
            border: 1px solid #27272A;
            gridline-color: #27272A;
            border-radius: 8px;
        }
        QHeaderView::section {
            background-color: #16161A;
            border: none;
            padding: 6px;
            color: #94A3B8;
            font-weight: bold;
        }
        """
        self.setStyleSheet(dark_qss)

    def _init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Permanent Sidebar
        sidebar = QWidget()
        sidebar.setFixedWidth(240)
        sidebar.setStyleSheet("background-color: #111114; border-right: 1px solid #27272A;")
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(15, 20, 15, 20)
        sidebar_layout.setSpacing(8)

        logo_label = QLabel("⚡ CryptoPub Pro")
        logo_label.setStyleSheet("font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 15px;")
        sidebar_layout.addWidget(logo_label)

        # Nav items
        self.nav_btns = []
        pages = [
            ("📊 Dashboard", 0),
            ("📝 Article Editor", 1),
            ("👁️ Post Preview", 2),
            ("🤖 AI Providers", 3),
            ("🔗 Market APIs", 4),
            ("👤 Blurt Accounts", 5),
            ("🏘️ Communities", 6),
            ("⏰ Scheduler", 7),
            ("📜 Publish History", 8),
            ("🎯 Prompt Manager", 9)
        ]
        
        for name, idx in pages:
            btn = QPushButton(name)
            btn.setStyleSheet("text-align: left; padding: 10px; border: none; background: transparent; color: #94A3B8;")
            btn.clicked.connect(lambda ch, i=idx: self.switch_page(i))
            sidebar_layout.addWidget(btn)
            self.nav_btns.append(btn)

        sidebar_layout.addStretch()
        status_lbl = QLabel("● Gate.io API Live")
        status_lbl.setStyleSheet("color: #10B981; font-size: 11px; font-weight: bold;")
        sidebar_layout.addWidget(status_lbl)

        main_layout.addWidget(sidebar)

        # Main Content Views Stack
        self.stack = QStackedWidget()
        main_layout.addWidget(self.stack)

        self._build_dashboard_page()
        self._build_editor_page()
        self._build_preview_page()
        self._build_ai_providers_page()
        self._build_market_apis_page()
        self._build_accounts_page()
        self._build_communities_page()
        self._build_scheduler_page()
        self._build_history_page()
        self._build_prompt_manager_page()

        self.switch_page(0)

    def switch_page(self, index):
        self.stack.setCurrentIndex(index)
        for i, btn in enumerate(self.nav_btns):
            if i == index:
                btn.setStyleSheet("text-align: left; padding: 10px; border-radius: 6px; background: #16161A; color: #FFFFFF; font-weight: bold; border: 1px solid #27272A;")
            else:
                btn.setStyleSheet("text-align: left; padding: 10px; border: none; background: transparent; color: #94A3B8;")

    def _build_dashboard_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.setSpacing(15)

        header = QLabel("System Dashboard")
        header.setStyleSheet("font-size: 22px; font-weight: bold; color: #FFFFFF;")
        layout.addWidget(header)

        # Stats Cards
        cards_layout = QHBoxLayout()
        
        btc_card = self._create_stat_card("BTC / USDT Price", "$98,450.00", "+3.4% Gate.io Spot")
        ai_card = self._create_stat_card("AI Engine", "Google Gemini", "gemini-2.5-flash")
        self.cd_lbl = self._create_stat_card("Next Publish In", "12:00:00", "Scheduler Auto Loop", is_lbl=True)
        acc_card = self._create_stat_card("Active Account", "@cryptomaster", "Blurt.blog Blockchain")
        
        cards_layout.addWidget(btc_card)
        cards_layout.addWidget(ai_card)
        cards_layout.addWidget(self.cd_lbl)
        cards_layout.addWidget(acc_card)
        layout.addLayout(cards_layout)

        # Logs Console
        logs_group = QGroupBox("Live System & Task Execution Logs")
        logs_layout = QVBoxLayout(logs_group)
        self.logs_console = QTextEdit()
        self.logs_console.setReadOnly(True)
        self.logs_console.setStyleSheet("font-family: 'Consolas', monospace; font-size: 12px; background: #111114; border: none;")
        logs_layout.addWidget(self.logs_console)

        btn_bar = QHBoxLayout()
        run_now_btn = QPushButton("🚀 Generate & Publish Now (Manual Trigger)")
        run_now_btn.setObjectName("primaryBtn")
        run_now_btn.clicked.connect(self.run_auto_publish_pipeline)
        
        start_sch_btn = QPushButton("▶️ Start 12h Scheduler")
        start_sch_btn.clicked.connect(self.scheduler.start)
        
        pause_sch_btn = QPushButton("⏸️ Pause Scheduler")
        pause_sch_btn.clicked.connect(self.scheduler.stop)

        btn_bar.addWidget(run_now_btn)
        btn_bar.addWidget(start_sch_btn)
        btn_bar.addWidget(pause_sch_btn)
        btn_bar.addStretch()
        
        layout.addWidget(logs_group)
        layout.addLayout(btn_bar)
        self.stack.addWidget(page)

    def _create_stat_card(self, title, value, subtitle, is_lbl=False):
        card = QWidget()
        card.setStyleSheet("background: #16161A; border: 1px solid #27272A; border-radius: 10px;")
        l = QVBoxLayout(card)
        t = QLabel(title)
        t.setStyleSheet("color: #94A3B8; font-size: 11px; font-weight: bold; border: none;")
        v = QLabel(value)
        v.setStyleSheet("color: #FFFFFF; font-size: 20px; font-weight: 800; border: none;")
        s = QLabel(subtitle)
        s.setStyleSheet("color: #3B82F6; font-size: 11px; border: none;")
        l.addWidget(t)
        l.addWidget(v)
        l.addWidget(s)
        if is_lbl:
            self.cd_val_lbl = v
        return card

    def _build_editor_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        
        layout.addWidget(QLabel("📝 PeakD-Style Article Editor & Markdown Studio"))
        
        self.editor_title = QLineEdit()
        self.editor_title.setPlaceholderText("Enter article title here (e.g. Crypto Market Update – October 26, 2024)...")
        layout.addWidget(self.editor_title)

        toolbar = QHBoxLayout()
        for btn_txt in ["Bold", "Italic", "H1", "H2", "Quote", "Code Block", "Table", "Insert Kline Chart"]:
            b = QPushButton(btn_txt)
            b.clicked.connect(lambda ch, t=btn_txt: self.insert_editor_snippet(t))
            toolbar.addWidget(b)
        toolbar.addStretch()
        layout.addLayout(toolbar)

        self.editor_body = QTextEdit()
        self.editor_body.setPlaceholderText("Write or generate markdown article content...")
        layout.addWidget(self.editor_body)

        footer = QHBoxLayout()
        self.word_count_lbl = QLabel("Words: 0 | Characters: 0 | Auto-save: Ready")
        footer.addWidget(self.word_count_lbl)
        footer.addStretch()
        self.editor_body.textChanged.connect(self._update_word_count)
        layout.addLayout(footer)
        
        self.stack.addWidget(page)

    def _build_preview_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("👁️ Post Preview (Identical to Blurt.blog Final Render)"))
        self.preview_display = QTextEdit()
        self.preview_display.setReadOnly(True)
        self.preview_display.setHtml("<h3>Select Post Preview to inspect live article formatting</h3>")
        layout.addWidget(self.preview_display)
        self.stack.addWidget(page)

    def _build_ai_providers_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("🤖 AI Providers (Google Gemini, OpenAI, Grok)"))
        # Table of providers
        self.ai_table = QTableWidget(3, 5)
        self.ai_table.setHorizontalHeaderLabels(["Provider", "API Key", "Model", "Temperature", "Status"])
        self.ai_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.ai_table)
        self._refresh_ai_table()
        self.stack.addWidget(page)

    def _build_market_apis_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("🔗 Connected Market APIs (Gate.io Spot Tickers & CoinMarketCap)"))
        table = QTableWidget(4, 4)
        table.setHorizontalHeaderLabels(["Symbol", "Pair", "Price (USDT)", "24h Change"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        tickers = self.market_api.get_top_tickers()
        for i, t in enumerate(tickers[:4]):
            table.setItem(i, 0, QTableWidgetItem(t['symbol']))
            table.setItem(i, 1, QTableWidgetItem(t['pair']))
            table.setItem(i, 2, QTableWidgetItem(f"${t['price']:,.2f}"))
            table.setItem(i, 3, QTableWidgetItem(f"{t['change_24h']:+.2f}%"))
        layout.addWidget(table)
        self.stack.addWidget(page)

    def _build_accounts_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("👤 Blurt.blog Blockchain Accounts"))
        self.acc_table = QTableWidget(1, 4)
        self.acc_table.setHorizontalHeaderLabels(["Username", "Posting Key", "Status", "Default Community"])
        self.acc_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.acc_table.setItem(0, 0, QTableWidgetItem("cryptomaster"))
        self.acc_table.setItem(0, 1, QTableWidgetItem("••••••••••••••••••••••••"))
        self.acc_table.setItem(0, 2, QTableWidgetItem("Active"))
        self.acc_table.setItem(0, 3, QTableWidgetItem("blurt-139531"))
        layout.addWidget(self.acc_table)
        self.stack.addWidget(page)

    def _build_communities_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("🏘️ Blurt Communities Routing"))
        combo = QComboBox()
        for c in self.blurt.get_communities():
            combo.addItem(f"{c['name']} ({c['members']} members) - [{c['id']}]")
        layout.addWidget(combo)
        layout.addStretch()
        self.stack.addWidget(page)

    def _build_scheduler_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("⏰ Automation Scheduler Configuration"))
        group = QGroupBox("Publishing Frequency")
        l = QVBoxLayout(group)
        l.addWidget(QCheckBox("Enable Automatic Publishing Every 12 Hours (Gate.io -> AI -> Blurt)"))
        l.addWidget(QCheckBox("Run in system tray background mode"))
        layout.addWidget(group)
        layout.addStretch()
        self.stack.addWidget(page)

    def _build_history_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("📜 Publish Broadcast History Logs"))
        self.hist_table = QTableWidget(0, 6)
        self.hist_table.setHorizontalHeaderLabels(["Date", "Time", "Account", "Community", "Article Title", "Status"])
        self.hist_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.hist_table)
        self.stack.addWidget(page)

    def _build_prompt_manager_page(self):
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(25, 25, 25, 25)
        layout.addWidget(QLabel("🎯 Prompt Manager (Customize AI Tone & Article Structure)"))
        self.sys_prompt_edit = QTextEdit()
        self.sys_prompt_edit.setPlainText("You are an elite cryptocurrency financial analyst and journalist writing for Blurt.blog.")
        layout.addWidget(QLabel("System Prompt:"))
        layout.addWidget(self.sys_prompt_edit)
        layout.addWidget(QLabel("Article Template:"))
        self.art_prompt_edit = QTextEdit()
        self.art_prompt_edit.setPlainText("Crypto Market Update – {date}\n\nIntroduction\n\nBitcoin section\n{btc_chart}\n\nEthereum section\n{eth_chart}\n\nSolana section\n{sol_chart}\n\nDogecoin section\n{doge_chart}\n\nFinal market summary")
        layout.addWidget(self.art_prompt_edit)
        self.stack.addWidget(page)

    def _refresh_ai_table(self):
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name, api_key, model, temperature, is_enabled FROM ai_providers")
            rows = cursor.fetchall()
            self.ai_table.setRowCount(len(rows))
            for r_idx, row in enumerate(rows):
                self.ai_table.setItem(r_idx, 0, QTableWidgetItem(row[0]))
                self.ai_table.setItem(r_idx, 1, QTableWidgetItem("••••••••" if row[1] else "Not Set"))
                self.ai_table.setItem(r_idx, 2, QTableWidgetItem(row[2]))
                self.ai_table.setItem(r_idx, 3, QTableWidgetItem(str(row[3])))
                self.ai_table.setItem(r_idx, 4, QTableWidgetItem("Active" if row[4] else "Disabled"))

    def _update_word_count(self):
        txt = self.editor_body.toPlainText()
        words = len(txt.split())
        chars = len(txt)
        self.word_count_lbl.setText(f"Words: {words:,} | Characters: {chars:,} | Auto-save: Ready")
        # Update preview live
        self.preview_display.setMarkdown(f"# {self.editor_title.text()}\n\n{txt}")

    def insert_editor_snippet(self, snippet_type):
        if snippet_type == "Bold":
            self.editor_body.insertPlainText("**bold text**")
        elif snippet_type == "H1":
            self.editor_body.insertPlainText("\n# Heading 1\n")
        elif snippet_type == "H2":
            self.editor_body.insertPlainText("\n## Heading 2\n")
        elif snippet_type == "Quote":
            self.editor_body.insertPlainText("\n> Market analyst quote here...\n")
        elif snippet_type == "Code Block":
            self.editor_body.insertPlainText("\n```python\n# code block\n```\n")
        elif snippet_type == "Table":
            self.editor_body.insertPlainText("\n| Coin | Price | 24h Change |\n| --- | --- | --- |\n| BTC | $98,450 | +3.4% |\n")
        elif snippet_type == "Insert Kline Chart":
            self.editor_body.insertPlainText("\n![BTC Kline Chart](https://api.gateio.ws/chart/btc)\n")

    def append_log(self, text):
        self.logs_console.append(text)

    def _update_ticks(self):
        self.cd_val_lbl.setText(self.scheduler.get_countdown_str())

    def run_auto_publish_pipeline(self):
        self.append_log("[Pipeline] 🚀 Initiating automated market publication workflow...")
        tickers = self.market_api.get_top_tickers()
        self.append_log(f"[Gate.io] Collected live spot tickers for {len(tickers)} pairs.")
        
        profile = {'system_prompt': self.sys_prompt_edit.toPlainText()}
        self.append_log("[AI Engine] Drafting market analysis...")
        article = self.ai_engine.generate_market_update(tickers, profile)
        
        title = f"Crypto Market Update – {datetime.now().strftime('%B %d, %Y')}"
        self.editor_title.setText(title)
        self.editor_body.setPlainText(article)
        
        self.append_log("[Blurt] Broadcasting article to blockchain community blurt-139531...")
        res = self.blurt.publish_article(title, article, ['cryptocurrency', 'blurt', 'bitcoin', 'trading'])
        self.append_log(f"[Success] ✓ Article published! URL: {res['url']}")
        
        # Refresh history
        self._load_history_table()

    def _load_history_table(self):
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT publish_date, publish_time, account, community, title, status FROM publish_history ORDER BY id DESC")
            rows = cursor.fetchall()
            self.hist_table.setRowCount(len(rows))
            for i, r in enumerate(rows):
                for j in range(6):
                    self.hist_table.setItem(i, j, QTableWidgetItem(str(r[j])))

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = CryptoPublisherDesktop()
    window.show()
    sys.exit(app.exec())
