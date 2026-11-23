import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { javascript } from '@codemirror/lang-javascript';
import { rust } from '@codemirror/lang-rust';
import { EditorView } from '@codemirror/view';
import { githubLight } from '@uiw/codemirror-theme-github';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeContext';
import type { SolutionLanguage } from '../types';

interface CodeEditorProps {
  language: SolutionLanguage;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
}

function languageExtension(language: SolutionLanguage) {
  switch (language) {
    case 'TypeScript':
      return javascript({ typescript: true, jsx: false });
    case 'Go':
      return go();
    case 'Rust':
      return rust();
    case 'C++':
      return cpp();
    default:
      return javascript({ typescript: true });
  }
}

export function CodeEditor({
  language,
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: CodeEditorProps) {
  const { theme } = useTheme();

  const extensions = useMemo(
    () => [
      languageExtension(language),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '0.86rem',
        },
        '.cm-scroller': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          lineHeight: '1.55',
        },
        '.cm-content': {
          padding: '0.85rem 0',
        },
        '.cm-gutters': {
          border: 'none',
        },
        '&.cm-focused': {
          outline: 'none',
        },
      }),
    ],
    [language]
  );

  return (
    <div className="code-editor-shell" aria-label={ariaLabel}>
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === 'dark' ? vscodeDark : githubLight}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: false,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          indentOnInput: true,
        }}
        onChange={onChange}
      />
    </div>
  );
}
