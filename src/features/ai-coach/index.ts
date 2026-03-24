/** ai-coach feature 배럴 익스포트 */
export { default as AiCoachChat } from './components/AiCoachChat';
export { default as ChatMessage } from './components/ChatMessage';
export { default as ChatInput } from './components/ChatInput';
export { BandiAvatar } from './components/BandiAvatar';
export { FinniAvatar } from './components/FinniAvatar'; // 하위 호환 유지
// useAiCoach — 배럴 제외. 컴포넌트 내부에서 직접 import
export type { ChatMessage as ChatMessageType } from './types';
export { QUICK_QUESTIONS } from './types';
