"""
Background Thread Scheduler for Automatic Publishing
Manages 12-hour automated publish loop, countdown timer, and system logging.
"""
import threading
import time
from datetime import datetime, timedelta

class AutomationScheduler:
    def __init__(self, publish_callback, log_callback=None):
        self.publish_callback = publish_callback
        self.log_callback = log_callback
        self.is_running = False
        self.interval_seconds = 12 * 3600  # 12 hours
        self.next_publish_time = datetime.now() + timedelta(seconds=self.interval_seconds)
        self.thread = None

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.next_publish_time = datetime.now() + timedelta(seconds=self.interval_seconds)
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            if self.log_callback:
                self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] Scheduler started. Interval: Every 12 Hours.")

    def stop(self):
        self.is_running = False
        if self.log_callback:
            self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] Scheduler paused.")

    def get_countdown_str(self):
        if not self.is_running:
            return "PAUSED"
        remaining = self.next_publish_time - datetime.now()
        secs = int(remaining.total_seconds())
        if secs <= 0:
            return "00:00:00"
        hours = secs // 3600
        mins = (secs % 3600) // 60
        s = secs % 60
        return f"{hours:02d}:{mins:02d}:{s:02d}"

    def trigger_now_manual(self):
        if self.log_callback:
            self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] Manual publish triggered by user.")
        threading.Thread(target=self._execute_job, daemon=True).start()

    def _run_loop(self):
        while self.is_running:
            time.sleep(1)
            if datetime.now() >= self.next_publish_time:
                self._execute_job()
                self.next_publish_time = datetime.now() + timedelta(seconds=self.interval_seconds)

    def _execute_job(self):
        try:
            if self.log_callback:
                self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] STARTING TASK: Automated Crypto Market Update Generation")
            self.publish_callback()
            if self.log_callback:
                self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ Job completed successfully. Next run in 12 hours.")
        except Exception as e:
            if self.log_callback:
                self.log_callback(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Job execution failed: {e}. Retrying in 15 minutes...")
            self.next_publish_time = datetime.now() + timedelta(minutes=15)
