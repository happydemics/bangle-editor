import type { RawPlugins } from '@bangle.dev/core';
import { keymap } from '@bangle.dev/pm';

export const plugins = pluginsFactory;

function pluginsFactory(): RawPlugins {
  return keymap({
    'Ctrl-Shift-5': printDate('medium'),
    'Ctrl-Shift-6': printDate('utc'),
    'Ctrl-Shift-4': printDate('short'),
  });
}

function printDate(type: string) {
  return function (state: any, dispatch: any) {
    let { $from } = state.selection,
      index = $from.index();

    if (!$from.parent.canReplaceWith(index, index, state.schema.nodes.text)) {
      return false;
    }

    if (dispatch) {
      let text;

      if (type === 'medium') {
        const formatter = new Intl.DateTimeFormat('default', {
          dateStyle: 'medium',
          timeStyle: 'medium',
          hour12: false,
        } as any);
        text = '' + formatter.format(new Date().getTime());
      }

      if (type === 'utc') {
        text = '' + new Date().toISOString();
      }

      if (type === 'short') {
        const formatter = new Intl.DateTimeFormat('default', {
          dateStyle: 'medium',
          hour12: false,
        } as any);
        text = '' + formatter.format(new Date().getTime());
      }
      dispatch(state.tr.replaceSelectionWith(state.schema.text(text)));
    }
    return true;
  };
}
