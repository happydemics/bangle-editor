export { MarkdownParser, MarkdownSerializer, MarkdownSerializerState } from 'prosemirror-markdown';

type UnnestObjValue<T> = T extends {
    [k: string]: infer U;
} ? U : never;

export { UnnestObjValue };
