"""
Professional Trading Candlestick (Kline) Chart Generator
Renders high-resolution PNG/SVG trading charts directly from Gate.io OHLCV market data.
Do NOT capture screenshots.
"""
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

class KlineChartRenderer:
    @staticmethod
    def generate_chart_base64(symbol, klines, width=8, height=4, theme="dark"):
        """
        Renders a professional candlestick trading chart with volume subgraph and 7-period moving average.
        Returns data:image/png;base64 string for embedding in Markdown articles or UI preview.
        """
        if not klines or len(klines) < 2:
            return ""

        # Setup colors
        bg_color = '#16161A' if theme == 'dark' else '#F8FAFC'
        text_color = '#E2E8F0' if theme == 'dark' else '#1E293B'
        grid_color = '#27272A' if theme == 'dark' else '#E2E8F0'
        bull_color = '#10B981'  # Emerald
        bear_color = '#EF4444'  # Red
        ma_color = '#3B82F6'    # Blue

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(width, height), gridspec_kw={'height_ratios': [3, 1]}, sharex=True)
        fig.patch.set_facecolor(bg_color)
        ax1.set_facecolor(bg_color)
        ax2.set_facecolor(bg_color)

        x_indices = list(range(len(klines)))
        labels = [k['time'] for k in klines]
        closes = [k['close'] for k in klines]
        volumes = [k['volume'] for k in klines]

        # Calculate 7-period Moving Average
        ma7 = []
        for i in range(len(closes)):
            if i < 6:
                ma7.append(None)
            else:
                ma7.append(sum(closes[i-6:i+1]) / 7.0)

        # Plot Candlesticks
        for i, k in enumerate(klines):
            color = bull_color if k['close'] >= k['open'] else bear_color
            # High-Low Wick
            ax1.plot([i, i], [k['low'], k['high']], color=color, linewidth=1, zorder=2)
            # Open-Close Body
            body_bottom = min(k['open'], k['close'])
            body_height = abs(k['close'] - k['open'])
            if body_height == 0:
                body_height = k['close'] * 0.0005
            ax1.bar(i, body_height, bottom=body_bottom, color=color, width=0.6, zorder=3)
            
            # Volume bar
            ax2.bar(i, k['volume'], color=color, alpha=0.6, width=0.6, zorder=2)

        # Plot Moving Average
        valid_indices = [i for i, val in enumerate(ma7) if val is not None]
        valid_ma = [ma7[i] for i in valid_indices]
        if valid_ma:
            ax1.plot(valid_indices, valid_ma, color=ma_color, linewidth=1.5, label='MA (7)', zorder=4)
            ax1.legend(loc='upper left', facecolor=bg_color, edgecolor=grid_color, labelcolor=text_color, fontsize=8)

        # Formatting Ax1
        ax1.set_title(f"{symbol} / USDT • Gate.io Live Market Candlestick & Volume", color=text_color, fontsize=10, fontweight='bold', pad=10)
        ax1.grid(True, linestyle='--', color=grid_color, alpha=0.5, zorder=1)
        ax1.tick_params(axis='y', colors=text_color, labelsize=8)
        ax1.spines['top'].set_visible(False)
        ax1.spines['right'].set_visible(False)
        ax1.spines['bottom'].set_color(grid_color)
        ax1.spines['left'].set_color(grid_color)

        # Formatting Ax2 (Volume)
        ax2.grid(True, linestyle='--', color=grid_color, alpha=0.5, zorder=1)
        ax2.tick_params(axis='both', colors=text_color, labelsize=8)
        ax2.spines['top'].set_visible(False)
        ax2.spines['right'].set_visible(False)
        ax2.spines['bottom'].set_color(grid_color)
        ax2.spines['left'].set_color(grid_color)

        # X-Axis Ticks
        step = max(1, len(x_indices) // 6)
        tick_pos = x_indices[::step]
        tick_lbls = labels[::step]
        ax2.set_xticks(tick_pos)
        ax2.set_xticklabels(tick_lbls, rotation=0, color=text_color, fontsize=8)

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=120, facecolor=fig.get_facecolor(), edgecolor='none')
        plt.close(fig)
        buf.seek(0)
        b64_str = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"
