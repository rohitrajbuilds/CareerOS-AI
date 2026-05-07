import { buildJobContextForField } from './job-context';
import { AiAssistantOverlay } from './assistant-overlay';

const TEXTAREA_BUTTON_ATTRIBUTE = 'data-careeros-ai-button';

function ensureButtonStyles(): void {
  if (document.getElementById('careeros-ai-button-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'careeros-ai-button-style';
  style.textContent = `
    .careeros-ai-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      border: none;
      border-radius: 999px;
      background: #1640d6;
      color: white;
      padding: 8px 14px;
      font: 600 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(22, 64, 214, 0.2);
    }
  `;
  document.head.appendChild(style);
}

export class AiGenerateButtonManager {
  constructor(private readonly overlay: AiAssistantOverlay) {
    ensureButtonStyles();
  }

  attachButtons(): void {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    for (const textarea of textareas) {
      if (textarea.readOnly || textarea.closest('#careeros-ai-overlay')) {
        continue;
      }

      if (textarea.hasAttribute(TEXTAREA_BUTTON_ATTRIBUTE)) {
        continue;
      }

      textarea.setAttribute(TEXTAREA_BUTTON_ATTRIBUTE, 'true');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'careeros-ai-button';
      button.textContent = 'Generate AI Answer';
      button.addEventListener('click', () => {
        const { jobContext, inferredType } = buildJobContextForField(textarea);
        this.overlay.open({
          textarea,
          inferredType,
          jobContext,
        });
      });

      textarea.insertAdjacentElement('afterend', button);
    }
  }
}
