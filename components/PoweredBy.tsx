/** The sign-off at the foot of every screen */
export default function PoweredBy({ className = '' }: { className?: string }) {
  return (
    <footer className={`powered-by ${className}`}>
      <span>Powered by</span>
      <strong>
        <span className="powered-by-mark" aria-hidden="true">
          L
        </span>
        Lasan Labs
      </strong>
    </footer>
  );
}
