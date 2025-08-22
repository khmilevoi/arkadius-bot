import type { ServiceIdentifier } from 'inversify';
import type { Context } from 'telegraf';

import type { TriggerContext, TriggerResult } from '@/domain/triggers/Trigger';

export interface TriggerPipeline {
  shouldRespond(
    ctx: Context,
    context: TriggerContext
  ): Promise<TriggerResult | null>;
}

export const TRIGGER_PIPELINE_ID = Symbol.for(
  'TriggerPipeline'
) as ServiceIdentifier<TriggerPipeline>;
