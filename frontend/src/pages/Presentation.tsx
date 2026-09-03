import { useEffect } from 'react';

export default function Presentation() {
  useEffect(() => {
    document.title = 'YoPharma Drug Check | Presentation Deck';
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#060D17] z-[999999] overflow-hidden select-none">
      <iframe
        src="/presentation.html"
        title="YoPharma Drug Check Presentation"
        className="w-full h-full border-none block"
      />
    </div>
  );
}
