import { useEffect } from 'react';

export default function Presentation() {
  useEffect(() => {
    window.location.replace('/presentation.html');
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-teal-400 font-bold space-y-4">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-base text-slate-200">جارٍ فتح العرض التقديمي لمنصة YoPharma...</p>
    </div>
  );
}
