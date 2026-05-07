import type {
  AiGenerationRequest,
  AiResponseType,
  JobPageContext,
  UserProfileRecord,
} from '@careeros/shared-types';
import { buildResumeContext } from '@/features/profile/context';
import { loadUserProfileRecord } from '@/features/profile/storage';
import { dispatchInputValue } from '../core/answer-injector';
import { streamAiResponse } from './stream-client';

const OVERLAY_ID = 'careeros-ai-overlay';
const STYLE_ID = 'careeros-ai-overlay-style';

const responseTypeLabels: Record<AiResponseType, string> = {
  cover_letter: 'Cover Letter',
  why_company: 'Why This Company',
  short_answer: 'Short Answer',
  experience_summary: 'Experience Summary',
  technical_answer: 'Technical Answer',
};

type OverlaySession = {
  textarea: HTMLTextAreaElement;
  inferredType: AiResponseType;
  jobContext: JobPageContext;
};

export class AiAssistantOverlay {
  private root: HTMLDivElement;
  private output: HTMLTextAreaElement;
  private promptHintInput: HTMLTextAreaElement;
  private status: HTMLDivElement;
  private typeSelect: HTMLSelectElement;
  private insertButton: HTMLButtonElement;
  private generateButton: HTMLButtonElement;
  private retryButton: HTMLButtonElement;
  private closeButton: HTMLButtonElement;
  private abortController: AbortController | null = null;
  private currentText = '';
  private session: OverlaySession | null = null;

  constructor() {
    this.ensureStyles();
    this.root = this.createOverlay();
    this.output = this.root.querySelector('[data-output]') as HTMLTextAreaElement;
    this.promptHintInput = this.root.querySelector('[data-hint]') as HTMLTextAreaElement;
    this.status = this.root.querySelector('[data-status]') as HTMLDivElement;
    this.typeSelect = this.root.querySelector('[data-type]') as HTMLSelectElement;
    this.insertButton = this.root.querySelector('[data-insert]') as HTMLButtonElement;
    this.generateButton = this.root.querySelector('[data-generate]') as HTMLButtonElement;
    this.retryButton = this.root.querySelector('[data-retry]') as HTMLButtonElement;
    this.closeButton = this.root.querySelector('[data-close]') as HTMLButtonElement;

    this.insertButton.addEventListener('click', () => this.insertIntoField());
    this.generateButton.addEventListener('click', () => void this.generate());
    this.retryButton.addEventListener('click', () => void this.generate());
    this.closeButton.addEventListener('click', () => this.close());
  }

  open(session: OverlaySession): void {
    this.session = session;
    this.typeSelect.value = session.inferredType;
    this.currentText = '';
    this.output.value = '';
    this.promptHintInput.value = '';
    this.status.textContent = `Ready to generate for ${session.jobContext.roleTitle ?? 'this role'}`;
    this.root.hidden = false;
  }

  close(): void {
    this.abortController?.abort();
    this.root.hidden = true;
  }

  private async generate(): Promise<void> {
    if (!this.session) {
      return;
    }

    const profileRecord = await loadUserProfileRecord();
    const request = await this.buildRequest(profileRecord, this.session);
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.currentText = '';
    this.output.value = '';
    this.status.textContent = 'Generating...';
    this.insertButton.disabled = true;

    try {
      await streamAiResponse(request, {
        signal: this.abortController.signal,
        onEvent: (event) => {
          if (event.type === 'started') {
            this.status.textContent = `Streaming from ${event.model}`;
          } else if (event.type === 'delta') {
            this.currentText += event.text;
            this.output.value = this.currentText;
          } else if (event.type === 'completed') {
            this.currentText = event.text;
            this.output.value = event.text;
            this.status.textContent = 'Generation complete';
            this.insertButton.disabled = false;
          } else if (event.type === 'error') {
            this.status.textContent = event.message;
          }
        },
      });
    } catch (error) {
      this.status.textContent =
        error instanceof Error ? error.message : 'AI generation failed';
    }
  }

