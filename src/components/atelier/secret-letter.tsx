import { getSecret } from "@/lib/secrets";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function SecretLetter() {
  const id = useAtelier((s) => s.secretId);
  const setSecretId = useAtelier((s) => s.setSecretId);
  const secret = getSecret(id);
  if (!secret) return null;
  return (
    <div
      data-letter
      className="fixed inset-0 z-overlay flex items-end justify-center bg-void/70 p-5 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="secret-title"
      onClick={() => {
        sound.click();
        setSecretId(null);
      }}
    >
      <article
        className="w-full max-w-lg border border-line bg-fog p-8 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="kicker">{secret.kicker}</p>
        <h2 id="secret-title" className="mt-4 font-display text-4xl sm:text-5xl">
          {secret.title}
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-bone/85">{secret.letter}</p>
        <button
          type="button"
          onClick={() => {
            sound.click();
            setSecretId(null);
          }}
          className="mt-10 min-h-11 text-xs tracking-widest uppercase underline decoration-line underline-offset-8"
        >
          Close
        </button>
      </article>
    </div>
  );
}
