/**
 * Simple Toast Notification Utility
 * Hiển thị thông báo nổi ở góc màn hình
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

export const toast = {
  success: (message: string, duration = 3000) => {
    showToast({ message, type: 'success', duration });
  },
  error: (message: string, duration = 3000) => {
    showToast({ message, type: 'error', duration });
  },
  info: (message: string, duration = 3000) => {
    showToast({ message, type: 'info', duration });
  },
  warning: (message: string, duration = 3000) => {
    showToast({ message, type: 'warning', duration });
  }
};

function showToast({ message, type, duration = 3000 }: ToastOptions) {
  // Tạo container nếu chưa có
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm';
    document.body.appendChild(container);
  }

  // Tạo toast element
  const toast = document.createElement('div');
  toast.className = `
    toast-item
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
    transform transition-all duration-300 ease-out
    translate-x-full opacity-0
    ${getToastColors(type)}
  `;

  // Icon dựa trên type
  const icon = getToastIcon(type);

  toast.innerHTML = `
    <div class="flex-shrink-0">
      ${icon}
    </div>
    <div class="flex-1 text-sm font-medium">
      ${message}
    </div>
    <button class="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;

  // Thêm vào container
  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);

  // Close button
  const closeButton = toast.querySelector('button');
  closeButton?.addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto remove
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

function removeToast(toast: HTMLElement) {
  toast.classList.add('translate-x-full', 'opacity-0');
  setTimeout(() => {
    toast.remove();
    
    // Remove container nếu không còn toast nào
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

function getToastColors(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'info':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-800 text-white';
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    case 'error':
      return `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    case 'warning':
      return `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      `;
    case 'info':
      return `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    default:
      return '';
  }
}