  private async buildRequest(
    record: UserProfileRecord,
    session: OverlaySession,
  ): Promise<AiGenerationRequest> {
    return {
      type: this.typeSelect.value as AiResponseType,
      promptHint: this.promptHintInput.value.trim() || undefined,
      profile: record.profile,
      resumeContext: await buildResumeContext(record),
      jobContext: session.jobContext,
      maxOutputTokens: 900,
    };
  }

  private insertIntoField(): void {
    if (!this.session || !this.currentText.trim()) {
      return;
    }

    dispatchInputValue(this.session.textarea, this.currentText.trim());
    this.status.textContent = 'Inserted into field';
  }

  private ensureStyles(): void {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: min(460px, calc(100vw - 32px));
        z-index: 2147483645;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      #${OVERLAY_ID} .careeros-card {
        border: 1px solid rgba(203, 213, 225, 0.8);
        background: rgba(255,255,255,0.98);
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.2);
        border-radius: 20px;
        overflow: hidden;
        backdrop-filter: blur(16px);
      }
      #${OVERLAY_ID} button,
      #${OVERLAY_ID} select,
      #${OVERLAY_ID} textarea {
        font: inherit;
      }
    `;
    document.head.appendChild(style);
  }

  private createOverlay(): HTMLDivElement {
    let root = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
    if (root) {
      return root;
    }

    root = document.createElement('div');
    root.id = OVERLAY_ID;
    root.hidden = true;
    root.innerHTML = `
      <div class="careeros-card">
        <div style="padding:16px 18px; border-bottom:1px solid rgba(226,232,240,0.9); display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div>
            <div style="font-size:12px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#64748b;">CareerOS AI</div>
            <div style="margin-top:4px; font-size:18px; font-weight:600; color:#0f172a;">AI Response Assistant</div>
          </div>
          <button data-close type="button" style="border:none;background:transparent;font-size:22px;cursor:pointer;color:#475569;">x</button>
        </div>
        <div style="padding:16px 18px; display:grid; gap:12px;">
          <div data-status style="font-size:13px; color:#475569;">Ready</div>
          <label style="display:grid; gap:6px;">
            <span style="font-size:13px; font-weight:600; color:#0f172a;">Response type</span>
            <select data-type style="border:1px solid #cbd5e1; border-radius:12px; padding:10px 12px;">
              ${Object.entries(responseTypeLabels)
                .map(([value, label]) => `<option value="${value}">${label}</option>`)
                .join('')}
            </select>
          </label>
          <label style="display:grid; gap:6px;">
            <span style="font-size:13px; font-weight:600; color:#0f172a;">Extra instructions</span>
            <textarea data-hint rows="3" placeholder="Optional guidance, tone, or emphasis" style="border:1px solid #cbd5e1; border-radius:12px; padding:10px 12px; resize:vertical;"></textarea>
          </label>
          <label style="display:grid; gap:6px;">
            <span style="font-size:13px; font-weight:600; color:#0f172a;">Generated response</span>
            <textarea data-output rows="10" readonly style="border:1px solid #cbd5e1; border-radius:12px; padding:10px 12px; resize:vertical; background:#f8fafc;"></textarea>
          </label>
          <div style="display:flex; flex-wrap:wrap; gap:10px;">
            <button data-generate type="button" style="border:none; border-radius:999px; background:#1640d6; color:white; padding:10px 16px; font-weight:600; cursor:pointer;">Generate</button>
            <button data-insert type="button" disabled style="border:none; border-radius:999px; background:#0f172a; color:white; padding:10px 16px; font-weight:600; cursor:pointer;">Insert into field</button>
            <button data-retry type="button" style="border:1px solid #cbd5e1; border-radius:999px; background:white; color:#0f172a; padding:10px 16px; font-weight:600; cursor:pointer;">Retry</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    return root;
  }
}
