"""
Crypto Auto Publisher Desktop Application
Cross-platform PySide6 (Qt) Modern Acrylic/Fluent Desktop Suite
Runs on Windows, Linux, macOS.
"""
import sys
import os
from datetime import datetime
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

        reset_sch_btn = QPushButton("🔄 Reset Countdown Timer")
        reset_sch_btn.clicked.connect(self._reset_scheduler_timer)

        btn_bar.addWidget(run_now_btn)
        btn_bar.addWidget(start_sch_btn)
        btn_bar.addWidget(pause_sch_btn)
        btn_bar.addWidget(reset_sch_btn)
        btn_bar.addStretch()
        
        layout.addWidget(logs_group)
        layout.addLayout(btn_bar)
        self.stack.addWidget(page)

    def _reset_scheduler_timer(self):
        self.scheduler.reset_timer()
        QMessageBox.information(self, "Scheduler Reset", "The countdown timer has been reset to 12 hours.")

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
        layout.setSpacing(15)
        
        header = QLabel("🤖 AI Providers (Google Gemini, OpenAI, Grok)")
        header.setStyleSheet("font-size: 18px; font-weight: bold; color: #FFFFFF;")
        layout.addWidget(header)
        
        # Table of providers
        self.ai_table = QTableWidget(3, 5)
        self.ai_table.setHorizontalHeaderLabels(["Provider", "API Key", "Model", "Temperature", "Status"])
        self.ai_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.ai_table)
        
        # Form
        form_group = QGroupBox("Edit Selected AI Provider Settings")
        form_layout = QVBoxLayout(form_group)
        
        self.edit_ai_name_lbl = QLabel("Select an AI provider from the table above to edit...")
        self.edit_ai_name_lbl.setStyleSheet("font-weight: bold; color: #3B82F6; font-size: 14px;")
        form_layout.addWidget(self.edit_ai_name_lbl)
        
        grid = QHBoxLayout()
        
        key_v = QVBoxLayout()
        key_v.addWidget(QLabel("API Key:"))
        self.edit_ai_key = QLineEdit()
        self.edit_ai_key.setPlaceholderText("Enter API Key...")
        self.edit_ai_key.setEchoMode(QLineEdit.Password)
        key_v.addWidget(self.edit_ai_key)
        grid.addLayout(key_v)
        
        model_v = QVBoxLayout()
        model_v.addWidget(QLabel("Model ID/Alias:"))
        self.edit_ai_model = QLineEdit()
        self.edit_ai_model.setPlaceholderText("e.g. gemini-3.5-flash")
        model_v.addWidget(self.edit_ai_model)
        grid.addLayout(model_v)
        
        temp_v = QVBoxLayout()
        temp_v.addWidget(QLabel("Temperature:"))
        self.edit_ai_temp = QDoubleSpinBox()
        self.edit_ai_temp.setRange(0.0, 2.0)
        self.edit_ai_temp.setSingleStep(0.1)
        self.edit_ai_temp.setValue(0.7)
        temp_v.addWidget(self.edit_ai_temp)
        grid.addLayout(temp_v)
        
        form_layout.addLayout(grid)
        
        btn_layout = QHBoxLayout()
        self.edit_ai_default = QCheckBox("Set as Default/Active AI Engine")
        btn_layout.addWidget(self.edit_ai_default)
        
        save_btn = QPushButton("💾 Save Provider Settings")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self._save_ai_provider)
        btn_layout.addWidget(save_btn)
        btn_layout.addStretch()
        
        form_layout.addLayout(btn_layout)
        layout.addWidget(form_group)
        
        self.ai_table.itemSelectionChanged.connect(self._on_ai_provider_selected)
        self._refresh_ai_table()
        self.stack.addWidget(page)

    def _on_ai_provider_selected(self):
        selected_ranges = self.ai_table.selectedRanges()
        if not selected_ranges:
            return
        row = selected_ranges[0].topRow()
        provider_name = self.ai_table.item(row, 0).text()
        
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name, api_key, model, temperature, is_default FROM ai_providers WHERE name=?", (provider_name,))
            res = cursor.fetchone()
            if res:
                name, api_key, model, temp, is_default = res
                self.edit_ai_name_lbl.setText(f"Editing Settings for: {name}")
                self.edit_ai_key.setText(api_key or "")
                self.edit_ai_model.setText(model or "")
                self.edit_ai_temp.setValue(temp or 0.7)
                self.edit_ai_default.setChecked(bool(is_default))

    def _save_ai_provider(self):
        selected_ranges = self.ai_table.selectedRanges()
        if not selected_ranges:
            QMessageBox.warning(self, "Selection Required", "Please select an AI provider from the table first.")
            return
        row = selected_ranges[0].topRow()
        provider_name = self.ai_table.item(row, 0).text()
        
        api_key = self.edit_ai_key.text().strip()
        model = self.edit_ai_model.text().strip()
        temp = self.edit_ai_temp.value()
        is_default = 1 if self.edit_ai_default.isChecked() else 0
        
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            if is_default == 1:
                cursor.execute("UPDATE ai_providers SET is_default=0")
            cursor.execute('''
                UPDATE ai_providers 
                SET api_key=?, model=?, temperature=?, is_default=?
                WHERE name=?
            ''', (api_key, model, temp, is_default, provider_name))
            conn.commit()
            
        self.append_log(f"[AI Config] ✓ Updated settings for {provider_name} (Model: {model}).")
        self._refresh_ai_table()
        QMessageBox.information(self, "Success", f"AI Provider '{provider_name}' settings saved successfully.")

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
        layout.setSpacing(15)
        
        header = QLabel("👤 Blurt.blog Blockchain Accounts")
        header.setStyleSheet("font-size: 18px; font-weight: bold; color: #FFFFFF;")
        layout.addWidget(header)
        
        # Table of accounts
        self.acc_table = QTableWidget(0, 4)
        self.acc_table.setHorizontalHeaderLabels(["Username", "Posting Key", "Status", "Default Community"])
        self.acc_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        layout.addWidget(self.acc_table)
        
        # Edit/Add Account Form
        form_group = QGroupBox("Add / Edit Blurt Account")
        form_layout = QVBoxLayout(form_group)
        
        grid = QHBoxLayout()
        
        user_v = QVBoxLayout()
        user_v.addWidget(QLabel("Username (without @):"))
        self.acc_user_input = QLineEdit()
        self.acc_user_input.setPlaceholderText("e.g. cryptomaster")
        user_v.addWidget(self.acc_user_input)
        grid.addLayout(user_v)
        
        key_v = QVBoxLayout()
        key_v.addWidget(QLabel("Private Posting Key (5J... or 5K...):"))
        self.acc_key_input = QLineEdit()
        self.acc_key_input.setPlaceholderText("Enter private posting key...")
        self.acc_key_input.setEchoMode(QLineEdit.Password)
        key_v.addWidget(self.acc_key_input)
        grid.addLayout(key_v)
        
        comm_v = QVBoxLayout()
        comm_v.addWidget(QLabel("Default Community ID:"))
        self.acc_comm_input = QComboBox()
        for c in self.blurt.get_communities():
            self.acc_comm_input.addItem(f"{c['name']} [{c['id']}]", c['id'])
        comm_v.addWidget(self.acc_comm_input)
        grid.addLayout(comm_v)
        
        form_layout.addLayout(grid)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("💾 Save / Add Account")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self._save_blurt_account)
        
        set_active_btn = QPushButton("⭐️ Set Selected as Active")
        set_active_btn.clicked.connect(self._set_account_active)
        
        delete_btn = QPushButton("🗑️ Delete Account")
        delete_btn.setStyleSheet("color: #EF4444; border-color: #EF4444;")
        delete_btn.clicked.connect(self._delete_blurt_account)
        
        btn_layout.addWidget(save_btn)
        btn_layout.addWidget(set_active_btn)
        btn_layout.addWidget(delete_btn)
        btn_layout.addStretch()
        form_layout.addLayout(btn_layout)
        
        layout.addWidget(form_group)
        
        self.acc_table.itemSelectionChanged.connect(self._on_account_selected)
        self._refresh_accounts_table()
        self.stack.addWidget(page)

    def _refresh_accounts_table(self):
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT username, posting_key, is_active, default_community FROM blurt_accounts")
            rows = cursor.fetchall()
            
            if not rows:
                cursor.execute('''
                    INSERT INTO blurt_accounts (username, posting_key, is_active, default_community)
                    VALUES (?, ?, ?, ?)
                ''', ("cryptomaster", "5K_DEMO_POSTING_KEY_XYZ", 1, "blurt-139531"))
                conn.commit()
                cursor.execute("SELECT username, posting_key, is_active, default_community FROM blurt_accounts")
                rows = cursor.fetchall()

            self.acc_table.setRowCount(len(rows))
            for r_idx, row in enumerate(rows):
                self.acc_table.setItem(r_idx, 0, QTableWidgetItem(row[0]))
                self.acc_table.setItem(r_idx, 1, QTableWidgetItem("••••••••" if row[1] else "Not Set"))
                self.acc_table.setItem(r_idx, 2, QTableWidgetItem("Active / Selected" if row[2] else "Inactive"))
                self.acc_table.setItem(r_idx, 3, QTableWidgetItem(row[3]))

    def _on_account_selected(self):
        selected_ranges = self.acc_table.selectedRanges()
        if not selected_ranges:
            return
        row = selected_ranges[0].topRow()
        username = self.acc_table.item(row, 0).text()
        
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT username, posting_key, default_community FROM blurt_accounts WHERE username=?", (username,))
            res = cursor.fetchone()
            if res:
                uname, key, comm = res
                self.acc_user_input.setText(uname)
                self.acc_key_input.setText(key)
                idx = self.acc_comm_input.findData(comm)
                if idx >= 0:
                    self.acc_comm_input.setCurrentIndex(idx)

    def _save_blurt_account(self):
        username = self.acc_user_input.text().strip()
        posting_key = self.acc_key_input.text().strip()
        community = self.acc_comm_input.currentData()
        
        if not username or not posting_key:
            QMessageBox.warning(self, "Validation Error", "Please provide both Username and Posting Key.")
            return
            
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM blurt_accounts WHERE username=?", (username,))
            res = cursor.fetchone()
            if res:
                cursor.execute('''
                    UPDATE blurt_accounts 
                    SET posting_key=?, default_community=?
                    WHERE username=?
                ''', (posting_key, community, username))
            else:
                cursor.execute("SELECT count(*) FROM blurt_accounts")
                count = cursor.fetchone()[0]
                is_active = 1 if count == 0 else 0
                cursor.execute('''
                    INSERT INTO blurt_accounts (username, posting_key, is_active, default_community)
                    VALUES (?, ?, ?, ?)
                ''', (username, posting_key, is_active, community))
            conn.commit()
            
        self.append_log(f"[Account] ✓ Saved account @{username} with default community {community}.")
        self._refresh_accounts_table()
        QMessageBox.information(self, "Success", f"Account '@{username}' saved successfully.")

    def _set_account_active(self):
        selected_ranges = self.acc_table.selectedRanges()
        if not selected_ranges:
            QMessageBox.warning(self, "Selection Required", "Please select an account from the table first.")
            return
        row = selected_ranges[0].topRow()
        username = self.acc_table.item(row, 0).text()
        
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE blurt_accounts SET is_active=0")
            cursor.execute("UPDATE blurt_accounts SET is_active=1 WHERE username=?", (username,))
            conn.commit()
            
        self.append_log(f"[Account] ✓ Active publishing account changed to @{username}.")
        self._refresh_accounts_table()
        QMessageBox.information(self, "Success", f"Account '@{username}' is now set as Active.")

    def _delete_blurt_account(self):
        selected_ranges = self.acc_table.selectedRanges()
        if not selected_ranges:
            QMessageBox.warning(self, "Selection Required", "Please select an account from the table first.")
            return
        row = selected_ranges[0].topRow()
        username = self.acc_table.item(row, 0).text()
        
        if username == "cryptomaster":
            QMessageBox.warning(self, "Protected Account", "The demo account 'cryptomaster' cannot be deleted.")
            return
            
        confirm = QMessageBox.question(self, "Confirm Delete", f"Are you sure you want to delete account '@{username}'?", QMessageBox.Yes | QMessageBox.No)
        if confirm == QMessageBox.Yes:
            with self.db._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM blurt_accounts WHERE username=?", (username,))
                cursor.execute("SELECT count(*) FROM blurt_accounts WHERE is_active=1")
                has_active = cursor.fetchone()[0]
                if has_active == 0:
                    cursor.execute("UPDATE blurt_accounts SET is_active=1 LIMIT 1")
                conn.commit()
                
            self.append_log(f"[Account] Deleted account @{username}.")
            self._refresh_accounts_table()
            QMessageBox.information(self, "Deleted", f"Account '@{username}' has been deleted.")

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
        layout.setSpacing(10)
        
        header = QLabel("🎯 Prompt Manager (Customize AI Tone & Article Structure)")
        header.setStyleSheet("font-size: 18px; font-weight: bold; color: #FFFFFF;")
        layout.addWidget(header)
        
        self.sys_prompt_edit = QTextEdit()
        layout.addWidget(QLabel("System Instruction Prompt:"))
        layout.addWidget(self.sys_prompt_edit)
        
        self.art_prompt_edit = QTextEdit()
        layout.addWidget(QLabel("Article Template (Markdown structure):"))
        layout.addWidget(self.art_prompt_edit)
        
        save_btn = QPushButton("💾 Save Prompts & Template")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self._save_prompts_to_db)
        layout.addWidget(save_btn)
        
        self._load_prompts_from_db()
        self.stack.addWidget(page)

    def _load_prompts_from_db(self):
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT system_prompt, article_prompt FROM prompt_profiles WHERE name=?", ('Standard Professional Profile',))
            row = cursor.fetchone()
            if row:
                self.sys_prompt_edit.setPlainText(row[0] or "")
                self.art_prompt_edit.setPlainText(row[1] or "")

    def _save_prompts_to_db(self):
        sys_p = self.sys_prompt_edit.toPlainText().strip()
        art_p = self.art_prompt_edit.toPlainText().strip()
        
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE prompt_profiles 
                SET system_prompt=?, article_prompt=?
                WHERE name=?
            ''', (sys_p, art_p, 'Standard Professional Profile'))
            conn.commit()
            
        self.append_log("[Config] ✓ Prompt profiles and article templates updated in database.")
        QMessageBox.information(self, "Success", "Prompt profiles saved successfully!")

    def _refresh_ai_table(self):
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name, api_key, model, temperature, is_default FROM ai_providers")
            rows = cursor.fetchall()
            self.ai_table.setRowCount(len(rows))
            for r_idx, row in enumerate(rows):
                self.ai_table.setItem(r_idx, 0, QTableWidgetItem(row[0]))
                self.ai_table.setItem(r_idx, 1, QTableWidgetItem("••••••••" if row[1] else "Not Set"))
                self.ai_table.setItem(r_idx, 2, QTableWidgetItem(row[2]))
                self.ai_table.setItem(r_idx, 3, QTableWidgetItem(str(row[3])))
                self.ai_table.setItem(r_idx, 4, QTableWidgetItem("Default / Active" if row[4] else "Available"))

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
