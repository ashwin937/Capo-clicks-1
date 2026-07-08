export default function Footer() {
  const phone1 = process.env.NEXT_PUBLIC_PHONE_1 || "+919786686928";
  const phone2 = process.env.NEXT_PUBLIC_PHONE_2 || "+919345323179";
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/_capo_clicks";

  return (
    <footer id="contact" className="bg-panel border-t border-line pt-14 pb-8 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <h4 className="font-display text-goldLight text-sm tracking-wide mb-4">CAPO CLICKS PHOTOGRAPHY</h4>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Capturing moments, creating memories. Photo studio and custom framing based in Coimbatore.
            </p>
          </div>
          <div>
            <h4 className="font-display text-goldLight text-sm tracking-wide mb-4">Contact</h4>
            <a href={`tel:${phone1}`} className="block text-sm text-muted hover:text-goldLight leading-8">{phone1}</a>
            <a href={`tel:${phone2}`} className="block text-sm text-muted hover:text-goldLight leading-8">{phone2}</a>
            <p className="text-sm text-muted leading-8">Coimbatore, Tamil Nadu</p>
          </div>
          <div>
            <h4 className="font-display text-goldLight text-sm tracking-wide mb-4">Follow</h4>
            <a href={instagram} target="_blank" rel="noreferrer" className="block text-sm text-muted hover:text-goldLight leading-8">
              Instagram — @_capo_clicks
            </a>
          </div>
        </div>
        <div className="rule" />
        <p className="text-center text-xs text-muted font-mono tracking-wide pt-6">
          &copy; {new Date().getFullYear()} CAPO CLICKS PHOTOGRAPHY — EVERY PICTURE TELLS A STORY
        </p>
      </div>
    </footer>
  );
}
