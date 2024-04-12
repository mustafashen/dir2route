import { IncomingMessage, ServerResponse } from 'http';

declare function dir2route(): Promise<{} | {[key: string]: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void}>;
