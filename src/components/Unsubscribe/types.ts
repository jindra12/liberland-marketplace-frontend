import type { MessageInstance } from "antd/es/message/interface";
import type { UseQueryResult } from "@tanstack/react-query";

import type { NotificationTargetCollection } from "../share/SubscribeButton/types";

export type ParsedUnsubscribeParams = {
    collection: NotificationTargetCollection;
    queryType: string;
    id: string;
    email: string;
};

export type UnsubscribeParseResult =
    | {
          isValid: true;
          params: ParsedUnsubscribeParams;
      }
    | {
          isValid: false;
          reason: string;
      };

export type ResolvedNotificationEntity = {
    collection: NotificationTargetCollection;
    typeLabel: string;
    targetID: string;
    title: string;
    summary?: string | null;
    imageURL?: string | null;
    serverURL?: string | null;
    detailPath: string;
};

export type UnsubscribeEntityProps<TData> = {
    params: ParsedUnsubscribeParams;
    query: UseQueryResult<TData, unknown>;
    resolveEntity: (data: TData) => ResolvedNotificationEntity | null;
};

export type UnsubscribeResolvedEntityProps = {
    entity: ResolvedNotificationEntity;
    params: ParsedUnsubscribeParams;
};

export type UnsubscribeLookupErrorStateProps = {
    errorMessage: string;
    onRetry: () => Promise<void>;
};

export type UnsubscribeConfirmButtonProps = UnsubscribeResolvedEntityProps & {
    messageApi: MessageInstance;
    onComplete: () => void;
};
