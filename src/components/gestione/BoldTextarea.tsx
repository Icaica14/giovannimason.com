import { useRef } from 'preact/hooks';

interface Props {
  value: string;
  onValue: (v: string) => void;
  rows?: number;
  placeholder?: string;
  class?: string;
}

/**
 * Textarea con una piccola barra "Grassetto". Il pulsante avvolge il testo
 * selezionato in `**...**` (sul sito viene reso in grassetto). Niente editor
 * pesante: il contenuto resta testo semplice, portabile e senza rischi.
 */
export default function BoldTextarea({ value, onValue, rows, placeholder, class: cls }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrapBold = () => {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart ?? value.length;
    const e = ta.selectionEnd ?? value.length;
    const sel = value.slice(s, e) || 'testo';
    onValue(value.slice(0, s) + '**' + sel + '**' + value.slice(e));
    // Riposiziona la selezione sul testo appena messo in grassetto.
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + 2, s + 2 + sel.length);
    });
  };

  return (
    <div class="g-richfield">
      <div class="g-richbar">
        <button type="button" class="g-richbtn" onClick={wrapBold} title="Grassetto: avvolge il testo selezionato in **…**">
          <b>B</b> Grassetto
        </button>
        <span class="g-richhint">
          oppure scrivi <code>**testo**</code>
        </span>
      </div>
      <textarea
        ref={ref}
        class={cls}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onInput={(e) => onValue((e.target as HTMLTextAreaElement).value)}
      />
    </div>
  );
}
