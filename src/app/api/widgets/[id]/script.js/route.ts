import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const widget = await prisma.widget.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            stacksAddress: true,
          }
        }
      }
    })

    if (!widget || !widget.active) {
      return new NextResponse(
        `console.error('ZapX Widget ${id} not found or inactive');`,
        {
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=300', // 5 minutes cache
          }
        }
      )
    }

    // Check origin if restricted
    const origin = request.headers.get('referer') || request.headers.get('origin')
    if (widget.allowedOrigins.length > 0 && origin) {
      const isAllowed = widget.allowedOrigins.some(allowed => 
        origin.includes(allowed) || new URL(origin).hostname === allowed
      )
      
      if (!isAllowed) {
        return new NextResponse(
          `console.error('ZapX Widget ${id} not allowed on this domain');`,
          {
            headers: {
              'Content-Type': 'application/javascript',
            }
          }
        )
      }
    }

    const settings = widget.settings as any
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Generate the widget JavaScript
    const widgetScript = generateWidgetScript(id, settings, baseUrl)

    // Increment impressions
    await prisma.widget.update({
      where: { id: widget.id },
      data: { impressions: { increment: 1 } }
    })

    return new NextResponse(widgetScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })

  } catch (error) {
    console.error('Error generating widget script:', error)
    return new NextResponse(
      `console.error('Error loading ZapX Widget: ${error}');`,
      {
        headers: {
          'Content-Type': 'application/javascript',
        }
      }
    )
  }
}

function generateWidgetScript(widgetId: string, settings: any, baseUrl: string): string {
  return `
(function() {
  'use strict';
  
  // Widget configuration
  const WIDGET_ID = '${widgetId}';
  const BASE_URL = '${baseUrl}';
  const CONFIG = ${JSON.stringify(settings)};
  
  // Check if container exists
  const container = document.getElementById('zapx-widget-' + WIDGET_ID);
  if (!container) {
    console.error('ZapX Widget container not found: zapx-widget-' + WIDGET_ID);
    return;
  }
  
  // Prevent multiple initialization
  if (container.dataset.zapxInitialized) {
    return;
  }
  container.dataset.zapxInitialized = 'true';
  
  // Create widget styles
  const styles = \`
    .zapx-widget {
      max-width: \${CONFIG.compact ? '320px' : '400px'};
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #e2e8f0;
      border-radius: \${CONFIG.borderRadius || '0.5rem'};
      background: white;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .zapx-widget-header {
      padding: \${CONFIG.compact ? '16px 16px 8px' : '20px'};
      border-bottom: 1px solid #f1f5f9;
    }
    .zapx-widget-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .zapx-widget-description {
      margin: 0;
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
    }
    .zapx-widget-body {
      padding: \${CONFIG.compact ? '16px' : '20px'};
    }
    .zapx-widget-amount {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: \${CONFIG.primaryColor || '#f97316'};
      margin-bottom: 16px;
    }
    .zapx-widget-button {
      width: 100%;
      padding: 12px 16px;
      background: \${CONFIG.primaryColor || '#f97316'};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .zapx-widget-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .zapx-widget-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .zapx-widget-status {
      text-align: center;
      margin: 12px 0;
      font-size: 14px;
    }
    .zapx-widget-error {
      background: #fee2e2;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 14px;
    }
    .zapx-widget-success {
      background: #dcfce7;
      color: #16a34a;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 14px;
    }
    .zapx-widget-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: zapx-spin 1s linear infinite;
    }
    @keyframes zapx-spin {
      to { transform: rotate(360deg); }
    }
    .zapx-widget-badge {
      display: inline-block;
      padding: 2px 6px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 10px;
      border-radius: 3px;
      margin-top: 8px;
    }
  \`;
  
  // Inject styles
  if (!document.getElementById('zapx-widget-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'zapx-widget-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // Widget state
  let state = {
    connected: false,
    loading: false,
    error: null,
    status: 'idle'
  };
  
  // Render widget
  function render() {
    const amount = CONFIG.amount || 0;
    const currency = CONFIG.currency || 'SBTC';
    
    container.innerHTML = \`
      <div class="zapx-widget">
        <div class="zapx-widget-header">
          <h3 class="zapx-widget-title">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
            </svg>
            \${CONFIG.title}
          </h3>
          \${CONFIG.description ? \`<p class="zapx-widget-description">\${CONFIG.description}</p>\` : ''}
        </div>
        <div class="zapx-widget-body">
          <div class="zapx-widget-amount">\${amount} \${currency}</div>
          
          \${state.error ? \`<div class="zapx-widget-error">\${state.error}</div>\` : ''}
          \${state.status === 'completed' ? \`<div class="zapx-widget-success">Payment completed!</div>\` : ''}
          
          <div class="zapx-widget-status">
            \${getStatusText()}
          </div>
          
          <button class="zapx-widget-button" onclick="handlePayment()" \${state.loading || state.status === 'completed' ? 'disabled' : ''}>
            \${state.loading ? '<div class="zapx-widget-spinner"></div>' : ''}
            \${getButtonText()}
          </button>
          
          <div style="text-align: center; margin-top: 12px;">
            <span class="zapx-widget-badge">Stacks Testnet</span>
          </div>
        </div>
      </div>
    \`;
  }
  
  function getStatusText() {
    switch (state.status) {
      case 'connecting': return 'Connecting wallet...';
      case 'processing': return 'Processing payment...';
      case 'confirming': return 'Confirming transaction...';
      case 'completed': return 'Payment completed!';
      case 'failed': return 'Payment failed';
      default: return state.connected ? 'Ready to pay' : 'Connect wallet to continue';
    }
  }
  
  function getButtonText() {
    const amount = CONFIG.amount || 0;
    const currency = CONFIG.currency || 'SBTC';
    
    if (state.status === 'completed') return 'Completed';
    if (state.loading) return 'Processing...';
    if (!state.connected) return 'Connect Wallet';
    return \`Pay \${amount} \${currency}\`;
  }
  
  // Make handlePayment globally accessible
  window.handlePayment = function() {
    if (state.loading || state.status === 'completed') return;
    
    state.loading = true;
    state.error = null;
    state.status = 'processing';
    render();
    
    // Check if Stacks wallet is available
    if (typeof window.StacksProvider === 'undefined') {
      // Attempt to load Stacks Connect
      loadStacksConnect().then(() => {
        initiatePayment();
      }).catch(err => {
        state.error = 'Please install a Stacks wallet (like Leather) to continue';
        state.loading = false;
        state.status = 'failed';
        render();
      });
    } else {
      initiatePayment();
    }
  };
  
  function loadStacksConnect() {
    return new Promise((resolve, reject) => {
      if (document.getElementById('stacks-connect-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'stacks-connect-script';
      script.src = 'https://unpkg.com/@stacks/connect@7.8.4/dist/umd/index.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  function initiatePayment() {
    // This is a simplified version - in a real implementation,
    // we would use the actual Stacks Connect library
    setTimeout(() => {
      // Simulate successful payment
      state.loading = false;
      state.status = 'completed';
      state.connected = true;
      render();
      
      // Track conversion
      fetch(BASE_URL + '/api/widgets/' + WIDGET_ID + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'conversion' })
      }).catch(console.error);
      
    }, 3000);
  }
  
  // Initial render
  render();
  
  // Track impression
  fetch(BASE_URL + '/api/widgets/' + WIDGET_ID + '/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'impression' })
  }).catch(console.error);
  
})();
`
}